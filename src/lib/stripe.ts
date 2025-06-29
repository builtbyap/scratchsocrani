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
    id: 'monthly',
    name: 'Basic Plan',
    price: 15,
    interval: 'month',
    features: [
      'Unlimited monthly usage',
      'Unlimited Emails',
      'Most powerful agent models',
      '24/7 customer support',
    ],
    stripePriceId: 'price_1RczezCyTrsNmVMYokcKRYa7'
  },
  {
    id: 'annual',
    name: 'Professional Plan',
    price: 50,
    interval: 'year',
    features: [
      'Unlimited yearly usage',
      'Unlimited Emails',
      'Most powerful agent models',
      '24/7 customer support',
    ],
    stripePriceId: 'price_1RczfGCyTrsNmVMYm5iifueJ'
  }
]

// Helper function to format price
export const formatPrice = (price: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price)
} 