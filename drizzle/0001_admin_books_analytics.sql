CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  age_range TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  amazon_url TEXT NOT NULL,
  asin TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  book_id TEXT,
  path TEXT NOT NULL DEFAULT '',
  referrer TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  device TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_books_visible_sort
ON books (visible, sort_order);

CREATE INDEX IF NOT EXISTS idx_analytics_type_created
ON analytics_events (event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_book_created
ON analytics_events (book_id, created_at);
