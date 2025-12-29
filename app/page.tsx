import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeatureCards } from "@/components/home/feature-cards"
import { TensePreview } from "@/components/home/tense-preview"
import { StatsSection } from "@/components/home/stats-section"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeatureCards />
        <TensePreview />
        <StatsSection />
      </main>
      <Footer />
    </div>
  )
}
