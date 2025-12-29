import { cn } from "./utils"

export type Difficulty = "easy" | "medium" | "hard"

export function getDifficultyStyles(difficulty: Difficulty) {
  return {
    container: cn(
      difficulty === "easy" && "text-lg leading-relaxed",
      difficulty === "medium" && "text-base leading-normal",
      difficulty === "hard" && "text-sm leading-snug",
    ),
    card: cn(
      "transition-all",
      difficulty === "easy" && "p-6 rounded-2xl",
      difficulty === "medium" && "p-4 rounded-xl",
      difficulty === "hard" && "p-3 rounded-lg",
    ),
    button: cn(
      difficulty === "easy" && "h-14 text-lg px-8 rounded-2xl",
      difficulty === "medium" && "h-11 text-base px-6 rounded-xl",
      difficulty === "hard" && "h-9 text-sm px-4 rounded-lg",
    ),
    heading: cn(
      difficulty === "easy" && "text-3xl font-bold",
      difficulty === "medium" && "text-2xl font-semibold",
      difficulty === "hard" && "text-xl font-medium",
    ),
    gap: cn(difficulty === "easy" && "gap-6", difficulty === "medium" && "gap-4", difficulty === "hard" && "gap-3"),
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
