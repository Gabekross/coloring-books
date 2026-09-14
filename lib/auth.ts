import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "./supabase";

export async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return { ok: false as const, status: 401, message: "Missing auth token." };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || "olugabriel80@gmail.com").toLowerCase();

  if (error || !email || email !== adminEmail) {
    return { ok: false as const, status: 403, message: "Admin access denied." };
  }

  return { ok: true as const, email };
}
