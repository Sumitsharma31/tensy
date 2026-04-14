"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DifficultyTabs } from "@/components/common/difficulty-tabs"
import { AudioButton } from "@/components/common/audio-button"
import { useLanguage } from "@/components/providers/language-provider"
import { useChallenges } from "@/hooks/use-challenges"
import easySentences from "@/data/sentence/easy.json"
import mediumSentences from "@/data/sentence/medium.json"
import hardSentences from "@/data/sentence/hard.json"
import { cn } from "@/lib/utils"
import { getDifficultyStyles, getDifficultyColors, type Difficulty } from "@/lib/difficulty-styles"
import { Check, X, RotateCcw, ArrowRight, Trophy, Zap, RefreshCcw } from "lucide-react"
type SentenceEntry = (typeof easySentences.sentences)[number]

const sentences: Record<Difficulty, SentenceEntry[]> = {
  easy: easySentences.sentences,
  medium: mediumSentences.sentences,
  hard: hardSentences.sentences,
}

const QUESTIONS_PER_SESSION = 10

function selectRandomSentences(level: Difficulty) {
  const pool = sentences[level]
  const sessionSize = Math.min(QUESTIONS_PER_SESSION, pool.length)
  return shuffleArray(pool).slice(0, sessionSize)
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function SentenceBuilderGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [currentSentences, setCurrentSentences] = useState<SentenceEntry[]>([])
  const [showScoreboard, setShowScoreboard] = useState(false)
  const { language } = useLanguage()
  const { recordSentenceBuilt, recordPerfectScore, recordSectionVisit } = useChallenges()

  // Initialize random questions on client-side only to prevent hydration mismatch
  useEffect(() => {
    setCurrentSentences(selectRandomSentences("easy"))
  }, [])

  // Track section visit for Explorer badge
  useEffect(() => {
    recordSectionVisit("builder")
  }, [recordSectionVisit])

  const currentSentence = currentSentences[currentIndex]
  const englishSentence = currentSentence?.translations.en || ""
  const nativeSentence = currentSentence?.translations[language as keyof typeof currentSentence.translations] ?? englishSentence
  const sentenceWords = currentSentence?.wordBank || []
  const progress = currentSentences.length > 0 ? ((currentIndex + 1) / currentSentences.length) * 100 : 0
  const pointsPerCorrect = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 30
  const correctAnswers = pointsPerCorrect ? Math.round(score / pointsPerCorrect) : 0
  const questionCount = currentSentences.length
  const accuracy = questionCount > 0 ? Math.round((correctAnswers / questionCount) * 100) : 0

  const styles = getDifficultyStyles(difficulty)
  const colors = getDifficultyColors(difficulty)

  const startNewSession = useCallback((level: Difficulty) => {
    const freshSentences = selectRandomSentences(level)
    setCurrentSentences(freshSentences)
    setCurrentIndex(0)
    setScore(0)
    setStreak(0)
    setSelectedWords([])
    setAvailableWords([])
    setIsCorrect(null)
    setShowResult(false)
    setShowScoreboard(false)
  }, [])

  // Initialize available words when sentence changes
  useEffect(() => {
    setAvailableWords(shuffleArray(sentenceWords))
    setSelectedWords([])
    setIsCorrect(null)
    setShowResult(false)
  }, [currentSentence, sentenceWords])

  useEffect(() => {
    startNewSession(difficulty)
  }, [difficulty, startNewSession])

  const handleWordSelect = useCallback((word: string, index: number) => {
    setSelectedWords((prev) => [...prev, word])
    setAvailableWords((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleWordRemove = useCallback((word: string, index: number) => {
    setSelectedWords((prev) => prev.filter((_, i) => i !== index))
    // Add back to available words (shuffled position)
    setAvailableWords((prev) => {
      const newWords = [...prev]
      const randomIndex = Math.floor(Math.random() * (newWords.length + 1))
      newWords.splice(randomIndex, 0, word)
      return newWords
    })
  }, [])

  const checkAnswer = useCallback(() => {
    const userSentence = selectedWords.join(" ")
    const correct = userSentence === englishSentence

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore((prev) => prev + (difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 30))
      setStreak((prev) => prev + 1)
      // Record correct sentence for daily challenge
      recordSentenceBuilt()
    } else {
      setStreak(0)
    }
    if (currentIndex === currentSentences.length - 1) {
      setShowScoreboard(true)
      // Check for perfect score (all correct)
      const finalCorrectAnswers = correct ? correctAnswers + 1 : correctAnswers
      if (finalCorrectAnswers === currentSentences.length) {
        recordPerfectScore()
      }
    }
  }, [selectedWords, englishSentence, difficulty, currentIndex, currentSentences.length, recordSentenceBuilt, correctAnswers, recordPerfectScore])

  const nextSentence = useCallback(() => {
    if (currentIndex < currentSentences.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [currentIndex, currentSentences.length])

  const resetCurrent = useCallback(() => {
    setAvailableWords(shuffleArray(sentenceWords))
    setSelectedWords([])
    setIsCorrect(null)
    setShowResult(false)
  }, [currentSentence, sentenceWords])

  const handleSessionReset = useCallback(() => {
    startNewSession(difficulty)
  }, [difficulty, startNewSession])

  if (currentSentences.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", styles.container)}>
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <DifficultyTabs
          value={difficulty}
          onValueChange={(d) => {
            setDifficulty(d)
          }}
          className="w-full sm:w-auto"
        />

        <div className="flex items-center gap-2 sm:gap-4">
          <Badge variant="outline" className="gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-future" />
            Score: {score}
          </Badge>
          <Badge variant="outline" className={cn("gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm", streak > 0 && "bg-present-light border-present")}>
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-present" />
            Streak: {streak}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
          <span>
            Question {currentIndex + 1} of {currentSentences.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main game area */}
      <Card className={cn("border-2", styles.card)}>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center justify-between text-sm sm:text-base">
            <div className="flex flex-col gap-0.5 sm:gap-1">
              <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider">
                {currentSentence.tense?.name || "Sentence Challenge"}
              </span>
              <span className="font-normal text-muted-foreground">
                {currentSentence.builderPrompt || "Translate this sentence:"}
              </span>
            </div>
            <AudioButton text={englishSentence} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Native sentence */}
          <div className={cn("p-3 sm:p-4 rounded-xl text-center", colors.light)}>
            <p
              className={cn(
                "font-medium",
                difficulty === "easy" ? "text-lg sm:text-2xl" : difficulty === "medium" ? "text-base sm:text-xl" : "text-sm sm:text-lg",
              )}
            >
              {nativeSentence}
            </p>
          </div>

          {/* Selected words area */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground">Your sentence:</p>
            <div
              className={cn(
                "min-h-16 sm:min-h-20 p-3 sm:p-4 border-2 border-dashed rounded-xl flex flex-wrap gap-1.5 sm:gap-2 items-center",
                selectedWords.length === 0 && "justify-center",
                isCorrect === true && "border-present bg-present-light",
                isCorrect === false && "border-destructive bg-destructive/10",
              )}
            >
              {selectedWords.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground text-center">Click words below to build your sentence...</p>
              ) : (
                selectedWords.map((word, index) => (
                  <Button
                    key={`${word}-${index}`}
                    variant="secondary"
                    size="sm"
                    className={cn(
                      "transition-all text-xs sm:text-sm h-8 sm:h-9",
                      styles.button,
                      difficulty === "easy" && "sm:text-lg sm:px-6",
                      difficulty === "hard" && "text-xs sm:px-3",
                    )}
                    onClick={() => handleWordRemove(word, index)}
                    disabled={showResult}
                  >
                    {word}
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Available words */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground">Available words:</p>
            <div
              className={cn(
                "p-3 sm:p-4 bg-muted/50 rounded-xl flex flex-wrap gap-1.5 sm:gap-2",
                difficulty === "easy" && "sm:gap-3",
                difficulty === "hard" && "gap-1.5 sm:gap-2",
              )}
            >
              {availableWords.map((word, index) => (
                <Button
                  key={`${word}-${index}`}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "transition-all hover:scale-105 text-xs sm:text-sm h-8 sm:h-9",
                    styles.button,
                    colors.primary.replace("bg-", "hover:bg-").replace("text-", "hover:text-"),
                    difficulty === "easy" && "sm:text-lg sm:px-6",
                    difficulty === "hard" && "text-xs sm:px-3",
                  )}
                  onClick={() => handleWordSelect(word, index)}
                  disabled={showResult}
                >
                  {word}
                </Button>
              ))}
            </div>
          </div>

          {/* Result message */}
          {showResult && (
            <div
              className={cn(
                "p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3",
                isCorrect ? "bg-present-light" : "bg-destructive/10",
              )}
            >
              {isCorrect ? (
                <>
                  <Check className="h-5 w-5 sm:h-6 sm:w-6 text-present shrink-0" />
                  <div>
                    <p className="font-semibold text-sm sm:text-base text-present">Excellent!</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      +{difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 30} points
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <X className="h-5 w-5 sm:h-6 sm:w-6 text-destructive shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-destructive">Not quite right</p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">Correct: {englishSentence}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={resetCurrent}
              className="gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm h-9 sm:h-10"
              disabled={selectedWords.length === 0 || showScoreboard}
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              Reset
            </Button>
            {!showResult ? (
              <Button
                onClick={checkAnswer}
                size="sm"
                className={cn("flex-1 gap-1 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10", colors.primary)}
                disabled={selectedWords.length !== sentenceWords.length}
              >
                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                Check Answer
              </Button>
            ) : (
              <Button
                onClick={currentIndex < currentSentences.length - 1 ? nextSentence : handleSessionReset}
                size="sm"
                className="flex-1 gap-1 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10"
              >
                {currentIndex < currentSentences.length - 1 ? (
                  <>
                    Next Sentence
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </>
                ) : (
                  <>
                    New Random Questions
                    <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showScoreboard && (
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-future" />
              Session Scoreboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You completed all {questionCount} questions on the {difficulty} track.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">Total Score</p>
                <p className="text-3xl font-bold text-future">{score}</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-3xl font-bold text-present">{accuracy}%</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">Correct Answers</p>
                <p className="text-3xl font-bold">
                  {correctAnswers}/{questionCount}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">Final streak this round</p>
              <p className="text-2xl font-semibold text-present">{streak}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
