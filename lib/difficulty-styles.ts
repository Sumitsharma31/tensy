import { cn } from "./utils"

export type Difficulty = "easy" | "medium" | "hard"

export function getDifficultyStyles(difficulty: Difficulty) {
  return {
    container: "text-base leading-normal",
    card: "transition-all p-4 rounded-xl",
    button: "h-11 text-base px-6 rounded-xl",
    heading: "text-2xl font-semibold",
    gap: "gap-4",
  }
}

export function getDifficultyColors(difficulty: Difficulty) {
  return {
    primary: cn(
      difficulty === "easy" && "bg-present text-primary-foreground",
      difficulty === "medium" && "bg-future text-primary-foreground",
      difficulty === "hard" && "bg-past text-primary-foreground",
    ),
    light: cn(
      difficulty === "easy" && "bg-present-light",
      difficulty === "medium" && "bg-future-light",
      difficulty === "hard" && "bg-past-light",
    ),
    text: cn(
      difficulty === "easy" && "text-present",
      difficulty === "medium" && "text-future",
      difficulty === "hard" && "text-past",
    ),
    border: cn(
      difficulty === "easy" && "border-present",
      difficulty === "medium" && "border-future",
      difficulty === "hard" && "border-past",
    ),
  }
}
