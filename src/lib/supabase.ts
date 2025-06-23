import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Default credentials (fallback)
const DEFAULT_SUPABASE_URL = 'https://jlkebdnvjjdwedmbfqou.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsa2ViZG52ampkd2VkbWJmcW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzU5NjQsImV4cCI6MjA1NzA1MTk2NH0.0dyDFawIks508PffUcovXN-M8kaAOgomOhe5OiEal3o'

// Get credentials from environment variables with fallbacks
function getSupabaseCredentials() {
  // In browser environment, use window.__NEXT_DATA__ or process.env
  let supabaseUrl = DEFAULT_SUPABASE_URL
  let supabaseAnonKey = DEFAULT_SUPABASE_ANON_KEY

  // Try to get from environment variables
  if (typeof process !== 'undefined' && process.env) {
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl
    supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseAnonKey
  }

  // Try to get from window object (for client-side)
  if (typeof window !== 'undefined' && window.__NEXT_DATA__) {
    const nextData = window.__NEXT_DATA__
    if (nextData.props && nextData.props.env) {
      supabaseUrl = nextData.props.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl
      supabaseAnonKey = nextData.props.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseAnonKey
    }
  }

  return { supabaseUrl, supabaseAnonKey }
}

// Validation function
function validateCredentials(url: string, key: string): { isValid: boolean; error?: string } {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'Missing Supabase URL' }
  }
  
  if (!key || key.trim() === '') {
    return { isValid: false, error: 'Missing Supabase anon key' }
  }
  
  if (!key.startsWith('eyJ')) {
    return { isValid: false, error: 'Invalid Supabase anon key format' }
  }
  
  if (key.length < 100) {
    return { isValid: false, error: 'Supabase anon key too short' }
  }
  
  return { isValid: true }
}

// Singleton instance
let supabaseInstance: SupabaseClient | null = null

// Factory function to create Supabase client
function createSupabaseClient(): SupabaseClient {
  try {
    console.log('🔧 Creating Supabase client...')
    
    const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials()
    
    // Validate credentials
    const validation = validateCredentials(supabaseUrl, supabaseAnonKey)
    if (!validation.isValid) {
      console.error('❌ Credential validation failed:', validation.error)
      throw new Error(`Credential validation failed: ${validation.error}`)
    }
    
    // Log environment info (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Supabase Configuration:')
      console.log('URL:', supabaseUrl)
      console.log('Key exists:', !!supabaseAnonKey)
      console.log('Key prefix:', supabaseAnonKey.substring(0, 20) + '...')
      console.log('Environment:', {
        NODE_ENV: process.env.NODE_ENV,
        hasEnvUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasEnvKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        isBrowser: typeof window !== 'undefined'
      })
    }
    
    // Create the client
    const client = createClient(supabaseUrl, supabaseAnonKey, {
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
    return client
    
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error)
    
    // Create fallback client with hardcoded credentials
    console.log('🔄 Creating fallback Supabase client...')
    const fallbackClient = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
    
    console.log('✅ Fallback Supabase client created')
    return fallbackClient
  }
}

// Get or create Supabase client instance
function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient()
  }
  return supabaseInstance
}

// Export the client
export const supabase = getSupabaseClient()

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