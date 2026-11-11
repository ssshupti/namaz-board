// Namaz Board — notify function.
// Called every minute by pg_cron. For each member with alerts on, it works out their waqt times
// and sends a web push: (1) when a fardh waqt starts, (2) 30 min before it ends if not yet logged.
// Also handles {"test": true} from a signed-in member to send them a test notification.
//
// Secrets to set in Supabase → Edge Functions → Secrets:
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (e.g. mailto:you@gmail.com), CRON_SECRET, APP_URL
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.

import webpush from "npm:web-push@3.6.7";
import adhan from "npm:adhan@4.4.3";
import { createClient } from "npm:@supabase/supabase-js@2.118.0";

const CITIES: Record<string, { lat: number; lng: number; tz: string; name: string }> = {
  dhaka: { name: "Dhaka", lat: 23.8103, lng: 90.4125, tz: "Asia/Dhaka" },
  chattogram: { name: "Chattogram", lat: 22.3569, lng: 91.7832, tz: "Asia/Dhaka" },
  sylhet: { name: "Sylhet", lat: 24.8949, lng: 91.8687, tz: "Asia/Dhaka" },
  rajshahi: { name: "Rajshahi", lat: 24.3745, lng: 88.6042, tz: "Asia/Dhaka" },
  khulna: { name: "Khulna", lat: 22.8456, lng: 89.5403, tz: "Asia/Dhaka" },
  london: { name: "London", lat: 51.5074, lng: -0.1278, tz: "Europe/London" },
  birmingham: { name: "Birmingham", lat: 52.4862, lng: -1.8904, tz: "Europe/London" },
  manchester: { name: "Manchester", lat: 53.4808, lng: -2.2426, tz: "Europe/London" },
};
const METHODS = ["Karachi", "MoonsightingCommittee", "MuslimWorldLeague", "NorthAmerica", "Egyptian", "UmmAlQura"];
const FARDH = [
  { k: "fajr", en: "Fajr", bn: "ফজর", end: "sunrise" },
  { k: "dhuhr", en: "Dhuhr", bn: "যোহর", end: "asr" },
  { k: "asr", en: "Asr", bn: "আসর", end: "maghrib" },
  { k: "maghrib", en: "Maghrib", bn: "মাগরিব", end: "isha" },
  { k: "isha", en: "Isha", bn: "এশা", end: null },
] as const;
const WINDOW_MS = 10 * 60e3;      // cron can run late; send if we're within 10 min of the moment
const END_LEAD_MS = 30 * 60e3;    // streak-saver goes 30 min before the waqt ends

type Member = { id: string; name: string; city: string; method: string; madhab: string; notify_start: boolean; notify_end: boolean };
type Times = Record<string, Date>;

const ymd = (d: Date, tz: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const addDays = (ds: string, n: number) => { const t = new Date(ds + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
const fmtT = (d: Date, tz: string) =>
  new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz }).format(d).replace(/\s/, " ");

export function cfgOf(m: Partial<Member>) {
  return {
    city: m.city && CITIES[m.city] ? m.city : "dhaka",
    method: m.method && METHODS.includes(m.method) ? m.method : "Karachi",
    madhab: m.madhab === "shafi" ? "shafi" : "hanafi",
  };
}
export function times(cfg: ReturnType<typeof cfgOf>, ds: string): Times {
  const c = CITIES[cfg.city];
  const [y, mo, d] = ds.split("-").map(Number);
  const co = new adhan.Coordinates(c.lat, c.lng);
  // deno-lint-ignore no-explicit-any
  const p = (adhan.CalculationMethod as any)[cfg.method]();
  p.madhab = cfg.madhab === "shafi" ? adhan.Madhab.Shafi : adhan.Madhab.Hanafi;
  if (Math.abs(c.lat) > 48) p.highLatitudeRule = adhan.HighLatitudeRule.recommended(co);
  // adhan reads the date's local Y/M/D; build it in UTC so the server's timezone doesn't matter
  const t = new adhan.PrayerTimes(co, new Date(Date.UTC(y, mo - 1, d, 12)), p);
  return { fajr: t.fajr, sunrise: t.sunrise, dhuhr: t.dhuhr, asr: t.asr, maghrib: t.maghrib, isha: t.isha };
}

/** Which notifications are due right now for this member (pure; tested). */
export function dueEvents(m: Member, now: Date, logged: (day: string, waqt: string) => boolean, excused: (day: string) => boolean = () => false) {
  const cfg = cfgOf(m), tz = CITIES[cfg.city].tz;
  const out: { day: string; waqt: string; kind: "start" | "end"; title: string; body: string }[] = [];
  const local = ymd(now, tz);
  for (const day of [addDays(local, -1), local]) {
    if (excused(day)) continue; // excused days get no alerts
    const t = times(cfg, day), next = times(cfg, addDays(day, 1));
    for (const p of FARDH) {
      const start = t[p.k], end = p.end ? t[p.end] : next.fajr;
      if (m.notify_start && now >= start && +now - +start < WINDOW_MS) {
        out.push({ day, waqt: p.k, kind: "start", title: `🌸 It's ${p.en} time · ${p.bn}`,
          body: `${p.en} ends at ${fmtT(end, tz)}. Pray, then tap to log it.` });
      }
      const remind = new Date(+end - END_LEAD_MS);
      if (m.notify_end && now >= remind && +now - +remind < WINDOW_MS && now < end && !logged(day, p.k)) {
        out.push({ day, waqt: p.k, kind: "end", title: `⏳ ${p.en} ends in ${Math.max(1, Math.round((+end - +now) / 60e3))} min`,
          body: `You haven't logged ${p.en} yet. Don't lose your streak 🔥` });
      }
    }
  }
  return out;
}

/* ---------- shared stats (streaks/grades friends can see; excused days stay private) ---------- */
const DAY_MS = 24 * 3600e3;
const PTS: Record<string, number> = { f: 10, s: 3, w: 3, n: 2, t: 5, i: 2, d: 2, a: 2 };
type StatMember = { id: string; city: string; method: string; madhab: string; joined: string };
function appDay(cfg: ReturnType<typeof cfgOf>, now: Date) {
  const tz = CITIES[cfg.city].tz, d = ymd(now, tz);
  return now < times(cfg, d).fajr ? addDays(d, -1) : d;
}
/** Same rules as the app: done / miss / open / excused / not-joined. */
export function computeStats(m: StatMember, code: (day: string, waqt: string) => string, isEx: (day: string) => boolean, now: Date) {
  const cfg = cfgOf(m), today = appDay(cfg, now);
  const allF = (d: string) => FARDH.every((p) => code(d, p.k).includes("f"));
  const state = (d: string) => {
    if (m.joined && d < m.joined) return "na";
    if (isEx(d) && !allF(d)) return "ex";
    const t = times(cfg, d);
    for (const p of FARDH) if (!code(d, p.k).includes("f") && +now >= +t[p.k] + DAY_MS) return "miss";
    return allF(d) ? "done" : "open";
  };
  let streak = 0;
  for (let i = 0, d = today; i < 1500; i++, d = addDays(d, -1)) { const st = state(d); if (st === "na" || st === "miss") break; if (st === "done") streak++; }
  let best = 0, run = 0;
  if (m.joined) for (let d = m.joined, i = 0; d <= today && i < 1500; d = addDays(d, 1), i++) { const st = state(d); if (st === "done") { run++; best = Math.max(best, run); } else if (st === "miss") run = 0; }
  best = Math.max(best, streak);
  const range = (start: string) => {
    if (m.joined && m.joined > start) start = m.joined;
    let due = 0, done = 0, pts = 0;
    for (let d = start; d <= today; d = addDays(d, 1)) {
      const t = times(cfg, d), ex = isEx(d);
      for (const p of FARDH) { const c = code(d, p.k), f = c.includes("f"); if (now >= t[p.k]) { if (f || !ex) due++; if (f) done++; } for (const ch of c) pts += PTS[ch] || 0; }
      for (const ch of code(d, "x")) pts += PTS[ch] || 0;
    }
    return { due, done, pts };
  };
  const w = range(addDays(today, -6)), mo = range(today.slice(0, 8) + "01");
  // Heart streaks: days in a row with at least k fardh. Excused days pause; an unfinished day breaks tier k only once k is out of reach.
  const h = [0, 0, 0, 0, 0], alive = [true, true, true, true, true];
  for (let i = 0, d = today; i < 1500 && alive.some(Boolean); i++, d = addDays(d, -1)) {
    if (m.joined && d < m.joined) break;
    const t = times(cfg, d);
    const done = FARDH.filter((p) => code(d, p.k).includes("f")).length;
    if (isEx(d) && done < 5) continue;
    const reachable = done + FARDH.filter((p) => !code(d, p.k).includes("f") && +now < +t[p.k] + DAY_MS).length;
    for (let k = 1; k <= 5; k++) {
      if (!alive[k - 1]) continue;
      if (done >= k) h[k - 1]++; else if (reachable < k) alive[k - 1] = false;
    }
  }
  return { user_id: m.id, streak, best, wk_due: w.due, wk_done: w.done, mo_due: mo.due, mo_done: mo.done, mo_pts: mo.pts, h1: h[0], h2: h[1], h3: h[2], h4: h[3] };
}

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, x-client-info, apikey, content-type" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true });
  const env = (k: string) => (Deno.env.get(k) ?? "").trim();
  const missing = ["VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT", "CRON_SECRET"].filter((k) => !env(k));
  if (missing.length) return json({ error: "missing secrets: " + missing.join(", ") }, 500);
  try {
    webpush.setVapidDetails(env("VAPID_SUBJECT"), env("VAPID_PUBLIC_KEY"), env("VAPID_PRIVATE_KEY"));
  } catch (e) {
    return json({ error: "bad VAPID secret: " + String((e as Error)?.message ?? e) }, 500);
  }
  // Newer projects expose secret keys as a JSON dictionary; older ones use the legacy service role key.
  let serverKey = "";
  try { const o = JSON.parse(env("SUPABASE_SECRET_KEYS") || "{}"); serverKey = o.default ?? Object.values(o)[0] ?? ""; } catch { /* ignore */ }
  serverKey ||= env("SUPABASE_SERVICE_ROLE_KEY");
  const db = createClient(env("SUPABASE_URL"), serverKey, { auth: { persistSession: false } });
  const appUrl = env("APP_URL") || "./";

  const send = async (userId: string, title: string, body: string, tag: string, path = "?view=today") => {
    const { data: subs } = await db.from("push_subscriptions").select("*").eq("user_id", userId);
    let sent = 0;
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title, body, tag, url: appUrl + path }), { TTL: 3600, urgency: "high" });
        sent++;
      } catch (e) {
        // deno-lint-ignore no-explicit-any
        const code = (e as any)?.statusCode;
        if (code === 404 || code === 410) await db.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        else console.error("push failed", code, String(e));
      }
    }
    return sent;
  };

  let payload: { test?: boolean } = {};
  try { payload = await req.json(); } catch { /* empty body from cron */ }

  // Test notification for the signed-in caller.
  if (payload.test) {
    const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: u } = await db.auth.getUser(token);
    if (!u?.user) return json({ error: "sign in first" }, 401);
    const sent = await send(u.user.id, "🔔 Test from Namaz Board", "Alerts are working. MashaAllah ✨", "test");
    return json({ sent });
  }

  // Scheduled run: must carry the cron secret.
  if (req.headers.get("x-cron-secret") !== env("CRON_SECRET") || !env("CRON_SECRET")) return json({ error: "forbidden" }, 403);

  const now = new Date();

  // Every 15 minutes, refresh everyone's shared streak/grade numbers (so a streak that breaks
  // while someone's app is closed still shows correctly to their friends).
  let statsUpdated = 0;
  if (now.getUTCMinutes() % 15 === 0 || (payload as { stats?: boolean }).stats) {
    const { data: all } = await db.from("members").select("id,city,method,madhab,joined");
    const since = addDays(now.toISOString().slice(0, 10), -130);
    const codes = new Map<string, string>();
    for (let from = 0; ; from += 1000) {
      const { data } = await db.from("logs").select("user_id,day,waqt,code").gte("day", since).range(from, from + 999);
      for (const l of data ?? []) codes.set(`${l.user_id}|${l.day}|${l.waqt}`, l.code ?? "");
      if (!data || data.length < 1000) break;
    }
    const { data: exRows } = await db.from("excused").select("user_id,day").gte("day", since);
    const ex = new Set((exRows ?? []).map((r) => `${r.user_id}|${r.day}`));
    const rows = (all ?? []).map((m) => ({ ...computeStats(m as StatMember, (d, w) => codes.get(`${m.id}|${d}|${w}`) ?? "", (d) => ex.has(`${m.id}|${d}`), now), updated_at: now.toISOString() }));
    if (rows.length) {
      let { error } = await db.from("member_stats").upsert(rows, { onConflict: "user_id" });
      if (error) ({ error } = await db.from("member_stats").upsert(rows.map(({ h1: _a, h2: _b, h3: _c, h4: _d, ...r }) => r), { onConflict: "user_id" }));
      if (!error) statsUpdated = rows.length;
    }
  }

  // Ping the admin about new join requests (once per request).
  let reqSent = 0;
  const { data: newReqs } = await db.from("join_requests").select("user_id,name").eq("notified", false);
  if (newReqs?.length) {
    const { data: adminIds } = await db.rpc("admin_user_ids");
    const names = newReqs.map((r) => r.name).join(", ");
    for (const id of (adminIds ?? []) as string[]) {
      reqSent += await send(id, `💌 ${newReqs.length === 1 ? newReqs[0].name + " wants" : newReqs.length + " people want"} to join`,
        newReqs.length === 1 ? "Tap to approve or decline." : `${names} · tap to review`, "join-requests", "?view=requests");
    }
    await db.from("join_requests").update({ notified: true }).in("user_id", newReqs.map((r) => r.user_id));
  }

  const { data: subs } = await db.from("push_subscriptions").select("user_id");
  const ids = [...new Set((subs ?? []).map((s) => s.user_id))];
  if (!ids.length) return json({ checked: 0, sent: reqSent, statsUpdated });
  const { data: members } = await db.from("members").select("id,name,city,method,madhab,notify_start,notify_end").in("id", ids);
  const since = addDays(now.toISOString().slice(0, 10), -2);
  const { data: logs } = await db.from("logs").select("user_id,day,waqt,code").in("user_id", ids).gte("day", since);
  const done = new Set((logs ?? []).filter((l) => (l.code ?? "").includes("f")).map((l) => `${l.user_id}|${l.day}|${l.waqt}`));
  const { data: exNow } = await db.from("excused").select("user_id,day").in("user_id", ids).gte("day", since);
  const excusedSet = new Set((exNow ?? []).map((r) => `${r.user_id}|${r.day}`));

  let sent = 0;
  for (const m of (members ?? []) as Member[]) {
    for (const ev of dueEvents(m, now, (d, w) => done.has(`${m.id}|${d}|${w}`), (d) => excusedSet.has(`${m.id}|${d}`))) {
      // Claim the event first so a slow or overlapping run never sends it twice.
      const { data: claimed, error } = await db.from("notify_sent")
        .upsert({ user_id: m.id, day: ev.day, waqt: ev.waqt, kind: ev.kind }, { onConflict: "user_id,day,waqt,kind", ignoreDuplicates: true })
        .select();
      if (error || !claimed?.length) continue;
      sent += await send(m.id, ev.title, ev.body, `${ev.waqt}-${ev.kind}`);
    }
  }
  // Keep the sent log small.
  await db.from("notify_sent").delete().lt("day", addDays(now.toISOString().slice(0, 10), -7));
  return json({ checked: members?.length ?? 0, sent: sent + reqSent, statsUpdated });
});
