import { getReadClient } from './client';
import type { ItemWithPrices, Listing, PricePoint, SearchFilters, DealListing } from '@/types';

// ============================================================
// Search Items (pg_trgm similarity)
// ============================================================

export async function searchItems(
  query: string,
  filters: SearchFilters = {}
): Promise<{ data: ItemWithPrices[]; count: number }> {
  const db = getReadClient();
  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  // Use RPC for trigram search or fall back to ilike
  let itemQuery = db
    .from('items')
    .select('*, item_prices(*)', { count: 'exact' });

  if (query) {
    itemQuery = itemQuery.ilike('name', `%${query}%`);
  }
  if (filters.weapon) itemQuery = itemQuery.eq('weapon', filters.weapon);
  if (filters.rarity) itemQuery = itemQuery.eq('rarity', filters.rarity);
  if (filters.type) itemQuery = itemQuery.eq('type', filters.type);
  if (filters.collection) itemQuery = itemQuery.eq('collection', filters.collection);
  if (filters.is_stattrak !== undefined) itemQuery = itemQuery.eq('is_stattrak', filters.is_stattrak);
  if (filters.is_souvenir !== undefined) itemQuery = itemQuery.eq('is_souvenir', filters.is_souvenir);

  itemQuery = itemQuery.range(offset, offset + limit - 1);

  if (filters.sort_by === 'name') {
    itemQuery = itemQuery.order('name', { ascending: true });
  } else {
    itemQuery = itemQuery.order('updated_at', { ascending: false });
  }

  const { data, count, error } = await itemQuery;
  if (error) throw error;

  const items: ItemWithPrices[] = (data ?? []).map((row) => {
    const prices = row.item_prices ?? [];
    const minPrice = prices.reduce(
      (min: number | undefined, p: { min_price?: number | null }) =>
        p.min_price != null ? (min == null ? p.min_price : Math.min(min, p.min_price)) : min,
      undefined as number | undefined
    );
    return {
      ...row,
      prices,
      best_price: minPrice,
      item_prices: undefined,
    };
  });

  return { data: items, count: count ?? 0 };
}

// ============================================================
// Get Item by Slug (with prices)
// ============================================================

export async function getItemBySlug(slug: string): Promise<ItemWithPrices | null> {
  const db = getReadClient();
  const { data, error } = await db
    .from('items')
    .select('*, item_prices(*, platforms(name))')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;

  const prices = (data.item_prices ?? []).map((p: Record<string, unknown>) => ({
    ...p,
    platform_name: (p.platforms as { name?: string } | null)?.name,
  }));

  const minPrice = prices.reduce(
    (min: number | undefined, p: { min_price?: number | null }) =>
      p.min_price != null ? (min == null ? p.min_price : Math.min(min, p.min_price)) : min,
    undefined as number | undefined
  );

  return {
    ...data,
    prices,
    best_price: minPrice,
    item_prices: undefined,
  };
}

// ============================================================
// Top Deals
// ============================================================

export async function getTopDeals(
  limit = 20,
  offset = 0
): Promise<DealListing[]> {
  const db = getReadClient();
  const { data, error } = await db
    .from('listings')
    .select('*, items(name, slug, image_url), platforms(name)')
    .not('deal_score', 'is', null)
    .order('deal_score', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const item = row.items as { name: string; slug: string; image_url: string | null } | null;
    return {
      ...row,
      platform_name: (row.platforms as { name?: string } | null)?.name,
      item_name: item?.name ?? '',
      item_slug: item?.slug ?? '',
      item_image_url: item?.image_url ?? null,
      avg_market_price: 0, // enriched at API layer
      savings_pct: row.deal_score ?? 0,
      stickers: row.stickers ?? [],
      items: undefined,
      platforms: undefined,
    };
  });
}

// ============================================================
// Price History
// ============================================================

export async function getPriceHistory(
  itemId: string,
  days = 30
): Promise<PricePoint[]> {
  const db = getReadClient();
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const { data, error } = await db
    .from('price_history')
    .select('min_price, median_price, volume, recorded_at, platforms(name)')
    .eq('item_id', itemId)
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    date: row.recorded_at,
    min_price: row.min_price,
    median_price: row.median_price,
    volume: row.volume,
    platform: ((row.platforms as { name?: string } | null)?.name ?? 'steam') as PricePoint['platform'],
  }));
}

// ============================================================
// Listings for Item
// ============================================================

export async function getListingsForItem(
  itemId: string,
  platform?: string
): Promise<Listing[]> {
  const db = getReadClient();
  let query = db
    .from('listings')
    .select('*, platforms(name)')
    .eq('item_id', itemId)
    .order('price', { ascending: true });

  if (platform) {
    // Join to filter by platform name
    query = query.eq('platforms.name', platform);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...row,
    platform_name: (row.platforms as { name?: string } | null)?.name,
    stickers: row.stickers ?? [],
    platforms: undefined,
  }));
}
