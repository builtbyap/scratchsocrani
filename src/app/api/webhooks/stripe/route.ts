import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getClient } from '@/lib/supabase-client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabase = getClient()

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        const subscriptionCreated = event.data.object as Stripe.Subscription
        console.log('📝 New subscription created:', subscriptionCreated.id)
        
        // Update user subscription in Supabase
        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: 'active',
            subscription_tier: subscriptionCreated.items.data[0]?.price.lookup_key || 'pro',
            subscription_end_date: new Date((subscriptionCreated as any).current_period_end * 1000).toISOString(),
            stripe_subscription_id: subscriptionCreated.id,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', subscriptionCreated.customer as string)
        
        if (error) {
          console.error('❌ Error updating user subscription:', error)
          return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
        }
        
        console.log('✅ Subscription created successfully')
        break

      case 'customer.subscription.updated':
        const subscriptionUpdated = event.data.object as Stripe.Subscription
        console.log('📝 Subscription updated:', subscriptionUpdated.id)
        
        // Update user subscription in Supabase
        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_status: subscriptionUpdated.status === 'active' ? 'active' : 'inactive',
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
            subscription_status: 'inactive',
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
        
        // Update user with Stripe customer ID in Supabase
        const { error: customerError } = await supabase
          .from('users')
          .update({
            stripe_customer_id: customerCreated.id,
            updated_at: new Date().toISOString()
          })
          .eq('email', customerCreated.email)
        
        if (customerError) {
          console.error('❌ Error updating customer:', customerError)
          return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
        }
        
        console.log('✅ Customer created successfully')
        break

      default:
        console.log(`📝 Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
} 