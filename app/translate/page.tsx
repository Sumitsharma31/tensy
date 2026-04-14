import type { Metadata } from "next"
import { TranslationTool } from "@/components/translate/translation-tool"

export const metadata: Metadata = {
  title: "AI Tense Translator - English Grammar Breakdown",
  description: "Translate sentences and get an instant AI-powered breakdown of the tenses used. Understand grammar structure and improve your English with our smart translator.",
}

export default function TranslatePage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Translation Tool</h1>
            <p className="text-muted-foreground text-lg">
              Translate from your native language to English with tense detection and grammar breakdown.
            </p>
          </div>
          <TranslationTool />
        </div>
      </div>
    </div>
  )
}
