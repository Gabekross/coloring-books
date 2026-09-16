import type { Metadata } from "next";
import { getVisibleBooks } from "@/lib/books";

export const metadata: Metadata = {
  title: "Ad Creative Kit | Kids Coloring Books",
  description: "Ad hooks, copy ideas, and visual directions for Kids Coloring Books promotions.",
  robots: {
    index: false,
    follow: false
  }
};

const adHooks = [
  "Unlock your child's creativity with simple, joyful coloring pages.",
  "Screen-free fun for little hands and big imaginations.",
  "Turn quiet time into colorful adventure time.",
  "Cute princesses, brave princes, and baby animals kids will love to color.",
  "A sweet gift for birthdays, travel bags, classrooms, and rainy days."
];

const adCopy = [
  {
    label: "Parent-focused",
    text: "Looking for an easy screen-free activity? Kids Coloring Books gives young artists bold, friendly pages filled with princesses, castles, animals, and magical adventures. Pick a book and start coloring today."
  },
  {
    label: "Gift-focused",
    text: "Need a simple gift kids can enjoy right away? These coloring books are made for ages 3-8 with cute themes, easy outlines, and pages that feel fun to finish."
  },
  {
    label: "Theme-focused",
    text: "From princess castles and brave prince quests to adorable baby animals, these books make creative time feel playful, calm, and easy for young kids."
  }
];

const headlines = [
  "Start Coloring Today",
  "Fun Coloring Books for Kids Ages 3-8",
  "Screen-Free Creative Time for Kids",
  "Princess, Prince, and Baby Animal Coloring Books",
  "Simple Coloring Pages for Little Artists"
];

const visuals = [
  "Show a book cover beside two interior sample pages so parents can see exactly what they are buying.",
  "Use a bright tabletop scene with crayons around the book cover for a gift-ready feel.",
  "Lead with the Baby Animals cover for younger kids, then retarget with Princess and Prince adventure themes.",
  "Create a short carousel: cover, sample page, parent benefit, Amazon CTA.",
  "Keep text overlays short: Ages 3-8, Screen-Free Fun, Start Coloring Today."
];

export default async function AdCreativePage() {
  const books = await getVisibleBooks();

  return (
    <main className="ad-page">
      <section className="site-shell ad-hero">
        <div>
          <p className="eyebrow">Ad creative kit</p>
          <h1>Promote the books with clear, parent-friendly messages.</h1>
          <p className="hero-copy">
            Use these hooks, headlines, and visual ideas for Facebook, Instagram, TikTok, Pinterest, or Amazon traffic campaigns.
          </p>
          <div className="hero-actions">
            <a className="button" href="/">View live shop page</a>
            <a className="button secondary" href="/#books">Shop section</a>
          </div>
        </div>
        <div className="ad-cover-stack" aria-label="Kids coloring book covers">
          {books.slice(0, 4).map((book) => (
            <img key={book.id} src={book.cover_url} alt={`${book.title} cover`} />
          ))}
        </div>
      </section>

      <section className="site-shell ad-section">
        <div className="section-heading">
          <h2>Strong hooks</h2>
          <p>Short lines for the first sentence of an ad, video overlay, or carousel opening slide.</p>
        </div>
        <div className="ad-grid compact">
          {adHooks.map((hook) => (
            <article className="ad-card" key={hook}>
              <p>{hook}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-shell ad-section">
        <div className="section-heading">
          <h2>Primary ad copy</h2>
          <p>Use these as starting points, then match the copy to the book cover or sample pages in the image.</p>
        </div>
        <div className="ad-grid">
          {adCopy.map((item) => (
            <article className="ad-card" key={item.label}>
              <strong>{item.label}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-shell ad-section">
        <div className="section-heading">
          <h2>Headlines and visuals</h2>
          <p>Pair one headline with one visual direction for a simple ad test.</p>
        </div>
        <div className="ad-split">
          <div className="ad-card">
            <h3>Headline options</h3>
            <ul>
              {headlines.map((headline) => <li key={headline}>{headline}</li>)}
            </ul>
          </div>
          <div className="ad-card">
            <h3>Visual directions</h3>
            <ul>
              {visuals.map((visual) => <li key={visual}>{visual}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="site-shell ad-section">
        <div className="ad-cta">
          <div>
            <h2>Recommended first test</h2>
            <p>
              Start with the Baby Animals cover plus two sample pages, using the headline "Screen-Free Creative Time for Kids" and the CTA "Start Coloring Today."
            </p>
          </div>
          <a className="button" href="/#preview">Use sample pages</a>
        </div>
      </section>
    </main>
  );
}
