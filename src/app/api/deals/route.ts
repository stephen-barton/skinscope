import { NextRequest } from "next/server";
import { success, error } from "@/lib/api/response";
import { fetchSkinportItems } from "@/lib/api/skinport";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);
    const offset = Number(searchParams.get("offset") ?? 0);

    // Fetch CSFloat best deals
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

    // Calculate deal scores
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
          prices: {
            csfloat: csfloatPrice,
            skinport: skinportPrice,
          },
          deal_score: dealScore,
          float_value: item?.float_value ?? null,
          paint_seed: item?.paint_seed ?? null,
          stickers: item?.stickers ?? [],
        };
      })
      .sort((a, b) => b.deal_score - a.deal_score);

    // Free tier: cap at 10
    const maxItems = Math.min(limit, 10); // TODO: check subscription for full access
    const paged = deals.slice(offset, offset + maxItems);

    return success(paged, {
      total: deals.length,
      limit: maxItems,
      offset,
      free_tier_cap: 10,
    });
  } catch (e) {
    console.error("Deals error:", e);
    return error("Failed to fetch deals", 500, "DEALS_FAILED");
  }
}
