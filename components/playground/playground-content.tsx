"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TenseTimeline } from "@/components/tense/tense-timeline"
import { FormulaCard } from "@/components/tense/formula-card"
import { ExampleList } from "@/components/tense/example-list"
import { DifficultyTabs } from "@/components/common/difficulty-tabs"
import { useChallenges } from "@/hooks/use-challenges"
import { useLanguage } from "@/components/providers/language-provider"
import { Search, BookOpen, FlaskConical, PenLine, Volume2, RefreshCw, Loader2 } from "lucide-react"
import type { Difficulty } from "@/lib/difficulty-styles"
import { getDifficultyStyles } from "@/lib/difficulty-styles"
import { cancelSpeech, speakText } from "@/lib/speech"
import { analyzeSentence, type TenseAnalysisResult } from "@/services/ai-service"

// Import sentence data
import easySentences from "@/data/sentence/easy.json"
import mediumSentences from "@/data/sentence/medium.json"
import hardSentences from "@/data/sentence/hard.json"

// Types for sentence data
interface SentenceQuiz {
  type: string
  question: string
  options: string[]
  answerIndex: number
  explanation: string
}

interface SentenceTense {
  name: string
  formula: string
  usage: string
}

interface Sentence {
  id: string
  title: string
  learningFocus: string
  tense: SentenceTense
  quiz: SentenceQuiz
  translations: Record<string, string>
}

interface SentenceData {
  difficulty: string
  sentences: Sentence[]
}

// Helper function to determine tense category from tense name
function getTenseCategory(tenseName: string): "past" | "present" | "future" | null {
  const lowerName = tenseName.toLowerCase()
  if (lowerName.includes("past")) return "past"
  if (lowerName.includes("future")) return "future"
  if (lowerName.includes("present")) return "present"
  // Default present for simple tenses without explicit category
  return "present"
}

// Sentence data by difficulty
const sentenceDataByDifficulty: Record<Difficulty, SentenceData> = {
  easy: easySentences as SentenceData,
  medium: mediumSentences as SentenceData,
  hard: hardSentences as SentenceData,
}

// Combined sentences from all difficulty levels
const allSentences: Sentence[] = [
  ...easySentences.sentences,
  ...mediumSentences.sentences,
  ...hardSentences.sentences,
] as Sentence[]

// Sample tense data
const tenseData = {
  past: {
    types: [
      {
        name: "Simple Past",
        formula: "Subject + V2 + Object",
        examples: ["I walked to school.", "She ate dinner.", "They played football."],
      },
      {
        name: "Past Continuous",
        formula: "Subject + was/were + V1+ing",
        examples: ["I was walking to school.", "She was eating dinner.", "They were playing."],
      },
      {
        name: "Past Perfect",
        formula: "Subject + had + V3 + Object",
        examples: ["I had walked before.", "She had eaten already.", "They had played earlier."],
      },
      {
        name: "Past Perfect Continuous",
        formula: "Subject + had been + V1+ing",
        examples: ["I had been walking for hours.", "She had been eating.", "They had been playing."],
      },
    ],
    sentences: {
      easy: [
        { native: "मैंने खाना खाया।", english: "I ate food.", formula: "Subject + V2 + Object" },
        { native: "वह स्कूल गया।", english: "He went to school.", formula: "Subject + V2 + Object" },
        { native: "हमने मैच जीता।", english: "We won the match.", formula: "Subject + V2 + Object" },
      ],
      medium: [
        { native: "वह पढ़ रही थी।", english: "She was reading.", formula: "Subject + was + V1+ing" },
        { native: "बच्चे खेल रहे थे।", english: "Children were playing.", formula: "Subject + were + V1+ing" },
      ],
      hard: [
        {
          native: "ट्रेन आने से पहले वह पहुँच गया था।",
          english: "He had reached before the train came.",
          formula: "Subject + had + V3",
        },
        {
          native: "वे दो घंटे से इंतज़ार कर रहे थे।",
          english: "They had been waiting for two hours.",
          formula: "Subject + had been + V1+ing",
        },
      ],
    },
  },
  present: {
    types: [
      {
        name: "Simple Present",
        formula: "Subject + V1 (s/es) + Object",
        examples: ["I walk to school.", "She eats dinner.", "They play football."],
      },
      {
        name: "Present Continuous",
        formula: "Subject + is/am/are + V1+ing",
        examples: ["I am walking now.", "She is eating dinner.", "They are playing."],
      },
      {
        name: "Present Perfect",
        formula: "Subject + have/has + V3",
        examples: ["I have walked today.", "She has eaten already.", "They have played."],
      },
      {
        name: "Present Perfect Continuous",
        formula: "Subject + have/has been + V1+ing",
        examples: ["I have been walking.", "She has been eating.", "They have been playing."],
      },
    ],
    sentences: {
      easy: [
        { native: "मैं चाय पीता हूँ।", english: "I drink tea.", formula: "Subject + V1 + Object" },
        { native: "वह स्कूल जाती है।", english: "She goes to school.", formula: "Subject + V1(es) + Object" },
        { native: "सूरज पूर्व में उगता है।", english: "The sun rises in the east.", formula: "Subject + V1(s) + Object" },
      ],
      medium: [
        { native: "मैं पढ़ रहा हूँ।", english: "I am studying.", formula: "Subject + am + V1+ing" },
        { native: "वे खाना खा रहे हैं।", english: "They are eating food.", formula: "Subject + are + V1+ing" },
      ],
      hard: [
        { native: "मैंने यह किताब पढ़ ली है।", english: "I have read this book.", formula: "Subject + have + V3" },
        {
          native: "वह पाँच साल से यहाँ काम कर रही है।",
          english: "She has been working here for five years.",
          formula: "Subject + has been + V1+ing",
        },
      ],
    },
  },
  future: {
    types: [
      {
        name: "Simple Future",
        formula: "Subject + will + V1 + Object",
        examples: ["I will walk tomorrow.", "She will eat later.", "They will play."],
      },
      {
        name: "Future Continuous",
        formula: "Subject + will be + V1+ing",
        examples: ["I will be walking.", "She will be eating.", "They will be playing."],
      },
      {
        name: "Future Perfect",
        formula: "Subject + will have + V3",
        examples: ["I will have walked.", "She will have eaten.", "They will have played."],
      },
      {
        name: "Future Perfect Continuous",
        formula: "Subject + will have been + V1+ing",
        examples: ["I will have been walking.", "She will have been eating.", "They will have been playing."],
      },
    ],
    sentences: {
      easy: [
        { native: "मैं कल जाऊँगा।", english: "I will go tomorrow.", formula: "Subject + will + V1" },
        { native: "वह मदद करेगी।", english: "She will help.", formula: "Subject + will + V1" },
        { native: "वे खेलेंगे।", english: "They will play.", formula: "Subject + will + V1" },
      ],
      medium: [
        {
          native: "इस समय कल वह पढ़ रहा होगा।",
          english: "He will be studying at this time tomorrow.",
          formula: "Subject + will be + V1+ing",
        },
        {
          native: "हम अगले हफ्ते यात्रा कर रहे होंगे।",
          english: "We will be traveling next week.",
          formula: "Subject + will be + V1+ing",
        },
      ],
      hard: [
        {
          native: "अगले साल तक मैं पढ़ाई पूरी कर चुका हूँगा।",
          english: "I will have completed my studies by next year.",
          formula: "Subject + will have + V3",
        },
        {
          native: "2030 तक मैं 10 साल काम कर चुका हूँगा।",
          english: "By 2030, I will have been working for 10 years.",
          formula: "Subject + will have been + V1+ing",
        },
      ],
    },
  },
}

export function PlaygroundContent() {
  const [activeTense, setActiveTense] = useState<"past" | "present" | "future">("present")
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<TenseAnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const { recordSectionVisit } = useChallenges()

  // Track section visit for Explorer badge
  useEffect(() => {
    recordSectionVisit("playground")
  }, [recordSectionVisit])

  const handleAnalyze = async () => {
    if (!searchQuery.trim()) {
      setAnalysisError("Please enter a sentence to analyze")
      return
    }

    setIsAnalyzing(true)
    setAnalysisError(null)
    setAnalysisResult(null)

    try {
      const result = await analyzeSentence(searchQuery)
      setAnalysisResult(result)
      // Update active tense based on analysis
      if (result.tenseCategory) {
        setActiveTense(result.tenseCategory)
      }
    } catch (error) {
      console.error("Analysis failed:", error)
      setAnalysisError(error instanceof Error ? error.message : "Failed to analyze sentence")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const styles = getDifficultyStyles(difficulty)
  const currentTense = tenseData[activeTense]

  return (
    <div className={`space-y-8 ${styles.container}`}>
      {/* Search Input */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Type a sentence in your native language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                className="pl-10 h-12 text-base sm:text-lg placeholder:text-xs sm:placeholder:text-sm"
              />
            </div>
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing}
              className="h-12 px-6 w-full sm:w-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </div>

          {/* Analysis Error */}
          {analysisError && (
            <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive text-destructive">
              <p className="text-sm">{analysisError}</p>
            </div>
          )}

          {/* Analysis Result */}
          {analysisResult && (
            <div className="mt-6 space-y-4">
              <div className={`p-4 rounded-xl ${
                analysisResult.tenseCategory === "past" 
                  ? "bg-past-light border-2 border-past" 
                  : analysisResult.tenseCategory === "present"
                    ? "bg-present-light border-2 border-present"
                    : "bg-future-light border-2 border-future"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      analysisResult.tenseCategory === "past"
                        ? "bg-past/20 text-past"
                        : analysisResult.tenseCategory === "present"
                          ? "bg-present/20 text-present"
                          : "bg-future/20 text-future"
                    }`}>
                      {analysisResult.detectedTense}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(analysisResult.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">English Translation</p>
                    <p className="font-medium text-lg">{analysisResult.englishTranslation}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Formula</p>
                    <p className="font-mono bg-background/50 px-2 py-1 rounded inline-block">
                      {analysisResult.formula}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Explanation</p>
                    <p className="text-sm">{analysisResult.explanation}</p>
                  </div>

                  {analysisResult.breakdown && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Sentence Breakdown</p>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.breakdown.subject && (
                          <span className="px-2 py-1 bg-background/50 rounded text-sm">
                            <strong>Subject:</strong> {analysisResult.breakdown.subject}
                          </span>
                        )}
                        {analysisResult.breakdown.auxiliaryVerb && (
                          <span className="px-2 py-1 bg-background/50 rounded text-sm">
                            <strong>Auxiliary:</strong> {analysisResult.breakdown.auxiliaryVerb}
                          </span>
                        )}
                        {analysisResult.breakdown.verb && (
                          <span className="px-2 py-1 bg-background/50 rounded text-sm">
                            <strong>Verb:</strong> {analysisResult.breakdown.verb}
                          </span>
                        )}
                        {analysisResult.breakdown.object && (
                          <span className="px-2 py-1 bg-background/50 rounded text-sm">
                            <strong>Object:</strong> {analysisResult.breakdown.object}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Alternative Tenses */}
              {analysisResult.alternativeTenses && analysisResult.alternativeTenses.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Alternative Tenses</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {analysisResult.alternativeTenses.map((alt, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/50 border">
                        <p className="font-medium text-sm">{alt.tense}</p>
                        <p className="text-sm mt-1">{alt.sentence}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alt.usage}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <TenseTimeline activeTense={activeTense} onTenseSelect={setActiveTense} />
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="explanation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-10 sm:h-12">
          <TabsTrigger value="explanation" className="gap-1 sm:gap-2 text-xs sm:text-base px-1 sm:px-3">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Explanation</span>
            <span className="xs:hidden">Explain</span>
          </TabsTrigger>
          <TabsTrigger value="examples" className="gap-1 sm:gap-2 text-xs sm:text-base px-1 sm:px-3">
            <FlaskConical className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Examples</span>
            <span className="xs:hidden">Ex.</span>
          </TabsTrigger>
          <TabsTrigger value="practice" className="gap-1 sm:gap-2 text-xs sm:text-base px-1 sm:px-3">
            <PenLine className="h-3 w-3 sm:h-4 sm:w-4" />
            Practice
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explanation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    activeTense === "past" ? "bg-past" : activeTense === "present" ? "bg-present" : "bg-future"
                  }`}
                />
                {activeTense.charAt(0).toUpperCase() + activeTense.slice(1)} Tense Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {currentTense.types.map((type) => (
                  <FormulaCard
                    key={type.name}
                    tense={activeTense}
                    tenseType={type.name}
                    formula={type.formula}
                    examples={type.examples}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <CardTitle>Example Sentences</CardTitle>
                <DifficultyTabs value={difficulty} onValueChange={setDifficulty} className="w-full sm:w-auto" />
              </div>
            </CardHeader>
            <CardContent>
              <ExampleList sentences={currentTense.sentences[difficulty]} tense={activeTense} difficulty={difficulty} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          <PracticeSection tense={activeTense} difficulty={difficulty} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PracticeSection({
  tense,
  difficulty,
}: {
  tense: "past" | "present" | "future"
  difficulty: Difficulty
}) {
  const [answer, setAnswer] = useState("")
  const [submittedAnswer, setSubmittedAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const { language } = useLanguage()

  const speak = (text: string) => {
    speakText(text, {
      rate: 0.9,
      preferredLangs: ["en-IN", "en-GB", "en-US"],
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    })
  }

  useEffect(() => cancelSpeech, [])

  // Filter sentences by tense category from all combined JSON data
  const filteredSentences = useMemo(() => {
    return allSentences.filter((sentence) => {
      const category = getTenseCategory(sentence.tense.name)
      return category === tense
    })
  }, [tense])

  // Reset question index when tense changes
  useEffect(() => {
    setCurrentQuestionIndex(0)
    setAnswer("")
    setShowResult(false)
  }, [tense])

  // Get current question from filtered sentences
  const currentSentence = filteredSentences[currentQuestionIndex]
  
  // Handle case when no sentences match the filter
  if (!currentSentence) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Quick Practice</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No practice questions available for {tense} tense at {difficulty} level.
          </p>
        </CardContent>
      </Card>
    )
  }

  const currentQuestion = {
    question: currentSentence.quiz.question,
    answer: currentSentence.quiz.options[currentSentence.quiz.answerIndex],
    options: currentSentence.quiz.options,
    explanation: currentSentence.quiz.explanation,
    title: currentSentence.title,
    tenseInfo: currentSentence.tense,
    translations: currentSentence.translations,
    learningFocus: currentSentence.learningFocus,
  }

  const handleNextQuestion = () => {
    const nextIndex = (currentQuestionIndex + 1) % filteredSentences.length
    setCurrentQuestionIndex(nextIndex)
    setAnswer("")
    setSubmittedAnswer("")
    setShowResult(false)
  }

  const handleCheck = () => {
    setSubmittedAnswer(answer)
    setShowResult(true)
  }

  const isCorrect = submittedAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase()

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quick Practice</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} / {filteredSentences.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextQuestion}
              title="Next question"
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tense info badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              tense === "past"
                ? "bg-past/20 text-past"
                : tense === "present"
                  ? "bg-present/20 text-present"
                  : "bg-future/20 text-future"
            }`}
          >
            {currentQuestion.tenseInfo.name}
          </span>
        </div>

        <div
          className={`p-4 rounded-xl ${
            tense === "past" ? "bg-past-light" : tense === "present" ? "bg-present-light" : "bg-future-light"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium text-lg flex-1">{currentQuestion.question}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => speak(currentQuestion.question)}
              className={`shrink-0 h-10 w-10 rounded-full ${
                isSpeaking
                  ? tense === "past"
                    ? "bg-past text-white"
                    : tense === "present"
                      ? "bg-present text-white"
                      : "bg-future text-white"
                  : "hover:bg-background/50"
              }`}
              title="Listen to pronunciation"
            >
              <Volume2 className={`h-5 w-5 ${isSpeaking ? "animate-pulse" : ""}`} />
            </Button>
          </div>
          {/* Formula hint */}
          <p className="text-sm text-muted-foreground">
            Formula: {currentQuestion.tenseInfo.formula}
          </p>
          {/* Hint: Translation */}
          {currentQuestion.translations?.[language] && (
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-2 text-xs bg-background/60 rounded-full border">
              <span className="text-muted-foreground font-bold">Hint:</span>
              <span>{currentQuestion.translations[language]}</span>
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Input
            placeholder="Type your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="h-12 flex-1 placeholder:text-xs sm:placeholder:text-sm"
          />
          <Button onClick={handleCheck} className="h-12 px-6 w-full sm:w-auto">
            Check
          </Button>
        </div>

        {showResult && (
          <div
            className={`p-4 rounded-xl ${
              isCorrect
                ? "bg-present-light border-2 border-present"
                : "bg-destructive/10 border-2 border-destructive"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <p className="font-medium">
                  {isCorrect
                    ? "Correct! Well done!"
                    : `Not quite. The correct answer is: "${currentQuestion.answer}"`}
                </p>
                <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => speak(currentQuestion.answer)}
                className="shrink-0 h-10 w-10 rounded-full hover:bg-background/50"
                title="Listen to correct answer"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
