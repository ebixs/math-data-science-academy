/* Daily review with spaced repetition (Leitner boxes), placement test, achievements and
   quick-solve. Uses the dashboard globals: S, L, go(), save(), academyToast(). */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const fa = n => new Intl.NumberFormat("fa-IR").format(n);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const st = () => (typeof S === "object" && S ? S : {});
  const dayKey = d => (window.academyDayKey ? window.academyDayKey(d) : d.toISOString().slice(0, 10));
  const today = () => dayKey(new Date());
  const addDays = (n) => { const d = new Date(); d.setHours(12); d.setDate(d.getDate() + n); return dayKey(d); };
  const persist = () => { if (typeof window.save === "function") window.save(); };
  const toast = h => window.academyToast && window.academyToast(h);

  /* ---------------- question pool ---------------- */
  const CATMAP = { "حساب": "پایه", "کسر": "پایه", "درصد": "پایه", "معادله": "جبر", "تابع": "جبر", "جبر خطی": "جبر", "هندسه": "هندسه", "احتمال": "احتمال", "آمار": "آمار", "تفکر آماری": "آمار", "داده": "آمار", "پایتون": "برنامه‌نویسی", "یادگیری ماشین": "داده‌کاوی" };
  function pool() {
    const out = [];
    (typeof L !== "undefined" ? L : []).forEach(l => out.push({ id: "L:" + l[0], c: l[2], q: l[7], o: l[8], a: l[9], e: l[10], d: 1, lesson: l[0] }));
    (window.PRACTICE_BANK || []).forEach((b, i) => out.push({ id: "B:" + i, c: CATMAP[b.cat] || b.cat, q: b.q, o: b.o, a: b.a, e: b.e, d: 2 }));
    (window.REVIEW_BANK || []).forEach((b, i) => out.push({ id: "R:" + i, c: b.c, q: b.q, o: b.o, a: b.a, e: b.e, d: b.d || 2 }));
    return out;
  }
  const ORDER = ["پایه", "جبر", "هندسه", "احتمال", "آمار", "حسابان", "برنامه‌نویسی", "داده‌کاوی"];
  function seeded(seed) { let x = 0; for (const ch of seed) x = (x * 31 + ch.charCodeAt(0)) >>> 0; return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
  const shuffle = (a, rnd) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------------- Leitner spaced repetition ---------------- */
  const INTERVAL = [0, 1, 2, 4, 8, 16, 32];   /* days until next review for boxes 1..6 */
  function srs() { const s = st(); if (!s.srs || typeof s.srs !== "object" || Array.isArray(s.srs)) s.srs = {}; return s.srs; }
  function dailySet() {
    const P = pool(), cards = srs(), t = today(), rnd = seeded("review-" + t);
    const due = P.filter(q => cards[q.id] && cards[q.id].due <= t).sort((a, b) => cards[a.id].box - cards[b.id].box);
    const fresh = shuffle(P.filter(q => !cards[q.id]), rnd);
    /* mix: up to 4 due + new ones, total 6 */
    const set = due.slice(0, 4); for (const q of fresh) { if (set.length >= 6) break; set.push(q); }
    for (const q of due.slice(4)) { if (set.length >= 6) break; set.push(q); }
    return set;
  }
  function grade(q, ok) {
    const cards = srs(), c = cards[q.id] || { box: 0 };
    c.box = ok ? Math.min(6, (c.box || 0) + 1) : 1;
    c.due = addDays(ok ? INTERVAL[c.box] || 32 : 1);
    c.seen = (c.seen || 0) + 1; c.last = today();
    cards[q.id] = c;
  }

  /* ---------------- quiz runner (shared by review & placement) ---------------- */
  let quiz = null;
  function startQuiz(kind, questions) { quiz = { kind, qs: questions, i: 0, correct: 0, answers: [] }; renderQuiz(); }
  function renderQuiz() {
    const root = $("reviewRoot"), q = quiz.qs[quiz.i];
    const dots = quiz.qs.map((_, i) => `<i class="${i < quiz.i ? (quiz.answers[i] ? "ok" : "no") : i === quiz.i ? "cur" : ""}"></i>`).join("");
    root.innerHTML = `<div class="card quiz"><div class="quiz-top"><span class="muted">${quiz.kind === "placement" ? "آزمون تعیین سطح" : "چالش امروز"} · سؤال ${fa(quiz.i + 1)} از ${fa(quiz.qs.length)}</span><span class="qdots">${dots}</span></div>
      <span class="tag">${esc(q.c)}</span><h3 class="qtext">${esc(q.q)}</h3>
      <div class="qopts">${q.o.map((o, i) => `<button class="qopt" data-i="${i}">${esc(o)}</button>`).join("")}</div>
      <div class="feedback" id="qfb"></div>
      <div class="section" style="margin:14px 0 0"><button class="btn alt" id="qquit">خروج</button><button class="btn" id="qnext" hidden>${quiz.i === quiz.qs.length - 1 ? "دیدن نتیجه" : "سؤال بعدی ←"}</button></div></div>`;
    root.querySelectorAll(".qopt").forEach(b => b.onclick = () => answer(+b.dataset.i));
    $("qquit").onclick = () => { quiz = null; renderReview(); };
    $("qnext").onclick = () => { quiz.i++; if (quiz.i >= quiz.qs.length) finish(); else renderQuiz(); };
  }
  function answer(i) {
    const q = quiz.qs[quiz.i]; if (quiz.answers[quiz.i] !== undefined) return;
    const ok = i === q.a; quiz.answers[quiz.i] = ok; if (ok) quiz.correct++;
    document.querySelectorAll(".qopt").forEach((b, j) => { b.disabled = true; if (j === q.a) b.classList.add("right"); else if (j === i) b.classList.add("wrong"); });
    const fb = $("qfb"); fb.className = "feedback show " + (ok ? "good" : "bad"); fb.textContent = (ok ? "درست است! " : "پاسخ درست: «" + q.o[q.a] + "». ") + (q.e || "");
    if (quiz.kind === "review") grade(q, ok);
    $("qnext").hidden = false; $("qnext").focus();
  }
  function finish() {
    const s = st(), n = quiz.qs.length, c = quiz.correct;
    if (quiz.kind === "review") {
      const gain = c * 15 + (c === n ? 20 : 0);
      s.reviewXP = (s.reviewXP || 0) + gain; s.reviewSessions = (s.reviewSessions || 0) + 1;
      s.reviewLog = s.reviewLog || {}; s.reviewLog[today()] = { c, n };
      persist();
      $("reviewRoot").innerHTML = `<div class="card quiz result-card"><div class="big-score">${fa(c)} <small style="font-size:22px;color:var(--muted)">از</small> ${fa(n)}</div><p>${c === n ? "عالی! همهٔ پاسخ‌ها درست بود 🎉" : c >= n / 2 ? "خوب بود؛ سؤال‌های اشتباه فردا دوباره می‌آیند." : "اشکالی ندارد؛ سؤال‌های اشتباه با فاصلهٔ کوتاه‌تر تکرار می‌شوند تا یاد بگیری."}</p><p class="muted">+${fa(gain)} XP · جعبه‌های لایتنر به‌روز شدند.</p><button class="btn" id="back">بازگشت</button></div>`;
    } else {
      const by = {}; quiz.qs.forEach((q, i) => { by[q.c] = by[q.c] || { c: 0, n: 0 }; by[q.c].n++; if (quiz.answers[i]) by[q.c].c++; });
      const weak = ORDER.filter(k => by[k] && by[k].c < by[k].n);
      const start = weak[0] || null;
      s.placement = { date: today(), c, n, by, start };
      persist();
      const lesson = start && (typeof L !== "undefined") ? L.find(l => l[2] === start) : null;
      $("reviewRoot").innerHTML = `<div class="card quiz result-card"><div class="big-score">${fa(c)} <small style="font-size:22px;color:var(--muted)">از</small> ${fa(n)}</div>
        <table class="ptable">${ORDER.filter(k => by[k]).map(k => `<tr><td>${esc(k)}</td><td><div class="bar"><i style="width:${Math.round(by[k].c / by[k].n * 100)}%"></i></div></td><td>${fa(by[k].c)}/${fa(by[k].n)}</td></tr>`).join("")}</table>
        <p>${start ? "پیشنهاد: یادگیری را از حوزهٔ «" + esc(start) + "» شروع کن." : "همهٔ حوزه‌های پایه را بلدی! سراغ پروژه‌ها و فصل‌های پیشرفته برو."}</p>
        <div class="section" style="justify-content:center"><button class="btn alt" id="back">بازگشت</button>${lesson ? `<button class="btn" id="goLesson">شروع درس «${esc(lesson[1])}» ←</button>` : ""}</div></div>`;
      if (lesson) $("goLesson").onclick = () => window.openLesson(lesson[0]);
    }
    $("back").onclick = () => { quiz = null; renderReview(); };
    quiz = null; renderBadges(true);
  }
  function placementSet() {
    const P = pool(), rnd = seeded("placement-" + Date.now());
    const out = [];
    ORDER.forEach(c => { const qs = shuffle(P.filter(q => q.c === c), rnd).sort((a, b) => a.d - b.d); out.push(...qs.slice(0, 2)); });
    return out;
  }

  /* ---------------- review page ---------------- */
  function renderReview() {
    if (quiz) return renderQuiz();
    const s = st(), cards = srs(), t = today(), set = dailySet();
    const boxes = [1, 2, 3, 4, 5, 6].map(b => Object.values(cards).filter(c => c.box === b).length);
    const due = Object.values(cards).filter(c => c.due <= t).length;
    const doneToday = s.reviewLog && s.reviewLog[t];
    const P = pool().length, seen = Object.keys(cards).length;
    $("reviewRoot").innerHTML = `<div class="review-grid">
      <article class="card rcard"><h3>🔥 چالش امروز</h3><p class="muted">${fa(set.length)} سؤال: ${doneToday ? "امروز انجامش دادی (" + fa(doneToday.c) + " از " + fa(doneToday.n) + ")؛ می‌توانی دوباره تمرین کنی." : "ترکیبی از سؤال‌های سررسیدشده و سؤال‌های تازه."}</p><button class="btn big" id="startReview">${doneToday ? "تمرین دوباره" : "شروع چالش"} ←</button></article>
      <article class="card rcard"><h3>🗂 جعبه‌های لایتنر</h3><div class="leitner">${boxes.map((n, i) => `<div><b style="height:${Math.min(100, 12 + n * 6)}%"></b><span>${fa(i + 1)}</span><small>${fa(n)}</small></div>`).join("")}</div><p class="muted">سررسید امروز: ${fa(due)} · دیده‌شده: ${fa(seen)} از ${fa(P)} سؤال. پاسخ درست سؤال را به جعبهٔ بعد می‌برد (فاصلهٔ مرور بیشتر)؛ پاسخ غلط آن را به جعبهٔ ۱ برمی‌گرداند.</p></article>
      <article class="card rcard"><h3>🎯 آزمون تعیین سطح</h3><p class="muted">${s.placement ? "آخرین نتیجه: " + fa(s.placement.c) + " از " + fa(s.placement.n) + (s.placement.start ? " · پیشنهاد شروع: " + esc(s.placement.start) : " · همهٔ حوزه‌ها کامل") : "۱۶ سؤال از ۸ حوزه، از آسان به سخت؛ مشخص می‌کند از کجا شروع کنی."}</p><button class="btn ${s.placement ? "alt" : ""} big" id="startPlacement">${s.placement ? "آزمون دوباره" : "شروع آزمون"}</button></article>
    </div>`;
    $("startReview").onclick = () => startQuiz("review", dailySet());
    $("startPlacement").onclick = () => startQuiz("placement", placementSet());
  }

  /* ---------------- achievements ---------------- */
  function longestStreak() {
    const a = st().activity || {}; const days = Object.keys(a).filter(k => a[k]).sort();
    let best = 0, cur = 0, prev = null;
    days.forEach(k => { const d = new Date(k + "T12:00:00"); if (prev && (d - prev) / 864e5 < 1.5) cur++; else cur = 1; best = Math.max(best, cur); prev = d; });
    return best;
  }
  function badges() {
    const s = st(), lv = window.academyLevel ? window.academyLevel() : 1, ls = longestStreak(), nL = typeof L !== "undefined" ? L.length : 12;
    const notes = (s.notes || "").trim().length + Object.values(s.lessonNotes || {}).filter(x => String(x).trim()).length;
    return [
      ["first_lesson", "📘", "اولین قدم", "اولین درس را کامل کن.", (s.done || []).length, 1],
      ["lessons_5", "📚", "کتاب‌خوان", "۵ درس را کامل کن.", (s.done || []).length, 5],
      ["lessons_all", "🎓", "دانش‌آموختهٔ پایه", "همهٔ درس‌های آغازین را کامل کن.", (s.done || []).length, nL],
      ["correct_10", "✅", "پاسخ‌گوی دقیق", "به ۱۰ سؤال درس پاسخ درست بده.", s.correct || 0, 10],
      ["streak_3", "🔥", "شعلهٔ کوچک", "۳ روز پشت‌سرهم تمرین کن.", ls, 3],
      ["streak_7", "⚡", "یک هفتهٔ کامل", "۷ روز پشت‌سرهم تمرین کن.", ls, 7],
      ["streak_30", "🌟", "عادت ماندگار", "۳۰ روز پشت‌سرهم تمرین کن.", ls, 30],
      ["level_5", "🛡", "سطح ۵", "به سطح ۵ برس.", lv, 5],
      ["level_10", "👑", "سطح ۱۰", "به سطح ۱۰ برس.", lv, 10],
      ["solver_1", "🧮", "حل‌گر تازه‌کار", "اولین مسئله را با حل‌گر حل کن.", s.solved || 0, 1],
      ["solver_25", "🧠", "حل‌گر کارکشته", "۲۵ مسئله با حل‌گر حل کن.", s.solved || 0, 25],
      ["solver_100", "🚀", "استاد حل مسئله", "۱۰۰ مسئله با حل‌گر حل کن.", s.solved || 0, 100],
      ["review_1", "🔁", "مرورکننده", "اولین چالش روزانه را انجام بده.", s.reviewSessions || 0, 1],
      ["review_10", "🗓", "مرور منظم", "۱۰ چالش روزانه انجام بده.", s.reviewSessions || 0, 10],
      ["placement", "🎯", "خودشناسی", "آزمون تعیین سطح را بده.", s.placement ? 1 : 0, 1],
      ["python_1", "🐍", "پایتونیست", "اولین کد پایتون را در دفترچه اجرا کن.", s.pyRuns || 0, 1],
      ["python_20", "📊", "تحلیل‌گر داده", "۲۰ بار کد پایتون اجرا کن.", s.pyRuns || 0, 20],
      ["notes", "✍", "یادداشت‌نویس", "یک یادداشت بنویس.", notes ? 1 : 0, 1],
    ];
  }
  function renderBadges(announce) {
    const s = st(), list = badges();
    s.badges = Array.isArray(s.badges) ? s.badges : [];
    const fresh = list.filter(b => b[4] >= b[5] && !s.badges.includes(b[0]));
    if (fresh.length) { fresh.forEach(b => s.badges.push(b[0])); if (announce) toast("🏅 نشان جدید: <b>" + esc(fresh[0][2]) + "</b>"); try { localStorage.setItem("academyProgress", JSON.stringify(s)); } catch (e) { } }
    const got = list.filter(b => b[4] >= b[5]).length;
    if ($("badgeCount")) $("badgeCount").textContent = fa(got) + " از " + fa(list.length) + " نشان";
    if ($("badgeRoot")) $("badgeRoot").innerHTML = list.map(([id, ic, name, desc, cur, tgt]) => { const ok = cur >= tgt, p = Math.min(100, Math.round(cur / tgt * 100)); return `<article class="card badge${ok ? " got" : ""}"><div class="bic">${ic}</div><h3>${esc(name)}</h3><p class="muted">${esc(desc)}</p><div class="bar"><i style="width:${p}%"></i></div><small class="muted">${ok ? "کسب شد ✓" : fa(Math.min(cur, tgt)) + " / " + fa(tgt)}</small></article>`; }).join("");
  }

  /* ---------------- quick solve ---------------- */
  const qf = $("quickSolve");
  if (qf) qf.onsubmit = e => {
    e.preventDefault();
    const v = $("quickInput").value.trim(); if (!v) { $("quickInput").focus(); return; }
    const eqs = (v.match(/=/g) || []).length, multi = /[,\n]/.test(v) && eqs > 1;
    const rel = /[<>≤≥]/.test(v);
    let cat = "arith", mode = "calc";
    if (multi) { cat = "system"; mode = "sys"; }
    else if (eqs || rel) { cat = "equation"; mode = rel ? "ineq" : "eq"; }
    else if (/[a-zA-Z]/.test(v.replace(/sqrt|sin|cos|tan|log|ln|pi|abs|exp/g, ""))) { cat = "algebra"; mode = "simplify"; }
    const q = multi ? v.split(",").join("\n") : v;
    location.href = "solver.html#s=" + encodeURIComponent(JSON.stringify({ c: cat, m: mode, q, p: {} }));
  };

  /* ---------------- install button (PWA) ---------------- */
  let deferred = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; const b = $("installBtn"); if (b) b.hidden = false; });
  if ($("installBtn")) $("installBtn").onclick = async () => { if (!deferred) return; deferred.prompt(); try { await deferred.userChoice; } catch (e) { } deferred = null; $("installBtn").hidden = true; };

  /* ---------------- hooks ---------------- */
  const prevGo = window.go;
  window.go = function (p) { prevGo(p); if (p === "review") renderReview(); if (p === "achievements") renderBadges(false); try { history.replaceState(null, "", p === "home" ? location.pathname : "#" + p); } catch (e) { } };
  const prevSave = window.save;
  window.save = function () { if (typeof prevSave === "function") prevSave.apply(this, arguments); renderBadges(true); };
  window.addEventListener("hashchange", () => { const p = location.hash.slice(1); if (p && document.getElementById("page-" + p)) window.go(p); });
  renderBadges(false);
  const h = location.hash.slice(1); if (h === "review") renderReview(); if (h === "achievements") renderBadges(false);
})();
