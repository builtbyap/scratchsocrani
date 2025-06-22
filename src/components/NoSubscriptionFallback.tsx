'use client'

import { motion } from 'framer-motion'
import { Crown, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function NoSubscriptionFallback() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-effect rounded-3xl p-8 max-w-md w-full text-center"
        >
          {/* Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <Lock className="w-8 h-8 text-primary-400 mx-auto" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-4 gradient-text">
            Premium Access Required
          </h1>

          {/* Description */}
          <p className="text-gray-300 mb-6">
            This dashboard is available exclusively to our premium subscribers. 
            Upgrade your plan to unlock all features and access your personalized dashboard.
          </p>

          {/* Features List */}
          <div className="text-left mb-8">
            <h3 className="text-lg font-semibold mb-3 text-white">What you'll get:</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                Personalized dashboard
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                Project management tools
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                Priority support
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                Advanced analytics
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center w-full py-3 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all duration-300 group"
          >
            Upgrade to Premium
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Back to Home */}
          <Link
            href="/"
            className="inline-block mt-4 text-gray-400 hover:text-primary-400 transition-colors"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
} 