"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, BookOpen, Gamepad2, Trophy } from "lucide-react"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadFireflyPreset } from "@tsparticles/preset-firefly"

export function HeroSection() {
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFireflyPreset(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-past/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-present/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-future/10 rounded-full blur-3xl" />
        {init && (
          <Particles
            id="tsparticles"
            className="absolute inset-0"
            options={{
              preset: "firefly",
              background: {
                opacity: 0,
              },
              fullScreen: false,
            }}
          />
        )}
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 gap-2 px-4 py-2 text-sm">
            <Sparkles className="h-4 w-4 text-future" />
            AI-Powered English Grammar Learning
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6">
            Master English{" "}
            <span className="bg-gradient-to-r from-past via-present to-future bg-clip-text text-transparent">
              Tenses
            </span>{" "}
            Through Play
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 text-pretty">
            Interactive games, visual timelines, and personalized practice make learning grammar engaging for students
            of all ages and skill levels.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link href="/playground">
              <Button size="sm" className="gap-2 h-10 pl-5 pr-4 text-sm rounded-xl bg-primary hover:bg-primary/90">
                Play with Tenses
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/quiz">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-10 px-4 text-sm rounded-xl border-2 hover:bg-secondary bg-transparent"
              >
                Take a Quiz
              </Button>
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-8 md:gap-16">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-past-light mb-2">
                <BookOpen className="h-6 w-6 text-past" />
              </div>
              <span className="text-2xl md:text-3xl font-bold">1000+</span>
              <span className="text-sm text-muted-foreground">Sentences</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-present-light mb-2">
                <Gamepad2 className="h-6 w-6 text-present" />
              </div>
              <span className="text-2xl md:text-3xl font-bold">4</span>
              <span className="text-sm text-muted-foreground">Games</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-future-light mb-2">
                <Trophy className="h-6 w-6 text-future" />
              </div>
              <span className="text-2xl md:text-3xl font-bold">150+</span>
              <span className="text-sm text-muted-foreground">Levels</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
