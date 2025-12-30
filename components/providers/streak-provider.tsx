"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
  totalDays: number
}

interface StreakContextType extends StreakData {
  recordActivity: () => void
}

const STREAK_KEY = "tense-playground-streak"

const StreakContext = createContext<StreakContextType | null>(null)

export function StreakProvider({ children }: { children: ReactNode }) {
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
        const newData = { ...data, currentStreak: 0 }
        setStreak(newData)
        localStorage.setItem(STREAK_KEY, JSON.stringify(newData))
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
