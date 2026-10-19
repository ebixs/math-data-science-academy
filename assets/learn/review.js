/* Daily review (spaced repetition of mastered skills), daily challenge, adaptive placement test,
   achievements and the progress page (domain bars, notes, backup, reset). */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const I = window.I18N, tr = I.T, num = n => I.num(n);
  const ST = window.STORE, C = window.CURRICULUM, PR = window.PRACTICE, APP = window.APP;
  const esc = APP.esc, L = APP.L;
  const L2 = v => (Array.isArray(v) ? (I.lang === "en" ? v[1] : v[0]) : v);
  const INTERVAL = [0, 1, 3, 7, 14, 30, 60];   /* days until the next review for boxes 1..6 */
  const today = () => ST.dayKey();
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pct = (a, b) => (b ? Math.round(100 * a / b) : 0);
  const pctS = n => num(n) + (I.lang === "fa" ? "٪" : "%");

  /* ---------------- spaced repetition on mastered skills ---------------- */
  const mastered = () => C.order.filter(id => ST.S.skills[id] && ST.S.skills[id].m);
  const dueList = () => mastered().filter(id => (ST.S.skills[id].due || today()) <= today()).sort((a, b) => (ST.S.skills[a].due || "").localeCompare(ST.S.skills[b].due || "") || (ST.S.skills[a].box || 1) - (ST.S.skills[b].box || 1));
  function grade(id, ok) {
    const s = ST.S.skills[id]; if (!s) return;
    s.box = ok ? Math.min((s.box || 1) + 1, 6) : 1;
    s.due = ST.dayKey(ST.addDays(ok ? INTERVAL[s.box] : 1));
    s.rv = (s.rv || 0) + 1;
  }
  function bankProblem(b) {
    const order = shuffle(b.o.map((_, i) => i));
    return { type: "choice", q: L2(b.q), tex: "", choices: order.map(i => L2(b.o[i])), ans: order.indexOf(b.a), ansText: L2(b.o[b.a]), explain: [{ t: L2(b.e) }], opts: {}, bank: true };
  }
  function bankFor(domains, n) {
    const bank = window.REVIEW_BANK || [];
    let pool = bank.filter(b => domains.has(b.d));
    if (pool.length < n) pool = bank;
    return shuffle(pool).slice(0, n);
  }

  /* ---------------- review home ---------------- */
  function renderReview(args) {
    const mode = args[0];
    if (mode === "placement") return placement();
    if (mode === "session") return session();
    if (mode === "challenge") return challenge();
    const S = ST.S, due = dueList(), ms = mastered(), log = S.reviewLog[today()] || {};
    const boxes = [1, 2, 3, 4, 5, 6].map(b => ms.filter(id => (S.skills[id].box || 1) === b).length), maxB = Math.max(1, ...boxes);
    const nx = ST.nextSkills(1)[0];
    $("reviewRoot").innerHTML = `<div class="review-grid">
      <article class="card rcard"><h3>${tr("مرور فاصله‌دار", "Spaced review")}</h3>
        <div class="review-due">${num(due.length)}</div><p class="muted">${due.length ? tr("مهارت برای مرور سررسید شده است. هر مرور درست فاصلهٔ مرور بعدی را بیشتر می‌کند (۱، ۳، ۷، ۱۴، ۳۰ و ۶۰ روز).", "skills are due. Each correct review pushes the next one further out (1, 3, 7, 14, 30 and 60 days).")
          : ms.length ? tr("امروز مرور سررسیدشده‌ای نداری. می‌توانی چند سؤال مفهومی جواب بدهی.", "Nothing is due today. You can still answer a few concept questions.") : tr("هنوز به مهارتی مسلط نشده‌ای؛ مهارت‌های مسلط‌شده این‌جا برای مرور برمی‌گردند. فعلاً سؤال‌های مفهومی را امتحان کن.", "You haven't mastered a skill yet; mastered skills come back here for review. Meanwhile, try some concept questions.")}</p>
        <div class="leitner" aria-label="${tr("جعبه‌های لایتنر", "Leitner boxes")}">${boxes.map((n, i) => `<div><span>${num(n)}</span><b style="height:${8 + 80 * n / maxB}%"></b><small>${tr("جعبهٔ ", "Box ")}${num(i + 1)}</small></div>`).join("")}</div>
        <button class="btn big" data-go="review/session">${due.length ? tr("شروع مرور", "Start review") : tr("سؤال‌های مفهومی", "Concept questions")} <span class="arrow">←</span></button></article>
      <article class="card rcard"><h3>${tr("چالش روزانه", "Daily challenge")}</h3>
        <p class="muted">${tr("یک مسئله از مهارت بعدی مسیرت. جواب درست امروز ۳۰ XP جایزه دارد.", "One problem from the next skill on your path. A correct answer today earns a 30 XP bonus.")}</p>
        <p>${nx ? "<b>" + esc(L(C.byId[nx])) + "</b>" : tr("مسیرت کامل است؛ یک مهارت تصادفی می‌آید.", "Your path is complete; you'll get a random skill.")}</p>
        <p class="muted">${log.challenge ? (log.challengeOk ? "✓ " + tr("امروز انجامش دادی.", "Done today.") : tr("امروز امتحانش کردی؛ فردا دوباره بیا.", "You tried today; come back tomorrow.")) : ""}</p>
        <button class="btn big" data-go="review/challenge"${log.challenge ? " disabled" : ""}>${tr("شروع چالش", "Start the challenge")} <span class="arrow">←</span></button></article>
      <article class="card rcard"><h3>${tr("آزمون تعیین سطح", "Placement test")}</h3>
        <p class="muted">${tr("آزمون تطبیقی: در هر حوزه از وسط شروع می‌کند و با جواب‌هایت بالا و پایین می‌رود. مهارت‌هایی که بلدی «مسلط» علامت می‌خورند و مسیرت از جای درست شروع می‌شود.", "Adaptive: in each area it starts in the middle and moves up or down with your answers. Skills you already know are marked as mastered, so your path starts at the right place.")}</p>
        <p class="muted">${S.placement ? tr("آخرین آزمون: ", "Last test: ") + I.date(new Date(S.placement.at)) + " · " + num(S.placement.n) + tr(" مهارت مسلط شد", " skills placed") : tr("حدود ۱۵ تا ۳۰ سؤال · ۱۵ دقیقه", "About 15–30 questions · 15 minutes")}</p>
        <button class="btn big" data-go="review/placement">${S.placement ? tr("دوباره آزمون بده", "Retake the test") : tr("شروع آزمون", "Start the test")} <span class="arrow">←</span></button></article></div>`;
    $("reviewRoot").querySelectorAll("[data-go]").forEach(b => b.onclick = () => APP.go(b.dataset.go));
  }

  /* generic runner for a list of items {skill?, problem} */
  function runQueue(title, queue, onAnswer, onDone, opts) {
    opts = opts || {};
    let i = 0; const results = [];
    const step = () => {
      if (i >= queue.length) { onDone(results); return; }
      const it = queue[i];
      if (!it.problem) it.problem = it.skill ? PR.generate(it.skill) : bankProblem(it.bank);
      const dots = queue.map((_, j) => `<i class="${j < i ? (results[j] ? "ok" : "no") : j === i ? "cur" : ""}"></i>`).join("");
      $("reviewRoot").innerHTML = `<div class="session-top"><b>${esc(title)}</b><div class="qdots">${dots}</div><span class="muted">${it.skill ? esc(L(C.byId[it.skill])) : tr("سؤال مفهومی", "Concept question")}</span><button class="btn alt" id="quitQ">${tr("پایان", "Quit")}</button></div><div id="qSlot"></div>`;
      $("quitQ").onclick = () => onDone(results, true);
      APP.mountProblem($("qSlot"), it.problem, Object.assign({
        onResult: (ok, skipped) => { results[i] = ok; onAnswer(it, ok, skipped); },
        onNext: () => { i++; step(); },
        nextLabel: i === queue.length - 1 ? tr("نتیجه", "Results") : tr("بعدی", "Next"),
      }, opts));
    };
    step();
  }
  function resultCard(title, results, extra) {
    const ok = results.filter(Boolean).length;
    $("reviewRoot").innerHTML = `<div class="card result-card quiz"><h2>${esc(title)}</h2><div class="big-score"><bdi dir="ltr">${num(ok)} / ${num(results.length)}</bdi></div>${extra || ""}
      <div class="row-btns" style="justify-content:center"><button class="btn" data-go="review">${tr("بازگشت به مرور", "Back to review")}</button><button class="btn alt" data-go="learn">${tr("مسیر یادگیری", "Learning path")}</button></div></div>`;
    $("reviewRoot").querySelectorAll("[data-go]").forEach(b => b.onclick = () => APP.go(b.dataset.go));
  }

  function session() {
    const due = dueList().slice(0, 8), S = ST.S;
    const touched = new Set(Object.keys(S.skills).filter(id => C.byId[id]).map(id => C.byId[id].d));
    if (S.goal === "d" || touched.has("stats")) { touched.add("py"); touched.add("ml"); }
    const queue = due.map(id => ({ skill: id })).concat(bankFor(touched, due.length ? 2 : 6).map(b => ({ bank: b })));
    const shuffled = shuffle(queue);
    runQueue(tr("مرور روزانه", "Daily review"), shuffled, (it, ok) => {
      if (it.skill) grade(it.skill, ok);
      if (ok) S.reviewXP += it.skill ? 15 : 5;
      ST.bumpActivity(1); ST.save();
    }, (res, quit) => {
      S.reviewSessions++; ST.save({ quiet: true });
      const rows = shuffled.map((it, j) => j < res.length ? `<li><span>${it.skill ? esc(L(C.byId[it.skill])) : tr("سؤال مفهومی", "Concept question")}</span><b class="${res[j] ? "good" : "bad"}" style="background:none">${res[j] ? "✓" : "✗"}</b></li>` : "").join("");
      resultCard(quit ? tr("مرور نیمه‌کاره", "Review ended early") : tr("مرور امروز تمام شد!", "Today's review is done!"), res, `<ul class="result-list">${rows}</ul><p class="muted">${tr("مهارت‌هایی که درست جواب دادی دیرتر برمی‌گردند؛ بقیه فردا دوباره می‌آیند.", "Skills you got right come back later; the rest return tomorrow.")}</p>`);
    }, { xp: 15 });
  }

  function challenge() {
    const S = ST.S, k = today();
    if (S.reviewLog[k] && S.reviewLog[k].challenge) { APP.go("review"); return; }
    let id = ST.nextSkills(1)[0];
    if (!id) { const all = C.order.filter(x => PR.has(x)); id = all[Math.floor(Math.random() * all.length)]; }
    runQueue(tr("چالش روزانه", "Daily challenge"), [{ skill: id }], (it, ok) => {
      S.reviewLog[k] = Object.assign(S.reviewLog[k] || {}, { challenge: true, challengeOk: ok });
      if (ok) S.reviewXP += 30;
      ST.recordAnswer(id, ok);
    }, res => resultCard(tr("چالش روزانه", "Daily challenge"), res, `<p>${res[0] ? tr("آفرین! ۳۰ XP جایزه گرفتی.", "Well done! You earned a 30 XP bonus.") : tr("اشکالی ندارد؛ درس این مهارت را بخوان و فردا دوباره امتحان کن.", "No problem — read this skill's lesson and try again tomorrow.")}</p><p><a class="btn alt" href="#skill/${id}">${esc(L(C.byId[id]))}</a></p>`), { xp: 30 });
  }

  /* ---------------- adaptive placement ---------------- */
  function placement() {
    const S = ST.S;
    if (!S.goal) S.goal = "d";
    const path = ST.path(S.goal).filter(id => PR.has(id));
    const doms = C.domains.map(d => ({ d, list: path.filter(id => C.byId[id].d === d.id) })).filter(x => x.list.length)
      .sort((a, b) => path.indexOf(a.list[0]) - path.indexOf(b.list[0]));
    $("reviewRoot").innerHTML = `<div class="card quiz result-card"><h2>${tr("آزمون تعیین سطح", "Placement test")}</h2>
      <p>${tr("برای هدف «" + esc(L(C.goals[S.goal])) + "»، " + num(doms.length) + " حوزه را می‌سنجیم. در هر حوزه حداکثر ۴ سؤال می‌آید و سختی با جواب‌هایت تنظیم می‌شود.", "For the goal “" + esc(L(C.goals[S.goal])) + "” we'll check " + doms.length + " areas. Each area has at most 4 questions, and the difficulty adapts to your answers.")}</p>
      <p class="muted">${tr("اگر جواب را نمی‌دانی، «بلد نیستم» را بزن — حدس زدن فقط مسیرت را خراب می‌کند. راهنمایی و راه‌حل در این آزمون نمایش داده نمی‌شود.", "If you don't know an answer, press “I don't know” — guessing only spoils your path. Hints and solutions are hidden during the test.")}</p>
      <div class="place-dom">${doms.map(x => `<span>${esc(L(x.d))}</span>`).join("")}</div>
      <div class="row-btns" style="justify-content:center"><button class="btn" id="placeGo">${tr("شروع", "Start")} <span class="arrow">←</span></button><button class="btn alt" id="placeZero">${tr("از صفر شروع می‌کنم", "I'll start from zero")}</button></div></div>`;
    $("placeZero").onclick = () => { S.placement = { at: Date.now(), n: 0 }; ST.save({ quiet: true }); APP.go("learn"); };
    $("placeGo").onclick = () => {
      let di = 0, lo = 0, hi = doms.length ? doms[0].list.length : 0, probes = 0, asked = 0, right = 0;
      const known = new Set();
      const nextDomain = () => { doms[di].lo = lo; for (let j = 0; j < lo; j++) known.add(doms[di].list[j]); di++; if (di < doms.length) { lo = 0; hi = doms[di].list.length; probes = 0; } };
      const ask = () => {
        while (di < doms.length && (lo >= hi || probes >= 4)) nextDomain();
        if (di >= doms.length) return finish();
        const D = doms[di], mid = Math.floor((lo + hi) / 2), id = D.list[mid], p = PR.generate(id);
        $("reviewRoot").innerHTML = `<div class="session-top"><b>${tr("آزمون تعیین سطح", "Placement test")}</b><div class="bar"><i style="width:${(100 * di / doms.length).toFixed(0)}%"></i></div><span class="muted">${tr("سؤال ", "Question ")}${num(asked + 1)}</span><button class="btn alt" id="quitQ">${tr("پایان و ثبت", "Finish now")}</button></div>
          <div class="place-dom">${doms.map((x, j) => `<span class="${j < di ? "done" : j === di ? "cur" : ""}">${esc(L(x.d))}</span>`).join("")}</div><div id="qSlot"></div>`;
        $("quitQ").onclick = () => { di = doms.length; finish(); };
        APP.mountProblem($("qSlot"), p, {
          allowHint: false, allowSolution: false, autoSolution: false, skipLabel: tr("بلد نیستم", "I don't know"), nextLabel: tr("بعدی", "Next"),
          note: esc(L(D.d)) + " · " + esc(L(C.byId[id])),
          onResult: ok => { asked++; probes++; if (ok) { right++; lo = mid + 1; } else hi = mid; ST.bumpActivity(1); },
          onNext: ask,
        });
      };
      const finish = () => {
        /* place known skills whose prerequisites are also known or mastered, in prerequisite order */
        const placed = [];
        C.order.forEach(id => { if (known.has(id) && C.byId[id].pre.every(p => (ST.S.skills[p] && ST.S.skills[p].m) || placed.includes(p))) placed.push(id); });
        const fresh = placed.filter(id => !(ST.S.skills[id] && ST.S.skills[id].m));
        S.placement = { at: Date.now(), n: fresh.length, asked, right };
        ST.place(fresh);
        const rows = doms.map(x => { const k = x.list.filter(id => placed.includes(id) || (ST.S.skills[id] && ST.S.skills[id].m)).length; return `<li><span>${esc(L(x.d))}</span><span><bdi dir="ltr">${num(k)} / ${num(x.list.length)}</bdi></span></li>`; }).join("");
        const nx = ST.nextSkills(1)[0];
        $("reviewRoot").innerHTML = `<div class="card result-card quiz"><h2>${tr("نتیجهٔ آزمون تعیین سطح", "Placement result")}</h2><div class="big-score">${num(fresh.length)}</div><p>${tr("مهارت به‌عنوان «مسلط» علامت خورد. این مهارت‌ها در مرور فاصله‌دار دوباره سنجیده می‌شوند.", "skills were marked as mastered. They'll be checked again in spaced review.")}</p>
          <ul class="result-list">${rows}</ul>
          <div class="row-btns" style="justify-content:center">${nx ? `<a class="btn" href="#skill/${nx}">${tr("قدم بعدی: ", "Next step: ")}${esc(L(C.byId[nx]))}</a>` : ""}<button class="btn alt" data-go="learn">${tr("نقشهٔ مهارت‌ها", "Skill map")}</button></div></div>`;
        $("reviewRoot").querySelectorAll("[data-go]").forEach(b => b.onclick = () => APP.go(b.dataset.go));
      };
      ask();
    };
  }
  APP.onPage("review", renderReview);

  /* ---------------- achievements ---------------- */
  const cnt = f => Object.values(ST.S.skills).filter(f).length;
  const BADGES = [
    ["first-read", "📖", ["اولین درس", "First lesson"], ["یک درس را تا آخر بخوان.", "Read a lesson to the end."], () => cnt(s => s.read) >= 1],
    ["first-mastery", "🏅", ["اولین تسلط", "First mastery"], ["به یک مهارت مسلط شو.", "Master one skill."], () => cnt(s => s.m && !s.placed) >= 1],
    ["m5", "⭐", ["پنج مهارت", "Five skills"], ["به ۵ مهارت مسلط شو.", "Master 5 skills."], () => cnt(s => s.m) >= 5],
    ["m15", "🌟", ["پانزده مهارت", "Fifteen skills"], ["به ۱۵ مهارت مسلط شو.", "Master 15 skills."], () => cnt(s => s.m) >= 15],
    ["m30", "💫", ["سی مهارت", "Thirty skills"], ["به ۳۰ مهارت مسلط شو.", "Master 30 skills."], () => cnt(s => s.m) >= 30],
    ["goal", "🎓", ["هدف کامل", "Goal complete"], ["همهٔ مهارت‌های هدفت را مسلط شو.", "Master every skill in your goal."], () => ST.path().every(id => ST.S.skills[id] && ST.S.skills[id].m)],
    ["streak3", "🔥", ["سه روز پیاپی", "Three-day streak"], ["سه روز پشت سر هم تمرین کن.", "Practice three days in a row."], () => ST.longestStreak() >= 3],
    ["streak7", "⚡", ["یک هفتهٔ کامل", "A full week"], ["هفت روز پیاپی تمرین کن.", "Practice seven days in a row."], () => ST.longestStreak() >= 7],
    ["streak30", "🏆", ["یک ماه پیوسته", "A month straight"], ["سی روز پیاپی تمرین کن.", "Practice thirty days in a row."], () => ST.longestStreak() >= 30],
    ["c50", "🎯", ["۵۰ جواب درست", "50 correct answers"], ["۵۰ تمرین را درست حل کن.", "Solve 50 practice problems correctly."], () => ST.S.practiceCorrect >= 50],
    ["c250", "🧠", ["۲۵۰ جواب درست", "250 correct answers"], ["۲۵۰ تمرین را درست حل کن.", "Solve 250 practice problems correctly."], () => ST.S.practiceCorrect >= 250],
    ["placement", "🧭", ["جای درست", "Right place"], ["آزمون تعیین سطح را بده.", "Take the placement test."], () => !!(ST.S.placement && ST.S.placement.asked)],
    ["review5", "🔁", ["مرورگر", "Reviewer"], ["پنج جلسهٔ مرور را تمام کن.", "Finish five review sessions."], () => ST.S.reviewSessions >= 5],
    ["solver", "🧮", ["حل‌گر", "Solver"], ["۱۰ مسئله را با حل‌گر گام‌به‌گام حل کن.", "Solve 10 problems with the step-by-step solver."], () => ST.S.solved >= 10],
    ["python", "🐍", ["پایتونیست", "Pythonista"], ["۱۰ بار کد پایتون اجرا کن.", "Run Python code 10 times."], () => ST.S.pyRuns >= 10],
    ["project", "📊", ["پروژهٔ واقعی", "Real project"], ["یک پروژهٔ داده را کامل کن.", "Complete a data project."], () => Object.values(ST.S.projects).some(p => p && p.done)],
    ["level10", "👑", ["سطح ۱۰", "Level 10"], ["به سطح ۱۰ برس.", "Reach level 10."], () => ST.levelOf(ST.xp()) >= 10],
  ].concat(C.domains.map(d => ["dom-" + d.id, d.icon, [d.fa, d.en], ["همهٔ مهارت‌های حوزهٔ «" + d.fa + "» را مسلط شو.", "Master every skill in “" + d.en + "”."], () => C.skills.filter(s => s.d === d.id).every(s => ST.S.skills[s.id] && ST.S.skills[s.id].m)]));
  function checkBadges() {
    const S = ST.S; S.badgeAt = S.badgeAt && typeof S.badgeAt === "object" ? S.badgeAt : {};
    const fresh = BADGES.filter(b => !S.badges.includes(b[0]) && b[4]());
    if (!fresh.length) return;
    fresh.forEach(b => { S.badges.push(b[0]); S.badgeAt[b[0]] = Date.now(); });
    ST.save({ quiet: true });
    APP.toast(fresh.map(b => b[1] + " " + tr("دستاورد تازه: ", "New achievement: ") + "<b>" + esc(L2(b[2])) + "</b>").join("<br>"));
  }
  function renderBadges() {
    const S = ST.S, got = BADGES.filter(b => S.badges.includes(b[0])).length;
    $("badgeCount").innerHTML = '<bdi dir="ltr">' + num(got) + " / " + num(BADGES.length) + "</bdi>";
    $("badgeRoot").innerHTML = BADGES.map(b => { const on = S.badges.includes(b[0]), at = S.badgeAt && S.badgeAt[b[0]];
      return `<div class="card badge${on ? " got" : ""}"><div class="bic">${esc(b[1])}</div><h3>${esc(L2(b[2]))}</h3><p class="muted">${esc(L2(b[3]))}</p>${on && at ? `<small class="when">${I.date(new Date(at))}</small>` : ""}</div>`; }).join("");
  }
  APP.onPage("achievements", () => { checkBadges(); renderBadges(); });
  let checking = false;
  ST.on("change", () => { if (checking) return; checking = true; try { checkBadges(); } finally { checking = false; } });

  /* ---------------- progress page ---------------- */
  function renderProgress() {
    const S = ST.S;
    const rows = C.domains.map(d => {
      const list = C.skills.filter(s => s.d === d.id), m = list.filter(s => S.skills[s.id] && S.skills[s.id].m).length;
      const h = list.flatMap(s => (S.skills[s.id] ? S.skills[s.id].h : [])), acc = h.length ? pct(h.filter(Boolean).length, h.length) : null;
      return `<div class="dom-row"><span>${esc(d.icon)} ${esc(L(d))}</span><div class="bar"><i class="${m === list.length ? "good" : ""}" style="width:${pct(m, list.length)}%"></i></div><small class="muted"><bdi dir="ltr">${num(m)}/${num(list.length)}</bdi>${acc !== null ? " · " + pctS(acc) : ""}</small></div>`;
    }).join("");
    $("domainBars").innerHTML = `<h3>${tr("تسلط در هر حوزه", "Mastery by area")}</h3><p class="muted">${tr("نوار: مهارت‌های مسلط‌شده · درصد: دقت تمرین", "Bar: mastered skills · percent: practice accuracy")}</p>${rows}
      <div class="kv"><div><b><bdi dir="ltr">${num(ST.xp())}</bdi></b><small>XP</small></div><div><b>${num(ST.longestStreak())}</b><small>${tr("بلندترین استریک", "Longest streak")}</small></div><div><b>${num(S.practiceTotal)}</b><small>${tr("تمرین پاسخ‌داده", "Problems answered")}</small></div>
      <div><b>${S.practiceTotal ? pctS(pct(S.practiceCorrect, S.practiceTotal)) : "—"}</b><small>${tr("دقت کل", "Overall accuracy")}</small></div><div><b>${num(S.reviewSessions)}</b><small>${tr("جلسهٔ مرور", "Review sessions")}</small></div><div><b>${num(dueList().length)}</b><small>${tr("مرور سررسید", "Reviews due")}</small></div></div>`;
    $("studyNotes").value = typeof S.notes === "string" ? S.notes : "";
    $("saveStatus").textContent = ST.serverOk ? tr("ذخیره در پوشهٔ data پروژه ✓", "Saved to the project's data folder ✓") : tr("ذخیره در همین مرورگر", "Saved in this browser");
  }
  APP.onPage("progress", renderProgress);
  $("studyNotes").addEventListener("change", () => { ST.S.notes = $("studyNotes").value; ST.save({ quiet: true }); });
  $("saveNotes").onclick = () => { ST.S.notes = $("studyNotes").value; ST.save({ quiet: true }); $("backupStatus").textContent = tr("یادداشت‌ها ذخیره شدند.", "Notes saved."); };
  $("exportData").onclick = () => {
    const blob = new Blob([JSON.stringify({ app: "math-data-science-academy", version: 3, exportedAt: new Date().toISOString(), progress: ST.S }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = "math-academy-backup-" + today() + ".json"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    $("backupStatus").textContent = tr("فایل پشتیبان ساخته شد.", "Backup file created.");
  };
  $("importData").onchange = async e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    try {
      const x = JSON.parse(await f.text()), p = x && x.progress ? x.progress : x;
      if (!p || typeof p !== "object" || Array.isArray(p)) throw Error("bad");
      const skills = {};
      Object.entries(p.skills && typeof p.skills === "object" ? p.skills : {}).forEach(([id, s]) => {
        if (!C.byId[id] || !s || typeof s !== "object") return;
        skills[id] = { h: Array.isArray(s.h) ? s.h.filter(v => v === 0 || v === 1).slice(-40) : [], read: !!s.read, m: !!s.m, placed: !!s.placed,
          box: Math.min(6, Math.max(1, Math.floor(+s.box) || 1)), due: typeof s.due === "string" && /^\d{4}-\d\d-\d\d$/.test(s.due) ? s.due : undefined, mAt: +s.mAt || undefined };
      });
      const clean = Object.assign({}, p, { skills, notes: typeof p.notes === "string" ? p.notes.slice(0, 100000) : "", name: typeof p.name === "string" ? p.name.slice(0, 30) : "" });
      ST.replace(clean);
      renderProgress();
      $("backupStatus").textContent = tr("پشتیبان بازیابی شد ✓", "Backup restored ✓");
    } catch (err) { $("backupStatus").textContent = tr("فایل پشتیبان معتبر نیست.", "That backup file isn't valid."); }
    e.target.value = "";
  };
  let resetArmed = 0;
  $("resetAll").onclick = () => {
    if (Date.now() - resetArmed > 5000) { resetArmed = Date.now(); $("resetAll").textContent = tr("برای تأیید دوباره بزن", "Click again to confirm"); setTimeout(() => { $("resetAll").textContent = tr("بازنشانی پیشرفت", "Reset progress"); }, 5000); return; }
    resetArmed = 0;
    const keep = { name: ST.S.name, notes: ST.S.notes };
    ST.replace(keep);
    $("resetAll").textContent = tr("بازنشانی پیشرفت", "Reset progress");
    $("backupStatus").textContent = tr("پیشرفت بازنشانی شد (نام و یادداشت‌ها حفظ شدند).", "Progress reset (name and notes kept).");
    renderProgress();
  };

  window.REVIEW = { dueCount: () => dueList().length, dueList, grade, BADGES, checkBadges };
})();
