import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return NextResponse.json({ error: admin.message }, { status: admin.status });

  const supabase = getSupabaseAdmin();
  const timeZone = process.env.ANALYTICS_TIME_ZONE || "America/New_York";
  const historyDays = 30;
  const historyStart = new Date(Date.now() - (historyDays + 1) * 86400000).toISOString();
  const [books, clicks, views, allBooks, events, dailyEvents] = await Promise.all([
    supabase.from("books").select("id", { count: "exact", head: true }).eq("visible", true),
    supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "amazon_click"),
    supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "book_view"),
    supabase.from("books").select("id,title,sort_order").order("sort_order"),
    supabase.from("analytics_events").select("book_id,event_type").in("event_type", ["book_view", "amazon_click"]),
    supabase
      .from("analytics_events")
      .select("event_type,created_at")
      .in("event_type", ["book_view", "amazon_click"])
      .gte("created_at", historyStart)
      .order("created_at", { ascending: false })
  ]);

  const queryError = [books, clicks, views, allBooks, events, dailyEvents].find((result) => result.error)?.error;
  if (queryError) return NextResponse.json({ error: queryError.message }, { status: 500 });

  const counts = new Map<string, { views: number; clicks: number }>();
  for (const event of events.data ?? []) {
    if (!event.book_id) continue;
    const current = counts.get(event.book_id) ?? { views: 0, clicks: 0 };
    if (event.event_type === "book_view") current.views += 1;
    if (event.event_type === "amazon_click") current.clicks += 1;
    counts.set(event.book_id, current);
  }

  const dailyCounts = new Map<string, { views: number; clicks: number }>();
  for (const event of dailyEvents.data ?? []) {
    const key = dateKey(event.created_at, timeZone);
    const current = dailyCounts.get(key) ?? { views: 0, clicks: 0 };
    if (event.event_type === "book_view") current.views += 1;
    if (event.event_type === "amazon_click") current.clicks += 1;
    dailyCounts.set(key, current);
  }

  const today = dateKey(new Date(), timeZone);
  const [year, month, day] = today.split("-").map(Number);
  const daily = Array.from({ length: historyDays }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, day - index, 12));
    const key = date.toISOString().slice(0, 10);
    return { date: key, ...(dailyCounts.get(key) ?? { views: 0, clicks: 0 }) };
  });

  return NextResponse.json({
    totals: {
      books: books.count ?? 0,
      clicks: clicks.count ?? 0,
      views: views.count ?? 0,
      todayClicks: daily[0].clicks,
      todayViews: daily[0].views
    },
    timeZone,
    daily,
    byBook: (allBooks.data ?? []).map((book) => ({
      id: book.id,
      title: book.title,
      views: counts.get(book.id)?.views ?? 0,
      clicks: counts.get(book.id)?.clicks ?? 0
    }))
  });
}

function dateKey(value: string | Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(value));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
