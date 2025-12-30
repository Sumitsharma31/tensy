import type { Metadata } from "next"
import { Suspense } from "react"
import { SearchContent } from "@/components/search/search-content"

export const metadata: Metadata = {
  title: "Search Tenses & Grammar | Tense Playground",
  description:
    "Search through all 12 English tenses, grammar rules, examples, and exercises. Find past, present, and future tense explanations quickly.",
  keywords: [
    "English tenses search",
    "grammar search",
    "tense finder",
    "past tense examples",
    "present tense rules",
    "future tense exercises",
    "learn English grammar",
  ],
  openGraph: {
    title: "Search Tenses & Grammar | Tense Playground",
    description: "Search through all 12 English tenses, grammar rules, examples, and exercises.",
    type: "website",
    siteName: "Tense Playground",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search Tenses & Grammar",
    description: "Search through all 12 English tenses, grammar rules, examples, and exercises.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={null}>
        <SearchContent />
      </Suspense>
    </div>
  )
}
