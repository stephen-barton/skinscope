import { NextRequest } from "next/server";
import { success, error } from "@/lib/api/response";
import { getServiceClient } from "@/lib/api/supabase";
import { createClient } from "@supabase/supabase-js";
import * as z from "zod/v4";

export const dynamic = "force-dynamic";

const CreateAlertSchema = z.object({
  market_hash_name: z.string().min(1),
  target_price: z.number().positive(),
  condition: z.enum(["below", "above"]),
  platform: z.enum(["any", "skinport", "csfloat", "steam"]).optional(),
});

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return error("Unauthorized", 401, "UNAUTHORIZED");

    const supabase = getServiceClient();
    const { data: alerts, error: dbError } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;
    return success(alerts ?? []);
  } catch (e) {
    console.error("Alerts GET error:", e);
    return error("Failed to fetch alerts", 500, "ALERTS_FETCH_FAILED");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return error("Unauthorized", 401, "UNAUTHORIZED");

    const body = await request.json();
    const parsed = CreateAlertSchema.safeParse(body);
    if (!parsed.success) {
      return error("Invalid input: " + z.prettifyError(parsed.error), 400, "VALIDATION_ERROR");
    }

    const supabase = getServiceClient();

    // Check alert limit for free users
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    const isFree = !profile?.subscription_tier || profile.subscription_tier === "free";

    if (isFree) {
      const { count } = await supabase
        .from("alerts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if ((count ?? 0) >= 3) {
        return error(
          "Free tier limited to 3 alerts. Upgrade for unlimited.",
          403,
          "ALERT_LIMIT_REACHED"
        );
      }
    }

    const { data: alert, error: dbError } = await supabase
      .from("alerts")
      .insert({
        user_id: user.id,
        market_hash_name: parsed.data.market_hash_name,
        target_price: parsed.data.target_price,
        condition: parsed.data.condition,
        platform: parsed.data.platform ?? "any",
        active: true,
      })
      .select()
      .single();

    if (dbError) throw dbError;
    return success(alert);
  } catch (e) {
    console.error("Alerts POST error:", e);
    return error("Failed to create alert", 500, "ALERT_CREATE_FAILED");
  }
}
