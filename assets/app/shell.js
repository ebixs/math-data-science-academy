/* App shell: hash router, dashboard, top bar menus, quick solve, toasts and the install button. */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const I = window.I18N, tr = I.T, num = n => I.num(n);
  const ST = window.STORE, C = window.CURRICULUM;
  const L = o => (o ? (I.lang === "en" ? o.en : o.fa) : "");
  window.APP = window.APP || {};
  const APP = window.APP;
  APP.esc = esc; APP.L = L;

  /* ---------- router ---------- */
  const PAGES = ["home", "learn", "skill", "review", "achievements", "progress"];
  const handlers = {};
  APP.onPage = (p, fn) => { handlers[p] = fn; };
  APP.go = (hash) => { if (location.hash.slice(1) === hash) route(); else location.hash = hash; };
  function route() {
    const h = decodeURIComponent(location.hash.slice(1)) || "home";
    const parts = h.split("/"), page = PAGES.includes(parts[0]) ? parts[0] : "home";
    document.querySelectorAll(".page").forEach(x => x.classList.toggle("active", x.id === "page-" + page));
    document.querySelectorAll(".mainnav .nav").forEach(x => { const on = x.dataset.page === (page === "skill" ? "learn" : page); x.classList.toggle("active", on); if (on) x.setAttribute("aria-current", "page"); else x.removeAttribute("aria-current"); });
    if (handlers[page]) handlers[page](parts.slice(1));
    window.scrollTo(0, 0);
    closeMenus();
  }
  window.addEventListener("hashchange", route);
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-page]");
    if (!b || b.tagName === "A" && b.getAttribute("href") && !b.getAttribute("href").startsWith("#")) return;
    e.preventDefault(); APP.go(b.dataset.hash || b.dataset.page);
  });

  /* ---------- toasts ---------- */
  APP.toast = html => {
    let t = $("xpToast");
    if (!t) { t = document.createElement("div"); t.id = "xpToast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.innerHTML = html; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2800);
  };
  ST.on("xp", ({ gain, levelUp }) => APP.toast(levelUp ? "🎉 " + tr("به <b>سطح " + num(levelUp) + "</b> رسیدی!", "You reached <b>level " + levelUp + "</b>!") : "<b>+" + num(gain) + " XP</b>"));
  ST.on("mastered", id => APP.toast("🏅 " + tr("به مهارت «" + esc(C.byId[id].fa) + "» مسلط شدی!", "You mastered “" + esc(C.byId[id].en) + "”!")));

  /* ---------- dashboard ---------- */
  const QUOTES = [
    [["قطره قطره جمع گردد، وانگهی دریا شود.", "ضرب‌المثل فارسی"], ["Little drops of water make the mighty ocean.", "Proverb"]],
    [["توانا بود هر که دانا بود.", "فردوسی"], ["Whoever has knowledge is powerful.", "Ferdowsi"]],
    [["پرسیدن عیب نیست، ندانستن عیب است.", "ضرب‌المثل فارسی"], ["Asking is no shame; not knowing is.", "Persian proverb"]],
    [["رهرو آن است که آهسته و پیوسته رود.", "ضرب‌المثل فارسی"], ["The true traveler walks slowly but steadily.", "Persian proverb"]],
    [["در ریاضیات، هنرِ طرح پرسش ارزشمندتر از حل آن است.", "گئورگ کانتور"], ["In mathematics the art of asking questions is more valuable than solving them.", "Georg Cantor"]],
    [["ریاضیات را نمی‌توان با تماشا یاد گرفت.", "پل هالموس (برگردان آزاد)"], ["You can't learn mathematics by watching it.", "after Paul Halmos"]],
    [["اشتباه کردن بخشی از یادگیری است؛ از هر اشتباه یک قاعده بساز.", "آکادمی"], ["Mistakes are part of learning; turn every mistake into a rule.", "Academy"]],
  ];
  const GOAL_ART = {
    found: ["y = mx + b", x => 0.6 * x + 0.4], alg: ["y = ax^2 + bx + c", x => 0.55 * x * x - 1.6], geo: ["\\sin\\theta", x => 2.2 * Math.sin(x * 1.4)],
    disc: ["\\sum a_n", x => Math.pow(1.5, x) - 2], prob: ["N(\\mu,\\sigma^2)", x => 4.2 * Math.exp(-x * x / 2) - 1.4], stats: ["\\hat y = b_0 + b_1 x", null],
    la: ["A\\vec v = \\lambda \\vec v", x => -0.5 * x], calc: ["f'(x)", x => 0.12 * x * x * x - 0.9 * x],
  };
  function art(domain) {
    const W = 320, H = 170, cx = 160, cy = 118, sx = 24, sy = 22, [label, f] = GOAL_ART[domain] || GOAL_ART.alg;
    let grid = ""; for (let i = -6; i <= 6; i++) grid += `<line x1="${cx + i * sx}" y1="18" x2="${cx + i * sx}" y2="${H - 8}"/>`; for (let j = -4; j <= 2; j++) grid += `<line x1="20" y1="${cy + j * sy}" x2="${W - 20}" y2="${cy + j * sy}"/>`;
    let body = "";
    if (f) { let p = ""; for (let i = 0; i <= 120; i++) { const x = -3.4 + i * 6.8 / 120, y = f(x), X = cx + x * sx * 1.6, Y = cy - y * sy; if (Y < 6 || Y > H - 4) continue; p += (p ? "L" : "M") + X.toFixed(1) + " " + Y.toFixed(1); } body = `<path d="${p}"/>`; }
    else { const pts = [[-2.6, -1.2], [-2, -.6], [-1.4, -.9], [-.8, -.1], [-.2, .1], [.4, .7], [1, .4], [1.6, 1.3], [2.2, 1.1], [2.8, 1.9]]; body = `<path d="M${cx - 3 * sx * 1.6} ${cy + 1.5 * sy} L${cx + 3 * sx * 1.6} ${cy - 2.2 * sy}"/>` + pts.map(([x, y]) => `<circle cx="${cx + x * sx * 1.6}" cy="${cy - y * sy}" r="4" fill="#67e8f9" stroke="none"/>`).join(""); }
    let lab = ""; try { lab = katex.renderToString(label, { throwOnError: false }); } catch (e) { lab = esc(label); }
    return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs><filter id="glw" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g stroke="rgba(56,189,248,.13)" stroke-width="1">${grid}</g><g stroke="rgba(230,241,255,.55)" stroke-width="1.4"><line x1="20" y1="${cy}" x2="${W - 20}" y2="${cy}"/><line x1="${cx}" y1="12" x2="${cx}" y2="${H - 6}"/></g><g fill="none" stroke="#22d3ee" stroke-width="4" stroke-linecap="round" filter="url(#glw)">${body}</g></svg><div class="art-label">${lab}</div>`;
  }
  APP.art = art;
  function renderDash() {
    const S = ST.S, xp = ST.xp(), lv = ST.levelOf(xp), a = ST.levelStart(lv), b = ST.levelStart(lv + 1);
    const name = (S.name && S.name.trim()) || tr("دوست من", "friend");
    $("welcomeName").textContent = name; $("menuName").textContent = name; $("avatarInitial").textContent = name.trim().charAt(0).toUpperCase() || "?";
    $("levelNum").textContent = num(lv); $("levelNum2").textContent = num(lv);
    $("xpTotal").innerHTML = '<bdi dir="ltr">' + num(xp) + " XP</bdi>";
    $("xpToNext").innerHTML = tr('<bdi dir="ltr">' + num(b - xp) + " XP</bdi> تا سطح " + num(lv + 1), (b - xp) + " XP to level " + (lv + 1));
    $("menuLevel").innerHTML = tr("سطح ", "Level ") + num(lv) + ' · <bdi dir="ltr">' + num(xp) + " XP</bdi>";
    $("ringFill").style.strokeDashoffset = (314.16 * (1 - Math.max(0.02, (xp - a) / (b - a)))).toFixed(2);
    /* streak heatmap: columns are weeks (Sat→Fri for Persian, Sun→Sat for English) */
    const act = S.activity, st = ST.streak(), today = new Date(); today.setHours(0, 0, 0, 0);
    $("streakNum").textContent = num(st);
    const todayK = ST.dayKey(today);
    $("streakMsg").textContent = act[todayK] ? tr("عالی! امروز هم تمرین کردی 🔥", "Great — you practiced today 🔥") : st ? tr("ادامه بده! امروز یک تمرین کوتاه انجام بده 🔥", "Keep it up! Do a short practice today 🔥") : tr("امروز اولین قدم را بردار! 🔥", "Take your first step today! 🔥");
    const fa = I.lang === "fa", firstDay = fa ? 6 : 0;
    const dow = (today.getDay() - firstDay + 7) % 7, start = new Date(today); start.setDate(start.getDate() - dow - 7 * 11);
    const names = fa ? ["ش", "ی", "د", "س", "چ", "پ", "ج"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    $("heatDays").innerHTML = names.map(n => `<span>${n}</span>`).join("");
    let cells = "";
    for (let i = 0; i < 84; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const k = ST.dayKey(d), v = act[k] || 0, future = d > today, l = future ? 0 : v >= 8 ? 4 : v >= 5 ? 3 : v >= 2 ? 2 : v >= 1 ? 1 : 0;
      cells += `<i data-l="${l}"${k === todayK ? ' class="today"' : ""}${future ? ' style="opacity:.25"' : ""} title="${I.date(d)} — ${num(v)} ${tr("فعالیت", "activities")}"></i>`; }
    $("heatGrid").innerHTML = cells;
    $("heatWeeks").innerHTML = Array.from({ length: 12 }, (_, i) => `<span>${i % 2 === 0 ? num(i + 1) : ""}</span>`).join("");
    /* next up */
    const next = ST.nextSkills(1)[0];
    if (next) { const s = C.byId[next], dom = C.domains.find(d => d.id === s.d);
      $("nextTitle").textContent = L(dom) + " · " + L(s);
      $("nextDesc").textContent = tr("حدود ", "About ") + num(s.min) + tr(" دقیقه · ", " min · ") + (ST.status(next) === "progress" ? tr("ادامهٔ تمرین تا تسلط", "keep practicing to mastery") : tr("درس + تمرین با تصحیح خودکار", "lesson + auto-graded practice"));
      $("nextArt").innerHTML = art(s.d); $("continue").onclick = () => APP.go("skill/" + next);
    } else { $("nextTitle").textContent = tr("همهٔ مهارت‌های این هدف را مسلط شدی!", "You've mastered every skill in this goal!"); $("nextDesc").textContent = tr("هدف بزرگ‌تری انتخاب کن یا سراغ پروژه‌های پایتون برو.", "Pick a bigger goal or try the Python projects."); $("nextArt").innerHTML = art("calc"); $("continue").onclick = () => { location.href = "python.html"; }; }
    /* stats */
    const goalList = ST.path(), mastered = goalList.filter(id => ST.status(id) === "mastered").length;
    $("statMastered").innerHTML = '<bdi dir="ltr">' + num(mastered) + " / " + num(goalList.length) + "</bdi>";
    $("statAcc").textContent = S.practiceTotal ? num(Math.round(100 * S.practiceCorrect / S.practiceTotal)) + (I.lang === "fa" ? "٪" : "%") : "—";
    $("statSolved").textContent = num((S.solved || 0) + (S.practiceCorrect || 0));
    /* path preview */
    const items = ST.nextSkills(4);
    $("homePath").innerHTML = items.map((id, i) => APP.skillCard(id, i === 0)).join("") || '<p class="muted">' + tr("مسیر تمام شد 🎉", "Path complete 🎉") + "</p>";
    renderOnboard();
    renderBell();
    const q = QUOTES[Math.floor(Date.now() / 864e5) % QUOTES.length][fa ? 0 : 1];
    $("quoteText").textContent = q[0]; $("quoteBy").textContent = "— " + q[1];
  }
  APP.renderDash = renderDash;
  APP.skillCard = (id, primary) => {
    const s = C.byId[id], dom = C.domains.find(d => d.id === s.d), stt = ST.status(id), m = ST.masteryCount(id);
    return `<a class="card path-item ${stt}${primary ? " primary" : ""}" href="#skill/${id}"><span class="pi-ic">${esc(dom.icon)}</span><span class="pi-t"><small>${esc(L(dom))}</small><b>${esc(L(s))}</b></span><span class="pi-m" title="${tr("پاسخ‌های درست از ۱۰ پاسخ آخر", "correct of the last 10 answers")}"><bdi dir="ltr">${num(m)}/${num(ST.MASTERY_WINDOW)}</bdi></span></a>`;
  };
  function renderOnboard() {
    const S = ST.S, box = $("onboard");
    if (S.goal) { box.innerHTML = ""; return; }
    box.innerHTML = `<div class="card onboard"><h2>${tr("از کجا شروع کنیم؟", "Where should we start?")}</h2><p class="muted">${tr("هدفت را انتخاب کن تا مسیر یادگیری‌ات ساخته شود. بعد می‌توانی با آزمون تعیین سطح مهارت‌هایی را که بلدی رد کنی.", "Choose your goal to build your learning path. Then take the placement test to skip what you already know.")}</p>
      <div class="goal-pick">${Object.entries(C.goals).map(([k, g]) => `<button class="goal-opt" data-goal="${k}"><b>${esc(L(g))}</b><small>${esc(L(g.desc))}</small><span>${num(C.goalSkills(k).length)} ${tr("مهارت", "skills")}</span></button>`).join("")}</div></div>`;
    box.querySelectorAll("[data-goal]").forEach(b => b.onclick = () => { S.goal = b.dataset.goal; ST.save({ quiet: true }); APP.toast(tr("مسیر ساخته شد! پیشنهاد: آزمون تعیین سطح را بده.", "Path ready! Tip: take the placement test.")); renderDash(); });
  }
  function renderBell() {
    const S = ST.S, todayK = ST.dayKey(), notes = [];
    if (!S.activity[todayK]) notes.push([tr("امروز هنوز تمرین نکرده‌ای", "You haven't practiced today"), tr("یک تمرین کوتاه استریک را حفظ می‌کند.", "A short practice keeps your streak alive."), "review"]);
    const due = window.REVIEW ? window.REVIEW.dueCount() : 0;
    if (due) notes.push([tr(num(due) + " مهارت برای مرور سررسید شده", due + " skills are due for review"), tr("مرور فاصله‌دار جلوی فراموشی را می‌گیرد.", "Spaced review stops forgetting."), "review"]);
    const nx = ST.nextSkills(1)[0];
    if (nx) notes.push([tr("مهارت بعدی: ", "Next skill: ") + L(C.byId[nx]), tr("درس را بخوان و تمرین کن.", "Read the lesson and practice."), "skill/" + nx]);
    if (!S.placement) notes.push([tr("آزمون تعیین سطح", "Placement test"), tr("مهارت‌هایی را که بلدی رد کن.", "Skip what you already know."), "review/placement"]);
    $("bellMenu").innerHTML = notes.map(x => `<button class="item" data-go="${x[2]}"><span class="note" style="padding:0">${esc(x[0])}<small>${esc(x[1])}</small></span></button>`).join("");
    $("bellMenu").querySelectorAll("[data-go]").forEach(b => b.onclick = () => { closeMenus(); APP.go(b.dataset.go); });
    $("bellDot").hidden = !!S.activity[todayK] && !due;
  }
  APP.onPage("home", renderDash);
  ST.on("change", () => { if ($("page-home").classList.contains("active")) renderDash(); });

  /* ---------- menus ---------- */
  function closeMenus() { document.querySelectorAll(".menu.open").forEach(m => m.classList.remove("open")); document.querySelectorAll("[aria-expanded=true]").forEach(b => b.setAttribute("aria-expanded", "false")); }
  APP.closeMenus = closeMenus;
  function toggle(btn, menu) { const open = !menu.classList.contains("open"); closeMenus(); if (open) { menu.classList.add("open"); btn.setAttribute("aria-expanded", "true"); } }
  $("bellBtn").onclick = e => { e.stopPropagation(); renderBell(); toggle($("bellBtn"), $("bellMenu")); };
  $("avatarBtn").onclick = e => { e.stopPropagation(); $("nameInput").value = ST.S.name || ""; toggle($("avatarBtn"), $("avatarMenu")); };
  document.querySelectorAll(".menu").forEach(m => m.addEventListener("click", e => e.stopPropagation()));
  document.addEventListener("click", closeMenus);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenus(); });
  $("nameForm").onsubmit = e => { e.preventDefault(); ST.S.name = $("nameInput").value.trim().slice(0, 30); ST.save({ quiet: true }); closeMenus(); renderDash(); };
  $("langItem").onclick = () => I.set(I.lang === "fa" ? "en" : "fa");
  $("avatarMenu").querySelectorAll("[data-page]").forEach(b => b.addEventListener("click", () => { closeMenus(); APP.go(b.dataset.page); }));

  /* ---------- search & quick solve ---------- */
  $("globalSearch").addEventListener("keydown", e => { if (e.key === "Enter") { APP.go("learn"); const s = $("learnSearch"); if (s) { s.value = $("globalSearch").value; s.dispatchEvent(new Event("input")); } } });
  $("quickSolve").onsubmit = e => {
    e.preventDefault();
    const v = $("quickInput").value.trim(); if (!v) { $("quickInput").focus(); return; }
    const eqs = (v.match(/=/g) || []).length, multi = /[,\n]/.test(v) && eqs > 1, rel = /[<>≤≥]/.test(v);
    let cat = "arith", mode = "calc";
    if (multi) { cat = "system"; mode = "sys"; }
    else if (eqs || rel) { cat = "equation"; mode = rel ? "ineq" : "eq"; }
    else if (/[a-zA-Z]/.test(v.replace(/sqrt|sin|cos|tan|log|ln|pi|abs|exp/g, ""))) { cat = "algebra"; mode = "simplify"; }
    location.href = "solver.html#s=" + encodeURIComponent(JSON.stringify({ c: cat, m: mode, q: multi ? v.split(",").join("\n") : v, p: {} }));
  };

  /* ---------- install (PWA) ---------- */
  let deferred = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; $("installBtn").hidden = false; });
  $("installBtn").onclick = async () => { if (!deferred) return; deferred.prompt(); try { await deferred.userChoice; } catch (e) { } deferred = null; $("installBtn").hidden = true; };

  /* ---------- start ---------- */
  APP.start = () => { route(); ST.syncFromServer().then(changed => { if (changed) route(); }); };
  document.addEventListener("DOMContentLoaded", () => setTimeout(APP.start, 0));
})();
