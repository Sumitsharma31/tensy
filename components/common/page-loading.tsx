"use client"

import { LoadingScreen } from "./loading-screen"

interface PageLoadingProps {
  title: string
  subtitle?: string
  fullScreen?: boolean
}

/**
 * Reusable page loading component for Next.js loading.tsx files
 * Wraps LoadingScreen with simpler props for page-level loading states
 */
export function PageLoading({ title, subtitle, fullScreen = false }: PageLoadingProps) {
  return <LoadingScreen message={title} submessage={subtitle} fullScreen={fullScreen} />
}

// Pre-configured loading components for common pages
export function HomeLoading() {
  return (
    <PageLoading
      title="Loading Tense Playground"
      subtitle="Preparing your learning experience..."
      fullScreen
    />
  )
}

export function BuilderLoading() {
  return <PageLoading title="Loading Sentence Builder" subtitle="Preparing word blocks..." />
}

export function QuizLoading() {
  return <PageLoading title="Loading Quiz" subtitle="Preparing questions..." />
}

export function PlaygroundLoading() {
  return <PageLoading title="Loading Playground" subtitle="Fetching tense data..." />
}

export function RainfallLoading() {
  return <PageLoading title="Loading Word Rainfall" subtitle="Get ready to catch words..." />
}

export function TranslateLoading() {
  return <PageLoading title="Loading Translator" subtitle="Preparing translation tools..." />
}
