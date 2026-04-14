"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from '@clerk/nextjs'
import { useSync } from './use-sync'

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
  const { isSignedIn } = useAuth()
  const { syncToCloud, loadFromCloud } = useSync()
  const [progress, setProgress] = useState<UserProgress>(defaultProgress)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Try to load from cloud if signed in
        if (isSignedIn) {
          const cloudData = await loadFromCloud()
          if (cloudData?.progress) {
            // Map cloud data to progress format
            const cloudProgress: UserProgress = {
              completedLevels: { easy: [], medium: [], hard: [] },
              quizScores: {},
              gamesPlayed: cloudData.progress.lessons_completed || 0,
              totalScore: cloudData.progress.total_score || 0,
              badges: cloudData.badges?.map((b: any) => b.badge_id) || [],
              lastUpdated: cloudData.progress.updated_at || new Date().toISOString(),
            }
            setProgress(cloudProgress)
            // Also save to localStorage as backup
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(cloudProgress))
            setIsLoaded(true)
            return
          }
        }

        // Fallback to localStorage
        const saved = localStorage.getItem(PROGRESS_KEY)
        if (saved) {
          setProgress(JSON.parse(saved))
        }
      } catch (error) {
        console.error('Error loading progress:', error)
        // Fallback to localStorage
        const saved = localStorage.getItem(PROGRESS_KEY)
        if (saved) {
          setProgress(JSON.parse(saved))
        }
      }
      setIsLoaded(true)
    }

    loadProgress()
  }, [isSignedIn, loadFromCloud])

  // Helper to sync to cloud in background (non-blocking)
  const syncInBackground = useCallback((updatedProgress: UserProgress) => {
    if (!isSignedIn) return

    const totalLessons = Object.values(updatedProgress.completedLevels).flat().length
    const quizCount = Object.keys(updatedProgress.quizScores).length

    // Fire and forget - sync in background
    syncToCloud({
      progress: {
        totalXp: updatedProgress.totalScore,
        level: Math.floor(updatedProgress.totalScore / 100) + 1,
        lessonsCompleted: totalLessons,
        quizzesCompleted: quizCount,
        totalScore: updatedProgress.totalScore,
        accuracyRate: 0,
      },
      badges: updatedProgress.badges.map(id => ({
        badgeId: id,
        badgeName: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      })),
    }).catch(err => console.error('Background sync failed:', err))
  }, [isSignedIn, syncToCloud])

  const saveProgress = useCallback((newProgress: UserProgress) => {
    const updated = { ...newProgress, lastUpdated: new Date().toISOString() }
    setProgress(updated)
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated))
    } catch { }
    syncInBackground(updated)
  }, [syncInBackground])

  const completeLevel = useCallback((difficulty: string, level: number) => {
    setProgress((prev) => {
      const newLevels = {
        ...prev.completedLevels,
        [difficulty]: [...new Set([...prev.completedLevels[difficulty], level])],
      }
      const updated = { ...prev, completedLevels: newLevels, lastUpdated: new Date().toISOString() }
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated))
      } catch { }
      syncInBackground(updated)
      return updated
    })
  }, [syncInBackground])

  const addScore = useCallback((quizId: string, score: number) => {
    setProgress((prev) => {
      const currentBest = prev.quizScores[quizId] || 0
      const newScores = { ...prev.quizScores, [quizId]: Math.max(currentBest, score) }
      const totalScore = Object.values(newScores).reduce((a, b) => a + b, 0)
      const updated = { ...prev, quizScores: newScores, totalScore, lastUpdated: new Date().toISOString() }
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated))
      } catch { }
      syncInBackground(updated)
      return updated
    })
  }, [syncInBackground])

  const incrementGamesPlayed = useCallback(() => {
    setProgress((prev) => {
      const updated = { ...prev, gamesPlayed: prev.gamesPlayed + 1, lastUpdated: new Date().toISOString() }
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated))
      } catch { }
      syncInBackground(updated)
      return updated
    })
  }, [syncInBackground])

  const addBadge = useCallback((badge: string) => {
    setProgress((prev) => {
      if (prev.badges.includes(badge)) return prev
      const updated = { ...prev, badges: [...prev.badges, badge], lastUpdated: new Date().toISOString() }
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated))
      } catch { }
      syncInBackground(updated)
      return updated
    })
  }, [syncInBackground])

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress)
    try {
      localStorage.removeItem(PROGRESS_KEY)
    } catch { }
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
