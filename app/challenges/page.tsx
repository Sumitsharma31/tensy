import { ChallengesContent } from "@/components/challenges/challenges-content"

export default function ChallengesPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Challenges & Streaks</h1>
            <p className="text-muted-foreground text-lg">
              Complete daily challenges and maintain your streak to earn badges!
            </p>
          </div>
          <ChallengesContent />
        </div>
      </div>
    </div>
  )
}
