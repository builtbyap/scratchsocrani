import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Get credentials from environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jlkebdnvjjdwedmbfqou.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsa2ViZG52ampkd2VkbWJmcW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzU5NjQsImV4cCI6MjA1NzA1MTk2NH0.0dyDFawIks508PffUcovXN-M8kaAOgomOhe5OiEal3o'

// Strict validation function
function validateSupabaseCredentials(): { isValid: boolean; error?: string } {
  if (!supabaseUrl) {
    return { isValid: false, error: 'Missing Supabase URL' }
  }
  
  if (!supabaseAnonKey) {
    return { isValid: false, error: 'Missing Supabase anon key' }
  }
  
  if (!supabaseAnonKey.startsWith('eyJ')) {
    return { isValid: false, error: 'Invalid Supabase anon key format' }
  }
  
  if (supabaseAnonKey.length < 100) {
    return { isValid: false, error: 'Supabase anon key too short' }
  }
  
  return { isValid: true }
}

// Singleton pattern to ensure only one Supabase client is created
let supabaseInstance: SupabaseClient | null = null

function createSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    try {
      console.log('🔧 Creating new Supabase client instance...')
      
      // Validate credentials before creating client
      const validation = validateSupabaseCredentials()
      if (!validation.isValid) {
        throw new Error(`Credential validation failed: ${validation.error}`)
      }
      
      // Additional check for browser environment
      if (typeof window !== 'undefined') {
        console.log('🌐 Creating Supabase client in browser environment')
      } else {
        console.log('🖥️ Creating Supabase client in server environment')
      }
      
      // Create client with validated credentials
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

// Create the client with error handling
let supabase: SupabaseClient

try {
  // Validate credentials immediately
  const validation = validateSupabaseCredentials()
  if (!validation.isValid) {
    const error = new Error(`Supabase Configuration Error: ${validation.error}`)
    console.error('❌ Supabase Configuration Error:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      url: supabaseUrl,
      keyPrefix: supabaseAnonKey?.substring(0, 20) + '...',
      keyLength: supabaseAnonKey?.length,
      error: validation.error
    })
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

  supabase = createSupabaseClient()
} catch (error) {
  console.error('❌ Critical error creating Supabase client:', error)
  
  // Create a minimal fallback client
  supabase = createClient(
    'https://jlkebdnvjjdwedmbfqou.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsa2ViZG52ampkd2VkbWJmcW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzU5NjQsImV4cCI6MjA1NzA1MTk2NH0.0dyDFawIks508PffUcovXN-M8kaAOgomOhe5OiEal3o',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error: error as any }
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error: error as any }
    }
  },

  signInWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      return { data, error }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { data: null, error: error as any }
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: error as any }
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    } catch (error) {
      console.error('Get current user error:', error)
      return { user: null, error: error as any }
    }
  },

  getCurrentSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      return { session, error }
    } catch (error) {
      console.error('Get current session error:', error)
      return { session: null, error: error as any }
    }
  },

  getUserProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      return { data, error }
    } catch (error) {
      console.error('Get user profile error:', error)
      return { data: null, error: error as any }
    }
  },

  ensureUserProfile: async (user: any) => {
    try {
      if (!user) {
        return { error: 'No user provided' }
      }

      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        return { error: fetchError }
      }

      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              avatar_url: user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              subscription_status: 'inactive',
              subscription_tier: 'free',
              subscription_end_date: null,
              stripe_customer_id: null,
              stripe_subscription_id: null
            }
          ])
        
        if (insertError) {
          console.error('Error creating user profile:', insertError)
          return { error: insertError }
        }
      }

      return { error: null }
    } catch (error) {
      console.error('Ensure user profile error:', error)
      return { error: error as any }
    }
  },

  checkAndCreateUserProfile: async (user: any) => {
    try {
      if (!user) {
        return { error: 'No user provided' }
      }

      // Check if user profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', fetchError)
        return { error: fetchError }
      }

      if (!existingProfile) {
        console.log('Creating new user profile for:', user.email)
        
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              avatar_url: user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              subscription_status: 'inactive',
              subscription_tier: 'free',
              subscription_end_date: null,
              stripe_customer_id: null,
              stripe_subscription_id: null
            }
          ])
        
        if (insertError) {
          console.error('Error creating user profile:', insertError)
          return { error: insertError }
        }
        
        console.log('User profile created successfully')
      } else {
        console.log('User profile already exists')
      }

      return { error: null }
    } catch (error) {
      console.error('Check and create user profile error:', error)
      return { error: error as any }
    }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  testCreateUserProfile: async (user: any) => {
    try {
      if (!user) {
        return { error: 'No user provided' }
      }

      console.log('Testing user profile creation for:', user.email)

      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            subscription_status: 'inactive',
            subscription_tier: 'free',
            subscription_end_date: null,
            stripe_customer_id: null,
            stripe_subscription_id: null
          }
        ])
      
      if (insertError) {
        console.error('Test user profile creation error:', insertError)
        return { error: insertError }
      }
      
      console.log('Test user profile created successfully')
      return { error: null }
    } catch (error) {
      console.error('Test create user profile error:', error)
      return { error: error as any }
    }
  }
}

// Export the client
export { supabase } 