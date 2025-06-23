import { useState, useEffect } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Default credentials (fallback)
const DEFAULT_SUPABASE_URL = 'https://jlkebdnvjjdwedmbfqou.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsa2ViZG52ampkd2VkbWJmcW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzU5NjQsImV4cCI6MjA1NzA1MTk2NH0.0dyDFawIks508PffUcovXN-M8kaAOgomOhe5OiEal3o'

// Get environment variables with multiple strategies
function getEnvironmentVariables() {
  // Strategy 1: Direct process.env access
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Strategy 2: Check window.__NEXT_DATA__ for client-side
  if (typeof window !== 'undefined' && window.__NEXT_DATA__) {
    const nextData = window.__NEXT_DATA__
    if (nextData.props && nextData.props.env) {
      supabaseUrl = supabaseUrl || nextData.props.env.NEXT_PUBLIC_SUPABASE_URL
      supabaseAnonKey = supabaseAnonKey || nextData.props.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  }

  // Strategy 3: Check global window.__ENV__
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    const env = (window as any).__ENV__
    supabaseUrl = supabaseUrl || env.NEXT_PUBLIC_SUPABASE_URL
    supabaseAnonKey = supabaseAnonKey || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }

  return {
    supabaseUrl: supabaseUrl || DEFAULT_SUPABASE_URL,
    supabaseAnonKey: supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY
  }
}

// Wait for environment variables to be available
function waitForEnvironmentVariables(): Promise<{ supabaseUrl: string; supabaseAnonKey: string }> {
  return new Promise((resolve) => {
    const checkEnv = () => {
      const env = getEnvironmentVariables()
      
      // If we have valid credentials, resolve immediately
      if (env.supabaseUrl && env.supabaseAnonKey && env.supabaseAnonKey.startsWith('eyJ')) {
        resolve(env)
        return
      }
      
      // If we're in the browser and don't have credentials yet, wait a bit
      if (typeof window !== 'undefined') {
        setTimeout(checkEnv, 100)
      } else {
        // Server-side, use defaults
        resolve(env)
      }
    }
    
    checkEnv()
  })
}

export function useSupabase() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const initializeSupabase = async () => {
      try {
        console.log('🔧 Initializing Supabase client...')
        
        // Wait for environment variables
        const env = await waitForEnvironmentVariables()
        
        console.log('🔍 Environment variables loaded:')
        console.log('URL:', env.supabaseUrl)
        console.log('Key exists:', !!env.supabaseAnonKey)
        console.log('Key prefix:', env.supabaseAnonKey.substring(0, 20) + '...')
        
        // Validate credentials
        if (!env.supabaseUrl || !env.supabaseAnonKey) {
          throw new Error('Missing Supabase credentials')
        }
        
        if (!env.supabaseAnonKey.startsWith('eyJ')) {
          throw new Error('Invalid Supabase anon key format')
        }
        
        // Create the client
        const client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
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
          console.log('✅ Supabase client initialized successfully')
          setSupabase(client)
          setLoading(false)
        }
        
      } catch (err) {
        console.error('❌ Error initializing Supabase client:', err)
        
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
          
          // Create fallback client
          console.log('🔄 Creating fallback Supabase client...')
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

    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      initializeSupabase()
    }, 50)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  return { supabase, loading, error }
} 