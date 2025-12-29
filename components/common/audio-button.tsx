"use client"

import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"
import { useState, useCallback } from "react"

interface AudioButtonProps {
  text: string
  size?: "sm" | "default" | "lg" | "icon"
  variant?: "default" | "ghost" | "outline"
}

export function AudioButton({ text, size = "icon", variant = "ghost" }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const speak = useCallback(() => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.lang = "en-US"

      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)

      window.speechSynthesis.speak(utterance)
    }
  }, [text])

  return (
    <Button variant={variant} size={size} onClick={speak} className="shrink-0">
      {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      <span className="sr-only">Play pronunciation</span>
    </Button>
  )
}
