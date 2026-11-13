/* Star Catch: a 30-second mini-game, unlocked once a day after all 5 fardh.
   Move the lantern (drag, mouse or arrow keys). ⭐ +1, 🌙 +3, ☁️ −2. */
(() => {
const ITEMS = [
  {e:"⭐", pts:1, w:62},
  {e:"🌙", pts:3, w:14},
  {e:"☁️", pts:-2, w:24}];
const DURATION = 30;

function start({bn=false, best=0, onEnd=()=>{}} = {}){
  const T = bn
    ? {title:"স্টার ক্যাচ", tip:"লণ্ঠন সরিয়ে তারা ধরো ⭐ চাঁদ +৩ 🌙 মেঘ এড়িয়ে চলো ☁️", go:"শুরু করো", score:"স্কোর", best:"সেরা", done:"আলহামদুলিল্লাহ ✨", again:"আগামীকাল আবার খেলা যাবে 🌙", newBest:"নতুন সেরা স্কোর! 🎉", close:"বন্ধ করো"}
    : {title:"Star Catch", tip:"Move the lantern to catch stars ⭐ Moons are +3 🌙 Dodge the clouds ☁️", go:"Start", score:"Score", best:"Best", done:"Alhamdulillah ✨", again:"A new round unlocks tomorrow 🌙", newBest:"New best score! 🎉", close:"Close"};
  const num = n => bn ? String(n).replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]) : String(n);

  const wrap = document.createElement("div");
  wrap.className = "game"; wrap.setAttribute("role","dialog"); wrap.setAttribute("aria-modal","true"); wrap.setAttribute("aria-label", T.title);
  wrap.innerHTML = `<canvas></canvas>
    <div class="ghud"><span class="gs">${T.score} <b>0</b></span><span class="gt"><i></i></span><button class="gx" aria-label="${T.close}">✕</button></div>
    <div class="gcard"><div class="gbig">⭐🏮⭐</div><h3>${T.title}</h3><p>${T.tip}</p><button class="primary gstart">${T.go}</button></div>`;
  document.body.appendChild(wrap);
  const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1;
  const fit = () => { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W*dpr; cv.height = H*dpr; cv.style.width = W+"px"; cv.style.height = H+"px"; g.setTransform(dpr,0,0,dpr,0,0); };
  fit(); addEventListener("resize", fit);

  // background stars
  const bg = Array.from({length:70}, () => ({x:Math.random(), y:Math.random(), r:Math.random()*1.6+.4, p:Math.random()*6}));
  let px = 0.5, target = 0.5, score = 0, items = [], pops = [], running = false, over = false, t0 = 0, last = 0, spawnAcc = 0, shake = 0, raf = 0, keys = {};

  const pick = () => { const tot = ITEMS.reduce((a,i)=>a+i.w,0); let r = Math.random()*tot; for (const it of ITEMS){ if ((r -= it.w) < 0) return it; } return ITEMS[0]; };
  const setTarget = cx => { target = Math.max(.06, Math.min(.94, cx / W)); };
  const onMove = e => { const p = e.touches ? e.touches[0] : e; if (p) setTarget(p.clientX); };
  cv.addEventListener("pointermove", onMove); cv.addEventListener("pointerdown", onMove);
  cv.addEventListener("touchmove", e => { e.preventDefault(); onMove(e); }, {passive:false});
  const onKey = e => { if (e.key==="ArrowLeft"||e.key==="ArrowRight"){ keys[e.key] = e.type==="keydown"; e.preventDefault(); } if (e.key==="Escape") close(); };
  addEventListener("keydown", onKey); addEventListener("keyup", onKey);
  const onVis = () => { if (document.hidden && running){ running = false; cancelAnimationFrame(raf); wrap.querySelector(".gcard").hidden = false; wrap.querySelector(".gstart").textContent = "▶"; } };
  document.addEventListener("visibilitychange", onVis);

  function lantern(x, y){
    const glow = g.createRadialGradient(x, y, 4, x, y, 70); glow.addColorStop(0,"rgba(255,214,120,.55)"); glow.addColorStop(1,"rgba(255,214,120,0)");
    g.fillStyle = glow; g.beginPath(); g.arc(x, y, 70, 0, 7); g.fill();
    g.font = "54px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("🏮", x, y);
  }
  function frame(now){
    if (!running) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const el = (now - t0) / 1000, left = Math.max(0, DURATION - el), speedUp = 1 + el / 22;
    if (keys.ArrowLeft) target = Math.max(.06, target - dt*1.1);
    if (keys.ArrowRight) target = Math.min(.94, target + dt*1.1);
    px += (target - px) * Math.min(1, dt*14);
    spawnAcc += dt * (1.6 + el/10);
    while (spawnAcc > 1){ spawnAcc -= 1; const it = pick(); items.push({...it, x:.06 + Math.random()*.88, y:-30, v:(150 + Math.random()*90) * speedUp, rot:Math.random()*6}); }
    // draw
    const sk = shake > 0 ? (Math.random()-.5)*10 : 0; shake = Math.max(0, shake - dt);
    const sky = g.createLinearGradient(0,0,0,H); sky.addColorStop(0,"#1E1640"); sky.addColorStop(.6,"#3B2A6B"); sky.addColorStop(1,"#6E4A8E");
    g.fillStyle = sky; g.fillRect(0,0,W,H);
    for (const s of bg){ g.globalAlpha = .4 + .6*Math.abs(Math.sin(now/900 + s.p)); g.fillStyle = "#fff"; g.beginPath(); g.arc(s.x*W, s.y*H*.8, s.r, 0, 7); g.fill(); }
    g.globalAlpha = 1;
    g.save(); g.translate(sk, 0);
    const ly = H - 90, lx = px * W;
    g.font = "36px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    items = items.filter(it => {
      it.y += it.v * dt; const x = it.x * W;
      if (Math.abs(x - lx) < 46 && Math.abs(it.y - ly) < 40){
        score = Math.max(0, score + it.pts); pops.push({x, y:it.y, t:0, s:(it.pts>0?"+":"")+num(it.pts), c:it.pts>0?"#FFE28A":"#FF9DB8"});
        if (it.pts < 0){ shake = .25; navigator.vibrate?.(40); }
        return false;
      }
      if (it.y > H + 40) return false;
      g.fillText(it.e, x, it.y); return true;
    });
    lantern(lx, ly);
    g.font = "800 26px Nunito, system-ui, sans-serif";
    pops = pops.filter(p => { p.t += dt; g.globalAlpha = Math.max(0, 1 - p.t*1.6); g.fillStyle = p.c; g.fillText(p.s, p.x, p.y - p.t*70); g.globalAlpha = 1; return p.t < .7; });
    g.restore();
    wrap.querySelector(".gs b").textContent = num(score);
    wrap.querySelector(".gt i").style.width = (left / DURATION * 100) + "%";
    if (left <= 0) return finish();
    raf = requestAnimationFrame(frame);
  }
  function play(){
    wrap.querySelector(".gcard").hidden = true;
    if (!t0 || over){ t0 = performance.now(); score = 0; items = []; over = false; } else { t0 += performance.now() - last; }
    running = true; last = performance.now(); raf = requestAnimationFrame(frame);
  }
  function finish(){
    running = false; over = true;
    const isBest = score > best;
    const c = wrap.querySelector(".gcard"); c.hidden = false;
    c.innerHTML = `<div class="gbig">${isBest ? "🏆" : "🌟"}</div><h3>${T.done}</h3>
      <p class="gfinal">${T.score}: <b>${num(score)}</b>${isBest ? `<br><span>${T.newBest}</span>` : ` · ${T.best}: ${num(best)}`}</p>
      <p>${T.again}</p><button class="primary gend">${T.close}</button>`;
    c.querySelector(".gend").onclick = close;
    onEnd(score);
  }
  function close(){
    running = false; cancelAnimationFrame(raf);
    removeEventListener("resize", fit); removeEventListener("keydown", onKey); removeEventListener("keyup", onKey); document.removeEventListener("visibilitychange", onVis);
    if (!over && t0) onEnd(score);   // closed mid-game: still counts as today's round
    wrap.remove();
  }
  wrap.querySelector(".gstart").onclick = play;
  wrap.querySelector(".gx").onclick = close;
  // first frame behind the start card
  g.fillStyle = "#1E1640"; g.fillRect(0,0,W,H);
}
window.NB_GAME = {start};
})();
