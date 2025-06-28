'use client'

import { motion } from 'framer-motion'
import {
  Zap,
  Rocket,
  Globe,
  Users,
  ArrowRight,
  Sparkles,
  Mail,
  Twitter,
  Linkedin,
  Github
} from 'lucide-react'
import CountdownTimer from '@/components/CountdownTimer'

const features = [
  {
    icon: Rocket,
    title: 'Fast Delivery',
    description: 'Agile teams and proven processes for rapid project turnaround.'
  },
  {
    icon: Zap,
    title: 'Cutting-Edge Tech',
    description: 'We use the latest frameworks and tools to future-proof your business.'
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'We help you scale and connect with customers worldwide.'
  },
  {
    icon: Users,
    title: 'Client-Centric',
    description: 'Your goals are our mission. We partner for your success.'
  }
]

const testimonials = [
  {
    name: 'Jane Doe',
    company: 'Acme Corp',
    quote: 'Socrani delivered our project ahead of schedule and exceeded our expectations. Their team is top-notch!'
  },
  {
    name: 'Sarah Chen',
    role: 'Product Manager',
    company: 'InnovateCorp',
    quote: 'The mobile app Socrani built for us is beautiful, fast, and reliable. Highly recommended.'
  }
]

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Mail, href: 'mailto:hello@socrani.com', label: 'Email' }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl animate-float-more-delayed"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center space-x-2 text-3xl font-bold mb-12">
            <Sparkles className="w-10 h-10 text-primary-400" />
            <span className="gradient-text">Socrani</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">AI</span> <span className="text-white font-normal">for Job Referrals</span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 text-white text-lg shadow-lg">
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </a>
            <a href="/pricing" className="inline-flex items-center px-8 py-4 bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 text-white text-lg">
              View Pricing
            </a>
            <a href="/signin" className="inline-flex items-center px-8 py-4 bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 text-white text-lg">
              Sign In
            </a>
          </div>
        </motion.section>

        {/* About Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-24 max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">About Us</h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-12">
            We built a digital solution that connects the unemployed and employed with major companies. Our mission is to help people get their dream jobs.
          </p>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-24"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center gradient-text">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-effect rounded-2xl p-8 text-center hover:glow-effect transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-24 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center gradient-text">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-effect rounded-2xl p-8 text-center"
              >
                <p className="text-lg text-gray-200 mb-4">"{testimonial.quote}"</p>
                <div className="font-semibold text-primary-400">{testimonial.name}</div>
                <div className="text-gray-400 text-sm">{testimonial.company}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex justify-center space-x-6 mb-8"
        >
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              className="glass-effect rounded-full p-3 hover:glow-effect transition-all duration-300"
              aria-label={social.label}
            >
              <social.icon className="w-6 h-6 text-primary-400" />
            </a>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.7 }}
        className="relative z-10 text-center py-8 text-gray-400"
      >
        <p>&copy; 2024 Socrani Agency. All rights reserved.</p>
      </motion.footer>
    </div>
  )
} 