// Client-side environment variable loader
export function loadEnvironmentVariables() {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    }
  }

  // Try multiple strategies to get environment variables
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  // Strategy 1: Check if Next.js has injected them into the page
  if (window.__NEXT_DATA__ && window.__NEXT_DATA__.props && window.__NEXT_DATA__.props.env) {
    const env = window.__NEXT_DATA__.props.env
    supabaseUrl = supabaseUrl || env.NEXT_PUBLIC_SUPABASE_URL
    supabaseAnonKey = supabaseAnonKey || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    baseUrl = baseUrl || env.NEXT_PUBLIC_BASE_URL
  }

  // Strategy 2: Check if they're in the global scope
  if ((window as any).__ENV__) {
    const env = (window as any).__ENV__
    supabaseUrl = supabaseUrl || env.NEXT_PUBLIC_SUPABASE_URL
    supabaseAnonKey = supabaseAnonKey || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    baseUrl = baseUrl || env.NEXT_PUBLIC_BASE_URL
  }

  // Strategy 3: Check if they're in a script tag
  const envScript = document.querySelector('script[data-env]')
  if (envScript) {
    try {
      const envData = JSON.parse(envScript.getAttribute('data-env') || '{}')
      supabaseUrl = supabaseUrl || envData.NEXT_PUBLIC_SUPABASE_URL
      supabaseAnonKey = supabaseAnonKey || envData.NEXT_PUBLIC_SUPABASE_ANON_KEY
      baseUrl = baseUrl || envData.NEXT_PUBLIC_BASE_URL
    } catch (e) {
      console.warn('Failed to parse environment data from script tag:', e)
    }
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    NEXT_PUBLIC_BASE_URL: baseUrl,
  }
}

// Wait for environment variables to be available
export function waitForEnvironmentVariables(): Promise<{
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  NEXT_PUBLIC_BASE_URL: string
}> {
  return new Promise((resolve) => {
    const checkEnv = () => {
      const env = loadEnvironmentVariables()
      
      if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        resolve({
          NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          NEXT_PUBLIC_BASE_URL: env.NEXT_PUBLIC_BASE_URL || '',
        })
      } else {
        // Wait a bit and try again
        setTimeout(checkEnv, 50)
      }
    }
    
    checkEnv()
  })
} 