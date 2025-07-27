"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ComputerIcon as Windows, Apple, LaptopIcon as Linux } from "lucide-react"

type OS = "Windows" | "macOS" | "Linux" | "Other"

export function DownloadButtons() {
  const [os, setOs] = useState<OS>("Other")

  useEffect(() => {
    const userAgent = navigator.userAgent
    if (/Win/.test(userAgent)) {
      setOs("Windows")
    } else if (/Mac/.test(userAgent)) {
      setOs("macOS")
    } else if (/Linux/.test(userAgent)) {
      setOs("Linux")
    } else {
      setOs("Other")
    }
  }, [])

  const getDownloadLink = (targetOs: OS) => {
    switch (targetOs) {
      case "Windows":
        return "/downloads/Socrani-Setup.exe"
      case "macOS":
        return "/downloads/Socrani.dmg"
      case "Linux":
        return "/downloads/Socrani.AppImage"
      default:
        return "#" // Fallback or link to a general download page
    }
  }

  const getDownloadButton = (targetOs: OS, label: string, Icon: React.ElementType) => (
    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2">
      <a href={getDownloadLink(targetOs)} download>
        <Icon className="h-4 w-4" />
        Download for {label}
      </a>
    </Button>
  )

  return (
    <div className="flex flex-col items-center p-8 bg-gray-900 rounded-lg shadow-xl max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Download Socrani</h2>
      <p className="text-gray-400 text-center mb-8">Get the undetectable AI assistant for your desktop.</p>

      {os === "Windows" && getDownloadButton("Windows", "Windows", Windows)}
      {os === "macOS" && getDownloadButton("macOS", "macOS", Apple)}
      {os === "Linux" && getDownloadButton("Linux", "Linux", Linux)}
      {os === "Other" && (
        <div className="w-full space-y-4">
          <p className="text-gray-400 text-center">Your OS could not be detected. Please choose your download:</p>
          {getDownloadButton("Windows", "Windows", Windows)}
          {getDownloadButton("macOS", "macOS", Apple)}
          {getDownloadButton("Linux", "Linux", Linux)}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-6 text-center">
        Make sure to run `npm run dist` in your Socrani project and host the generated files in your `/public/downloads`
        directory.
      </p>
    </div>
  )
}
