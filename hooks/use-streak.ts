"use client"

import { useState, useEffect, useCallback } from "react"

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
  totalDays: number
}

const STREAK_KEY = "tense-playground-streak"

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    totalDays: 0,
  })

  useEffect(() => {
    const saved = localStorage.getItem(STREAK_KEY)
    if (saved) {
      const data = JSON.parse(saved) as StreakData
      const today = new Date().toISOString().split("T")[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

      if (data.lastActiveDate === today) {
        setStreak(data)
      } else if (data.lastActiveDate === yesterday) {
        setStreak(data)
      } else if (data.lastActiveDate) {
        // Streak broken
        setStreak({
          ...data,
          currentStreak: 0,
        })
      }
    }
  }, [])

  const recordActivity = useCallback(() => {
    const today = new Date().toISOString().split("T")[0]

    setStreak((prev) => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
      let newStreak = prev.currentStreak

      if (prev.lastActiveDate !== today) {
        if (prev.lastActiveDate === yesterday || !prev.lastActiveDate) {
          newStreak = prev.currentStreak + 1
        } else {
          newStreak = 1
        }
      }

      const newData: StreakData = {
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastActiveDate: today,
        totalDays: prev.lastActiveDate !== today ? prev.totalDays + 1 : prev.totalDays,
      }

      localStorage.setItem(STREAK_KEY, JSON.stringify(newData))
      return newData
    })
  }, [])

  return {
    ...streak,
    recordActivity,
  }
}
