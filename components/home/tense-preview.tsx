"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TenseTimeline } from "@/components/tense/tense-timeline"
import { AudioButton } from "@/components/common/audio-button"

const tenseExamples = {
  past: [
    { sentence: "I walked to school yesterday.", formula: "Subject + V2 + Object" },
    { sentence: "She was reading when I called.", formula: "Subject + was/were + V1+ing" },
    { sentence: "They had finished before we arrived.", formula: "Subject + had + V3" },
  ],
  present: [
    { sentence: "I drink coffee every morning.", formula: "Subject + V1(s/es) + Object" },
    { sentence: "She is writing a letter now.", formula: "Subject + is/am/are + V1+ing" },
    { sentence: "We have completed the project.", formula: "Subject + have/has + V3" },
  ],
  future: [
    { sentence: "I will visit Paris next year.", formula: "Subject + will + V1 + Object" },
    { sentence: "They will be traveling tomorrow.", formula: "Subject + will be + V1+ing" },
    { sentence: "She will have graduated by June.", formula: "Subject + will have + V3" },
  ],
}

export function TensePreview() {
  const [activeTense, setActiveTense] = useState<"past" | "present" | "future">("present")

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore the Timeline of Tenses</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tap on any tense to see examples. Understanding when actions happen is the key to mastering grammar.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader>
              <TenseTimeline activeTense={activeTense} onTenseSelect={setActiveTense} />
            </CardHeader>
            <CardContent>
              <Tabs value={activeTense} onValueChange={(v) => setActiveTense(v as "past" | "present" | "future")}>
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
                  <TabsContent key={tense} value={tense} className="space-y-4">
                    {tenseExamples[tense].map((example, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-4 p-4 rounded-xl ${
                          tense === "past"
                            ? "bg-past-light"
                            : tense === "present"
                              ? "bg-present-light"
                              : "bg-future-light"
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-lg mb-1">{example.sentence}</p>
                          <Badge variant="outline" className="font-mono text-xs">
                            {example.formula}
                          </Badge>
                        </div>
                        <AudioButton text={example.sentence} />
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
