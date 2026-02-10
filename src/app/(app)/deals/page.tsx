"use client"

import { useState, useEffect } from "react"
import { SkinCard, type SkinItem } from "@/components/skin-card"
import { DealScoreBadge } from "@/components/deal-score-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const mockDeals: SkinItem[] = [
  {
    name: "AWP | Asiimov (Field-Tested)", slug: "awp-asiimov-ft", weapon: "AWP", skin: "Asiimov", wear: "Field-Tested",
    rarity: "Covert", imageUrl: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXnkJ5lZjP1qKXMxIi_ChOBel8-f0uldL6GOAk6V0ktDfbZ-JY_darPYDoE0joxPehCWJ_yAMeLXxft0ElRUKwpot7HxfP9e_tHKKT_9OoOO09oGIqPH2J6nUklRc7cF4n-T--YXygED6/200x150",
    floatValue: 0.28, prices: { steam: 42.99, csfloat: 34.20, skinport: 37.50 }, dealScore: 91,
  },
  {
    name: "AK-47 | Redline (Field-Tested)", slug: "ak-47-redline-ft", weapon: "AK-47", skin: "Redline", wear: "Field-Tested",
    rarity: "Classified", imageUrl: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXnkJ5lZjP1qKXMxIi_ChOBel8-f0uldL6GOAk6V0ktDfbZ-JY_darPYDoE0joxPehCWJ_yAMeLXxft0ElRUKwpot7HxfP9e_tHKKT_9OoOO09oGIqPH2J6nUklRc7cF4n-T--YXygED6/200x150",
    floatValue: 0.18, prices: { steam: 14.50, csfloat: 11.80, skinport: 12.30 }, dealScore: 86,
  },
  {
    name: "M4A1-S | Hyper Beast (Minimal Wear)", slug: "m4a1-s-hyper-beast-mw", weapon: "M4A1-S", skin: "Hyper Beast", wear: "Minimal Wear",
    rarity: "Covert", imageUrl: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXnkJ5lZjP1qKXMxIi_ChOBel8-f0uldL6GOAk6V0ktDfbZ-JY_darPYDoE0joxPehCWJ_yAMeLXxft0ElRUKwpot7HxfP9e_tHKKT_9OoOO09oGIqPH2J6nUklRc7cF4n-T--YXygED6/200x150",
    floatValue: 0.10, prices: { steam: 38.00, csfloat: 32.50, skinport: 34.00 }, dealScore: 82,
  },
  {
    name: "Desert Eagle | Blaze (Factory New)", slug: "desert-eagle-blaze-fn", weapon: "Desert Eagle", skin: "Blaze", wear: "Factory New",
    rarity: "Restricted", imageUrl: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXnkJ5lZjP1qKXMxIi_ChOBel8-f0uldL6GOAk6V0ktDfbZ-JY_darPYDoE0joxPehCWJ_yAMeLXxft0ElRUKwpot7HxfP9e_tHKKT_9OoOO09oGIqPH2J6nUklRc7cF4n-T--YXygED6/200x150",
    floatValue: 0.008, prices: { steam: 420.00, csfloat: 369.00, skinport: 385.00 }, dealScore: 78,
  },
  {
    name: "USP-S | Kill Confirmed (Field-Tested)", slug: "usp-s-kill-confirmed-ft", weapon: "USP-S", skin: "Kill Confirmed", wear: "Field-Tested",
    rarity: "Covert", imageUrl: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXnkJ5lZjP1qKXMxIi_ChOBel8-f0uldL6GOAk6V0ktDfbZ-JY_darPYDoE0joxPehCWJ_yAMeLXxft0ElRUKwpot7HxfP9e_tHKKT_9OoOO09oGIqPH2J6nUklRc7cF4n-T--YXygED6/200x150",
    floatValue: 0.22, prices: { steam: 52.00, csfloat: 44.50, skinport: 47.00 }, dealScore: 73,
  },
  {
    name: "Glock-18 | Fade (Factory New)", slug: "glock-18-fade-fn", weapon: "Glock-18", skin: "Fade", wear: "Factory New",
    rarity: "Restricted", imageUrl: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXnkJ5lZjP1qKXMxIi_ChOBel8-f0uldL6GOAk6V0ktDfbZ-JY_darPYDoE0joxPehCWJ_yAMeLXxft0ElRUKwpot7HxfP9e_tHKKT_9OoOO09oGIqPH2J6nUklRc7cF4n-T--YXygED6/200x150",
    floatValue: 0.01, prices: { steam: 1450.00, csfloat: 1290.00, skinport: 1350.00 }, dealScore: 68,
  },
]

const weapons = ["All", "Rifle", "Pistol", "SMG", "Sniper", "Knife"]
const platforms = ["All", "Steam", "CSFloat", "Skinport"]
const minScores = [0, 20, 50, 80]

export default function DealsPage() {
  const [deals, setDeals] = useState<SkinItem[]>(mockDeals)
  const [loading, setLoading] = useState(false)
  const [weapon, setWeapon] = useState("All")
  const [platform, setPlatform] = useState("All")
  const [minScore, setMinScore] = useState(0)

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/deals?weapon=${weapon}&platform=${platform}&minScore=${minScore}`)
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
              wear: name.match(/\(([^)]+)\)/)?.[1] ?? "Unknown",
              rarity: "Mil-Spec Grade",
              imageUrl: "",
              floatValue: (d.float_value as number) ?? undefined,
              prices: {
                steam: prices.steam ?? undefined,
                csfloat: prices.csfloat ?? undefined,
                skinport: prices.skinport ?? undefined,
              },
              dealScore: (d.deal_score as number) ?? 0,
            }
          })
          setDeals(mapped.length > 0 ? mapped : mockDeals)
        } else {
          setDeals(mockDeals)
        }
      } catch {
        setDeals(mockDeals)
      } finally {
        setLoading(false)
      }
    }
    fetchDeals()
  }, [weapon, platform, minScore])

  const filtered = deals.filter((d) => d.dealScore >= minScore)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Top Deals</h1>
          <p className="text-sm text-zinc-500">Best deals across all platforms, updated live</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 rounded-lg bg-[#141414] border border-zinc-800/50">
        <div className="space-y-1.5">
          <span className="text-xs text-zinc-500">Weapon</span>
          <div className="flex gap-1">
            {weapons.map((w) => (
              <button key={w} onClick={() => setWeapon(w)} className={cn("px-2 py-1 text-xs rounded-md", weapon === w ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 border border-transparent")}>{w}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs text-zinc-500">Platform</span>
          <div className="flex gap-1">
            {platforms.map((p) => (
              <button key={p} onClick={() => setPlatform(p)} className={cn("px-2 py-1 text-xs rounded-md", platform === p ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 border border-transparent")}>{p}</button>
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => <SkinCard key={item.slug} item={item} />)}
        </div>
      )}
    </div>
  )
}
