import { NextRequest, NextResponse } from "next/server";
import { fallbackBooks } from "@/lib/books";
import { getSupabaseAdmin, hasSupabaseEnv } from "@/lib/supabase";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let book = fallbackBooks.find((item) => item.id === id);

  if (hasSupabaseEnv()) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from("books").select("*").eq("id", id).eq("visible", true).single();
    book = data ?? book;

    if (book) {
      const userAgent = request.headers.get("user-agent") || "";
      await supabase.from("analytics_events").insert({
        event_type: "amazon_click",
        book_id: book.id,
        path: request.nextUrl.pathname,
        referrer: request.headers.get("referer") || "",
        user_agent: userAgent.slice(0, 500),
        device: /mobile|android|iphone|ipad/i.test(userAgent) ? "mobile" : "desktop"
      });
    }
  }

  if (!book) return new NextResponse("Book not found", { status: 404 });
  return NextResponse.redirect(book.amazon_url);
}
