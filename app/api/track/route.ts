import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, hasSupabaseEnv } from "@/lib/supabase";

const allowedEvents = new Set(["book_view", "sample_view", "amazon_click", "page_view"]);

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) return NextResponse.json({ ok: true });
  const payload = await request.json().catch(() => ({}));
  const eventType = allowedEvents.has(payload.eventType) ? payload.eventType : "page_view";
  const userAgent = request.headers.get("user-agent") || "";
  const supabase = getSupabaseAdmin();

  await supabase.from("analytics_events").insert({
    event_type: eventType,
    book_id: payload.bookId || null,
    path: request.nextUrl.pathname,
    referrer: request.headers.get("referer") || "",
    user_agent: userAgent.slice(0, 500),
    device: /mobile|android|iphone|ipad/i.test(userAgent) ? "mobile" : "desktop"
  });

  return NextResponse.json({ ok: true });
}
