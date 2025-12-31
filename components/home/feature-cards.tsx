import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Gamepad2, Trophy, Lightbulb, Languages, Flame } from "lucide-react"

const features = [
  {
    title: "Learn Tenses",
    description: "Explore all 12 tenses with AI assistance, visual timelines, formulas, and native language support.",
    icon: BookOpen,
    href: "/playground",
    color: "present",
    badge: "AI-Powered",
  },
  {
    title: "Sentence Builder",
    description: "Drag and drop words to build correct sentences. Real-time feedback helps you learn.",
    icon: Gamepad2,
    href: "/builder",
    color: "future",
    badge: "Game",
  },
  {
    title: "Word Rainfall",
    description: "Catch falling words in the right order. Test your speed and grammar skills!",
    icon: Gamepad2,
    href: "/game/rainfall",
    color: "past",
    badge: "Game",
  },
  {
    title: "Quiz Challenge",
    description: "50+ levels per difficulty. MCQs, corrections, and instant feedback to track progress.",
    icon: Trophy,
    href: "/quiz",
    color: "present",
    badge: "150+ Levels",
  },
  {
    title: "Tips & Tricks",
    description: "Memorable rules and visual cues that make grammar stick in your mind forever.",
    icon: Lightbulb,
    href: "/tips",
    color: "future",
    badge: "Quick Learn",
  },
  {
    title: "AI Translate",
    description: "AI-powered translation from your native language to English with tense detection and breakdown.",
    icon: Languages,
    href: "/translate",
    color: "past",
    badge: "AI + 6 Languages",
  },
]

export function FeatureCards() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Master Grammar</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From AI-powered assistance to playful games, our tools adapt to your learning style and level.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href}>
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 group border-2 border-transparent hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                        feature.color === "past"
                          ? "bg-past-light"
                          : feature.color === "present"
                            ? "bg-present-light"
                            : "bg-future-light"
                      }`}
                    >
                      <feature.icon
                        className={`h-6 w-6 ${
                          feature.color === "past"
                            ? "text-past"
                            : feature.color === "present"
                              ? "text-present"
                              : "text-future"
                        }`}
                      />
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${
                        feature.color === "past"
                          ? "bg-past-light text-past"
                          : feature.color === "present"
                            ? "bg-present-light text-present"
                            : "bg-future-light text-future"
                      }`}
                    >
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Streak card */}
        <Card className="mt-8 border-2 border-future/30 bg-gradient-to-r from-future-light/50 to-transparent">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-future/10">
                <Flame className="h-8 w-8 text-future" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Build Your Streak</h3>
                <p className="text-muted-foreground">
                  Practice daily to maintain your learning streak and earn badges!
                </p>
              </div>
            </div>
            <Link href="/challenges">
              <Badge
                variant="outline"
                className="text-lg px-6 py-2 border-future text-future hover:bg-future hover:text-primary-foreground transition-colors cursor-pointer"
              >
                View Challenges
              </Badge>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
