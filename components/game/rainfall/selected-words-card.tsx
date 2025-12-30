import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface SelectedWordsCardProps {
  words: string[]
  totalWords: number
  primaryClass: string
  size?: "compact" | "regular"
  className?: string
}

export function SelectedWordsCard({ words, totalWords, primaryClass, size = "regular", className }: SelectedWordsCardProps) {
  const textSize = size === "compact" ? "text-xs md:text-sm" : "text-sm"
  const badgeSize = size === "compact" ? "text-sm md:text-base px-2 md:px-4 py-1 md:py-2" : "text-base px-4 py-2"
  const minHeight = size === "compact" ? "min-h-8 md:min-h-10" : "min-h-10"
  const progressHeight = size === "compact" ? "h-1.5 md:h-2" : "h-2"
  const paddingY = size === "compact" ? "py-3 md:py-4" : "py-4"

  return (
    <Card className={cn("border-2", className)}>
      <CardContent className={paddingY}>
        <p className={cn(textSize, "text-muted-foreground mb-2")}>Your sentence:</p>
        <div className={cn("flex flex-wrap gap-1 md:gap-2", minHeight)}>
          {words.length > 0 ? (
            words.map((word, index) => (
              <Badge key={index} className={cn(badgeSize, primaryClass)}>
                {word}
              </Badge>
            ))
          ) : (
            <span className={cn(textSize, "text-muted-foreground")}>Click falling words...</span>
          )}
        </div>
        <Progress value={(words.length / totalWords) * 100} className={cn(progressHeight, "mt-3 md:mt-4", size === "regular" && "mt-4")}
        />
      </CardContent>
    </Card>
  )
}
