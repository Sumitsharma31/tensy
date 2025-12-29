"use client"

import { useState, useCallback, useEffect } from "react"
import type { Difficulty } from "@/lib/difficulty-styles"

const DIFFICULTY_KEY = "tense-playground-difficulty"

export function useDifficulty(initialDifficulty: Difficulty = "easy") {
  const [difficulty, setDifficultyState] = useState<Difficulty>(initialDifficulty)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved difficulty on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DIFFICULTY_KEY)
      if (saved && ["easy", "medium", "hard"].includes(saved)) {
        setDifficultyState(saved as Difficulty)
      }
    } catch {
      // localStorage not available
    }
    setIsLoaded(true)
  }, [])

  const setDifficulty = useCallback((newDifficulty: Difficulty) => {
    setDifficultyState(newDifficulty)
    try {
      localStorage.setItem(DIFFICULTY_KEY, newDifficulty)
    } catch {
      // localStorage not available
    }
  }, [])

  const cycleDifficulty = useCallback(() => {
    setDifficultyState((prev) => {
      const next = prev === "easy" ? "medium" : prev === "medium" ? "hard" : "easy"
      try {
        localStorage.setItem(DIFFICULTY_KEY, next)
      } catch {
        // localStorage not available
      }
      return next
    })
  }, [])

  return {
    difficulty,
    setDifficulty,
    cycleDifficulty,
    isEasy: difficulty === "easy",
    isMedium: difficulty === "medium",
    isHard: difficulty === "hard",
    isLoaded,
  }
}
