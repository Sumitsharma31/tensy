"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { DifficultyTabs } from "@/components/common/difficulty-tabs"
import { cn } from "@/lib/utils"
import { getDifficultyColors, type Difficulty } from "@/lib/difficulty-styles"
import { ChevronRight, Check, X, Star, Trophy, Lock, ArrowLeft, RotateCcw } from "lucide-react"

interface MCQQuestion {
  type: "mcq"
  question: string
  options: string[]
  correct: number
  explanation: string
}

interface CorrectionQuestion {
  type: "correction"
  question: string
  incorrect: string
  correct: string
  explanation: string
}

type Question = MCQQuestion | CorrectionQuestion

interface Level {
  level: number
  title: string
  questions: Question[]
}

const quizData: Record<Difficulty, Level[]> = {
  easy: [
    {
      level: 1,
      title: "Simple Present Basics",
      questions: [
        {
          type: "mcq",
          question: "She ___ to school every day.",
          options: ["go", "goes", "going", "went"],
          correct: 1,
          explanation: "With he/she/it in Simple Present, add 's' or 'es' to the verb.",
        },
        {
          type: "mcq",
          question: "They ___ football on weekends.",
          options: ["plays", "playing", "play", "played"],
          correct: 2,
          explanation: "With they/we/I/you, use the base form of the verb.",
        },
        {
          type: "correction",
          question: "Fix this sentence:",
          incorrect: "He go to office daily.",
          correct: "He goes to office daily.",
          explanation: "With 'he', we need 'goes' (add 'es' to 'go').",
        },
      ],
    },
    {
      level: 2,
      title: "Simple Past Basics",
      questions: [
        {
          type: "mcq",
          question: "I ___ a movie yesterday.",
          options: ["watch", "watches", "watched", "watching"],
          correct: 2,
          explanation: "Simple Past uses V2 form. 'watch' becomes 'watched'.",
        },
        {
          type: "mcq",
          question: "What is the past tense of 'eat'?",
          options: ["eated", "ate", "eaten", "eating"],
          correct: 1,
          explanation: "'Eat' is irregular. Its past form is 'ate'.",
        },
        {
          type: "correction",
          question: "Fix this sentence:",
          incorrect: "She goed to market.",
          correct: "She went to market.",
          explanation: "'Go' is irregular. Its past form is 'went'.",
        },
      ],
    },
    {
      level: 3,
      title: "Simple Future Basics",
      questions: [
        {
          type: "mcq",
          question: "I ___ visit you tomorrow.",
          options: ["will", "was", "am", "have"],
          correct: 0,
          explanation: "Simple Future uses 'will' + base verb.",
        },
        {
          type: "mcq",
          question: "She ___ come to the party.",
          options: ["will", "is", "was", "has"],
          correct: 0,
          explanation: "For future actions, we use 'will' before the verb.",
        },
        {
          type: "correction",
          question: "Fix this sentence:",
          incorrect: "They will goes home.",
          correct: "They will go home.",
          explanation: "After 'will', always use the base form of the verb.",
        },
      ],
    },
  ],
  medium: [
    {
      level: 1,
      title: "Continuous Tenses",
      questions: [
        {
          type: "mcq",
          question: "She ___ dinner right now.",
          options: ["cooks", "is cooking", "cooked", "will cook"],
          correct: 1,
          explanation: "Present Continuous: is/am/are + verb+ing for ongoing actions.",
        },
        {
          type: "mcq",
          question: "They ___ when I arrived.",
          options: ["are sleeping", "were sleeping", "slept", "sleep"],
          correct: 1,
          explanation: "Past Continuous: was/were + verb+ing for past ongoing actions.",
        },
        {
          type: "correction",
          question: "Fix this sentence:",
          incorrect: "I am go to school.",
          correct: "I am going to school.",
          explanation: "Present Continuous needs verb+ing after am/is/are.",
        },
      ],
    },
    {
      level: 2,
      title: "Perfect Tenses Intro",
      questions: [
        {
          type: "mcq",
          question: "I ___ this movie before.",
          options: ["see", "saw", "have seen", "am seeing"],
          correct: 2,
          explanation: "Present Perfect: have/has + V3 for past actions with present relevance.",
        },
        {
          type: "mcq",
          question: "She ___ already left when I arrived.",
          options: ["has", "had", "have", "was"],
          correct: 1,
          explanation: "Past Perfect: had + V3 for actions before another past action.",
        },
        {
          type: "correction",
          question: "Fix this sentence:",
          incorrect: "They has finished the work.",
          correct: "They have finished the work.",
          explanation: "With 'they', use 'have' not 'has'.",
        },
      ],
    },
  ],
  hard: [
    {
      level: 1,
      title: "Perfect Continuous Mastery",
      questions: [
        {
          type: "mcq",
          question: "She ___ here for five years.",
          options: ["works", "is working", "has been working", "had worked"],
          correct: 2,
          explanation: "Present Perfect Continuous shows duration from past to present.",
        },
        {
          type: "mcq",
          question: "By 2025, I ___ for 10 years.",
          options: ["will work", "will be working", "will have been working", "am working"],
          correct: 2,
          explanation: "Future Perfect Continuous: will have been + V+ing for future duration.",
        },
        {
          type: "correction",
          question: "Fix this sentence:",
          incorrect: "They had been wait for hours.",
          correct: "They had been waiting for hours.",
          explanation: "Perfect Continuous needs been + verb+ing.",
        },
      ],
    },
    {
      level: 2,
      title: "Mixed Tense Challenge",
      questions: [
        {
          type: "mcq",
          question: "If I ___ earlier, I would have caught the train.",
          options: ["leave", "left", "had left", "have left"],
          correct: 2,
          explanation: "Third conditional uses 'had + V3' in the if-clause.",
        },
        {
          type: "mcq",
          question: "By the time you arrive, I ___.",
          options: ["will leave", "will have left", "leave", "left"],
          correct: 1,
          explanation: "Future Perfect for action completed before a future point.",
        },
        {
          type: "correction",
          question: "Fix this sentence:",
          incorrect: "She told me she will come.",
          correct: "She told me she would come.",
          explanation: "Reported speech: 'will' changes to 'would'.",
        },
      ],
    },
  ],
}

// Generate more levels (simplified)
function generateLevels(difficulty: Difficulty): Level[] {
  const baseLevels = quizData[difficulty]
  const levels: Level[] = [...baseLevels]

  // Add placeholder levels up to 50
  for (let i = baseLevels.length + 1; i <= 50; i++) {
    levels.push({
      level: i,
      title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level ${i}`,
      questions: baseLevels[0].questions, // Reuse questions for demo
    })
  }

  return levels
}

const QUIZ_PROGRESS_KEY = "tense-playground-quiz-levels"

export function QuizSystem() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
  const [view, setView] = useState<"levels" | "quiz">("levels")
  const [currentLevel, setCurrentLevel] = useState<number>(1)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [completedLevels, setCompletedLevels] = useState<Record<string, number[]>>({
    easy: [],
    medium: [],
    hard: [],
  })
  const [userInput, setUserInput] = useState("")

  useEffect(() => {
    try {
      const saved = localStorage.getItem(QUIZ_PROGRESS_KEY)
      if (saved) {
        setCompletedLevels(JSON.parse(saved))
      }
    } catch {
      // localStorage not available
    }
  }, [])

  const saveCompletedLevels = useCallback((newLevels: Record<string, number[]>) => {
    setCompletedLevels(newLevels)
    try {
      localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(newLevels))
    } catch {
      // localStorage not available
    }
  }, [])

  const levels = generateLevels(difficulty)
  const level = levels.find((l) => l.level === currentLevel)!
  const question = level?.questions[currentQuestion]
  const colors = getDifficultyColors(difficulty)

  const isLevelUnlocked = (levelNum: number) => {
    if (levelNum === 1) return true
    return completedLevels[difficulty].includes(levelNum - 1)
  }

  const handleAnswer = useCallback(
    (answer: number | string) => {
      setSelectedAnswer(answer)
      setShowExplanation(true)

      const isCorrect =
        question.type === "mcq"
          ? answer === (question as MCQQuestion).correct
          : (answer as string).toLowerCase().trim() === (question as CorrectionQuestion).correct.toLowerCase().trim()

      if (isCorrect) {
        setScore((prev) => prev + 1)
      }
    },
    [question],
  )

  const nextQuestion = useCallback(() => {
    if (currentQuestion < level.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
      setUserInput("")
    } else {
      const newLevels = {
        ...completedLevels,
        [difficulty]: [...new Set([...completedLevels[difficulty], currentLevel])],
      }
      saveCompletedLevels(newLevels)
      setView("levels")
      setCurrentQuestion(0)
      setScore(0)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }, [currentQuestion, level, currentLevel, difficulty, completedLevels, saveCompletedLevels])

  const startLevel = (levelNum: number) => {
    if (!isLevelUnlocked(levelNum)) return
    setCurrentLevel(levelNum)
    setCurrentQuestion(0)
    setScore(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setView("quiz")
  }

  if (view === "levels") {
    return (
      <div className="space-y-6">
        <DifficultyTabs value={difficulty} onValueChange={setDifficulty} />

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {levels.slice(0, 50).map((lvl) => {
            const isUnlocked = isLevelUnlocked(lvl.level)
            const isCompleted = completedLevels[difficulty].includes(lvl.level)

            return (
              <Button
                key={lvl.level}
                variant={isCompleted ? "default" : "outline"}
                className={cn(
                  "h-12 w-12 p-0 relative",
                  isCompleted && colors.primary,
                  !isUnlocked && "opacity-50",
                  isUnlocked && !isCompleted && "hover:border-primary bg-transparent",
                )}
                onClick={() => startLevel(lvl.level)}
                disabled={!isUnlocked}
              >
                {isUnlocked ? (
                  isCompleted ? (
                    <Star className="h-5 w-5 fill-current" />
                  ) : (
                    lvl.level
                  )
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </Button>
            )
          })}
        </div>

        {/* Level cards preview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {levels.slice(0, 6).map((lvl) => {
            const isUnlocked = isLevelUnlocked(lvl.level)
            const isCompleted = completedLevels[difficulty].includes(lvl.level)

            return (
              <Card
                key={lvl.level}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md border-2",
                  isCompleted && "border-present",
                  !isUnlocked && "opacity-60",
                )}
                onClick={() => startLevel(lvl.level)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn(isCompleted && "bg-present-light text-present")}>
                      Level {lvl.level}
                    </Badge>
                    {isCompleted && <Star className="h-5 w-5 text-present fill-present" />}
                    {!isUnlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <CardTitle className="text-lg">{lvl.title}</CardTitle>
                  <CardDescription>{lvl.questions.length} questions</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // Quiz view
  const progress = ((currentQuestion + 1) / level.questions.length) * 100
  const isCorrect =
    question.type === "mcq"
      ? selectedAnswer === (question as MCQQuestion).correct
      : (selectedAnswer as string)?.toLowerCase().trim() ===
        (question as CorrectionQuestion).correct.toLowerCase().trim()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setView("levels")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Levels
        </Button>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-2 px-4 py-2">
            <Trophy className="h-4 w-4 text-future" />
            {score}/{level.questions.length}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {level.title} - Question {currentQuestion + 1}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">{question.type === "mcq" ? question.question : question.question}</CardTitle>
          {question.type === "correction" && (
            <div className="mt-4 p-4 bg-destructive/10 rounded-xl border-2 border-destructive/30">
              <p className="font-mono text-lg">{(question as CorrectionQuestion).incorrect}</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {question.type === "mcq" ? (
            <div className="grid gap-3">
              {(question as MCQQuestion).options.map((option, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className={cn(
                    "justify-start h-auto py-4 px-6 text-left text-base bg-transparent",
                    selectedAnswer === i && isCorrect && "bg-present-light border-present",
                    selectedAnswer === i && !isCorrect && "bg-destructive/10 border-destructive",
                    showExplanation && i === (question as MCQQuestion).correct && "bg-present-light border-present",
                  )}
                  onClick={() => !showExplanation && handleAnswer(i)}
                  disabled={showExplanation}
                >
                  <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full border-2 font-medium">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                  {showExplanation && i === (question as MCQQuestion).correct && (
                    <Check className="ml-auto h-5 w-5 text-present" />
                  )}
                  {showExplanation && selectedAnswer === i && !isCorrect && (
                    <X className="ml-auto h-5 w-5 text-destructive" />
                  )}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                placeholder="Type the corrected sentence..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="h-12 text-lg"
                disabled={showExplanation}
              />
              {!showExplanation && (
                <Button onClick={() => handleAnswer(userInput)} className="w-full" disabled={!userInput.trim()}>
                  Check Answer
                </Button>
              )}
            </div>
          )}

          {/* Explanation */}
          {showExplanation && (
            <div className={cn("p-4 rounded-xl", isCorrect ? "bg-present-light" : "bg-future-light")}>
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <Check className="h-5 w-5 text-present mt-0.5" />
                ) : (
                  <X className="h-5 w-5 text-destructive mt-0.5" />
                )}
                <div>
                  <p className={cn("font-semibold", isCorrect ? "text-present" : "text-destructive")}>
                    {isCorrect ? "Correct!" : "Not quite right"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{question.explanation}</p>
                  {question.type === "correction" && !isCorrect && (
                    <p className="text-sm font-medium mt-2">
                      Correct answer: {(question as CorrectionQuestion).correct}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {showExplanation && (
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setView("levels")} className="gap-2 bg-transparent">
            <RotateCcw className="h-4 w-4" />
            Exit Quiz
          </Button>
          <Button onClick={nextQuestion} className="flex-1 gap-2">
            {currentQuestion < level.questions.length - 1 ? (
              <>
                Next Question
                <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4" />
                Complete Level
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
