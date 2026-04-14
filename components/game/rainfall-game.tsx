"use client"

import { useState, useEffect, useCallback, useRef, useMemo, type PointerEvent } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// import { cancelSpeech, speakText, preloadVoices } from "@/lib/speech" // Removed
import { useVoiceSettings } from "@/hooks/use-voice-settings" // Added
import { getDifficultyColors, type Difficulty } from "@/lib/difficulty-styles"
import { useChallenges } from "@/hooks/use-challenges"
import { useStreakContext } from "@/components/providers/streak-provider" // Added
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
import { type FallingWord, type GameSentence, type GameMode } from "./rainfall/types"
import verbData from "@/data/verb-forms.json" // Import verb data

type SentenceEntry = (typeof easySentences.sentences)[number]

const sentenceData: Record<Difficulty, SentenceEntry[]> = {
  easy: easySentences.sentences,
  medium: mediumSentences.sentences,
  hard: hardSentences.sentences,
}

const getInitialTime = (level: Difficulty) => (level === "easy" ? 60 : level === "medium" ? 120 : 180)

export function RainfallGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
  const [gameMode, setGameMode] = useState<GameMode>("sentence") // New state
  const [targetCategory, setTargetCategory] = useState<string>("Past Tense") // New state
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
  const { recordActivity } = useStreakContext() // Added

  // Use voice settings hook
  const { speak, stop } = useVoiceSettings()

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
        stop() // Use hook stop
      }
      return next
    })
  }, [stop])

  const speakWord = useCallback(
    (text: string) => {
      if (isMuted) return
      speak(text) // Use hook speak
    },
    [isMuted, speak],
  )

  useEffect(() => {
    // No need to preload via lib anymore, hook does it
    return () => {
      stop() // Cleanup switch
    }
  }, [stop])

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
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("msfullscreenchange", handleFullscreenChange)
    }
  }, [])

  const playBeep = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return

      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = "sine"
      osc.frequency.setValueAtTime(880, ctx.currentTime) // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1) // Drop to A4

      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } catch (e) {
      console.error("Audio error", e)
    }
  }, [])

  // Play beep on mission change
  useEffect(() => {
    if (gameState === "playing" && gameMode === "category") {
      playBeep()
    }
  }, [targetCategory, gameState, gameMode, playBeep])

  const spawnWords = useCallback(
    (sentence: GameSentence) => {
      if (!canvasRef.current || !gameAreaRef.current) return

      const rect = gameAreaRef.current.getBoundingClientRect()
      const width = rect.width
      const padding = 80

      let newWords: FallingWord[] = []

      if (gameMode === "sentence") {
        newWords = sentence.words.map((word, index) => ({
          id: `${Date.now()}-${index}-${Math.random()}`,
          word,
          x: padding + Math.random() * (width - padding * 2),
          y: -20 - index * 80 - Math.random() * 40,
          speed: baseSpeed + Math.random() * 30,
          index,
          removed: false,
        }))
      } else {
        // Category Mode Logic
        const categories = [
          { key: "past", label: "Past Tense" },
          { key: "pastParticiple", label: "Past Participle" },
          { key: "presentParticiple", label: "Present Participle (Ing)" }
        ]

        // Ensure we pick a new category if possible (pseudo-random but avoids repeat if possible)
        // Access current state via argument or just random. Ideally we track previous.
        // For now, simple random is fine, but let's make sure we explicitly set it.
        const catIndex = Math.floor(Math.random() * categories.length)
        const selectedCat = categories[catIndex]

        // Use a functional update or just set it.
        setTargetCategory(selectedCat.label)

        // Select 5 random verbs
        const allVerbs = verbData.verbs
        const selectedVerbs = []
        for (let i = 0; i < 5; i++) {
          selectedVerbs.push(allVerbs[Math.floor(Math.random() * allVerbs.length)])
        }

        newWords = selectedVerbs.map((verb, index) => {
          // Decide if this word should be a target or distractor
          // 40% chance of being a target
          const isTarget = Math.random() > 0.6
          let wordText = ""

          if (isTarget) {
            wordText = verb[selectedCat.key as keyof typeof verb]
          } else {
            // Pick a wrong form
            const forms = ["base", "past", "pastParticiple", "presentParticiple"].filter(k => k !== selectedCat.key)
            const wrongForm = forms[Math.floor(Math.random() * forms.length)]
            wordText = verb[wrongForm as keyof typeof verb]
          }

          return {
            id: `${Date.now()}-${index}-${Math.random()}`,
            word: wordText,
            x: padding + Math.random() * (width - padding * 2),
            y: -20 - index * 80 - Math.random() * 40,
            speed: baseSpeed + Math.random() * 30,
            index, // Not used for ordering in this mode
            removed: false,
            isTarget: isTarget
          }
        })

        // Ensure at least one target in the new batch if none were randomly selected
        if (!newWords.some(w => w.isTarget)) {
          const randomIdx = Math.floor(Math.random() * newWords.length);
          // Force it to be a correct form
          const verb = allVerbs[Math.floor(Math.random() * allVerbs.length)];
          newWords[randomIdx].word = verb[selectedCat.key as keyof typeof verb];
          newWords[randomIdx].isTarget = true;
        }
      }

      if (gameMode === "sentence") {
        wordsStateRef.current = newWords;
      } else {
        // In Category mode, append new words to allow overlap (continuous flow)
        wordsStateRef.current = [...wordsStateRef.current, ...newWords];
      }

      nextWordIndexRef.current = 0
      setNextWordIndex(0)
      needsRespawnRef.current = false
    },
    [baseSpeed, gameMode],
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

          if (gameMode === "sentence") {
            if (fw.index === nextWordIndexRef.current) {
              fw.removed = true
              fw.opacity = 1
              fw.scale = 1
              setSelectedWords((prev) => [...prev, fw.word])
              setNextWordIndex((prev) => prev + 1)
              nextWordIndexRef.current++
            }
          } else {
            // Category mode logic
            fw.removed = true
            fw.opacity = 1
            fw.scale = 1

            if (fw.isTarget) {
              // Correct catch
              fw.isCorrectlyCaught = true
              setScore((prev) => prev + (10 + combo * 5))
              setCombo((prev) => prev + 1)
              setCorrectCount((prev) => prev + 1)
              // Visual feedback could be added here
            } else {
              // Wrong catch
              fw.isCorrectlyCaught = false
              setCombo(0)
              setWrongCount((prev) => prev + 1)
              setScore(prev => Math.max(0, prev - 5))
            }
          }
          break
        }
      }
    },
    [gameState, difficulty, speakWord, gameMode, combo],
  )

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      event.preventDefault()
      handleWordClick(event.clientX, event.clientY)
    },
    [handleWordClick],
  )

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

      // cleanup off-screen or faded out words to prevent array growing indefinitely
      if (gameMode === 'category') {
        wordsStateRef.current = wordsStateRef.current.filter(fw => {
          const isFadedOut = fw.removed && (fw.opacity || 0) <= 0;
          const isOffScreen = fw.y > canvas.height + 100;
          return !isFadedOut && !isOffScreen;
        });
      }

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

        const isTargetHighlight = gameMode === 'category' ? fw.isTarget : isNextWord;

        let fillColor = CARD_COLOR
        if (fw.removed && gameMode === 'category' && fw.isCorrectlyCaught !== undefined) {
          if (fw.isCorrectlyCaught) fillColor = "#10b981" // Green
          else fillColor = "#ef4444" // Red
        }

        ctx.fillStyle = fillColor

        ctx.strokeStyle = isNextWord && gameMode === 'sentence' ? PRESENT_COLOR : BORDER_COLOR
        ctx.lineWidth = isNextWord && gameMode === 'sentence' ? 3 : 2

        const radius = 12
        ctx.beginPath()
        ctx.roundRect(x, y, wordWidth, wordHeight, radius)
        ctx.fill()
        ctx.stroke()

        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0

        if (isNextWord && !fw.removed && gameMode === 'sentence') {
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

        ctx.fillStyle = isNextWord && gameMode === 'sentence' ? PRESENT_COLOR : FOREGROUND_COLOR
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(fw.word, fw.x, y + wordHeight / 2)

        ctx.restore()
        ctx.globalAlpha = 1
      })

      // Only trigger respawn if there are active (non-removed) words that have all fallen
      if (allFallen && hasActiveWords && wordsStateRef.current.length > 0) {
        needsRespawnRef.current = true
      } else if (gameMode === 'category') {
        // Continuous Flow Logic: 
        // Respawn as soon as there are NO active targets left on screen.
        // This means players never wait for distractors to fall.
        const hasActiveTargets = wordsStateRef.current.some(w => w.isTarget && !w.removed && w.y < canvas.height + 50);

        // Also safeguard: if list is empty (cleaned up), spawn.
        if (!hasActiveTargets || wordsStateRef.current.length === 0) {
          needsRespawnRef.current = true
        }
      }

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState, difficulty, gameMode])

  useEffect(() => {
    if (gameState !== "playing") return

    const checkRespawn = setInterval(() => {
      if (needsRespawnRef.current) {
        if (gameMode === "sentence") {
          setWrongCount((prev) => prev + 1)
          setCombo(0)
        } else {
          // Category Mode: Penalize only if active targets fell
          const anyActiveTargets = wordsStateRef.current.some(w => w.isTarget && !w.removed)
          if (anyActiveTargets) {
            setWrongCount((prev) => prev + 1)
            setCombo(0)
          }
        }

        setSelectedWords([])
        spawnWords(currentSentence)
      }
    }, 100)

    return () => clearInterval(checkRespawn)
  }, [gameState, currentSentence, spawnWords, gameMode])

  // Track if current sentence was already processed to prevent double counting
  const sentenceProcessedRef = useRef(false)

  // Update effect for GAME LOOP progression (sentence completion vs infinite spawn)
  useEffect(() => {
    if (gameState !== "playing") return

    // Sentence Mode Progression
    if (gameMode === "sentence") {
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
    }
    // Category Mode Progression
    else {
      // In category mode, we just check if we need to respawn because screen is empty
      // The generic "needsRespawnRef" check in the other useEffect handles this 
      // (lines 419-425 in original file)
      // We just need to make sure we don't trigger sentence logic.
    }
  }, [selectedWords, currentSentence, combo, difficulty, currentSentenceIndex, currentSentences, spawnWords, gameState, gameMode])

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
      // Record streak activity
      recordActivity()
      // Check for perfect score (no wrong answers)
      if (correctCount > 0 && wrongCount === 0) {
        recordPerfectScore()
      }
    }
  }, [gameState, score, correctCount, wrongCount, recordRainfallScore, recordPerfectScore, recordActivity])

  useEffect(() => {
    if (gameState === "ended") {
      setShowEndDialog(true)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [gameState])

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
    // In category mode, we ignore the sentence arg efficiently inside spawnWords
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
          gameMode={gameMode} // Pass Prop
          onGameModeChange={(mode) => {
            setGameMode(mode)
            resetGame()
          }} // Pass Prop
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

        <SentenceCard
          sentence={currentSentence}
          nextWordIndex={nextWordIndex}
          borderClass={colors.border}
          className={cn("lg:block md:block", isFullscreen ? "hidden" : "block")}
          gameMode={gameMode}
          targetCategory={targetCategory}
          examples={
            targetCategory === "Past Tense" ? ["Went", "Ate", "Saw"] :
              targetCategory === "Past Participle" ? ["Gone", "Eaten", "Seen"] :
                targetCategory === "Present Participle (Ing)" ? ["Going", "Eating", "Seeing"] :
                  []
          }
        />

        {gameMode === "sentence" && (
          <SelectedWordsCard
            words={selectedWords}
            totalWords={currentSentence.words.length}
            primaryClass={colors.primary}
            size="compact"
          />
        )}
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
            <SentenceCard
              sentence={currentSentence}
              nextWordIndex={nextWordIndex}
              borderClass={colors.border}
              gameMode={gameMode}
              targetCategory={targetCategory}
              examples={
                targetCategory === "Past Tense" ? ["Went", "Ate", "Saw"] :
                  targetCategory === "Past Participle" ? ["Gone", "Eaten", "Seen"] :
                    targetCategory === "Present Participle (Ing)" ? ["Going", "Eating", "Seeing"] :
                      []
              }
            />
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
