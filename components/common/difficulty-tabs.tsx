"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type Difficulty = "easy" | "medium" | "hard"

interface DifficultyTabsProps {
  value: Difficulty
  onValueChange: (value: Difficulty) => void
  className?: string
  disabled?: boolean
}

export function DifficultyTabs({ value, onValueChange, className, disabled }: DifficultyTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onValueChange(v as Difficulty)}
      className={className}
      aria-disabled={disabled}
    >
      <TabsList
        className={cn(
          "grid w-full grid-cols-3 gap-2",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <TabsTrigger
          value="easy"
          className={cn(
            "data-[state=active]:bg-present data-[state=active]:text-primary-foreground",
            "text-sm sm:text-base font-medium whitespace-nowrap",
          )}
        >
          Easy
        </TabsTrigger>
        <TabsTrigger
          value="medium"
          className={cn(
            "data-[state=active]:bg-future data-[state=active]:text-primary-foreground",
            "text-sm sm:text-base font-medium whitespace-nowrap",
          )}
        >
          Medium
        </TabsTrigger>
        <TabsTrigger
          value="hard"
          className={cn(
            "data-[state=active]:bg-past data-[state=active]:text-primary-foreground",
            "text-sm sm:text-base font-medium whitespace-nowrap",
          )}
        >
          Hard
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
