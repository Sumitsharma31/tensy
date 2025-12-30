import { HeroSection } from "@/components/home/hero-section"
import { FeatureCards } from "@/components/home/feature-cards"
import { TensePreview } from "@/components/home/tense-preview"
import { StatsSection } from "@/components/home/stats-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeatureCards />
      <TensePreview />
      <StatsSection />
    </>
  )
}
