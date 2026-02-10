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
