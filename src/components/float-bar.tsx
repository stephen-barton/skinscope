"use client"

import { cn } from "@/lib/utils"

interface FloatBarProps {
  value: number
  className?: string
}

const wearRanges = [
  { label: "FN", max: 0.07, color: "#22c55e" },
  { label: "MW", max: 0.15, color: "#84cc16" },
  { label: "FT", max: 0.38, color: "#eab308" },
  { label: "WW", max: 0.45, color: "#f97316" },
  { label: "BS", max: 1.0, color: "#ef4444" },
]

export function FloatBar({ value, className }: FloatBarProps) {
  const percentage = Math.min(Math.max(value, 0), 1) * 100

  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-3 rounded-full overflow-hidden bg-zinc-800">
        <div className="absolute inset-0 flex">
          {wearRanges.map((range, i) => {
            const prevMax = i === 0 ? 0 : wearRanges[i - 1].max
            const width = (range.max - prevMax) * 100
            return (
              <div
                key={range.label}
                style={{ width: `${width}%`, backgroundColor: range.color, opacity: 0.3 }}
              />
            )
          })}
        </div>
        <div
          className="absolute top-0 h-full w-0.5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"
          style={{ left: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-zinc-500">0.00</span>
        <span className="text-xs font-mono text-zinc-300">{value.toFixed(4)}</span>
        <span className="text-[10px] text-zinc-500">1.00</span>
      </div>
    </div>
  )
}
