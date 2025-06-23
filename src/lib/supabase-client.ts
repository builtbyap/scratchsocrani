import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Hardcoded credentials to avoid environment variable loading issues
const SUPABASE_URL = 'https://jlkebdnvjjdwedmbfqou.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsa2ViZG52ampkd2VkbWJmcW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzU5NjQsImV4cCI6MjA1NzA1MTk2NH0.0dyDFawIks508PffUcovXN-M8kaAOgomOhe5OiEal3o'

// Singleton instance
let supabaseClient: SupabaseClient | null = null

// Factory function to create Supabase client
function createSupabaseClient(): SupabaseClient {
  try {
    console.log('🔧 Creating Supabase client with hardcoded credentials...')
    
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
    throw error
  }
}

// Get or create Supabase client instance
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient()
  }
  return supabaseClient
}

// Export a lazy-loaded client for client-side use
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null

// Export a function to get the client safely
export function getClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // Server-side: always create a new client
    return createSupabaseClient()
  } else {
    // Client-side: use singleton
    return getSupabaseClient()
  }
} 