"use client"

import { cn } from "@/lib/utils"

interface Sticker {
  name: string
  imageUrl?: string
}

interface StickerRowProps {
  stickers: Sticker[]
  className?: string
}

export function StickerRow({ stickers, className }: StickerRowProps) {
  if (!stickers.length) return null
  return (
    <div className={cn("flex gap-1", className)}>
      {stickers.map((s, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700/50 flex items-center justify-center overflow-hidden"
          title={s.name}
        >
          {s.imageUrl ? (
            <img src={s.imageUrl} alt={s.name} className="w-6 h-6 object-contain" />
          ) : (
            <span className="text-[8px] text-zinc-500">S</span>
          )}
        </div>
      ))}
    </div>
  )
}
