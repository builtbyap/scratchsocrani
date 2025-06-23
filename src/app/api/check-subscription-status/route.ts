import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase-client'
import { hasActiveSubscription } from '@/lib/subscription-sync'
import { isActiveSubscription } from '@/lib/stripe-utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  
  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
  }

  try {
    const supabase = getClient()
    
    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('subscription_status, subscription_end_date')
      .eq('email', email)
      .single()

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError)
      return NextResponse.json({ 
        error: 'Failed to fetch user profile',
        details: profileError
      }, { status: 500 })
    }

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Test the functions
    const isActive = isActiveSubscription(userProfile.subscription_status)
    const hasActive = await hasActiveSubscription(email)

    return NextResponse.json({
      success: true,
      email,
      subscription_status: userProfile.subscription_status,
      subscription_end_date: userProfile.subscription_end_date,
      isActiveSubscription: isActive,
      hasActiveSubscription: hasActive,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error checking subscription status:', error)
    return NextResponse.json({ 
      error: 'Check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 