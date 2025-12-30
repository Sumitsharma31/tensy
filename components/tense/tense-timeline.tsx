"use client"

import { cn } from "@/lib/utils"

type Tense = "past" | "present" | "future"

interface TenseTimelineProps {
  activeTense?: Tense
  onTenseSelect?: (tense: Tense) => void
}

export function TenseTimeline({ activeTense = "present", onTenseSelect }: TenseTimelineProps) {
  const tenses: { id: Tense; label: string; examples: string[] }[] = [
    { id: "past", label: "Past", examples: ["I walked", "She ate", "They played"] },
    { id: "present", label: "Present", examples: ["I walk", "She eats", "They play"] },
    { id: "future", label: "Future", examples: ["I will walk", "She will eat", "They will play"] },
  ]

  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between px-4 sm:px-8">
        {/* Timeline line - absolute positioned behind circles */}
        <div className="absolute left-4 right-4 sm:left-8 sm:right-8 top-1/2 -translate-y-1/2 h-0.5 sm:h-1 bg-muted rounded-full" />

        {/* Active portion highlight */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-0.5 sm:h-1 rounded-full transition-all duration-300",
            activeTense === "past" && "left-4 sm:left-8 w-[15%] bg-past",
            activeTense === "present" && "left-1/2 -translate-x-1/2 w-[15%] bg-present",
            activeTense === "future" && "right-4 sm:right-8 w-[15%] bg-future",
          )}
        />

        {/* Tense circles only - no padding offset */}
        {tenses.map((tense) => (
          <button
            key={tense.id}
            onClick={() => onTenseSelect?.(tense.id)}
            className={cn(
              "relative z-10 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg transition-all",
              "border-2 sm:border-4 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring",
              tense.id === "past" && "border-past",
              tense.id === "present" && "border-present",
              tense.id === "future" && "border-future",
              activeTense === tense.id && tense.id === "past" && "bg-past text-primary-foreground",
              activeTense === tense.id && tense.id === "present" && "bg-present text-primary-foreground",
              activeTense === tense.id && tense.id === "future" && "bg-future text-primary-foreground",
              activeTense !== tense.id && "bg-background",
            )}
          >
            {tense.label.charAt(0)}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 sm:px-8 mt-2 sm:mt-3">
        {tenses.map((tense) => (
          <span
            key={tense.id}
            className={cn(
              "font-semibold text-center text-xs sm:text-base w-8 sm:w-12",
              tense.id === "past" && "text-past",
              tense.id === "present" && "text-present",
              tense.id === "future" && "text-future",
            )}
          >
            {tense.label}
          </span>
        ))}
      </div>
    </div>
  )
}
