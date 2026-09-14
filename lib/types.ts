export type Book = {
  id: string;
  title: string;
  age_range: string;
  description: string;
  amazon_url: string;
  asin: string;
  cover_url: string;
  tags: string[];
  sort_order: number;
  featured: boolean;
  visible: boolean;
  created_at?: string;
  updated_at?: string;
};

export type AnalyticsSummary = {
  totals: {
    books: number;
    clicks: number;
    views: number;
    todayClicks: number;
  };
  byBook: Array<{
    id: string;
    title: string;
    views: number;
    clicks: number;
  }>;
};
