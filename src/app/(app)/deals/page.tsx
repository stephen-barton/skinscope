"use client"

import { useState, useEffect } from "react"
import { SkinCard, type SkinItem } from "@/components/skin-card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp } from "lucide-react"
import { cn, getSkinImageUrl } from "@/lib/utils"

const weapons = ["All", "Rifle", "Pistol", "SMG", "Sniper", "Knife"]
const minScores = [0, 20, 50, 80]

export default function DealsPage() {
  const [deals, setDeals] = useState<SkinItem[]>([])
  const [loading, setLoading] = useState(true)
  const [weapon, setWeapon] = useState("All")
  const [minScore, setMinScore] = useState(0)

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/deals?weapon=${weapon}&minScore=${minScore}&limit=40`)
        if (res.ok) {
          const json = await res.json()
          const items = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []
          const mapped: SkinItem[] = items.map((d: Record<string, unknown>) => {
            const name = (d.market_hash_name as string) ?? "Unknown"
            const prices = (d.prices ?? {}) as Record<string, number | null>
            return {
              name,
              slug: encodeURIComponent(name),
              weapon: name.split(" | ")[0] ?? "Unknown",
              skin: name.split(" | ")[1]?.split(" (")[0] ?? name,
              wear: name.match(/\(([^)]+)\)/)?.[1] ?? "",
              rarity: "Mil-Spec Grade",
              imageUrl: getSkinImageUrl(name),
              floatValue: (d.float_value as number) ?? undefined,
              prices: {
                steam: (prices.steam as number) ?? undefined,
                csfloat: undefined,
                skinport: (prices.skinport as number) ?? undefined,
              },
              dealScore: (d.deal_score as number) ?? 0,
              skinportUrl: (d.item_page as string) ?? undefined,
              steamUrl: (d.steam_url as string) ?? undefined,
            }
          })
          setDeals(mapped)
        } else {
          setDeals([])
        }
      } catch {
        setDeals([])
      } finally {
        setLoading(false)
      }
    }
    fetchDeals()
  }, [weapon, minScore])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Top Deals</h1>
          <p className="text-sm text-zinc-500">Best deals from Skinport vs Steam suggested prices, updated live</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 rounded-lg bg-[#141414] border border-zinc-800/50">
        <div className="space-y-1.5">
          <span className="text-xs text-zinc-500">Weapon</span>
          <div className="flex gap-1 flex-wrap">
            {weapons.map((w) => (
              <button key={w} onClick={() => setWeapon(w)} className={cn("px-2 py-1 text-xs rounded-md", weapon === w ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 border border-transparent")}>{w}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs text-zinc-500">Min Score</span>
          <div className="flex gap-1">
            {minScores.map((s) => (
              <button key={s} onClick={() => setMinScore(s)} className={cn("px-2 py-1 text-xs rounded-md", minScore === s ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 border border-transparent")}>{s}+</button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 bg-zinc-800/50 rounded-lg" />)}
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500 text-lg">No deals found matching your filters</p>
          <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters or lowering the minimum score</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-zinc-500">{deals.length} deals found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {deals.map((item) => <SkinCard key={item.slug} item={item} />)}
          </div>
        </>
      )}
    </div>
  )
}
