"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DifficultyTabs } from "@/components/common/difficulty-tabs"
import { cn } from "@/lib/utils"
import { getDifficultyColors, type Difficulty } from "@/lib/difficulty-styles"
import { Play, Pause, RotateCcw, Trophy, Timer, Zap, Target, X, Maximize, Minimize } from "lucide-react"

interface FallingWord {
  id: string
  word: string
  x: number
  y: number
  speed: number
  index: number
}

interface GameSentence {
  native: string
  english: string
  words: string[]
}

const sentences: Record<Difficulty, GameSentence[]> = {
  easy: [
    { native: "मैं खाना खाता हूँ।", english: "I eat food.", words: ["I", "eat", "food."] },
    { native: "वह पढ़ती है।", english: "She reads books.", words: ["She", "reads", "books."] },
    { native: "हम खेलते हैं।", english: "We play games.", words: ["We", "play", "games."] },
    { native: "वे गाते हैं।", english: "They sing well.", words: ["They", "sing", "well."] },
  ],
  medium: [
    { native: "मैं पढ़ रहा हूँ।", english: "I am studying now.", words: ["I", "am", "studying", "now."] },
    { native: "वह कल आएगा।", english: "He will come tomorrow.", words: ["He", "will", "come", "tomorrow."] },
    { native: "हमने खाना खाया।", english: "We ate our dinner.", words: ["We", "ate", "our", "dinner."] },
  ],
  hard: [
    {
      native: "मैंने किताब पढ़ ली है।",
      english: "I have read the book.",
      words: ["I", "have", "read", "the", "book."],
    },
    {
      native: "वह दो घंटे से पढ़ रहा था।",
      english: "He had been studying for hours.",
      words: ["He", "had", "been", "studying", "for", "hours."],
    },
  ],
}

export function RainfallGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "ended">("idle")
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([])
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [nextWordIndex, setNextWordIndex] = useState(0)

  const gameAreaRef = useRef<HTMLDivElement>(null)
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const needsRespawnRef = useRef(false)

  const currentSentences = sentences[difficulty]
  const currentSentence = currentSentences[currentSentenceIndex % currentSentences.length]
  const colors = getDifficultyColors(difficulty)

  const baseSpeed = difficulty === "easy" ? 40 : difficulty === "medium" ? 60 : 80

  const toggleFullscreen = useCallback(async () => {
    if (!fullscreenContainerRef.current) return

    try {
      if (!isFullscreen) {
        const element = fullscreenContainerRef.current as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void>
          msRequestFullscreen?: () => Promise<void>
        }

        if (element.requestFullscreen) {
          await element.requestFullscreen()
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen()
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen()
        }
        setIsFullscreen(true)
      } else {
        const doc = document as Document & {
          webkitExitFullscreen?: () => Promise<void>
          msExitFullscreen?: () => Promise<void>
        }

        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen()
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen()
        }
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error("Fullscreen error:", error)
      setIsFullscreen(!isFullscreen)
    }
  }, [isFullscreen])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element
        msFullscreenElement?: Element
      }
      const fullscreenElement = document.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement
      setIsFullscreen(!!fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("msfullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("msfullscreenchange", handleFullscreenChange)
    }
  }, [])

  const spawnWords = useCallback(
    (sentence: GameSentence) => {
      if (!gameAreaRef.current) return

      const width = gameAreaRef.current.clientWidth
      const padding = 60

      const newWords: FallingWord[] = sentence.words.map((word, i) => ({
        id: `${Date.now()}-${i}-${Math.random()}`,
        word,
        x: padding + Math.random() * (width - padding * 2),
        y: -60 - i * 100 - Math.random() * 50,
        speed: baseSpeed + Math.random() * 30,
        index: i,
      }))

      setFallingWords(newWords)
      setNextWordIndex(0)
      needsRespawnRef.current = false
    },
    [baseSpeed],
  )

  useEffect(() => {
    if (gameState !== "playing") return

    let lastTime = performance.now()

    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime

      setFallingWords((prev) => {
        const gameHeight = gameAreaRef.current?.clientHeight || 400

        const updated = prev.map((fw) => ({
          ...fw,
          y: fw.y + fw.speed * deltaTime,
        }))

        // Check if all words fell off screen
        const allFallen = updated.every((fw) => fw.y > gameHeight + 50)
        if (allFallen && updated.length > 0) {
          needsRespawnRef.current = true
        }

        return updated
      })

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState])

  useEffect(() => {
    if (gameState !== "playing") return

    const checkRespawn = setInterval(() => {
      if (needsRespawnRef.current) {
        // Words fell off without completing - count as miss and respawn
        setWrongCount((prev) => prev + 1)
        setCombo(0)
        setSelectedWords([])
        spawnWords(currentSentence)
      }
    }, 100)

    return () => clearInterval(checkRespawn)
  }, [gameState, currentSentence, spawnWords])

  useEffect(() => {
    if (gameState !== "playing") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("ended")
          setShowEndDialog(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  useEffect(() => {
    if (gameState !== "playing") return

    if (selectedWords.length === currentSentence.words.length) {
      const isCorrect = selectedWords.join(" ") === currentSentence.english

      if (isCorrect) {
        setScore((prev) => prev + (10 + combo * 5) * (difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3))
        setCombo((prev) => prev + 1)
        setCorrectCount((prev) => prev + 1)
      } else {
        setCombo(0)
        setWrongCount((prev) => prev + 1)
      }

      // Move to next sentence
      const nextIndex = currentSentenceIndex + 1
      const nextSentence = currentSentences[nextIndex % currentSentences.length]

      setTimeout(() => {
        setSelectedWords([])
        setCurrentSentenceIndex(nextIndex)
        spawnWords(nextSentence)
      }, 500)
    }
  }, [selectedWords, currentSentence, combo, difficulty, currentSentenceIndex, currentSentences, spawnWords, gameState])

  const handleWordClick = useCallback(
    (wordId: string, word: string, wordIndex: number) => {
      if (gameState !== "playing") return

      // Check if this is the next expected word
      if (wordIndex === nextWordIndex) {
        setSelectedWords((prev) => [...prev, word])
        setFallingWords((prev) => prev.filter((fw) => fw.id !== wordId))
        setNextWordIndex((prev) => prev + 1)
      }
    },
    [gameState, nextWordIndex],
  )

  const startGame = useCallback(() => {
    setGameState("playing")
    setScore(0)
    setCombo(0)
    setTimeLeft(60)
    setSelectedWords([])
    setCurrentSentenceIndex(0)
    setCorrectCount(0)
    setWrongCount(0)
    setNextWordIndex(0)
    needsRespawnRef.current = false

    // Spawn initial words
    const firstSentence = currentSentences[0]
    setTimeout(() => spawnWords(firstSentence), 100)

    // Enter fullscreen
    if (!isFullscreen && fullscreenContainerRef.current) {
      toggleFullscreen()
    }
  }, [currentSentences, spawnWords, isFullscreen, toggleFullscreen])

  const pauseGame = useCallback(() => {
    setGameState((prev) => (prev === "playing" ? "paused" : "playing"))
  }, [])

  const resetGame = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setGameState("idle")
    setScore(0)
    setCombo(0)
    setTimeLeft(60)
    setSelectedWords([])
    setFallingWords([])
    setCurrentSentenceIndex(0)
    setNextWordIndex(0)
    setShowEndDialog(false)
    needsRespawnRef.current = false
    if (isFullscreen) {
      toggleFullscreen()
    }
  }, [isFullscreen, toggleFullscreen])

  return (
    <div
      ref={fullscreenContainerRef}
      className={cn("space-y-6", isFullscreen && "fixed inset-0 z-50 bg-background p-4 overflow-auto flex flex-col")}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <DifficultyTabs
          value={difficulty}
          onValueChange={(d) => {
            setDifficulty(d)
            resetGame()
          }}
          disabled={gameState === "playing" || gameState === "paused"}
          className="w-full sm:w-auto"
        />

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={toggleFullscreen} className="gap-2 bg-transparent" size="icon">
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>

          {gameState === "idle" ? (
            <Button onClick={startGame} className="gap-2">
              <Play className="h-4 w-4" />
              Start Game
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={pauseGame} className="gap-2 bg-transparent">
                {gameState === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {gameState === "paused" ? "Resume" : "Pause"}
              </Button>
              <Button variant="outline" onClick={resetGame} className="gap-2 bg-transparent">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats badges */}
      <div className="flex flex-wrap gap-4">
        <Badge variant="outline" className="gap-2 px-4 py-2 text-base">
          <Trophy className="h-4 w-4 text-future" />
          Score: {score}
        </Badge>
        <Badge variant="outline" className={cn("gap-2 px-4 py-2 text-base", combo > 0 && "bg-present-light")}>
          <Zap className="h-4 w-4 text-present" />
          Combo: x{combo + 1}
        </Badge>
        <Badge
          variant="outline"
          className={cn("gap-2 px-4 py-2 text-base", timeLeft < 10 && "bg-destructive/10 border-destructive")}
        >
          <Timer className="h-4 w-4" />
          Time: {timeLeft}s
        </Badge>
        <Badge variant="outline" className="gap-2 px-4 py-2 text-base">
          <Target className="h-4 w-4" />
          {correctCount}/{correctCount + wrongCount}
        </Badge>
      </div>

      {/* Current sentence to build */}
      <Card className={cn("border-2", colors.border)}>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground mb-1">Build this sentence:</p>
          <p className="text-lg font-medium">{currentSentence.native}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Click words in order:{" "}
            {currentSentence.words.map((w, i) => (
              <span
                key={i}
                className={cn(
                  "mx-1",
                  i < nextWordIndex && "line-through opacity-50",
                  i === nextWordIndex && "font-bold text-present",
                )}
              >
                {w}
              </span>
            ))}
          </p>
        </CardContent>
      </Card>

      {/* Game area */}
      <Card className={cn("border-2 overflow-hidden", isFullscreen && "flex-1")}>
        <CardContent className="p-0 h-full">
          <div
            ref={gameAreaRef}
            className={cn(
              "relative bg-gradient-to-b from-muted/30 to-muted/60",
              isFullscreen ? "h-full min-h-[300px]" : "h-[400px]",
              gameState === "paused" && "opacity-50",
            )}
          >
            {isFullscreen && (
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 z-10 gap-2"
              >
                <Minimize className="h-4 w-4" />
                Exit Fullscreen
              </Button>
            )}

            {fallingWords.map((fw) => {
              const isNextWord = fw.index === nextWordIndex
              const isClickable = fw.index === nextWordIndex

              return (
                <button
                  key={fw.id}
                  className={cn(
                    "absolute px-4 py-2 rounded-xl font-medium transition-all",
                    "bg-card border-2 shadow-lg",
                    isClickable ? "cursor-pointer hover:scale-110 hover:shadow-xl" : "cursor-not-allowed opacity-60",
                    isNextWord ? "ring-2 ring-present ring-offset-2" : "",
                    colors.border,
                    difficulty === "easy" && "text-xl px-6 py-3",
                    difficulty === "hard" && "text-sm px-3 py-1",
                  )}
                  style={{
                    left: fw.x,
                    top: fw.y,
                    transform: "translateX(-50%)",
                  }}
                  onClick={() => handleWordClick(fw.id, fw.word, fw.index)}
                  disabled={!isClickable}
                >
                  {fw.word}
                  {isNextWord && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-present rounded-full animate-ping" />
                  )}
                </button>
              )
            })}

            {/* Idle state overlay */}
            {gameState === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold">Word Rainfall</h3>
                  <p className="text-muted-foreground">Click words in order to build sentences</p>
                  <Button onClick={startGame} size="lg" className="gap-2">
                    <Play className="h-5 w-5" />
                    Start Playing
                  </Button>
                </div>
              </div>
            )}

            {/* Paused state overlay */}
            {gameState === "paused" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold">Paused</h3>
                  <Button onClick={pauseGame} size="lg" className="gap-2">
                    <Play className="h-5 w-5" />
                    Resume
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected words progress */}
      <Card className="border-2">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground mb-2">Your sentence:</p>
          <div className="flex flex-wrap gap-2 min-h-10">
            {selectedWords.length > 0 ? (
              selectedWords.map((word, i) => (
                <Badge key={i} className={cn("text-base px-4 py-2", colors.primary)}>
                  {word}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">Click falling words to build your sentence...</span>
            )}
          </div>
          <Progress value={(selectedWords.length / currentSentence.words.length) * 100} className="h-2 mt-4" />
        </CardContent>
      </Card>

      {/* End game dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="sm:max-w-md">
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
                <p className="text-3xl font-bold text-present">
                  {correctCount + wrongCount > 0 ? Math.round((correctCount / (correctCount + wrongCount)) * 100) : 0}%
                </p>
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

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={resetGame} className="gap-2 bg-transparent">
              <X className="h-4 w-4" />
              Close
            </Button>
            <Button
              onClick={() => {
                setShowEndDialog(false)
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
    </div>
  )
}
