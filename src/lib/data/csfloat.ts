import type { Listing, Sticker } from '@/types';

const CSFLOAT_API = 'https://csfloat.com/api/v1/listings';

interface CSFloatSticker {
  name: string;
  slot: number;
  wear?: number;
  icon_url?: string;
}

interface CSFloatListing {
  id: string;
  price: number; // in cents
  created_at: string;
  type: string;
  item: {
    market_hash_name: string;
    float_value: number | null;
    paint_seed: number | null;
    wear_name: string | null;
    stickers: CSFloatSticker[];
    is_stattrak: boolean;
    icon_url?: string;
  };
}

interface CSFloatResponse {
  data: CSFloatListing[];
}

function classifySticker(name: string): Sticker['type'] {
  const lower = name.toLowerCase();
  if (lower.includes('(gold)') || lower.includes('gold')) return 'gold';
  if (lower.includes('(holo)') || lower.includes('holo')) return 'holo';
  if (lower.includes('(foil)') || lower.includes('foil')) return 'foil';
  if (lower.includes('tournament')) return 'tournament';
  return 'regular';
}

export interface CSFloatFetchResult {
  listings: (Omit<Listing, 'id' | 'item_id' | 'platform_id'> & {
    market_hash_name: string;
  })[];
}

export async function fetchCSFloatListings(
  options: { sort_by?: string; limit?: number; market_hash_name?: string } = {}
): Promise<CSFloatFetchResult> {
  const params = new URLSearchParams();
  params.set('sort_by', options.sort_by ?? 'best_deal');
  params.set('limit', String(options.limit ?? 50));
  if (options.market_hash_name) {
    params.set('market_hash_name', options.market_hash_name);
  }

  const response = await fetch(`${CSFLOAT_API}?${params}`, {
    next: { revalidate: 120 }, // cache 2 min
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`CSFloat API error: ${response.status} ${response.statusText}`);
  }

  const raw: CSFloatResponse = await response.json();

  const listings = (raw.data ?? []).map((l) => {
    const stickers: Sticker[] = (l.item.stickers ?? []).map((s) => ({
      name: s.name,
      slot: s.slot,
      wear: s.wear,
      icon_url: s.icon_url,
      type: classifySticker(s.name),
    }));

    return {
      external_id: l.id,
      price: l.price / 100, // cents → dollars
      float_value: l.item.float_value,
      paint_seed: l.item.paint_seed,
      wear: l.item.wear_name,
      stickers,
      is_stattrak: l.item.is_stattrak ?? false,
      listing_url: `https://csfloat.com/item/${l.id}`,
      deal_score: null,
      created_at: l.created_at,
      expires_at: null,
      market_hash_name: l.item.market_hash_name,
      platform_name: 'csfloat' as const,
    };
  });

  return { listings };
}
