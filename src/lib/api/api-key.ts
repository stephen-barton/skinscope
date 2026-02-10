import { createClient } from "@supabase/supabase-js";

export async function validateApiKey(
  authHeader: string | null
): Promise<{ valid: boolean; userId?: string }> {
  if (!authHeader?.startsWith("Bearer ")) {
    return { valid: false };
  }

  const apiKey = authHeader.slice(7);
  if (!apiKey) return { valid: false };

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, subscription_tier")
    .eq("api_key", apiKey)
    .single();

  if (error || !data) return { valid: false };

  return { valid: true, userId: data.id };
}
