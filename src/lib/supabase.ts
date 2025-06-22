import { createClient } from '@supabase/supabase-js'

// Ensure we always have valid credentials
const supabaseUrl = 'https://jlkebdnvjjdwedmbfqou.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsa2ViZG52ampkd2VkbWJmcW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzU5NjQsImV4cCI6MjA1NzA1MTk2NH0.0dyDFawIks508PffUcovXN-M8kaAOgomOhe5OiEal3o'

// Debug logging
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

// Create Supabase client with guaranteed valid credentials
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData?: any) => {
    console.log('Attempting to sign up with email:', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    if (error) {
      console.error('Sign up error:', error)
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
    }
    
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    console.log('Attempting to sign in with email:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('Sign in error:', error)
      // Provide more helpful error messages
      if (error.message.includes('Invalid login credentials')) {
        return { data, error: { message: 'Invalid email or password. Please check your credentials and try again.' } }
      } else if (error.message.includes('Email not confirmed')) {
        return { data, error: { message: 'Please check your email and click the confirmation link before signing in.' } }
      } else if (error.message.includes('Too many requests')) {
        return { data, error: { message: 'Too many sign-in attempts. Please wait a moment and try again.' } }
      }
    }
    
    return { data, error }
  },

  // Sign in with Google OAuth
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
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

  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
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