import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    "Consumer Grade": "#b0c3d9",
    "Industrial Grade": "#5e98d9",
    "Mil-Spec": "#4b69ff",
    "Restricted": "#8847ff",
    "Classified": "#d32ce6",
    "Covert": "#eb4b4b",
    "Contraband": "#e4ae39",
  }
  return colors[rarity] || "#b0c3d9"
}

export function getWearAbbrev(wear: string): string {
  const abbrevs: Record<string, string> = {
    "Factory New": "FN",
    "Minimal Wear": "MW",
    "Field-Tested": "FT",
    "Well-Worn": "WW",
    "Battle-Scarred": "BS",
  }
  return abbrevs[wear] || wear
}

/** Build a Steam CDN image URL for a CS2 skin via steamapis.com redirect */
export function getSkinImageUrl(marketHashName: string): string {
  return `https://api.steamapis.com/image/item/730/${encodeURIComponent(marketHashName)}`
}

/** Build a Skinport buy URL from item_page or market_hash_name */
export function getSkinportUrl(itemPage?: string | null, marketHashName?: string): string {
  if (itemPage) return itemPage
  if (marketHashName) {
    const slug = marketHashName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    return `https://skinport.com/item/${slug}`
  }
  return "https://skinport.com"
}

/** Build a Steam Market listing URL */
export function getSteamMarketUrl(marketHashName: string): string {
  return `https://steamcommunity.com/market/listings/730/${encodeURIComponent(marketHashName)}`
}
