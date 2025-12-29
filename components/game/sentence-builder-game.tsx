"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DifficultyTabs } from "@/components/common/difficulty-tabs"
import { AudioButton } from "@/components/common/audio-button"
import { cn } from "@/lib/utils"
import { getDifficultyStyles, getDifficultyColors, type Difficulty } from "@/lib/difficulty-styles"
import { Check, X, RotateCcw, ArrowRight, Trophy, Zap } from "lucide-react"

interface Sentence {
  id: string
  native: string
  english: string
  words: string[]
}

const sentences: Record<Difficulty, Sentence[]> = {
  easy: [
    { id: "e1", native: "मैं चाय पीता हूँ।", english: "I drink tea.", words: ["I", "drink", "tea."] },
    { id: "e2", native: "वह स्कूल जाती है।", english: "She goes to school.", words: ["She", "goes", "to", "school."] },
    { id: "e3", native: "हम खेलते हैं।", english: "We play games.", words: ["We", "play", "games."] },
    { id: "e4", native: "वे गाते हैं।", english: "They sing songs.", words: ["They", "sing", "songs."] },
    { id: "e5", native: "कुत्ता भौंकता है।", english: "The dog barks.", words: ["The", "dog", "barks."] },
  ],
  medium: [
    {
      id: "m1",
      native: "मैं अभी पढ़ रहा हूँ।",
      english: "I am studying now.",
      words: ["I", "am", "studying", "now."],
    },
    {
      id: "m2",
      native: "वह कल आएगा।",
      english: "He will come tomorrow.",
      words: ["He", "will", "come", "tomorrow."],
    },
    {
      id: "m3",
      native: "हमने मैच जीता।",
      english: "We won the match.",
      words: ["We", "won", "the", "match."],
    },
    {
      id: "m4",
      native: "वे खाना खा रहे हैं।",
      english: "They are eating food.",
      words: ["They", "are", "eating", "food."],
    },
    {
      id: "m5",
      native: "मैंने किताब पढ़ी।",
      english: "I have read the book.",
      words: ["I", "have", "read", "the", "book."],
    },
  ],
  hard: [
    {
      id: "h1",
      native: "अगर वह आता तो मैं उससे मिलता।",
      english: "If he had come, I would have met him.",
      words: ["If", "he", "had", "come,", "I", "would", "have", "met", "him."],
    },
    {
      id: "h2",
      native: "जब तक तुम आओगे, मैं जा चुका हूँगा।",
      english: "By the time you arrive, I will have left.",
      words: ["By", "the", "time", "you", "arrive,", "I", "will", "have", "left."],
    },
    {
      id: "h3",
      native: "वह दो घंटे से इंतज़ार कर रहा था।",
      english: "He had been waiting for two hours.",
      words: ["He", "had", "been", "waiting", "for", "two", "hours."],
    },
    {
      id: "h4",
      native: "मुझे बताया गया था कि वह आ रही है।",
      english: "I had been told that she was coming.",
      words: ["I", "had", "been", "told", "that", "she", "was", "coming."],
    },
    {
      id: "h5",
      native: "2025 तक वह यहाँ 10 साल काम कर चुकी होगी।",
      english: "By 2025, she will have been working here for 10 years.",
      words: ["By", "2025,", "she", "will", "have", "been", "working", "here", "for", "10", "years."],
    },
  ],
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

  const currentSentences = sentences[difficulty]
  const currentSentence = currentSentences[currentIndex]
  const progress = ((currentIndex + 1) / currentSentences.length) * 100

  const styles = getDifficultyStyles(difficulty)
  const colors = getDifficultyColors(difficulty)

  // Initialize available words when sentence changes
  useEffect(() => {
    setAvailableWords(shuffleArray(currentSentence.words))
    setSelectedWords([])
    setIsCorrect(null)
    setShowResult(false)
  }, [currentSentence])

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
    const correct = userSentence === currentSentence.english

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore((prev) => prev + (difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 30))
      setStreak((prev) => prev + 1)
    } else {
      setStreak(0)
    }
  }, [selectedWords, currentSentence, difficulty])

  const nextSentence = useCallback(() => {
    if (currentIndex < currentSentences.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      // Game complete - reset
      setCurrentIndex(0)
    }
  }, [currentIndex, currentSentences.length])

  const resetCurrent = useCallback(() => {
    setAvailableWords(shuffleArray(currentSentence.words))
    setSelectedWords([])
    setIsCorrect(null)
    setShowResult(false)
  }, [currentSentence])

  return (
    <div className={cn("space-y-6", styles.container)}>
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <DifficultyTabs
          value={difficulty}
          onValueChange={(d) => {
            setDifficulty(d)
            setCurrentIndex(0)
            setScore(0)
            setStreak(0)
          }}
          className="w-full sm:w-auto"
        />

        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-2 px-4 py-2">
            <Trophy className="h-4 w-4 text-future" />
            Score: {score}
          </Badge>
          <Badge variant="outline" className={cn("gap-2 px-4 py-2", streak > 0 && "bg-present-light border-present")}>
            <Zap className="h-4 w-4 text-present" />
            Streak: {streak}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Question {currentIndex + 1} of {currentSentences.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main game area */}
      <Card className={cn("border-2", styles.card)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Translate this sentence:</span>
            <AudioButton text={currentSentence.english} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Native sentence */}
          <div className={cn("p-4 rounded-xl text-center", colors.light)}>
            <p
              className={cn(
                "font-medium",
                difficulty === "easy" ? "text-2xl" : difficulty === "medium" ? "text-xl" : "text-lg",
              )}
            >
              {currentSentence.native}
            </p>
          </div>

          {/* Selected words area */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Your sentence:</p>
            <div
              className={cn(
                "min-h-20 p-4 border-2 border-dashed rounded-xl flex flex-wrap gap-2 items-center",
                selectedWords.length === 0 && "justify-center",
                isCorrect === true && "border-present bg-present-light",
                isCorrect === false && "border-destructive bg-destructive/10",
              )}
            >
              {selectedWords.length === 0 ? (
                <p className="text-muted-foreground">Click words below to build your sentence...</p>
              ) : (
                selectedWords.map((word, index) => (
                  <Button
                    key={`${word}-${index}`}
                    variant="secondary"
                    className={cn(
                      "transition-all",
                      styles.button,
                      difficulty === "easy" && "text-lg px-6",
                      difficulty === "hard" && "text-sm px-3",
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
            <p className="text-sm text-muted-foreground">Available words:</p>
            <div
              className={cn(
                "p-4 bg-muted/50 rounded-xl flex flex-wrap gap-2",
                difficulty === "easy" && "gap-3",
                difficulty === "hard" && "gap-2",
              )}
            >
              {availableWords.map((word, index) => (
                <Button
                  key={`${word}-${index}`}
                  variant="outline"
                  className={cn(
                    "transition-all hover:scale-105",
                    styles.button,
                    colors.primary.replace("bg-", "hover:bg-").replace("text-", "hover:text-"),
                    difficulty === "easy" && "text-lg px-6",
                    difficulty === "hard" && "text-sm px-3",
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
                "p-4 rounded-xl flex items-center gap-3",
                isCorrect ? "bg-present-light" : "bg-destructive/10",
              )}
            >
              {isCorrect ? (
                <>
                  <Check className="h-6 w-6 text-present" />
                  <div>
                    <p className="font-semibold text-present">Excellent!</p>
                    <p className="text-sm text-muted-foreground">
                      +{difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 30} points
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <X className="h-6 w-6 text-destructive" />
                  <div>
                    <p className="font-semibold text-destructive">Not quite right</p>
                    <p className="text-sm text-muted-foreground">Correct: {currentSentence.english}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={resetCurrent}
              className="gap-2 bg-transparent"
              disabled={selectedWords.length === 0}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            {!showResult ? (
              <Button
                onClick={checkAnswer}
                className={cn("flex-1 gap-2", colors.primary)}
                disabled={selectedWords.length !== currentSentence.words.length}
              >
                <Check className="h-4 w-4" />
                Check Answer
              </Button>
            ) : (
              <Button onClick={nextSentence} className="flex-1 gap-2">
                {currentIndex < currentSentences.length - 1 ? (
                  <>
                    Next Sentence
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4" />
                    Complete! Play Again
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
