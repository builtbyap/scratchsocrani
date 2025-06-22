'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { hasActiveSubscription } from '@/lib/subscription-sync'

interface SubscriptionGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function SubscriptionGuard({ 
  children, 
  fallback,
  redirectTo = '/pricing'
}: SubscriptionGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkSubscription() {
      if (!user) {
        setHasSubscription(false)
        setChecking(false)
        return
      }

      try {
        console.log('🔍 Checking subscription for user:', user.email)
        if (!user.email) {
          console.error('❌ User email is undefined')
          setHasSubscription(false)
          return
        }
        const isActive = await hasActiveSubscription(user.email)
        console.log('📋 Subscription status:', isActive)
        setHasSubscription(isActive)
      } catch (error) {
        console.error('❌ Error checking subscription:', error)
        setHasSubscription(false)
      } finally {
        setChecking(false)
      }
    }

    if (!loading) {
      checkSubscription()
    }
  }, [user, loading])

  // Show loading while checking authentication
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Checking subscription status...</p>
        </div>
      </div>
    )
  }

  // If no user, redirect to sign in
  if (!user) {
    router.push('/signin')
    return null
  }

  // If user has no active subscription, show fallback or redirect
  if (!hasSubscription) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    // Redirect to pricing page
    router.push(redirectTo)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Redirecting to pricing...</p>
        </div>
      </div>
    )
  }

  // User has active subscription, show protected content
  return <>{children}</>
} 