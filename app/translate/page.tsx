import { TranslationTool } from "@/components/translate/translation-tool"

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
