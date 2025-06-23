import { NextRequest, NextResponse } from 'next/server'
import { validateUserAccess, hasActiveSubscription } from '@/lib/subscription-sync'
import { getClient } from '@/lib/supabase-client'

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
    
    // Fetch user profile if validation is successful
    let userProfile = null
    if (validation.isValid) {
      const supabase = getClient()
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (!profileError && profile) {
        userProfile = {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          subscription_status: profile.subscription_status,
          subscription_tier: profile.subscription_tier,
          created_at: profile.created_at
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      email,
      validation: {
        isValid: validation.isValid,
        error: validation.error,
        userProfile
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