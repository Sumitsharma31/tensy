"use client"

import { Button } from "@/components/ui/button"
import { useVoiceSettings } from "@/hooks/use-voice-settings"
import { Volume2, VolumeX, Loader2 } from "lucide-react"

interface AudioButtonProps {
  text: string
  size?: "sm" | "default" | "lg" | "icon"
  variant?: "default" | "ghost" | "outline"
}

export function AudioButton({ text, size = "icon", variant = "ghost" }: AudioButtonProps) {
  const { speak, stop, isPlaying } = useVoiceSettings()

  // We need a local state to know if *this* button is playing, 
  // but useVoiceSettings is global. For now, simple toggle is fine.
  // Ideally, useVoiceSettings should expose 'which content is playing' but 
  // for simple sentence playback, just checking isPlaying is 'okay' (though it might show stop for other playing audio).
  // A better approach is trusting the user to stop/start.

  // However, the hook exposes isPlaying globally. 
  // Let's assume for this button, if global isPlaying is true, we show Stop.
  // This might be slightly inaccurate if multiple buttons exist, but speech is singleton.

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => isPlaying ? stop() : speak(text)}
      className="shrink-0"
    >
      {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      <span className="sr-only">Play pronunciation</span>
    </Button>
  )
}
