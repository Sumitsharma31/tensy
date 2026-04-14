"use client"

// @ts-nocheck - Supabase types need to be regenerated to match updated schema
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast" // Added

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
  const { userId: clerkUserId, isSignedIn } = useAuth()
  const [data, setData] = useState<ChallengesData>(getDefaultData())
  const [isLoaded, setIsLoaded] = useState(false)
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null)

  const { toast } = useToast() // Added

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Always load from localStorage first for immediate display
        const saved = localStorage.getItem(CHALLENGES_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          const today = new Date().toISOString().split("T")[0]

          // Check if it's a new day, if so, reset daily stats
          if (parsed.dailyChallenges.lastReset !== today) {
            parsed.dailyChallenges = {
              ...getDefaultData().dailyChallenges,
              lastReset: today
            }
            // Keep weekly if same week? For now, let's trust getWeekStart handling in default or check weekly reset logic distinct.
            // But for daily, we MUST reset.
            localStorage.setItem(CHALLENGES_KEY, JSON.stringify(parsed))
          }

          setData(parsed)
        }

        // If signed in, try to load from Supabase
        if (isSignedIn && clerkUserId) {
          const today = new Date().toISOString().split("T")[0]

          // Get Supabase user_id
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', clerkUserId)
            .single()

          if (userData) {
            setSupabaseUserId(userData.id)

            // Fetch from Supabase
            const { data: progress } = await supabase
              .from('user_progress')
              .select('total_xp')
              .eq('user_id', userData.id)
              .maybeSingle()

            const { data: challenges } = await supabase
              .from('user_challenges')
              .select('*')
              .eq('user_id', userData.id)
              .eq('challenge_date', today)
              .maybeSingle()

            const { data: badges } = await supabase
              .from('user_badges')
              .select('badge_id, earned_at')
              .eq('user_id', userData.id)

            // Build data from DB
            const dbData: ChallengesData = {
              dailyChallenges: {
                quizQuestionsCorrect: (challenges as any)?.quiz_questions_completed || 0,
                sentencesBuilt: (challenges as any)?.sentences_built || 0,
                rainfallHighScore: (challenges as any)?.rainfall_score || 0,
                lastReset: today,
              },
              weeklyChallenges: {
                tensesCompleted: (challenges as any)?.tenses_completed || [],
                perfectScoreAchieved: (challenges as any)?.perfect_score_achieved || false,
                weeklyCompleted: (challenges as any)?.weekly_completed || false,
                lastReset: getWeekStart(),
              },
              lifetimeStats: saved ? JSON.parse(saved).lifetimeStats : getDefaultData().lifetimeStats,
              badges: {},
              totalXP: (progress as any)?.total_xp || 0,
            }

            if (badges) {
              badges.forEach((badge: any) => {
                dbData.badges[badge.badge_id] = {
                  earned: true,
                  earnedDate: badge.earned_at,
                }
              })
            }

            setData(dbData)
            localStorage.setItem(CHALLENGES_KEY, JSON.stringify(dbData))
          }
        }
      } catch (error) {
        console.error('Failed to load challenges:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadData()
  }, [clerkUserId, isSignedIn])

  // Helper to save both to state and localStorage, optionally to Supabase
  const saveData = useCallback((newData: ChallengesData, syncToSupabase = false) => {
    setData(newData)
    localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
    return newData
  }, [])

  // Record a correct quiz question
  const recordQuizQuestion = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0]

    setData((prev) => {
      const newProgress = prev.dailyChallenges.quizQuestionsCorrect + 1
      const totalQuestions = (prev.lifetimeStats?.totalQuizQuestions || 0) + 1

      // Calculate XP reward if challenge just completed
      let xpReward = 0
      if (newProgress === 3 && prev.dailyChallenges.quizQuestionsCorrect < 3) {
        xpReward = 50
      }

      const newData = {
        ...prev,
        dailyChallenges: {
          ...prev.dailyChallenges,
          quizQuestionsCorrect: newProgress,
        },
        lifetimeStats: {
          ...prev.lifetimeStats,
          totalQuizQuestions: totalQuestions,
        },
        totalXP: prev.totalXP + xpReward, // CRITICAL: Add XP to total!
      }

      // Save to localStorage
      localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))

      // Async update to Supabase if authenticated
      if (supabaseUserId) {
        (async () => {
          try {
            await supabase
              .from('user_challenges')
              .upsert({
                user_id: supabaseUserId,
                challenge_date: today,
                quiz_questions_completed: newProgress,
              }, {
                onConflict: 'user_id,challenge_date',
              })

            if (xpReward > 0) {
              const { error } = await supabase.rpc('increment_xp', { amount: xpReward })
              if (error) console.error('XP increment failed:', error)
            }
          } catch (error) {
            console.error('Supabase update failed:', error)
          }
        })()
      }

      return newData
    })
  }, [supabaseUserId])

  // Record a completed sentence build
  const recordSentenceBuilt = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0]

    setData((prev) => {
      const newProgress = prev.dailyChallenges.sentencesBuilt + 1
      const totalSentences = (prev.lifetimeStats?.totalSentencesBuilt || 0) + 1

      // Calculate XP reward
      let xpReward = 0
      if (newProgress === 5 && prev.dailyChallenges.sentencesBuilt < 5) {
        xpReward = 75
      }

      const newData = {
        ...prev,
        dailyChallenges: {
          ...prev.dailyChallenges,
          sentencesBuilt: newProgress,
        },
        lifetimeStats: {
          ...prev.lifetimeStats,
          totalSentencesBuilt: totalSentences,
        },
        totalXP: prev.totalXP + xpReward, // Add XP!
      }

      localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))

      if (supabaseUserId) {
        (async () => {
          try {
            await supabase
              .from('user_challenges')
              .upsert({
                user_id: supabaseUserId,
                challenge_date: today,
                sentences_built: newProgress,
              }, {
                onConflict: 'user_id,challenge_date',
              })

            if (xpReward > 0) {
              await supabase.rpc('increment_xp', { amount: xpReward })
            }
          } catch (error) {
            console.error('Supabase update failed:', error)
          }
        })()
      }

      return newData
    })
  }, [supabaseUserId])

  // Record rainfall score
  const recordRainfallScore = useCallback(async (score: number) => {
    const today = new Date().toISOString().split("T")[0]

    setData((prev) => {
      const newHighScore = Math.max(prev.dailyChallenges.rainfallHighScore, score)
      const highestScore = Math.max(prev.lifetimeStats?.highestRainfallScore || 0, score)

      // Calculate XP reward
      let xpReward = 0
      if (newHighScore >= 100 && prev.dailyChallenges.rainfallHighScore < 100) {
        xpReward = 100
        toast({
          title: "Challenge Completed!",
          description: "You earned 100 XP for scoring 100+ in Gravity Grammar.",
          variant: "default", // or custom style
        })
      }

      const newData = {
        ...prev,
        dailyChallenges: {
          ...prev.dailyChallenges,
          rainfallHighScore: newHighScore,
        },
        lifetimeStats: {
          ...prev.lifetimeStats,
          highestRainfallScore: highestScore,
        },
        totalXP: prev.totalXP + xpReward, // Add XP!
      }

      localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))

      if (supabaseUserId) {
        (async () => {
          try {
            await supabase
              .from('user_challenges')
              .upsert({
                user_id: supabaseUserId,
                challenge_date: today,
                rainfall_score: newHighScore,
              }, {
                onConflict: 'user_id,challenge_date',
              })

            if (xpReward > 0) {
              await supabase.rpc('increment_xp', { amount: xpReward })
            }
          } catch (error) {
            console.error('Supabase update failed:', error)
          }
        })()
      }

      return newData
    })
  }, [supabaseUserId])

  // Simplified stub functions for other features
  const recordTenseCompleted = useCallback((tenseName: string) => {
    setData(prev => {
      if (prev.weeklyChallenges.tensesCompleted.includes(tenseName)) return prev
      const newData = {
        ...prev,
        weeklyChallenges: {
          ...prev.weeklyChallenges,
          tensesCompleted: [...prev.weeklyChallenges.tensesCompleted, tenseName],
        },
      }
      localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
      return newData
    })
  }, [])

  const recordPerfectScore = useCallback(() => {
    setData(prev => {
      const newData = {
        ...prev,
        weeklyChallenges: {
          ...prev.weeklyChallenges,
          perfectScoreAchieved: true,
        },
      }
      localStorage.setItem(CHALLENGES_KEY, JSON.stringify(newData))
      return newData
    })
  }, [])

  const recordLessonComplete = useCallback((count: number) => { }, [])
  const recordStreakMaster = useCallback((streak: number) => { }, [])
  const recordTranslation = useCallback(() => { }, [])
  const recordSectionVisit = useCallback((section: string) => { }, [])
  const recordEasyLevelComplete = useCallback((tense: string) => { }, [])
  const recordWeeklyComplete = useCallback(() => { }, [])

  // Get daily challenges
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

  // Get weekly challenges
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

  // Get badges
  const getBadges = useCallback((): Badge[] => {
    const badgeDefinitions = [
      { id: "first-steps", name: "First Steps", description: "Complete your first lesson" },
      { id: "quick-learner", name: "Quick Learner", description: "Complete 10 lessons" },
      { id: "dedicated-learner", name: "Dedicated Learner", description: "Maintain a 7-day streak" },
      { id: "streak-master", name: "Streak Master", description: "Maintain a 30-day streak" },
      { id: "builder-pro", name: "Builder Pro", description: "Build 50 sentences" },
      { id: "rainfall-champion", name: "Rainfall Champion", description: "Score 500+ in Word Rainfall" },
      { id: "translator", name: "Translator", description: "Translate 20 sentences" },
      { id: "century-club", name: "Century Club", description: "Answer 100 quiz questions" },
      { id: "grammar-guru", name: "Grammar Guru", description: "Complete all easy levels" },
      { id: "perfect-score", name: "Perfect Score", description: "Get 100% in any quiz" },
      { id: "time-traveler", name: "Time Traveler", description: "Master all 12 tenses" },
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
