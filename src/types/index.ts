// ============================================================
// Enums & Literal Types
// ============================================================

export type Platform = 'steam' | 'skinport' | 'csfloat';

export type Rarity =
  | 'Consumer Grade'
  | 'Industrial Grade'
  | 'Mil-Spec Grade'
  | 'Restricted'
  | 'Classified'
  | 'Covert'
  | 'Contraband'
  | 'Distinguished'
  | 'Exceptional'
  | 'Superior'
  | 'Master';

export type Wear =
  | 'Factory New'
  | 'Minimal Wear'
  | 'Field-Tested'
  | 'Well-Worn'
  | 'Battle-Scarred';

export type Tier = 'free' | 'pro';

// ============================================================
// Core Models
// ============================================================

export interface Item {
  id: string;
  name: string; // market_hash_name
  slug: string;
  weapon: string | null;
  skin_name: string | null;
  type: string | null;
  rarity: string | null;
  collection: string | null;
  is_stattrak: boolean;
  is_souvenir: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemPrice {
  id: string;
  item_id: string;
  platform_id: string;
  platform_name?: Platform;
  min_price: number | null;
  median_price: number | null;
  mean_price: number | null;
  volume: number | null;
  listed_count: number | null;
  updated_at: string;
}

export interface ItemWithPrices extends Item {
  prices: ItemPrice[];
  best_price?: number;
  best_platform?: Platform;
}

export interface Sticker {
  name: string;
  slot: number;
  wear?: number;
  icon_url?: string;
  type?: 'holo' | 'foil' | 'gold' | 'tournament' | 'regular';
}

export interface Listing {
  id: string;
  item_id: string;
  platform_id: string;
  platform_name?: Platform;
  external_id: string | null;
  price: number;
  float_value: number | null;
  paint_seed: number | null;
  wear: string | null;
  stickers: Sticker[];
  is_stattrak: boolean;
  listing_url: string | null;
  deal_score: number | null;
  created_at: string;
  expires_at: string | null;
  item?: Item;
}

export interface PricePoint {
  date: string;
  min_price: number | null;
  median_price: number | null;
  volume: number | null;
  platform: Platform;
}

export interface DealListing extends Listing {
  item_name: string;
  item_slug: string;
  item_image_url: string | null;
  avg_market_price: number;
  savings_pct: number;
}

export interface Alert {
  id: string;
  user_id: string;
  item_name: string;
  target_price: number;
  platform: string | null;
  condition: 'below' | 'above';
  is_active: boolean;
  last_triggered: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  tier: Tier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  steam_id: string | null;
  alert_count: number;
  api_key: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Search & Filters
// ============================================================

export interface SearchFilters {
  query?: string;
  weapon?: string;
  type?: string;
  rarity?: string;
  collection?: string;
  min_price?: number;
  max_price?: number;
  platform?: Platform;
  wear?: Wear;
  is_stattrak?: boolean;
  is_souvenir?: boolean;
  sort_by?: 'price_asc' | 'price_desc' | 'name' | 'deal_score' | 'newest';
  limit?: number;
  offset?: number;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data: T;
  count?: number;
  error?: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code: string;
    status: number;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
