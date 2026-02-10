"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { DealScoreBadge } from "./deal-score-badge"
import { FloatBar } from "./float-bar"
import { formatPrice, getRarityColor, getWearAbbrev, cn } from "@/lib/utils"

export interface SkinItem {
  name: string
  slug: string
  weapon: string
  skin: string
  wear: string
  rarity: string
  imageUrl: string
  floatValue?: number
  prices: {
    steam?: number
    csfloat?: number
    skinport?: number
  }
  dealScore: number
}

interface SkinCardProps {
  item: SkinItem
  className?: string
}

export function SkinCard({ item, className }: SkinCardProps) {
  const rarityColor = getRarityColor(item.rarity)
  const availablePrices = [item.prices?.steam, item.prices?.csfloat, item.prices?.skinport].filter((p): p is number => p != null)
  const lowestPrice = availablePrices.length > 0 ? Math.min(...availablePrices) : 0

  return (
    <Link href={`/item/${item.slug}`}>
      <Card
        className={cn(
          "group relative overflow-hidden bg-[#141414] border-zinc-800/50 hover:border-zinc-700 transition-all duration-200 hover:scale-[1.02] cursor-pointer",
          className
        )}
      >
        {/* Rarity accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: rarityColor }} />

        {/* Deal score badge */}
        <div className="absolute top-3 right-3 z-10">
          <DealScoreBadge score={item.dealScore} size="sm" />
        </div>

        {/* Image */}
        <div className="relative h-36 flex items-center justify-center p-4 bg-gradient-to-b from-zinc-900/50 to-transparent">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Info */}
        <div className="p-3 pt-2 space-y-2">
          <div>
            <p className="text-xs text-zinc-500">{item.weapon}</p>
            <p className="text-sm font-semibold text-zinc-100 truncate">{item.skin}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${rarityColor}20`, color: rarityColor }}
              >
                {item.rarity}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">{getWearAbbrev(item.wear)}</span>
            </div>
          </div>

          {item.floatValue != null && <FloatBar value={item.floatValue} />}

          {/* Prices */}
          <div className="grid grid-cols-3 gap-1 text-center">
            {(["steam", "csfloat", "skinport"] as const).map((platform) => {
              const price = item.prices[platform]
              const isLowest = price === lowestPrice
              return (
                <div key={platform} className="rounded bg-zinc-900/50 px-1.5 py-1">
                  <p className="text-[9px] uppercase text-zinc-500 tracking-wider">{platform}</p>
                  <p className={cn("text-xs font-mono font-bold", isLowest ? "text-green-400" : "text-zinc-300")}>
                    {price != null ? formatPrice(price) : "—"}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </Link>
  )
}
