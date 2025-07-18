import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getClient } from '@/lib/supabase-client'
import { mapStripeStatusToSupabase } from '@/lib/stripe-utils'

// Lazy-loaded Stripe client
let stripeClient: Stripe | null = null

function getStripeClient(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    })
  }
  return stripeClient
}

// Helper function to ensure user profile exists
async function ensureUserProfile(email: string, stripeCustomerId?: string) {
  const supabase = getClient()
  
  // Check if user profile exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  
  if (fetchError && fetchError.code === 'PGRST116') {
    // User doesn't exist, create profile
    console.log('📝 Creating new user profile for:', email)
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: email,
        subscription_status: 'inactive',
        subscription_tier: 'free',
        stripe_customer_id: stripeCustomerId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Error creating user profile:', createError)
      throw createError
    }
    
    console.log('✅ User profile created:', newUser.id)
    return newUser
  } else if (fetchError) {
    console.error('❌ Error fetching user profile:', fetchError)
    throw fetchError
  }
  
  // User exists - log current status and update if needed
  console.log('👤 Existing user profile found for:', email, {
    current_subscription_status: existingUser.subscription_status,
    current_subscription_tier: existingUser.subscription_tier,
    current_stripe_customer_id: existingUser.stripe_customer_id,
    new_stripe_customer_id: stripeCustomerId
  })
  
  // Update stripe_customer_id if provided and different
  if (stripeCustomerId && existingUser.stripe_customer_id !== stripeCustomerId) {
    console.log('🔄 Updating stripe_customer_id for existing user:', email)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        stripe_customer_id: stripeCustomerId,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
    
    if (updateError) {
      console.error('❌ Error updating stripe_customer_id:', updateError)
    } else {
      console.log('✅ Updated stripe_customer_id for existing user:', email)
    }
  }
  
  return existingUser
}

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook endpoint called!')
  
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  console.log('📝 Request headers:', Object.fromEntries(request.headers.entries()))
  console.log('📝 Body length:', body.length)

  let event: Stripe.Event

  try {
    const stripe = getStripeClient()
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('✅ Webhook signature verified successfully')
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabase = getClient()

  try {
    console.log(`🔄 Processing webhook event: ${event.type}`)
    console.log('📊 Event data:', JSON.stringify(event.data, null, 2))
    
    switch (event.type) {
      case 'checkout.session.completed':
        const sessionCompleted = event.data.object as Stripe.Checkout.Session
        console.log('📝 Checkout session completed:', sessionCompleted.id)
        console.log('📊 Session data:', {
          mode: sessionCompleted.mode,
          customer: sessionCompleted.customer,
          customer_email: sessionCompleted.customer_email,
          subscription: sessionCompleted.subscription
        })
        
        if (sessionCompleted.mode === 'subscription' && sessionCompleted.customer && sessionCompleted.customer_email) {
          console.log('✅ Valid subscription checkout session detected')
          
          // Ensure user profile exists and log current status
          const userProfile = await ensureUserProfile(sessionCompleted.customer_email, sessionCompleted.customer as string)
          console.log('📋 User profile before subscription update:', {
            email: userProfile.email,
            previous_subscription_status: userProfile.subscription_status,
            previous_subscription_tier: userProfile.subscription_tier
          })
          
          // Get the subscription details
          const stripe = getStripeClient()
          const subscription = await stripe.subscriptions.retrieve(sessionCompleted.subscription as string)
          console.log('📊 Retrieved subscription:', {
            id: subscription.id,
            status: subscription.status,
            customer: subscription.customer,
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString()
          })
          
          // Map Stripe status to Supabase status
          const supabaseStatus = mapStripeStatusToSupabase(subscription.status)
          console.log(`📊 Mapping Stripe status '${subscription.status}' to Supabase status '${supabaseStatus}'`)
          
          // Update user subscription in Supabase
          const { error } = await supabase
            .from('users')
            .update({
              subscription_status: supabaseStatus,
              subscription_tier: subscription.items.data[0]?.price.lookup_key || 'pro',
              subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
              stripe_customer_id: sessionCompleted.customer as string,
              stripe_subscription_id: subscription.id,
              updated_at: new Date().toISOString()
            })
            .eq('email', sessionCompleted.customer_email)
          
          if (error) {
            console.error('❌ Error updating user subscription:', error)
            return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
          }
          
          console.log('✅ Subscription activated successfully for:', sessionCompleted.customer_email, {
            previous_status: userProfile.subscription_status,
            new_status: supabaseStatus,
            subscription_id: subscription.id
          })
        } else {
          console.log('⚠️ Not a valid subscription checkout session')
        }
        break

      case 'customer.subscription.created':
        const subscriptionCreated = event.data.object as Stripe.Subscription
        console.log('📝 New subscription created:', subscriptionCreated.id)
        
        // Get customer email from Stripe
        const stripe = getStripeClient()
        const customer = await stripe.customers.retrieve(subscriptionCreated.customer as string)
        const customerEmail = 'deleted' in customer ? null : customer.email
        
        if (!customerEmail) {
          console.error('❌ No customer email found for subscription:', subscriptionCreated.id)
          return NextResponse.json({ error: 'No customer email found' }, { status: 400 })
        }
        
        // Ensure user profile exists and log current status
        const userProfileCreated = await ensureUserProfile(customerEmail, subscriptionCreated.customer as string)
        console.log('📋 User profile before subscription creation:', {
          email: userProfileCreated.email,
          previous_subscription_status: userProfileCreated.subscription_status,
          previous_subscription_tier: userProfileCreated.subscription_tier
        })
        
        // Map Stripe status to Supabase status
        const supabaseStatusCreated = mapStripeStatusToSupabase(subscriptionCreated.status)
        console.log(`📊 Mapping Stripe status '${subscriptionCreated.status}' to Supabase status '${supabaseStatusCreated}'`)
        
        // Update user subscription in Supabase
        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: supabaseStatusCreated,
            subscription_tier: subscriptionCreated.items.data[0]?.price.lookup_key || 'pro',
            subscription_end_date: new Date((subscriptionCreated as any).current_period_end * 1000).toISOString(),
            stripe_customer_id: subscriptionCreated.customer as string,
            stripe_subscription_id: subscriptionCreated.id,
            updated_at: new Date().toISOString()
          })
          .eq('email', customerEmail)
        
        if (error) {
          console.error('❌ Error updating user subscription:', error)
          return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
        }
        
        console.log('✅ Subscription created successfully for:', customerEmail, {
          previous_status: userProfileCreated.subscription_status,
          new_status: supabaseStatusCreated,
          subscription_id: subscriptionCreated.id
        })
        break

      case 'customer.subscription.updated':
        const subscriptionUpdated = event.data.object as Stripe.Subscription
        console.log('📝 Subscription updated:', subscriptionUpdated.id)
        
        // Map Stripe status to Supabase status
        const supabaseStatusUpdated = mapStripeStatusToSupabase(subscriptionUpdated.status)
        console.log(`📊 Mapping Stripe status '${subscriptionUpdated.status}' to Supabase status '${supabaseStatusUpdated}'`)
        
        // Update user subscription in Supabase
        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_status: supabaseStatusUpdated,
            subscription_tier: subscriptionUpdated.items.data[0]?.price.lookup_key || 'pro',
            subscription_end_date: new Date((subscriptionUpdated as any).current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscriptionUpdated.id)
        
        if (updateError) {
          console.error('❌ Error updating subscription:', updateError)
          return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
        }
        
        console.log('✅ Subscription updated successfully')
        break

      case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object as Stripe.Subscription
        console.log('📝 Subscription deleted:', subscriptionDeleted.id)
        
        // Update user subscription in Supabase
        const { error: deleteError } = await supabase
          .from('users')
          .update({
            subscription_status: 'canceled',
            subscription_tier: 'free',
            subscription_end_date: null,
            stripe_subscription_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscriptionDeleted.id)
        
        if (deleteError) {
          console.error('❌ Error updating subscription:', deleteError)
          return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
        }
        
        console.log('✅ Subscription deleted successfully')
        break

      case 'invoice.payment_succeeded':
        const invoiceSucceeded = event.data.object as Stripe.Invoice
        console.log('📝 Payment succeeded:', invoiceSucceeded.id)
        
        // Update user subscription in Supabase
        const { error: paymentError } = await supabase
          .from('users')
          .update({
            subscription_status: 'active',
            subscription_end_date: new Date(invoiceSucceeded.period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', invoiceSucceeded.customer as string)
        
        if (paymentError) {
          console.error('❌ Error updating payment:', paymentError)
          return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
        }
        
        console.log('✅ Payment processed successfully')
        break

      case 'invoice.payment_failed':
        const invoiceFailed = event.data.object as Stripe.Invoice
        console.log('📝 Payment failed:', invoiceFailed.id)
        
        // Update user subscription in Supabase
        const { error: failedError } = await supabase
          .from('users')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', invoiceFailed.customer as string)
        
        if (failedError) {
          console.error('❌ Error updating failed payment:', failedError)
          return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 })
        }
        
        console.log('✅ Payment failure recorded')
        break

      case 'customer.created':
        const customerCreated = event.data.object as Stripe.Customer
        console.log('📝 New customer created:', customerCreated.id)
        
        if (customerCreated.email) {
          // Ensure user profile exists and update with Stripe customer ID
          await ensureUserProfile(customerCreated.email, customerCreated.id)
          console.log('✅ Customer created successfully for:', customerCreated.email)
        }
        break

      default:
        console.log(`📝 Unhandled event type: ${event.type}`)
    }

    console.log('✅ Webhook processed successfully')
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
} 