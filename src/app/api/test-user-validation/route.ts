import { NextRequest, NextResponse } from 'next/server'
import { validateUserAccess, hasActiveSubscription } from '@/lib/subscription-sync'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({
        error: 'Email is required'
      }, { status: 400 })
    }
    
    console.log('🔍 Testing user validation for:', email)
    
    // Test user validation
    const validation = await validateUserAccess(email)
    
    // Test subscription status
    const hasSubscription = await hasActiveSubscription(email)
    
    return NextResponse.json({
      success: true,
      email,
      validation: {
        isValid: validation.isValid,
        error: validation.error,
        userProfile: validation.userProfile ? {
          id: validation.userProfile.id,
          email: validation.userProfile.email,
          first_name: validation.userProfile.first_name,
          last_name: validation.userProfile.last_name,
          subscription_status: validation.userProfile.subscription_status,
          subscription_type: validation.userProfile.subscription_type,
          created_at: validation.userProfile.created_at
        } : null
      },
      subscription: {
        hasActiveSubscription: hasSubscription
      }
    })
    
  } catch (error) {
    console.error('❌ Error in user validation test:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 