"use client"

import { useState, useEffect, useCallback, useRef, useMemo, type PointerEvent } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { cancelSpeech, speakText, preloadVoices } from "@/lib/speech"
import { getDifficultyColors, type Difficulty } from "@/lib/difficulty-styles"
import { useChallenges } from "@/hooks/use-challenges"
import { X } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import easySentences from "@/data/sentence/easy.json"
import mediumSentences from "@/data/sentence/medium.json"
import hardSentences from "@/data/sentence/hard.json"
import { ControlsHeader } from "./rainfall/controls-header"
import { EndGameDialog } from "./rainfall/end-game-dialog"
import { GameArea } from "./rainfall/game-area"
import { SelectedWordsCard } from "./rainfall/selected-words-card"
import { SentenceCard } from "./rainfall/sentence-card"
import { StatsBadges } from "./rainfall/stats-badges"
import { type FallingWord, type GameSentence } from "./rainfall/types"

type SentenceEntry = (typeof easySentences.sentences)[number]

const sentenceData: Record<Difficulty, SentenceEntry[]> = {
  easy: easySentences.sentences,
  medium: mediumSentences.sentences,
  hard: hardSentences.sentences,
}

const getInitialTime = (level: Difficulty) => (level === "easy" ? 60 : level === "medium" ? 120 : 180)

export function RainfallGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "ended">("idle")
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(getInitialTime("easy"))
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [nextWordIndex, setNextWordIndex] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const { language } = useLanguage()
  const { recordRainfallScore, recordPerfectScore, recordSectionVisit } = useChallenges()

  // Track section visit for Explorer badge
  useEffect(() => {
    recordSectionVisit("rainfall")
  }, [recordSectionVisit])

  const gameAreaRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const needsRespawnRef = useRef(false)
  const wordsStateRef = useRef<FallingWord[]>([])
  const nextWordIndexRef = useRef(0)

  const baseSentences = sentenceData[difficulty]
  const currentSentences = useMemo<GameSentence[]>(
    () =>
      baseSentences.map((entry) => ({
        native: entry.translations[language as keyof typeof entry.translations] ?? entry.translations.en,
        english: entry.translations.en,
        words: entry.wordBank,
      })),
    [baseSentences, language],
  )
  const currentSentence = currentSentences[currentSentenceIndex % currentSentences.length]
  const colors = getDifficultyColors(difficulty)

  const baseSpeed = difficulty === "easy" ? 80 : difficulty === "medium" ? 85 : 90

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

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      if (next) {
        cancelSpeech()
      }
      return next
    })
  }, [])

  const speakWord = useCallback(
    (text: string) => {
      speakText(text, {
        rate: difficulty === "hard" ? 0.85 : 0.9,
        pitch: 1,
        preferredLangs: ["en-IN", "en-GB", "en-US"],
        muted: isMuted,
        allowQueue: true,
      })
    },
    [difficulty, isMuted],
  )

  useEffect(() => {
    preloadVoices()
    return () => {
      cancelSpeech()
    }
  }, [])

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
      if (!canvasRef.current || !gameAreaRef.current) return

      const rect = gameAreaRef.current.getBoundingClientRect()
      const width = rect.width
      const padding = 80

      const newWords: FallingWord[] = sentence.words.map((word, index) => ({
        id: `${Date.now()}-${index}-${Math.random()}`,
        word,
        x: padding + Math.random() * (width - padding * 2),
        y: -60 - index * 100 - Math.random() * 50,
        speed: baseSpeed + Math.random() * 30,
        index,
        removed: false,
      }))

      wordsStateRef.current = newWords
      nextWordIndexRef.current = 0
      setNextWordIndex(0)
      needsRespawnRef.current = false
    },
    [baseSpeed],
  )

  const handleWordClick = useCallback(
    (clientX: number, clientY: number) => {
      if (gameState !== "playing" || !canvasRef.current) return

      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const clickX = clientX - rect.left
      const clickY = clientY - rect.top

      for (let i = wordsStateRef.current.length - 1; i >= 0; i--) {
        const fw = wordsStateRef.current[i]
        if (fw.removed) continue

        const ctx = canvas.getContext("2d")
        if (!ctx) continue

        const fontSize = difficulty === "easy" ? 24 : difficulty === "medium" ? 18 : 16
        const paddingX = difficulty === "easy" ? 24 : 16
        const paddingY = difficulty === "easy" ? 12 : 8

        ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`
        const metrics = ctx.measureText(fw.word)
        const wordWidth = metrics.width + paddingX * 2
        const wordHeight = fontSize + paddingY * 2

        const wordLeft = fw.x - wordWidth / 2
        const wordRight = fw.x + wordWidth / 2
        const wordTop = fw.y
        const wordBottom = fw.y + wordHeight

        if (clickX >= wordLeft && clickX <= wordRight && clickY >= wordTop && clickY <= wordBottom) {
          speakWord(fw.word)
          if (fw.index === nextWordIndexRef.current) {
            fw.removed = true
            fw.opacity = 1
            fw.scale = 1
            setSelectedWords((prev) => [...prev, fw.word])
            setNextWordIndex((prev) => prev + 1)
            nextWordIndexRef.current++
          }
          break
        }
      }
    },
    [gameState, difficulty, speakWord],
  )

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      event.preventDefault()
      handleWordClick(event.clientX, event.clientY)
    },
    [handleWordClick],
  )

  useEffect(() => {
    if (gameState !== "playing" || !canvasRef.current) {
      if (animationRef.current && gameState !== "playing") {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const CARD_COLOR = "#ffffff"
    const BORDER_COLOR = "#64748b"
    const PRESENT_COLOR = "#10b981"
    const FOREGROUND_COLOR = "#1e293b"

    let lastTime = performance.now()

    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.02)")
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.05)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      let allFallen = true
      let hasActiveWords = false
      const fontSize = difficulty === "easy" ? 24 : difficulty === "medium" ? 18 : 16
      const paddingX = difficulty === "easy" ? 24 : 16
      const paddingY = difficulty === "easy" ? 12 : 8

      ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`

      wordsStateRef.current.forEach((fw) => {
        if (fw.removed) {
          if (fw.opacity === undefined) fw.opacity = 1
          if (fw.scale === undefined) fw.scale = 1

          fw.opacity -= deltaTime * 4
          fw.scale += deltaTime * 2

          if (fw.opacity <= 0) return
        } else {
          fw.y += fw.speed * deltaTime
          if (fw.scale === undefined) fw.scale = 1
          if (fw.opacity === undefined) fw.opacity = 1

          // Only check non-removed words for falling status
          hasActiveWords = true
          if (fw.y <= canvas.height + 50) {
            allFallen = false
          }

          if (fw.y < -100 || fw.y > canvas.height + 100) return
        }

        const isNextWord = fw.index === nextWordIndexRef.current

        const metrics = ctx.measureText(fw.word)
        const wordWidth = metrics.width + paddingX * 2
        const wordHeight = fontSize + paddingY * 2

        const x = fw.x - wordWidth / 2
        const y = fw.y

        ctx.globalAlpha = fw.opacity || 1

        ctx.save()

        const centerX = fw.x
        const centerY = y + wordHeight / 2
        const scale = fw.scale || 1

        ctx.translate(centerX, centerY)
        ctx.scale(scale, scale)
        ctx.translate(-centerX, -centerY)

        ctx.shadowColor = "rgba(0, 0, 0, 0.15)"
        ctx.shadowBlur = 8
        ctx.shadowOffsetY = 3

        ctx.fillStyle = CARD_COLOR
        ctx.strokeStyle = isNextWord ? PRESENT_COLOR : BORDER_COLOR
        ctx.lineWidth = isNextWord ? 3 : 2

        const radius = 12
        ctx.beginPath()
        ctx.roundRect(x, y, wordWidth, wordHeight, radius)
        ctx.fill()
        ctx.stroke()

        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0

        if (isNextWord && !fw.removed) {
          const dotSize = 6 + Math.sin(currentTime * 0.008) * 2
          const glowSize = 3 + Math.sin(currentTime * 0.008) * 1

          ctx.shadowColor = PRESENT_COLOR
          ctx.shadowBlur = glowSize

          ctx.fillStyle = PRESENT_COLOR
          ctx.beginPath()
          ctx.arc(x + wordWidth + 8, y + 8, dotSize, 0, Math.PI * 2)
          ctx.fill()

          ctx.shadowBlur = 0
        }

        ctx.fillStyle = isNextWord ? PRESENT_COLOR : FOREGROUND_COLOR
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(fw.word, fw.x, y + wordHeight / 2)

        ctx.restore()
        ctx.globalAlpha = 1
      })

      // Only trigger respawn if there are active (non-removed) words that have all fallen
      if (allFallen && hasActiveWords && wordsStateRef.current.length > 0) {
        needsRespawnRef.current = true
      }

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState, difficulty])

  useEffect(() => {
    const updateCanvasSize = () => {
      if (!canvasRef.current || !gameAreaRef.current) return

      const rect = gameAreaRef.current.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      canvasRef.current.style.width = `${rect.width}px`
      canvasRef.current.style.height = `${rect.height}px`

      canvasRef.current.width = rect.width * dpr
      canvasRef.current.height = rect.height * dpr

      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    return () => window.removeEventListener("resize", updateCanvasSize)
  }, [isFullscreen])

  useEffect(() => {
    if (gameState !== "playing") return

    const checkRespawn = setInterval(() => {
      if (needsRespawnRef.current) {
        setWrongCount((prev) => prev + 1)
        setCombo(0)
        setSelectedWords([])
        spawnWords(currentSentence)
      }
    }, 100)

    return () => clearInterval(checkRespawn)
  }, [gameState, currentSentence, spawnWords])

  // Track if score was recorded to prevent double recording
  const scoreRecordedRef = useRef(false)

  useEffect(() => {
    if (gameState !== "playing") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Handle game end when time runs out
  useEffect(() => {
    if (gameState === "playing" && timeLeft <= 0) {
      setGameState("ended")
      setShowEndDialog(true)
      setIsSidebarOpen(false)
    }
  }, [gameState, timeLeft])

  // Record score when game ends
  useEffect(() => {
    if (gameState === "ended" && !scoreRecordedRef.current) {
      scoreRecordedRef.current = true
      // Record the score for daily challenge
      recordRainfallScore(score)
      // Check for perfect score (no wrong answers)
      if (correctCount > 0 && wrongCount === 0) {
        recordPerfectScore()
      }
    }
  }, [gameState, score, correctCount, wrongCount, recordRainfallScore, recordPerfectScore])

  useEffect(() => {
    if (gameState === "ended") {
      setShowEndDialog(true)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [gameState])

  // Track if current sentence was already processed to prevent double counting
  const sentenceProcessedRef = useRef(false)

  useEffect(() => {
    if (gameState !== "playing") return

    if (selectedWords.length === currentSentence.words.length && !sentenceProcessedRef.current) {
      sentenceProcessedRef.current = true
      const isCorrect = selectedWords.join(" ") === currentSentence.english

      if (isCorrect) {
        setScore((prev) => prev + (10 + combo * 5) * (difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3))
        setCombo((prev) => prev + 1)
        setCorrectCount((prev) => prev + 1)
      } else {
        setCombo(0)
        setWrongCount((prev) => prev + 1)
      }

      const nextIndex = currentSentenceIndex + 1
      const nextSentence = currentSentences[nextIndex % currentSentences.length]

      setTimeout(() => {
        setSelectedWords([])
        setCurrentSentenceIndex(nextIndex)
        spawnWords(nextSentence)
        sentenceProcessedRef.current = false
      }, 500)
    }
  }, [selectedWords, currentSentence, combo, difficulty, currentSentenceIndex, currentSentences, spawnWords, gameState])

  const startGame = useCallback(() => {
    setGameState("playing")
    setScore(0)
    setCombo(0)
    setTimeLeft(getInitialTime(difficulty))
    setSelectedWords([])
    setCurrentSentenceIndex(0)
    setCorrectCount(0)
    setWrongCount(0)
    setNextWordIndex(0)
    setShowEndDialog(false)
    setIsSidebarOpen(false)
    needsRespawnRef.current = false
    scoreRecordedRef.current = false
    sentenceProcessedRef.current = false

    const firstSentence = currentSentences[0]
    setTimeout(() => spawnWords(firstSentence), 100)

    if (!isFullscreen && fullscreenContainerRef.current) {
      toggleFullscreen()
    }
  }, [currentSentences, difficulty, spawnWords, isFullscreen, toggleFullscreen])

  const pauseGame = useCallback(() => {
    setGameState((prev) => (prev === "playing" ? "paused" : "playing"))
  }, [])

  const resetGame = useCallback(
    (targetDifficulty?: Difficulty) => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      setGameState("idle")
      setScore(0)
      setCombo(0)
      setTimeLeft(getInitialTime(targetDifficulty ?? difficulty))
      setSelectedWords([])
      setCurrentSentenceIndex(0)
      scoreRecordedRef.current = false
      sentenceProcessedRef.current = false
      setNextWordIndex(0)
      setShowEndDialog(false)
      needsRespawnRef.current = false
      wordsStateRef.current = []
      nextWordIndexRef.current = 0
      if (isFullscreen) {
        toggleFullscreen()
      }
    },
    [difficulty, isFullscreen, toggleFullscreen],
  )

  return (
    <div
      ref={fullscreenContainerRef}
      className={cn(
        "space-y-6",
        isFullscreen && "fixed inset-0 z-40 bg-background overflow-hidden",
        isFullscreen && "lg:grid lg:grid-cols-[320px_1fr] lg:gap-4 lg:p-4",
        isFullscreen && "md:grid md:grid-cols-[280px_1fr] md:gap-3 md:p-3",
        isFullscreen && "p-2",
      )}
    >
      <div
        className={cn(
          "space-y-4",
          isFullscreen && "lg:overflow-y-auto lg:pr-2",
          isFullscreen && "md:overflow-y-auto md:pr-2",
          isFullscreen &&
            "absolute left-0 top-0 bottom-0 bg-background/95 backdrop-blur z-20 transition-transform duration-300 overflow-y-auto p-4 w-72 border-r",
          isFullscreen && !isSidebarOpen && "-translate-x-full",
          isFullscreen && isSidebarOpen && "translate-x-0 mt-15",
          isFullscreen && "lg:relative lg:translate-x-0 lg:w-auto lg:border-0 lg:bg-transparent lg:backdrop-blur-none",
          isFullscreen && "md:relative md:translate-x-0 md:w-auto md:border-0 md:bg-transparent md:backdrop-blur-none",
        )}
      >
        <ControlsHeader
          difficulty={difficulty}
          onDifficultyChange={(d) => {
            setDifficulty(d)
            resetGame(d)
          }}
          difficultyDisabled={gameState === "playing" || gameState === "paused"}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          isMuted={isMuted}
          toggleMute={toggleMute}
          gameState={gameState}
          startGame={startGame}
          pauseGame={pauseGame}
          resetGame={resetGame}
        />

        <StatsBadges
          score={score}
          combo={combo}
          timeLeft={timeLeft}
          correctCount={correctCount}
          wrongCount={wrongCount}
        />

        <SentenceCard sentence={currentSentence} nextWordIndex={nextWordIndex} borderClass={colors.border} className={cn("lg:block md:block", isFullscreen ? "hidden" : "block")} />

        <SelectedWordsCard
          words={selectedWords}
          totalWords={currentSentence.words.length}
          primaryClass={colors.primary}
          size="compact"
        />
      </div>

      <div className={cn(isFullscreen ? "" : "space-y-6", isFullscreen && "relative h-full flex flex-col")}>
        {isFullscreen && (
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden md:hidden absolute top-2 left-2 z-30 h-10 w-10"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </Button>
        )}

        {isFullscreen && isSidebarOpen && (
          <div className="lg:hidden md:hidden fixed inset-0 bg-black/50 z-10" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Sentence Card at top in fullscreen on mobile */}
        {isFullscreen && (
          <div className="lg:hidden md:hidden pt-14 pb-2 px-2">
            <SentenceCard sentence={currentSentence} nextWordIndex={nextWordIndex} borderClass={colors.border} />
          </div>
        )}

        <GameArea
          gameAreaRef={gameAreaRef}
          canvasRef={canvasRef}
          gameState={gameState}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          handlePointerDown={handlePointerDown}
          startGame={startGame}
          pauseGame={pauseGame}
          sentence={currentSentence}
          nextWordIndex={nextWordIndex}
          borderClass={colors.border}
        />

        {!isFullscreen && (
          <SelectedWordsCard
            words={selectedWords}
            totalWords={currentSentence.words.length}
            primaryClass={colors.primary}
            size="regular"
          />
        )}
      </div>

      <EndGameDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        score={score}
        correctCount={correctCount}
        wrongCount={wrongCount}
        resetGame={resetGame}
        startGame={startGame}
        container={fullscreenContainerRef.current}
      />
    </div>
  )
}
