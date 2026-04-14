import type { Metadata } from "next"
import { PlaygroundContent } from "@/components/playground/playground-content"

export const metadata: Metadata = {
  title: "Interactive Tense Playground - Learn English Verbs",
  description: "Explore all 12 English tenses with visual timelines, formulas, and AI assistance. Our interactive playground makes learning verb tenses easy and intuitive.",
}

export default function PlaygroundPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Tense Playground</h1>
            <p className="text-muted-foreground text-lg">
              Explore all 12 English tenses with interactive examples, formulas, and audio pronunciation.
            </p>
          </div>
          <PlaygroundContent />
        </div>
      </div>
    </div>
  )
}
