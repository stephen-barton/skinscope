"use client"

import { useState, useEffect, useCallback } from "react"
import { SearchBar } from "@/components/search-bar"
import { SkinCard, type SkinItem } from "@/components/skin-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

const weaponTypes = ["All", "Rifle", "Pistol", "SMG", "Shotgun", "Sniper", "Knife", "Gloves"]
const rarities = ["All", "Consumer Grade", "Industrial Grade", "Mil-Spec", "Restricted", "Classified", "Covert", "Contraband"]
const wears = ["All", "Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"]

const mockResults: SkinItem[] = [
  {
    name: "AK-47 | Asiimov (Field-Tested)", slug: "ak-47-asiimov-ft", weapon: "AK-47", skin: "Asiimov", wear: "Field-Tested",
    rarity: "Covert", imageUrl: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXnkJ5lZjP1qKXMxIi_ChOBel8-f0uldL6GOAk6V0ktDfbZ-JY_darPYDoE0joxPehCWJ_yAMeLXxft0ElRUKwpot7HxfP9e_tHKKT_9OoOO09oGIqPH2J6nUklRc7cF4n-T--YXygED6/200x150",
    floatValue: 0.21, prices: { steam: 35.99, csfloat: 31.50, skinport: 32.20 }, dealScore: 72,
  },
  {
    name: "AWP | Dragon Lore (Factory New)", slug: "awp-dragon-lore-fn", weapon: "AWP", skin: "Dragon Lore", wear: "Factory New",
    rarity: "Covert", imageUrl: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXnkJ5lZjP1qKXMxIi_ChOBel8-f0uldL6GOAk6V0ktDfbZ-JY_darPYDoE0joxPehCWJ_yAMeLXxft0ElRUKwpot7HxfP9e_tHKKT_9OoOO09oGIqPH2J6nUklRc7cF4n-T--YXygED6/200x150",
    floatValue: 0.03, prices: { steam: 8500.00, csfloat: 7850.00, skinport: 8100.00 }, dealScore: 85,
  },
  {
    name: "M4A4 | Howl (Minimal Wear)", slug: "m4a4-howl-mw", weapon: "M4A4", skin: "Howl", wear: "Minimal Wear",
    rarity: "Contraband", imageUrl: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXnkJ5lZjP1qKXMxIi_ChOBel8-f0uldL6GOAk6V0ktDfbZ-JY_darPYDoE0joxPehCWJ_yAMeLXxft0ElRUKwpot7HxfP9e_tHKKT_9OoOO09oGIqPH2J6nUklRc7cF4n-T--YXygED6/200x150",
    floatValue: 0.09, prices: { steam: 4200.00, csfloat: 3950.00, skinport: 4100.00 }, dealScore: 62,
  },
  {
    name: "USP-S | Kill Confirmed (Factory New)", slug: "usp-s-kill-confirmed-fn", weapon: "USP-S", skin: "Kill Confirmed", wear: "Factory New",
    rarity: "Covert", imageUrl: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXnkJ5lZjP1qKXMxIi_ChOBel8-f0uldL6GOAk6V0ktDfbZ-JY_darPYDoE0joxPehCWJ_yAMeLXxft0ElRUKwpot7HxfP9e_tHKKT_9OoOO09oGIqPH2J6nUklRc7cF4n-T--YXygED6/200x150",
    floatValue: 0.02, prices: { steam: 89.99, csfloat: 82.50, skinport: 85.00 }, dealScore: 45,
  },
  {
    name: "Glock-18 | Fade (Factory New)", slug: "glock-18-fade-fn", weapon: "Glock-18", skin: "Fade", wear: "Factory New",
    rarity: "Restricted", imageUrl: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXnkJ5lZjP1qKXMxIi_ChOBel8-f0uldL6GOAk6V0ktDfbZ-JY_darPYDoE0joxPehCWJ_yAMeLXxft0ElRUKwpot7HxfP9e_tHKKT_9OoOO09oGIqPH2J6nUklRc7cF4n-T--YXygED6/200x150",
    floatValue: 0.01, prices: { steam: 1450.00, csfloat: 1380.00, skinport: 1400.00 }, dealScore: 55,
  },
  {
    name: "Desert Eagle | Blaze (Factory New)", slug: "desert-eagle-blaze-fn", weapon: "Desert Eagle", skin: "Blaze", wear: "Factory New",
    rarity: "Restricted", imageUrl: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXnkJ5lZjP1qKXMxIi_ChOBel8-f0uldL6GOAk6V0ktDfbZ-JY_darPYDoE0joxPehCWJ_yAMeLXxft0ElRUKwpot7HxfP9e_tHKKT_9OoOO09oGIqPH2J6nUklRc7cF4n-T--YXygED6/200x150",
    floatValue: 0.005, prices: { steam: 420.00, csfloat: 395.00, skinport: 410.00 }, dealScore: 38,
  },
]

export default function SearchPage() {
  const [results, setResults] = useState<SkinItem[]>(mockResults)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedWeapon, setSelectedWeapon] = useState("All")
  const [selectedRarity, setSelectedRarity] = useState("All")
  const [selectedWear, setSelectedWear] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  const search = useCallback(async (q: string) => {
    setQuery(q)
    if (!q) { setResults(mockResults); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&weapon=${selectedWeapon}&rarity=${selectedRarity}&wear=${selectedWear}`)
      if (res.ok) setResults(await res.json())
      else setResults(mockResults.filter((r) => r.name.toLowerCase().includes(q.toLowerCase())))
    } catch {
      setResults(mockResults.filter((r) => r.name.toLowerCase().includes(q.toLowerCase())))
    } finally {
      setLoading(false)
    }
  }, [selectedWeapon, selectedRarity, selectedWear])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Free tier notice */}
      <Alert className="bg-yellow-500/5 border-yellow-500/20">
        <Clock className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-yellow-400/80 text-sm">
          Free tier data is delayed by 60 seconds.{" "}
          <a href="/settings" className="underline text-yellow-400 hover:text-yellow-300">Upgrade to Pro</a> for real-time prices.
        </AlertDescription>
      </Alert>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <SearchBar
          onSearch={search}
          onSelect={(item) => { window.location.href = `/item/${item.slug}` }}
          className="flex-1"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors border",
            showFilters ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-zinc-800 text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-3 p-4 rounded-lg bg-[#141414] border border-zinc-800/50">
          <FilterRow label="Weapon" options={weaponTypes} selected={selectedWeapon} onSelect={setSelectedWeapon} />
          <FilterRow label="Rarity" options={rarities} selected={selectedRarity} onSelect={setSelectedRarity} />
          <FilterRow label="Wear" options={wears} selected={selectedWear} onSelect={setSelectedWear} />
        </div>
      )}

      {/* Results */}
      <div>
        <p className="text-sm text-zinc-500 mb-4">{results.length} results{query && ` for "${query}"`}</p>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 bg-zinc-800/50 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((item) => (
              <SkinCard key={item.slug} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterRow({ label, options, selected, onSelect }: { label: string; options: string[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-zinc-500 w-16 shrink-0">{label}</span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={cn(
            "px-2.5 py-1 text-xs rounded-md transition-colors",
            selected === opt
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 border border-transparent"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
