"use client"

// @ts-nocheck - Supabase types need to be regenerated to match updated schema
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useAuth } from "@clerk/nextjs"
import { supabase } from "@/lib/supabase"

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
  totalDays: number
}

interface StreakContextType extends StreakData {
  recordActivity: () => Promise<void>
}

const STREAK_KEY = "tense-playground-streak"

const StreakContext = createContext<StreakContextType | null>(null)

export function StreakProvider({ children }: { children: ReactNode }) {
  const { userId: clerkUserId, isSignedIn } = useAuth()
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    totalDays: 0,
  })
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null)

  // Load streak data on mount
  useEffect(() => {
    async function loadStreak() {
      try {
        // Always load from localStorage first
        const saved = localStorage.getItem(STREAK_KEY)
        if (saved) {
          setStreak(JSON.parse(saved))
        }

        // If signed in, try loading from Supabase
        if (isSignedIn && clerkUserId) {
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', clerkUserId)
            .single()

          if (userData) {
            setSupabaseUserId(userData.id)

            const { data: streakData } = await supabase
              .from('user_streaks') // CORRECTED TABLE
              .select('current_streak, longest_streak, last_activity_date')
              .eq('user_id', userData.id)
              .maybeSingle()

            if (streakData) {
              const today = new Date().toISOString().split("T")[0]
              const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

              let currentStreak = (streakData as any).current_streak || 0

              // Break streak if last activity was not today or yesterday
              if ((streakData as any).last_activity_date &&
                (streakData as any).last_activity_date !== today &&
                (streakData as any).last_activity_date !== yesterday) {
                currentStreak = 0
              }

              const dbLongestStreak = (streakData as any).longest_streak || 0
              // Ensure longest streak is at least as high as current streak
              const longestStreak = Math.max(dbLongestStreak, currentStreak)

              const newStreakData: StreakData = {
                currentStreak,
                longestStreak,
                lastActiveDate: (streakData as any).last_activity_date,
                totalDays: 0,
              }

              setStreak(newStreakData)
              localStorage.setItem(STREAK_KEY, JSON.stringify(newStreakData))

              // If we had to fix the longest streak, update Supabase
              if (longestStreak > dbLongestStreak && userData?.id) {
                supabase
                  .from('user_streaks') // CORRECTED TABLE
                  .update({ longest_streak: longestStreak })
                  .eq('user_id', userData.id)
                  .then(
                    () => console.log('Fixed longest streak in DB'),
                    (err: any) => console.error('Failed to fix longest streak:', err)
                  )
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load streak:', error)
      }
    }

    loadStreak()
  }, [clerkUserId, isSignedIn])

  const recordActivity = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0]

    // Prevent double increment on same day
    if (streak.lastActiveDate === today) {
      return
    }

    setStreak((prev) => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

      // Calculate new streak
      let newCurrentStreak = 1
      if (prev.lastActiveDate === yesterday) {
        newCurrentStreak = prev.currentStreak + 1
      } else if (prev.lastActiveDate === today) {
        return prev // Already recorded today
      }

      const newLongestStreak = Math.max(prev.longestStreak, newCurrentStreak)

      const newStreakData: StreakData = {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: today,
        totalDays: prev.totalDays + 1,
      }

      // Save to localStorage
      localStorage.setItem(STREAK_KEY, JSON.stringify(newStreakData))

      // Async update to Supabase if authenticated
      if (supabaseUserId) {
        (async () => {
          try {
            await supabase
              .from('user_streaks') // CORRECTED TABLE
              .upsert({
                user_id: supabaseUserId,
                current_streak: newCurrentStreak,
                longest_streak: newLongestStreak,
                last_activity_date: today,
              }, {
                onConflict: 'user_id',
              })

            // Award 10 XP for daily activity
            await supabase.rpc('increment_xp', { amount: 10 })
          } catch (error) {
            console.error('Failed to update streak in Supabase:', error)
          }
        })()
      }

      return newStreakData
    })
  }, [streak.lastActiveDate, supabaseUserId])

  return (
    <StreakContext.Provider value={{ ...streak, recordActivity }}>
      {children}
    </StreakContext.Provider>
  )
}

export function useStreakContext() {
  const context = useContext(StreakContext)
  if (!context) {
    throw new Error("useStreakContext must be used within a StreakProvider")
  }
  return context
}
