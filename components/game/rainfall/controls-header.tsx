import { DifficultyTabs } from "@/components/common/difficulty-tabs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react"
import { type DifficultyLevel, type GameMode } from "./types" // Import from types

interface ControlsHeaderProps {
  difficulty: DifficultyLevel
  onDifficultyChange: (difficulty: DifficultyLevel) => void
  gameMode: GameMode // New prop
  onGameModeChange: (mode: GameMode) => void // New prop
  difficultyDisabled: boolean
  isFullscreen: boolean
  toggleFullscreen: () => void
  isMuted: boolean
  toggleMute: () => void
  gameState: "idle" | "playing" | "paused" | "ended"
  startGame: () => void
  pauseGame: () => void
  resetGame: () => void
  className?: string
}

export function ControlsHeader({
  difficulty,
  onDifficultyChange,
  gameMode,
  onGameModeChange,
  difficultyDisabled,
  isFullscreen,
  toggleFullscreen,
  isMuted,
  toggleMute,
  gameState,
  startGame,
  pauseGame,
  resetGame,
  className,
}: ControlsHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        !isFullscreen && "sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
        <DifficultyTabs
          value={difficulty}
          onValueChange={onDifficultyChange}
          disabled={difficultyDisabled}
          className="w-full sm:w-auto"
        />

        <div className="flex items-center border rounded-lg p-1 bg-muted/50">
          <Button
            variant={gameMode === "sentence" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onGameModeChange("sentence")}
            disabled={difficultyDisabled}
            className="h-7 text-xs"
          >
            Sentence
          </Button>
          <Button
            variant={gameMode === "category" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onGameModeChange("category")}
            disabled={difficultyDisabled}
            className="h-7 text-xs"
          >
            Tense Challenge
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={toggleMute} className="gap-2 bg-transparent" size="icon">
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>

        <Button variant="outline" onClick={toggleFullscreen} className="gap-2 bg-transparent" size="icon">
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>

        {gameState === "idle" ? (
          <Button onClick={startGame} className="gap-2">
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Start Game</span>
            <span className="sm:hidden">Start</span>
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={pauseGame} className="gap-2 bg-transparent">
              {gameState === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              <span className="hidden sm:inline">{gameState === "paused" ? "Resume" : "Pause"}</span>
            </Button>
            <Button variant="outline" onClick={resetGame} className="gap-2 bg-transparent" size="icon">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
