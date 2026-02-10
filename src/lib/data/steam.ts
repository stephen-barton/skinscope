const STEAM_API = 'https://steamcommunity.com/market/priceoverview/';

interface SteamPriceOverview {
  success: boolean;
  lowest_price?: string;
  volume?: string;
  median_price?: string;
}

// Simple in-memory cache with TTL
const cache = new Map<string, { data: SteamPriceResult; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface SteamPriceResult {
  lowest_price: number | null;
  median_price: number | null;
  volume: number | null;
}

function parseSteamPrice(priceStr?: string): number | null {
  if (!priceStr) return null;
  // Remove currency symbols, commas, etc. Steam returns like "$12.34"
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}

export async function fetchSteamPrice(
  marketHashName: string
): Promise<SteamPriceResult> {
  const cacheKey = marketHashName;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const params = new URLSearchParams({
    appid: '730',
    currency: '1', // USD
    market_hash_name: marketHashName,
  });

  const response = await fetch(`${STEAM_API}?${params}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    // Steam rate-limits aggressively; return nulls on failure
    console.warn(`Steam API error for "${marketHashName}": ${response.status}`);
    return { lowest_price: null, median_price: null, volume: null };
  }

  const raw: SteamPriceOverview = await response.json();

  if (!raw.success) {
    return { lowest_price: null, median_price: null, volume: null };
  }

  const result: SteamPriceResult = {
    lowest_price: parseSteamPrice(raw.lowest_price),
    median_price: parseSteamPrice(raw.median_price),
    volume: raw.volume ? parseInt(raw.volume.replace(/,/g, ''), 10) : null,
  };

  cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL });
  return result;
}

/** Clear the in-memory cache (useful for testing) */
export function clearSteamCache(): void {
  cache.clear();
}
