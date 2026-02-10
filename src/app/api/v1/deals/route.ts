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

    // Get Skinport prices — primary data source
    const spItems = await fetchSkinportItems();

    const deals = spItems
      .filter((item) => {
        if (!item.min_price || !item.suggested_price || item.suggested_price <= 0) return false;
        if (item.min_price >= item.suggested_price) return false;
        if (item.min_price < 0.5) return false;
        return true;
      })
      .map((item) => {
        const discount = Math.round(
          ((item.suggested_price - item.min_price!) / item.suggested_price) * 100
        );
        return {
          market_hash_name: item.market_hash_name,
          prices: {
            skinport: item.min_price,
            steam: item.suggested_price,
            csfloat: null, // CSFloat requires auth — coming soon
          },
          deal_score: Math.min(discount, 99),
          quantity: item.quantity,
          item_page: item.item_page,
          steam_url: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(item.market_hash_name)}`,
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
