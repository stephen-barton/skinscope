"use client"

import { useState, useCallback } from "react"
import { SearchBar } from "@/components/search-bar"
import { SkinCard, type SkinItem } from "@/components/skin-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Filter } from "lucide-react"
import { cn, getSkinImageUrl } from "@/lib/utils"

const weaponTypes = ["All", "Rifle", "Pistol", "SMG", "Shotgun", "Sniper", "Knife", "Gloves"]
const rarities = ["All", "Consumer Grade", "Industrial Grade", "Mil-Spec", "Restricted", "Classified", "Covert", "Contraband"]
const wears = ["All", "Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"]

export default function SearchPage() {
  const [results, setResults] = useState<SkinItem[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedWeapon, setSelectedWeapon] = useState("All")
  const [selectedRarity, setSelectedRarity] = useState("All")
  const [selectedWear, setSelectedWear] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  const search = useCallback(async (q: string) => {
    setQuery(q)
    setHasSearched(true)
    if (!q) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&weapon=${selectedWeapon}&rarity=${selectedRarity}&wear=${selectedWear}`)
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
            prices: {
              steam: undefined,
              csfloat: undefined,
              skinport: (prices.skinport as number) ?? undefined,
            },
            dealScore: 0,
            skinportUrl: (d.skinport_url as string) ?? undefined,
          }
        })
        setResults(mapped)
      } else {
        setResults([])
      }
    } catch {
      setResults([])
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
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 bg-zinc-800/50 rounded-lg" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-sm text-zinc-500 mb-4">{results.length} results{query && ` for "${query}"`}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {results.map((item) => (
                <SkinCard key={item.slug} item={item} />
              ))}
            </div>
          </>
        ) : hasSearched ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-lg">No results found{query && ` for "${query}"`}</p>
            <p className="text-zinc-600 text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-lg">Search for CS2 skins</p>
            <p className="text-zinc-600 text-sm mt-1">Type a skin name to compare prices across platforms</p>
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
