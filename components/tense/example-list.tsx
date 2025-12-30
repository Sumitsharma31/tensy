"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AudioButton } from "@/components/common/audio-button"
import { cn } from "@/lib/utils"
import type { Difficulty } from "@/lib/difficulty-styles"
import { getDifficultyStyles } from "@/lib/difficulty-styles"

interface Sentence {
  native: string
  english: string
  formula: string
}

interface ExampleListProps {
  sentences: Sentence[]
  tense: "past" | "present" | "future"
  difficulty: Difficulty
}

export function ExampleList({ sentences, tense, difficulty }: ExampleListProps) {
  const styles = getDifficultyStyles(difficulty)

  return (
    <div className={cn("space-y-4", styles.gap)}>
      {sentences.map((sentence, i) => (
        <Card
          key={i}
          className={cn(
            "border-2 transition-all hover:shadow-md",
            tense === "past" && "border-past/20 hover:border-past/50",
            tense === "present" && "border-present/20 hover:border-present/50",
            tense === "future" && "border-future/20 hover:border-future/50",
          )}
        >
          <CardContent className={cn("p-4", styles.card)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <p className="text-muted-foreground text-sm">{sentence.native}</p>
                <p className="font-medium text-lg">
                  {sentence.english}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-mono text-xs",
                    tense === "past" && "border-past/50 text-past",
                    tense === "present" && "border-present/50 text-present",
                    tense === "future" && "border-future/50 text-future",
                  )}
                >
                  {sentence.formula}
                </Badge>
              </div>
              <AudioButton text={sentence.english} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
