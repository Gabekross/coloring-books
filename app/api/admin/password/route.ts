import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, getAdminCookieOptions, hasAdminPassword, requireAdmin, verifyAdminPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false }, { status: admin.status });
  return NextResponse.json({ ok: true, email: admin.email });
}

export async function POST(request: NextRequest) {
  if (!hasAdminPassword()) {
    return NextResponse.json({ error: "Password login is not configured yet." }, { status: 503 });
  }

  const payload = await request.json();
  const email = String(payload.email || "");
  const password = String(payload.password || "");

  if (!verifyAdminPassword(email, password)) {
    return NextResponse.json({ error: "Invalid admin email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("kids_coloring_admin", createAdminSession(), getAdminCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("kids_coloring_admin", "", {
    ...getAdminCookieOptions(),
    maxAge: 0
  });
  return response;
}
