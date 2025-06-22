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
      const plan = paymentPlans.find(p => p.id === planId)
      if (!plan) throw new Error('Plan not found')

      // Handle free plan differently - no Stripe checkout needed
      if (plan.price === 0) {
        // For free plan, directly update user subscription in database
        const response = await fetch('/api/subscribe-free', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: plan.id,
            customerEmail: user.email,
          }),
        })

        const { success, error } = await response.json()
        
        if (error) throw new Error(error)

        // Redirect to dashboard with success message
        window.location.href = '/dashboard?success=true&plan=free'
        return
      }

      // Create checkout session for paid plans
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

      const { sessionId, error } = await response.json()
      
      if (error) throw new Error(error)

      // Redirect to Stripe checkout
      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) throw error
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start checkout. Please try again.')
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
            className="inline-flex items-center text-gray-300 hover:text-primary-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 text-3xl font-bold mb-4">
              <Sparkles className="w-8 h-8 text-primary-400" />
              <span className="gradient-text">TechFlow</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your <span className="gradient-text">Plan</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Select the perfect plan for your business needs. All plans include our expert development team and ongoing support.
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
            {paymentPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className={`glass-effect rounded-3xl p-8 relative ${
                  plan.id === 'annual' ? 'ring-2 ring-primary-500 scale-105' : ''
                } ${plan.id === 'free' ? 'border-2 border-gray-600' : ''}`}
              >
                {plan.id === 'annual' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                {plan.id === 'free' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Free Forever
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
                    {plan.id === 'free' ? 'Perfect for getting started' : 
                     plan.id === 'monthly' ? 'Perfect for startups and small businesses' : 
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
                      : plan.id === 'free'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                      : 'bg-white/10 border border-white/20 hover:bg-white/20 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    plan.id === 'free' ? 'Get Started Free' : `Get ${plan.name}`
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