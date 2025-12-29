"use client"

import { Button } from "@/components/ui/button"
import { cancelSpeech, speakText } from "@/lib/speech"
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
    speakText(text, {
      rate: 0.9,
      pitch: 1,
      preferredLangs: ["en-IN", "en-GB", "en-US"],
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    })
  }, [text])

  const stop = useCallback(() => {
    cancelSpeech()
    setIsPlaying(false)
  }, [])

  return (
    <Button variant={variant} size={size} onClick={isPlaying ? stop : speak} className="shrink-0">
      {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      <span className="sr-only">Play pronunciation</span>
    </Button>
  )
}
