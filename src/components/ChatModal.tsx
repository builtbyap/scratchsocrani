'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, User, Building, Mail, Sparkles } from 'lucide-react'

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: any) => void
}

interface ChatMessage {
  id: string
  type: 'bot' | 'user'
  content: string
  timestamp: Date
}

interface EmailData {
  firstName: string
  lastName: string
  company: string
  domain: string
}

export default function ChatModal({ isOpen, onClose, onComplete }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm here to help you add emails. What company are you looking into?",
      timestamp: new Date()
    }
  ])
  const [currentInput, setCurrentInput] = useState('')
  const [currentStep, setCurrentStep] = useState<'company' | 'firstName' | 'lastName'>('company')
  const [emailData, setEmailData] = useState<EmailData>({
    firstName: '',
    lastName: '',
    company: '',
    domain: ''
  })
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentInput('')
    setIsTyping(true)

    // Simulate bot typing delay
    setTimeout(() => {
      handleBotResponse(currentInput)
    }, 1000)
  }

  const handleBotResponse = (userInput: string) => {
    let botMessage = ''
    let nextStep = currentStep

    switch (currentStep) {
      case 'company':
        setEmailData(prev => ({ ...prev, company: userInput }))
        botMessage = `Great! Now what's the person's first name at ${userInput}?`
        nextStep = 'firstName'
        break
      case 'firstName':
        setEmailData(prev => ({ ...prev, firstName: userInput }))
        botMessage = `Perfect! What's ${userInput}'s last name?`
        nextStep = 'lastName'
        break
      case 'lastName':
        setEmailData(prev => ({ ...prev, lastName: userInput }))
        // Generate domain based on company name
        const domain = emailData.company.toLowerCase().replace(/\s+/g, '') + '.com'
        setEmailData(prev => ({ ...prev, domain }))
        botMessage = `Excellent! I've collected all the information. Let me search for the email address...`
        break
    }

    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: botMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, botResponse])
    setCurrentStep(nextStep)
    setIsTyping(false)

    // If we've collected all data, start the Hunter.io search immediately
    if (nextStep === 'lastName') {
      // Start the search process immediately
      const finalData = { 
        ...emailData, 
        lastName: userInput,
        domain: emailData.company.toLowerCase().replace(/\s+/g, '') + '.com'
      }
      onComplete(finalData)
      handleClose()
    }
  }

  const handleClose = () => {
    setMessages([{
      id: '1',
      type: 'bot',
      content: "Hi! I'm here to help you add emails. What company are you looking into?",
      timestamp: new Date()
    }])
    setCurrentInput('')
    setCurrentStep('company')
    setEmailData({ firstName: '', lastName: '', company: '', domain: '' })
    setIsTyping(false)
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Chat Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                </div>
                <span className="text-white font-semibold">Add Email Assistant</span>
              </div>
              <button
                onClick={handleClose}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/10 text-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </motion.div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 text-gray-200 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    currentStep === 'company' ? 'Enter company name...' :
                    currentStep === 'firstName' ? 'Enter first name...' :
                    'Enter last name...'
                  }
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!currentInput.trim() || isTyping}
                  className="p-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 