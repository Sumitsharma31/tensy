"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useStreak } from "@/hooks/use-streak"
import { cn } from "@/lib/utils"
import { Flame, Calendar, Trophy, Target, Clock, Star, Award, Zap, CheckCircle } from "lucide-react"
import Link from "next/link"

const dailyChallenges = [
  {
    id: 1,
    title: "Complete 3 Quiz Questions",
    description: "Answer any 3 questions correctly in the Quiz section",
    progress: 2,
    total: 3,
    reward: 50,
    icon: Target,
    href: "/quiz",
  },
  {
    id: 2,
    title: "Build 5 Sentences",
    description: "Correctly build 5 sentences in Sentence Builder",
    progress: 3,
    total: 5,
    reward: 75,
    icon: Zap,
    href: "/builder",
  },
  {
    id: 3,
    title: "Play Word Rainfall",
    description: "Score at least 100 points in Word Rainfall game",
    progress: 0,
    total: 100,
    reward: 100,
    icon: Trophy,
    href: "/game/rainfall",
  },
]

const weeklyChallenges = [
  {
    id: 1,
    title: "7-Day Streak",
    description: "Practice for 7 consecutive days",
    progress: 5,
    total: 7,
    reward: 500,
  },
  {
    id: 2,
    title: "Master All Tenses",
    description: "Complete at least 1 quiz level for each tense type",
    progress: 8,
    total: 12,
    reward: 750,
  },
  {
    id: 3,
    title: "Perfect Score",
    description: "Get 100% accuracy in any game",
    progress: 0,
    total: 1,
    reward: 300,
  },
]

const badges = [
  { id: 1, name: "First Steps", description: "Complete your first lesson", earned: true, icon: Star },
  { id: 2, name: "Quick Learner", description: "Complete 10 lessons", earned: true, icon: Zap },
  { id: 3, name: "Grammar Guru", description: "Complete all easy levels", earned: false, icon: Award },
  { id: 4, name: "Streak Master", description: "Maintain a 30-day streak", earned: false, icon: Flame },
  { id: 5, name: "Perfect Score", description: "Get 100% in any quiz", earned: true, icon: CheckCircle },
  { id: 6, name: "Time Traveler", description: "Master all 12 tenses", earned: false, icon: Clock },
]

export function ChallengesContent() {
  const { currentStreak, longestStreak, totalDays, recordActivity } = useStreak()

  return (
    <div className="space-y-8">
      {/* Streak Card */}
      <Card className="border-2 border-future/30 bg-gradient-to-br from-future-light/50 to-transparent">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-future/20">
                <Flame className="h-10 w-10 text-future" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-future">{currentStreak}</h2>
                <p className="text-muted-foreground">Day Streak</p>
              </div>
            </div>

            <div className="flex gap-8 text-center">
              <div>
                <p className="text-2xl font-bold">{longestStreak}</p>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDays}</p>
                <p className="text-sm text-muted-foreground">Total Days</p>
              </div>
            </div>

            <Button onClick={recordActivity} className="bg-future hover:bg-future/90">
              <Flame className="h-4 w-4 mr-2" />
              Practice Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Challenges */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-present" />
          <h2 className="text-xl font-bold">Daily Challenges</h2>
          <Badge variant="secondary" className="ml-auto">
            Resets in 14h
          </Badge>
        </div>

        <div className="grid gap-4">
          {dailyChallenges.map((challenge) => {
            const isComplete = challenge.progress >= challenge.total
            const progressPercent = (challenge.progress / challenge.total) * 100

            return (
              <Card
                key={challenge.id}
                className={cn("border-2 transition-all", isComplete && "border-present bg-present-light/30")}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-xl",
                        isComplete ? "bg-present text-primary-foreground" : "bg-muted",
                      )}
                    >
                      <challenge.icon className="h-6 w-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{challenge.title}</h3>
                        {isComplete && <CheckCircle className="h-4 w-4 text-present shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{challenge.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Progress value={progressPercent} className="h-2 flex-1" />
                        <span className="text-sm font-medium whitespace-nowrap">
                          {challenge.progress}/{challenge.total}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className="whitespace-nowrap">
                        <Star className="h-3 w-3 mr-1" />
                        {challenge.reward} XP
                      </Badge>
                      {!isComplete && (
                        <Link href={challenge.href}>
                          <Button size="sm" variant="outline" className="bg-transparent">
                            Go
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Weekly Challenges */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-future" />
          <h2 className="text-xl font-bold">Weekly Challenges</h2>
          <Badge variant="secondary" className="ml-auto">
            Resets in 5 days
          </Badge>
        </div>

        <div className="grid gap-4">
          {weeklyChallenges.map((challenge) => {
            const isComplete = challenge.progress >= challenge.total
            const progressPercent = (challenge.progress / challenge.total) * 100

            return (
              <Card
                key={challenge.id}
                className={cn("border-2 transition-all", isComplete && "border-future bg-future-light/30")}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{challenge.title}</h3>
                        {isComplete && <CheckCircle className="h-4 w-4 text-future" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                      <div className="flex items-center gap-4">
                        <Progress value={progressPercent} className="h-2 flex-1 max-w-xs" />
                        <span className="text-sm font-medium">
                          {challenge.progress}/{challenge.total}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-future text-primary-foreground whitespace-nowrap">
                      <Star className="h-3 w-3 mr-1" />
                      {challenge.reward} XP
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-past" />
          <h2 className="text-xl font-bold">Badges</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <Card
              key={badge.id}
              className={cn(
                "border-2 text-center transition-all",
                badge.earned ? "border-past bg-past-light/30" : "opacity-60",
              )}
            >
              <CardHeader className="pb-2">
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full mx-auto",
                    badge.earned ? "bg-past text-primary-foreground" : "bg-muted",
                  )}
                >
                  <badge.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-base">{badge.name}</CardTitle>
                <CardDescription className="text-xs">{badge.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
