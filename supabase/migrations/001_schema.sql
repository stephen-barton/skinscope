-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  affiliate_url_template TEXT,
  fee_pct NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,            -- market_hash_name
  slug TEXT UNIQUE NOT NULL,
  weapon TEXT,
  skin_name TEXT,
  type TEXT,
  rarity TEXT,
  collection TEXT,
  is_stattrak BOOLEAN DEFAULT false,
  is_souvenir BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE item_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  min_price NUMERIC(12,2),
  median_price NUMERIC(12,2),
  mean_price NUMERIC(12,2),
  volume INTEGER,
  listed_count INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(item_id, platform_id)
);

CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  min_price NUMERIC(12,2),
  median_price NUMERIC(12,2),
  volume INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  external_id TEXT,
  price NUMERIC(12,2) NOT NULL,
  float_value NUMERIC(18,16),
  paint_seed INTEGER,
  wear TEXT,
  stickers JSONB DEFAULT '[]',
  is_stattrak BOOLEAN DEFAULT false,
  listing_url TEXT,
  deal_score NUMERIC(6,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(platform_id, external_id)
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  steam_id TEXT,
  alert_count INTEGER DEFAULT 0,
  api_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  target_price NUMERIC(12,2) NOT NULL,
  platform TEXT,
  condition TEXT DEFAULT 'below' CHECK (condition IN ('below', 'above')),
  is_active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_items_name_trgm ON items USING gin (name gin_trgm_ops);
CREATE INDEX idx_items_slug ON items (slug);
CREATE INDEX idx_items_weapon ON items (weapon);
CREATE INDEX idx_items_rarity ON items (rarity);

CREATE INDEX idx_item_prices_item ON item_prices (item_id);
CREATE INDEX idx_item_prices_platform ON item_prices (platform_id);

CREATE INDEX idx_price_history_item_date ON price_history (item_id, recorded_at DESC);

CREATE INDEX idx_listings_item ON listings (item_id);
CREATE INDEX idx_listings_deal_score ON listings (deal_score DESC NULLS LAST);
CREATE INDEX idx_listings_platform ON listings (platform_id);

CREATE INDEX idx_alerts_user ON alerts (user_id);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Public read for market data
CREATE POLICY "Public read platforms" ON platforms FOR SELECT USING (true);
CREATE POLICY "Public read items" ON items FOR SELECT USING (true);
CREATE POLICY "Public read item_prices" ON item_prices FOR SELECT USING (true);
CREATE POLICY "Public read price_history" ON price_history FOR SELECT USING (true);
CREATE POLICY "Public read listings" ON listings FOR SELECT USING (true);

-- user_profiles: own rows only
CREATE POLICY "Users read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- alerts: own rows only
CREATE POLICY "Users read own alerts" ON alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own alerts" ON alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own alerts" ON alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own alerts" ON alerts FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE USER PROFILE TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SEED PLATFORMS
-- ============================================================

INSERT INTO platforms (name, display_name, base_url, affiliate_url_template, fee_pct) VALUES
  ('steam', 'Steam Community Market', 'https://steamcommunity.com/market', 'https://steamcommunity.com/market/listings/730/{market_hash_name}', 15.00),
  ('skinport', 'Skinport', 'https://skinport.com', 'https://skinport.com/item/{slug}', 12.00),
  ('csfloat', 'CSFloat', 'https://csfloat.com', 'https://csfloat.com/item/{id}', 2.00)
ON CONFLICT (name) DO NOTHING;
