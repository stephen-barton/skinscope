import { NextRequest } from "next/server";
import { success, error } from "@/lib/api/response";
import { getServiceClient } from "@/lib/api/supabase";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user) return error("Unauthorized", 401, "UNAUTHORIZED");

    const { id } = await params;
    const supabase = getServiceClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from("alerts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existing) return error("Alert not found", 404, "NOT_FOUND");

    const { data: alert, error: dbError } = await supabase
      .from("alerts")
      .update({ active: !existing.active })
      .eq("id", id)
      .select()
      .single();

    if (dbError) throw dbError;
    return success(alert);
  } catch (e) {
    console.error("Alert PATCH error:", e);
    return error("Failed to update alert", 500, "ALERT_UPDATE_FAILED");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user) return error("Unauthorized", 401, "UNAUTHORIZED");

    const { id } = await params;
    const supabase = getServiceClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from("alerts")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existing) return error("Alert not found", 404, "NOT_FOUND");

    const { error: dbError } = await supabase
      .from("alerts")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;
    return success({ deleted: true });
  } catch (e) {
    console.error("Alert DELETE error:", e);
    return error("Failed to delete alert", 500, "ALERT_DELETE_FAILED");
  }
}
