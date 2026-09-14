import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Kids Coloring Books for Ages 3-8 | Princess, Baby Animals & Prince Books",
  description:
    "Shop fun and easy kids coloring books for ages 3-8, including princess adventures, prince adventures, castles, unicorns, dragons, fairies, cute baby animals, and real sample coloring pages.",
  keywords: [
    "kids coloring books",
    "children's coloring books",
    "coloring books for kids ages 3-8",
    "princess coloring book",
    "baby animals coloring book",
    "prince coloring book"
  ],
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  openGraph: {
    title: "Kids Coloring Books for Ages 3-8",
    description: "Princesses, princes, castles, unicorns, dragons, fairies, and adorable baby animals for screen-free creative fun.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
