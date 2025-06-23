import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Get credentials from environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jlkebdnvjjdwedmbfqou.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsa2ViZG52ampkd2VkbWJmcW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzU5NjQsImV4cCI6MjA1NzA1MTk2NH0.0dyDFawIks508PffUcovXN-M8kaAOgomOhe5OiEal3o'

// Validate credentials before creating client
if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error('Missing Supabase credentials. Please check your environment variables.')
  console.error('❌ Supabase Configuration Error:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl,
    keyPrefix: supabaseAnonKey?.substring(0, 20) + '...'
  })
  throw error
}

// Additional validation for key format
if (!supabaseAnonKey.startsWith('eyJ')) {
  const error = new Error('Invalid Supabase anon key format')
  console.error('❌ Invalid Supabase key format:', supabaseAnonKey?.substring(0, 20) + '...')
  throw error
}

// Debug logging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Supabase Configuration Debug:')
  console.log('URL:', supabaseUrl)
  console.log('Key exists:', !!supabaseAnonKey)
  console.log('Key starts with:', supabaseAnonKey?.substring(0, 20) + '...')
  console.log('Full key length:', supabaseAnonKey?.length)
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })
}

// Singleton pattern to ensure only one Supabase client is created
let supabaseInstance: SupabaseClient | null = null

function createSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    try {
      console.log('🔧 Creating new Supabase client instance...')
      
      // Double-check credentials before creating client
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase credentials are missing')
      }
      
      // Additional check for browser environment
      if (typeof window !== 'undefined') {
        console.log('🌐 Creating Supabase client in browser environment')
      } else {
        console.log('🖥️ Creating Supabase client in server environment')
      }
      
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      })
      
      console.log('✅ Supabase client created successfully')
    } catch (error) {
      console.error('❌ Error creating Supabase client:', error)
      throw error
    }
  }
  return supabaseInstance
}

// Export the singleton instance with error handling
let supabase: SupabaseClient

// Only create the client if we're in a browser environment or if it's the first time
if (typeof window === 'undefined' || !supabaseInstance) {
  try {
    supabase = createSupabaseClient()
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error)
    // Create a fallback client with minimal configuration
    supabase = createClient(
      'https://jlkebdnvjjdwedmbfqou.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsa2ViZG52ampkd2VkbWJmcW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzU5NjQsImV4cCI6MjA1NzA1MTk2NH0.0dyDFawIks508PffUcovXN-M8kaAOgomOhe5OiEal3o'
    )
  }
} else {
  supabase = supabaseInstance
}

export { supabase }

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData?: any) => {
    console.log('🔐 Attempting to sign up with email:', email)
    console.log('📝 User data provided:', userData)
    
    // First, create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    if (error) {
      console.error('❌ Sign up error:', error)
      // Provide more helpful error messages
      if (error.message.includes('User already registered')) {
        return { data, error: { message: 'An account with this email already exists. Please sign in instead.' } }
      } else if (error.message.includes('Password should be at least')) {
        return { data, error: { message: 'Password must be at least 6 characters long.' } }
      } else if (error.message.includes('Invalid email')) {
        return { data, error: { message: 'Please enter a valid email address.' } }
      } else if (error.message.includes('email_address_invalid')) {
        return { data, error: { message: 'Please enter a valid email address (e.g., user@gmail.com).' } }
      } else if (error.message.includes('Database error saving new user')) {
        return { 
          data, 
          error: { 
            message: 'Database configuration issue. Please check your Supabase project setup or try again later.' 
          } 
        }
      }
      return { data, error }
    }
    
    // If signup successful, create user profile in users table
    if (data.user && !error) {
      try {
        console.log('✅ Auth signup successful, creating user profile...')
        
        // Prepare user profile data
        const profileData = {
          id: data.user.id,
          email: data.user.email,
          first_name: userData?.first_name || data.user.user_metadata?.first_name || '',
          last_name: userData?.last_name || data.user.user_metadata?.last_name || '',
          subscription_status: 'inactive',
          subscription_type: null,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          subscription_start_date: null,
          subscription_end_date: null,
          subscription_trial_end: null,
          company_name: userData?.company_name || '',
          phone: userData?.phone || '',
          website: userData?.website || '',
          bio: userData?.bio || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('📝 Creating user profile with data:', profileData)
        
        // Create user profile in users table
        const { data: profileResult, error: profileError } = await supabase
          .from('users')
          .insert(profileData)
          .select()
        
        if (profileError) {
          console.error('❌ Error creating user profile:', profileError)
          
          // Check if it's a duplicate key error (user already exists)
          if (profileError.code === '23505') {
            console.log('ℹ️ User profile already exists, updating instead...')
            
            // Try to update the existing profile
            const { error: updateError } = await supabase
              .from('users')
              .update({
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                company_name: profileData.company_name,
                phone: profileData.phone,
                website: profileData.website,
                bio: profileData.bio,
                updated_at: new Date().toISOString()
              })
              .eq('id', data.user.id)
            
            if (updateError) {
              console.error('❌ Error updating existing user profile:', updateError)
              return { 
                data, 
                error: { 
                  message: 'Account created but profile update failed. Please contact support.',
                  details: updateError
                } 
              }
            }
            
            console.log('✅ Existing user profile updated successfully')
          } else {
            // Other database error
            return { 
              data, 
              error: { 
                message: 'Account created but profile setup failed. Please contact support.',
                details: profileError
              } 
            }
          }
        } else {
          console.log('✅ User profile created successfully:', profileResult)
        }
        
        // Verify the profile was created/updated
        const { data: verifyProfile, error: verifyError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (verifyError) {
          console.error('❌ Error verifying user profile:', verifyError)
          return { 
            data, 
            error: { 
              message: 'Account created but profile verification failed. Please contact support.',
              details: verifyError
            } 
          }
        }
        
        console.log('✅ User profile verified successfully:', verifyProfile)
        console.log('🎉 Sign up process completed successfully')
        
      } catch (profileErr) {
        console.error('❌ Error in profile creation:', profileErr)
        return { 
          data, 
          error: { 
            message: 'Account created but profile setup failed. Please try again or contact support.',
            details: profileErr
          } 
        }
      }
    }
    
    return { data, error: null }
  },

  // Create or update user profile
  createUserProfile: async (userId: string, userData: any) => {
    try {
      console.log('📝 Creating/updating user profile for ID:', userId)
      console.log('📋 User data:', userData)
      
      // Prepare comprehensive profile data
      const profileData = {
        id: userId,
        email: userData.email,
        first_name: userData.first_name || userData.user_metadata?.first_name || '',
        last_name: userData.last_name || userData.user_metadata?.last_name || '',
        subscription_status: userData.subscription_status || 'inactive',
        subscription_type: userData.subscription_type || null,
        stripe_customer_id: userData.stripe_customer_id || null,
        stripe_subscription_id: userData.stripe_subscription_id || null,
        subscription_start_date: userData.subscription_start_date || null,
        subscription_end_date: userData.subscription_end_date || null,
        subscription_trial_end: userData.subscription_trial_end || null,
        company_name: userData.company_name || '',
        phone: userData.phone || '',
        website: userData.website || '',
        bio: userData.bio || '',
        created_at: userData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('📝 Profile data to insert/update:', profileData)
      
      const { data, error } = await supabase
        .from('users')
        .upsert(profileData, {
          onConflict: 'id'
        })
        .select()
      
      if (error) {
        console.error('❌ Error creating/updating user profile:', error)
        return { error }
      }
      
      console.log('✅ User profile created/updated successfully:', data)
      return { success: true, data }
    } catch (err) {
      console.error('❌ Error in createUserProfile:', err)
      return { error: err }
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    console.log('🔐 Attempting to sign in with email:', email)
    
    // First, authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('❌ Sign in error:', error)
      // Provide more helpful error messages
      if (error.message.includes('Invalid login credentials')) {
        return { data, error: { message: 'Invalid email or password. Please check your credentials and try again.' } }
      } else if (error.message.includes('Email not confirmed')) {
        return { data, error: { message: 'Please check your email and click the confirmation link before signing in.' } }
      } else if (error.message.includes('Too many requests')) {
        return { data, error: { message: 'Too many sign-in attempts. Please wait a moment and try again.' } }
      }
      return { data, error }
    }
    
    // If authentication successful, validate user profile in users table
    if (data.user) {
      try {
        console.log('✅ Authentication successful, validating user profile...')
        
        // Check if user exists in users table
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          console.error('❌ Error fetching user profile:', profileError)
          
          if (profileError.code === 'PGRST116') {
            // User profile doesn't exist, create it
            console.log('📝 Creating user profile for:', data.user.email)
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email,
                first_name: data.user.user_metadata?.first_name || '',
                last_name: data.user.user_metadata?.last_name || '',
                subscription_status: 'inactive',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
            
            if (createError) {
              console.error('❌ Error creating user profile:', createError)
              return { 
                data, 
                error: { 
                  message: 'Account created but profile setup failed. Please contact support.',
                  details: createError
                } 
              }
            }
            
            console.log('✅ User profile created successfully')
          } else {
            // Other database error
            return { 
              data, 
              error: { 
                message: 'Database error. Please try again or contact support.',
                details: profileError
              } 
            }
          }
        } else {
          console.log('✅ User profile validated:', userProfile)
          
          // Check if user is active (not banned/suspended)
          if (userProfile.subscription_status === 'suspended' || userProfile.subscription_status === 'banned') {
            console.error('❌ User account is suspended/banned')
            return { 
              data: null, 
              error: { 
                message: 'Your account has been suspended. Please contact support for assistance.' 
              } 
            }
          }
        }
        
        console.log('✅ Sign in process completed successfully')
        return { data, error: null }
        
      } catch (err) {
        console.error('❌ Error in sign-in validation:', err)
        return { 
          data, 
          error: { 
            message: 'Sign in successful but profile validation failed. Please try again.',
            details: err
          } 
        }
      }
    }
    
    return { data, error }
  },

  // Sign in with Google OAuth
  signInWithGoogle: async () => {
    console.log('🔐 Initiating Google OAuth sign in...')
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://socrani.com'
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    
    if (error) {
      console.error('❌ Google OAuth error:', error)
    } else {
      console.log('✅ Google OAuth initiated successfully')
    }
    
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await supabase.auth.getUser()
    return { user: response.data?.user || null, error: response.error }
  },

  // Get current session
  getCurrentSession: async () => {
    const response = await supabase.auth.getSession()
    return { session: response.data?.session || null, error: response.error }
  },

  // Get user profile
  getUserProfile: async (userId: string) => {
    try {
      console.log('🔍 Fetching user profile for ID:', userId)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('❌ Error fetching user profile:', error)
        
        // Provide specific error messages for common issues
        if (error.code === '42703') {
          console.error('❌ Database schema issue: Column "id" does not exist in users table')
          console.error('💡 Solution: Run the database schema setup in Supabase SQL Editor')
          return { 
            data: null, 
            error: { 
              message: 'Database schema not set up. Please contact support.',
              code: error.code,
              details: error
            } 
          }
        }
        
        if (error.code === 'PGRST116') {
          console.log('ℹ️ User profile not found (this is normal for new users)')
          return { data: null, error: { code: 'PGRST116', message: 'Profile not found' } }
        }
        
        return { data: null, error }
      }
      
      console.log('✅ User profile fetched successfully')
      return { data, error: null }
    } catch (err) {
      console.error('❌ Error in getUserProfile:', err)
      return { data: null, error: err }
    }
  },

  // Ensure user profile exists (create if it doesn't)
  ensureUserProfile: async (user: any) => {
    if (!user) return { error: 'No user provided' }
    
    try {
      console.log('Ensuring user profile exists for:', user.email)
      console.log('User metadata:', user.user_metadata)
      
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await auth.getUserProfile(user.id)
      
      if (fetchError && (fetchError as any).code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('User profile not found, creating...')
        
        // Extract name from Google metadata
        let firstName = ''
        let lastName = ''
        
        if (user.user_metadata?.full_name) {
          const nameParts = user.user_metadata.full_name.split(' ')
          firstName = nameParts[0] || ''
          lastName = nameParts.slice(1).join(' ') || ''
        } else if (user.user_metadata?.name) {
          const nameParts = user.user_metadata.name.split(' ')
          firstName = nameParts[0] || ''
          lastName = nameParts.slice(1).join(' ') || ''
        } else {
          firstName = user.user_metadata?.first_name || ''
          lastName = user.user_metadata?.last_name || ''
        }
        
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName,
            subscription_status: 'inactive',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (createError) {
          console.error('Error creating user profile:', createError)
          return { error: createError }
        }
        
        console.log('User profile created successfully for Google user:', user.email)
        return { success: true }
      } else if (fetchError) {
        console.error('Error checking user profile:', fetchError)
        return { error: fetchError }
      }
      
      // Profile exists
      console.log('User profile already exists for:', user.email)
      return { success: true, data: existingProfile }
    } catch (err) {
      console.error('Error in ensureUserProfile:', err)
      return { error: err }
    }
  },

  // Manual function to check and create user profile (for debugging)
  checkAndCreateUserProfile: async () => {
    try {
      const { user } = await auth.getCurrentUser()
      if (!user) {
        console.log('No user found, cannot create profile')
        return { error: 'No user found' }
      }
      
      console.log('Checking profile for user:', user.email)
      const result = await auth.ensureUserProfile(user)
      return result
    } catch (err) {
      console.error('Error in checkAndCreateUserProfile:', err)
      return { error: err }
    }
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Manual test function to create a user profile (for debugging)
  testCreateUserProfile: async () => {
    try {
      const { user } = await auth.getCurrentUser()
      if (!user) {
        console.log('No user found, cannot create test profile')
        return { error: 'No user found' }
      }
      
      console.log('Testing user profile creation for:', user.email)
      
      // Try to create a test profile
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          first_name: 'Test',
          last_name: 'User',
          subscription_status: 'inactive',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
      
      if (createError) {
        console.error('Error creating test profile:', createError)
        return { error: createError }
      }
      
      console.log('Test profile created successfully')
      return { success: true }
    } catch (err) {
      console.error('Error in testCreateUserProfile:', err)
      return { error: err }
    }
  }
}

// Diagnostic function to check Supabase project status
export const checkSupabaseStatus = async () => {
  try {
    console.log('🔍 Checking Supabase project status...')
    console.log('Project URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Has valid credentials:', !!supabaseAnonKey)
    
    if (!supabaseAnonKey) {
      console.warn('❌ Invalid or missing Supabase credentials')
      return { status: 'error', message: 'Invalid credentials' }
    }
    
    // Try to get the current session to test the connection
    const { session, error } = await auth.getCurrentSession()
    
    if (error) {
      console.error('❌ Supabase connection error:', error)
      return { status: 'error', message: error.message }
    }
    
    console.log('✅ Supabase connection successful')
    return { status: 'success', message: 'Connection working' }
  } catch (err) {
    console.error('❌ Supabase status check failed:', err)
    return { status: 'error', message: 'Connection failed' }
  }
}

// Quick connection test
export const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...')
    console.log('Project URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Has valid credentials:', !!supabaseAnonKey)
    
    if (!supabaseAnonKey) {
      console.warn('❌ Invalid credentials detected')
      return false
    }
    
    // Test the connection by trying to get the current session
    const { session, error } = await auth.getCurrentSession()
    
    if (error) {
      console.error('❌ Connection test failed:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    return true
  } catch (err) {
    console.error('❌ Connection test error:', err)
    return false
  }
} 