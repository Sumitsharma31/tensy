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
}

export interface GameSentence {
  native: string
  english: string
  words: string[]
}

export type DifficultyLevel = Difficulty
