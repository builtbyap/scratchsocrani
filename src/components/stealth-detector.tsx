"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Shield, Eye } from "lucide-react"

interface StealthStatus {
  isScreenSharing: boolean
  captureDetected: boolean
  stealthLevel: "MAXIMUM" | "HIGH" | "MEDIUM" | "LOW"
  gpuAccelerated: boolean
}

export function StealthDetector() {
  const [stealthStatus, setStealthStatus] = useState<StealthStatus>({
    isScreenSharing: false,
    captureDetected: false,
    stealthLevel: "MAXIMUM",
    gpuAccelerated: false,
  })

  useEffect(() => {
    // Detect GPU acceleration support
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    const gpuAccelerated = !!gl

    // Screen sharing detection
    const detectScreenSharing = () => {
      // Check for common screen sharing indicators
      const mediaDevices = navigator.mediaDevices
      if (mediaDevices && mediaDevices.getDisplayMedia) {
        // Monitor for screen capture attempts
        const originalGetDisplayMedia = mediaDevices.getDisplayMedia
        mediaDevices.getDisplayMedia = function (...args) {
          setStealthStatus((prev) => ({ ...prev, isScreenSharing: true, captureDetected: true }))
          return originalGetDisplayMedia.apply(this, args)
        }
      }

      // Check for window focus changes (common during screen sharing)
      let focusChangeCount = 0
      const handleFocusChange = () => {
        focusChangeCount++
        if (focusChangeCount > 5) {
          setStealthStatus((prev) => ({ ...prev, captureDetected: true }))
        }
      }

      window.addEventListener("focus", handleFocusChange)
      window.addEventListener("blur", handleFocusChange)

      return () => {
        window.removeEventListener("focus", handleFocusChange)
        window.removeEventListener("blur", handleFocusChange)
      }
    }

    // Hardware acceleration detection
    const checkHardwareAcceleration = () => {
      const testElement = document.createElement("div")
      testElement.style.transform = "translate3d(0, 0, 0)"
      testElement.style.willChange = "transform"
      document.body.appendChild(testElement)

      const computedStyle = window.getComputedStyle(testElement)
      const hasHardwareAcceleration = computedStyle.transform !== "none"

      document.body.removeChild(testElement)
      return hasHardwareAcceleration
    }

    // Stealth level calculation
    const calculateStealthLevel = (): StealthStatus["stealthLevel"] => {
      let score = 0

      // GPU acceleration check
      if (gpuAccelerated) score += 25
      if (checkHardwareAcceleration()) score += 25

      // Browser support checks
      if (CSS.supports("backdrop-filter", "blur(10px)")) score += 20
      if (CSS.supports("mix-blend-mode", "normal")) score += 15
      if (CSS.supports("filter", "contrast(1.1)")) score += 15

      if (score >= 90) return "MAXIMUM"
      if (score >= 70) return "HIGH"
      if (score >= 50) return "MEDIUM"
      return "LOW"
    }

    setStealthStatus({
      isScreenSharing: false,
      captureDetected: false,
      stealthLevel: calculateStealthLevel(),
      gpuAccelerated,
    })

    const cleanup = detectScreenSharing()
    return cleanup
  }, [])

  const getStealthColor = () => {
    switch (stealthStatus.stealthLevel) {
      case "MAXIMUM":
        return "text-green-600"
      case "HIGH":
        return "text-blue-600"
      case "MEDIUM":
        return "text-yellow-600"
      case "LOW":
        return "text-red-600"
    }
  }

  const getStealthIcon = () => {
    if (stealthStatus.captureDetected) return <AlertTriangle className="w-3 h-3 text-red-500" />
    if (stealthStatus.stealthLevel === "MAXIMUM") return <Shield className="w-3 h-3 text-green-500" />
    return <Eye className="w-3 h-3 text-blue-500" />
  }

  return (
    <div className="stealth-content rounded-lg border border-gray-300/30 shadow-lg p-2">
      <div className="flex items-center gap-2 text-xs">
        {getStealthIcon()}
        <div className="flex flex-col">
          <div className={`font-medium ${getStealthColor()}`}>Stealth: {stealthStatus.stealthLevel}</div>
          <div className="text-gray-600 text-xs">
            {stealthStatus.gpuAccelerated ? "GPU ✓" : "GPU ✗"} |
            {stealthStatus.captureDetected ? " DETECTED" : " HIDDEN"}
          </div>
        </div>
      </div>
      {stealthStatus.captureDetected && <div className="mt-1 text-xs text-red-600">⚠️ Screen capture detected!</div>}
    </div>
  )
}
