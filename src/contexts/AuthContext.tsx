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
      const { session } = await auth.getCurrentSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      // Ensure user profile exists if user is authenticated
      if (session?.user) {
        try {
          await auth.ensureUserProfile(session.user)
        } catch (error) {
          console.error('Error ensuring user profile:', error)
        }
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Ensure user profile exists when auth state changes
        if (session?.user && event === 'SIGNED_IN') {
          try {
            await auth.ensureUserProfile(session.user)
          } catch (error) {
            console.error('Error ensuring user profile:', error)
          }
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
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