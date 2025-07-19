'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, User, Building, Linkedin, Sparkles } from 'lucide-react'

interface LinkedInChatModalProps {
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

interface LinkedInData {
  company: string
  position: string
  searchResults?: any
  profiles?: Array<{
    name: string
    linkedin_url: string
  }>
}

export default function LinkedInChatModal({ isOpen, onClose, onComplete }: LinkedInChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm here to help you add LinkedIn connections. What company are you looking into?",
      timestamp: new Date()
    }
  ])
  const [currentInput, setCurrentInput] = useState('')
  const [currentStep, setCurrentStep] = useState<'company' | 'position' | 'complete'>('company')
  const [linkedInData, setLinkedInData] = useState<LinkedInData>({
    company: '',
    position: ''
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
    setTimeout(async () => {
      await handleBotResponse(currentInput)
    }, 1000)
  }

  const handleBotResponse = async (userInput: string) => {
    let botMessage = ''
    let nextStep = currentStep

    switch (currentStep) {
      case 'company':
        setLinkedInData(prev => ({ ...prev, company: userInput }))
        botMessage = `What is their position?`
        nextStep = 'position'
        break
      case 'position':
        setLinkedInData(prev => ({ ...prev, position: userInput }))
        botMessage = `Perfect! I've collected the information. Let me search for LinkedIn profiles...`
        nextStep = 'complete'
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

    // If we've collected all data, make the SerpAPI request
    if (nextStep === 'complete') {
      const finalData = { 
        ...linkedInData, 
        position: userInput
      }
      
      // Make SerpAPI request to find LinkedIn profiles
      try {
        const apiKey = '8e8f53ef8711b4178aca30947abe9f1cd51ac5dafbc4934aa4382ab890c615a0'
        const searchQuery = `LinkedIn ${finalData.position} ${finalData.company} -jobs -careers -openings site:linkedin.com/in/`
        const serpApiUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${apiKey}`
        
        console.log('🔍 Making SerpAPI request:', serpApiUrl)
        
        const response = await fetch(serpApiUrl)
        const searchData = await response.json()
        
        console.log('🔍 SerpAPI response:', searchData)
        
        // Process and filter the search results
        let results = searchData["organic_results"] || [];
        
        let profiles = results.map((result: any) => ({
          name: result.title.replace(" | LinkedIn", "") || "N/A",
          linkedin_url: result.link || "N/A"
        }));
        
        // Filter out job-related results
        profiles = profiles.filter((profile: any) => 
          !profile.name.toLowerCase().includes("hiring") &&
          !profile.name.toLowerCase().includes("jobs") &&
          !profile.name.toLowerCase().includes("recruiting") &&
          !profile.name.toLowerCase().includes("careers") &&
          !profile.name.toLowerCase().includes("open positions")
        );
        
        // Remove duplicate profiles based on LinkedIn URL
        let uniqueProfiles: Array<{name: string, linkedin_url: string}> = [];
        let seenLinks = new Set();
        
        profiles.forEach((profile: any) => {
          if (!seenLinks.has(profile.linkedin_url)) {
            seenLinks.add(profile.linkedin_url);
            uniqueProfiles.push(profile);
          }
        });
        
        console.log('🔍 Filtered LinkedIn profiles:', uniqueProfiles)
        
        // Add processed profiles to the data
        finalData.searchResults = searchData
        finalData.profiles = uniqueProfiles
        
        // Add a message about the search
        const searchMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'bot',
          content: `I found some LinkedIn profiles for ${finalData.position} positions at ${finalData.company}. Let me save this information...`,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, searchMessage])
        
        // Wait a moment to show the search message, then complete
        setTimeout(() => {
          onComplete(finalData)
          handleClose()
        }, 2000)
        
      } catch (error) {
        console.error('❌ Error making SerpAPI request:', error)
        
        // Continue with completion even if search fails
        const errorMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'bot',
          content: `I encountered an issue searching for profiles, but I'll still save your LinkedIn connection information.`,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, errorMessage])
        
        setTimeout(() => {
          onComplete(finalData)
          handleClose()
        }, 2000)
      }
    }
  }

  const handleClose = () => {
    setMessages([{
      id: '1',
      type: 'bot',
      content: "Hi! I'm here to help you add LinkedIn connections. What company are you looking into?",
      timestamp: new Date()
    }])
    setCurrentInput('')
    setCurrentStep('company')
    setLinkedInData({ company: '', position: '' })
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
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Linkedin className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-white font-semibold">Add LinkedIn Assistant</span>
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
                        ? 'bg-blue-500 text-white'
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
                    currentStep === 'position' ? 'Enter position/title...' :
                    'Processing...'
                  }
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!currentInput.trim() || isTyping || currentStep === 'complete'}
                  className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors"
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