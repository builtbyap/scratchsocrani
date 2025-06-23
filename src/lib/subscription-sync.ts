import Stripe from 'stripe'
import { supabase } from './supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

// Function to sync all existing subscriptions from Stripe to Supabase
export async function syncAllSubscriptions() {
  try {
    console.log('🔄 Starting subscription sync...')
    
    let hasMore = true
    let startingAfter: string | undefined = undefined
    
    while (hasMore) {
      const subscriptions: Stripe.ApiList<Stripe.Subscription> = await stripe.subscriptions.list({
        limit: 100,
        starting_after: startingAfter,
        expand: ['data.customer'],
      })
      
      for (const subscription of subscriptions.data) {
        await syncSingleSubscription(subscription)
      }
      
      hasMore = subscriptions.has_more
      startingAfter = subscriptions.data[subscriptions.data.length - 1]?.id
    }
    
    console.log('✅ Subscription sync completed')
  } catch (error) {
    console.error('❌ Error syncing subscriptions:', error)
    throw error
  }
}

// Function to sync a single subscription
export async function syncSingleSubscription(subscription: Stripe.Subscription) {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    const customerEmail = 'deleted' in customer ? null : customer.email
    
    if (!customerEmail) {
      console.log('⚠️ Skipping subscription with no customer email:', subscription.id)
      return
    }
    
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
        subscription_trial_end: (subscription as any).trial_end 
          ? new Date((subscription as any).trial_end * 1000).toISOString()
          : null,
      })
      .eq('email', customerEmail)
    
    if (error) {
      console.error('❌ Error syncing subscription:', subscription.id, error)
    } else {
      console.log('✅ Synced subscription:', subscription.id, 'for:', customerEmail)
    }
  } catch (error) {
    console.error('❌ Error processing subscription:', subscription.id, error)
  }
}

// Function to validate user access and profile
export async function validateUserAccess(userEmail: string): Promise<{
  isValid: boolean
  userProfile: any
  error?: string
}> {
  try {
    console.log('🔍 Validating user access for:', userEmail)
    
    // Check if user exists in users table
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single()
    
    if (error) {
      console.error('❌ Error fetching user profile for validation:', error)
      
      if (error.code === 'PGRST116') {
        return {
          isValid: false,
          userProfile: null,
          error: 'User profile not found. Please contact support.'
        }
      }
      
      return {
        isValid: false,
        userProfile: null,
        error: 'Database error during user validation.'
      }
    }
    
    if (!userProfile) {
      return {
        isValid: false,
        userProfile: null,
        error: 'User profile not found.'
      }
    }
    
    // Check if user account is active
    if (userProfile.subscription_status === 'suspended' || userProfile.subscription_status === 'banned') {
      console.error('❌ User account is suspended/banned:', userEmail)
      return {
        isValid: false,
        userProfile,
        error: 'Your account has been suspended. Please contact support for assistance.'
      }
    }
    
    // Check if user has required fields
    if (!userProfile.email || !userProfile.id) {
      console.error('❌ User profile missing required fields:', userProfile)
      return {
        isValid: false,
        userProfile,
        error: 'User profile is incomplete. Please contact support.'
      }
    }
    
    console.log('✅ User access validated successfully:', userProfile)
    return {
      isValid: true,
      userProfile
    }
    
  } catch (error) {
    console.error('❌ Error in validateUserAccess:', error)
    return {
      isValid: false,
      userProfile: null,
      error: 'Validation error occurred.'
    }
  }
}

// Function to get user subscription status
export async function getUserSubscriptionStatus(userEmail: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_status, subscription_type, subscription_end_date')
      .eq('email', userEmail)
      .single()
    
    if (error) {
      console.error('❌ Error fetching subscription status:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('❌ Error in getUserSubscriptionStatus:', error)
    return null
  }
}

// Function to check if user has active subscription
export async function hasActiveSubscription(userEmail: string): Promise<boolean> {
  const subscription = await getUserSubscriptionStatus(userEmail)
  
  if (!subscription) return false
  
  const activeStatuses = ['active', 'trialing']
  const isActive = activeStatuses.includes(subscription.subscription_status)
  
  // Check if subscription hasn't expired
  if (subscription.subscription_end_date) {
    const endDate = new Date(subscription.subscription_end_date)
    const now = new Date()
    return isActive && endDate > now
  }
  
  return isActive
} 