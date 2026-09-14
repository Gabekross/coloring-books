import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return NextResponse.json({ error: admin.message }, { status: admin.status });

  const supabase = getSupabaseAdmin();
  const [books, clicks, views, todayClicks, allBooks, events] = await Promise.all([
    supabase.from("books").select("id", { count: "exact", head: true }).eq("visible", true),
    supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "amazon_click"),
    supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "book_view"),
    supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "amazon_click").gte("created_at", new Date(Date.now() - 86400000).toISOString()),
    supabase.from("books").select("id,title,sort_order").order("sort_order"),
    supabase.from("analytics_events").select("book_id,event_type").in("event_type", ["book_view", "amazon_click"])
  ]);

  const counts = new Map<string, { views: number; clicks: number }>();
  for (const event of events.data ?? []) {
    if (!event.book_id) continue;
    const current = counts.get(event.book_id) ?? { views: 0, clicks: 0 };
    if (event.event_type === "book_view") current.views += 1;
    if (event.event_type === "amazon_click") current.clicks += 1;
    counts.set(event.book_id, current);
  }

  return NextResponse.json({
    totals: {
      books: books.count ?? 0,
      clicks: clicks.count ?? 0,
      views: views.count ?? 0,
      todayClicks: todayClicks.count ?? 0
    },
    byBook: (allBooks.data ?? []).map((book) => ({
      id: book.id,
      title: book.title,
      views: counts.get(book.id)?.views ?? 0,
      clicks: counts.get(book.id)?.clicks ?? 0
    }))
  });
}
