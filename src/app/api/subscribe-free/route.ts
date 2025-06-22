import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Processing free subscription...')
    
    const { planId, customerEmail } = await request.json()
    
    console.log('📋 Request data:', { planId, customerEmail })

    // Validate required fields
    if (!customerEmail) {
      console.error('❌ Missing customerEmail')
      return NextResponse.json(
        { error: 'Missing customer email' },
        { status: 400 }
      )
    }

    if (planId !== 'free') {
      console.error('❌ Invalid plan ID for free subscription')
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // Update user subscription in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: 'active',
        subscription_type: planId,
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: null, // Free plan has no end date
      })
      .eq('email', customerEmail)

    if (error) {
      console.error('❌ Error updating user subscription:', error)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    console.log('✅ Free subscription activated for:', customerEmail)
    return NextResponse.json({ 
      success: true, 
      message: 'Free subscription activated successfully' 
    })
  } catch (error) {
    console.error('❌ Error processing free subscription:', error)
    
    return NextResponse.json(
      { error: 'Failed to process free subscription. Please try again.' },
      { status: 500 }
    )
  }
} 