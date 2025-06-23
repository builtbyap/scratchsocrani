'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { auth } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData?: any) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signInWithGoogle: () => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...')
        const { session } = await auth.getCurrentSession()
        console.log('✅ Initial session retrieved:', !!session)
        setSession(session)
        setUser(session?.user ?? null)
        
        // Ensure user profile exists if user is authenticated
        if (session?.user) {
          try {
            console.log('🔍 Ensuring user profile for:', session.user.email)
            await auth.ensureUserProfile(session.user)
          } catch (error) {
            console.error('❌ Error ensuring user profile:', error)
          }
        }
      } catch (error) {
        console.error('❌ Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    try {
      const { data: { subscription } } = auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔄 Auth state changed:', event, !!session)
          setSession(session)
          setUser(session?.user ?? null)
          
          // Ensure user profile exists when auth state changes
          if (session?.user && event === 'SIGNED_IN') {
            try {
              console.log('🔍 Ensuring user profile after sign in:', session.user.email)
              await auth.ensureUserProfile(session.user)
            } catch (error) {
              console.error('❌ Error ensuring user profile after sign in:', error)
            }
          }
          
          setLoading(false)
        }
      )

      return () => {
        console.log('🧹 Cleaning up auth subscription')
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error('❌ Error setting up auth listener:', error)
      setLoading(false)
    }
  }, [])

  const value = {
    user,
    session,
    loading,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signInWithGoogle: auth.signInWithGoogle,
    signOut: auth.signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 