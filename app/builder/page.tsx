import { SentenceBuilderGame } from "@/components/game/sentence-builder-game"

export default function BuilderPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Sentence Builder</h1>
            <p className="text-muted-foreground text-lg">
              Drag and drop words to build correct English sentences. Get instant feedback!
            </p>
          </div>
          <SentenceBuilderGame />
        </div>
      </div>
    </div>
  )
}
