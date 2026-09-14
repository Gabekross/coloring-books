import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { coverUrlForAsin, extractAsin, getAllBooks, slugify } from "@/lib/books";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return NextResponse.json({ error: admin.message }, { status: admin.status });
  return NextResponse.json(await getAllBooks());
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return NextResponse.json({ error: admin.message }, { status: admin.status });

  const payload = await request.json();
  const asin = extractAsin(String(payload.amazonUrl || ""));
  if (!asin) return NextResponse.json({ error: "Please paste a valid Amazon product link with an ASIN." }, { status: 400 });

  const title = cleanText(payload.title, 160);
  const description = cleanText(payload.description, 500);
  if (!title || !description) return NextResponse.json({ error: "Title and description are required." }, { status: 400 });

  const book = {
    id: slugify(`${title}-${asin}`),
    title,
    age_range: cleanText(payload.ageRange || "", 50),
    description,
    amazon_url: `https://www.amazon.com/dp/${asin}`,
    asin,
    cover_url: coverUrlForAsin(asin),
    tags: String(payload.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean),
    sort_order: Number.parseInt(String(payload.sortOrder ?? "50"), 10) || 50,
    featured: Boolean(payload.featured),
    visible: payload.visible !== false
  };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("books").upsert(book, { onConflict: "id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, book });
}

function cleanText(value: unknown, max: number) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}
