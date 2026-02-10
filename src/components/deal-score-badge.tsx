"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DealScoreBadgeProps {
  score: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function DealScoreBadge({ score, size = "md", className }: DealScoreBadgeProps) {
  const getConfig = (s: number) => {
    if (s >= 80) return { emoji: "🔥", label: "Hot Deal", bg: "bg-green-500/20 text-green-400 border-green-500/30" }
    if (s >= 50) return { emoji: "✅", label: "Good", bg: "bg-green-500/10 text-green-400 border-green-500/20" }
    if (s >= 20) return { emoji: "👍", label: "Fair", bg: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" }
    if (s >= 0) return { emoji: "➡️", label: "Neutral", bg: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" }
    return { emoji: "⚠️", label: "Overpriced", bg: "bg-red-500/10 text-red-400 border-red-500/20" }
  }

  const config = getConfig(score)
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-0.5",
    lg: "text-base px-3 py-1",
  }

  return (
    <Badge variant="outline" className={cn(config.bg, sizeClasses[size], "font-mono font-bold", className)}>
      {config.emoji} {score}
    </Badge>
  )
}
