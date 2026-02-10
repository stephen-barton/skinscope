import { NextRequest } from "next/server";
import { success, error } from "@/lib/api/response";
import { fetchSkinportItems } from "@/lib/api/skinport";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const marketName = decodeURIComponent(name);

    const sources: string[] = [];
    const prices: { platform: string; price: number | null; url: string }[] = [];

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
          url: match.item_page ?? `https://skinport.com`,
        });
        sources.push("skinport");
      }
    } catch {
      sources.push("skinport:error");
    }

    // 2. Steam Market price
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

    // CSFloat requires auth — disabled for now
    sources.push("csfloat:disabled");

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
      listings: [],
      sources,
    });
  } catch (e) {
    console.error("Item detail error:", e);
    return error("Failed to fetch item details", 500, "ITEM_DETAIL_FAILED");
  }
}
