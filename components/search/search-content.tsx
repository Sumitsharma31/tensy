"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Search, Clock, BookOpen, Gamepad2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const searchableContent = [
  {
    title: "Simple Past Tense",
    category: "Tense",
    path: "/playground?tense=simple-past",
    tags: ["past", "verb", "did"],
  },
  {
    title: "Simple Present Tense",
    category: "Tense",
    path: "/playground?tense=simple-present",
    tags: ["present", "verb", "do", "does"],
  },
  {
    title: "Simple Future Tense",
    category: "Tense",
    path: "/playground?tense=simple-future",
    tags: ["future", "will", "shall"],
  },
  {
    title: "Past Continuous",
    category: "Tense",
    path: "/playground?tense=past-continuous",
    tags: ["past", "was", "were", "ing"],
  },
  {
    title: "Present Continuous",
    category: "Tense",
    path: "/playground?tense=present-continuous",
    tags: ["present", "am", "is", "are", "ing"],
  },
  {
    title: "Future Continuous",
    category: "Tense",
    path: "/playground?tense=future-continuous",
    tags: ["future", "will be", "ing"],
  },
  {
    title: "Past Perfect",
    category: "Tense",
    path: "/playground?tense=past-perfect",
    tags: ["past", "had", "perfect"],
  },
  {
    title: "Present Perfect",
    category: "Tense",
    path: "/playground?tense=present-perfect",
    tags: ["present", "has", "have", "perfect"],
  },
  {
    title: "Future Perfect",
    category: "Tense",
    path: "/playground?tense=future-perfect",
    tags: ["future", "will have", "perfect"],
  },
  { title: "Sentence Builder Game", category: "Game", path: "/builder", tags: ["game", "build", "practice"] },
  { title: "Rainfall Word Game", category: "Game", path: "/game/rainfall", tags: ["game", "catch", "words", "fun"] },
  { title: "Grammar Quiz", category: "Quiz", path: "/quiz", tags: ["quiz", "test", "mcq", "practice"] },
  { title: "Tips & Tricks", category: "Learn", path: "/tips", tags: ["tips", "rules", "tricks", "learn"] },
  {
    title: "Translation Tool",
    category: "Tool",
    path: "/translate",
    tags: ["translate", "hindi", "bengali", "native"],
  },
  {
    title: "Daily Challenges",
    category: "Challenge",
    path: "/challenges",
    tags: ["challenge", "daily", "streak", "xp"],
  },
]

const categoryIcons: Record<string, React.ReactNode> = {
  Tense: <Clock className="h-4 w-4" />,
  Game: <Gamepad2 className="h-4 w-4" />,
  Quiz: <BookOpen className="h-4 w-4" />,
  Learn: <BookOpen className="h-4 w-4" />,
  Tool: <Search className="h-4 w-4" />,
  Challenge: <Gamepad2 className="h-4 w-4" />,
}

export function SearchContent() {
  const [query, setQuery] = useState("")

  const results = useMemo(() => {
    if (!query.trim()) return searchableContent
    const q = query.toLowerCase()
    return searchableContent.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.includes(q)),
    )
  }, [query])

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Search Grammar Content</h1>
        <p className="text-muted-foreground">Find tenses, games, quizzes, and learning resources</p>
      </div>

      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search tenses, games, tips..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((item) => (
          <Link key={item.path} href={item.path}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {categoryIcons[item.category]}
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {results.length === 0 && <p className="text-center text-muted-foreground py-8">No results found for "{query}"</p>}
    </div>
  )
}
