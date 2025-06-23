import { getClient } from './supabase-client'
import Stripe from 'stripe'

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

// Function to sync all existing subscriptions from Stripe to Supabase
export async function syncAllSubscriptions() {
  console.log('🔄 Starting subscription sync...')
  
  try {
    const stripe = getStripeClient()
    
    // Get all subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      status: 'active'
    })
    
    console.log(`📊 Found ${subscriptions.data.length} active subscriptions`)
    
    const supabase = getClient()
    
    // Update each subscription in Supabase
    for (const subscription of subscriptions.data) {
      try {
        // Get customer email
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        const customerEmail = 'deleted' in customer ? null : customer.email
        
        if (!customerEmail) {
          console.log(`⚠️ Skipping subscription ${subscription.id} - no customer email`)
          continue
        }
        
        // Update user subscription in Supabase
        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: subscription.status,
            subscription_tier: subscription.items.data[0]?.price.lookup_key || 'pro',
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('email', customerEmail)
        
        if (error) {
          console.error(`❌ Error updating subscription ${subscription.id}:`, error)
        } else {
          console.log(`✅ Updated subscription ${subscription.id} for ${customerEmail}`)
        }
      } catch (error) {
        console.error(`❌ Error processing subscription ${subscription.id}:`, error)
      }
    }
    
    console.log('✅ Subscription sync completed')
  } catch (error) {
    console.error('❌ Error syncing subscriptions:', error)
    throw error
  }
}

// Function to validate user access
export async function validateUserAccess(email: string): Promise<{ isValid: boolean; error?: string }> {
  try {
    const supabase = getClient()
    
    // Check if user exists and is not suspended/banned
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('email', email)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return { isValid: false, error: 'User profile not found' }
      }
      return { isValid: false, error: 'Database error' }
    }
    
    if (userProfile.subscription_status === 'suspended' || userProfile.subscription_status === 'banned') {
      return { isValid: false, error: 'Account is suspended or banned' }
    }
    
    return { isValid: true }
  } catch (error) {
    console.error('❌ Error validating user access:', error)
    return { isValid: false, error: 'Validation error' }
  }
}

// Function to check if user has active subscription
export async function hasActiveSubscription(email: string): Promise<boolean> {
  try {
    const supabase = getClient()
    
    // Check user subscription status
    const { data, error } = await supabase
      .from('users')
      .select('subscription_status, subscription_end_date')
      .eq('email', email)
      .single()
    
    if (error) {
      console.error('❌ Error checking subscription:', error)
      return false
    }
    
    // Check if subscription is active and not expired
    if (data.subscription_status === 'active') {
      if (data.subscription_end_date) {
        const endDate = new Date(data.subscription_end_date)
        const now = new Date()
        return endDate > now
      }
      return true
    }
    
    return false
  } catch (error) {
    console.error('❌ Error checking active subscription:', error)
    return false
  }
} 