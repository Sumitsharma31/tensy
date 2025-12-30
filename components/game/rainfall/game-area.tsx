import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Minimize, Play } from "lucide-react"
import { type GameSentence } from "./types"
import { type PointerEvent, type RefObject } from "react"

interface GameAreaProps {
  gameAreaRef: RefObject<HTMLDivElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  gameState: "idle" | "playing" | "paused" | "ended"
  isFullscreen: boolean
  toggleFullscreen: () => void
  handlePointerDown: (event: PointerEvent<HTMLCanvasElement>) => void
  startGame: () => void
  pauseGame: () => void
  sentence: GameSentence
  nextWordIndex: number
  borderClass: string
  className?: string
}

export function GameArea({
  gameAreaRef,
  canvasRef,
  gameState,
  isFullscreen,
  toggleFullscreen,
  handlePointerDown,
  startGame,
  pauseGame,
  sentence,
  nextWordIndex,
  borderClass,
  className,
}: GameAreaProps) {
  return (
    <Card className={cn("border-2 overflow-hidden", isFullscreen && "h-full", className)}>
      <CardContent className="p-0 h-full">
        <div
          ref={gameAreaRef}
          className={cn(
            "relative bg-muted/40",
            isFullscreen ? "h-full min-h-72" : "h-96",
            gameState === "paused" && "opacity-50",
          )}
        >
          {isFullscreen && (
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleFullscreen}
              className="absolute top-2 right-2 z-10 gap-2 h-8 md:h-10 text-xs md:text-sm md:top-4 md:right-4"
            >
              <Minimize className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Exit Fullscreen</span>
            </Button>
          )}

          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            className={cn("absolute inset-0 cursor-pointer", gameState === "paused" && "opacity-50")}
            style={{ width: "100%", height: "100%", touchAction: "none" }}
          />

          {gameState === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-center space-y-3 md:space-y-4 px-4">
                <h3 className="text-xl md:text-2xl font-bold">Word Rainfall</h3>
                <p className="text-sm md:text-base text-muted-foreground">Click words in order to build sentences</p>
                <Button onClick={startGame} size="lg" className="gap-2">
                  <Play className="h-4 w-4 md:h-5 md:w-5" />
                  Start Playing
                </Button>
              </div>
            </div>
          )}

          {gameState === "paused" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-center space-y-3 md:space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">Paused</h3>
                <Button onClick={pauseGame} size="lg" className="gap-2">
                  <Play className="h-4 w-4 md:h-5 md:w-5" />
                  Resume
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
