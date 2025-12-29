import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RotateCcw, Trophy, X } from "lucide-react"

interface EndGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  score: number
  correctCount: number
  wrongCount: number
  resetGame: () => void
  startGame: () => void
  container?: HTMLElement | null
}

export function EndGameDialog({
  open,
  onOpenChange,
  score,
  correctCount,
  wrongCount,
  resetGame,
  startGame,
  container,
}: EndGameDialogProps) {
  const totalAttempts = correctCount + wrongCount
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="sm:max-w-md" container={container}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="h-6 w-6 text-future" />
            Game Over!
          </DialogTitle>
          <DialogDescription>Here&apos;s how you did:</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-future">{score}</p>
              <p className="text-sm text-muted-foreground">Total Score</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-present">{accuracy}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </Card>
          </div>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-present" />
              {correctCount} Correct
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-destructive" />
              {wrongCount} Wrong
            </span>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={resetGame} className="gap-2 bg-transparent">
            <X className="h-4 w-4" />
            Close
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              startGame()
            }}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Play Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
