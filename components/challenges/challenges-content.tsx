"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useStreakContext } from "@/components/providers/streak-provider"
import { useChallenges } from "@/hooks/use-challenges"
import { cn } from "@/lib/utils"
import { Flame, Calendar, Trophy, Target, Clock, Star, Award, Zap, CheckCircle, Coins, Compass, Hammer, Droplets, Languages, Medal, Crown, Sparkles } from "lucide-react"
import Link from "next/link"

const challengeIcons = {
  quiz: Target,
  builder: Zap,
  rainfall: Trophy,
}

const badgeIcons: Record<string, typeof Star> = {
  // Starter badges
  "first-steps": Star,
  "quick-learner": Zap,
  // Streak badges
  "dedicated-learner": Calendar,
  "streak-master": Flame,
  // Activity badges
  "builder-pro": Hammer,
  "rainfall-champion": Droplets,
  "translator": Languages,
  "century-club": Medal,
  // Mastery badges
  "grammar-guru": Award,
  "perfect-score": CheckCircle,
  "time-traveler": Clock,
  // Special badges
  "explorer": Compass,
  "weekly-warrior": Crown,
  "xp-hunter": Sparkles,
}

import { useEffect } from "react"

export function ChallengesContent() {
  const { currentStreak, longestStreak, totalDays, recordActivity } = useStreakContext()
  const {
    isLoaded,
    totalXP,
    hoursUntilDailyReset,
    daysUntilWeeklyReset,
    getDailyChallenges,
    getWeeklyChallenges,
    getBadges,
    recordStreakMaster,
    recordSectionVisit,
    recordWeeklyComplete,
  } = useChallenges()

  // Track section visit for Explorer badge
  useEffect(() => {
    if (isLoaded) {
      recordSectionVisit("challenges")
    }
  }, [isLoaded, recordSectionVisit])

  // Check for streak badges
  useEffect(() => {
    if (currentStreak >= 7) {
      recordStreakMaster(currentStreak)
    }
  }, [currentStreak, recordStreakMaster])

  const dailyChallenges = getDailyChallenges()
  const weeklyChallenges = getWeeklyChallenges(currentStreak)
  const badges = getBadges()

  // Check if all weekly challenges are complete for Weekly Warrior badge
  useEffect(() => {
    const allWeeklyComplete = weeklyChallenges.every(c => c.completed)
    if (allWeeklyComplete && weeklyChallenges.length > 0) {
      recordWeeklyComplete()
    }
  }, [weeklyChallenges, recordWeeklyComplete])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

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
              <div>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  {totalXP}
                </p>
                <p className="text-sm text-muted-foreground">Total XP</p>
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
            Resets in {hoursUntilDailyReset}h
          </Badge>
        </div>

        <div className="grid gap-4">
          {dailyChallenges.map((challenge) => {
            const isComplete = challenge.completed
            const progressPercent = (challenge.progress / challenge.total) * 100
            const IconComponent = challengeIcons[challenge.type]

            return (
              <Card
                key={challenge.id}
                className={cn("border-2 transition-all", isComplete && "border-present bg-present-light/30")}
              >
                <CardContent className="py-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg shrink-0",
                            isComplete ? "bg-present text-primary-foreground" : "bg-muted",
                          )}
                        >
                          <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <h3 className="font-semibold">{challenge.title}</h3>
                        {isComplete && <CheckCircle className="h-4 w-4 text-present shrink-0" />}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge className="bg-present text-primary-foreground whitespace-nowrap">
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
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    <div className="flex items-center gap-4">
                      <Progress value={progressPercent} className="h-2 flex-1" />
                      <span className="text-sm font-medium whitespace-nowrap">
                        {challenge.progress}/{challenge.total}
                      </span>
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
            Resets in {daysUntilWeeklyReset} days
          </Badge>
        </div>

        <div className="grid gap-4">
          {weeklyChallenges.map((challenge) => {
            const isComplete = challenge.completed
            const progressPercent = (challenge.progress / challenge.total) * 100

            return (
              <Card
                key={challenge.id}
                className={cn("border-2 transition-all", isComplete && "border-future bg-future-light/30")}
              >
                <CardContent className="py-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{challenge.title}</h3>
                        {isComplete && <CheckCircle className="h-4 w-4 text-future" />}
                      </div>
                      <Badge className="bg-future text-primary-foreground whitespace-nowrap shrink-0">
                        <Star className="h-3 w-3 mr-1" />
                        {challenge.reward} XP
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    <div className="flex items-center gap-4">
                      <Progress value={progressPercent} className="h-2 flex-1" />
                      <span className="text-sm font-medium whitespace-nowrap">
                        {challenge.progress}/{challenge.total}
                      </span>
                    </div>
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
          <Badge variant="secondary" className="ml-auto">
            {badges.filter(b => b.earned).length}/{badges.length} Earned
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {badges.map((badge) => {
            const IconComponent = badgeIcons[badge.id] || Star
            return (
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
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-base">{badge.name}</CardTitle>
                  <CardDescription className="text-xs">{badge.description}</CardDescription>
                  {badge.earned && badge.earnedDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Earned {new Date(badge.earnedDate).toLocaleDateString()}
                    </p>
                  )}
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
