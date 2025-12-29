"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type Difficulty = "easy" | "medium" | "hard"

interface DifficultyTabsProps {
  value: Difficulty
  onValueChange: (value: Difficulty) => void
  className?: string
}

export function DifficultyTabs({ value, onValueChange, className }: DifficultyTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as Difficulty)} className={className}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger
          value="easy"
          className={cn(
            "data-[state=active]:bg-present data-[state=active]:text-primary-foreground",
            "text-base font-medium",
          )}
        >
          Easy
        </TabsTrigger>
        <TabsTrigger
          value="medium"
          className={cn(
            "data-[state=active]:bg-future data-[state=active]:text-primary-foreground",
            "text-base font-medium",
          )}
        >
          Medium
        </TabsTrigger>
        <TabsTrigger
          value="hard"
          className={cn(
            "data-[state=active]:bg-past data-[state=active]:text-primary-foreground",
            "text-base font-medium",
          )}
        >
          Hard
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
