const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

export function hasSupabase() {
  return Boolean(supabaseUrl && supabaseKey && /^https:\/\/.+\.supabase\.co$/.test(supabaseUrl));
}

export async function ensureSupabaseTables() {
  if (!hasSupabase()) return false;
  await upsertSetting("bootstrap", { ready: true });
  await deleteSetting("bootstrap");
  return true;
}

export async function readSetting(key) {
  if (!hasSupabase()) return null;
  const response = await supabaseFetch(`/rest/v1/site_settings?key=eq.${encodeURIComponent(key)}&select=value`, {
    method: "GET"
  });
  if (!response.ok) return null;
  const rows = await response.json();
  return rows[0]?.value || null;
}

export async function upsertSetting(key, value) {
  if (!hasSupabase()) return false;
  const response = await supabaseFetch("/rest/v1/site_settings", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify([{ key, value }])
  });
  return response.ok;
}

export async function deleteSetting(key) {
  if (!hasSupabase()) return false;
  await supabaseFetch(`/rest/v1/site_settings?key=eq.${encodeURIComponent(key)}`, { method: "DELETE" });
  return true;
}

export async function listStoredReviews() {
  if (!hasSupabase()) return null;
  const response = await supabaseFetch("/rest/v1/reviews?select=*&order=created_at.desc", { method: "GET" });
  if (!response.ok) return null;
  const rows = await response.json();
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    comment: row.comment,
    rating: row.rating,
    image: row.image || "",
    deleteHash: row.delete_hash,
    createdAt: row.created_at
  }));
}

export async function insertStoredReview(review) {
  if (!hasSupabase()) return false;
  const response = await supabaseFetch("/rest/v1/reviews", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify([{
      id: review.id,
      name: review.name,
      comment: review.comment,
      rating: review.rating,
      image: review.image || "",
      delete_hash: review.deleteHash,
      created_at: review.createdAt
    }])
  });
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Supabase review insert failed: ${response.status} ${message}`);
  }
  return true;
}

export async function deleteStoredReview(id) {
  if (!hasSupabase()) return false;
  const response = await supabaseFetch(`/rest/v1/reviews?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
  return response.ok;
}

async function supabaseFetch(path, options = {}) {
  return fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
}
