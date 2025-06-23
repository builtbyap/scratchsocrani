import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase-client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    console.log('🔔 Processing webhook event:', event.type)
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout session completed:', session.id)
  
  if (session.customer_email && session.metadata?.planId) {
    try {
      // Get subscription details if available
      let subscriptionStatus = 'active'
      let stripeCustomerId = session.customer as string
      let subscriptionId = null
      
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        subscriptionStatus = subscription.status
        subscriptionId = subscription.id
        stripeCustomerId = subscription.customer as string
      }
      
      // Update user subscription in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          subscription_status: subscriptionStatus,
          subscription_type: session.metadata.planId,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: subscriptionId,
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: null,
        })
        .eq('email', session.customer_email)

      if (error) {
        console.error('❌ Error updating user subscription:', error)
      } else {
        console.log('✅ User subscription updated successfully for:', session.customer_email)
      }
    } catch (error) {
      console.error('❌ Error processing checkout session:', error)
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('✅ Subscription created:', subscription.id)
  
  try {
    // Get customer email from Stripe
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    const customerEmail = 'deleted' in customer ? null : customer.email
    
    if (customerEmail) {
      // Get plan ID from subscription metadata or line items
      const planId = subscription.metadata?.planId || 
                    subscription.items.data[0]?.price.metadata?.planId ||
                    'unknown'
      
      const { error } = await supabase
        .from('users')
        .update({
          subscription_status: subscription.status,
          subscription_type: planId,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          subscription_start_date: new Date((subscription as any).current_period_start * 1000).toISOString(),
          subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
        })
        .eq('email', customerEmail)

      if (error) {
        console.error('❌ Error updating subscription created:', error)
      } else {
        console.log('✅ Subscription created updated in database for:', customerEmail)
      }
    }
  } catch (error) {
    console.error('❌ Error processing subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id)
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    const customerEmail = 'deleted' in customer ? null : customer.email
    
    if (customerEmail) {
      const planId = subscription.metadata?.planId || 
                    subscription.items.data[0]?.price.metadata?.planId ||
                    'unknown'
      
      const { error } = await supabase
        .from('users')
        .update({
          subscription_status: subscription.status,
          subscription_type: planId,
          stripe_subscription_id: subscription.id,
          subscription_start_date: new Date((subscription as any).current_period_start * 1000).toISOString(),
          subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
        })
        .eq('email', customerEmail)

      if (error) {
        console.error('❌ Error updating subscription updated:', error)
      } else {
        console.log('✅ Subscription updated in database for:', customerEmail)
      }
    }
  } catch (error) {
    console.error('❌ Error processing subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', subscription.id)
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    const customerEmail = 'deleted' in customer ? null : customer.email
    
    if (customerEmail) {
      const { error } = await supabase
        .from('users')
        .update({
          subscription_status: 'canceled',
          subscription_end_date: new Date().toISOString(),
        })
        .eq('email', customerEmail)

      if (error) {
        console.error('❌ Error updating subscription deleted:', error)
      } else {
        console.log('✅ Subscription canceled in database for:', customerEmail)
      }
    }
  } catch (error) {
    console.error('❌ Error processing subscription deleted:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Invoice payment succeeded:', invoice.id)
  
  try {
    if ((invoice as any).subscription) {
      const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
      const customer = await stripe.customers.retrieve(subscription.customer as string)
      const customerEmail = 'deleted' in customer ? null : customer.email
      
      if (customerEmail) {
        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: 'active',
            subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
          })
          .eq('email', customerEmail)

        if (error) {
          console.error('❌ Error updating payment succeeded:', error)
        } else {
          console.log('✅ Payment succeeded updated in database for:', customerEmail)
        }
      }
    }
  } catch (error) {
    console.error('❌ Error processing payment succeeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('💸 Invoice payment failed:', invoice.id)
  
  try {
    if ((invoice as any).subscription) {
      const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
      const customer = await stripe.customers.retrieve(subscription.customer as string)
      const customerEmail = 'deleted' in customer ? null : customer.email
      
      if (customerEmail) {
        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: 'past_due',
          })
          .eq('email', customerEmail)

        if (error) {
          console.error('❌ Error updating payment failed:', error)
        } else {
          console.log('✅ Payment failed updated in database for:', customerEmail)
        }
      }
    }
  } catch (error) {
    console.error('❌ Error processing payment failed:', error)
  }
} 