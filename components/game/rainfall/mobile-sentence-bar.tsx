import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type GameSentence } from "./types"

interface MobileSentenceBarProps {
  sentence: GameSentence
  nextWordIndex: number
  borderClass: string
  className?: string
}

export function MobileSentenceBar({ sentence, nextWordIndex, borderClass, className }: MobileSentenceBarProps) {
  return (
    <div className={cn("absolute bottom-0 left-0 right-0 z-10 pointer-events-none lg:hidden md:hidden", className)}>
      <Card className={cn(
        "border-t-2 border-x-0 border-b-0 rounded-none shadow-lg pointer-events-auto",
        borderClass,
      )}>
        <CardContent className="py-2 px-3">
          <p className="text-xs font-medium mb-1">{sentence.native}</p>
          <div className="flex flex-wrap gap-1">
            {sentence.words.map((word, index) => (
              <span
                key={index}
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  index < nextWordIndex && "line-through opacity-50 bg-muted",
                  index === nextWordIndex && "font-bold bg-present/20 text-present",
                  index > nextWordIndex && "bg-muted/50",
                )}
              >
                {word}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
