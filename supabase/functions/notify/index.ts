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
export function dueEvents(m: Member, now: Date, logged: (day: string, waqt: string) => boolean) {
  const cfg = cfgOf(m), tz = CITIES[cfg.city].tz;
  const out: { day: string; waqt: string; kind: "start" | "end"; title: string; body: string }[] = [];
  const local = ymd(now, tz);
  for (const day of [addDays(local, -1), local]) {
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
  if (!ids.length) return json({ checked: 0, sent: reqSent });
  const { data: members } = await db.from("members").select("id,name,city,method,madhab,notify_start,notify_end").in("id", ids);
  const since = addDays(now.toISOString().slice(0, 10), -2);
  const { data: logs } = await db.from("logs").select("user_id,day,waqt,code").in("user_id", ids).gte("day", since);
  const done = new Set((logs ?? []).filter((l) => (l.code ?? "").includes("f")).map((l) => `${l.user_id}|${l.day}|${l.waqt}`));

  let sent = 0;
  for (const m of (members ?? []) as Member[]) {
    for (const ev of dueEvents(m, now, (d, w) => done.has(`${m.id}|${d}|${w}`))) {
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
  return json({ checked: members?.length ?? 0, sent: sent + reqSent });
});
