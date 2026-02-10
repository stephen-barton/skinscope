export interface SkinportItem {
  market_hash_name: string;
  currency: string;
  suggested_price: number;
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

let cachedItems: SkinportItem[] | null = null;
let cacheTime = 0;

export async function fetchSkinportItems(
  cacheTtl = 30_000
): Promise<SkinportItem[]> {
  const now = Date.now();
  if (cachedItems && now - cacheTime < cacheTtl) return cachedItems;

  const res = await fetch(
    "https://api.skinport.com/v1/items?app_id=730&currency=USD",
    { next: { revalidate: 30 } }
  );

  if (!res.ok) {
    if (cachedItems) return cachedItems;
    throw new Error(`Skinport API error: ${res.status}`);
  }

  cachedItems = await res.json();
  cacheTime = now;
  return cachedItems!;
}
