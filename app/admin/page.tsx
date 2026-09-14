import { AdminClient } from "@/components/AdminClient";
import { getSupabaseBrowserConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const config = getSupabaseBrowserConfig();

  return (
    <main className="site-shell admin-shell">
      <section className="admin-top">
        <div>
          <p className="eyebrow">Admin area</p>
          <h1>Book Admin</h1>
          <p>Add new Amazon books, hide or feature titles, and watch the analytics that matter for sales intent.</p>
        </div>
        <a className="button secondary" href="/">View site</a>
      </section>
      <AdminClient supabaseUrl={config.url} supabaseAnonKey={config.anonKey} />
    </main>
  );
}
