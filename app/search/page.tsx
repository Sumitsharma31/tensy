import type { Metadata } from "next"
import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SearchContent } from "@/components/search/search-content"

export const metadata: Metadata = {
  title: "Search Tenses & Grammar | Tense Grammar Playground",
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
    title: "Search Tenses & Grammar | Tense Grammar Playground",
    description: "Search through all 12 English tenses, grammar rules, examples, and exercises.",
    type: "website",
    siteName: "Tense Grammar Playground",
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
    <div className="min-h-screen flex flex-col bg-background">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="flex-1 container mx-auto px-4 py-8">
        <Suspense fallback={null}>
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
