import type { Sticker } from '@/types';

// Float value ranges per wear
const FLOAT_RANGES: Record<string, [number, number]> = {
  'Factory New': [0, 0.07],
  'Minimal Wear': [0.07, 0.15],
  'Field-Tested': [0.15, 0.38],
  'Well-Worn': [0.38, 0.45],
  'Battle-Scarred': [0.45, 1.0],
};

// Known rare patterns (case-hardened blue gems, etc.)
const RARE_PATTERN_SEEDS = new Set([
  387, 661, 321, 955, 592, 670, 168, 179, 864, 219, // AK CH blue gems
  442, 463, 670, 868, // Karambit blue gems
]);

interface DealScoreInput {
  listingPrice: number;
  avgMarketPrice: number;
  floatValue?: number | null;
  wear?: string | null;
  stickers?: Sticker[];
  paintSeed?: number | null;
  weapon?: string | null;
}

export function calculateDealScore(input: DealScoreInput): number {
  const { listingPrice, avgMarketPrice, floatValue, wear, stickers, paintSeed } = input;

  if (avgMarketPrice <= 0 || listingPrice <= 0) return 0;

  // Base score: % below average market price
  let score = ((avgMarketPrice - listingPrice) / avgMarketPrice) * 100;

  // Float value boosts/penalties
  if (floatValue != null && wear) {
    const range = FLOAT_RANGES[wear];
    if (range) {
      const [minF, maxF] = range;
      const spanSize = maxF - minF;
      const position = (floatValue - minF) / spanSize; // 0 = best, 1 = worst

      if (position <= 0.05) {
        // Bottom 5% float (best): up to +10
        score += 10 * (1 - position / 0.05);
      } else if (position >= 0.95) {
        // Top 5% float (worst): up to -8
        score -= 8 * ((position - 0.95) / 0.05);
      }
    }
  }

  // Sticker boosts (capped at +15 total)
  if (stickers && stickers.length > 0) {
    let stickerBoost = 0;
    for (const sticker of stickers) {
      switch (sticker.type) {
        case 'gold':
        case 'holo':
          stickerBoost += 5;
          break;
        case 'foil':
          stickerBoost += 3;
          break;
        case 'tournament':
          stickerBoost += 2;
          break;
        default:
          break;
      }
    }
    score += Math.min(stickerBoost, 15);
  }

  // Rare pattern boost
  if (paintSeed != null && RARE_PATTERN_SEEDS.has(paintSeed)) {
    score += 12;
  }

  // Clamp to [-50, 100]
  return Math.round(Math.max(-50, Math.min(100, score)) * 100) / 100;
}
