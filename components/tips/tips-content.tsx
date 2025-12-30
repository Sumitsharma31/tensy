"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useChallenges } from "@/hooks/use-challenges"
import { Lightbulb, Clock, CheckCircle, ArrowRight, Sparkles, Zap, Target, BookOpen } from "lucide-react"

const tips = [
  {
    id: 1,
    title: "The Time Travel Rule",
    description: "Think of tenses as time travel! Past is behind you, Present is now, Future is ahead.",
    tense: "all",
    icon: Clock,
    color: "present",
    examples: [
      "Past: I walked (already happened)",
      "Present: I walk (happening now)",
      "Future: I will walk (yet to happen)",
    ],
  },
  {
    id: 2,
    title: "The '-ed' Magic",
    description: "Most regular verbs in Simple Past just add '-ed'. It's like adding a time stamp!",
    tense: "past",
    icon: Sparkles,
    color: "past",
    examples: ["walk → walked", "play → played", "talk → talked", "Exception: irregular verbs (go → went)"],
  },
  {
    id: 3,
    title: "The '-ing' Signal",
    description: "When you see '-ing' with is/am/are, it's Present Continuous. With was/were, it's Past Continuous!",
    tense: "all",
    icon: Target,
    color: "present",
    examples: [
      "am/is/are + ing = Present Continuous",
      "was/were + ing = Past Continuous",
      "will be + ing = Future Continuous",
    ],
  },
  {
    id: 4,
    title: "Will Power",
    description: "'Will' always signals future tense. It's your crystal ball word!",
    tense: "future",
    icon: Zap,
    color: "future",
    examples: ["I will go", "She will help", "They will arrive"],
  },
  {
    id: 5,
    title: "The Perfect has 'Have'",
    description: "Perfect tenses always use 'have/has/had'. Remember: Has for he/she/it, Have for I/you/we/they.",
    tense: "all",
    icon: CheckCircle,
    color: "present",
    examples: ["Present Perfect: have/has + V3", "Past Perfect: had + V3", "Future Perfect: will have + V3"],
  },
  {
    id: 6,
    title: "Subject-Verb Agreement",
    description: "In Simple Present: He/She/It takes 's' or 'es'. I/You/We/They don't add anything!",
    tense: "present",
    icon: BookOpen,
    color: "present",
    examples: ["He walks (add s)", "She goes (add es)", "They walk (no change)", "I eat (no change)"],
  },
  {
    id: 7,
    title: "The Before-Before Rule",
    description: "Past Perfect = action completed BEFORE another past action. Think 'before the before'!",
    tense: "past",
    icon: ArrowRight,
    color: "past",
    examples: ["I had eaten before he came", "She had left when I arrived", "They had finished before the bell rang"],
  },
  {
    id: 8,
    title: "Continuous = Ongoing",
    description: "All continuous tenses show ongoing/progressive action. Look for 'be' + '-ing'!",
    tense: "all",
    icon: Lightbulb,
    color: "future",
    examples: ["is/am/are + ing = now", "was/were + ing = then", "will be + ing = later"],
  },
]

const tenseFormulas = {
  past: [
    { name: "Simple Past", formula: "Subject + V2", example: "I walked" },
    { name: "Past Continuous", formula: "Subject + was/were + V1+ing", example: "I was walking" },
    { name: "Past Perfect", formula: "Subject + had + V3", example: "I had walked" },
    { name: "Past Perfect Continuous", formula: "Subject + had been + V1+ing", example: "I had been walking" },
  ],
  present: [
    { name: "Simple Present", formula: "Subject + V1 (s/es)", example: "I walk / He walks" },
    { name: "Present Continuous", formula: "Subject + is/am/are + V1+ing", example: "I am walking" },
    { name: "Present Perfect", formula: "Subject + have/has + V3", example: "I have walked" },
    { name: "Present Perfect Continuous", formula: "Subject + have/has been + V1+ing", example: "I have been walking" },
  ],
  future: [
    { name: "Simple Future", formula: "Subject + will + V1", example: "I will walk" },
    { name: "Future Continuous", formula: "Subject + will be + V1+ing", example: "I will be walking" },
    { name: "Future Perfect", formula: "Subject + will have + V3", example: "I will have walked" },
    {
      name: "Future Perfect Continuous",
      formula: "Subject + will have been + V1+ing",
      example: "I will have been walking",
    },
  ],
}

export function TipsContent() {
  const [selectedTense, setSelectedTense] = useState<"all" | "past" | "present" | "future">("all")
  const { recordSectionVisit } = useChallenges()

  // Track section visit for Explorer badge
  useEffect(() => {
    recordSectionVisit("tips")
  }, [recordSectionVisit])

  const filteredTips =
    selectedTense === "all" ? tips : tips.filter((t) => t.tense === "all" || t.tense === selectedTense)

  return (
    <div className="space-y-8">
      {/* Filter tabs */}
      <Tabs value={selectedTense} onValueChange={(v) => setSelectedTense(v as typeof selectedTense)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Tips</TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-past data-[state=active]:text-primary-foreground">
            Past
          </TabsTrigger>
          <TabsTrigger
            value="present"
            className="data-[state=active]:bg-present data-[state=active]:text-primary-foreground"
          >
            Present
          </TabsTrigger>
          <TabsTrigger
            value="future"
            className="data-[state=active]:bg-future data-[state=active]:text-primary-foreground"
          >
            Future
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tips grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredTips.map((tip) => (
          <Card
            key={tip.id}
            className={cn(
              "border-2 transition-all hover:shadow-lg",
              tip.color === "past" && "hover:border-past",
              tip.color === "present" && "hover:border-present",
              tip.color === "future" && "hover:border-future",
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl",
                    tip.color === "past" && "bg-past-light",
                    tip.color === "present" && "bg-present-light",
                    tip.color === "future" && "bg-future-light",
                  )}
                >
                  <tip.icon
                    className={cn(
                      "h-6 w-6",
                      tip.color === "past" && "text-past",
                      tip.color === "present" && "text-present",
                      tip.color === "future" && "text-future",
                    )}
                  />
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    tip.color === "past" && "bg-past-light text-past",
                    tip.color === "present" && "bg-present-light text-present",
                    tip.color === "future" && "bg-future-light text-future",
                  )}
                >
                  {tip.tense === "all" ? "All Tenses" : tip.tense}
                </Badge>
              </div>
              <CardTitle className="text-xl mt-4">{tip.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{tip.description}</p>
              <div
                className={cn(
                  "p-4 rounded-xl space-y-2",
                  tip.color === "past" && "bg-past-light/50",
                  tip.color === "present" && "bg-present-light/50",
                  tip.color === "future" && "bg-future-light/50",
                )}
              >
                {tip.examples.map((example, i) => (
                  <p key={i} className="text-sm font-medium">
                    • {example}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formula cheat sheet */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Formula Cheat Sheet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="present">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger
                value="past"
                className="data-[state=active]:bg-past data-[state=active]:text-primary-foreground"
              >
                Past
              </TabsTrigger>
              <TabsTrigger
                value="present"
                className="data-[state=active]:bg-present data-[state=active]:text-primary-foreground"
              >
                Present
              </TabsTrigger>
              <TabsTrigger
                value="future"
                className="data-[state=active]:bg-future data-[state=active]:text-primary-foreground"
              >
                Future
              </TabsTrigger>
            </TabsList>

            {(["past", "present", "future"] as const).map((tense) => (
              <TabsContent key={tense} value={tense}>
                <div className="grid gap-4">
                  {tenseFormulas[tense].map((formula) => (
                    <div
                      key={formula.name}
                      className={cn(
                        "p-4 rounded-xl",
                        tense === "past" && "bg-past-light",
                        tense === "present" && "bg-present-light",
                        tense === "future" && "bg-future-light",
                      )}
                    >
                      <h4 className="font-semibold mb-2">{formula.name}</h4>
                      <p className="font-mono text-sm bg-background/80 p-2 rounded">{formula.formula}</p>
                      <p className="text-sm text-muted-foreground mt-2">Example: {formula.example}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
