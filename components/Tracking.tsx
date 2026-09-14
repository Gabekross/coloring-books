"use client";

import { useEffect } from "react";

export function Tracking() {
  useEffect(() => {
    const seen = new Set<string>();
    const postEvent = (eventType: string, bookId = "") => {
      const payload = JSON.stringify({ eventType, bookId });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
        return;
      }
      void fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
        keepalive: true
      });
    };

    postEvent("page_view");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          const id = target.dataset.bookId || "sample-pages";
          const type = target.classList.contains("sample-section") ? "sample_view" : "book_view";
          const key = `${type}:${id}`;
          if (seen.has(key)) return;
          seen.add(key);
          postEvent(type, id);
        });
      },
      { threshold: 0.45 }
    );

    document.querySelectorAll<HTMLElement>("[data-book-id], .sample-section").forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return null;
}
