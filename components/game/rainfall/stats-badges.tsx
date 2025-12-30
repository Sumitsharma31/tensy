import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Target, Timer, Trophy, Zap } from "lucide-react"

interface StatsBadgesProps {
  score: number
  combo: number
  timeLeft: number
  correctCount: number
  wrongCount: number
  className?: string
}

export function StatsBadges({ score, combo, timeLeft, correctCount, wrongCount, className }: StatsBadgesProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 md:gap-4", className)}>
      <Badge variant="outline" className="gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 text-sm md:text-base">
        <Trophy className="h-3 w-3 md:h-4 md:w-4 text-future" />
        <span className="hidden sm:inline">Score: </span>
        {score}
      </Badge>
      <Badge
        variant="outline"
        className={cn(
          "gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 text-sm md:text-base",
          combo > 0 && "bg-present-light",
        )}
      >
        <Zap className="h-3 w-3 md:h-4 md:w-4 text-present" />
        <span className="hidden sm:inline">Combo: </span>x{combo + 1}
      </Badge>
      <Badge
        variant="outline"
        className={cn(
          "gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 text-sm md:text-base",
          timeLeft < 10 && "bg-destructive/10 border-destructive",
        )}
      >
        <Timer className="h-3 w-3 md:h-4 md:w-4" />
        {timeLeft}s
      </Badge>
      <Badge variant="outline" className="gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 text-sm md:text-base">
        <Target className="h-3 w-3 md:h-4 md:w-4" />
        {correctCount}/{correctCount + wrongCount}
      </Badge>
    </div>
  )
}
