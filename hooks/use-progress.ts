"use client"

import { useState, useEffect, useCallback } from "react"

const PROGRESS_KEY = "tense-playground-progress"

interface UserProgress {
  completedLevels: Record<string, number[]>
  quizScores: Record<string, number>
  gamesPlayed: number
  totalScore: number
  badges: string[]
  lastUpdated: string
}

const defaultProgress: UserProgress = {
  completedLevels: { easy: [], medium: [], hard: [] },
  quizScores: {},
  gamesPlayed: 0,
  totalScore: 0,
  badges: [],
  lastUpdated: new Date().toISOString(),
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_KEY)
      if (saved) {
        setProgress(JSON.parse(saved))
      }
    } catch {
      // localStorage not available
    }
    setIsLoaded(true)
  }, [])

  const saveProgress = useCallback((newProgress: UserProgress) => {
    const updated = { ...newProgress, lastUpdated: new Date().toISOString() }
    setProgress(updated)
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated))
    } catch {
      // Storage quota exceeded or not available
    }
  }, [])

  const completeLevel = useCallback((difficulty: string, level: number) => {
    setProgress((prev) => {
      const newLevels = {
        ...prev.completedLevels,
        [difficulty]: [...new Set([...prev.completedLevels[difficulty], level])],
      }
      const updated = { ...prev, completedLevels: newLevels, lastUpdated: new Date().toISOString() }
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated))
      } catch {}
      return updated
    })
  }, [])

  const addScore = useCallback((quizId: string, score: number) => {
    setProgress((prev) => {
      const currentBest = prev.quizScores[quizId] || 0
      const newScores = { ...prev.quizScores, [quizId]: Math.max(currentBest, score) }
      const totalScore = Object.values(newScores).reduce((a, b) => a + b, 0)
      const updated = { ...prev, quizScores: newScores, totalScore, lastUpdated: new Date().toISOString() }
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated))
      } catch {}
      return updated
    })
  }, [])

  const incrementGamesPlayed = useCallback(() => {
    setProgress((prev) => {
      const updated = { ...prev, gamesPlayed: prev.gamesPlayed + 1, lastUpdated: new Date().toISOString() }
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated))
      } catch {}
      return updated
    })
  }, [])

  const addBadge = useCallback((badge: string) => {
    setProgress((prev) => {
      if (prev.badges.includes(badge)) return prev
      const updated = { ...prev, badges: [...prev.badges, badge], lastUpdated: new Date().toISOString() }
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated))
      } catch {}
      return updated
    })
  }, [])

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress)
    try {
      localStorage.removeItem(PROGRESS_KEY)
    } catch {}
  }, [])

  return {
    progress,
    isLoaded,
    completeLevel,
    addScore,
    incrementGamesPlayed,
    addBadge,
    resetProgress,
  }
}
