// Weekly backup: exports Namaz Board tables to backup.json (encrypted afterwards by the workflow).
// Leaves out excused days (private even from the admin), push subscriptions and the alert log.
const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) { console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY secret"); process.exit(1); }
const TABLES = ["members", "logs", "groups", "group_members", "member_stats", "invites", "admins", "join_requests"];
const out = { exported_at: new Date().toISOString(), tables: {} };
for (const t of TABLES) {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const r = await fetch(`${url}/rest/v1/${t}?select=*&limit=1000&offset=${offset}`, { headers: { apikey: key } });
    if (r.status === 404) { console.warn(`skipping ${t} (not found)`); break; }
    if (!r.ok) { console.error(`${t}: HTTP ${r.status} ${await r.text()}`); process.exit(1); }
    const page = await r.json();
    rows.push(...page);
    if (page.length < 1000) break;
  }
  out.tables[t] = rows;
  console.log(`${t}: ${rows.length} rows`);
}
const fs = await import("node:fs");
fs.writeFileSync("backup.json", JSON.stringify(out));
