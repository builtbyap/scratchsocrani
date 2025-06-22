'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CountdownTimerProps {
  targetDate: string
  className?: string
}

export default function CountdownTimer({ targetDate, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const target = new Date(targetDate).getTime()

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = target - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-2xl mx-auto ${className}`}>
      {Object.entries(timeLeft).map(([unit, value]) => (
        <motion.div
          key={unit}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-effect rounded-2xl p-6 text-center"
        >
          <div className="text-3xl md:text-4xl font-bold text-primary-400 mb-2">
            {value.toString().padStart(2, '0')}
          </div>
          <div className="text-sm md:text-base text-gray-300 capitalize">
            {unit}
          </div>
        </motion.div>
      ))}
    </div>
  )
} 