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
    weeklyCompleted: boolean
    lastReset: string
  }
  lifetimeStats: {
    totalQuizQuestions: number
    totalSentencesBuilt: number
    totalTranslations: number
    highestRainfallScore: number
    sectionsVisited: string[]
    easyLevelsCompleted: string[]
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
    weeklyCompleted: false,
    lastReset: getWeekStart(),
  },
  lifetimeStats: {
    totalQuizQuestions: 0,
    totalSentencesBuilt: 0,
    totalTranslations: 0,
    highestRainfallScore: 0,
    sectionsVisited: [],
    easyLevelsCompleted: [],
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
            weeklyCompleted: false,
            lastReset: weekStart,
          }
        }

        // Ensure lifetimeStats exists for older data
        if (!parsed.lifetimeStats) {
          parsed.lifetimeStats = {
            totalQuizQuestions: 0,
            totalSentencesBuilt: 0,
            totalTranslations: 0,
            highestRainfallScore: 0,
            sectionsVisited: [],
            easyLevelsCompleted: [],
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

  // Helper to check and award XP milestone badges
  const checkXPBadges = useCallback((newData: ChallengesData) => {
    // XP Hunter badge - earn 1000 total XP
    if (newData.totalXP >= 1000 && !newData.badges["xp-hunter"]) {
      newData.badges["xp-hunter"] = {
        earned: true,
        earnedDate: new Date().toISOString(),
      }
      newData.totalXP += 100
    }
  }, [])

  // Record a correct quiz question
  const recordQuizQuestion = useCallback(() => {
    setData((prev) => {
      const totalQuestions = (prev.lifetimeStats?.totalQuizQuestions || 0) + 1
      const newData = {
        ...prev,
        dailyChallenges: {
          ...prev.dailyChallenges,
          quizQuestionsCorrect: prev.dailyChallenges.quizQuestionsCorrect + 1,
        },
        lifetimeStats: {
          ...prev.lifetimeStats,
          totalQuizQuestions: totalQuestions,
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

      // Century Club badge - answer 100 quiz questions
      if (totalQuestions >= 100 && !newData.badges["century-club"]) {
        newData.badges["century-club"] = {
          earned: true,
          earnedDate: new Date().toISOString(),
        }
        newData.totalXP += 150
      }

      // Award XP for completing daily challenge
      if (newData.dailyChallenges.quizQuestionsCorrect === 3 && prev.dailyChallenges.quizQuestionsCorrect < 3) {
        newData.totalXP += 50
      }

      checkXPBadges(newData)

      try {
        localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
      } catch {}
      return newData
    })
  }, [checkXPBadges])

  // Record a completed sentence build
  const recordSentenceBuilt = useCallback(() => {
    setData((prev) => {
      const totalSentences = (prev.lifetimeStats?.totalSentencesBuilt || 0) + 1
      const newData = {
        ...prev,
        dailyChallenges: {
          ...prev.dailyChallenges,
          sentencesBuilt: prev.dailyChallenges.sentencesBuilt + 1,
        },
        lifetimeStats: {
          ...prev.lifetimeStats,
          totalSentencesBuilt: totalSentences,
        },
      }

      // Builder Pro badge - build 50 sentences total
      if (totalSentences >= 50 && !newData.badges["builder-pro"]) {
        newData.badges["builder-pro"] = {
          earned: true,
          earnedDate: new Date().toISOString(),
        }
        newData.totalXP += 100
      }

      // Award XP for completing daily challenge
      if (newData.dailyChallenges.sentencesBuilt === 5 && prev.dailyChallenges.sentencesBuilt < 5) {
        newData.totalXP += 75
      }

      checkXPBadges(newData)

      try {
        localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
      } catch {}
      return newData
    })
  }, [checkXPBadges])

  // Record rainfall game score
  const recordRainfallScore = useCallback((score: number) => {
    setData((prev) => {
      const highestScore = Math.max(prev.lifetimeStats?.highestRainfallScore || 0, score)
      const newData = {
        ...prev,
        dailyChallenges: {
          ...prev.dailyChallenges,
          rainfallHighScore: Math.max(prev.dailyChallenges.rainfallHighScore, score),
        },
        lifetimeStats: {
          ...prev.lifetimeStats,
          highestRainfallScore: highestScore,
        },
      }

      // Rainfall Champion badge - score 500+ in Rainfall
      if (highestScore >= 500 && !newData.badges["rainfall-champion"]) {
        newData.badges["rainfall-champion"] = {
          earned: true,
          earnedDate: new Date().toISOString(),
        }
        newData.totalXP += 150
      }

      // Award XP for completing daily challenge (first time reaching 100)
      if (newData.dailyChallenges.rainfallHighScore >= 100 && prev.dailyChallenges.rainfallHighScore < 100) {
        newData.totalXP += 100
      }

      checkXPBadges(newData)

      try {
        localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
      } catch {}
      return newData
    })
  }, [checkXPBadges])

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
      let newData = { ...prev }
      let changed = false

      // Dedicated Learner badge - 7-day streak
      if (streak >= 7 && !prev.badges["dedicated-learner"]) {
        newData = {
          ...newData,
          badges: {
            ...newData.badges,
            "dedicated-learner": {
              earned: true,
              earnedDate: new Date().toISOString(),
            },
          },
          totalXP: newData.totalXP + 75,
        }
        changed = true
      }

      // Streak Master badge - 30-day streak
      if (streak >= 30 && !prev.badges["streak-master"]) {
        newData = {
          ...newData,
          badges: {
            ...newData.badges,
            "streak-master": {
              earned: true,
              earnedDate: new Date().toISOString(),
            },
          },
          totalXP: newData.totalXP + 200,
        }
        changed = true
      }

      if (changed) {
        try {
          localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
        } catch {}
        return newData
      }
      return prev
    })
  }, [])

  // Record translation completed
  const recordTranslation = useCallback(() => {
    setData((prev) => {
      const totalTranslations = (prev.lifetimeStats?.totalTranslations || 0) + 1
      const newData = {
        ...prev,
        lifetimeStats: {
          ...prev.lifetimeStats,
          totalTranslations: totalTranslations,
        },
      }

      // Translator badge - translate 20 sentences
      if (totalTranslations >= 20 && !newData.badges["translator"]) {
        newData.badges["translator"] = {
          earned: true,
          earnedDate: new Date().toISOString(),
        }
        newData.totalXP += 100
      }

      checkXPBadges(newData)

      try {
        localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
      } catch {}
      return newData
    })
  }, [checkXPBadges])

  // Record section visited for Explorer badge
  const recordSectionVisit = useCallback((section: string) => {
    setData((prev) => {
      const currentVisited = prev.lifetimeStats?.sectionsVisited || []
      if (currentVisited.includes(section)) {
        return prev
      }

      const newVisited = [...currentVisited, section]
      const newData = {
        ...prev,
        lifetimeStats: {
          ...prev.lifetimeStats,
          sectionsVisited: newVisited,
        },
      }

      // All main sections: quiz, builder, rainfall, translate, tips, search, playground, challenges
      const allSections = ["quiz", "builder", "rainfall", "translate", "tips", "search", "playground", "challenges"]
      const visitedAllSections = allSections.every(s => newVisited.includes(s))

      // Explorer badge - visit all sections
      if (visitedAllSections && !newData.badges["explorer"]) {
        newData.badges["explorer"] = {
          earned: true,
          earnedDate: new Date().toISOString(),
        }
        newData.totalXP += 100
      }

      try {
        localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
      } catch {}
      return newData
    })
  }, [])

  // Record easy level completion for Grammar Guru badge
  const recordEasyLevelComplete = useCallback((tense: string) => {
    setData((prev) => {
      const currentCompleted = prev.lifetimeStats?.easyLevelsCompleted || []
      if (currentCompleted.includes(tense)) {
        return prev
      }

      const newCompleted = [...currentCompleted, tense]
      const newData = {
        ...prev,
        lifetimeStats: {
          ...prev.lifetimeStats,
          easyLevelsCompleted: newCompleted,
        },
      }

      // Grammar Guru badge - complete all 12 easy levels
      if (newCompleted.length >= 12 && !newData.badges["grammar-guru"]) {
        newData.badges["grammar-guru"] = {
          earned: true,
          earnedDate: new Date().toISOString(),
        }
        newData.totalXP += 200
      }

      try {
        localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
      } catch {}
      return newData
    })
  }, [])

  // Record weekly challenges completion for Weekly Warrior badge
  const recordWeeklyComplete = useCallback(() => {
    setData((prev) => {
      if (prev.weeklyChallenges.weeklyCompleted) {
        return prev
      }

      const newData = {
        ...prev,
        weeklyChallenges: {
          ...prev.weeklyChallenges,
          weeklyCompleted: true,
        },
      }

      // Weekly Warrior badge
      if (!newData.badges["weekly-warrior"]) {
        newData.badges["weekly-warrior"] = {
          earned: true,
          earnedDate: new Date().toISOString(),
        }
        newData.totalXP += 250
      }

      try {
        localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
      } catch {}
      return newData
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
      // Starter badges
      { id: "first-steps", name: "First Steps", description: "Complete your first lesson" },
      { id: "quick-learner", name: "Quick Learner", description: "Complete 10 lessons" },
      // Streak badges
      { id: "dedicated-learner", name: "Dedicated Learner", description: "Maintain a 7-day streak" },
      { id: "streak-master", name: "Streak Master", description: "Maintain a 30-day streak" },
      // Activity badges
      { id: "builder-pro", name: "Builder Pro", description: "Build 50 sentences" },
      { id: "rainfall-champion", name: "Rainfall Champion", description: "Score 500+ in Word Rainfall" },
      { id: "translator", name: "Translator", description: "Translate 20 sentences" },
      { id: "century-club", name: "Century Club", description: "Answer 100 quiz questions" },
      // Mastery badges
      { id: "grammar-guru", name: "Grammar Guru", description: "Complete all easy levels" },
      { id: "perfect-score", name: "Perfect Score", description: "Get 100% in any quiz" },
      { id: "time-traveler", name: "Time Traveler", description: "Master all 12 tenses" },
      // Special badges
      { id: "explorer", name: "Explorer", description: "Visit all app sections" },
      { id: "weekly-warrior", name: "Weekly Warrior", description: "Complete all weekly challenges" },
      { id: "xp-hunter", name: "XP Hunter", description: "Earn 1000 total XP" },
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
    lifetimeStats: data.lifetimeStats,
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
    recordTranslation,
    recordSectionVisit,
    recordEasyLevelComplete,
    recordWeeklyComplete,
  }
}
