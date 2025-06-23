import { useState, useEffect } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Default credentials (fallback)
const DEFAULT_SUPABASE_URL = 'https://jlkebdnvjjdwedmbfqou.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsa2ViZG52ampkd2VkbWJmcW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzU5NjQsImV4cCI6MjA1NzA1MTk2NH0.0dyDFawIks508PffUcovXN-M8kaAOgomOhe5OiEal3o'

export function useSupabase() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const initializeSupabase = async () => {
      try {
        console.log('🔧 Initializing Supabase client in React hook...')
        
        // Get credentials from environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY
        
        console.log('🔍 React hook credentials:')
        console.log('URL:', supabaseUrl)
        console.log('Key exists:', !!supabaseAnonKey)
        console.log('Key prefix:', supabaseAnonKey.substring(0, 20) + '...')
        
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
        
        if (mounted) {
          console.log('✅ Supabase client initialized successfully in React hook')
          setSupabase(client)
          setLoading(false)
        }
        
      } catch (err) {
        console.error('❌ Error initializing Supabase client in React hook:', err)
        
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
          setLoading(false)
          
          // Create fallback client
          console.log('🔄 Creating fallback Supabase client in React hook...')
          const fallbackClient = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY, {
            auth: {
              autoRefreshToken: true,
              persistSession: true,
              detectSessionInUrl: true
            }
          })
          
          setSupabase(fallbackClient)
          setLoading(false)
        }
      }
    }

    initializeSupabase()

    return () => {
      mounted = false
    }
  }, [])

  return { supabase, loading, error }
} 