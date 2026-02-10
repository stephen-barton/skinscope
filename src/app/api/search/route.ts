import { NextRequest } from "next/server";
import { success, error } from "@/lib/api/response";
import { fetchSkinportItems, SkinportItem } from "@/lib/api/skinport";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.toLowerCase() ?? "";
    const weapon = searchParams.get("weapon")?.toLowerCase();
    const minPrice = searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined;

    const skinportItems = await fetchSkinportItems();

    let filtered = skinportItems.filter((item: SkinportItem) => {
      if (q && !item.market_hash_name.toLowerCase().includes(q)) return false;
      if (weapon && weapon !== "all" && !item.market_hash_name.toLowerCase().includes(weapon))
        return false;
      const price = item.min_price ?? item.suggested_price;
      if (minPrice !== undefined && price < minPrice) return false;
      if (maxPrice !== undefined && price > maxPrice) return false;
      return true;
    });

    // Limit results
    filtered = filtered.slice(0, 100);

    const data = filtered.map((item: SkinportItem) => ({
      market_hash_name: item.market_hash_name,
      prices: {
        skinport: item.min_price ?? item.suggested_price,
        csfloat: null, // CSFloat requires auth — coming soon
      },
      quantity: item.quantity,
      skinport_url: item.item_page,
      steam_url: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(item.market_hash_name)}`,
    }));

    return success(data, { total: data.length, query: q });
  } catch (e) {
    console.error("Search error:", e);
    return error("Failed to search items", 500, "SEARCH_FAILED");
  }
}
