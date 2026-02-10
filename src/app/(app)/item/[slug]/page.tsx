"use client"

import { useState, useEffect, use } from "react"
import { PriceComparisonTable } from "@/components/price-comparison-table"
import { PriceChart } from "@/components/price-chart"
import { DealScoreBadge } from "@/components/deal-score-badge"
import { FloatBar } from "@/components/float-bar"
import { StickerRow } from "@/components/sticker-row"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExternalLink, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatPrice, getRarityColor, getWearAbbrev } from "@/lib/utils"

const mockItem = {
  name: "AK-47 | Asiimov",
  weapon: "AK-47",
  skin: "Asiimov",
  wear: "Field-Tested",
  rarity: "Covert",
  imageUrl: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXnkJ5lZjP1qKXMxIi_ChOBel8-f0uldL6GOAk6V0ktDfbZ-JY_darPYDoE0joxPehCWJ_yAMeLXxft0ElRUKwpot7HxfP9e_tHKKT_9OoOO09oGIqPH2J6nUklRc7cF4n-T--YXygED6/400x300",
  floatValue: 0.21,
  dealScore: 72,
  prices: [
    { platform: "Steam", price: 35.99, fee: 5.04, finalCost: 41.03, url: "https://store.steampowered.com" },
    { platform: "CSFloat", price: 31.50, fee: 1.58, finalCost: 33.08, url: "https://csfloat.com" },
    { platform: "Skinport", price: 32.20, fee: 3.86, finalCost: 36.06, url: "https://skinport.com" },
  ],
}

const mockPriceHistory = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(Date.now() - (90 - i) * 86400000)
  const base = 32
  return {
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    steam: +(base + 4 + Math.sin(i / 10) * 2 + Math.random() * 1.5).toFixed(2),
    csfloat: +(base + Math.sin(i / 10) * 1.8 + Math.random() * 1.2).toFixed(2),
    skinport: +(base + 1.5 + Math.sin(i / 10) * 1.5 + Math.random() * 1).toFixed(2),
  }
})

const mockListings = [
  { id: "1", price: 31.50, floatValue: 0.21, stickers: [{ name: "Navi Holo" }, { name: "s1mple" }], dealScore: 72, url: "https://csfloat.com" },
  { id: "2", price: 32.00, floatValue: 0.15, stickers: [{ name: "Titan Holo" }], dealScore: 68, url: "https://csfloat.com" },
  { id: "3", price: 32.80, floatValue: 0.28, stickers: [], dealScore: 55, url: "https://csfloat.com" },
  { id: "4", price: 33.20, floatValue: 0.32, stickers: [{ name: "Crown Foil" }, { name: "Crown Foil" }], dealScore: 48, url: "https://csfloat.com" },
  { id: "5", price: 34.00, floatValue: 0.37, stickers: [], dealScore: 35, url: "https://csfloat.com" },
]

export default function ItemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [item, setItem] = useState(mockItem)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/item/${slug}`)
        if (res.ok) setItem(await res.json())
      } catch { /* use mock */ }
      finally { setLoading(false) }
    }
    fetchItem()
  }, [slug])

  const rarityColor = getRarityColor(item.rarity)

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
            <img src={item.imageUrl} alt={item.name} className="max-h-full w-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]" />
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
              <span className="text-sm text-zinc-500 font-mono">{item.wear} ({getWearAbbrev(item.wear)})</span>
              <DealScoreBadge score={item.dealScore} />
            </div>
          </div>

          {item.floatValue != null && (
            <div>
              <p className="text-xs text-zinc-500 mb-1">Float Value</p>
              <FloatBar value={item.floatValue} />
            </div>
          )}

          <PriceComparisonTable prices={item.prices} />
        </div>
      </div>

      {/* Price Chart */}
      <Card className="bg-[#141414] border-zinc-800/50 p-6">
        <PriceChart data={mockPriceHistory} />
      </Card>

      {/* Listings */}
      <Card className="bg-[#141414] border-zinc-800/50 p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">CSFloat Listings</h3>
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Price</TableHead>
                <TableHead className="text-zinc-400">Float</TableHead>
                <TableHead className="text-zinc-400">Stickers</TableHead>
                <TableHead className="text-zinc-400">Deal Score</TableHead>
                <TableHead className="text-zinc-400"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockListings.map((listing) => (
                <TableRow key={listing.id} className="border-zinc-800/50">
                  <TableCell className="font-mono font-bold text-zinc-200">{formatPrice(listing.price)}</TableCell>
                  <TableCell>
                    <FloatBar value={listing.floatValue} className="w-24" />
                  </TableCell>
                  <TableCell>
                    <StickerRow stickers={listing.stickers} />
                  </TableCell>
                  <TableCell>
                    <DealScoreBadge score={listing.dealScore} size="sm" />
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" asChild className="h-7 text-xs border-zinc-700">
                      <a href={listing.url} target="_blank" rel="noopener noreferrer">
                        Buy <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
