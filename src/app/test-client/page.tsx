'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

export default function TestClient() {
  const [status, setStatus] = useState<string>('Loading...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testSupabase() {
      try {
        setStatus('Testing Supabase connection...')
        
        // Test environment variables
        console.log('🔍 Client-side environment check:')
        console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        
        // Test Supabase client
        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1)
        
        if (error) {
          console.error('❌ Supabase error:', error)
          setError(error.message)
          setStatus('Failed')
        } else {
          console.log('✅ Supabase connection successful')
          setStatus('Success')
        }
      } catch (err) {
        console.error('❌ Test error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('Failed')
      }
    }

    testSupabase()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
      <div className="glass-effect rounded-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Supabase Client Test</h1>
        
        <div className="mb-4">
          <p className="text-gray-300">Status: <span className={status === 'Success' ? 'text-green-400' : status === 'Failed' ? 'text-red-400' : 'text-yellow-400'}>{status}</span></p>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <div className="text-left text-sm text-gray-400">
          <p>Environment Variables:</p>
          <p>• URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
          <p>• Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
        </div>
      </div>
    </div>
  )
} 