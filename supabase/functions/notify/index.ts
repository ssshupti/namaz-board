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

const CITIES: Record<string, { name: string; group: string; lat: number; lng: number; tz: string; method: string }> = {
  dhaka:{name:"Dhaka",group:"Bangladesh",lat:23.8103,lng:90.4125,tz:"Asia/Dhaka",method:"Karachi"},
  chattogram:{name:"Chattogram",group:"Bangladesh",lat:22.3569,lng:91.7832,tz:"Asia/Dhaka",method:"Karachi"},
  sylhet:{name:"Sylhet",group:"Bangladesh",lat:24.8949,lng:91.8687,tz:"Asia/Dhaka",method:"Karachi"},
  rajshahi:{name:"Rajshahi",group:"Bangladesh",lat:24.3745,lng:88.6042,tz:"Asia/Dhaka",method:"Karachi"},
  khulna:{name:"Khulna",group:"Bangladesh",lat:22.8456,lng:89.5403,tz:"Asia/Dhaka",method:"Karachi"},
  barishal:{name:"Barishal",group:"Bangladesh",lat:22.701,lng:90.3535,tz:"Asia/Dhaka",method:"Karachi"},
  rangpur:{name:"Rangpur",group:"Bangladesh",lat:25.7439,lng:89.2752,tz:"Asia/Dhaka",method:"Karachi"},
  mymensingh:{name:"Mymensingh",group:"Bangladesh",lat:24.7471,lng:90.4203,tz:"Asia/Dhaka",method:"Karachi"},
  cumilla:{name:"Cumilla",group:"Bangladesh",lat:23.4607,lng:91.1809,tz:"Asia/Dhaka",method:"Karachi"},
  gazipur:{name:"Gazipur",group:"Bangladesh",lat:23.9999,lng:90.4203,tz:"Asia/Dhaka",method:"Karachi"},
  narayanganj:{name:"Narayanganj",group:"Bangladesh",lat:23.6238,lng:90.5,tz:"Asia/Dhaka",method:"Karachi"},
  coxsbazar:{name:"Cox's Bazar",group:"Bangladesh",lat:21.4272,lng:92.0058,tz:"Asia/Dhaka",method:"Karachi"},
  bogura:{name:"Bogura",group:"Bangladesh",lat:24.8466,lng:89.3773,tz:"Asia/Dhaka",method:"Karachi"},
  jashore:{name:"Jashore",group:"Bangladesh",lat:23.1664,lng:89.2081,tz:"Asia/Dhaka",method:"Karachi"},
  noakhali:{name:"Noakhali",group:"Bangladesh",lat:22.8696,lng:91.0995,tz:"Asia/Dhaka",method:"Karachi"},
  feni:{name:"Feni",group:"Bangladesh",lat:23.0159,lng:91.3976,tz:"Asia/Dhaka",method:"Karachi"},
  brahmanbaria:{name:"Brahmanbaria",group:"Bangladesh",lat:23.9571,lng:91.1119,tz:"Asia/Dhaka",method:"Karachi"},
  tangail:{name:"Tangail",group:"Bangladesh",lat:24.2513,lng:89.9167,tz:"Asia/Dhaka",method:"Karachi"},
  dinajpur:{name:"Dinajpur",group:"Bangladesh",lat:25.6217,lng:88.6354,tz:"Asia/Dhaka",method:"Karachi"},
  kushtia:{name:"Kushtia",group:"Bangladesh",lat:23.9013,lng:89.1203,tz:"Asia/Dhaka",method:"Karachi"},
  pabna:{name:"Pabna",group:"Bangladesh",lat:24.0064,lng:89.2372,tz:"Asia/Dhaka",method:"Karachi"},
  moulvibazar:{name:"Moulvibazar",group:"Bangladesh",lat:24.4829,lng:91.7774,tz:"Asia/Dhaka",method:"Karachi"},
  habiganj:{name:"Habiganj",group:"Bangladesh",lat:24.3745,lng:91.4155,tz:"Asia/Dhaka",method:"Karachi"},
  sunamganj:{name:"Sunamganj",group:"Bangladesh",lat:25.0658,lng:91.395,tz:"Asia/Dhaka",method:"Karachi"},
  london:{name:"London",group:"United Kingdom",lat:51.5074,lng:-0.1278,tz:"Europe/London",method:"MoonsightingCommittee"},
  birmingham:{name:"Birmingham",group:"United Kingdom",lat:52.4862,lng:-1.8904,tz:"Europe/London",method:"MoonsightingCommittee"},
  manchester:{name:"Manchester",group:"United Kingdom",lat:53.4808,lng:-2.2426,tz:"Europe/London",method:"MoonsightingCommittee"},
  leeds:{name:"Leeds",group:"United Kingdom",lat:53.8008,lng:-1.5491,tz:"Europe/London",method:"MoonsightingCommittee"},
  bradford:{name:"Bradford",group:"United Kingdom",lat:53.796,lng:-1.7594,tz:"Europe/London",method:"MoonsightingCommittee"},
  leicester:{name:"Leicester",group:"United Kingdom",lat:52.6369,lng:-1.1398,tz:"Europe/London",method:"MoonsightingCommittee"},
  sheffield:{name:"Sheffield",group:"United Kingdom",lat:53.3811,lng:-1.4701,tz:"Europe/London",method:"MoonsightingCommittee"},
  liverpool:{name:"Liverpool",group:"United Kingdom",lat:53.4084,lng:-2.9916,tz:"Europe/London",method:"MoonsightingCommittee"},
  bristol:{name:"Bristol",group:"United Kingdom",lat:51.4545,lng:-2.5879,tz:"Europe/London",method:"MoonsightingCommittee"},
  nottingham:{name:"Nottingham",group:"United Kingdom",lat:52.9548,lng:-1.1581,tz:"Europe/London",method:"MoonsightingCommittee"},
  coventry:{name:"Coventry",group:"United Kingdom",lat:52.4068,lng:-1.5197,tz:"Europe/London",method:"MoonsightingCommittee"},
  luton:{name:"Luton",group:"United Kingdom",lat:51.8787,lng:-0.42,tz:"Europe/London",method:"MoonsightingCommittee"},
  oldham:{name:"Oldham",group:"United Kingdom",lat:53.5409,lng:-2.1114,tz:"Europe/London",method:"MoonsightingCommittee"},
  newcastle:{name:"Newcastle",group:"United Kingdom",lat:54.9783,lng:-1.6178,tz:"Europe/London",method:"MoonsightingCommittee"},
  cardiff:{name:"Cardiff",group:"United Kingdom",lat:51.4816,lng:-3.1791,tz:"Europe/London",method:"MoonsightingCommittee"},
  glasgow:{name:"Glasgow",group:"United Kingdom",lat:55.8642,lng:-4.2518,tz:"Europe/London",method:"MoonsightingCommittee"},
  edinburgh:{name:"Edinburgh",group:"United Kingdom",lat:55.9533,lng:-3.1883,tz:"Europe/London",method:"MoonsightingCommittee"},
  dublin:{name:"Dublin",group:"Ireland",lat:53.3498,lng:-6.2603,tz:"Europe/Dublin",method:"MoonsightingCommittee"},
  kolkata:{name:"Kolkata",group:"India",lat:22.5726,lng:88.3639,tz:"Asia/Kolkata",method:"Karachi"},
  delhi:{name:"Delhi",group:"India",lat:28.6139,lng:77.209,tz:"Asia/Kolkata",method:"Karachi"},
  mumbai:{name:"Mumbai",group:"India",lat:19.076,lng:72.8777,tz:"Asia/Kolkata",method:"Karachi"},
  karachi:{name:"Karachi",group:"Pakistan",lat:24.8607,lng:67.0011,tz:"Asia/Karachi",method:"Karachi"},
  lahore:{name:"Lahore",group:"Pakistan",lat:31.5204,lng:74.3587,tz:"Asia/Karachi",method:"Karachi"},
  islamabad:{name:"Islamabad",group:"Pakistan",lat:33.6844,lng:73.0479,tz:"Asia/Karachi",method:"Karachi"},
  kathmandu:{name:"Kathmandu",group:"Nepal",lat:27.7172,lng:85.324,tz:"Asia/Kathmandu",method:"Karachi"},
  makkah:{name:"Makkah",group:"Saudi Arabia",lat:21.3891,lng:39.8579,tz:"Asia/Riyadh",method:"UmmAlQura"},
  madinah:{name:"Madinah",group:"Saudi Arabia",lat:24.5247,lng:39.5692,tz:"Asia/Riyadh",method:"UmmAlQura"},
  riyadh:{name:"Riyadh",group:"Saudi Arabia",lat:24.7136,lng:46.6753,tz:"Asia/Riyadh",method:"UmmAlQura"},
  jeddah:{name:"Jeddah",group:"Saudi Arabia",lat:21.4858,lng:39.1925,tz:"Asia/Riyadh",method:"UmmAlQura"},
  dubai:{name:"Dubai",group:"UAE",lat:25.2048,lng:55.2708,tz:"Asia/Dubai",method:"Dubai"},
  abudhabi:{name:"Abu Dhabi",group:"UAE",lat:24.4539,lng:54.3773,tz:"Asia/Dubai",method:"Dubai"},
  sharjah:{name:"Sharjah",group:"UAE",lat:25.3463,lng:55.4209,tz:"Asia/Dubai",method:"Dubai"},
  doha:{name:"Doha",group:"Qatar",lat:25.2854,lng:51.531,tz:"Asia/Qatar",method:"Qatar"},
  kuwait:{name:"Kuwait City",group:"Kuwait",lat:29.3759,lng:47.9774,tz:"Asia/Kuwait",method:"Kuwait"},
  manama:{name:"Manama",group:"Bahrain",lat:26.2285,lng:50.586,tz:"Asia/Bahrain",method:"UmmAlQura"},
  muscat:{name:"Muscat",group:"Oman",lat:23.588,lng:58.3829,tz:"Asia/Muscat",method:"UmmAlQura"},
  istanbul:{name:"Istanbul",group:"Turkey",lat:41.0082,lng:28.9784,tz:"Europe/Istanbul",method:"Turkey"},
  ankara:{name:"Ankara",group:"Turkey",lat:39.9334,lng:32.8597,tz:"Europe/Istanbul",method:"Turkey"},
  cairo:{name:"Cairo",group:"Egypt",lat:30.0444,lng:31.2357,tz:"Africa/Cairo",method:"Egyptian"},
  kualalumpur:{name:"Kuala Lumpur",group:"Malaysia",lat:3.139,lng:101.6869,tz:"Asia/Kuala_Lumpur",method:"Singapore"},
  singapore:{name:"Singapore",group:"Singapore",lat:1.3521,lng:103.8198,tz:"Asia/Singapore",method:"Singapore"},
  jakarta:{name:"Jakarta",group:"Indonesia",lat:-6.2088,lng:106.8456,tz:"Asia/Jakarta",method:"Singapore"},
  paris:{name:"Paris",group:"France",lat:48.8566,lng:2.3522,tz:"Europe/Paris",method:"MuslimWorldLeague"},
  berlin:{name:"Berlin",group:"Germany",lat:52.52,lng:13.405,tz:"Europe/Berlin",method:"MuslimWorldLeague"},
  rome:{name:"Rome",group:"Italy",lat:41.9028,lng:12.4964,tz:"Europe/Rome",method:"MuslimWorldLeague"},
  madrid:{name:"Madrid",group:"Spain",lat:40.4168,lng:-3.7038,tz:"Europe/Madrid",method:"MuslimWorldLeague"},
  lisbon:{name:"Lisbon",group:"Portugal",lat:38.7223,lng:-9.1393,tz:"Europe/Lisbon",method:"MuslimWorldLeague"},
  amsterdam:{name:"Amsterdam",group:"Netherlands",lat:52.3676,lng:4.9041,tz:"Europe/Amsterdam",method:"MuslimWorldLeague"},
  stockholm:{name:"Stockholm",group:"Sweden",lat:59.3293,lng:18.0686,tz:"Europe/Stockholm",method:"MuslimWorldLeague"},
  newyork:{name:"New York",group:"USA",lat:40.7128,lng:-74.006,tz:"America/New_York",method:"NorthAmerica"},
  chicago:{name:"Chicago",group:"USA",lat:41.8781,lng:-87.6298,tz:"America/Chicago",method:"NorthAmerica"},
  houston:{name:"Houston",group:"USA",lat:29.7604,lng:-95.3698,tz:"America/Chicago",method:"NorthAmerica"},
  losangeles:{name:"Los Angeles",group:"USA",lat:34.0522,lng:-118.2437,tz:"America/Los_Angeles",method:"NorthAmerica"},
  toronto:{name:"Toronto",group:"Canada",lat:43.6532,lng:-79.3832,tz:"America/Toronto",method:"NorthAmerica"},
  sydney:{name:"Sydney",group:"Australia",lat:-33.8688,lng:151.2093,tz:"Australia/Sydney",method:"MuslimWorldLeague"},
  melbourne:{name:"Melbourne",group:"Australia",lat:-37.8136,lng:144.9631,tz:"Australia/Melbourne",method:"MuslimWorldLeague"},
  tokyo:{name:"Tokyo",group:"Japan",lat:35.6762,lng:139.6503,tz:"Asia/Tokyo",method:"MuslimWorldLeague"}
};
const METHODS = ["Karachi", "MoonsightingCommittee", "MuslimWorldLeague", "NorthAmerica", "UmmAlQura", "Dubai", "Qatar", "Kuwait", "Egyptian", "Turkey", "Singapore"];
const FARDH = [
  { k: "fajr", en: "Fajr", bn: "ফজর", end: "sunrise" },
  { k: "dhuhr", en: "Dhuhr", bn: "যোহর", end: "asr" },
  { k: "asr", en: "Asr", bn: "আসর", end: "maghrib" },
  { k: "maghrib", en: "Maghrib", bn: "মাগরিব", end: "isha" },
  { k: "isha", en: "Isha", bn: "এশা", end: null },
] as const;
const WINDOW_MS = 10 * 60e3;      // cron can run late; send if we're within 10 min of the moment
const END_LEAD_MS = 30 * 60e3;    // streak-saver goes 30 min before the waqt ends

type Member = { id: string; name: string; city: string; method: string; madhab: string; notify_start: boolean; notify_end: boolean; lat?: number | null; lng?: number | null; tz?: string | null; place?: string | null; notify_jumuah?: boolean; quiet_start?: number | null; quiet_end?: number | null; lang?: string | null };
type Times = Record<string, Date>;

const ymd = (d: Date, tz: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const addDays = (ds: string, n: number) => { const t = new Date(ds + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
const fmtT = (d: Date, tz: string) =>
  new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz }).format(d).replace(/\s/, " ");

const BND = "০১২৩৪৫৬৭৮৯";
const bnNum = (s: string) => s.replace(/\d/g, (d) => BND[+d]).replace(/\bam\b/i, "AM").replace(/\bpm\b/i, "PM");

export function cfgOf(m: Partial<Member>) {
  const custom = m.city === "custom" && Number.isFinite(m.lat) && Number.isFinite(m.lng) && !!m.tz;
  const city = custom ? "custom" : (m.city && CITIES[m.city] ? m.city : "dhaka");
  return {
    city, lat: custom ? m.lat as number : null, lng: custom ? m.lng as number : null, tz: custom ? m.tz as string : null,
    method: m.method && METHODS.includes(m.method) ? m.method : (CITIES[city]?.method ?? "Karachi"),
    madhab: m.madhab === "shafi" ? "shafi" : "hanafi",
  };
}
const loc = (cfg: ReturnType<typeof cfgOf>) => cfg.city === "custom" ? { lat: cfg.lat as number, lng: cfg.lng as number, tz: cfg.tz as string } : CITIES[cfg.city];
export function times(cfg: ReturnType<typeof cfgOf>, ds: string): Times {
  const c = loc(cfg);
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
  const cfg = cfgOf(m), tz = loc(cfg).tz;
  const out: { day: string; waqt: string; kind: "start" | "end" | "jumuah"; title: string; body: string }[] = [];
  const local = ymd(now, tz), bn = m.lang === "bn";
  // Jumu'ah (opt-in): Fridays, 1 hour before Dhuhr.
  if (m.notify_jumuah && new Date(local + "T12:00:00Z").getUTCDay() === 5 && !excused(local)) {
    const dz = times(cfg, local).dhuhr, at = new Date(+dz - 60 * 60e3);
    if (now >= at && +now - +at < WINDOW_MS)
      out.push({ day: local, waqt: "jumuah", kind: "jumuah", ...(bn
        ? { title: "🕌 জুমা মুবারক", body: `যোহর / জুমা ${bnNum(fmtT(dz, tz))}-এ। একটু আগে বের হোন, আর আজ সূরা কাহফ পড়ুন 🌸` }
        : { title: "🕌 Jumu'ah Mubarak", body: `Dhuhr / Jumu'ah at ${fmtT(dz, tz)}. Head out early, and read Surah Al-Kahf today 🌸` }) });
  }
  for (const day of [addDays(local, -1), local]) {
    if (excused(day)) continue; // excused days get no alerts
    const t = times(cfg, day), next = times(cfg, addDays(day, 1));
    for (const p of FARDH) {
      const start = t[p.k], end = p.end ? t[p.end] : next.fajr;
      if (m.notify_start && now >= start && +now - +start < WINDOW_MS) {
        out.push({ day, waqt: p.k, kind: "start", ...(bn
          ? { title: `🌸 ${p.bn}-এর সময় হয়েছে`, body: `${p.bn} শেষ হবে ${bnNum(fmtT(end, tz))}-এ। নামাজ পড়ে লগ করতে চাপুন।` }
          : { title: `🌸 It's ${p.en} time · ${p.bn}`, body: `${p.en} ends at ${fmtT(end, tz)}. Pray, then tap to log it.` }) });
      }
      // Isha's waqt runs to Fajr, but delaying it past the middle of the night is disliked, and a 4am ping wakes people.
      // So Isha's reminder goes 30 min before the Islamic midnight (halfway from Maghrib to Fajr) instead.
      // Asr: aim before the sunset makruh window (last 15 min before Maghrib), not Maghrib itself.
      const target = p.k === "isha" ? new Date(+t.maghrib + (+next.fajr - +t.maghrib) / 2)
        : p.k === "asr" ? new Date(+end - 15 * 60e3) : end;
      const remind = new Date(+target - END_LEAD_MS);
      if (m.notify_end && now >= remind && +now - +remind < WINDOW_MS && now < target && !logged(day, p.k)) {
        const mins = Math.max(1, Math.round((+end - +now) / 60e3)), at = fmtT(target, tz);
        out.push(bn ? (p.k === "isha"
          ? { day, waqt: p.k, kind: "end", title: "🌙 এশা এখনো পড়েননি?", body: `ফজর পর্যন্ত এশার সময় আছে। পারলে ${bnNum(at)}-এর আগে পড়ে নেওয়া উত্তম 🌸` }
          : p.k === "asr"
          ? { day, waqt: p.k, kind: "end", title: `⏳ ${bnNum(at)}-এর আগে আসর পড়ুন`, body: "এরপর সূর্য ডোবার সময় (মাকরুহ)। স্ট্রিক হারাবেন না 🔥" }
          : { day, waqt: p.k, kind: "end", title: `⏳ ${p.bn} শেষ হতে ${bnNum(String(mins))} মিনিট বাকি`, body: `${p.bn} এখনো লগ করেননি। স্ট্রিক হারাবেন না 🔥` })
          : p.k === "isha"
          ? { day, waqt: p.k, kind: "end", title: "🌙 Haven't prayed Isha yet?", body: `Isha is still on until Fajr. It's best to pray it before ${fmtT(target, tz)} if you can 🌸` }
          : p.k === "asr"
          ? { day, waqt: p.k, kind: "end", title: `⏳ Pray Asr before ${fmtT(target, tz)}`, body: "After that the sun is setting (makruh). Don't lose your streak 🔥" }
          : { day, waqt: p.k, kind: "end", title: `⏳ ${p.en} ends in ${Math.max(1, Math.round((+end - +now) / 60e3))} min`, body: `You haven't logged ${p.en} yet. Don't lose your streak 🔥` });
      }
    }
  }
  return out;
}

/* ---------- shared stats (streaks/grades friends can see; excused days stay private) ---------- */
const DAY_MS = 24 * 3600e3;
const PTS: Record<string, number> = { f: 10, s: 3, b: 2, w: 3, n: 2, t: 5, i: 2, d: 2, a: 2 };
type StatMember = { id: string; city: string; method: string; madhab: string; joined: string; created_at?: string; lat?: number | null; lng?: number | null; tz?: string | null };
function appDay(cfg: ReturnType<typeof cfgOf>, now: Date) {
  const tz = loc(cfg).tz, d = ymd(now, tz);
  return now < times(cfg, d).fajr ? addDays(d, -1) : d;
}
/** Same rules as the app: done / miss / open / excused / not-joined. */
/** Is it currently inside the member's quiet hours (in their own time zone)? */
export function inQuiet(m: Partial<Member>, now: Date) {
  if (m.quiet_start == null || m.quiet_end == null || m.quiet_start === m.quiet_end) return false;
  const tz = loc(cfgOf(m)).tz;
  const [h, mi] = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(now).split(":").map(Number);
  const cur = h * 60 + mi;
  return m.quiet_start < m.quiet_end ? cur >= m.quiet_start && cur < m.quiet_end : cur >= m.quiet_start || cur < m.quiet_end;
}

export function computeStats(m: StatMember, code: (day: string, waqt: string) => string, isEx: (day: string) => boolean, now: Date) {
  const cfg = cfgOf(m), today = appDay(cfg, now);
  const allF = (d: string) => FARDH.every((p) => code(d, p.k).includes("f"));
  // On the joining day, prayers that began before the person joined only count if logged.
  const preJoin = (d: string, start: Date) => !!(m.joined === d && m.created_at && start < new Date(m.created_at));
  const state = (d: string) => {
    if (m.joined && d < m.joined) return "na";
    if (isEx(d) && !allF(d)) return "ex";
    const t = times(cfg, d);
    for (const p of FARDH) if (!code(d, p.k).includes("f") && !preJoin(d, t[p.k]) && +now >= +t[p.k] + DAY_MS) return "miss";
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
      for (const p of FARDH) { const c = code(d, p.k), f = c.includes("f"); if (now >= t[p.k]) { if (f || (!ex && !preJoin(d, t[p.k]))) due++; if (f) done++; } for (const ch of c) pts += PTS[ch] || 0; }
      for (const ch of code(d, "x")) pts += PTS[ch] || 0;
    }
    return { due, done, pts };
  };
  const w = range(addDays(today, -6)), mo = range(today.slice(0, 8) + "01");
  // Every fardh since joining: prayed / due (a fardh is due once its waqt has started).
  const all = range(m.joined || today);
  return { user_id: m.id, streak, best, wk_due: w.due, wk_done: w.done, mo_due: mo.due, mo_done: mo.done, mo_pts: mo.pts, f_due: all.due, f_done: all.done };
}

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, x-client-info, apikey, content-type" } });

/* Nudge templates. Keep in sync with NUDGES in app.js. {w} = the namaz name. */
export const NUDGE_TEXT: Record<string, [string, string]> = {
  n1: ["did u pray {w} yet?","{w} porsos?"],
  n2: ["{w}'s almost over 👀","{w} er time sesh hoye jacche 👀"],
  n3: ["pray {w} then come back to ur phone 😤","phone rakh, {w} por 😤"],
  n4: ["wanna pray {w} together?","cholo eksathe {w} pori?"],
  n5: ["did u pray {w} yet?","{w} porsos?"],
  h1: ["mashaAllah 🥹","mashaAllah 🥹"],
  h2: ["yesss 🙌","ufff consistency 👏"],
  h3: ["ok consistency 👏","streak bachay rakhsos 🔥"],
  h4: ["proud of u 🫶","proud of u 🫶"],
  h5: ["proud of u 🫶","proud of u 🫶"],
  r1: ["jazakAllah 🤍","jazakAllah 🤍"],
  r2: ["going now","jaitesi"],
  r3: ["already did 😌","already porsi 😌"],
  r4: ["5 more mins 😭","5 min 😭"],
  g1: ["{w} everyone 🕰️","{w} er time sobai 🕰️"],
  g2: ["who's prayed {w}?","ke ke {w} porse?"],
  g3: ["let's not break the streak guys","streak bhangish na keu"],
  g4: ["everyone prayed {w} 🥳 mashaAllah","sobai {w} porse 🥳 mashaAllah"],
  g5: ["everyone prayed {w} 🥳 mashaAllah","sobai {w} porse 🥳 mashaAllah"],
};
const WAQT_NAME: Record<string, [string, string]> = { fajr: ["fajr", "fajr"], dhuhr: ["dhuhr", "zohor"], asr: ["asr", "asr"], maghrib: ["maghrib", "magrib"], isha: ["isha", "esha"] };
export function nudgeMessage(kind: string, waqt: string, from: string, bn: boolean, group = "") {
  const i = bn ? 1 : 0, body = (NUDGE_TEXT[kind]?.[i] ?? "👋").replaceAll("{w}", WAQT_NAME[waqt]?.[i] ?? waqt);
  const title = kind[0] === "g" ? `📢 ${from} → ${group}` : kind[0] === "r" ? `💬 ${from}`
    : kind[0] === "h" ? `✨ ${from}`
    : `👉 ${from}`;
  return { title, body };
}

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
    const { data: all } = await db.from("members").select("*");
    const codes = new Map<string, string>();
    for (let from = 0; ; from += 1000) {
      const { data } = await db.from("logs").select("user_id,day,waqt,code").order("day").range(from, from + 999);
      for (const l of data ?? []) codes.set(`${l.user_id}|${l.day}|${l.waqt}`, l.code ?? "");
      if (!data || data.length < 1000) break;
    }
    const { data: exRows } = await db.from("excused").select("user_id,day");
    const ex = new Set((exRows ?? []).map((r) => `${r.user_id}|${r.day}`));
    const rows = (all ?? []).map((m) => ({ ...computeStats(m as StatMember, (d, w) => codes.get(`${m.id}|${d}|${w}`) ?? "", (d) => ex.has(`${m.id}|${d}`), now), updated_at: now.toISOString() }));
    if (rows.length) {
      let { error } = await db.from("member_stats").upsert(rows, { onConflict: "user_id" });
      if (error) ({ error } = await db.from("member_stats").upsert(rows.map(({ f_due: _a, f_done: _b, ...r }) => r), { onConflict: "user_id" }));
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

  // Nudges from friends: push each one once, within a few minutes of sending.
  let nudgeSent = 0;
  const { data: nudges } = await db.from("nudges").select("id,from_id,to_id,kind,waqt,group_id")
    .eq("pushed", false).gte("created_at", new Date(+now - 30 * 60e3).toISOString()).limit(200);
  if (nudges?.length) {
    await db.from("nudges").update({ pushed: true }).in("id", nudges.map((n) => n.id));
    // Group messages go to every member except the sender.
    const gids = [...new Set(nudges.filter((n) => !n.to_id).map((n) => n.group_id))];
    const { data: gms } = gids.length ? await db.from("group_members").select("group_id,user_id").in("group_id", gids) : { data: [] };
    const { data: gs } = gids.length ? await db.from("groups").select("id,name").in("id", gids) : { data: [] };
    const gName = new Map((gs ?? []).map((g) => [g.id, g.name]));
    const jobs = nudges.flatMap((n) => n.to_id ? [{ ...n, to: n.to_id as string }]
      : (gms ?? []).filter((m) => m.group_id === n.group_id && m.user_id !== n.from_id).map((m) => ({ ...n, to: m.user_id as string })));
    const people = [...new Set(jobs.flatMap((n) => [n.from_id, n.to]))];
    const { data: ms } = await db.from("members").select("*").in("id", people);
    const byId = new Map((ms ?? []).map((m) => [m.id, m]));
    for (const n of jobs) {
      const to = byId.get(n.to), from = byId.get(n.from_id);
      if (!to || !from || inQuiet(to as Member, now)) continue;
      const { title, body } = nudgeMessage(n.kind, n.waqt, from.name || "A friend", to.lang === "bn", gName.get(n.group_id) ?? "");
      nudgeSent += await send(n.to, title, body, `nudge-${n.id}`, `?view=board&gid=${n.group_id}`);
    }
  }
  await db.from("nudges").delete().lt("created_at", new Date(+now - 7 * 86400e3).toISOString());

  const { data: subs } = await db.from("push_subscriptions").select("user_id");
  const ids = [...new Set((subs ?? []).map((s) => s.user_id))];
  if (!ids.length) return json({ checked: 0, sent: reqSent + nudgeSent, statsUpdated });
  const { data: members } = await db.from("members").select("*").in("id", ids);
  const since = addDays(now.toISOString().slice(0, 10), -2);
  const { data: logs } = await db.from("logs").select("user_id,day,waqt,code").in("user_id", ids).gte("day", since);
  const done = new Set((logs ?? []).filter((l) => (l.code ?? "").includes("f")).map((l) => `${l.user_id}|${l.day}|${l.waqt}`));
  const { data: exNow } = await db.from("excused").select("user_id,day").in("user_id", ids).gte("day", since);
  const excusedSet = new Set((exNow ?? []).map((r) => `${r.user_id}|${r.day}`));

  let sent = 0;
  for (const m of (members ?? []) as Member[]) {
    if (inQuiet(m, now)) continue; // quiet hours: skip (the event isn't marked sent, but its 10-minute window will have passed)
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
  return json({ checked: members?.length ?? 0, sent: sent + reqSent + nudgeSent, statsUpdated });
});
