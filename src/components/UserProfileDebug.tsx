'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@/contexts/AuthContext'

export default function UserProfileDebug() {
  const [status, setStatus] = useState('')
  const [userProfile, setUserProfile] = useState<any>(null)
  const { user } = useAuth()

  const checkUserProfile = async () => {
    if (!user) {
      setStatus('No user logged in')
      return
    }

    setStatus('Checking user profile...')
    
    try {
      // Check if user profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError && fetchError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        setStatus('Creating user profile...')
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'User',
            last_name: user.user_metadata?.last_name || '',
            subscription_status: 'inactive',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          setStatus(`Error creating profile: ${insertError.message}`)
        } else {
          setStatus('User profile created successfully')
          await fetchUserProfile()
        }
      } else if (fetchError) {
        setStatus(`Error checking profile: ${fetchError.message}`)
      } else {
        setStatus('User profile already exists')
        setUserProfile(existingProfile)
      }
    } catch (err) {
      setStatus(`Error: ${err}`)
    }
  }

  const testCreateProfile = async () => {
    if (!user) {
      setStatus('No user logged in')
      return
    }

    setStatus('Testing profile creation...')
    
    try {
      // Force create a new profile (for testing)
      const { error: insertError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'TestUser',
          last_name: user.user_metadata?.last_name || 'Test',
          subscription_status: 'inactive',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })

      if (insertError) {
        setStatus(`Test Error: ${insertError.message}`)
      } else {
        setStatus('Test profile created/updated successfully')
        await fetchUserProfile()
      }
    } catch (err) {
      setStatus(`Test Error: ${err}`)
    }
  }

  const fetchUserProfile = async () => {
    if (!user) {
      setStatus('No user logged in')
      return
    }

    setStatus('Fetching user profile...')
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) {
        setStatus(`Error fetching profile: ${error.message}`)
      } else {
        setUserProfile(data)
        setStatus('User profile fetched successfully')
      }
    } catch (err) {
      setStatus(`Error: ${err}`)
    }
  }

  if (!user) {
    return (
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
        <p className="text-yellow-400">No user logged in</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white/10 border border-white/20 rounded-xl space-y-4">
      <h3 className="text-lg font-semibold text-white">User Profile Debug</h3>
      
      <div className="space-y-2">
        <p className="text-gray-300">User ID: {user.id}</p>
        <p className="text-gray-300">Email: {user.email}</p>
        <p className="text-gray-300">Provider: {user.app_metadata?.provider}</p>
      </div>

      <div className="space-y-2">
        <button
          onClick={checkUserProfile}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
        >
          Check/Create Profile
        </button>
        
        <button
          onClick={testCreateProfile}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white ml-2"
        >
          Test Profile Creation
        </button>
        
        <button
          onClick={fetchUserProfile}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white ml-2"
        >
          Fetch Profile
        </button>
      </div>

      {status && (
        <div className="p-3 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-300">{status}</p>
        </div>
      )}

      {userProfile && (
        <div className="p-4 bg-gray-800 rounded-lg">
          <h4 className="font-semibold text-white mb-2">User Profile Data:</h4>
          <pre className="text-xs text-gray-300 overflow-auto">
            {JSON.stringify(userProfile, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 