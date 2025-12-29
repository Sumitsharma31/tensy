"use client"

import { LoadingSpinner } from "./loading-spinner"
import { cn } from "@/lib/utils"

interface LoadingScreenProps {
  message?: string
  submessage?: string
  fullScreen?: boolean
  className?: string
}

export function LoadingScreen({
  message = "Loading...",
  submessage,
  fullScreen = false,
  className,
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 bg-background",
        fullScreen ? "fixed inset-0 z-50" : "min-h-[400px] w-full",
        className,
      )}
    >
      <div className="relative">
        {/* Outer ring animation */}
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />

        {/* Tense color rings */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute h-20 w-20 animate-spin rounded-full border-4 border-t-tense-past border-r-transparent border-b-transparent border-l-transparent"
            style={{ animationDuration: "1.5s" }}
          />
          <div
            className="absolute h-16 w-16 animate-spin rounded-full border-4 border-t-transparent border-r-tense-present border-b-transparent border-l-transparent"
            style={{ animationDuration: "1s", animationDirection: "reverse" }}
          />
          <div
            className="absolute h-12 w-12 animate-spin rounded-full border-4 border-t-transparent border-r-transparent border-b-tense-future border-l-transparent"
            style={{ animationDuration: "0.75s" }}
          />
          <LoadingSpinner size="sm" className="relative" />
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-lg font-medium text-foreground animate-pulse">{message}</p>
        {submessage && <p className="text-sm text-muted-foreground mt-1">{submessage}</p>}
      </div>

      {/* Animated dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
