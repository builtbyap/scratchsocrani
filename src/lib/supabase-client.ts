import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Hardcoded credentials to avoid environment variable loading issues
const SUPABASE_URL = 'https://jlkebdnvjjdwedmbfqou.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsa2ViZG52ampkd2VkbWJmcW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzU5NjQsImV4cCI6MjA1NzA1MTk2NH0.0dyDFawIks508PffUcovXN-M8kaAOgomOhe5OiEal3o'

// Singleton pattern to ensure only one client is created
let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    console.log('🔧 Creating Supabase client with hardcoded credentials...')
    
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
  
  return supabaseClient
}

// Export the client directly
export const supabase = getSupabaseClient() 