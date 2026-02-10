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

    const rl = rateLimit(`prices:${auth.userId}`, 100, 60_000);
    if (!rl.allowed) {
      return error("Rate limit exceeded", 429, "RATE_LIMIT_EXCEEDED");
    }

    const items = await fetchSkinportItems();

    const prices = items.map((item) => ({
      market_hash_name: item.market_hash_name,
      min_price: item.min_price,
      suggested_price: item.suggested_price,
      mean_price: item.mean_price,
      median_price: item.median_price,
      quantity: item.quantity,
      updated_at: item.updated_at,
    }));

    return success(prices, {
      total: prices.length,
      remaining_requests: rl.remaining,
    });
  } catch (e) {
    console.error("Prices API error:", e);
    return error("Failed to fetch prices", 500, "PRICES_FAILED");
  }
}
