/* Namaz Board — app logic. Data lives in Supabase; times are computed on the device with adhan. */
(() => {
const CONF = window.NAMAZ_CONFIG || {};
const CITIES = {
  dhaka:{name:"Dhaka",lat:23.8103,lng:90.4125,tz:"Asia/Dhaka"},
  chattogram:{name:"Chattogram",lat:22.3569,lng:91.7832,tz:"Asia/Dhaka"},
  sylhet:{name:"Sylhet",lat:24.8949,lng:91.8687,tz:"Asia/Dhaka"},
  rajshahi:{name:"Rajshahi",lat:24.3745,lng:88.6042,tz:"Asia/Dhaka"},
  khulna:{name:"Khulna",lat:22.8456,lng:89.5403,tz:"Asia/Dhaka"},
  london:{name:"London",lat:51.5074,lng:-0.1278,tz:"Europe/London"},
  birmingham:{name:"Birmingham",lat:52.4862,lng:-1.8904,tz:"Europe/London"},
  manchester:{name:"Manchester",lat:53.4808,lng:-2.2426,tz:"Europe/London"}
};
const METHODS = {Karachi:"Karachi (Bangladesh, Pakistan)",MoonsightingCommittee:"Moonsighting Committee (UK)",MuslimWorldLeague:"Muslim World League",NorthAmerica:"ISNA (North America)",Egyptian:"Egyptian",UmmAlQura:"Umm al-Qura (Makkah)"};
const DEFAULT = {city:"dhaka",method:"Karachi",madhab:"hanafi"};
const P = [
  {k:"fajr",en:"Fajr",bn:"ফজর",f:2,chips:[["s","Sunnah","2"]]},
  {k:"dhuhr",en:"Dhuhr",bn:"যোহর",f:4,chips:[["s","Sunnah","4+2"],["n","Nafl","2"]]},
  {k:"asr",en:"Asr",bn:"আসর",f:4,chips:[["s","Sunnah","4"]]},
  {k:"maghrib",en:"Maghrib",bn:"মাগরিব",f:3,chips:[["s","Sunnah","2"],["n","Nafl","2"]]},
  {k:"isha",en:"Isha",bn:"এশা",f:4,chips:[["s","Sunnah","4+2"],["w","Witr","3"],["n","Nafl","2"]]}
];
const X = {k:"x",en:"Tahajjud & extra",bn:"তাহাজ্জুদ",chips:[["t","Tahajjud"],["i","Ishraq"],["d","Duha"],["a","Awwabin"]]};
const PTS = {f:10,s:3,w:3,n:2,t:5,i:2,d:2,a:2};
const H = 3600e3, DAY = 24*H, HISTORY_DAYS = 130;

const S = {sb:null,session:null,myId:null,email:"",invited:false,admin:false,invites:[],requests:[],myRequest:null,lastSync:null,
  members:{},overlay:{},view:"today",dayOff:0,period:"7",open:null,readOnly:false,
  phase:"boot",err:"",pop:"",confirmRm:null};
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const flameSvg = (lit) => lit
  ? `<svg viewBox="0 0 64 76" aria-hidden="true"><use href="#flm" fill="url(#gF)"/><ellipse cx="25" cy="47" rx="3" ry="3.6" fill="#5A2440"/><ellipse cx="39" cy="47" rx="3" ry="3.6" fill="#5A2440"/><circle cx="26" cy="45.8" r="1" fill="#fff"/><circle cx="40" cy="45.8" r="1" fill="#fff"/><path d="M28.5 53q3.5 3.5 7 0" stroke="#5A2440" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="19" cy="53" r="3.6" fill="#FF7AA2" opacity=".55"/><circle cx="45" cy="53" r="3.6" fill="#FF7AA2" opacity=".55"/></svg>`
  : `<svg viewBox="0 0 64 76" aria-hidden="true"><use href="#flm" fill="var(--off)" stroke="var(--line)" stroke-width="2.5"/><path d="M21 48q4 3 8 0M35 48q4 3 8 0" stroke="var(--muted)" stroke-width="2.2" fill="none" stroke-linecap="round"/><text x="44" y="30" font-size="10" font-weight="800" fill="var(--muted)" font-family="sans-serif">z</text></svg>`;
const miniFlame = (n, lit=true) => `<span class="mini ${lit&&n?"":"off"}"><svg viewBox="0 0 64 76"><use href="#flm" fill="${lit&&n?"url(#gF)":"var(--line)"}"/></svg>${n}</span>`;
const hue = id => { let h=0; for (const c of String(id)) h=(h*31+c.charCodeAt(0))%360; return h; };
const avatar = (id,name,crown) => `<span class="av" style="background:linear-gradient(140deg,hsl(${hue(id)} 85% 82%),hsl(${(hue(id)+50)%360} 80% 76%))">${crown?'<span class="crown" aria-hidden="true">👑</span>':""}${esc((name||"?").trim().charAt(0).toUpperCase())}</span>`;

/* ---------- dates & times ---------- */
const ymd = (d,tz) => new Intl.DateTimeFormat("en-CA",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit"}).format(d);
const addDays = (ds,n) => { const t=new Date(ds+"T12:00:00Z"); t.setUTCDate(t.getUTCDate()+n); return t.toISOString().slice(0,10); };
const fmtT = (d,tz) => new Intl.DateTimeFormat("en-GB",{hour:"numeric",minute:"2-digit",hour12:true,timeZone:tz}).format(d).replace(/\s/," ");
const fmtDay = ds => new Date(ds+"T12:00:00Z").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",timeZone:"UTC"});
const fmtShortDT = (d,tz) => new Intl.DateTimeFormat("en-GB",{weekday:"short",hour:"numeric",minute:"2-digit",hour12:true,timeZone:tz}).format(d);
const dur = ms => { const m=Math.max(0,Math.round(ms/60000)); const h=Math.floor(m/60); return h? `${h}h ${m%60}m` : `${m}m`; };
const clock = ms => { const s=Math.max(0,Math.floor(ms/1000)); const h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return `${h}:${String(m).padStart(2,"0")}:${String(x).padStart(2,"0")}`; };
const cfgOf = m => ({city:CITIES[m?.city]?m.city:DEFAULT.city, method:METHODS[m?.method]?m.method:DEFAULT.method, madhab:m?.madhab==="shafi"?"shafi":"hanafi"});
const cache = new Map();
function times(cfg, ds){
  const key = cfg.city+cfg.method+cfg.madhab+ds;
  if (cache.has(key)) return cache.get(key);
  const c = CITIES[cfg.city], [y,mo,d] = ds.split("-").map(Number);
  const co = new adhan.Coordinates(c.lat,c.lng);
  const p = adhan.CalculationMethod[cfg.method]();
  p.madhab = cfg.madhab==="shafi" ? adhan.Madhab.Shafi : adhan.Madhab.Hanafi;
  if (Math.abs(c.lat) > 48) p.highLatitudeRule = adhan.HighLatitudeRule.recommended(co);
  const t = new adhan.PrayerTimes(co,new Date(y,mo-1,d),p);
  const r = {fajr:t.fajr,sunrise:t.sunrise,dhuhr:t.dhuhr,asr:t.asr,maghrib:t.maghrib,isha:t.isha};
  cache.set(key,r); return r;
}
function appDay(cfg, now=new Date()){
  const tz = CITIES[cfg.city].tz, t = ymd(now,tz);
  return now < times(cfg,t).fajr ? addDays(t,-1) : t;
}
const ENDS = {fajr:"sunrise",dhuhr:"asr",asr:"maghrib",maghrib:"isha"};
function waqtEnd(cfg, ds, k){ return ENDS[k] ? times(cfg,ds)[ENDS[k]] : times(cfg,addDays(ds,1)).fajr; }
function chipStart(cfg, ds, k, c){
  const t = times(cfg,ds);
  if (k!=="x") return t[k];
  return c==="t" ? t.isha : c==="a" ? t.maghrib : t.sunrise;
}

/* ---------- data & scoring ---------- */
const meDoc = () => S.members[S.myId];
const isPub = id => S.members[id]?.isPublic !== false;
/* who appears on the leaderboard and squad streak: public members only (you too, if you're public) */
const boardIds = () => Object.keys(S.members).filter(isPub);
function codeOf(id, ds, k){
  if (id===S.myId && S.overlay[ds] && k in S.overlay[ds]) return S.overlay[ds][k];
  return S.members[id]?.days?.[ds]?.[k] || "";
}
function dayState(id, ds, now=new Date()){
  const m = S.members[id]; if (!m || (m.joined && ds < m.joined)) return {s:"na"};
  const cfg = cfgOf(m), t = times(cfg,ds); const open = [];
  for (const p of P){
    if (codeOf(id,ds,p.k).includes("f")) continue;
    const close = new Date(+t[p.k]+DAY);
    if (now >= close) return {s:"miss"};
    if (now >= t[p.k]) open.push({p, close});
  }
  const done = P.every(p => codeOf(id,ds,p.k).includes("f"));
  return {s: done ? "done" : "open", open};
}
function streakOf(id, now=new Date()){
  const m = S.members[id]; if (!m) return 0;
  let n = 0, d = appDay(cfgOf(m),now);
  for (let i=0;i<1500;i++, d=addDays(d,-1)){
    const st = dayState(id,d,now).s;
    if (st==="na" || st==="miss") break;
    if (st==="done") n++;
  }
  return n;
}
function bestStreak(id, now=new Date()){
  const m = S.members[id]; if (!m?.joined) return streakOf(id,now);
  const today = appDay(cfgOf(m),now); let best=0, run=0;
  for (let d=m.joined, i=0; d<=today && i<1500; d=addDays(d,1), i++){
    const st = dayState(id,d,now).s;
    if (st==="done"){ run++; best=Math.max(best,run); } else if (st==="miss") run=0;
  }
  return best;
}
function squadStreak(now=new Date()){
  const ids = boardIds(); if (ids.length < 2) return null;
  let n = 0, d = appDay(cfgOf(S.members[ids[0]]), now);
  for (let i=0;i<1500;i++, d=addDays(d,-1)){
    const active = ids.filter(id => dayState(id,d,now).s !== "na");
    if (active.length < 2) break;
    const sts = active.map(id => dayState(id,d,now).s);
    if (sts.includes("miss")) break;
    if (sts.every(s => s==="done")) n++;
  }
  return n;
}
function dayStats(id, cfg, ds, now){
  let due=0, done=0, pts=0; const t = times(cfg,ds);
  for (const p of P){ const c=codeOf(id,ds,p.k); if (t[p.k] <= now){ due++; if (c.includes("f")) done++; } for (const ch of c) pts += PTS[ch]||0; }
  for (const ch of codeOf(id,ds,"x")) pts += PTS[ch]||0;
  return {due,done,pts};
}
function memberSummary(id, period, now=new Date()){
  const m = S.members[id], cfg = cfgOf(m), today = appDay(cfg,now);
  let start = period==="7" ? addDays(today,-6) : today.slice(0,8)+"01";
  if (m?.joined && m.joined > start) start = m.joined;
  let due=0, done=0, pts=0;
  for (let d=start; d<=today; d=addDays(d,1)){ const s=dayStats(id,cfg,d,now); due+=s.due; done+=s.done; pts+=s.pts; }
  const dots = P.map(p => codeOf(id,today,p.k).includes("f") ? "d" : (now >= waqtEnd(cfg,today,p.k) ? "m" : ""));
  return {due,done,pts,streak:streakOf(id,now),pct:due?done/due*100:null,dots,cfg};
}
function grade(pct){
  if (pct==null) return "–";
  return pct>=95?"A+":pct>=90?"A":pct>=85?"A−":pct>=80?"B+":pct>=75?"B":pct>=70?"B−":pct>=65?"C+":pct>=60?"C":pct>=50?"D":"F";
}

/* ---------- Supabase data layer ---------- */
function rowToMember(r, prev){
  return {name:r.name, city:r.city, method:r.method, madhab:r.madhab, showExtras:r.show_extras, isPublic:r.is_public !== false,
    notifyStart:r.notify_start, notifyEnd:r.notify_end, joined:r.joined, days: prev?.days || {}};
}
function applyLog(r){
  if (r.updated_at && (!S.lastSync || r.updated_at > S.lastSync)) S.lastSync = r.updated_at;
  const m = S.members[r.user_id]; if (!m) return;
  (m.days[r.day] ||= {})[r.waqt] = r.code || "";
}
async function loadAll(){
  const {data:mem, error:e1} = await S.sb.from("members").select("*");
  if (e1) throw e1;
  const next = {};
  for (const r of mem) next[r.id] = rowToMember(r);
  S.members = next;
  const since = addDays(new Date().toISOString().slice(0,10), -HISTORY_DAYS);
  for (let from=0; ; from+=1000){
    const {data, error} = await S.sb.from("logs").select("user_id,day,waqt,code,updated_at").gte("day",since).order("day").range(from, from+999);
    if (error) throw error;
    data.forEach(applyLog);
    if (data.length < 1000) break;
  }
}
/* Coming back to the app: fetch only what changed since we last looked (keeps data use tiny). */
async function syncChanges(){
  if (!S.lastSync){ await loadAll(); return; }
  const {data:mem, error:e1} = await S.sb.from("members").select("*");
  if (e1) throw e1;
  const next = {};
  for (const r of mem) next[r.id] = rowToMember(r, S.members[r.id]);
  S.members = next;
  for (let from=0; ; from+=1000){
    const {data, error} = await S.sb.from("logs").select("user_id,day,waqt,code,updated_at").gt("updated_at", S.lastSync).order("updated_at").range(from, from+999);
    if (error) throw error;
    data.forEach(applyLog);
    if (data.length < 1000) break;
  }
}
let channel = null;
function subscribeLive(){
  if (channel) return;
  channel = S.sb.channel("board")
    .on("postgres_changes",{event:"*",schema:"public",table:"logs"}, ({eventType,new:n,old:o}) => {
      if (eventType==="DELETE"){ const m=S.members[o.user_id]; if (m?.days?.[o.day]) delete m.days[o.day][o.waqt]; }
      else applyLog(n);
      scheduleRender();
    })
    .on("postgres_changes",{event:"*",schema:"public",table:"members"}, ({eventType,new:n,old:o}) => {
      if (eventType==="DELETE") delete S.members[o.id];
      else S.members[n.id] = rowToMember(n, S.members[n.id]);
      scheduleRender();
    });
  if (S.admin) channel.on("postgres_changes",{event:"*",schema:"public",table:"join_requests"}, ({eventType,new:n,old:o}) => {
      if (eventType==="DELETE") S.requests = S.requests.filter(r => r.user_id !== o.user_id);
      else if (!S.requests.some(r => r.user_id === n.user_id)){ S.requests.push(n); toast(`💌 ${n.name} wants to join`); }
      if (S.view==="settings"){ S.forceForm = true; } scheduleRender();
    });
  channel.subscribe();
}
let rT = null;
function scheduleRender(){ clearTimeout(rT); rT = setTimeout(()=>{ if (S.view!=="settings" && S.view!=="alerts") render(); else renderSky(); }, 120); }

/* writes: one batch at a time, debounced */
let pending = {}, writing = false, timer = null;
function queue(ds,k,code){
  (S.overlay[ds] ||= {})[k] = code;
  (pending[ds] ||= {})[k] = code;
  clearTimeout(timer); timer = setTimeout(flush,500);
}
async function flush(){
  if (writing || !Object.keys(pending).length) return;
  writing = true;
  const batch = pending; pending = {};
  const rows = [];
  for (const d in batch) for (const k in batch[d]) rows.push({user_id:S.myId, day:d, waqt:k, code:batch[d][k], updated_at:new Date().toISOString()});
  let ok = false;
  try {
    const {error} = await S.sb.from("logs").upsert(rows,{onConflict:"user_id,day,waqt"});
    if (error) throw error;
    ok = true;
    rows.forEach(applyLog);
  } catch(e){
    if (!navigator.onLine){ for (const d in batch) pending[d] = {...batch[d], ...(pending[d]||{})}; toast("You're offline. Will save when you're back."); }
    else toast("Couldn't save that. Check your connection and try again.");
  } finally {
    writing = false;
    for (const d in batch) for (const k in batch[d]) if (!(pending[d] && k in pending[d]) && S.overlay[d] && (ok || navigator.onLine)) delete S.overlay[d][k];
    if (Object.keys(pending).length) setTimeout(flush, 3000);
    render();
  }
}
addEventListener("online", () => flush());
function toast(msg){ const t=$("toast"); t.textContent=msg; t.hidden=false; clearTimeout(toast.t); toast.t=setTimeout(()=>t.hidden=true,4200); }

/* ---------- confetti ---------- */
function celebrate(){
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = $("fx"); cv.hidden = false; const dpr = devicePixelRatio||1;
  cv.width = innerWidth*dpr; cv.height = innerHeight*dpr; const g = cv.getContext("2d"); g.scale(dpr,dpr);
  const cs = getComputedStyle(document.documentElement);
  const cols = ["--gold","--rose","--accent","--lav"].map(v=>cs.getPropertyValue(v).trim()).concat("#FFE28A","#7B6CF6");
  const ps = Array.from({length:110},()=>({x:innerWidth/2,y:innerHeight*0.35,vx:(Math.random()-.5)*11,vy:-Math.random()*11-4,r:Math.random()*5+3,c:cols[Math.floor(Math.random()*cols.length)],a:Math.random()*6,s:Math.random()*.3-.15}));
  const t0 = performance.now();
  (function f(t){
    const k = (t-t0)/1600; g.clearRect(0,0,innerWidth,innerHeight);
    for (const p of ps){ p.vy+=.32; p.x+=p.vx; p.y+=p.vy; p.vx*=.99; p.a+=p.s; g.save(); g.globalAlpha=Math.max(0,1-k); g.translate(p.x,p.y); g.rotate(p.a); g.fillStyle=p.c; g.fillRect(-p.r/2,-p.r/4,p.r,p.r/2); g.restore(); }
    if (k<1) requestAnimationFrame(f); else { g.clearRect(0,0,innerWidth,innerHeight); cv.hidden = true; }
  })(t0);
}

/* ---------- sky hero ---------- */
function renderSky(){
  const m = meDoc(), cfg = cfgOf(m), c = CITIES[cfg.city], now = new Date();
  const today = appDay(cfg,now), t = times(cfg,today), nextT = times(cfg,addDays(today,1));
  const seq = [["fajr",t.fajr],["sunrise",t.sunrise],["dhuhr",t.dhuhr],["asr",t.asr],["maghrib",t.maghrib],["isha",t.isha],["fajr",nextT.fajr]];
  let i = 0; for (let j=0;j<seq.length-1;j++) if (seq[j][1] <= now) i = j;
  const cur = seq[i][0], endAt = seq[i+1][1], startAt = seq[i][1];
  // Isha lasts until Fajr. The last third of the night (Maghrib→Fajr) is the best time for tahajjud.
  const lastThird = new Date(+nextT.fajr - (nextT.fajr - t.maghrib)/3);
  const late = cur==="isha" && now >= lastThird;
  const N = {fajr:["Fajr","ফজর","fajr"],sunrise:["Ishraq & Duha","ইশরাক","morning"],dhuhr:["Dhuhr","যোহর","dhuhr"],asr:["Asr","আসর","asr"],maghrib:["Maghrib","মাগরিব","maghrib"],isha:["Isha","এশা","isha"]};
  const [n, bn, cls] = N[cur];
  const nextName = i+1===6 ? "Fajr" : (N[seq[i+1][0]]?.[0] || "");
  const pct = Math.min(100, (now-startAt)/(endAt-startAt)*100);
  let hijri = ""; try { hijri = new Intl.DateTimeFormat("en-GB-u-ca-islamic-umalqura",{day:"numeric",month:"long",year:"numeric"}).format(now); } catch {}
  const beads = P.map(p => {
    const done = codeOf(S.myId,today,p.k).includes("f"), isCur = cur===p.k, miss = !done && now >= waqtEnd(cfg,today,p.k);
    return `<div class="bead ${done?"done":""} ${isCur?"cur":""} ${miss?"miss":""}"><b>${done?"✓":""}</b><span>${p.en}</span><span class="t">${fmtT(t[p.k],c.tz).replace(/ ?[ap]m/i,"")}</span></div>`;
  }).join("");
  const sky = $("sky");
  const isFardh = P.some(p=>p.k===cur);
  const fresh = isFardh && now - startAt < 20*60e3 && !codeOf(S.myId,today,cur).includes("f");
  const alert = fresh ? `<div class="alert" role="status"><span>🌸 It's ${n} time!</span>${meDoc() && !S.readOnly ? `<button data-act="tog" data-ds="${today}" data-k="${cur}" data-c="f">I prayed ✓</button>` : ""}</div>` : "";
  const waqtKey = today + cur + late;
  if (S.lastWaqt && S.lastWaqt !== waqtKey && isFardh) toast(`🌸 It's ${n} time! Go pray, then tap Fardh.`);
  S.lastWaqt = waqtKey;
  const countHtml = `${clock(endAt-now)}<small>${cur==="sunrise" ? "No fardh namaz now · until Dhuhr" : `left in this waqt · ${nextName} at ${fmtT(endAt,c.tz)}`}</small>`;
  const key = waqtKey + beads + alert + hijri + c.name;
  if (key === S.skyKey){ sky.querySelector(".count").innerHTML = countHtml; sky.querySelector(".prog i").style.width = pct.toFixed(1)+"%"; return; }
  S.skyKey = key;
  sky.className = "sky sky-" + (late ? "night" : cls);
  sky.innerHTML = `<i class="spark" style="top:14%;right:16%;font-size:18px">✦</i><i class="spark" style="top:44%;right:8%;font-size:12px;animation-delay:.9s">✦</i><i class="spark" style="top:30%;right:32%;font-size:10px;animation-delay:1.6s">✦</i><div class="row1"><span>${c.name} · ${fmtDay(ymd(now,c.tz))}</span><span>${esc(hijri)}</span></div>
    <div class="now"><h2>${cur==="sunrise" ? "Ishraq & Duha" : n}</h2><span class="bn">${bn}</span></div>
    ${cur==="isha" ? `<div class="sub">${late ? "🌙 Last third of the night · best time for tahajjud" : `🌙 Tahajjud's best time starts ${fmtT(lastThird,c.tz)}`}</div>` : ""}
    <div class="count num" role="timer">${countHtml}</div>
    <div class="prog"><i style="width:${pct.toFixed(1)}%"></i></div>
    <div class="beads">${beads}</div>${alert}`;
}

/* ---------- streak card & friends ---------- */
function streakCard(){
  const m = meDoc(); if (!m) return "";
  const now = new Date(), cfg = cfgOf(m), tz = CITIES[cfg.city].tz, today = appDay(cfg,now);
  const n = streakOf(S.myId,now), st = dayState(S.myId,today,now), ys = dayState(S.myId,addDays(today,-1),now);
  const open = [...(ys.open||[]), ...(st.open||[])].sort((a,b)=>a.close-b.close);
  const doneToday = P.filter(p => codeOf(S.myId,today,p.k).includes("f")).length;
  const lit = st.s==="done";
  const nextClose = open[0]?.close, risk = n>0 && nextClose && nextClose-now < 3*H;
  let head, msg;
  if (lit){ head = `${n}-day streak`; msg = "All 5 fardh done today. Your streak is safe."; }
  else if (open.length){ head = n ? `${n}-day streak` : "Start a streak"; msg = `Log ${open[0].p.en} by ${fmtShortDT(open[0].close,tz)} ${n?"to keep it":"to stay on track"}.`; }
  else if (n){ head = `${n}-day streak`; msg = `${doneToday} of 5 fardh today. Keep going to add day ${n+1}.`; }
  else { head = "Start a streak"; msg = "Pray all 5 fardh in a day to light the flame."; }
  const week = Array.from({length:7},(_,i)=>{
    const d = addDays(today,i-6), s = dayState(S.myId,d,now).s;
    const wd = new Date(d+"T12:00:00Z").toLocaleDateString("en-GB",{weekday:"narrow",timeZone:"UTC"});
    return `<div class="wd ${s} ${i===6?"today":""}" title="${fmtDay(d)}"><i>${s==="done"?`<svg viewBox="0 0 64 76"><use href="#flm" fill="url(#gF)"/></svg>`:""}</i>${wd}</div>`;
  }).join("");
  return `<section class="streak" aria-label="Your streak">
    <div class="flame ${lit?"lit":"dim"}">${flameSvg(lit || n>0)}<span class="n num">${n}</span>${risk?`<span class="hg" title="Streak ends soon">⌛</span>`:""}</div>
    <div><h3>${head}</h3><p class="msg ${risk?"risk":""}" style="margin:2px 0 0">${msg}</p>${visPill()}</div>
    <div class="week">${week}</div></section>`;
}
function visPill(){
  const pub = isPub(S.myId), sure = S.confirmVis;
  const label = sure ? (pub ? "Make private? Tap again" : "Make public? Tap again") : (pub ? "🌸 Public" : "🔒 Private");
  return `<button class="vispill ${sure?"sure":""}" data-act="vis" title="${pub?"Friends can see your namaz":"Only you can see your namaz"}">${label}</button>`;
}
function friendsStrip(){
  const ids = Object.keys(S.members).filter(id => id===S.myId || isPub(id)); if (!ids.length) return "";
  const now = new Date();
  const rows = ids.map(id => { const m=S.members[id], cfg=cfgOf(m), today=appDay(cfg,now);
    return {id, m, n:P.filter(p=>codeOf(id,today,p.k).includes("f")).length, s:streakOf(id,now)}; })
    .sort((a,b)=> (b.id===S.myId)-(a.id===S.myId) || b.s-a.s || b.n-a.n);
  return `<section class="friends"><div class="sechead"><h3>Everyone's streaks</h3><p>${isPub(S.myId)?"Ring = today's fardh":"🔒 You're private: only you see your ring"}</p></div><div class="fstrip">${rows.map(r=>`
    <button class="fr" data-act="openfr" data-id="${esc(r.id)}" aria-label="${esc(r.m.name||"Someone")}: ${r.s}-day streak, ${r.n} of 5 fardh today">
      <span class="ring ${r.n===5?"full":""}" style="--p:${r.n*20}%">${avatar(r.id,r.m.name)}<span class="cnt num">${r.n}/5</span></span>
      <span class="fn">${r.id===S.myId?(isPub(r.id)?"You":"You 🔒"):esc(r.m.name||"Someone")}</span>${miniFlame(r.s)}</button>`).join("")}</div></section>`;
}

/* ---------- views ---------- */
function viewToday(){
  const m = meDoc(), cfg = cfgOf(m), tz = CITIES[cfg.city].tz, now = new Date();
  const today = appDay(cfg,now), ds = addDays(today,-S.dayOff), t = times(cfg,ds);
  const canLog = !!m && !S.readOnly;
  let html = requestsNudge() + streakCard() + alertsNudge() + friendsStrip();
  html += `<div class="sechead"><h3>${S.dayOff ? "Yesterday's namaz" : "Today's namaz"}</h3>
    <div class="seg"><button data-act="day" data-d="0" aria-pressed="${!S.dayOff}">Today</button><button data-act="day" data-d="1" aria-pressed="${!!S.dayOff}">Yesterday</button></div></div><div class="list">`;
  for (const p of P){
    const st = t[p.k], end = waqtEnd(cfg,ds,p.k), close = new Date(+st+DAY), code = codeOf(S.myId,ds,p.k);
    const future = now < st, live = now >= st && now < end, locked = now >= close, prayed = code.includes("f");
    const tag = prayed ? `<span class="tag ok">MashaAllah ✨</span>` : future ? `<span class="tag">Upcoming</span>` : live ? `<span class="tag live">Now · ${dur(end-now)} left</span>` : locked ? `<span class="tag">Locked</span>` : `<span class="tag warn">Not logged</span>`;
    const dis = (!canLog || future || locked) ? "disabled" : "";
    html += `<article class="pr ${p.k} ${live?"current":""} ${future?"future":""}">
      <span class="orb ${p.k}" aria-hidden="true"></span>
      <div class="nm"><h3>${p.en}</h3><span class="bn">${p.bn}</span></div>
      <div class="range num"><span>${fmtT(st,tz)} – ${fmtT(end,tz)}</span>${tag}</div>
      <div class="chips"><button class="fard ${prayed?"on":""} ${S.pop===ds+p.k+"f"?"pop":""}" data-act="tog" data-ds="${ds}" data-k="${p.k}" data-c="f" aria-pressed="${prayed}" aria-label="${p.en} fardh, ${p.f} rakat" ${dis}><span class="box" aria-hidden="true">${prayed?`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`:""}</span>${prayed?"Fardh prayed":"Fardh"}<small>${p.f}</small></button>${p.chips.map(([c,l,r])=>`<button class="chip ${code.includes(c)?"on":""}" data-act="tog" data-ds="${ds}" data-k="${p.k}" data-c="${c}" aria-pressed="${code.includes(c)}" ${dis}>${l}<small>${r}</small></button>`).join("")}</div>
      ${!future && !locked && !prayed && !live ? `<p class="note warn">Log by ${fmtShortDT(close,tz)} or it locks and your streak breaks.</p>` : ""}
    </article>`;
  }
  const xc = codeOf(S.myId,ds,"x"), nf = times(cfg,addDays(ds,1)).fajr;
  html += `<article class="pr x"><span class="orb x" aria-hidden="true"></span>
    <div class="nm"><h3>${X.en}</h3><span class="bn">${X.bn}</span></div>
    <div class="range num">Last third of the night from ${fmtT(new Date(+nf-(nf-t.maghrib)/3),tz)}</div>
    <div class="chips">${X.chips.map(([c,l])=>{ const st=chipStart(cfg,ds,"x",c); const off=!canLog||now<st||now>=new Date(+st+DAY); return `<button class="chip ${xc.includes(c)?"on":""}" data-act="tog" data-ds="${ds}" data-k="x" data-c="${c}" aria-pressed="${xc.includes(c)}" ${off?"disabled":""}>${l}</button>`; }).join("")}</div></article>`;
  html += `</div><p class="note foot">Each namaz can be logged for 24 hours after its waqt begins. Only fardh counts toward your streak.</p>`;
  return html;
}
function viewBoard(){
  const ids = boardIds();
  const privNote = isPub(S.myId) ? "" : `<div class="notice"><span>🔒 <b>You're in private mode.</b> Your namaz log is only visible to you, and you're not on the leaderboard.</span><button class="ghost" data-act="settings">Change</button></div>`;
  if (!ids.length) return privNote + `<div class="panel empty">No one is sharing publicly yet.</div>`;
  const rows = ids.map(id => ({id, m:S.members[id], s:memberSummary(id,S.period)}));
  rows.sort((a,b)=> (b.s.pct??-1)-(a.s.pct??-1) || b.s.streak-a.s.streak || b.s.done-a.s.done);
  let html = privNote;
  const sq = squadStreak();
  if (sq !== null) html += `<section class="squad"><div class="flame ${sq?"lit":""}">${flameSvg(true)}<span class="n num">${sq}</span></div>
    <div><h3>Squad streak · ${sq} day${sq===1?"":"s"}</h3><p>${sq ? "Days in a row where every one of you prayed all 5 fardh." : "Light it together: everyone prays all 5 fardh in the same day."}</p></div></section>`;
  html += `<div class="sechead"><h3>${S.period==="7"?"Last 7 days":"This month"}</h3>
    <div class="seg"><button data-act="period" data-p="7" aria-pressed="${S.period==="7"}">7 days</button><button data-act="period" data-p="month" aria-pressed="${S.period==="month"}">Month</button></div></div>`;
  if (rows.length >= 3){
    const order = [rows[1],rows[0],rows[2]], cls = ["p2","p1","p3"], place = ["2nd","1st","3rd"];
    html += `<div class="podium">${order.map((r,i)=>`<div class="pod ${cls[i]}">${avatar(r.id,r.m.name,i===1)}<span class="nm">${esc(r.m.name||"Someone")}</span>
      <div class="blk"><span class="g">${grade(r.s.pct)}</span>${miniFlame(r.s.streak)}<span class="pl">${place[i]}</span></div></div>`).join("")}</div>`;
  }
  html += `<div class="list">`;
  rows.forEach((r,i) => {
    const showX = r.m.showExtras !== false || r.id===S.myId, low = r.s.pct!=null && r.s.pct<70;
    html += `<div class="person"><button data-act="open" data-id="${esc(r.id)}" aria-expanded="${S.open===r.id}">
      <span class="rank">${i+1}</span>${avatar(r.id,r.m.name)}
      <span style="min-width:0"><span class="pname">${esc(r.m.name||"Someone")}${r.id===S.myId?'<span class="you">you</span>':""}${miniFlame(r.s.streak)}</span>
        <span class="bar"><i style="width:${r.s.pct??0}%"></i></span>
        <span class="pstats num"><span>${r.s.done}/${r.s.due} fardh</span>${showX?`<span>${r.s.pts} pts</span>`:""}<span class="dots" title="Today's fardh">${r.s.dots.map(d=>`<i class="${d}"></i>`).join("")}</span></span></span>
      <span class="grade ${low?"low":""}">${grade(r.s.pct)}</span></button>
      ${S.open===r.id ? `<div class="detail">${gradesheet(r.id)}</div>` : ""}</div>`;
  });
  html += `</div><p class="note foot">Ranked by fardh prayed out of fardh due. Points: fardh 10, sunnah or witr 3, tahajjud 5, other nafl 2. Tap anyone to see their gradesheet.</p>`;
  return html;
}
function gradesheet(id){
  const m = S.members[id], cfg = cfgOf(m), now = new Date(), today = appDay(cfg,now);
  let start = today.slice(0,8)+"01"; if (m?.joined && m.joined > start) start = m.joined;
  const showX = m.showExtras !== false || id===S.myId;
  const per = P.map(p => ({p, due:0, done:0, s:0})); let tah=0, nights=0;
  for (let d=start; d<=today; d=addDays(d,1)){
    const t = times(cfg,d);
    per.forEach(o => { if (t[o.p.k] <= now){ o.due++; const c=codeOf(id,d,o.p.k); if (c.includes("f")) o.done++; if (c.includes("s")) o.s++; } });
    nights++; if (codeOf(id,d,"x").includes("t")) tah++;
  }
  const month = new Date(today+"T12:00:00Z").toLocaleDateString("en-GB",{month:"long",timeZone:"UTC"});
  let h = `<div class="label">${month} gradesheet</div><table class="gs num"><thead><tr><th>Waqt</th><th>Fardh</th>${showX?"<th>Sunnah</th>":""}<th>Grade</th></tr></thead><tbody>`;
  per.forEach(o => { const pct = o.due ? o.done/o.due*100 : null;
    h += `<tr><td>${o.p.en}<span class="bn">${o.p.bn}</span></td><td>${o.done}/${o.due}</td>${showX?`<td>${o.s}/${o.due}</td>`:""}<td class="g">${grade(pct)}</td></tr>`; });
  h += `</tbody></table>`;
  if (showX) h += `<p class="note">Tahajjud on ${tah} of ${nights} nights this month.</p>`;
  return h + `<div class="label">Last 12 weeks</div>` + heatmap(id);
}
function heatmap(id){
  const m = S.members[id], cfg = cfgOf(m), now = new Date(), today = appDay(cfg,now);
  const dow = new Date(today+"T12:00:00Z").getUTCDay(), end = addDays(today, 6-dow), start = addDays(end, -83);
  let cells = "";
  for (let d=start; d<=end; d=addDays(d,1)){
    if (d > today || (m?.joined && d < m.joined)){ cells += `<i class="${d>today?"x":""}"></i>`; continue; }
    const n = P.filter(p => codeOf(id,d,p.k).includes("f")).length;
    cells += `<i class="${n?"h"+n:""}" title="${fmtDay(d)}: ${n}/5 fardh"></i>`;
  }
  return `<div class="heat" role="img" aria-label="Daily fardh count, last 12 weeks">${cells}</div>
    <div class="legend">0 <i style="background:var(--off)"></i><i style="background:color-mix(in srgb,var(--accent) 20%,var(--off))"></i><i style="background:color-mix(in srgb,var(--accent) 54%,var(--off))"></i><i style="background:var(--accent)"></i> 5 fardh</div>`;
}
function viewMe(){
  const m = meDoc();
  const s7 = memberSummary(S.myId,"7"), sm = memberSummary(S.myId,"month"), best = bestStreak(S.myId);
  return streakCard() + `<div class="panel"><div class="brand">${avatar(S.myId,m.name)}<div><h3>${esc(m.name)}</h3><p class="note">${CITIES[cfgOf(m).city].name} · ${cfgOf(m).madhab==="hanafi"?"Hanafi Asr":"Standard Asr"}</p></div><span class="grade" style="margin-left:auto">${grade(sm.pct)}</span></div>
    <div class="tiles num"><div class="tile"><b>${s7.pct==null?"–":Math.round(s7.pct)+"%"}</b><span>Fardh, 7 days</span></div><div class="tile"><b>${best}</b><span>Best streak</span></div><div class="tile"><b>${sm.pts}</b><span>Points this month</span></div></div>
    ${gradesheet(S.myId)}</div>`;
}
function viewSettings(){
  const m = meDoc() || {}, cfg = cfgOf(m), isNew = !meDoc();
  const guessName = S.myRequest?.name || S.session?.user?.user_metadata?.given_name || (S.session?.user?.user_metadata?.full_name||"").split(" ")[0] || "";
  const reqTop = S.admin && S.requests.length ? adminPanel().split('<section class="panel" id="manage">')[0] : "";
  return reqTop + `<form class="panel" id="setupForm"><h3>${isNew?"Join the board 🌸":"Your settings"}</h3>
    <p>Namaz times are worked out for your own city, so each person can be somewhere different.</p>
    <label class="f">Name on the board<input id="f-name" maxlength="24" required value="${esc(m.name||guessName)}" placeholder="e.g. Shupti"></label>
    <div class="grid2">
      <label class="f">City<select id="f-city">${Object.entries(CITIES).map(([k,c])=>`<option value="${k}" ${k===cfg.city?"selected":""}>${c.name}</option>`).join("")}</select></label>
      <label class="f">Asr time<select id="f-madhab"><option value="hanafi" ${cfg.madhab==="hanafi"?"selected":""}>Hanafi (later)</option><option value="shafi" ${cfg.madhab==="shafi"?"selected":""}>Standard (earlier)</option></select></label>
    </div>
    <label class="f">Fajr & Isha method<select id="f-method">${Object.entries(METHODS).map(([k,l])=>`<option value="${k}" ${k===cfg.method?"selected":""}>${l}</option>`).join("")}</select></label>
    <p class="note">In Bangladesh use Karachi. In the UK use Moonsighting Committee.</p>
    <fieldset class="vis"><legend>Who can see my namaz</legend>
      <label><input type="radio" name="f-vis" id="f-public" value="public" ${m.isPublic!==false?"checked":""}><span><b>🌸 Public</b><small>Friends see my streak, logs and grade. I'm on the leaderboard.</small></span></label>
      <label><input type="radio" name="f-vis" id="f-private" value="private" ${m.isPublic===false?"checked":""}><span><b>🔒 Private</b><small>Only I see my log. I still get streaks, alerts and my own gradesheet.</small></span></label>
    </fieldset>
    <label class="check" id="extrasRow"><input type="checkbox" id="f-extras" ${m.showExtras!==false?"checked":""}> Show my sunnah, nafl and tahajjud too (public only)</label>
    <div class="btns"><button class="primary" type="submit">${isNew?"Join":"Save"}</button>${isNew?"":`<button class="ghost" type="button" data-act="tab" data-tab="today">Cancel</button>`}</div>
  </form>
  ${S.admin && !S.requests.length ? adminPanel() : S.admin ? adminPanel().replace(/^[\s\S]*?(<section class="panel" id="manage">)/,"$1") : ""}
  <div class="panel"><p class="note">Signed in as ${esc(S.email)}</p><div class="btns"><button class="ghost" type="button" data-act="signout">Sign out</button></div></div>`;
}
function requestsNudge(){
  if (!S.admin || !S.requests.length) return "";
  const n = S.requests.length;
  return `<div class="notice req"><span>💌 <b>${n} ${n===1?"person wants":"people want"} to join</b> · ${esc(S.requests.slice(0,3).map(r=>r.name).join(", "))}</span><button class="primary" data-act="settings">Review</button></div>`;
}
const ago = iso => { const m = Math.round((Date.now()-new Date(iso))/60000); return m<60 ? `${Math.max(1,m)} min ago` : m<1440 ? `${Math.round(m/60)} h ago` : `${Math.round(m/1440)} d ago`; };
function adminPanel(){
  const ids = Object.keys(S.members);
  const reqs = S.requests.length ? S.requests.map(r => `<div class="reqrow"><div class="who"><b>${esc(r.name)}</b><small>${esc(r.email)} · ${ago(r.created_at)}</small>${r.note?`<p>“${esc(r.note)}”</p>`:""}</div>
      <div class="btns"><button type="button" class="primary" data-act="approve" data-id="${esc(r.user_id)}">Approve</button><button type="button" class="ghost" data-act="decline" data-id="${esc(r.user_id)}">Decline</button></div></div>`).join("")
    : `<p class="note">No requests right now. When someone signs in and asks to join, they'll appear here and you'll get a notification.</p>`;
  return requestsPanel(reqs) + managePanel(ids);
}
function requestsPanel(reqs){
  return `<section class="panel" id="requests"><h3>Join requests 💌${S.requests.length?` <span class="count-badge">${S.requests.length}</span>`:""}</h3>
    <p>Share the app link. People sign in with Google and ask to join. You approve them here.</p>
    <div class="mlist">${reqs}</div></section>`;
}
function managePanel(ids){
  return `<section class="panel" id="manage"><h3>Or invite directly</h3><p>Add a Gmail address and that person can join straight away, without asking.</p>
    <form class="invite" id="inviteForm"><input id="f-invite" type="email" required placeholder="friend@gmail.com" autocomplete="off"><button class="primary" type="submit">Invite</button></form>
    <div class="mlist">${S.invites.map(e => `<div class="mrow"><span class="n">${esc(e)}</span><button type="button" data-act="uninvite" data-e="${esc(e)}">Remove</button></div>`).join("") || `<p class="note">No invites yet.</p>`}</div>
    <h3 style="margin-top:6px">Members</h3><p>Removing someone deletes their log for good.</p>
    <div class="mlist">${ids.map(id => `<div class="mrow">${avatar(id,S.members[id].name)}<span class="n">${esc(S.members[id].name||"Someone")}${S.members[id].isPublic===false?" 🔒":""}${id===S.myId?" (you)":""}</span>
      ${id===S.myId ? "" : `<button type="button" data-act="rm" data-id="${esc(id)}" class="${S.confirmRm===id?"sure":""}">${S.confirmRm===id?"Tap to confirm":"Remove"}</button>`}</div>`).join("")}</div></section>`;
}

/* ---------- notifications ---------- */
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const pushSupported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
S.pushOn = false;
async function checkPush(){
  if (!pushSupported || !S.swReg) return;
  try { const sub = await S.swReg.pushManager.getSubscription(); S.pushOn = !!sub && Notification.permission === "granted"; if (sub && S.myId) saveSub(sub); } catch {}
}
async function saveSub(sub){
  const j = sub.toJSON();
  await S.sb.from("push_subscriptions").upsert({endpoint:j.endpoint, user_id:S.myId, p256dh:j.keys.p256dh, auth:j.keys.auth},{onConflict:"endpoint"});
}
function b64ToBytes(b64){ const p="=".repeat((4-b64.length%4)%4); const s=atob((b64+p).replace(/-/g,"+").replace(/_/g,"/")); return Uint8Array.from(s,c=>c.charCodeAt(0)); }
async function enablePush(){
  if (!S.swReg){ toast("The app is still starting. Try again in a moment."); return; }
  const perm = await Notification.requestPermission();
  if (perm !== "granted"){ toast("Notifications are blocked. Allow them in your phone's settings for this app."); render(); return; }
  try {
    const sub = (await S.swReg.pushManager.getSubscription()) || await S.swReg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:b64ToBytes(CONF.vapidPublicKey)});
    await saveSub(sub); S.pushOn = true; toast("Alerts on 🔔 You'll get a notification for each namaz.");
  } catch(e){ toast("Couldn't turn on alerts: " + (e?.message || "unknown error")); }
  render();
}
async function disablePush(){
  try { const sub = await S.swReg?.pushManager.getSubscription(); if (sub){ await S.sb.from("push_subscriptions").delete().eq("endpoint", sub.endpoint); await sub.unsubscribe(); } } catch {}
  S.pushOn = false; toast("Alerts off on this phone"); render();
}
async function testPush(){
  try {
    const {data, error} = await S.sb.functions.invoke("notify",{body:{test:true}});
    if (!error){ toast(data?.sent ? "Test sent. It should arrive in a few seconds." : "The function ran but found no alert subscription for you. Tap Turn off, then turn alerts on again."); return; }
    let why = error.message || "unknown error";
    try { const r = error.context; if (r){ const t = await r.text(); why = `HTTP ${r.status}: ${t.slice(0,160)}`; } } catch {}
    if (/Failed to send a request|FunctionsFetchError/i.test(why) || /404/.test(why)) why += " (is a function named 'notify' deployed?)";
    toast("Test failed · " + why);
  } catch(e){ toast("Test failed · " + (e?.message || "check your connection")); }
}
function alertsNudge(){
  if (!meDoc() || S.pushOn || !pushSupported && !isIOS) return "";
  try { if (localStorage.getItem("nb-nudge-hide")==="1") return ""; } catch {}
  return `<div class="notice"><span>🔔 <b>Get a ping for every namaz</b>, even when your phone is locked.</span><div class="btns"><button class="primary" data-act="tab" data-tab="alerts">Set up</button><button class="ghost" data-act="hidenudge">Later</button></div></div>`;
}
function viewAlerts(){
  const m = meDoc();
  let body;
  if (isIOS && !standalone){
    body = `<p>On iPhone, alerts only work once Namaz Board is on your home screen:</p>
      <ol class="steps"><li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button (square with an arrow).</li><li>Tap <b>Add to Home Screen</b>, then <b>Add</b>.</li><li>Open Namaz Board from your home screen and come back here.</li></ol>
      <p class="note">Needs iOS 16.4 or newer.</p>`;
  } else if (!pushSupported){
    body = `<p>This browser can't receive notifications. On Android use Chrome; on iPhone use Safari and add the app to your home screen.</p>`;
  } else if (Notification.permission === "denied"){
    body = `<p>Notifications are blocked for this app. Open your phone's settings for Namaz Board (or this site in your browser), allow notifications, then come back.</p>`;
  } else if (!S.pushOn){
    body = `<p>Turn on alerts on this phone. You can do this on each device you use.</p><div class="btns"><button class="primary" data-act="pushon">Turn on alerts 🔔</button></div>`;
  } else {
    body = `<p class="okline">🔔 Alerts are on for this phone.</p><div class="btns"><button class="primary" data-act="pushtest">Send a test</button><button class="ghost" data-act="pushoff">Turn off on this phone</button></div>`;
  }
  return `<section class="panel"><h3>Namaz alerts</h3>${body}</section>
    <section class="panel"><h3>What to send me</h3>
      <label class="tog"><input type="checkbox" id="n-start" data-act="ntoggle" ${m.notifyStart!==false?"checked":""}><span><b>When each waqt starts</b><br><small>“🌸 It's Asr time · ends 5:14 pm”</small></span></label>
      <label class="tog"><input type="checkbox" id="n-end" data-act="ntoggle" ${m.notifyEnd!==false?"checked":""}><span><b>Streak saver</b><br><small>30 min before a waqt ends, only if you haven't logged its fardh</small></span></label>
      <p class="note">Alerts use your city and times from Settings. Most phones also show them on a smartwatch.</p></section>`;
}

/* ---------- auth screens ---------- */
function viewLogin(){
  return `<section class="panel hero-login"><h3>Pray together, streak together 🔥</h3>
    <p>Log your five daily namaz, keep your streak alive, and see how your friends are doing.</p>
    <button class="gbtn" data-act="google"><svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Continue with Google</button>
    <p class="note">New here? Sign in and tap <b>Ask to join</b>. ${esc(CONF.ownerName||"The board owner")} will approve you.</p></section>`;
}
function viewNotInvited(){
  const owner = esc(CONF.ownerName||"the board owner");
  if (S.myRequest) return `<section class="panel hero-login"><h3>Request sent 💌</h3>
    <p>${owner} has been asked to let <b>${esc(S.myRequest.name)}</b> in. This page opens the board by itself once you're approved, so you can close it and come back later.</p>
    <div class="waiting" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="btns"><button class="ghost" data-act="cancelreq">Cancel request</button><button class="ghost" data-act="signout">Use another account</button></div>
    <p class="note">Signed in as ${esc(S.email)}</p></section>`;
  const meta = S.session?.user?.user_metadata || {};
  const guess = meta.given_name || (meta.full_name||"").split(" ")[0] || "";
  return `<form class="panel" id="reqForm"><h3>Ask to join 🌸</h3>
    <p>Namaz Board is invite only. Send a request and ${owner} will approve it.</p>
    <label class="f">Your name<input id="r-name" maxlength="40" required value="${esc(guess)}"></label>
    <label class="f">Message (optional)<input id="r-note" maxlength="200" placeholder="Salaam! It's Raisa from uni"></label>
    <div class="btns"><button class="primary" type="submit">Ask to join</button><button class="ghost" type="button" data-act="signout">Use another account</button></div>
    <p class="note">Signed in as ${esc(S.email)}</p></form>`;
}

/* ---------- render ---------- */
function render(){
  renderSky();
  const member = !!meDoc();
  document.querySelector(".nav").hidden = !member;
  document.querySelectorAll(".nav button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab===S.view)));
  $("settingsBtn").hidden = !member; $("bellBtn").hidden = !member;
  if (S.admin && S.requests.length) $("settingsBtn").dataset.badge = S.requests.length; else delete $("settingsBtn").dataset.badge;
  $("bellBtn").classList.toggle("on", S.pushOn);
  $("hello").textContent = meDoc()?.name ? `Assalamu alaikum, ${meDoc().name} ✨` : "Assalamu alaikum ✨";
  const main = $("main");
  if (S.phase==="boot"){ main.innerHTML = `<div class="empty">${esc(S.err || "Loading…")}</div>`; return; }
  if (S.phase==="config"){ main.innerHTML = `<div class="panel"><h3>Almost there</h3><p>Fill in <b>config.js</b> with your Supabase URL, key and VAPID public key, then reload.</p></div>`; return; }
  if (S.phase==="login"){ main.innerHTML = viewLogin(); return; }
  if (S.phase==="uninvited"){ main.innerHTML = viewNotInvited(); return; }
  if (S.phase==="join" || S.view==="settings"){
    if (!main.querySelector("#setupForm") || S.forceForm){ S.forceForm = false; main.innerHTML = viewSettings(); }
    return;
  }
  main.innerHTML = S.view==="today" ? viewToday() : S.view==="board" ? viewBoard() : S.view==="alerts" ? viewAlerts() : viewMe();
  S.pop = "";
}

/* ---------- events ---------- */
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act],[data-tab]"); if (!b || b.disabled) return;
  const a = b.dataset.act;
  if (a==="ntoggle") return; // handled on change
  if (!a || a==="tab"){ S.view = b.dataset.tab; render(); scrollTo({top:0}); return; }
  if (a==="google"){
    const {error} = await S.sb.auth.signInWithOAuth({provider:"google", options:{redirectTo: location.origin + location.pathname}});
    if (error) toast("Google sign-in isn't set up yet: " + error.message);
  }
  else if (a==="signout"){ await S.sb.auth.signOut(); location.reload(); }
  else if (a==="recheck"){ await afterAuth(); }
  else if (a==="cancelreq"){
    const {error} = await S.sb.from("join_requests").delete().eq("user_id", S.myId);
    if (error) toast("Couldn't cancel. Try again."); else { S.myRequest = null; render(); }
  }
  else if (a==="approve"){
    b.disabled = true; const r = S.requests.find(x => x.user_id === b.dataset.id);
    const {error} = await S.sb.rpc("approve_request",{uid:b.dataset.id});
    if (error){ toast("Couldn't approve: " + error.message); b.disabled = false; return; }
    S.requests = S.requests.filter(x => x.user_id !== b.dataset.id);
    if (r && !S.invites.includes(r.email)) S.invites.push(r.email);
    toast(`Approved ${r?.name || ""} ✨ They're in.`); S.forceForm = true; render();
  }
  else if (a==="decline"){
    b.disabled = true;
    const {error} = await S.sb.from("join_requests").delete().eq("user_id", b.dataset.id);
    if (error){ toast("Couldn't decline. Try again."); b.disabled = false; return; }
    S.requests = S.requests.filter(x => x.user_id !== b.dataset.id); toast("Request declined"); S.forceForm = true; render();
  }
  else if (a==="settings"){ S.view = "settings"; S.forceForm = true; render(); scrollTo({top:0}); }
  else if (a==="bell"){ S.view = "alerts"; render(); scrollTo({top:0}); }
  else if (a==="pushon") enablePush();
  else if (a==="pushoff") disablePush();
  else if (a==="pushtest") testPush();
  else if (a==="hidenudge"){ try { localStorage.setItem("nb-nudge-hide","1"); } catch {} render(); }
  else if (a==="vis"){
    if (!S.confirmVis){ S.confirmVis = true; render(); clearTimeout(S.visT); S.visT = setTimeout(()=>{ S.confirmVis = false; render(); }, 4000); return; }
    clearTimeout(S.visT); S.confirmVis = false;
    const to = !isPub(S.myId);
    const {error} = await S.sb.from("members").update({is_public:to}).eq("id", S.myId);
    if (error) toast("Couldn't change that. Try again in a moment.");
    else { meDoc().isPublic = to; toast(to ? "🌸 You're public. Friends can see your namaz." : "🔒 You're private. Only you can see your namaz."); }
    render();
  }
  else if (a==="openfr"){ if (b.dataset.id===S.myId && !isPub(S.myId)) S.view = "me"; else { S.view = "board"; S.open = b.dataset.id; } render(); scrollTo({top:0}); }
  else if (a==="uninvite"){
    const {error} = await S.sb.from("invites").delete().eq("email", b.dataset.e);
    if (error) toast("Couldn't remove that invite."); else { S.invites = S.invites.filter(x=>x!==b.dataset.e); S.forceForm = true; render(); }
  }
  else if (a==="rm"){
    const id = b.dataset.id;
    if (S.confirmRm !== id){ S.confirmRm = id; S.forceForm = true; render(); return; }
    S.confirmRm = null; b.disabled = true;
    const {error} = await S.sb.from("members").delete().eq("id", id);
    if (error) toast("Couldn't remove them. Try again in a moment."); else { delete S.members[id]; toast("Removed"); }
    S.forceForm = true; render();
  }
  else if (a==="day"){ S.dayOff = Number(b.dataset.d); render(); }
  else if (a==="period"){ S.period = b.dataset.p; render(); }
  else if (a==="open"){ S.open = S.open===b.dataset.id ? null : b.dataset.id; render(); }
  else if (a==="tog"){
    const {ds,k,c} = b.dataset, cur = codeOf(S.myId,ds,k);
    const cfg = cfgOf(meDoc()), st = chipStart(cfg,ds,k,c), now = new Date();
    if (now < st || now >= new Date(+st+DAY)){ toast("That namaz's logging window has closed."); render(); return; }
    const before = dayState(S.myId,ds,now).s, sBefore = streakOf(S.myId,now);
    const next = cur.includes(c) ? cur.replace(c,"") : cur + c;
    queue(ds,k,next);
    if (c==="f" && next.includes("f")) S.pop = ds+k+"f";
    render();
    if (c==="f" && before!=="done" && dayState(S.myId,ds,now).s==="done"){
      const n = streakOf(S.myId,now); celebrate();
      toast(n > sBefore ? `🔥 ${n}-day streak! All 5 fardh done.` : "All 5 fardh done for the day.");
    }
  }
});
document.addEventListener("change", async e => {
  if (e.target.dataset.act !== "ntoggle") return;
  const patch = {notify_start:$("n-start").checked, notify_end:$("n-end").checked};
  const {error} = await S.sb.from("members").update(patch).eq("id", S.myId);
  if (error) toast("Couldn't save that setting."); else { Object.assign(meDoc(), {notifyStart:patch.notify_start, notifyEnd:patch.notify_end}); toast("Saved"); }
});
document.addEventListener("submit", async e => {
  e.preventDefault();
  if (e.target.id === "reqForm"){
    const name = $("r-name").value.trim().slice(0,40), note = $("r-note").value.trim().slice(0,200) || null;
    if (!name) return;
    const btn = e.target.querySelector("button[type=submit]"); btn.disabled = true;
    const {data, error} = await S.sb.from("join_requests").insert({user_id:S.myId, email:S.email, name, note}).select().single();
    if (error){ btn.disabled = false; toast(/duplicate/i.test(error.message) ? "You've already asked. Hang tight!" : "Couldn't send: " + error.message); return; }
    S.myRequest = data; render(); return;
  }
  if (e.target.id === "inviteForm"){
    const email = $("f-invite").value.trim().toLowerCase(); if (!email) return;
    const {error} = await S.sb.from("invites").upsert({email});
    if (error) toast("Couldn't add that invite."); else { if (!S.invites.includes(email)) S.invites.push(email); toast(`Invited ${email}`); S.forceForm = true; render(); }
    return;
  }
  if (e.target.id !== "setupForm") return;
  const name = $("f-name").value.trim().slice(0,24); if (!name) return;
  const prof = {name, city:$("f-city").value, method:$("f-method").value, madhab:$("f-madhab").value, show_extras:$("f-extras").checked, is_public:$("f-public").checked};
  const btn = e.target.querySelector("button[type=submit]"); btn.disabled = true;
  try {
    if (meDoc()){
      const {error} = await S.sb.from("members").update(prof).eq("id", S.myId); if (error) throw error;
      Object.assign(meDoc(), rowToMember({...prof, notify_start:meDoc().notifyStart, notify_end:meDoc().notifyEnd, joined:meDoc().joined}, meDoc()));
    } else {
      const joined = appDay(cfgOf(prof));
      const {data, error} = await S.sb.from("members").insert({id:S.myId, ...prof, joined}).select().single(); if (error) throw error;
      await loadAll(); S.members[S.myId] ||= rowToMember(data); subscribeLive(); checkPush();
      S.phase = "app"; celebrate();
    }
    cache.clear(); S.view = "today"; S.dayOff = 0; render(); toast("Saved");
  } catch(err){
    btn.disabled = false; toast("Couldn't save: " + (err?.message || "try again in a moment."));
  }
});

/* ---------- boot ---------- */
async function afterAuth(){
  if (S.authing) return; S.authing = true;
  try { await afterAuthInner(); } finally { S.authing = false; }
}
async function afterAuthInner(){
  const {data:{session}} = await S.sb.auth.getSession();
  S.session = session;
  if (!session){ S.phase = "login"; render(); return; }
  S.myId = session.user.id; S.email = (session.user.email||"").toLowerCase();
  const [inv, adm] = await Promise.all([S.sb.rpc("is_invited"), S.sb.rpc("is_admin")]);
  S.invited = !!inv.data; S.admin = !!adm.data;
  if (S.admin){
    const [{data}, {data:reqs}] = await Promise.all([S.sb.from("invites").select("email").order("added_at"), S.sb.from("join_requests").select("*").order("created_at")]);
    S.invites = (data||[]).map(r=>r.email); S.requests = reqs || [];
  }
  const {data:me} = await S.sb.from("members").select("*").eq("id",S.myId).maybeSingle();
  if (!me){
    if (!S.invited){ const {data:req} = await S.sb.from("join_requests").select("*").eq("user_id",S.myId).maybeSingle(); S.myRequest = req || null; }
    S.phase = S.invited ? "join" : "uninvited"; render(); return;
  }
  try { await loadAll(); } catch(e){ S.err = "Couldn't load the board. Check your connection and reload."; S.phase="boot"; render(); return; }
  S.phase = "app"; subscribeLive(); await checkPush(); render();
}
async function boot(){
  render();
  setInterval(renderSky, 1000);
  setInterval(() => { if (S.phase==="app" && S.view!=="settings" && S.view!=="alerts") render(); }, 30000);
  // Waiting for approval: check every 15 s and open the board as soon as it's granted.
  setInterval(async () => {
    if (S.phase!=="uninvited" || !S.myRequest || document.visibilityState!=="visible") return;
    const {data} = await S.sb.rpc("is_invited");
    if (data){ toast("You're approved! 🎉"); await afterAuth(); }
  }, 15000);
  if ("serviceWorker" in navigator){
    try { S.swReg = await navigator.serviceWorker.register("./sw.js"); await navigator.serviceWorker.ready; } catch {}
  }
  if (!CONF.supabaseUrl || CONF.supabaseUrl.includes("YOUR-")){ S.phase = "config"; render(); return; }
  S.sb = supabase.createClient(CONF.supabaseUrl, CONF.supabaseKey, {auth:{persistSession:true, autoRefreshToken:true, detectSessionInUrl:true, flowType:"pkce"}});
  S.sb.auth.onAuthStateChange((ev) => { if (ev==="SIGNED_IN" && S.phase!=="app" && S.phase!=="join") afterAuth(); });
  const qv = new URLSearchParams(location.search).get("view");
  if (qv){ history.replaceState(null,"",location.pathname); if (qv==="requests") S.pendingView = "settings"; }
  await afterAuth();
  if (S.pendingView && S.admin && S.phase==="app"){ S.view = S.pendingView; S.forceForm = true; render(); }
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState==="visible" && S.phase==="app"){ try { await syncChanges(); render(); } catch {} }
  });
}
boot();
})();
