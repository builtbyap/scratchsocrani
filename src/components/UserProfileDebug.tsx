'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { auth } from '@/lib/supabase'

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
      const result = await auth.checkAndCreateUserProfile(user)
      
      if (result.error) {
        setStatus(`Error: ${(result.error as any).message || result.error}`)
      } else {
        setStatus('User profile check completed successfully')
        
        // Fetch the actual profile data
        const { data: profile } = await auth.getUserProfile(user.id)
        setUserProfile(profile)
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
      const result = await auth.testCreateUserProfile(user)
      
      if (result.error) {
        setStatus(`Test Error: ${(result.error as any).message || result.error}`)
      } else {
        setStatus('Test profile created successfully')
        
        // Fetch the actual profile data
        const { data: profile } = await auth.getUserProfile(user.id)
        setUserProfile(profile)
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
      const { data, error } = await auth.getUserProfile(user.id)
      
      if (error) {
        setStatus(`Error fetching profile: ${(error as any).message || error}`)
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