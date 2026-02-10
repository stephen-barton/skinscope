"use client"

import { useState, useEffect, use } from "react"
import { PriceComparisonTable } from "@/components/price-comparison-table"
import { DealScoreBadge } from "@/components/deal-score-badge"
import { FloatBar } from "@/components/float-bar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatPrice, getRarityColor, getWearAbbrev, getSkinImageUrl } from "@/lib/utils"

interface ItemData {
  name: string
  weapon: string
  skin: string
  wear: string
  rarity: string
  imageUrl: string
  floatValue?: number
  dealScore: number
  prices: { platform: string; price: number; fee: number; finalCost: number; url: string }[]
}

export default function ItemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [item, setItem] = useState<ItemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true)
      setErrorMsg("")
      try {
        const marketName = decodeURIComponent(slug)
        const res = await fetch(`/api/item/${encodeURIComponent(marketName)}`)
        if (res.ok) {
          const json = await res.json()
          const d = json?.data ?? json
          if (d?.market_hash_name) {
            const name = d.market_hash_name as string
            const apiPrices = Array.isArray(d.prices) ? d.prices : []
            const prices = apiPrices
              .filter((p: Record<string, unknown>) => p.price != null)
              .map((p: Record<string, unknown>) => {
                const platform = (p.platform as string) ?? "unknown"
                const price = (p.price as number) ?? 0
                // Estimate fees
                const feeRate = platform === "steam" ? 0.13 : platform === "skinport" ? 0.12 : 0.05
                const fee = +(price * feeRate).toFixed(2)
                return {
                  platform: platform.charAt(0).toUpperCase() + platform.slice(1),
                  price,
                  fee,
                  finalCost: +(price + fee).toFixed(2),
                  url: (p.url as string) ?? "#",
                }
              })

            setItem({
              name,
              weapon: name.split(" | ")[0] ?? "Unknown",
              skin: name.split(" | ")[1]?.split(" (")[0] ?? name,
              wear: name.match(/\(([^)]+)\)/)?.[1] ?? "",
              rarity: "Mil-Spec Grade",
              imageUrl: getSkinImageUrl(name),
              floatValue: undefined,
              dealScore: 0,
              prices,
            })
          } else {
            setErrorMsg("Item not found")
          }
        } else {
          setErrorMsg("Item not found on any platform")
        }
      } catch {
        setErrorMsg("Failed to load item details")
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-8 w-48 bg-zinc-800/50" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 bg-zinc-800/50 rounded-lg" />
          <Skeleton className="h-72 bg-zinc-800/50 rounded-lg" />
        </div>
      </div>
    )
  }

  if (errorMsg || !item) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to search
        </Link>
        <div className="text-center py-16">
          <p className="text-zinc-500 text-lg">{errorMsg || "Item not found"}</p>
        </div>
      </div>
    )
  }

  const rarityColor = getRarityColor(item.rarity)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Back */}
      <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to search
      </Link>

      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image */}
        <Card className="bg-[#141414] border-zinc-800/50 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: rarityColor }} />
          <div className="flex items-center justify-center h-64">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="max-h-full w-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = "none"
                const parent = target.parentElement
                if (parent && !parent.querySelector(".fallback-label")) {
                  const div = document.createElement("div")
                  div.className = "fallback-label text-center"
                  div.innerHTML = `<div class="text-5xl mb-2">🔫</div><div class="text-lg text-zinc-400 font-medium">${item.weapon}</div><div class="text-sm text-zinc-500">${item.skin}</div>`
                  parent.appendChild(div)
                }
              }}
            />
          </div>
        </Card>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-zinc-500">{item.weapon}</p>
            <h1 className="text-3xl font-bold text-zinc-100">{item.skin}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" style={{ borderColor: `${rarityColor}50`, color: rarityColor, backgroundColor: `${rarityColor}10` }}>
                {item.rarity}
              </Badge>
              {item.wear && (
                <span className="text-sm text-zinc-500 font-mono">{item.wear} ({getWearAbbrev(item.wear)})</span>
              )}
            </div>
          </div>

          {item.floatValue != null && (
            <div>
              <p className="text-xs text-zinc-500 mb-1">Float Value</p>
              <FloatBar value={item.floatValue} />
            </div>
          )}

          <PriceComparisonTable prices={item.prices} />

          {/* CSFloat notice */}
          <div className="rounded-lg bg-zinc-900/50 border border-zinc-800/50 p-3">
            <p className="text-xs text-zinc-500">
              <span className="text-zinc-400 font-medium">CSFloat</span> — Coming soon. CSFloat integration requires authentication and is being set up.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
