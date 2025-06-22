import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with your publishable key
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Stripe configuration
export const stripeConfig = {
  // Your Stripe publishable key (client-side)
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  
  // Currency and payment settings
  currency: 'usd',
  paymentMethods: ['card'],
  
  // Success and cancel URLs
  successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
  cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
}

// Payment plans configuration
export const paymentPlans = [
  {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    interval: 'month',
    features: [
      'Basic consultation',
      'Project quote',
      'Email support',
      'Basic resources'
    ],
    stripePriceId: 'price_1RcpmqHGzbgxTdhY9tzBiKpv'
  },
  {
    id: 'monthly',
    name: 'Basic Plan',
    price: 15,
    interval: 'month',
    features: [
      'Basic website development',
      '5 pages included',
      'Mobile responsive',
      'Basic SEO setup',
      'Email support'
    ],
    stripePriceId: 'price_1RcegqHGzbgxTdhYuH7fRKTP'
  },
  {
    id: 'annual',
    name: 'Professional Plan',
    price: 50,
    interval: 'year',
    features: [
      'Full website development',
      'Unlimited pages',
      'E-commerce integration',
      'Advanced SEO',
      'Priority support',
      'Analytics dashboard'
    ],
    stripePriceId: 'price_1RcegzHGzbgxTdhY1RTHRUPh'
  }
]

// Helper function to format price
export const formatPrice = (price: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price)
} 