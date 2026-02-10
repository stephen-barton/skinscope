"use client"

import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

interface PricePoint {
  date: string
  steam?: number
  csfloat?: number
  skinport?: number
}

interface PriceChartProps {
  data: PricePoint[]
  className?: string
}

const timeRanges = ["7d", "30d", "90d"] as const

export function PriceChart({ data, className }: PriceChartProps) {
  const [range, setRange] = useState<(typeof timeRanges)[number]>("30d")

  const daysMap = { "7d": 7, "30d": 30, "90d": 90 }
  const filtered = data.slice(-daysMap[range])

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300">Price History</h3>
        <div className="flex gap-1">
          {timeRanges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                range === r
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "text-zinc-500 hover:text-zinc-300 border border-transparent"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filtered} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="steamGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="csfloatGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4b69ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4b69ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="skinportGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d32ce6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d32ce6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#737373" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#737373" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#737373" }}
              formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, ""]}
            />
            <Area type="monotone" dataKey="steam" stroke="#22c55e" fill="url(#steamGrad)" strokeWidth={2} name="Steam" />
            <Area type="monotone" dataKey="csfloat" stroke="#4b69ff" fill="url(#csfloatGrad)" strokeWidth={2} name="CSFloat" />
            <Area type="monotone" dataKey="skinport" stroke="#d32ce6" fill="url(#skinportGrad)" strokeWidth={2} name="Skinport" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 justify-center">
        {[
          { name: "Steam", color: "#22c55e" },
          { name: "CSFloat", color: "#4b69ff" },
          { name: "Skinport", color: "#d32ce6" },
        ].map((p) => (
          <div key={p.name} className="flex items-center gap-1.5 text-xs text-zinc-400">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </div>
        ))}
      </div>
    </div>
  )
}
