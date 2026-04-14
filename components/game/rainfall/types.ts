import { type Difficulty } from "@/lib/difficulty-styles"

export interface FallingWord {
  id: string
  word: string
  x: number
  y: number
  speed: number
  index: number
  removed?: boolean
  scale?: number
  opacity?: number
  isTarget?: boolean // For category mode
  isCorrectlyCaught?: boolean // For visual feedback
}

export interface GameSentence {
  native: string
  english: string
  words: string[]
}

export type DifficultyLevel = Difficulty
export type GameMode = "sentence" | "category"
