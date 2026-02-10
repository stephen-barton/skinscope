import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { user, error: null };
}

export async function requirePro() {
  const { user, error } = await requireAuth();
  if (error) return { user: null, profile: null, error };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (!profile || profile.tier !== "pro") {
    return {
      user,
      profile,
      error: NextResponse.json({ error: "Pro subscription required" }, { status: 403 }),
    };
  }

  return { user, profile, error: null };
}

export async function validateApiKey(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return { profile: null, error: NextResponse.json({ error: "API key required" }, { status: 401 }) };
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("*")
    .eq("api_key", apiKey)
    .single();

  if (!profile) {
    return { profile: null, error: NextResponse.json({ error: "Invalid API key" }, { status: 401 }) };
  }

  if (profile.tier !== "pro") {
    return { profile, error: NextResponse.json({ error: "Pro subscription required for API access" }, { status: 403 }) };
  }

  return { profile, error: null };
}
