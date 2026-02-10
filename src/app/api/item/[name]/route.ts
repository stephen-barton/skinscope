import { NextRequest } from "next/server";
import { success, error } from "@/lib/api/response";
import { fetchSkinportItems } from "@/lib/api/skinport";

export const dynamic = "force-dynamic";

interface PlatformPrice {
  platform: string;
  price: number | null;
  url: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const marketName = decodeURIComponent(name);

    const sources: string[] = [];
    const prices: PlatformPrice[] = [];
    let listings: unknown[] = [];

    // 1. Skinport
    try {
      const items = await fetchSkinportItems(60_000);
      const match = items.find(
        (i) => i.market_hash_name.toLowerCase() === marketName.toLowerCase()
      );
      if (match) {
        prices.push({
          platform: "skinport",
          price: match.min_price ?? match.suggested_price,
          url: match.item_page,
        });
        sources.push("skinport");
      }
    } catch {
      sources.push("skinport:error");
    }

    // 2. Steam Market
    try {
      const steamRes = await fetch(
        `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encodeURIComponent(marketName)}`,
        { next: { revalidate: 60 } }
      );
      if (steamRes.ok) {
        const steam = await steamRes.json();
        if (steam.success) {
          const price = steam.lowest_price
            ? parseFloat(steam.lowest_price.replace(/[^0-9.]/g, ""))
            : steam.median_price
              ? parseFloat(steam.median_price.replace(/[^0-9.]/g, ""))
              : null;
          prices.push({
            platform: "steam",
            price,
            url: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(marketName)}`,
          });
          sources.push("steam");
        }
      }
    } catch {
      sources.push("steam:error");
    }

    // 3. CSFloat
    try {
      const cfRes = await fetch(
        `https://csfloat.com/api/v1/listings?market_hash_name=${encodeURIComponent(marketName)}&limit=20`,
        { next: { revalidate: 60 } }
      );
      if (cfRes.ok) {
        const cfData = await cfRes.json();
        const items = cfData.data ?? cfData ?? [];
        listings = items.map((l: Record<string, unknown>) => ({
          id: l.id,
          price: typeof l.price === "number" ? l.price / 100 : null,
          float_value: (l.item as Record<string, unknown>)?.float_value ?? null,
          paint_seed: (l.item as Record<string, unknown>)?.paint_seed ?? null,
          stickers: (l.item as Record<string, unknown>)?.stickers ?? [],
        }));
        const lowestCf = items.reduce(
          (min: number, l: Record<string, unknown>) => {
            const p = typeof l.price === "number" ? l.price / 100 : Infinity;
            return p < min ? p : min;
          },
          Infinity
        );
        if (lowestCf < Infinity) {
          prices.push({
            platform: "csfloat",
            price: lowestCf,
            url: `https://csfloat.com/search?market_hash_name=${encodeURIComponent(marketName)}`,
          });
          sources.push("csfloat");
        }
      }
    } catch {
      sources.push("csfloat:error");
    }

    if (prices.length === 0) {
      return error("Item not found on any platform", 404, "ITEM_NOT_FOUND");
    }

    const best = prices.reduce((a, b) =>
      (a.price ?? Infinity) < (b.price ?? Infinity) ? a : b
    );

    return success({
      market_hash_name: marketName,
      prices,
      best_price: best,
      listings,
      sources,
    });
  } catch (e) {
    console.error("Item detail error:", e);
    return error("Failed to fetch item details", 500, "ITEM_DETAIL_FAILED");
  }
}
