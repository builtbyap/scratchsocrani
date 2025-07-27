"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Mic,
  Search,
  X,
  Eye,
  EyeOff,
  Move,
  Paperclip,
  FileImage,
  FileText,
  File,
  Clock,
  FileDown,
  Trash2,
  Volume2,
  AlertCircle,
  Camera,
  LogOut,
  Loader2,
} from "lucide-react"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface UploadedFile {
  id: string
  file: File
  url: string
  type: "image" | "document" | "other"
}

interface HistoryItem {
  id: string
  question: string
  timestamp: Date
}

interface Note {
  id: string
  content: string
  timestamp: Date
}

type ListeningMode = "question" | "command" | "notes" | "off"

// Extend the Window interface to include the electron API
declare global {
  interface Window {
    electron?: {
      captureScreenshot: () => Promise<string>
    }
  }
}

export default function SocraniAssistant() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [isFirstOpen, setIsFirstOpen] = useState(true)
  const [showControls, setShowControls] = useState(false)
  const [listeningMode, setListeningMode] = useState<ListeningMode>("off")
  const [speechError, setSpeechError] = useState<string>("")
  const [query, setQuery] = useState("")
  const [context, setContext] = useState("")
  const [showContextInput, setShowContextInput] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [capturedScreenshot, setCapturedScreenshot] = useState<string | null>(null) // Base64 image
  const [response, setResponse] = useState("")
  const [displayedResponse, setDisplayedResponse] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [mode, setMode] = useState<"Interview" | "Life">("Life")
  const [isWatchingScreen, setIsWatchingScreen] = useState(false)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isKeyboardMoveMode, setIsKeyboardMoveMode] = useState(false)
  const [screenShareDetected, setScreenShareDetected] = useState(false)
  const [extractedUrls, setExtractedUrls] = useState<string[]>([])

  const recognitionRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typewriterRef = useRef<NodeJS.Timeout | null>(null)
  const screenWatchRef = useRef<NodeJS.Timeout | null>(null)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isRecognitionActiveRef = useRef(false)

  // Supabase Auth Check
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
      } else {
        router.push("/login")
      }
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user)
      } else {
        setUser(null)
        router.push("/login")
      }
    })

    return () => {
      authListener?.unsubscribe()
    }
  }, [router])

  // Screen sharing detection
  useEffect(() => {
    const detectScreenSharing = () => {
      // Monitor for screen capture API usage
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia
        navigator.mediaDevices.getDisplayMedia = function (...args) {
          setScreenShareDetected(true)
          console.log("Screen sharing detected - enhancing stealth mode")
          return originalGetDisplayMedia.apply(this, args)
        }
      }

      // Monitor window focus changes (common during screen sharing)
      let focusChangeCount = 0
      const handleVisibilityChange = () => {
        focusChangeCount++
        if (focusChangeCount > 10) {
          setScreenShareDetected(true)
        }
      }

      document.addEventListener("visibilitychange", handleVisibilityChange)
      window.addEventListener("focus", handleVisibilityChange)
      window.addEventListener("blur", handleVisibilityChange)

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange)
        window.removeEventListener("focus", handleVisibilityChange)
        window.removeEventListener("blur", handleVisibilityChange)
      }
    }

    const cleanup = detectScreenSharing()
    return cleanup
  }, [])

  // Show controls with animation after first open
  useEffect(() => {
    if (isVisible && isFirstOpen) {
      const timer = setTimeout(() => {
        setShowControls(true)
        setIsFirstOpen(false)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (isVisible) {
      setShowControls(true)
    }
  }, [isVisible, isFirstOpen])

  // Typewriter effect
  useEffect(() => {
    if (response && !isLoading) {
      setDisplayedResponse("")
      setIsTypingComplete(false)
      let index = 0

      const typeWriter = () => {
        if (index < response.length) {
          setDisplayedResponse(response.slice(0, index + 1))
          index++
          typewriterRef.current = setTimeout(typeWriter, 20)
        } else {
          setIsTypingComplete(true)
          generateSuggestions(query)
          extractUrls(response) // Extract URLs after typing is complete
        }
      }

      typeWriter()
    }

    return () => {
      if (typewriterRef.current) {
        clearTimeout(typewriterRef.current)
      }
    }
  }, [response, isLoading, query])

  // Screen watching simulation
  useEffect(() => {
    if (isWatchingScreen) {
      const watchScreen = () => {
        const simulatedQuestions = [
          "What is React?",
          "How do you implement state management?",
          "Explain the difference between let and const",
          "What are React hooks?",
          "How do you optimize performance?",
        ]

        const randomQuestion = simulatedQuestions[Math.floor(Math.random() * simulatedQuestions.length)]

        if (Math.random() < 0.1) {
          setQuery(randomQuestion)
          handleAIQuery(randomQuestion)
        }

        screenWatchRef.current = setTimeout(watchScreen, 5000)
      }

      screenWatchRef.current = setTimeout(watchScreen, 5000)
    }

    return () => {
      if (screenWatchRef.current) {
        clearTimeout(screenWatchRef.current)
      }
    }
  }, [isWatchingScreen])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.interimResults = true
      recognitionRef.current.maxAlternatives = 1

      recognitionRef.current.onstart = () => {
        isRecognitionActiveRef.current = true
        setSpeechError("")
      }

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (listeningMode === "question") {
          if (finalTranscript) {
            setQuery(finalTranscript.trim())
            handleAIQuery(finalTranscript.trim())
            stopListening()
          }
        } else if (listeningMode === "command") {
          if (finalTranscript) {
            handleCommand(finalTranscript.trim())
            stopListening()
          }
        } else if (listeningMode === "notes") {
          if (finalTranscript) {
            setCurrentNote((prev) => prev + finalTranscript + " ")
          }
          // Update interim results for live feedback
          if (interimTranscript && !finalTranscript) {
            // Could show interim results in UI if needed
          }
        }
      }

      recognitionRef.current.onend = () => {
        isRecognitionActiveRef.current = false

        if (listeningMode === "notes") {
          // Only restart if we're still in notes mode and there wasn't an error
          if (listeningMode === "notes" && !speechError) {
            restartRecognitionForNotes()
          }
        } else {
          setListeningMode("off")
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        isRecognitionActiveRef.current = false
        setSpeechError(event.error)

        if (event.error === "no-speech") {
          if (listeningMode === "notes") {
            // For notes mode, try to restart after a longer delay
            restartRecognitionForNotes()
          } else {
            // For other modes, just stop
            setListeningMode("off")
          }
        } else if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setSpeechError("Microphone access denied. Please allow microphone permissions.")
          setListeningMode("off")
        } else if (event.error === "network") {
          setSpeechError("Network error. Please check your connection.")
          setListeningMode("off")
        } else {
          // For other errors, stop listening
          setListeningMode("off")
        }
      }
    }

    return () => {
      // Cleanup on unmount
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
    }
  }, [listeningMode, speechError])

  const restartRecognitionForNotes = () => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
    }

    // Only restart if we're still in notes mode and recognition isn't already active
    if (listeningMode === "notes" && !isRecognitionActiveRef.current) {
      restartTimeoutRef.current = setTimeout(() => {
        if (listeningMode === "notes" && recognitionRef.current && !isRecognitionActiveRef.current) {
          try {
            recognitionRef.current.start()
          } catch (error) {
            console.error("Failed to restart recognition:", error)
            // If restart fails, stop notes mode
            setListeningMode("off")
            setSpeechError("Failed to restart voice recognition")
          }
        }
      }, 2000) // Wait 2 seconds before restarting
    }
  }

  const stopListening = () => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
    }

    if (recognitionRef.current && isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.error("Error stopping recognition:", error)
      }
    }

    isRecognitionActiveRef.current = false
    setListeningMode("off")
    setSpeechError("")
  }

  // Handle voice commands
  const handleCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()

    if (lowerCommand.includes("start taking notes") || lowerCommand.includes("begin notes")) {
      startNoteTaking()
    } else if (lowerCommand.includes("stop taking notes") || lowerCommand.includes("end notes")) {
      stopNoteTaking()
    } else if (lowerCommand.includes("save notes")) {
      saveCurrentNote()
    } else if (lowerCommand.includes("clear notes")) {
      clearAllNotes()
    } else if (lowerCommand.includes("show notes")) {
      setShowNotes(true)
    } else if (lowerCommand.includes("hide notes")) {
      setShowNotes(false)
    } else if (lowerCommand.includes("export notes")) {
      exportNotes()
    } else if (lowerCommand.includes("switch to interview mode")) {
      setMode("Interview")
    } else if (lowerCommand.includes("switch to life mode")) {
      setMode("Life")
    } else if (lowerCommand.includes("take screenshot") || lowerCommand.includes("capture screen")) {
      handleCaptureScreenshot()
    } else if (lowerCommand.includes("clear screenshot")) {
      setCapturedScreenshot(null)
    } else if (lowerCommand.includes("sign out") || lowerCommand.includes("logout")) {
      handleSignOut()
    } else {
      // If not a recognized command, treat as a question
      setQuery(command)
      handleAIQuery(command)
    }
  }

  const startNoteTaking = () => {
    if (!recognitionRef.current) {
      setSpeechError("Speech recognition not supported in this browser")
      return
    }

    setListeningMode("notes")
    setCurrentNote("")
    setShowNotes(true)
    setSpeechError("")

    try {
      recognitionRef.current.continuous = true
      recognitionRef.current.start()
    } catch (error) {
      console.error("Failed to start recognition:", error)
      setSpeechError("Failed to start voice recognition")
      setListeningMode("off")
    }
  }

  const stopNoteTaking = () => {
    stopListening()
    if (currentNote.trim()) {
      saveCurrentNote()
    }
  }

  const saveCurrentNote = () => {
    if (currentNote.trim()) {
      const newNote: Note = {
        id: Math.random().toString(36).substr(2, 9),
        content: currentNote.trim(),
        timestamp: new Date(),
      }
      setNotes((prev) => [newNote, ...prev])
      setCurrentNote("")
    }
  }

  const clearAllNotes = () => {
    setNotes([])
    setCurrentNote("")
  }

  const exportNotes = () => {
    const notesText = notes.map((note) => `[${note.timestamp.toLocaleString()}]\n${note.content}\n\n`).join("")

    const blob = new Blob([notesText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `notes-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  // Comprehensive keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Keyboard movement mode
      if (isKeyboardMoveMode) {
        const moveDistance = e.shiftKey ? 20 : 5

        switch (e.key) {
          case "ArrowUp":
            e.preventDefault()
            setPosition((prev) => ({ ...prev, y: Math.max(0, prev.y - moveDistance) }))
            break
          case "ArrowDown":
            e.preventDefault()
            setPosition((prev) => ({ ...prev, y: Math.min(window.innerHeight - 100, prev.y + moveDistance) }))
            break
          case "ArrowLeft":
            e.preventDefault()
            setPosition((prev) => ({ ...prev, x: Math.max(0, prev.x - moveDistance) }))
            break
          case "ArrowRight":
            e.preventDefault()
            setPosition((prev) => ({ ...prev, x: Math.min(window.innerWidth - 300, prev.x + moveDistance) }))
            break
          case "Enter":
          case "Escape":
            e.preventDefault()
            setIsKeyboardMoveMode(false)
            break
        }
        return
      }

      // Ctrl/Cmd + Shift + A - Toggle app
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "A") {
        e.preventDefault()
        setIsVisible(!isVisible)
        if (!isVisible) {
          setTimeout(() => inputRef.current?.focus(), 100)
        }
      }

      // Ctrl/Cmd + Shift + D - Toggle keyboard move mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "D") {
        e.preventDefault()
        setIsKeyboardMoveMode(!isKeyboardMoveMode)
      }

      // Ctrl/Cmd + Shift + F - Open file picker
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
        e.preventDefault()
        fileInputRef.current?.click()
      }

      // Ctrl/Cmd + Shift + C - Toggle context input
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
        e.preventDefault()
        setShowContextInput(!showContextInput)
      }

      // Ctrl/Cmd + Shift + H - Toggle history
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "H") {
        e.preventDefault()
        setShowHistory(!showHistory)
      }

      // Ctrl/Cmd + Shift + N - Toggle notes
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "N") {
        e.preventDefault()
        setShowNotes(!showNotes)
      }

      // Ctrl/Cmd + Shift + W - Toggle screen watching
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "W") {
        e.preventDefault()
        setIsWatchingScreen(!isWatchingScreen)
      }

      // Ctrl/Cmd + Shift + M - Toggle microphone
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "M") {
        e.preventDefault()
        toggleListening()
      }

      // Ctrl/Cmd + Shift + S - Take screenshot
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "S") {
        e.preventDefault()
        handleCaptureScreenshot()
      }

      // Ctrl/Cmd + Shift + L - Logout
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "L") {
        e.preventDefault()
        handleSignOut()
      }

      // Ctrl/Cmd + Shift + Q - Close app
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Q") {
        e.preventDefault()
        setIsVisible(false)
        setShowAnswer(false)
      }

      // Ctrl/Cmd + Shift + I - Switch modes
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "I") {
        e.preventDefault()
        setMode(mode === "Interview" ? "Life" : "Interview")
      }

      // Escape to hide
      if (e.key === "Escape" && isVisible && !isKeyboardMoveMode) {
        if (listeningMode === "notes") {
          stopNoteTaking()
        } else {
          setIsVisible(false)
          setShowAnswer(false)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isVisible, isWatchingScreen, mode, isKeyboardMoveMode, showContextInput, showHistory, listeningMode])

  const addToHistory = (question: string) => {
    const newHistoryItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      question: question.trim(),
      timestamp: new Date(),
    }

    setHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((item) => item.question !== question.trim())
      // Add new item at the beginning and limit to 15 items
      return [newHistoryItem, ...filtered].slice(0, 15)
    })
  }

  const handleHistoryClick = (question: string) => {
    setQuery(question)
    setShowHistory(false)
    handleAIQuery(question)
  }

  const clearHistory = () => {
    setHistory([])
    setShowHistory(false)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (uploadedFiles.length + files.length > 5) {
      alert("Maximum 5 files allowed")
      return
    }

    files.forEach((file) => {
      const url = URL.createObjectURL(file)
      const fileType = file.type.startsWith("image/")
        ? "image"
        : file.type.includes("pdf") || file.type.includes("document")
          ? "document"
          : "other"

      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        url,
        type: fileType,
      }

      setUploadedFiles((prev) => [...prev, uploadedFile])
    })

    // Reset file input
    if (e.target) {
      e.target.value = ""
    }
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url)
      }
      return prev.filter((f) => f.id !== id)
    })
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <FileImage className="w-3 h-3" />
      case "document":
        return <FileText className="w-3 h-3" />
      default:
        return <File className="w-3 h-3" />
    }
  }

  const handleCaptureScreenshot = async () => {
    if (!window.electron || !window.electron.captureScreenshot) {
      setSpeechError("Screenshot capture not available in this environment.")
      return
    }
    setIsLoading(true)
    setCapturedScreenshot(null)
    try {
      const base64Image = await window.electron.captureScreenshot()
      setCapturedScreenshot(base64Image)
      setSpeechError("")
      // Optionally, automatically ask AI about the screenshot
      // handleAIQuery("Analyze this screenshot.", base64Image);
    } catch (error: any) {
      console.error("Error capturing screenshot:", error)
      setSpeechError(`Failed to capture screenshot: ${error.message || error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const removeScreenshot = () => {
    setCapturedScreenshot(null)
  }

  const extractUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const foundUrls = text.match(urlRegex)
    setExtractedUrls(foundUrls || [])
  }

  const generateSuggestions = async (originalQuery: string) => {
    if (!originalQuery.trim()) return

    setIsLoadingSuggestions(true)
    try {
      const modeContext =
        mode === "Interview"
          ? "Generate interview or work-related follow-up questions"
          : "Generate any relevant follow-up questions"

      const contextPrompt = context ? ` Context: ${context}.` : ""
      const filesContext = uploadedFiles.length > 0 ? ` The user has uploaded ${uploadedFiles.length} file(s).` : ""
      const screenshotContext = capturedScreenshot ? ` The user has provided a screenshot.` : ""

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Based on this question: "${originalQuery}".${contextPrompt}${filesContext}${screenshotContext} ${modeContext}. Return only 3 short, related follow-up questions, one per line, without numbers or bullets. Keep each question under 45 characters and make them concise.`,
      })

      const suggestionList = text
        .split("\n")
        .filter((line) => line.trim())
        .slice(0, 3)
        .map((line) => line.trim().replace(/^[-•\d.)\s]+/, ""))

      setSuggestions(suggestionList)
    } catch (error) {
      console.error("Error generating suggestions:", error)
      setSuggestions([])
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleAIQuery = async (queryText: string, image?: string | null) => {
    if (!queryText.trim() && !image && uploadedFiles.length === 0) return

    // Check if this is a note-taking request
    const lowerQuery = queryText.toLowerCase()
    if (lowerQuery.includes("start taking notes") || lowerQuery.includes("take notes")) {
      startNoteTaking()
      setResponse(
        "Started taking notes! I'm now listening and transcribing everything. Say 'stop taking notes' when you're done.",
      )
      setShowAnswer(true)
      setIsLoading(false)
      return
    }

    // Add to history
    addToHistory(queryText)

    setShowAnswer(true)
    setIsLoading(true)
    setResponse("")
    setDisplayedResponse("")
    setSuggestions([])
    setExtractedUrls([]) // Clear previous URLs
    setIsTypingComplete(false)

    try {
      const contextPrompt = context ? ` Context: ${context}.` : ""
      const filesPrompt =
        uploadedFiles.length > 0 ? ` The user has uploaded ${uploadedFiles.length} file(s) for reference.` : ""

      const modePrompt =
        mode === "Interview"
          ? `You are an AI assistant helping with interview and work-related questions.${contextPrompt}${filesPrompt} The user is asking: "${queryText}". Provide a simple, concise, and professional response suitable for interview preparation or workplace scenarios. Keep it under 100 words.`
          : `You are a helpful AI assistant for everyday questions.${contextPrompt}${filesPrompt} The user is asking: "${queryText}". Provide a simple, concise, and helpful response. Keep it under 100 words.`

      const messages: any[] = [{ role: "user", content: modePrompt }]

      if (image) {
        messages[0].content = [
          { type: "text", text: modePrompt },
          { type: "image", image: image },
        ]
      } else if (capturedScreenshot) {
        messages[0].content = [
          { type: "text", text: modePrompt },
          { type: "image", image: capturedScreenshot },
        ]
      }

      const { text } = await generateText({
        model: openai("gpt-4o"),
        messages: messages,
      })
      setResponse(text)
    } catch (error) {
      setResponse("Sorry, I encountered an error processing your request.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() || capturedScreenshot || uploadedFiles.length > 0) {
      handleAIQuery(query)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleAIQuery(suggestion)
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError("Speech recognition not supported in this browser")
      return
    }

    if (listeningMode === "off") {
      setSpeechError("")
      // Determine listening mode based on current context
      if (query.toLowerCase().includes("command") || query.toLowerCase().includes("control")) {
        setListeningMode("command")
      } else {
        setListeningMode("question")
      }

      try {
        recognitionRef.current.continuous = false
        recognitionRef.current.start()
      } catch (error) {
        console.error("Failed to start recognition:", error)
        setSpeechError("Failed to start voice recognition")
        setListeningMode("off")
      }
    } else {
      stopListening()
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || isKeyboardMoveMode) return

    setIsDragging(true)
    const rect = containerRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  const clearChat = () => {
    setShowAnswer(false)
    setQuery("")
    setResponse("")
    setDisplayedResponse("")
    setSuggestions([])
    setExtractedUrls([])
    setIsTypingComplete(false)
    setUploadedFiles([])
    setCapturedScreenshot(null)
    if (typewriterRef.current) {
      clearTimeout(typewriterRef.current)
    }
    inputRef.current?.focus()
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error.message)
      setSpeechError("Failed to sign out.")
    } else {
      router.push("/login")
    }
  }

  const getMicrophoneIcon = () => {
    switch (listeningMode) {
      case "question":
        return <Mic className="w-3.5 h-3.5 text-blue-100" />
      case "command":
        return <Volume2 className="w-3.5 h-3.5 text-purple-100" />
      case "notes":
        return <Mic className="w-3.5 h-3.5 text-green-100" />
      default:
        return <Mic className="w-3.5 h-3.5 text-gray-700" />
    }
  }

  const getMicrophoneColor = () => {
    switch (listeningMode) {
      case "question":
        return "bg-blue-500/80 hover:bg-blue-600/80"
      case "command":
        return "bg-purple-500/80 hover:bg-purple-600/80"
      case "notes":
        return "bg-green-500/80 hover:bg-green-600/80"
      default:
        return "bg-gray-400/20 hover:bg-gray-400/30"
    }
  }

  // If user is not authenticated, show nothing or a loading state until redirect
  if (user === null) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-center text-white space-y-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Socrani
          </h1>
          <p className="text-gray-400 max-w-md">
            Your undetectable AI desktop assistant with voice commands and note-taking. Ask questions, give commands, or
            take notes from lectures. <kbd className="px-2 py-1 bg-gray-800 rounded text-sm">Ctrl+Shift+A</kbd> to
            activate.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 max-w-md mx-auto">
            <div>
              <kbd className="px-1 bg-gray-800 rounded">Ctrl+Shift+A</kbd> Toggle App
            </div>
            <div>
              <kbd className="px-1 bg-gray-800 rounded">Ctrl+Shift+N</kbd> Notes
            </div>
            <div>
              <kbd className="px-1 bg-gray-800 rounded">Ctrl+Shift+M</kbd> Voice
            </div>
            <div>
              <kbd className="px-1 bg-gray-800 rounded">Ctrl+Shift+H</kbd> History
            </div>
            <div>
              <kbd className="px-1 bg-gray-800 rounded">Ctrl+Shift+C</kbd> Context
            </div>
            <div>
              <kbd className="px-1 bg-gray-800 rounded">Ctrl+Shift+W</kbd> Screen Watch
            </div>
            <div>
              <kbd className="px-1 bg-gray-800 rounded">Ctrl+Shift+S</kbd> Screenshot
            </div>
            <div>
              <kbd className="px-1 bg-gray-800 rounded">Ctrl+Shift+L</kbd> Logout
            </div>
          </div>
          <div className="text-sm text-gray-400 max-w-md">
            <p className="mb-2">Voice Commands:</p>
            <div className="text-xs space-y-1">
              <p>"Start taking notes" - Begin transcribing speech</p>
              <p>"Stop taking notes" - End transcription</p>
              <p>"Save notes" - Save current transcription</p>
              <p>"Export notes" - Download notes as text file</p>
              <p>"Take screenshot" - Capture current screen</p>
              <p>"Clear screenshot" - Remove captured screenshot</p>
              <p>"Sign out" - Log out of Socrani</p>
            </div>
          </div>
          <Button
            onClick={() => setIsVisible(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Launch Socrani
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Translucent AI Assistant Overlay - User Visible, Screen Share Invisible */}
      <div
        ref={containerRef}
        className={`fixed z-50 select-none transition-all duration-200 stealth-overlay ultra-stealth anti-capture ${
          isKeyboardMoveMode ? "cursor-move ring-2 ring-blue-400/50" : "cursor-move"
        } ${isDragging ? "stealth-animate" : ""} ${screenShareDetected ? "screen-share-detected" : ""}`}
        style={{
          left: position.x,
          top: position.y,
          // User-visible positioning with screen capture evasion
          willChange: "transform, filter",
          transform: `translate3d(0, 0, 0)`,
          // Minimal filtering for screen capture evasion without affecting user visibility
          filter: screenShareDetected
            ? `contrast(1.00001) brightness(0.99999) saturate(1.00001)`
            : `contrast(1.001) brightness(0.999)`,
          // Hardware acceleration for performance
          backfaceVisibility: "hidden",
          transformStyle: "preserve-3d",
          isolation: "isolate",
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="space-y-2">
          {/* Screen Share Detection Indicator */}
          {screenShareDetected && (
            <div className="user-visible rounded-lg p-2 border-green-300/50 bg-green-500/10">
              <div className="flex items-center gap-2 text-green-700">
                <Eye className="w-3 h-3" />
                <span className="text-xs">🥷 Maximum Stealth Mode Active</span>
              </div>
            </div>
          )}

          {/* Speech Error Display */}
          {speechError && (
            <div className="user-visible rounded-2xl p-2 border-red-300/50 bg-red-500/10">
              <div className="cursor-default" onMouseDown={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-xs">{speechError}</span>
                  <Button
                    onClick={() => setSpeechError("")}
                    className="p-0 h-3 w-3 bg-transparent hover:bg-red-500/20"
                    size="sm"
                  >
                    <X className="w-2 h-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Compact Search Bar */}
          <div className="user-visible rounded-full shadow-lg">
            <form onSubmit={handleSubmit} className="flex items-center">
              <div className="flex items-center px-3 py-2 cursor-default" onMouseDown={(e) => e.stopPropagation()}>
                <Search className="w-4 h-4 text-gray-800 mr-2" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    listeningMode === "notes" ? "Taking notes..." : "Ask me anything or say 'start taking notes'..."
                  }
                  className="stealth-input bg-transparent border-none text-gray-900 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 w-60 text-sm"
                  autoFocus
                  disabled={listeningMode === "notes"}
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="visible-button ml-1 p-1.5 rounded-full transition-colors"
                  size="sm"
                >
                  <Paperclip className="w-3.5 h-3.5 text-gray-700" />
                </Button>
                <Button
                  type="button"
                  onClick={handleCaptureScreenshot}
                  className="visible-button ml-1 p-1.5 rounded-full transition-colors"
                  size="sm"
                >
                  <Camera className="w-3.5 h-3.5 text-gray-700" />
                </Button>
                <Button
                  type="button"
                  onClick={toggleListening}
                  className={`ml-1 p-1.5 rounded-full transition-colors ${getMicrophoneColor()}`}
                  size="sm"
                >
                  {getMicrophoneIcon()}
                </Button>
                {showAnswer && (
                  <Button
                    type="button"
                    onClick={clearChat}
                    className="visible-button ml-1 p-1.5 rounded-full"
                    size="sm"
                  >
                    <X className="w-3.5 h-3.5 text-gray-700" />
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Current Note Display (when taking notes) */}
          {listeningMode === "notes" && (
            <div className="user-visible rounded-2xl border-green-300/50 bg-green-500/10">
              <div className="p-3 cursor-default" onMouseDown={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-green-700 font-medium flex items-center gap-1">
                    <Mic className="w-3 h-3 animate-pulse" />
                    Recording Notes...
                  </div>
                  <div className="flex gap-1">
                    <Button
                      onClick={saveCurrentNote}
                      className="text-xs px-2 py-0.5 bg-green-600/20 hover:bg-green-600/30 text-green-700 rounded"
                      size="sm"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={stopNoteTaking}
                      className="text-xs px-2 py-0.5 bg-red-600/20 hover:bg-red-600/30 text-red-700 rounded"
                      size="sm"
                    >
                      Stop
                    </Button>
                  </div>
                </div>
                <div className="readable-text text-sm leading-relaxed max-h-32 overflow-y-auto">
                  {currentNote || "Listening for speech..."}
                </div>
              </div>
            </div>
          )}

          {/* Uploaded Files Display */}
          {uploadedFiles.length > 0 && (
            <div className="user-visible rounded-2xl">
              <div className="p-2 cursor-default" onMouseDown={(e) => e.stopPropagation()}>
                <div className="text-xs text-gray-700 mb-1">Files ({uploadedFiles.length}/5):</div>
                <div className="flex flex-wrap gap-1">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-1 bg-gray-400/30 rounded-lg px-2 py-1 text-xs">
                      {getFileIcon(file.type)}
                      <span className="text-gray-800 max-w-16 truncate text-xs">{file.file.name}</span>
                      <Button
                        onClick={() => removeFile(file.id)}
                        className="p-0 h-3 w-3 bg-transparent hover:bg-red-500/20"
                        size="sm"
                      >
                        <X className="w-2.5 h-2.5 text-gray-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Captured Screenshot Display */}
          {capturedScreenshot && (
            <div className="user-visible rounded-2xl">
              <div className="p-2 cursor-default" onMouseDown={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-gray-700">Screenshot:</div>
                  <Button
                    onClick={removeScreenshot}
                    className="p-0 h-3 w-3 bg-transparent hover:bg-red-500/20"
                    size="sm"
                  >
                    <X className="w-2.5 h-2.5 text-gray-600" />
                  </Button>
                </div>
                <img
                  src={capturedScreenshot || "/placeholder.svg"}
                  alt="Captured Screenshot"
                  className="max-w-full h-auto rounded-md border border-gray-300/30"
                  style={{ maxHeight: "120px", objectFit: "contain" }}
                />
              </div>
            </div>
          )}

          {/* Dynamic Answer Bubble - Shows after search bar when answer exists */}
          {showAnswer && (
            <div className="transition-all duration-500 ease-out transform opacity-100 translate-y-0 scale-100">
              <div className="user-visible rounded-3xl max-w-xs min-h-[3rem]">
                <div className="p-3 cursor-default" onMouseDown={(e) => e.stopPropagation()}>
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-gray-800">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce animation-delay-100" />
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce animation-delay-200" />
                      </div>
                      <span className="text-xs">Thinking...</span>
                    </div>
                  ) : (
                    <>
                      <div className="readable-text text-sm leading-relaxed">
                        {displayedResponse}
                        {!isTypingComplete && displayedResponse.length < response.length && (
                          <span className="inline-block w-1.5 h-3.5 bg-gray-700 ml-1 animate-pulse" />
                        )}
                      </div>
                      {extractedUrls.length > 0 && (
                        <div className="mt-2 text-xs text-gray-700">
                          <p className="font-medium mb-1">Links:</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            {extractedUrls.map((url, index) => (
                              <li key={index}>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate block"
                                >
                                  {url}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Suggestion Questions - Shows after answer */}
          {showAnswer && (
            <div
              className={`transition-all duration-700 ease-out transform ${
                suggestions.length > 0 && !isLoading && !isLoadingSuggestions && isTypingComplete
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-2 scale-95 pointer-events-none"
              }`}
            >
              <div className="space-y-1.5 max-w-xs">
                <div className="text-xs text-gray-600 px-1">Related:</div>
                <div className="space-y-1.5">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="user-visible rounded-2xl hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer min-h-[2rem]"
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className="px-3 py-2">
                        <div className="readable-text text-xs font-medium leading-relaxed">{suggestion}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {isLoadingSuggestions && (
                  <div className="flex items-center gap-1 text-gray-600 text-xs px-1">
                    <div className="w-1 h-1 bg-gray-600 rounded-full animate-pulse" />
                    <span>Generating...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compact Controls - Shows at bottom after answer, or after search bar if no answer */}
          <div
            className={`transition-all duration-800 ease-out transform ${
              showControls
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
            }`}
          >
            <div className="user-visible rounded-full px-2 py-1.5">
              <div
                className="flex items-center justify-between cursor-default text-xs"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className={`text-xs ${mode === "Life" ? "text-gray-900" : "text-gray-600"}`}>Life</span>
                    <Switch
                      checked={mode === "Interview"}
                      onCheckedChange={(checked) => setMode(checked ? "Interview" : "Life")}
                      className="data-[state=checked]:bg-blue-500/80 scale-75"
                    />
                    <span className={`text-xs ${mode === "Interview" ? "text-gray-900" : "text-gray-600"}`}>
                      Interview
                    </span>
                  </div>
                  <div className="h-3 w-px bg-gray-400/40" />
                  <Button
                    type="button"
                    onClick={() => setShowContextInput(!showContextInput)}
                    className={`px-2 py-1 rounded-full transition-colors text-xs ${
                      showContextInput || context
                        ? "bg-blue-500/80 hover:bg-blue-600/80 text-white"
                        : "visible-button text-gray-700"
                    }`}
                    size="sm"
                  >
                    Give Context
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowNotes(!showNotes)}
                    className={`p-1 rounded-full transition-colors ${
                      showNotes ? "bg-orange-500/80 hover:bg-orange-600/80" : "visible-button"
                    }`}
                    size="sm"
                  >
                    <FileText className="w-2.5 h-2.5 text-gray-700" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-1 rounded-full transition-colors ${
                      showHistory ? "bg-purple-500/80 hover:bg-purple-600/80" : "visible-button"
                    }`}
                    size="sm"
                  >
                    <Clock className="w-2.5 h-2.5 text-gray-700" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsWatchingScreen(!isWatchingScreen)}
                    className={`p-1 rounded-full transition-colors ${
                      isWatchingScreen ? "bg-green-500/80 hover:bg-green-600/80" : "visible-button"
                    }`}
                    size="sm"
                  >
                    {isWatchingScreen ? (
                      <Eye className="w-2.5 h-2.5" />
                    ) : (
                      <EyeOff className="w-2.5 h-2.5 text-gray-700" />
                    )}
                  </Button>
                  <Button type="button" onClick={handleSignOut} className="visible-button p-1 rounded-full" size="sm">
                    <LogOut className="w-2.5 h-2.5 text-gray-700" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Context Input */}
          {showContextInput && (
            <div
              className={`transition-all duration-500 ease-out transform ${
                showControls
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
              }`}
            >
              <div className="user-visible rounded-2xl">
                <div className="p-2 cursor-default" onMouseDown={(e) => e.stopPropagation()}>
                  <div className="text-xs text-gray-700 mb-1">Context:</div>
                  <Textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Add context to improve responses..."
                    className="bg-transparent border-none text-gray-900 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-xs"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes Panel */}
          {showNotes && (
            <div
              className={`transition-all duration-500 ease-out transform ${
                showControls
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
              }`}
            >
              <div className="user-visible rounded-2xl max-w-xs">
                <div className="p-2 cursor-default" onMouseDown={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-700">Notes ({notes.length}):</div>
                    <div className="flex gap-1">
                      {notes.length > 0 && (
                        <Button
                          onClick={exportNotes}
                          className="text-xs px-2 py-0.5 bg-blue-400/20 hover:bg-blue-400/30 text-blue-700 rounded"
                          size="sm"
                        >
                          <FileDown className="w-3 h-3" />
                        </Button>
                      )}
                      {notes.length > 0 && (
                        <Button
                          onClick={clearAllNotes}
                          className="text-xs px-2 py-0.5 bg-red-400/20 hover:bg-red-400/30 text-red-700 rounded"
                          size="sm"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {notes.length === 0 ? (
                      <div className="text-xs text-gray-500 text-center py-2">
                        No notes yet. Say "start taking notes" to begin.
                      </div>
                    ) : (
                      notes.map((note) => (
                        <div
                          key={note.id}
                          className="user-visible rounded-lg px-2 py-1.5 hover:bg-gray-400/30 transition-colors"
                        >
                          <div className="readable-text text-sm leading-relaxed">{note.content}</div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-xs text-gray-600">{formatTimeAgo(note.timestamp)}</div>
                            <Button
                              onClick={() => deleteNote(note.id)}
                              className="p-0 h-3 w-3 bg-transparent hover:bg-red-500/20"
                              size="sm"
                            >
                              <X className="w-2 h-2 text-gray-600" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Panel */}
          {showHistory && (
            <div
              className={`transition-all duration-500 ease-out transform ${
                showControls
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
              }`}
            >
              <div className="user-visible rounded-2xl max-w-xs">
                <div className="p-2 cursor-default" onMouseDown={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-700">History ({history.length}):</div>
                    {history.length > 0 && (
                      <Button
                        onClick={clearHistory}
                        className="text-xs px-2 py-0.5 bg-red-400/20 hover:bg-red-400/30 text-red-700 rounded"
                        size="sm"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {history.length === 0 ? (
                      <div className="text-xs text-gray-500 text-center py-2">No questions asked yet</div>
                    ) : (
                      history.map((item) => (
                        <div
                          key={item.id}
                          className="user-visible rounded-lg px-2 py-1.5 hover:bg-gray-400/30 cursor-pointer transition-colors"
                          onClick={() => handleHistoryClick(item.question)}
                        >
                          <div className="readable-text font-medium truncate text-xs">{item.question}</div>
                          <div className="text-xs text-gray-600">{formatTimeAgo(item.timestamp)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Indicators */}
        {listeningMode === "question" && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="bg-blue-500/90 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">🎤 Question</div>
          </div>
        )}

        {listeningMode === "command" && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="bg-purple-500/90 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">🎙️ Command</div>
          </div>
        )}

        {listeningMode === "notes" && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="bg-green-500/90 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
              📝 Recording
            </div>
          </div>
        )}

        {isWatchingScreen && (
          <div className="absolute -top-6 right-0">
            <div className="bg-green-500/90 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">👁️ Watching</div>
          </div>
        )}

        {showHistory && (
          <div className="absolute -top-6 right-8">
            <div className="bg-purple-500/90 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">📚 History</div>
          </div>
        )}

        {showNotes && (
          <div className="absolute -top-6 right-16">
            <div className="bg-orange-500/90 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">📋 Notes</div>
          </div>
        )}

        {isKeyboardMoveMode && (
          <div className="absolute -top-6 left-0">
            <div className="bg-blue-500/90 text-white text-xs px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
              <Move className="w-2.5 h-2.5" />
              Move
            </div>
          </div>
        )}

        {/* Keyboard shortcut hints */}
        {!showAnswer && listeningMode === "off" && !isKeyboardMoveMode && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <div className="text-xs text-gray-600 text-center">
              <kbd className="px-1 bg-gray-400/30 rounded text-xs">Ctrl+Shift+N</kbd> notes •{" "}
              <kbd className="px-1 bg-gray-400/30 rounded text-xs">Ctrl+Shift+M</kbd> voice •{" "}
              <kbd className="px-1 bg-gray-400/30 rounded text-xs">Ctrl+Shift+S</kbd> screenshot
            </div>
          </div>
        )}

        {isKeyboardMoveMode && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <div className="text-xs text-gray-600 text-center">
              <kbd className="px-1 bg-gray-400/30 rounded text-xs">↑↓←→</kbd> move •{" "}
              <kbd className="px-1 bg-gray-400/30 rounded text-xs">Shift</kbd> faster •{" "}
              <kbd className="px-1 bg-gray-400/30 rounded text-xs">Enter</kbd> exit
            </div>
          </div>
        )}
      </div>
    </>
  )
}
