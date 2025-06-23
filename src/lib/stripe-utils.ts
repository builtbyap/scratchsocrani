// Stripe utility functions for consistent handling across the application

// Map Stripe subscription status to Supabase subscription_status
export function mapStripeStatusToSupabase(stripeStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'active': 'active',
    'canceled': 'canceled',
    'past_due': 'past_due',
    'trialing': 'trialing',
    'unpaid': 'unpaid',
    'incomplete': 'inactive',
    'incomplete_expired': 'inactive',
    'paused': 'inactive',
    'uncollectible': 'past_due'
  }
  
  return statusMap[stripeStatus] || 'inactive'
}

// Check if a subscription status is considered active
export function isActiveSubscription(status: string): boolean {
  return status === 'active' || status === 'trialing'
}

// Check if a subscription status allows access
export function allowsAccess(status: string): boolean {
  return isActiveSubscription(status) && status !== 'canceled' && status !== 'unpaid'
}

// Get human-readable status description
export function getStatusDescription(status: string): string {
  const descriptions: { [key: string]: string } = {
    'active': 'Active subscription',
    'canceled': 'Subscription canceled',
    'past_due': 'Payment past due',
    'trialing': 'Trial period active',
    'unpaid': 'Payment required',
    'inactive': 'No active subscription',
    'incomplete': 'Payment incomplete',
    'incomplete_expired': 'Payment incomplete and expired',
    'paused': 'Subscription paused',
    'uncollectible': 'Payment uncollectible'
  }
  
  return descriptions[status] || 'Unknown status'
} 