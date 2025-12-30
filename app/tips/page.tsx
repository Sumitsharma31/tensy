import { TipsContent } from "@/components/tips/tips-content"

export default function TipsPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Tips & Tricks</h1>
            <p className="text-muted-foreground text-lg">
              Memorable rules and visual cues to master English grammar faster.
            </p>
          </div>
          <TipsContent />
        </div>
      </div>
    </div>
  )
}
