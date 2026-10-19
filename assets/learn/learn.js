/* Learning path (knowledge map) and skill pages: lesson + endless auto-graded practice with mastery. */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const I = window.I18N, tr = I.T, num = n => I.num(n);
  const ST = window.STORE, C = window.CURRICULUM, E = window.MathEngine, MD = window.MD, CHECK = window.CHECK, PR = window.PRACTICE, APP = window.APP;
  const esc = APP.esc, L = APP.L;
  const statusLabel = s => ({ mastered: tr("مسلط", "Mastered"), progress: tr("در حال یادگیری", "In progress"), available: tr("آمادهٔ شروع", "Ready"), locked: tr("نیازمند پیش‌نیاز", "Needs prerequisites") }[s]);

  /* ======================= Learn page (map) ======================= */
  let domainFilter = "all";
  function renderLearn() {
    const S = ST.S, goal = S.goal || "d";
    $("goalChips").innerHTML = Object.entries(C.goals).map(([k, g]) => `<button class="chip-goal${k === goal ? " active" : ""}" role="radio" aria-checked="${k === goal}" data-g="${k}">${esc(L(g))}</button>`).join("");
    $("goalChips").querySelectorAll("[data-g]").forEach(b => b.onclick = () => { S.goal = b.dataset.g; ST.save({ quiet: true }); renderLearn(); });
    const list = ST.path(goal), mastered = list.filter(id => ST.status(id) === "mastered").length;
    $("goalTitle").textContent = L(C.goals[goal]);
    $("goalCount").innerHTML = '<bdi dir="ltr">' + num(mastered) + " / " + num(list.length) + "</bdi> " + tr("مهارت مسلط", "skills mastered");
    $("goalFill").style.width = (100 * mastered / Math.max(1, list.length)).toFixed(1) + "%";
    const nx = ST.nextSkills(1)[0];
    $("goalNext").onclick = () => nx && APP.go("skill/" + nx);
    $("goalNext").disabled = !nx;
    $("domainChips").innerHTML = [`<button class="chip${domainFilter === "all" ? " active" : ""}" data-d="all">${tr("همه", "All")}</button>`].concat(C.domains.map(d => `<button class="chip${domainFilter === d.id ? " active" : ""}" data-d="${d.id}">${esc(L(d))}</button>`)).join("");
    $("domainChips").querySelectorAll("[data-d]").forEach(b => b.onclick = () => { domainFilter = b.dataset.d; renderLearn(); });
    renderMap();
  }
  function renderMap() {
    const goalSet = new Set(ST.path()), only = $("onlyGoal").checked, q = $("learnSearch").value.trim().toLowerCase();
    const match = s => !q || (s.fa + " " + s.en + " " + s.id).toLowerCase().includes(q);
    const cols = C.domains.filter(d => domainFilter === "all" || d.id === domainFilter).map(d => {
      const items = C.order.map(id => C.byId[id]).filter(s => s.d === d.id && (!only || goalSet.has(s.id)) && match(s));
      if (!items.length) return "";
      const done = items.filter(s => ST.status(s.id) === "mastered").length;
      return `<section class="map-col"><h3><span class="dic">${esc(d.icon)}</span>${esc(L(d))}<small><bdi dir="ltr">${num(done)}/${num(items.length)}</bdi></small></h3>` +
        items.map(s => { const st = ST.status(s.id), m = ST.masteryCount(s.id);
          return `<a class="node ${st}" href="#skill/${s.id}" data-id="${s.id}"><span class="node-t">${esc(L(s))}</span><span class="node-m"><i style="width:${st === "mastered" ? 100 : m * 10}%"></i></span><span class="node-s">${statusLabel(st)}</span></a>`; }).join("") + "</section>";
    }).join("");
    $("skillMap").innerHTML = cols || `<p class="muted">${tr("مهارتی پیدا نشد.", "No skills found.")}</p>`;
    $("skillMap").querySelectorAll(".node").forEach(n => {
      const on = () => { const s = C.byId[n.dataset.id]; const pre = C.closure(s.pre); $("skillMap").querySelectorAll(".node").forEach(m => { m.classList.toggle("is-pre", pre.has(m.dataset.id)); m.classList.toggle("is-dep", C.byId[m.dataset.id].pre.includes(s.id)); }); };
      const off = () => $("skillMap").querySelectorAll(".node").forEach(m => m.classList.remove("is-pre", "is-dep"));
      n.addEventListener("mouseenter", on); n.addEventListener("focus", on); n.addEventListener("mouseleave", off); n.addEventListener("blur", off);
    });
  }
  $("learnSearch").addEventListener("input", renderMap);
  $("onlyGoal").addEventListener("change", renderMap);
  APP.onPage("learn", renderLearn);

  /* ======================= Skill page ======================= */
  let current = null, problem = null, answered = false, choiceSel = null;
  function renderSkill(args) {
    const id = args[0], s = C.byId[id];
    if (!s) { APP.go("learn"); return; }
    if (current !== id) { problem = null; answered = false; }
    current = id;
    head(id);
    const tab = args[1] === "practice" ? "practice" : "lesson";
    document.querySelectorAll(".tabs .tab").forEach(t => { const on = t.dataset.tab === tab; t.classList.toggle("active", on); t.setAttribute("aria-selected", on); });
    $("tab-lesson").hidden = tab !== "lesson"; $("tab-practice").hidden = tab !== "practice";
    if (tab === "lesson") renderLesson(id); else renderPractice(id);
  }
  function head(id) {
    const s = C.byId[id], dom = C.domains.find(d => d.id === s.d), st = ST.status(id), rec = ST.recent(id), m = ST.masteryCount(id);
    $("skillCrumb").textContent = L(dom);
    const chip = pid => `<a class="pre-chip ${ST.status(pid)}" href="#skill/${pid}">${esc(L(C.byId[pid]))}</a>`;
    const unlocks = C.skills.filter(x => x.pre.includes(id));
    const dots = Array.from({ length: ST.MASTERY_WINDOW }, (_, i) => { const v = rec[rec.length - ST.MASTERY_WINDOW + i]; return `<i class="${v === 1 ? "ok" : v === 0 ? "no" : ""}"></i>`; }).join("");
    $("skillHead").innerHTML = `<div class="sh-main"><span class="sh-dom">${esc(dom.icon)} ${esc(L(dom))}</span><h1>${esc(L(s))}</h1>
      <div class="sh-meta"><span class="stbadge ${st}">${statusLabel(st)}</span><span class="muted">⏱ ${num(s.min)} ${tr("دقیقه", "min")}</span>${ST.S.skills[id] && ST.S.skills[id].placed ? `<span class="muted">${tr("(از آزمون تعیین سطح)", "(from the placement test)")}</span>` : ""}</div>
      ${s.pre.length ? `<div class="sh-row"><span class="muted">${tr("پیش‌نیازها:", "Prerequisites:")}</span>${s.pre.map(chip).join("")}</div>` : ""}
      ${unlocks.length ? `<div class="sh-row"><span class="muted">${tr("باز می‌کند:", "Unlocks:")}</span>${unlocks.map(u => chip(u.id)).join("")}</div>` : ""}</div>
      <div class="sh-mastery"><div class="mdots" title="${tr("۱۰ پاسخ آخر", "last 10 answers")}">${dots}</div><b><bdi dir="ltr">${num(m)} / ${num(ST.MASTERY_NEED)}</bdi></b><small class="muted">${st === "mastered" ? tr("مسلط شدی ✓", "Mastered ✓") : tr("برای تسلط: ۸ جواب درست از ۱۰ جواب آخر", "To master: 8 correct of your last 10")}</small></div>`;
  }
  document.querySelectorAll(".tabs .tab").forEach(t => t.onclick = () => APP.go("skill/" + current + (t.dataset.tab === "practice" ? "/practice" : "")));
  APP.onPage("skill", renderSkill);

  function renderLesson(id) {
    const s = C.byId[id], md = window.LESSONS && window.LESSONS[id] && window.LESSONS[id][I.lang];
    const body = $("lessonBody");
    body.innerHTML = (md ? MD.render(md) : `<p class="muted">${tr("درس این مهارت هنوز نوشته نشده است.", "This lesson hasn't been written yet.")}</p>`) +
      `<div class="lesson-end"><p>${tr("درس را خواندی؟ حالا با تمرین‌های بی‌پایان مهارتت را محکم کن.", "Done reading? Now lock it in with endless practice.")}</p><button class="btn big" id="toPractice">${tr("شروع تمرین", "Start practicing")} <span class="arrow">←</span></button>
      <a class="btn alt" href="solver.html">${tr("حل‌گر گام‌به‌گام", "Step-by-step solver")}</a></div>`;
    MD.mount(body);
    const toc = MD.toc(body);
    $("lessonToc").innerHTML = `<h3>${tr("در این درس", "In this lesson")}</h3>` + (toc.length ? `<ol>${toc.map(h => `<li class="l${h.level}"><a href="#" data-to="${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>` : "") +
      `<p class="muted">${tr("زمان تقریبی: ", "Estimated time: ")}${num(s.min)} ${tr("دقیقه", "min")}</p>`;
    $("lessonToc").querySelectorAll("[data-to]").forEach(a => a.onclick = e => { e.preventDefault(); const t = document.getElementById(a.dataset.to); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); });
    $("toPractice").onclick = () => { ST.markRead(id); APP.go("skill/" + id + "/practice"); };
    /* mark as read once the end of the lesson is visible */
    if ("IntersectionObserver" in window) { const ob = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { ST.markRead(id); ob.disconnect(); } }); ob.observe(body.querySelector(".lesson-end")); }
  }

  /* ----- practice ----- */
  function renderPractice(id) {
    const root = $("practiceRoot");
    if (!PR.has(id)) { root.innerHTML = `<p class="muted">${tr("تمرینی برای این مهارت تعریف نشده است.", "No practice is defined for this skill.")}</p>`; return; }
    if (!problem || problem.skill !== id || answered) { problem = PR.generate(id); answered = false; }
    const locked = ST.status(id) === "locked";
    root.innerHTML = (locked ? `<div class="card warn">${tr("هنوز به همهٔ پیش‌نیازهای این مهارت مسلط نشده‌ای؛ می‌توانی تمرین کنی، اما بهتر است اول آن‌ها را کامل کنی.", "You haven't mastered all prerequisites yet. You can still practice, but it's better to finish them first.")}</div>` : "") + '<div id="probSlot"></div>';
    APP.mountProblem($("probSlot"), problem, {
      xp: ST.XP.correct,
      note: tr("هر جواب درست ۱۰ XP دارد. «رد کردن» یا دیدن راه‌حل پیش از جواب، پاسخ غلط حساب می‌شود.", "Each correct answer earns 10 XP. Skipping or opening the solution before answering counts as a wrong answer."),
      onResult: ok => { answered = true; ST.recordAnswer(id, ok); head(id); },
      onNext: () => renderPractice(id),
    });
  }
  APP.renderSteps = steps => steps.map(s => `<div class="stepc"><h4>${esc(s.t || "")}</h4>${s.tex ? `<div class="m">${MD.renderMath(s.tex, true)}</div>` : ""}</div>`).join("");
})();
