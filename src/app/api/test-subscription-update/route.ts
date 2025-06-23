import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase-client'
import { mapStripeStatusToSupabase } from '@/lib/stripe-utils'

export async function POST(request: NextRequest) {
  try {
    const { email, subscription_status = 'active', subscription_tier = 'pro' } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('🧪 Testing subscription update for:', email)

    const supabase = getClient()
    
    // First, check current user status
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching user:', fetchError)
      return NextResponse.json({ 
        error: 'Failed to fetch user',
        details: fetchError
      }, { status: 500 })
    }

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('📋 Current user status:', {
      email: currentUser.email,
      current_subscription_status: currentUser.subscription_status,
      current_subscription_tier: currentUser.subscription_tier
    })
    
    // Update user subscription
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        subscription_status: subscription_status,
        subscription_tier: subscription_tier,
        stripe_customer_id: currentUser.stripe_customer_id || 'test_customer_id',
        stripe_subscription_id: currentUser.stripe_subscription_id || 'test_subscription_id',
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating subscription:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update subscription',
        details: updateError
      }, { status: 500 })
    }

    console.log('✅ Subscription updated successfully:', {
      email: updatedUser.email,
      previous_status: currentUser.subscription_status,
      new_status: updatedUser.subscription_status,
      previous_tier: currentUser.subscription_tier,
      new_tier: updatedUser.subscription_tier
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully',
      user: {
        email: updatedUser.email,
        previous_subscription_status: currentUser.subscription_status,
        new_subscription_status: updatedUser.subscription_status,
        previous_subscription_tier: currentUser.subscription_tier,
        new_subscription_tier: updatedUser.subscription_tier,
        updated_at: updatedUser.updated_at
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error in test subscription update:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 