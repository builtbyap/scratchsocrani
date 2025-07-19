'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AuthRedirectProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export default function AuthRedirect({ 
  children, 
  requireAuth = false, 
  redirectTo = '/dashboard' 
}: AuthRedirectProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return

    // If user is authenticated and we're on a page that doesn't require auth (like landing page)
    // redirect them to dashboard
    if (user && !requireAuth) {
      console.log('🔀 User is authenticated, redirecting to dashboard')
      router.push(redirectTo)
      return
    }

    // If user is not authenticated and we're on a page that requires auth
    // redirect them to signin
    if (!user && requireAuth) {
      console.log('🔀 User is not authenticated, redirecting to signin')
      router.push('/signin')
      return
    }
  }, [user, loading, requireAuth, redirectTo, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If we're redirecting, show loading
  if ((user && !requireAuth) || (!user && requireAuth)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 