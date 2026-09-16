import { Book } from "./types";
import { getSupabaseAdmin, getSupabasePublic, hasSupabaseEnv } from "./supabase";

export const fallbackBooks: Book[] = [
  {
    id: "princess-adventure-3-8",
    title: "Princess Adventure Coloring Book: Ages 3-8",
    age_range: "Ages 3-8",
    description:
      "Fun and easy coloring pages with cute princesses, castles, unicorns, fairies, and magical adventures.",
    amazon_url: "https://www.amazon.com/dp/B0H32C3M4K",
    asin: "B0H32C3M4K",
    cover_url: "/assets/cover-B0H32C3M4K.jpg",
    tags: ["Princesses", "Unicorns", "Ages 3-8"],
    sort_order: 10,
    featured: true,
    visible: true
  },
  {
    id: "baby-animals-3-8",
    title: "Baby Animals Coloring Book: Ages 3-8",
    age_range: "Ages 3-8",
    description:
      "Easy coloring pages for young kids who love sweet puppies, kittens, bunnies, pandas, lions, elephants, and ducks.",
    amazon_url: "https://www.amazon.com/dp/B0H7MTZ9S8",
    asin: "B0H7MTZ9S8",
    cover_url: "/assets/cover-B0H7MTZ9S8.jpg",
    tags: ["Baby animals", "Easy pages", "Ages 3-8"],
    sort_order: 20,
    featured: true,
    visible: true
  },
  {
    id: "princess-adventure-3-6",
    title: "Princess Adventure Coloring Book: Ages 3-6",
    age_range: "Ages 3-6",
    description:
      "A beginner-friendly princess coloring book for preschoolers, toddlers, and early learners who enjoy magical scenes.",
    amazon_url: "https://www.amazon.com/dp/B0H29NPB7N",
    asin: "B0H29NPB7N",
    cover_url: "/assets/cover-B0H29NPB7N.jpg",
    tags: ["Preschool", "Simple designs", "Ages 3-6"],
    sort_order: 30,
    featured: false,
    visible: true
  },
  {
    id: "prince-adventure-3-8",
    title: "Prince Adventure Coloring Book: Ages 3-8",
    age_range: "Ages 3-8",
    description:
      "Brave princes, castles, dragons, knights, and magical adventures for kids who like quest-themed coloring pages.",
    amazon_url: "https://www.amazon.com/dp/B0H323CLFD",
    asin: "B0H323CLFD",
    cover_url: "/assets/cover-B0H323CLFD.jpg",
    tags: ["Princes", "Dragons", "Ages 3-8"],
    sort_order: 40,
    featured: false,
    visible: true
  }
];

export async function getVisibleBooks() {
  if (!hasSupabaseEnv()) return fallbackBooks;

  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return fallbackBooks;
  return (data ?? []) as Book[];
}

export async function getAllBooks() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Book[];
}

export function extractAsin(value: string) {
  const match = value.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})|\/([A-Z0-9]{10})(?:[/?]|$)|^([A-Z0-9]{10})$/i);
  return (match?.[1] || match?.[2] || match?.[3] || "").toUpperCase();
}

export function coverUrlForAsin(asin: string) {
  return `https://m.media-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX500_.jpg`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
