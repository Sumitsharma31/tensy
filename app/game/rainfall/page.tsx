import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { RainfallGame } from "@/components/game/rainfall-game"

export default function RainfallPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Word Rainfall</h1>
              <p className="text-muted-foreground text-lg">
                Catch falling words in the correct order to form sentences. Beat the clock!
              </p>
            </div>
            <RainfallGame />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
