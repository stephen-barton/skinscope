import { NextRequest } from "next/server";
import { success, error } from "@/lib/api/response";
import { validateApiKey } from "@/lib/api/api-key";
import { rateLimit } from "@/lib/api/rate-limit";
import { fetchSkinportItems } from "@/lib/api/skinport";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await validateApiKey(request.headers.get("authorization"));
    if (!auth.valid) return error("Invalid API key", 401, "INVALID_API_KEY");

    const rl = rateLimit(`deals:${auth.userId}`, 100, 60_000);
    if (!rl.allowed) {
      return error("Rate limit exceeded", 429, "RATE_LIMIT_EXCEEDED");
    }

    // Fetch CSFloat best deals — no limit for premium
    let csfloatListings: Record<string, unknown>[] = [];
    try {
      const cfRes = await fetch(
        "https://csfloat.com/api/v1/listings?sort_by=best_deal&limit=50",
        { next: { revalidate: 30 } }
      );
      if (cfRes.ok) {
        const cfData = await cfRes.json();
        csfloatListings = cfData.data ?? cfData ?? [];
      }
    } catch {
      // CSFloat unavailable
    }

    // Get Skinport prices for comparison
    let skinportMap: Record<string, number> = {};
    try {
      const spItems = await fetchSkinportItems();
      for (const item of spItems) {
        skinportMap[item.market_hash_name] =
          item.min_price ?? item.suggested_price;
      }
    } catch {
      // Skinport unavailable
    }

    const deals = csfloatListings
      .map((listing) => {
        const item = listing.item as Record<string, unknown> | undefined;
        const name = (item?.market_hash_name as string) ?? "Unknown";
        const csfloatPrice =
          typeof listing.price === "number" ? listing.price / 100 : null;
        const skinportPrice = skinportMap[name] ?? null;

        let dealScore = 0;
        if (csfloatPrice && skinportPrice && skinportPrice > 0) {
          dealScore = Math.round(
            ((skinportPrice - csfloatPrice) / skinportPrice) * 100
          );
        }

        return {
          id: listing.id,
          market_hash_name: name,
          prices: { csfloat: csfloatPrice, skinport: skinportPrice },
          deal_score: dealScore,
          float_value: item?.float_value ?? null,
          paint_seed: item?.paint_seed ?? null,
          stickers: item?.stickers ?? [],
          created_at: listing.created_at,
        };
      })
      .sort((a, b) => b.deal_score - a.deal_score);

    return success(deals, {
      total: deals.length,
      remaining_requests: rl.remaining,
    });
  } catch (e) {
    console.error("Premium deals API error:", e);
    return error("Failed to fetch deals", 500, "DEALS_FAILED");
  }
}
