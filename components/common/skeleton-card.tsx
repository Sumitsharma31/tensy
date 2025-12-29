"use client"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonCardProps {
  className?: string
  lines?: number
  showImage?: boolean
  showAvatar?: boolean
}

export function SkeletonCard({ className, lines = 3, showImage = false, showAvatar = false }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-4 space-y-4", className)}>
      {showImage && <Skeleton className="h-40 w-full rounded-lg" />}

      <div className="flex items-center gap-3">
        {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3" style={{ width: `${100 - i * 15}%` }} />
        ))}
      </div>
    </div>
  )
}
