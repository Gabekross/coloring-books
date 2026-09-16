import Script from "next/script";
import { getVisibleBooks } from "@/lib/books";
import { Book } from "@/lib/types";
import { Tracking } from "@/components/Tracking";

export const dynamic = "force-dynamic";

const samplePages = [
  ["princess-dancing.png", "Princess dancing", "Sample coloring page titled Princess dancing"],
  ["princess-bunny.png", "Princess and bunny", "Sample coloring page titled Princess and bunny"],
  ["princess-butterflies.png", "Princess and butterflies", "Sample coloring page titled Princess and butterflies"],
  ["princess-balloons.png", "Princess with star balloons", "Sample coloring page titled Princess with star balloons"]
];

export default async function HomePage() {
  const books = await getVisibleBooks();
  const heroBooks = books.slice(0, 4);
  const princessBook = books.find((book) => book.asin === "B0H32C3M4K") ?? books[0];

  return (
    <>
      <Script
        id="book-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd(books)) }}
      />
      <header className="site-shell">
        <nav className="nav" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="Kids Coloring Books home">
            <span className="brand-mark" aria-hidden="true">★</span>
            <span>Kids Coloring Books</span>
          </a>
          <div className="nav-links">
            <a href="#books">Books</a>
            <a href="#preview">See Inside</a>
            <a href="#why">Why Parents Like Them</a>
            <a href="#questions">Questions</a>
          </div>
        </nav>
      </header>

      <main id="top">
        <div className="site-shell hero">
          <div>
            <p className="eyebrow">Fun and easy coloring pages for ages 3-8</p>
            <h1>Fun coloring books for kids ages 3-8.</h1>
            <p className="hero-copy">
              Discover princess adventures, brave prince quests, castles, unicorns, dragons, fairies, and adorable baby animals. Each book is designed for simple, screen-free creative time at home, in preschool, during travel, or as a cheerful gift.
            </p>
            <div className="hero-actions">
              <a className="button" href="#books">Shop the books</a>
              {princessBook ? (
                <a className="button secondary" href={`/api/go/${princessBook.id}`} data-track-click={princessBook.id}>Featured on Amazon</a>
              ) : null}
            </div>
          </div>
          <div className="cover-stage" aria-label="Children's coloring book covers">
            <div className="cover-fan">
              {heroBooks.map((book) => (
                <img key={book.id} src={book.cover_url} alt={`${book.title} cover`} />
              ))}
            </div>
          </div>
        </div>

        <div className="site-shell quick-strip" aria-label="Book themes">
          <div className="quick-pill"><strong>Princess magic</strong><span>Castles, unicorns, fairies, and gentle adventure scenes.</span></div>
          <div className="quick-pill"><strong>Cute animals</strong><span>Puppies, kittens, bunnies, pandas, lions, ducks, and more.</span></div>
          <div className="quick-pill"><strong>Brave quests</strong><span>Princes, knights, dragons, castles, and imaginative journeys.</span></div>
        </div>

        <section id="preview" className="sample-section">
          <div className="site-shell">
            <div className="sample-intro">
              <div className="section-heading">
                <h2>See inside the Princess Adventure book</h2>
                <p>Real sample pages help parents know what they are buying: bold outlines, cute princess themes, and simple activities that invite kids to color, count, and search.</p>
              </div>
            </div>
            <div className="sample-grid" aria-label="Sample coloring pages from Princess Adventure Coloring Book">
              {samplePages.map(([file, title, alt]) => (
                <figure className="sample-page" key={file}>
                  <img src={`/assets/sample-pages/${file}`} alt={alt} />
                  <figcaption>{title}</figcaption>
                </figure>
              ))}
            </div>
            <div className="sample-cta">
              <p>Like these pages? Open the Princess Adventure Coloring Book on Amazon and order the paperback.</p>
              {princessBook ? <a className="button" href={`/api/go/${princessBook.id}`} data-track-click={princessBook.id}>Buy on Amazon</a> : null}
            </div>
          </div>
        </section>

        <section id="books">
          <div className="site-shell">
            <div className="section-heading">
              <h2>Shop coloring books on Amazon</h2>
              <p>Choose a title below to open the exact Amazon product page and buy the paperback edition.</p>
            </div>
            <div className="book-grid">
              {books.map((book) => <BookCard key={book.id} book={book} />)}
            </div>
          </div>
        </section>

        <section id="why">
          <div className="site-shell trust-band">
            <div className="section-heading">
              <h2>Easy pages for calmer creative time</h2>
              <p>These children's coloring books are made for young artists who want pages that feel fun, approachable, and rewarding to finish.</p>
            </div>
            <ul className="benefits">
              <li>Great for toddlers, preschoolers, kindergarteners, and kids ages 3-8.</li>
              <li>Helpful for quiet time, travel bags, birthday gifts, classroom activities, and rainy days.</li>
              <li>Simple, cheerful themes encourage creativity without screens.</li>
              <li>Amazon purchase links make it easy for parents and gift buyers to order quickly.</li>
            </ul>
          </div>
        </section>

        <section id="questions">
          <div className="site-shell">
            <div className="section-heading">
              <h2>Helpful details</h2>
              <p>Quick answers for parents, grandparents, teachers, and gift buyers.</p>
            </div>
            <div className="faq">
              <article><h3>What ages are these for?</h3><p>Most titles are designed for kids ages 3-8, with some editions focused on younger preschoolers.</p></article>
              <article><h3>Where do I buy them?</h3><p>Use the Amazon buttons on each book card. The buttons open Amazon after recording a click in your analytics.</p></article>
              <article><h3>Are these good gifts?</h3><p>Yes. Coloring books are simple gifts for birthdays, holidays, classrooms, travel, and screen-free play.</p></article>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-shell">
        <p>As an Amazon Associate or affiliate, qualifying purchases may earn a commission when affiliate links are added. Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.</p>
      </footer>
      <Tracking />
    </>
  );
}

function BookCard({ book }: { book: Book }) {
  return (
    <article className="book-card" data-book-id={book.id}>
      <div className="book-media"><img src={book.cover_url} alt={`${book.title} cover`} /></div>
      <div className="book-body">
        <h3>{book.title}</h3>
        <p>{book.description}</p>
        <div className="tags">
          {book.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
        </div>
        <a className="button" href={`/api/go/${book.id}`} data-track-click={book.id}>Buy on Amazon</a>
      </div>
    </article>
  );
}

function bookJsonLd(books: Book[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Kids coloring books for ages 3 to 8",
    itemListElement: books.map((book, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Book",
        name: book.title,
        bookFormat: "https://schema.org/Paperback",
        audience: `Children ${book.age_range}`,
        about: book.description,
        url: book.amazon_url,
        image: book.cover_url
      }
    }))
  };
}
