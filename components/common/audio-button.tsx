"use client"

import { Button } from "@/components/ui/button"
import { cancelSpeech, speakText, unlockSpeech, preloadVoices } from "@/lib/speech"
import { Volume2, VolumeX } from "lucide-react"
import { useState, useCallback, useEffect } from "react"

interface AudioButtonProps {
  text: string
  size?: "sm" | "default" | "lg" | "icon"
  variant?: "default" | "ghost" | "outline"
}

export function AudioButton({ text, size = "icon", variant = "ghost" }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Preload voices on component mount
  useEffect(() => {
    preloadVoices()
  }, [])

  const speak = useCallback(() => {
    // Unlock speech on mobile (must be called from user gesture)
    unlockSpeech()
    
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

  const handleClick = useCallback(() => {
    if (isPlaying) {
      stop()
    } else {
      speak()
    }
  }, [isPlaying, speak, stop])

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleClick}
      onTouchEnd={(e) => {
        // Prevent ghost clicks on mobile
        e.preventDefault()
        handleClick()
      }}
      className="shrink-0"
    >
      {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      <span className="sr-only">Play pronunciation</span>
    </Button>
  )
}
