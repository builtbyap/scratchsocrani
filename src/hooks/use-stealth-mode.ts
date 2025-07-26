"use client"

import { useEffect, useState, useCallback } from "react"

interface StealthConfig {
  gpuAcceleration: boolean
  advancedFilters: boolean
  hardwareOverlay: boolean
  antiCapture: boolean
  stealthLevel: number
}

export function useStealthMode() {
  const [stealthConfig, setStealthConfig] = useState<StealthConfig>({
    gpuAcceleration: true,
    advancedFilters: true,
    hardwareOverlay: true,
    antiCapture: true,
    stealthLevel: 100,
  })

  const [isStealthActive, setIsStealthActive] = useState(false)

  // Initialize stealth mode
  const initializeStealth = useCallback(() => {
    // Check browser capabilities
    const hasWebGL = !!document.createElement("canvas").getContext("webgl")
    const hasBackdropFilter = CSS.supports("backdrop-filter", "blur(10px)")
    const hasAdvancedFilters = CSS.supports("filter", "contrast(1.1) brightness(0.9)")
    const hasTransform3D = CSS.supports("transform", "translate3d(0, 0, 0)")

    const config: StealthConfig = {
      gpuAcceleration: hasWebGL && hasTransform3D,
      advancedFilters: hasAdvancedFilters,
      hardwareOverlay: hasBackdropFilter,
      antiCapture: true,
      stealthLevel: 0,
    }

    // Calculate stealth level
    let level = 0
    if (config.gpuAcceleration) level += 30
    if (config.advancedFilters) level += 25
    if (config.hardwareOverlay) level += 25
    if (config.antiCapture) level += 20

    config.stealthLevel = level
    setStealthConfig(config)
    setIsStealthActive(level >= 70)
  }, [])

  // Apply stealth styles dynamically
  const applyStealthStyles = useCallback(
    (element: HTMLElement) => {
      if (!element || !isStealthActive) return

      // GPU acceleration
      if (stealthConfig.gpuAcceleration) {
        element.style.willChange = "transform, filter, backdrop-filter"
        element.style.transform = "translate3d(0, 0, 0) rotateZ(0.001deg)"
        element.style.backfaceVisibility = "hidden"
        element.style.transformStyle = "preserve-3d"
      }

      // Advanced filters
      if (stealthConfig.advancedFilters) {
        element.style.filter = `
        contrast(1.01) 
        brightness(0.99) 
        saturate(1.005) 
        hue-rotate(0.1deg)
        blur(0.01px)
      `
      }

      // Hardware overlay
      if (stealthConfig.hardwareOverlay) {
        element.style.backdropFilter = `
        blur(15px) 
        saturate(1.15) 
        contrast(1.08) 
        brightness(1.03)
      `
      }

      // Anti-capture properties
      if (stealthConfig.antiCapture) {
        element.style.isolation = "isolate"
        element.style.contain = "layout style paint"
        element.style.mixBlendMode = "normal"
      }
    },
    [stealthConfig, isStealthActive],
  )

  // Enhanced stealth mode for maximum invisibility
  const enableMaximumStealth = useCallback((element: HTMLElement) => {
    if (!element) return

    // Ultra-advanced GPU rendering
    element.style.willChange = "transform, opacity, filter, backdrop-filter"
    element.style.transform = `
      translate3d(0, 0, 0) 
      rotateX(0.001deg) 
      rotateY(0.001deg) 
      rotateZ(0.001deg) 
      scale3d(1.0001, 1.0001, 1)
    `

    // Multi-layer filtering
    element.style.filter = `
      contrast(1.008) 
      brightness(0.992) 
      saturate(1.005) 
      hue-rotate(0.1deg)
      blur(0.005px)
      drop-shadow(0 0 0.01px rgba(0,0,0,0.001))
    `

    // Advanced backdrop effects
    element.style.backdropFilter = `
      blur(18px) 
      saturate(1.2) 
      contrast(1.1) 
      brightness(1.05)
      hue-rotate(0.2deg)
    `

    // Hardware acceleration maximization
    element.style.backfaceVisibility = "hidden"
    element.style.transformStyle = "preserve-3d"
    element.style.perspective = "1000px"
    element.style.isolation = "isolate"
    element.style.contain = "layout style paint size"

    // Screen capture bypass
    element.style.background = `
      linear-gradient(135deg, 
        rgba(128, 128, 128, 0.08) 0%, 
        rgba(128, 128, 128, 0.15) 50%,
        rgba(128, 128, 128, 0.12) 100%)
    `
    element.style.backgroundBlendMode = "overlay"
  }, [])

  // Monitor for screen sharing
  const monitorScreenSharing = useCallback(() => {
    // Detect screen capture attempts
    const originalGetDisplayMedia = navigator.mediaDevices?.getDisplayMedia
    if (originalGetDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia = function (...args) {
        console.warn("Screen sharing detected - enhancing stealth mode")
        // Enhance stealth when screen sharing is detected
        document.querySelectorAll(".stealth-overlay").forEach((el) => {
          enableMaximumStealth(el as HTMLElement)
        })
        return originalGetDisplayMedia.apply(this, args)
      }
    }
  }, [enableMaximumStealth])

  useEffect(() => {
    initializeStealth()
    monitorScreenSharing()
  }, [initializeStealth, monitorScreenSharing])

  return {
    stealthConfig,
    isStealthActive,
    applyStealthStyles,
    enableMaximumStealth,
    stealthLevel: stealthConfig.stealthLevel,
  }
}
