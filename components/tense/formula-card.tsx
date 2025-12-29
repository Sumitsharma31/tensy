import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FormulaCardProps {
  tense: "past" | "present" | "future"
  tenseType: string
  formula: string
  examples: string[]
  className?: string
}

export function FormulaCard({ tense, tenseType, formula, examples, className }: FormulaCardProps) {
  return (
    <Card
      className={cn(
        "border-2 transition-all hover:shadow-lg",
        tense === "past" && "border-past/30 hover:border-past",
        tense === "present" && "border-present/30 hover:border-present",
        tense === "future" && "border-future/30 hover:border-future",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{tenseType}</CardTitle>
          <Badge
            variant="secondary"
            className={cn(
              tense === "past" && "bg-past-light text-past",
              tense === "present" && "bg-present-light text-present",
              tense === "future" && "bg-future-light text-future",
            )}
          >
            {tense}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className={cn(
            "p-3 rounded-lg font-mono text-sm",
            tense === "past" && "bg-past-light",
            tense === "present" && "bg-present-light",
            tense === "future" && "bg-future-light",
          )}
        >
          {formula}
        </div>
        <div className="space-y-1">
          {examples.map((example, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              • {example}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
