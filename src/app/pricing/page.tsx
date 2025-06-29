'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { paymentPlans, formatPrice, stripePromise } from '@/lib/stripe'

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      // Redirect to sign in if not authenticated
      window.location.href = '/signin'
      return
    }

    setIsLoading(true)
    setSelectedPlan(planId)

    try {
      console.log('🔍 Starting subscription process for plan:', planId)
      console.log('👤 User:', user.email)
      
      const plan = paymentPlans.find(p => p.id === planId)
      if (!plan) throw new Error('Plan not found')

      console.log('📋 Plan found:', plan.name, 'Price:', plan.price)

      // Create checkout session for all plans (including free)
      console.log('🔄 Creating checkout session...')
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          customerEmail: user.email,
          planId: plan.id,
        }),
      })

      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Server error:', errorText)
        throw new Error(`Server error: ${response.status} - ${errorText}`)
      }

      const { sessionId, error } = await response.json()
      
      if (error) {
        console.error('❌ Checkout session error:', error)
        throw new Error(error)
      }

      console.log('✅ Checkout session created:', sessionId)

      // Redirect to Stripe checkout
      console.log('🔄 Redirecting to Stripe checkout...')
      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          console.error('❌ Stripe redirect error:', error)
          throw error
        }
      } else {
        console.error('❌ Stripe not loaded')
        throw new Error('Stripe not loaded')
      }
    } catch (error) {
      console.error('❌ Error creating checkout session:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to start checkout: ${errorMessage}`)
    } finally {
      setIsLoading(false)
      setSelectedPlan(null)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl animate-float-more-delayed"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8"
        >
          <Link 
            href="/"
            className="inline-flex items-center bg-white/10 border border-white/20 hover:bg-white/20 text-gray-300 hover:text-white transition-all duration-300 px-4 py-2 rounded-lg mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <div className="flex items-center space-x-2 text-xl font-bold mb-8">
              <Sparkles className="w-6 h-6 text-primary-400" />
              <span className="gradient-text">Socrani</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your <span className="gradient-text">Plan</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Select the perfect plan for your needs. All plans include our expert development team and ongoing support.
            </p>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 flex items-center justify-center px-4 pb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
            {paymentPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className={`glass-effect rounded-3xl p-8 relative ${
                  plan.id === 'annual' ? 'ring-2 ring-primary-500 scale-105' : ''
                }`}
              >
                {plan.id === 'annual' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-2">
                    {formatPrice(plan.price)}
                    <span className="text-lg text-gray-400">/{plan.interval}</span>
                  </div>
                  <p className="text-gray-300">
                    {plan.id === 'monthly' ? 'Perfect for startups and small businesses' : 
                     'Perfect for growing businesses'}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading && selectedPlan === plan.id}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.id === 'annual'
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white'
                      : 'bg-white/10 border border-white/20 hover:bg-white/20 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Get ${plan.name}`
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="px-8 pb-8"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 gradient-text">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-lg font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-300">Yes, you can cancel your subscription at any time. No long-term contracts required.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-300">We accept all major credit cards through our secure Stripe payment system.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Is there a setup fee?</h3>
                <p className="text-gray-300">No setup fees. You only pay the monthly subscription amount.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Can I upgrade or downgrade?</h3>
                <p className="text-gray-300">Yes, you can change your plan at any time. Changes take effect immediately.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 