import "dotenv/config";
import { ensureSupabaseTables, hasSupabase } from "../server/supabaseRest.js";

const createSql = `
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists public.reviews (
  id text primary key,
  name text not null,
  comment text not null,
  rating int not null,
  image text default '',
  delete_hash text,
  created_at timestamptz default now()
);
`;

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const adminCode = process.env.ADMIN_REVIEW_CODE || process.env.ADMIN_CODE || "";
  if (!adminCode || request.body?.adminCode !== adminCode) {
    return response.status(403).json({ ok: false, message: "Admin code is invalid." });
  }

  if (!hasSupabase()) {
    return response.status(400).json({ ok: false, message: "Supabase is not configured." });
  }

  try {
    const ok = await ensureSupabaseTables();
    if (!ok) throw new Error("setup failed");
    return response.status(200).json({ ok: true });
  } catch {
    return response.status(500).json({ ok: false, sql: createSql });
  }
}
