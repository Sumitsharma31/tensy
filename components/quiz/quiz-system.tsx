"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { DifficultyTabs } from "@/components/common/difficulty-tabs"
import { cn } from "@/lib/utils"
import { getDifficultyColors, type Difficulty } from "@/lib/difficulty-styles"
import { useChallenges } from "@/hooks/use-challenges"
import {
  ChevronRight,
  Check,
  X,
  Star,
  Trophy,
  Lock,
  ArrowLeft,
  RotateCcw,
  Target,
  Zap,
  Award,
  PlayCircle,
  Home,
  RefreshCcw
} from "lucide-react"

// Import sentence data
import easyData from "@/data/sentence/easy.json"
import mediumData from "@/data/sentence/medium.json"
import hardData from "@/data/sentence/hard.json"

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

interface WrongAnswer {
  questionIndex: number
  question: Question
  userAnswer: string
  correctAnswer: string
}

interface Level {
  level: number
  title: string
  questions: Question[]
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>( array: T[] ): T[] {
  const shuffled = [...array]
  for ( let i = shuffled.length - 1; i > 0; i-- ) {
    const j = Math.floor( Math.random() * ( i + 1 ) )
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Transform sentence data to quiz format with shuffled options
function transformSentenceData( data: typeof easyData ): Level[] {
  const sentences = data.sentences
  const questionsPerLevel = 5
  const levels: Level[] = []

  for ( let i = 0; i < sentences.length; i += questionsPerLevel ) {
    const levelSentences = sentences.slice( i, i + questionsPerLevel )
    const levelNumber = Math.floor( i / questionsPerLevel ) + 1

    const questions: Question[] = levelSentences.map( ( sentence ) => {
      if ( sentence.quiz.type === "mcq" ) {
        // Shuffle options and track correct answer
        const originalOptions = sentence.quiz.options
        const correctAnswer = originalOptions[sentence.quiz.answerIndex]
        const shuffledOptions = shuffleArray( originalOptions )
        const newCorrectIndex = shuffledOptions.indexOf( correctAnswer )

        return {
          type: "mcq" as const,
          question: sentence.quiz.question,
          options: shuffledOptions,
          correct: newCorrectIndex,
          explanation: sentence.quiz.explanation,
        }
      } else {
        // Handle correction type if present in data
        return {
          type: "correction" as const,
          question: "Fix this sentence:",
          incorrect: sentence.quiz.question,
          correct: sentence.translations.en,
          explanation: sentence.quiz.explanation,
        }
      }
    } )

    levels.push( {
      level: levelNumber,
      title: levelSentences[0]?.tense?.name || `Level ${levelNumber}`,
      questions,
    } )
  }

  return levels
}

// Generate levels from JSON data
function generateLevels( difficulty: Difficulty ): Level[] {
  const dataMap = {
    easy: easyData,
    medium: mediumData,
    hard: hardData,
  }

  return transformSentenceData( dataMap[difficulty] )
}

const QUIZ_PROGRESS_KEY = "tense-playground-quiz-levels"

export function QuizSystem() {
  const [difficulty, setDifficulty] = useState<Difficulty>( "easy" )
  const [view, setView] = useState<"levels" | "quiz" | "result">( "levels" )
  const [currentLevel, setCurrentLevel] = useState<number>( 1 )
  const [currentQuestion, setCurrentQuestion] = useState( 0 )
  const [score, setScore] = useState( 0 )
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>( null )
  const [showExplanation, setShowExplanation] = useState( false )
  const [completedLevels, setCompletedLevels] = useState<Record<string, Record<number, number>>>( {
    easy: {},
    medium: {},
    hard: {},
  } )
  const [userInput, setUserInput] = useState( "" )
  const [totalQuestions, setTotalQuestions] = useState( 0 )
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>( [] )

  const { recordQuizQuestion, recordTenseCompleted, recordPerfectScore, recordSectionVisit, recordEasyLevelComplete } = useChallenges()

  // Track section visit for Explorer badge
  useEffect( () => {
    recordSectionVisit("quiz")
  }, [recordSectionVisit] )

  useEffect( () => {
    try {
      const saved = localStorage.getItem( QUIZ_PROGRESS_KEY )
      if ( saved ) {
        setCompletedLevels( JSON.parse( saved ) )
      }
    } catch {
      // localStorage not available
    }
  }, [] )

  const saveCompletedLevels = useCallback( ( newLevels: Record<string, Record<number, number>> ) => {
    setCompletedLevels( newLevels )
    try {
      localStorage.setItem( QUIZ_PROGRESS_KEY, JSON.stringify( newLevels ) )
    } catch {
      // localStorage not available
    }
  }, [] )

  // Memoize levels to prevent re-shuffling on every render
  const levels = useMemo( () => generateLevels( difficulty ), [difficulty] )
  const level = levels.find( ( l ) => l.level === currentLevel )!
  const question = level?.questions[currentQuestion]
  const colors = getDifficultyColors( difficulty )

  const isLevelUnlocked = ( levelNum: number ) => {
    if ( levelNum === 1 ) return true
    return completedLevels[difficulty][levelNum - 1] !== undefined
  }

  const getLevelScore = ( levelNum: number ) => {
    return completedLevels[difficulty][levelNum]
  }

  const getLevelColor = ( levelNum: number ) => {
    const scorePercent = getLevelScore( levelNum )
    if ( scorePercent === undefined ) return ""
    if ( scorePercent >= 90 ) return "bg-present hover:bg-present/90 border-present"
    if ( scorePercent >= 60 ) return "bg-orange-500 hover:bg-orange-500/90 border-orange-500"
    return "bg-destructive hover:bg-destructive/90 border-destructive"
  }

  const getLevelStarColor = ( levelNum: number ) => {
    const scorePercent = getLevelScore( levelNum )
    if ( scorePercent === undefined ) return "text-white fill-white"
    if ( scorePercent >= 90 ) return "text-yellow-300 fill-yellow-300"
    if ( scorePercent >= 60 ) return "text-yellow-200 fill-yellow-200"
    return "text-white fill-white"
  }

  const handleAnswer = useCallback(
    ( answer: number | string ) => {
      setSelectedAnswer( answer )
      setShowExplanation( true )

      const isCorrect =
        question.type === "mcq"
          ? answer === ( question as MCQQuestion ).correct
          : ( answer as string ).toLowerCase().trim() === ( question as CorrectionQuestion ).correct.toLowerCase().trim()

      if ( isCorrect ) {
        setScore( ( prev ) => prev + 1 )
        // Record correct answer for daily challenge
        recordQuizQuestion()
      } else {
        // Track wrong answer
        const userAnswerText = question.type === "mcq"
          ? ( question as MCQQuestion ).options[answer as number]
          : ( answer as string )
        const correctAnswerText = question.type === "mcq"
          ? ( question as MCQQuestion ).options[( question as MCQQuestion ).correct]
          : ( question as CorrectionQuestion ).correct

        setWrongAnswers( ( prev ) => [...prev, {
          questionIndex: currentQuestion,
          question,
          userAnswer: userAnswerText,
          correctAnswer: correctAnswerText
        }] )
      }
    },
    [question, currentQuestion, recordQuizQuestion],
  )

  const nextQuestion = useCallback( () => {
    if ( currentQuestion < level.questions.length - 1 ) {
      setCurrentQuestion( ( prev ) => prev + 1 )
      setSelectedAnswer( null )
      setShowExplanation( false )
      setUserInput( "" )
    } else {
      // Level completed - show result screen
      // Note: score is already updated by handleAnswer, no need to add again
      const percentage = Math.round( ( score / level.questions.length ) * 100 )
      const newLevels = {
        ...completedLevels,
        [difficulty]: {
          ...completedLevels[difficulty],
          [currentLevel]: percentage
        },
      }
      saveCompletedLevels( newLevels )
      setTotalQuestions( level.questions.length )

      // Record tense completion for weekly challenge
      if ( level.title ) {
        recordTenseCompleted( level.title )
      }

      // Check for perfect score
      if ( percentage === 100 ) {
        recordPerfectScore()
      }

      // Record easy level completion for Grammar Guru badge
      if ( difficulty === "easy" && percentage >= 70 && level.title ) {
        recordEasyLevelComplete( level.title )
      }

      setView( "result" )
    }
  }, [currentQuestion, level, currentLevel, difficulty, completedLevels, saveCompletedLevels, score, recordTenseCompleted, recordPerfectScore, recordEasyLevelComplete] )

  const startLevel = ( levelNum: number ) => {
    if ( !isLevelUnlocked( levelNum ) ) return
    setCurrentLevel( levelNum )
    setCurrentQuestion( 0 )
    setScore( 0 )
    setSelectedAnswer( null )
    setShowExplanation( false )
    setUserInput( "" )
    setWrongAnswers( [] )
    setView( "quiz" )
  }

  const retryLevel = () => {
    setCurrentQuestion( 0 )
    setScore( 0 )
    setSelectedAnswer( null )
    setShowExplanation( false )
    setUserInput( "" )
    setWrongAnswers( [] )
    setView( "quiz" )
  }

  const goToLevels = () => {
    setCurrentQuestion( 0 )
    setScore( 0 )
    setSelectedAnswer( null )
    setShowExplanation( false )
    setView( "levels" )
  }

  const nextLevel = () => {
    const nextLevelNum = currentLevel + 1
    if ( nextLevelNum <= levels.length ) {
      startLevel( nextLevelNum )
    } else {
      goToLevels()
    }
  }

  // Result View
  if ( view === "result" ) {
    const percentage = Math.round( ( score / totalQuestions ) * 100 )
    const isPassed = percentage >= 60
    const isExcellent = percentage >= 90
    const hasNextLevel = currentLevel < levels.length

    return (
      <div className="space-y-6">
        <Card className="border-2 overflow-hidden">
          {/* Result Header */}
          <div className={cn(
            "py-5 px-4 sm:py-6 sm:px-5 text-center",
            isExcellent ? "bg-gradient-to-br from-yellow-400/20 to-orange-400/20" :
              isPassed ? "bg-gradient-to-br from-present/20 to-green-400/20" :
                "bg-gradient-to-br from-future/20 to-blue-400/20"
          )}>
            <div className={cn(
              "inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-3",
              isExcellent ? "bg-yellow-100 dark:bg-yellow-900/30" :
                isPassed ? "bg-present-light dark:bg-present/20" :
                  "bg-future-light dark:bg-future/20"
            )}>
              {isExcellent ? (
                <Award className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-600 dark:text-yellow-400" />
              ) : isPassed ? (
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-present" />
              ) : (
                <Target className="w-7 h-7 sm:w-8 sm:h-8 text-future" />
              )}
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1.5">
              {isExcellent ? "🎉 Excellent!" : isPassed ? "✅ Level Complete!" : "💪 Keep Practicing!"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground px-2">
              {isExcellent ? "Outstanding performance! You're a grammar master!" :
                isPassed ? "Great job! You passed this level." :
                  "You need 60% to pass. Try again!"}
            </p>
          </div>

          <CardContent className="py-4 sm:py-5 px-4 sm:px-5">
            {/* Score Display */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
              <div className="text-center p-2 sm:p-3 rounded-lg bg-present/10 border border-present/20">
                <div className="text-xl sm:text-2xl font-bold text-present">{score}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Correct</div>
                <div className="text-xs sm:text-sm font-medium text-present mt-0.5">
                  {Math.round( ( score / totalQuestions ) * 100 )}%
                </div>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="text-xl sm:text-2xl font-bold text-destructive">{totalQuestions - score}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Wrong</div>
                <div className="text-xs sm:text-sm font-medium text-destructive mt-0.5">
                  {Math.round( ( ( totalQuestions - score ) / totalQuestions ) * 100 )}%
                </div>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/50 border border-muted">
                <div className={cn(
                  "text-xl sm:text-2xl font-bold",
                  percentage >= 90 ? "text-yellow-600 dark:text-yellow-400" :
                    percentage >= 60 ? "text-present" : "text-future"
                )}>{percentage}%</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Score</div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5">
                  {score}/{totalQuestions}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4 sm:mb-5">
              <div className="flex justify-between text-[10px] sm:text-xs mb-1.5">
                <span>Your Score</span>
                <span>{score}/{totalQuestions}</span>
              </div>
              <Progress
                value={percentage}
                className={cn(
                  "h-1.5 sm:h-2",
                  percentage >= 60 ? "[&>div]:bg-present" : "[&>div]:bg-future"
                )}
              />
              <div className="flex justify-between text-[9px] sm:text-[10px] text-muted-foreground mt-1">
                <span>0%</span>
                <span className="text-muted-foreground">60% to pass</span>
                <span>100%</span>
              </div>
            </div>

            {/* Level Info */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg bg-muted/50 mb-3 sm:mb-4 text-xs sm:text-sm">
              <Badge variant="outline" className="px-3 py-1">
                Level {currentLevel}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="font-medium">{level.title}</span>
              <span className="text-muted-foreground">•</span>
              <Badge className={cn(
                difficulty === "easy" && "bg-present",
                difficulty === "medium" && "bg-future",
                difficulty === "hard" && "bg-past"
              )}>
                {difficulty.charAt( 0 ).toUpperCase() + difficulty.slice( 1 )}
              </Badge>
            </div>

            {/* Stars Rating */}
            <div className="flex justify-center gap-1 mb-3 sm:mb-4">
              {[1, 2, 3].map( ( star ) => (
                <Star
                  key={star}
                  className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6 transition-all",
                    ( star === 1 && percentage >= 40 ) ||
                      ( star === 2 && percentage >= 70 ) ||
                      ( star === 3 && percentage >= 90 )
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted stroke-muted-foreground/30"
                  )}
                />
              ) )}
            </div>

            {/* Wrong Answers Review */}
            {wrongAnswers.length > 0 && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" />
                  Review Mistakes ({wrongAnswers.length})
                </h3>
                <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto pr-1">
                  {wrongAnswers.map( ( wrong, idx ) => (
                    <div
                      key={idx}
                      className="p-2 sm:p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-destructive/10 text-destructive text-[10px] sm:text-xs font-semibold shrink-0">
                          {wrong.questionIndex + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs sm:text-sm mb-1.5 break-words">
                            {wrong.question.type === "mcq"
                              ? wrong.question.question
                              : `Fix: "${( wrong.question as CorrectionQuestion ).incorrect}"`
                            }
                          </p>
                          <div className="grid gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
                            <div className="flex items-start gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded bg-destructive/10">
                              <X className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
                              <div className="break-words min-w-0">
                                <span className="text-muted-foreground">You: </span>
                                <span className="text-destructive font-medium break-all">{wrong.userAnswer}</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded bg-present/10">
                              <Check className="w-3 h-3 text-present shrink-0 mt-0.5" />
                              <div className="break-words min-w-0">
                                <span className="text-muted-foreground">Correct: </span>
                                <span className="text-present font-medium break-all">{wrong.correctAnswer}</span>
                              </div>
                            </div>
                            <p className="text-muted-foreground text-[10px] sm:text-xs break-words">
                              💡 {wrong.question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) )}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-2 p-3 sm:p-4 bg-muted/30">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={goToLevels}
                className="flex-1 sm:flex-initial gap-1.5 text-xs sm:text-sm h-8 sm:h-9"
                size="sm"
              >
                <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Levels
              </Button>
              <Button
                variant="outline"
                onClick={retryLevel}
                className="flex-1 sm:flex-initial gap-1.5 text-xs sm:text-sm h-8 sm:h-9"
                size="sm"
              >
                <RefreshCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Retry
              </Button>
              {isPassed && hasNextLevel && (
                <Button
                  onClick={nextLevel}
                  className="flex-1 sm:flex-initial gap-1.5 text-xs sm:text-sm h-8 sm:h-9"
                  size="sm"
                >
                  Next
                  <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if ( view === "levels" ) {
    const totalLevelsCompleted = Object.keys( completedLevels[difficulty] ).length
    const totalLevels = Math.min( levels.length, 50 )

    // Calculate overall correct/wrong percentages from all completed levels
    const completedScores = Object.values( completedLevels[difficulty] )
    const averageCorrect = completedScores.length > 0
      ? Math.round( completedScores.reduce( ( sum, score ) => sum + score, 0 ) / completedScores.length )
      : 0
    const averageWrong = completedScores.length > 0 ? 100 - averageCorrect : 0

    return (
      <div className="space-y-6">
        {/* Header Stats */}
        <Card className="border bg-gradient-to-r from-muted/50 to-muted/30 p-1">
          <CardContent className="py-2.5 sm:py-3 px-3 sm:px-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Progress</p>
                  <p className="font-semibold text-xs sm:text-sm">{totalLevelsCompleted}/{totalLevels}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="text-center px-1.5 sm:px-2 py-0.5 rounded bg-present/10">
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">Correct</p>
                  <p className="font-semibold text-[10px] sm:text-xs text-present">{averageCorrect}%</p>
                </div>
                <div className="text-center px-1.5 sm:px-2 py-0.5 rounded bg-destructive/10">
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">Wrong</p>
                  <p className="font-semibold text-[10px] sm:text-xs text-destructive">{averageWrong}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground text-right">Done</p>
                  <p className="font-semibold text-xs sm:text-sm text-right">{Math.round( ( totalLevelsCompleted / totalLevels ) * 100 )}%</p>
                </div>
                <div className="p-1.5 rounded-md bg-present/10">
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-present" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <DifficultyTabs value={difficulty} onValueChange={setDifficulty} />

        {/* Instructions */}
        <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg bg-muted/50 text-xs sm:text-sm text-muted-foreground">
          <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Complete levels to unlock more. Need 60% to pass!</span>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-10 gap-1.5 sm:gap-2">
          {levels.slice( 0, 50 ).map( ( lvl ) => {
            const isUnlocked = isLevelUnlocked( lvl.level )
            const isCompleted = completedLevels[difficulty][lvl.level] !== undefined
            const levelColor = getLevelColor( lvl.level )
            const starColor = getLevelStarColor( lvl.level )

            return (
              <Button
                key={lvl.level}
                variant={isCompleted ? "default" : "outline"}
                className={cn(
                  "h-8 w-8 sm:h-9 sm:w-9 p-0 relative transition-all text-[10px] sm:text-xs",
                  isCompleted && levelColor,
                  !isUnlocked && "opacity-40 cursor-not-allowed",
                  isUnlocked && !isCompleted && "hover:border-primary hover:scale-105 bg-transparent",
                )}
                onClick={() => startLevel( lvl.level )}
                disabled={!isUnlocked}
                title={isUnlocked ? `Level ${lvl.level}: ${lvl.title}${isCompleted ? ` (${getLevelScore( lvl.level )}%)` : ''}` : "Complete previous level to unlock"}
              >
                {isUnlocked ? (
                  isCompleted ? (
                    <Star className={cn( "h-3.5 w-3.5 sm:h-4 sm:w-4", starColor )} />
                  ) : (
                    <span className="font-semibold">{lvl.level}</span>
                  )
                ) : (
                  <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                )}
              </Button>
            )
          } )}
        </div>

        {/* Practice Insights - Group by tense performance */}
        {totalLevelsCompleted > 0 && (
          <div className="mt-4 sm:mt-6">
            <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 flex items-center gap-2">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Practice Insights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {/* Needs Practice */}
              {( () => {
                const needsPractice = levels
                  .filter( lvl => {
                    const score = getLevelScore( lvl.level )
                    return score !== undefined && score < 80
                  } )
                  .slice( 0, 3 )

                if ( needsPractice.length === 0 ) return null

                return (
                  <Card className="border border-orange-500/30 bg-orange-500/5 gap-0">
                    <CardHeader className="p-2.5 sm:p-3 pb-1.5">
                      <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                        <RefreshCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Needs Practice
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2.5 sm:p-3 pt-0">
                      <div className="space-y-1.5">
                        {needsPractice.map( lvl => {
                          const score = getLevelScore( lvl.level )
                          return (
                            <button
                              key={lvl.level}
                              onClick={() => startLevel( lvl.level )}
                              className="w-full flex items-center justify-between p-1.5 sm:p-2 rounded bg-background/50 hover:bg-background transition-colors text-left"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0">L{lvl.level}</Badge>
                                <span className="text-[10px] sm:text-xs truncate">{lvl.title}</span>
                              </div>
                              <span className="text-[10px] sm:text-xs font-medium text-orange-600 dark:text-orange-400 shrink-0 ml-1">{score}%</span>
                            </button>
                          )
                        } )}
                      </div>
                    </CardContent>
                  </Card>
                )
              } )()}

              {/* Mastered */}
              {( () => {
                const mastered = levels
                  .filter( lvl => {
                    const score = getLevelScore( lvl.level )
                    return score !== undefined && score >= 90
                  } )
                  .slice( 0, 3 )

                if ( mastered.length === 0 ) return null

                return (
                  <Card className="border border-present/30 bg-present/5">
                    <CardHeader className="p-2.5 sm:p-3 pb-1.5">
                      <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5 text-present">
                        <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Mastered
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2.5 sm:p-3 pt-0">
                      <div className="space-y-1.5">
                        {mastered.map( lvl => {
                          const score = getLevelScore( lvl.level )
                          return (
                            <div
                              key={lvl.level}
                              className="flex items-center justify-between p-1.5 sm:p-2 rounded bg-background/50"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0 border-present text-present">L{lvl.level}</Badge>
                                <span className="text-[10px] sm:text-xs truncate">{lvl.title}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                <Star className="w-2.5 h-2.5 text-present fill-present" />
                                <span className="text-[10px] sm:text-xs font-medium text-present">{score}%</span>
                              </div>
                            </div>
                          )
                        } )}
                      </div>
                    </CardContent>
                  </Card>
                )
              } )()}
            </div>
          </div>
        )}

        {/* Next Level Hint - Show when no levels completed */}
        {totalLevelsCompleted === 0 && (
          <Card className="mt-4 sm:mt-6 border-dashed border-2 bg-muted/20">
            <CardContent className="py-4 sm:py-6 text-center">
              <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Start your journey!</p>
              <Button size="sm" onClick={() => startLevel( 1 )} className="gap-1.5 text-xs h-7">
                <Zap className="w-3 h-3" />
                Begin Level 1
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Quiz view
  const progress = ( ( currentQuestion + 1 ) / level.questions.length ) * 100
  const isCorrect =
    question.type === "mcq"
      ? selectedAnswer === ( question as MCQQuestion ).correct
      : ( selectedAnswer as string )?.toLowerCase().trim() ===
      ( question as CorrectionQuestion ).correct.toLowerCase().trim()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button variant="ghost" onClick={goToLevels} className="gap-1.5 h-8 px-2 text-xs sm:text-sm">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Back</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 px-2 py-1 text-xs">
            <Target className="h-3 w-3 text-muted-foreground" />
            {currentQuestion + 1}/{level.questions.length}
          </Badge>
          <Badge variant="outline" className="gap-1 px-2 py-1 text-xs bg-present/10 border-present/30">
            <Trophy className="h-3 w-3 text-present" />
            {score}
          </Badge>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="border bg-muted/30">
        <CardContent className="py-2 sm:py-2.5 px-2.5 sm:px-4">
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Badge className={cn(
                "text-[10px] sm:text-xs shrink-0 px-1.5 py-0.5",
                difficulty === "easy" && "bg-present",
                difficulty === "medium" && "bg-future",
                difficulty === "hard" && "bg-past"
              )}>
                L{currentLevel}
              </Badge>
              <span className="font-medium text-xs sm:text-sm truncate">{level.title}</span>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold shrink-0">{Math.round( progress )}%</span>
          </div>
          <Progress value={progress} className="h-1 sm:h-1.5" />
          <div className="flex justify-between mt-1 gap-0.5">
            {level.questions.map( ( _, idx ) => (
              <div
                key={idx}
                className={cn(
                  "w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all",
                  idx < currentQuestion ? "bg-present" :
                    idx === currentQuestion ? "bg-primary scale-125" :
                      "bg-muted-foreground/30"
                )}
              />
            ) )}
          </div>
        </CardContent>
      </Card>

      {/* Question card */}
      <Card className="border-2 shadow-md">
        <CardHeader className="pb-2 sm:pb-3 p-2.5 sm:p-4">
          <div className="flex items-start gap-2">
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 shrink-0">
              <span className="font-bold text-primary text-xs sm:text-sm">{currentQuestion + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <CardDescription className="mb-0.5 text-[10px] sm:text-xs">
                {question.type === "mcq" ? "Choose the correct answer" : "Fix the sentence"}
              </CardDescription>
              <CardTitle className="text-sm sm:text-base leading-relaxed break-words">
                {question.type === "mcq" ? question.question : question.question}
              </CardTitle>
            </div>
          </div>
          {question.type === "correction" && (
            <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-destructive/10 rounded-lg border border-destructive/30">
              <p className="text-[10px] sm:text-xs text-destructive mb-0.5 font-medium">Incorrect:</p>
              <p className="font-mono text-xs sm:text-sm break-words">{( question as CorrectionQuestion ).incorrect}</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3 px-2.5 sm:px-4 pb-2.5 sm:pb-4">
          {question.type === "mcq" ? (
            <div className="grid gap-1.5 sm:gap-2">
              {( question as MCQQuestion ).options.map( ( option, i ) => (
                <Button
                  key={i}
                  variant="outline"
                  className={cn(
                    "justify-start h-auto py-2 sm:py-2.5 px-2 sm:px-3 text-left text-xs sm:text-sm bg-transparent transition-all",
                    !showExplanation && "hover:bg-primary/5 hover:border-primary",
                    selectedAnswer === i && isCorrect && "bg-present/10 border-present border-2",
                    selectedAnswer === i && !isCorrect && "bg-destructive/10 border-destructive border-2",
                    showExplanation && i === ( question as MCQQuestion ).correct && "bg-present/10 border-present border-2",
                  )}
                  onClick={() => !showExplanation && handleAnswer( i )}
                  disabled={showExplanation}
                >
                  <span className={cn(
                    "mr-2 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 font-semibold shrink-0 text-[10px] sm:text-xs",
                    selectedAnswer === i && isCorrect && "bg-present text-white border-present",
                    selectedAnswer === i && !isCorrect && "bg-destructive text-white border-destructive",
                    showExplanation && i === ( question as MCQQuestion ).correct && "bg-present text-white border-present",
                  )}>
                    {String.fromCharCode( 65 + i )}
                  </span>
                  <span className="flex-1 break-words">{option}</span>
                  {showExplanation && i === ( question as MCQQuestion ).correct && (
                    <Check className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-present shrink-0" />
                  )}
                  {showExplanation && selectedAnswer === i && !isCorrect && (
                    <X className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive shrink-0" />
                  )}
                </Button>
              ) )}
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Type corrected sentence..."
                value={userInput}
                onChange={( e ) => setUserInput( e.target.value )}
                className="h-9 sm:h-10 text-xs sm:text-sm px-2.5 sm:px-3"
                disabled={showExplanation}
              />
              {!showExplanation && (
                <Button
                  onClick={() => handleAnswer( userInput )}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm gap-1.5"
                  disabled={!userInput.trim()}
                >
                  <Check className="w-3.5 h-3.5" />
                  Check Answer
                </Button>
              )}
            </div>
          )}

          {/* Explanation */}
          {showExplanation && (
            <div className={cn(
              "p-2 sm:p-3 rounded-lg border",
              isCorrect ? "bg-present/10 border-present/30" : "bg-future/10 border-future/30"
            )}>
              <div className="flex items-start gap-2">
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full shrink-0",
                  isCorrect ? "bg-present/20" : "bg-destructive/20"
                )}>
                  {isCorrect ? (
                    <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-present" />
                  ) : (
                    <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-destructive" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn( "font-bold text-xs sm:text-sm mb-0.5", isCorrect ? "text-present" : "text-destructive" )}>
                    {isCorrect ? "🎉 Correct!" : "❌ Not quite right"}
                  </p>
                  <p className="text-muted-foreground text-[10px] sm:text-xs">{question.explanation}</p>
                  {question.type === "correction" && !isCorrect && (
                    <div className="mt-1.5 p-1.5 sm:p-2 bg-present/10 rounded">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Correct:</p>
                      <p className="font-medium text-present text-xs sm:text-sm break-words">{( question as CorrectionQuestion ).correct}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {showExplanation && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={goToLevels} className="gap-1 h-8 sm:h-9 px-2.5 text-xs sm:text-sm">
            <RotateCcw className="h-3 w-3" />
            Exit
          </Button>
          <Button onClick={nextQuestion} className="flex-1 gap-1 h-8 sm:h-9 text-xs sm:text-sm">
            {currentQuestion < level.questions.length - 1 ? (
              <>
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                <Trophy className="h-3.5 w-3.5" />
                Complete
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
