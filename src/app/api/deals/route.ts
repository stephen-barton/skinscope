import { NextRequest } from "next/server";
import { success, error } from "@/lib/api/response";
import { fetchSkinportItems } from "@/lib/api/skinport";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);
    const offset = Number(searchParams.get("offset") ?? 0);
    const weaponFilter = searchParams.get("weapon")?.toLowerCase();
    const minScore = Number(searchParams.get("minScore") ?? 0);

    // Get Skinport prices — our primary data source
    const spItems = await fetchSkinportItems();

    // Build deals from Skinport data: items where min_price < suggested_price (discount)
    const deals = spItems
      .filter((item) => {
        if (!item.min_price || !item.suggested_price || item.suggested_price <= 0) return false;
        if (item.min_price >= item.suggested_price) return false;
        // Only include items with actual prices
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
            steam: item.suggested_price, // suggested_price approximates Steam price
            csfloat: null,
          },
          deal_score: Math.min(discount, 99),
          float_value: null,
          quantity: item.quantity,
          item_page: item.item_page,
          steam_url: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(item.market_hash_name)}`,
        };
      })
      .filter((d) => d.deal_score >= minScore)
      .filter((d) => {
        if (!weaponFilter || weaponFilter === "all") return true;
        const name = d.market_hash_name.toLowerCase();
        // Map filter categories to weapon names
        const weaponMap: Record<string, string[]> = {
          rifle: ["ak-47", "m4a4", "m4a1-s", "famas", "galil", "aug", "sg 553"],
          pistol: ["glock", "usp-s", "p250", "five-seven", "tec-9", "desert eagle", "dual berettas", "cz75", "r8 revolver"],
          smg: ["mp9", "mac-10", "mp7", "mp5", "ump-45", "p90", "pp-bizon"],
          sniper: ["awp", "ssg 08", "scar-20", "g3sg1"],
          shotgun: ["nova", "xm1014", "mag-7", "sawed-off"],
          knife: ["knife", "karambit", "bayonet", "butterfly", "navaja", "stiletto", "talon", "ursus", "bowie", "falchion", "gut", "flip", "huntsman", "shadow daggers", "paracord", "survival", "nomad", "skeleton", "classic"],
        };
        const weapons = weaponMap[weaponFilter];
        if (!weapons) return true;
        return weapons.some((w) => name.includes(w));
      })
      .sort((a, b) => b.deal_score - a.deal_score);

    const paged = deals.slice(offset, offset + limit);

    return success(paged, {
      total: deals.length,
      limit,
      offset,
    });
  } catch (e) {
    console.error("Deals error:", e);
    return error("Failed to fetch deals", 500, "DEALS_FAILED");
  }
}
