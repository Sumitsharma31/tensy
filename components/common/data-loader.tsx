"use client"

import type { ReactNode } from "react"
import { LoadingScreen } from "./loading-screen"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DataLoaderProps<T> {
  data: T | null | undefined
  isLoading: boolean
  error?: Error | null
  loadingMessage?: string
  errorMessage?: string
  onRetry?: () => void
  children: (data: T) => ReactNode
  emptyState?: ReactNode
}

export function DataLoader<T>({
  data,
  isLoading,
  error,
  loadingMessage = "Loading data...",
  errorMessage = "Something went wrong",
  onRetry,
  children,
  emptyState,
}: DataLoaderProps<T>) {
  if (isLoading) {
    return <LoadingScreen message={loadingMessage} />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">{errorMessage}</h3>
          <p className="text-sm text-muted-foreground mt-1">{error.message || "Please try again later"}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    )
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    if (emptyState) {
      return <>{emptyState}</>
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center">
        <div className="rounded-full bg-muted p-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  return <>{children(data)}</>
}
