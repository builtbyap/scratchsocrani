import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Creating checkout session...')
    console.log('🔑 Stripe secret key exists:', !!process.env.STRIPE_SECRET_KEY)
    console.log('🔑 Stripe secret key prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'not set')
    
    const { priceId, customerEmail, planId } = await request.json()
    
    console.log('📋 Request data:', { priceId, customerEmail, planId })
    console.log('🌐 Base URL:', process.env.NEXT_PUBLIC_BASE_URL)

    // Validate required fields
    if (!priceId) {
      console.error('❌ Missing priceId')
      return NextResponse.json(
        { error: 'Missing price ID' },
        { status: 400 }
      )
    }

    if (!customerEmail) {
      console.error('❌ Missing customerEmail')
      return NextResponse.json(
        { error: 'Missing customer email' },
        { status: 400 }
      )
    }

    // Validate Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is not configured')
      return NextResponse.json(
        { error: 'Stripe configuration error: Secret key not found' },
        { status: 500 }
      )
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        planId: planId,
      },
    })

    console.log('✅ Checkout session created:', session.id)
    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('❌ Error creating checkout session:', error)
    
    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('No such price')) {
        return NextResponse.json(
          { error: 'Invalid price ID. Please check your Stripe configuration.' },
          { status: 400 }
        )
      }
      if (error.message.includes('Invalid API key')) {
        return NextResponse.json(
          { error: 'Stripe configuration error. Please check your API keys.' },
          { status: 500 }
        )
      }
      if (error.message.includes('You did not provide an API key')) {
        return NextResponse.json(
          { error: 'Stripe API key is missing. Please check your environment variables.' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
} 