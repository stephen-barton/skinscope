import { NextRequest } from "next/server";
import { success, error } from "@/lib/api/response";
import { fetchSkinportItems, SkinportItem } from "@/lib/api/skinport";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.toLowerCase() ?? "";
    const weapon = searchParams.get("weapon")?.toLowerCase();
    const type = searchParams.get("type")?.toLowerCase();
    const rarity = searchParams.get("rarity")?.toLowerCase();
    const minPrice = searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined;

    const skinportItems = await fetchSkinportItems();

    let filtered = skinportItems.filter((item: SkinportItem) => {
      if (q && !item.market_hash_name.toLowerCase().includes(q)) return false;
      if (weapon && !item.market_hash_name.toLowerCase().includes(weapon))
        return false;
      if (type && !item.market_hash_name.toLowerCase().includes(type))
        return false;
      if (rarity) return true; // Skinport doesn't expose rarity in bulk
      const price = item.min_price ?? item.suggested_price;
      if (minPrice !== undefined && price < minPrice) return false;
      if (maxPrice !== undefined && price > maxPrice) return false;
      return true;
    });

    // Try CSFloat for additional price data
    let csfloatPrices: Record<string, number> = {};
    if (q) {
      try {
        const cfRes = await fetch(
          `https://csfloat.com/api/v1/listings?market_hash_name=${encodeURIComponent(q)}&limit=5`,
          { next: { revalidate: 30 } }
        );
        if (cfRes.ok) {
          const cfData = await cfRes.json();
          for (const listing of cfData.data ?? cfData ?? []) {
            const name = listing.item?.market_hash_name;
            const price = listing.price ? listing.price / 100 : null;
            if (name && price) {
              csfloatPrices[name] = Math.min(
                csfloatPrices[name] ?? Infinity,
                price
              );
            }
          }
        }
      } catch {
        // CSFloat unavailable, continue with Skinport data
      }
    }

    // Limit results
    filtered = filtered.slice(0, 100);

    const data = filtered.map((item: SkinportItem) => ({
      market_hash_name: item.market_hash_name,
      prices: {
        skinport: item.min_price ?? item.suggested_price,
        csfloat: csfloatPrices[item.market_hash_name] ?? null,
      },
      quantity: item.quantity,
      image: `https://community.fastly.steamstatic.com/economy/image/class/730/${encodeURIComponent(item.market_hash_name)}/256x256`,
      skinport_url: item.item_page,
    }));

    return success(data, { total: data.length, query: q });
  } catch (e) {
    console.error("Search error:", e);
    return error("Failed to search items", 500, "SEARCH_FAILED");
  }
}
