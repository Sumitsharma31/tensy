import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type GameMode, type GameSentence } from "./types"

interface SentenceCardProps {
  sentence: GameSentence
  nextWordIndex: number
  borderClass: string
  className?: string
  gameMode?: GameMode
  targetCategory?: string
  examples?: string[]
}

export function SentenceCard({
  sentence,
  nextWordIndex,
  borderClass,
  className,
  gameMode = 'sentence',
  targetCategory,
  examples = []
}: SentenceCardProps) {
  if (gameMode === 'category' && targetCategory) {
    return (
      <Card className={cn("border-2", borderClass, className)}>
        <CardContent className="py-3 md:py-4 text-center">
          <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Current Mission</p>
          <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Catch: {targetCategory}
          </p>
          {examples.length > 0 && (
            <p className="text-sm text-foreground/80 mt-2 font-medium">
              Examples: {examples.join(", ")}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Avoid other verb forms!
          </p>
        </CardContent>
      </Card>
    )
  }

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
