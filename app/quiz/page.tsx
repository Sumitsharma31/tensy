import type { Metadata } from "next"
import { QuizSystem } from "@/components/quiz/quiz-system"

export const metadata: Metadata = {
  title: "English Grammar Quiz - Test Your Tenses Knowledge",
  description: "Challenge yourself with over 150 levels of our interactive English grammar quiz. Get instant feedback and improve your mastery of English tenses easily.",
}

export default function QuizPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Grammar Quiz</h1>
            <p className="text-muted-foreground text-lg">
              Test your knowledge with MCQs and sentence corrections. 50 levels per difficulty!
            </p>
          </div>
          <QuizSystem />
        </div>
      </div>
    </div>
  )
}
