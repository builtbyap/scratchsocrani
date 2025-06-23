import { useState, useEffect } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { waitForEnvironmentVariables } from './env-loader'

// Default credentials (fallback)
const DEFAULT_SUPABASE_URL = 'https://jlkebdnvjjdwedmbfqou.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsa2ViZG52ampkd2VkbWJmcW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzU5NjQsImV4cCI6MjA1NzA1MTk2NH0.0dyDFawIks508PffUcovXN-M8kaAOgomOhe5OiEal3o'

// Get credentials with multiple fallback strategies
function getSupabaseCredentials() {
  let supabaseUrl = DEFAULT_SUPABASE_URL
  let supabaseAnonKey = DEFAULT_SUPABASE_ANON_KEY

  // Strategy 1: Try process.env (works in Next.js)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    }
    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  }

  // Strategy 2: Try window.__NEXT_DATA__ (client-side fallback)
  if (typeof window !== 'undefined' && window.__NEXT_DATA__) {
    const nextData = window.__NEXT_DATA__
    if (nextData.props && nextData.props.env) {
      if (nextData.props.env.NEXT_PUBLIC_SUPABASE_URL) {
        supabaseUrl = nextData.props.env.NEXT_PUBLIC_SUPABASE_URL
      }
      if (nextData.props.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        supabaseAnonKey = nextData.props.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    }
  }

  // Strategy 3: Try window.__ENV__ (custom global)
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    const env = (window as any).__ENV__
    if (env.NEXT_PUBLIC_SUPABASE_URL) {
      supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    }
    if (env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  }

  return { supabaseUrl, supabaseAnonKey }
}

export function useSupabase() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const initializeSupabase = async () => {
      try {
        console.log('🔧 Initializing Supabase client in React hook...')
        
        // Wait for environment variables to be available
        const env = await waitForEnvironmentVariables()
        
        console.log('🔍 React hook credentials:')
        console.log('URL:', env.NEXT_PUBLIC_SUPABASE_URL)
        console.log('Key exists:', !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        console.log('Key prefix:', env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...')
        
        // Validate credentials before creating client
        if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error('Missing Supabase credentials')
        }
        
        if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith('eyJ')) {
          throw new Error('Invalid Supabase anon key format')
        }
        
        // Create the client
        const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
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
          
          // Create fallback client with hardcoded credentials
          console.log('🔄 Creating fallback Supabase client in React hook...')
          try {
            const fallbackClient = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY, {
              auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
              }
            })
            
            setSupabase(fallbackClient)
            console.log('✅ Fallback Supabase client created successfully')
          } catch (fallbackErr) {
            console.error('❌ Error creating fallback client:', fallbackErr)
            setError('Failed to create Supabase client')
          }
          
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