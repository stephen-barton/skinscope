import type { Item, ItemPrice } from '@/types';

const SKINPORT_API = 'https://api.skinport.com/v1/items';

interface SkinportItem {
  market_hash_name: string;
  currency: string;
  suggested_price: number | null;
  item_page: string;
  market_page: string;
  min_price: number | null;
  max_price: number | null;
  mean_price: number | null;
  median_price: number | null;
  quantity: number;
  created_at: number;
  updated_at: number;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseMarketHashName(name: string): {
  weapon: string | null;
  skin_name: string | null;
  is_stattrak: boolean;
  is_souvenir: boolean;
  wear: string | null;
} {
  let working = name;
  const is_stattrak = working.startsWith('StatTrak™ ');
  if (is_stattrak) working = working.replace('StatTrak™ ', '');
  const is_souvenir = working.startsWith('Souvenir ');
  if (is_souvenir) working = working.replace('Souvenir ', '');

  const wearMatch = working.match(/\(([^)]+)\)$/);
  const wear = wearMatch ? wearMatch[1] : null;
  if (wearMatch) working = working.replace(wearMatch[0], '').trim();

  const parts = working.split(' | ');
  const weapon = parts[0] || null;
  const skin_name = parts[1] || null;

  return { weapon, skin_name, is_stattrak, is_souvenir, wear };
}

export interface SkinportFetchResult {
  items: Partial<Item>[];
  prices: Omit<ItemPrice, 'id' | 'item_id' | 'platform_id'>[];
}

export async function fetchSkinportItems(): Promise<SkinportFetchResult> {
  const response = await fetch(`${SKINPORT_API}?app_id=730&currency=USD`, {
    next: { revalidate: 300 }, // cache 5 min in Next.js
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Skinport API error: ${response.status} ${response.statusText}`);
  }

  const raw: SkinportItem[] = await response.json();

  const items: Partial<Item>[] = [];
  const prices: Omit<ItemPrice, 'id' | 'item_id' | 'platform_id'>[] = [];

  for (const sp of raw) {
    const parsed = parseMarketHashName(sp.market_hash_name);

    items.push({
      name: sp.market_hash_name,
      slug: slugify(sp.market_hash_name),
      weapon: parsed.weapon,
      skin_name: parsed.skin_name,
      is_stattrak: parsed.is_stattrak,
      is_souvenir: parsed.is_souvenir,
    });

    prices.push({
      min_price: sp.min_price,
      median_price: sp.median_price,
      mean_price: sp.mean_price,
      volume: sp.quantity,
      listed_count: sp.quantity,
      updated_at: new Date(sp.updated_at * 1000).toISOString(),
    });
  }

  return { items, prices };
}
