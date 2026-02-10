"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatPrice, cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"

interface PlatformPrice {
  platform: string
  price: number
  fee: number
  finalCost: number
  url: string
}

interface PriceComparisonTableProps {
  prices: PlatformPrice[]
  className?: string
}

export function PriceComparisonTable({ prices, className }: PriceComparisonTableProps) {
  if (!prices || prices.length === 0) {
    return <div className="text-sm text-zinc-500 p-4">No price data available</div>
  }
  const lowestFinal = Math.min(...prices.map((p) => p.finalCost ?? Infinity))

  return (
    <div className={cn("rounded-lg border border-zinc-800 overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400">Platform</TableHead>
            <TableHead className="text-zinc-400 text-right">Price</TableHead>
            <TableHead className="text-zinc-400 text-right">Fee</TableHead>
            <TableHead className="text-zinc-400 text-right">Final Cost</TableHead>
            <TableHead className="text-zinc-400 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prices.map((p) => {
            const isBest = p.finalCost === lowestFinal
            return (
              <TableRow
                key={p.platform}
                className={cn(
                  "border-zinc-800/50",
                  isBest && "bg-green-500/5"
                )}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {isBest && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                    <span className={isBest ? "text-green-400" : "text-zinc-300"}>{p.platform}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-zinc-300">{formatPrice(p.price)}</TableCell>
                <TableCell className="text-right font-mono text-zinc-500">{formatPrice(p.fee)}</TableCell>
                <TableCell className={cn("text-right font-mono font-bold", isBest ? "text-green-400" : "text-zinc-200")}>
                  {formatPrice(p.finalCost)}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant={isBest ? "default" : "outline"} asChild className="h-7 text-xs">
                    <a href={p.url} target="_blank" rel="noopener noreferrer">
                      Buy <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
