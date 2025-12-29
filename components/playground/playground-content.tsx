"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TenseTimeline } from "@/components/tense/tense-timeline"
import { FormulaCard } from "@/components/tense/formula-card"
import { ExampleList } from "@/components/tense/example-list"
import { DifficultyTabs } from "@/components/common/difficulty-tabs"
import { Search, BookOpen, FlaskConical, PenLine, Volume2 } from "lucide-react"
import type { Difficulty } from "@/lib/difficulty-styles"
import { getDifficultyStyles } from "@/lib/difficulty-styles"
import { cancelSpeech, speakText } from "@/lib/speech"

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

  const styles = getDifficultyStyles(difficulty)
  const currentTense = tenseData[activeTense]

  return (
    <div className={`space-y-8 ${styles.container}`}>
      {/* Search Input */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Type a sentence in your native language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button className="h-12 px-6">Analyze</Button>
          </div>
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
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="explanation" className="gap-2 text-base">
            <BookOpen className="h-4 w-4" />
            Explanation
          </TabsTrigger>
          <TabsTrigger value="examples" className="gap-2 text-base">
            <FlaskConical className="h-4 w-4" />
            Examples
          </TabsTrigger>
          <TabsTrigger value="practice" className="gap-2 text-base">
            <PenLine className="h-4 w-4" />
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
  const [showResult, setShowResult] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

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

  const questions = {
    past: {
      easy: { question: 'Convert to past: "I eat food."', answer: "I ate food." },
      medium: { question: 'Fill in: "She ___ (read) when I called."', answer: "was reading" },
      hard: {
        question: 'Make Past Perfect: "They finish before we arrive."',
        answer: "They had finished before we arrived.",
      },
    },
    present: {
      easy: { question: 'Fill in: "She ___ (go) to school daily."', answer: "goes" },
      medium: { question: 'Convert to Present Continuous: "I study English."', answer: "I am studying English." },
      hard: {
        question: 'Make Present Perfect Continuous: "I work here for 5 years."',
        answer: "I have been working here for 5 years.",
      },
    },
    future: {
      easy: { question: 'Add "will": "I go tomorrow."', answer: "I will go tomorrow." },
      medium: {
        question: 'Make Future Continuous: "She travel next week."',
        answer: "She will be traveling next week.",
      },
      hard: { question: 'Make Future Perfect: "I complete by June."', answer: "I will have completed by June." },
    },
  }

  const currentQuestion = questions[tense][difficulty]

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Quick Practice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Type your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="h-12"
          />
          <Button onClick={() => setShowResult(true)} className="h-12 px-6">
            Check
          </Button>
        </div>

        {showResult && (
          <div
            className={`p-4 rounded-xl ${
              answer.toLowerCase().trim() === currentQuestion.answer.toLowerCase()
                ? "bg-present-light border-2 border-present"
                : "bg-destructive/10 border-2 border-destructive"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium flex-1">
                {answer.toLowerCase().trim() === currentQuestion.answer.toLowerCase()
                  ? "Correct! Well done!"
                  : `Not quite. The correct answer is: "${currentQuestion.answer}"`}
              </p>
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
