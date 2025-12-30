import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type GameSentence } from "./types"

interface SentenceCardProps {
  sentence: GameSentence
  nextWordIndex: number
  borderClass: string
  className?: string
}

export function SentenceCard({ sentence, nextWordIndex, borderClass, className }: SentenceCardProps) {
  return (
    <Card className={cn("border-2", borderClass, className)}>
      <CardContent className="py-3 md:py-4">
        <p className="text-xs md:text-sm text-muted-foreground mb-1">Build this sentence:</p>
        <p className="text-base md:text-lg font-medium">{sentence.native}</p>
        <p className="text-xs text-muted-foreground mt-2">
          <span className="hidden sm:inline">Click words in order: </span>
          {sentence.words.map((word, index) => (
            <span
              key={index}
              className={cn(
                "mx-1 wrap-break-word",
                index < nextWordIndex && "line-through opacity-50",
                index === nextWordIndex && "font-bold text-present",
              )}
            >
              {word}
            </span>
          ))}
        </p>
      </CardContent>
    </Card>
  )
}
