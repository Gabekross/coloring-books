"use client";

import { createClient, Session } from "@supabase/supabase-js";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnalyticsSummary, Book } from "@/lib/types";

type Props = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function AdminClient({ supabaseUrl, supabaseAnonKey }: Props) {
  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey);
  }, [supabaseUrl, supabaseAnonKey]);
  const [session, setSession] = useState<Session | null>(null);
  const [passwordAuthed, setPasswordAuthed] = useState(false);
  const [email, setEmail] = useState("olugabriel80@gmail.com");
  const [password, setPassword] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    fetch("/api/admin/password", { credentials: "include" })
      .then((response) => setPasswordAuthed(response.ok))
      .catch(() => setPasswordAuthed(false));
  }, []);

  useEffect(() => {
    if (!session && !passwordAuthed) return;
    void loadAdmin();
  }, [session, passwordAuthed]);

  async function signIn() {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`
      }
    });
    setMessage(error ? error.message : "Check your email for the sign-in link.");
  }

  async function signInWithPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/password", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not sign in.");
      return;
    }
    setPassword("");
    setPasswordAuthed(true);
    setMessage("");
  }

  async function signOut() {
    await fetch("/api/admin/password", { method: "DELETE", credentials: "include" });
    if (supabase) await supabase.auth.signOut();
    setPasswordAuthed(false);
    setSession(null);
    setBooks([]);
    setAnalytics(null);
    setMessage("Signed out.");
  }

  async function loadAdmin() {
    try {
      const [booksResponse, analyticsResponse] = await Promise.all([
        authedFetch("/api/admin/books"),
        authedFetch("/api/analytics")
      ]);

      if (booksResponse.status === 401 || analyticsResponse.status === 401) {
        setPasswordAuthed(false);
        setSession(null);
        setMessage("Your session expired. Please sign in again.");
        return;
      }

      if (!booksResponse.ok || !analyticsResponse.ok) {
        setMessage("Admin data could not be loaded. Please refresh and try again.");
        return;
      }

      setBooks(await booksResponse.json());
      setAnalytics(await analyticsResponse.json());
      setMessage("");
    } catch {
      setMessage("Admin data could not be loaded. Please check your connection and try again.");
    }
  }

  async function authedFetch(url: string, init: RequestInit = {}) {
    if (!session && !passwordAuthed) throw new Error("Not signed in");
    return fetch(url, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.headers || {}),
        ...(session ? { authorization: `Bearer ${session.access_token}` } : {})
      }
    });
  }

  async function saveBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const response = await authedFetch("/api/admin/books", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...payload,
        featured: formData.has("featured"),
        visible: formData.has("visible")
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not save book.");
      return;
    }
    form.reset();
    (form.elements.namedItem("sortOrder") as HTMLInputElement).value = "50";
    (form.elements.namedItem("visible") as HTMLInputElement).checked = true;
    setMessage("Book saved.");
    await loadAdmin();
  }

  if (!supabase) {
    return <section className="admin-card"><h2>Supabase is not configured</h2><p>Add the Supabase environment variables in Vercel to enable the admin page.</p></section>;
  }

  if (!session && !passwordAuthed) {
    return (
      <section className="admin-card sign-in-card">
        <h2>Sign in</h2>
        <p>Use the admin email and password to manage books and analytics. Magic link still works as a backup.</p>
        <form className="admin-login-form" onSubmit={signInWithPassword}>
          <label>Email <input value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <button className="button" type="submit">Sign in with password</button>
        </form>
        <div className="login-divider"><span>or</span></div>
        <button className="button secondary" type="button" onClick={signIn}>Send sign-in link</button>
        {message ? <p>{message}</p> : null}
      </section>
    );
  }

  return (
    <>
      <section className="admin-grid">
        <article className="admin-card analytics-card">
          <div className="admin-card-header">
            <h2>Analytics</h2>
            <button className="button secondary small-button" type="button" onClick={signOut}>Sign out</button>
          </div>
          {analytics ? (
            <>
              <div className="metric-grid">
                <Metric label="Visible books" value={analytics.totals.books} />
                <Metric label="Amazon clicks" value={analytics.totals.clicks} />
                <Metric label="Book views" value={analytics.totals.views} />
                <Metric label="Clicks today" value={analytics.totals.todayClicks} />
              </div>
              <h3>Clicks by book</h3>
              {analytics.byBook.map((row) => (
                <div className="book-stat" key={row.id}><span>{row.title}</span><strong>{row.clicks} clicks / {row.views} views</strong></div>
              ))}
            </>
          ) : <p>{message || "Loading analytics..."}</p>}
        </article>

        <article className="admin-card">
          <h2>Add a book</h2>
          <form onSubmit={saveBook}>
            <label>Amazon link <input name="amazonUrl" required placeholder="https://www.amazon.com/dp/ASIN" /></label>
            <label>Title <input name="title" required placeholder="Book title" /></label>
            <label>Age range <input name="ageRange" placeholder="Ages 3-8" /></label>
            <label>Description <textarea name="description" rows={4} required placeholder="Short sales description" /></label>
            <label>Tags <input name="tags" placeholder="Princesses, Unicorns, Ages 3-8" /></label>
            <label>Sort order <input name="sortOrder" type="number" defaultValue="50" /></label>
            <div className="check-row">
              <label><input name="featured" type="checkbox" /> Featured</label>
              <label><input name="visible" type="checkbox" defaultChecked /> Visible</label>
            </div>
            <button className="button" type="submit">Save book</button>
          </form>
          {message ? <p>{message}</p> : null}
        </article>
      </section>

      <section className="admin-card">
        <h2>Books</h2>
        <div className="admin-books">
          {books.map((book) => (
            <article className="admin-book" key={book.id}>
              <img src={book.cover_url} alt="" />
              <div>
                <h3>{book.title}</h3>
                <p>{book.description}</p>
                <small>{book.asin} · {book.visible ? "Visible" : "Hidden"} · {book.featured ? "Featured" : "Standard"}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}
