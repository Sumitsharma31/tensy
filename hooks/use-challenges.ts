"use client"

import { useState, useEffect, useCallback } from "react"

const CHALLENGES_KEY = "tense-playground-challenges"

export interface DailyChallenge {
  id: string
  title: string
  description: string
  progress: number
  total: number
  reward: number
  type: "quiz" | "builder" | "rainfall"
  href: string
  completed: boolean
}

export interface WeeklyChallenge {
  id: string
  title: string
  description: string
  progress: number
  total: number
  reward: number
  type: "streak" | "tenses" | "perfect"
  completed: boolean
}

export interface Badge {
  id: string
  name: string
  description: string
  earned: boolean
  earnedDate?: string
}

interface ChallengesData {
  dailyChallenges: {
    quizQuestionsCorrect: number
    sentencesBuilt: number
    rainfallHighScore: number
    lastReset: string
  }
  weeklyChallenges: {
    tensesCompleted: string[]
    perfectScoreAchieved: boolean
    lastReset: string
  }
  badges: Record<string, { earned: boolean; earnedDate?: string }>
  totalXP: number
}

const getDefaultData = (): ChallengesData => ({
  dailyChallenges: {
    quizQuestionsCorrect: 0,
    sentencesBuilt: 0,
    rainfallHighScore: 0,
    lastReset: new Date().toISOString().split("T")[0],
  },
  weeklyChallenges: {
    tensesCompleted: [],
    perfectScoreAchieved: false,
    lastReset: getWeekStart(),
  },
  badges: {},
  totalXP: 0,
})

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(now.setDate(diff)).toISOString().split("T")[0]
}

function getHoursUntilMidnight(): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60))
}

function getDaysUntilWeekEnd(): number {
  const now = new Date()
  const day = now.getDay()
  return day === 0 ? 0 : 7 - day
}

export function useChallenges() {
  const [data, setData] = useState<ChallengesData>(getDefaultData())
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage and check for resets
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHALLENGES_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as ChallengesData
        const today = new Date().toISOString().split("T")[0]
        const weekStart = getWeekStart()

        // Reset daily challenges if new day
        if (parsed.dailyChallenges.lastReset !== today) {
          parsed.dailyChallenges = {
            quizQuestionsCorrect: 0,
            sentencesBuilt: 0,
            rainfallHighScore: 0,
            lastReset: today,
          }
        }

        // Reset weekly challenges if new week
        if (parsed.weeklyChallenges.lastReset !== weekStart) {
          parsed.weeklyChallenges = {
            tensesCompleted: [],
            perfectScoreAchieved: false,
            lastReset: weekStart,
          }
        }

        setData(parsed)
        localStorage.setItem(CHALLENGES_KEY, JSON.stringify(parsed))
      }
    } catch {
      // localStorage not available
    }
    setIsLoaded(true)
  }, [])

  const saveData = useCallback((newData: ChallengesData) => {
    setData(newData)
    try {
      localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
    } catch {
      // Storage not available
    }
  }, [])

  // Record a correct quiz question
  const recordQuizQuestion = useCallback(() => {
    setData((prev) => {
      const newData = {
        ...prev,
        dailyChallenges: {
          ...prev.dailyChallenges,
          quizQuestionsCorrect: prev.dailyChallenges.quizQuestionsCorrect + 1,
        },
      }
      
      // Check for badge: complete first quiz question
      if (!newData.badges["first-steps"]) {
        newData.badges["first-steps"] = {
          earned: true,
          earnedDate: new Date().toISOString(),
        }
        newData.totalXP += 25
      }

      // Award XP for completing daily challenge
      if (newData.dailyChallenges.quizQuestionsCorrect === 3 && prev.dailyChallenges.quizQuestionsCorrect < 3) {
        newData.totalXP += 50
      }

      try {
        localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
      } catch {}
      return newData
    })
  }, [])

  // Record a completed sentence build
  const recordSentenceBuilt = useCallback(() => {
    setData((prev) => {
      const newData = {
        ...prev,
        dailyChallenges: {
          ...prev.dailyChallenges,
          sentencesBuilt: prev.dailyChallenges.sentencesBuilt + 1,
        },
      }

      // Award XP for completing daily challenge
      if (newData.dailyChallenges.sentencesBuilt === 5 && prev.dailyChallenges.sentencesBuilt < 5) {
        newData.totalXP += 75
      }

      try {
        localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
      } catch {}
      return newData
    })
  }, [])

  // Record rainfall game score
  const recordRainfallScore = useCallback((score: number) => {
    setData((prev) => {
      const newData = {
        ...prev,
        dailyChallenges: {
          ...prev.dailyChallenges,
          rainfallHighScore: Math.max(prev.dailyChallenges.rainfallHighScore, score),
        },
      }

      // Award XP for completing daily challenge (first time reaching 100)
      if (newData.dailyChallenges.rainfallHighScore >= 100 && prev.dailyChallenges.rainfallHighScore < 100) {
        newData.totalXP += 100
      }

      try {
        localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
      } catch {}
      return newData
    })
  }, [])

  // Record tense completion for weekly challenge
  const recordTenseCompleted = useCallback((tenseName: string) => {
    setData((prev) => {
      if (prev.weeklyChallenges.tensesCompleted.includes(tenseName)) {
        return prev
      }

      const newData = {
        ...prev,
        weeklyChallenges: {
          ...prev.weeklyChallenges,
          tensesCompleted: [...prev.weeklyChallenges.tensesCompleted, tenseName],
        },
      }

      // Award XP for completing all 12 tenses
      if (newData.weeklyChallenges.tensesCompleted.length === 12) {
        newData.totalXP += 750
        // Award Time Traveler badge
        if (!newData.badges["time-traveler"]) {
          newData.badges["time-traveler"] = {
            earned: true,
            earnedDate: new Date().toISOString(),
          }
        }
      }

      try {
        localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
      } catch {}
      return newData
    })
  }, [])

  // Record a perfect score (100% accuracy)
  const recordPerfectScore = useCallback(() => {
    setData((prev) => {
      const newData = {
        ...prev,
        weeklyChallenges: {
          ...prev.weeklyChallenges,
          perfectScoreAchieved: true,
        },
      }

      // Award XP first time
      if (!prev.weeklyChallenges.perfectScoreAchieved) {
        newData.totalXP += 300
      }

      // Award Perfect Score badge
      if (!newData.badges["perfect-score"]) {
        newData.badges["perfect-score"] = {
          earned: true,
          earnedDate: new Date().toISOString(),
        }
      }

      try {
        localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
      } catch {}
      return newData
    })
  }, [])

  // Record quick learner badge (after 10 completions)
  const recordLessonComplete = useCallback((count: number) => {
    setData((prev) => {
      if (count >= 10 && !prev.badges["quick-learner"]) {
        const newData = {
          ...prev,
          badges: {
            ...prev.badges,
            "quick-learner": {
              earned: true,
              earnedDate: new Date().toISOString(),
            },
          },
          totalXP: prev.totalXP + 50,
        }
        try {
          localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
        } catch {}
        return newData
      }
      return prev
    })
  }, [])

  // Award streak master badge
  const recordStreakMaster = useCallback((streak: number) => {
    setData((prev) => {
      if (streak >= 30 && !prev.badges["streak-master"]) {
        const newData = {
          ...prev,
          badges: {
            ...prev.badges,
            "streak-master": {
              earned: true,
              earnedDate: new Date().toISOString(),
            },
          },
          totalXP: prev.totalXP + 200,
        }
        try {
          localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
        } catch {}
        return newData
      }
      return prev
    })
  }, [])

  // Get daily challenges with current progress
  const getDailyChallenges = useCallback((): DailyChallenge[] => {
    return [
      {
        id: "quiz",
        title: "Complete 3 Quiz Questions",
        description: "Answer any 3 questions correctly in the Quiz section",
        progress: Math.min(data.dailyChallenges.quizQuestionsCorrect, 3),
        total: 3,
        reward: 50,
        type: "quiz",
        href: "/quiz",
        completed: data.dailyChallenges.quizQuestionsCorrect >= 3,
      },
      {
        id: "builder",
        title: "Build 5 Sentences",
        description: "Correctly build 5 sentences in Sentence Builder",
        progress: Math.min(data.dailyChallenges.sentencesBuilt, 5),
        total: 5,
        reward: 75,
        type: "builder",
        href: "/builder",
        completed: data.dailyChallenges.sentencesBuilt >= 5,
      },
      {
        id: "rainfall",
        title: "Play Word Rainfall",
        description: "Score at least 100 points in Word Rainfall game",
        progress: Math.min(data.dailyChallenges.rainfallHighScore, 100),
        total: 100,
        reward: 100,
        type: "rainfall",
        href: "/game/rainfall",
        completed: data.dailyChallenges.rainfallHighScore >= 100,
      },
    ]
  }, [data.dailyChallenges])

  // Get weekly challenges with current progress
  const getWeeklyChallenges = useCallback((currentStreak: number): WeeklyChallenge[] => {
    return [
      {
        id: "streak",
        title: "7-Day Streak",
        description: "Practice for 7 consecutive days",
        progress: Math.min(currentStreak, 7),
        total: 7,
        reward: 500,
        type: "streak",
        completed: currentStreak >= 7,
      },
      {
        id: "tenses",
        title: "Master All Tenses",
        description: "Complete at least 1 quiz level for each tense type",
        progress: data.weeklyChallenges.tensesCompleted.length,
        total: 12,
        reward: 750,
        type: "tenses",
        completed: data.weeklyChallenges.tensesCompleted.length >= 12,
      },
      {
        id: "perfect",
        title: "Perfect Score",
        description: "Get 100% accuracy in any game",
        progress: data.weeklyChallenges.perfectScoreAchieved ? 1 : 0,
        total: 1,
        reward: 300,
        type: "perfect",
        completed: data.weeklyChallenges.perfectScoreAchieved,
      },
    ]
  }, [data.weeklyChallenges])

  // Get badges with earned status
  const getBadges = useCallback((): Badge[] => {
    const badgeDefinitions = [
      { id: "first-steps", name: "First Steps", description: "Complete your first lesson" },
      { id: "quick-learner", name: "Quick Learner", description: "Complete 10 lessons" },
      { id: "grammar-guru", name: "Grammar Guru", description: "Complete all easy levels" },
      { id: "streak-master", name: "Streak Master", description: "Maintain a 30-day streak" },
      { id: "perfect-score", name: "Perfect Score", description: "Get 100% in any quiz" },
      { id: "time-traveler", name: "Time Traveler", description: "Master all 12 tenses" },
    ]

    return badgeDefinitions.map((badge) => ({
      ...badge,
      earned: data.badges[badge.id]?.earned || false,
      earnedDate: data.badges[badge.id]?.earnedDate,
    }))
  }, [data.badges])

  return {
    isLoaded,
    totalXP: data.totalXP,
    hoursUntilDailyReset: getHoursUntilMidnight(),
    daysUntilWeeklyReset: getDaysUntilWeekEnd(),
    getDailyChallenges,
    getWeeklyChallenges,
    getBadges,
    recordQuizQuestion,
    recordSentenceBuilt,
    recordRainfallScore,
    recordTenseCompleted,
    recordPerfectScore,
    recordLessonComplete,
    recordStreakMaster,
  }
}
