/* Reusable problem card: shows a generated problem, reads the answer (typed or multiple choice),
   checks it, and offers a hint and a full step-by-step solution. Used by practice, review and placement. */
(function () {
  "use strict";
  const I = window.I18N, tr = I.T, E = window.MathEngine, MD = window.MD, CHECK = window.CHECK;
  const APP = window.APP = window.APP || {};
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const KEYS = ["sqrt(", "^", "pi", "/", "(", ")", "<=", ">=", ",", "oo"];
  const KLAB = { "sqrt(": "√", "pi": "π", "<=": "≤", ">=": "≥", "oo": "∞" };
  const PLACE = () => ({
    num: tr("جواب عددی… (کسر مثل 3/4 هم قبول است)", "Number… (fractions like 3/4 are fine)"),
    expr: tr("عبارت… مثلاً 2x+3 یا (x-1)(x+2)", "Expression… e.g. 2x+3 or (x-1)(x+2)"),
    set: tr("مقادیر با ویرگول… مثلاً 2, -3 (یا none)", "Values separated by commas… e.g. 2, -3 (or none)"),
    ineq: tr("مثلاً x < 3 یا (2, 5]", "e.g. x < 3 or (2, 5]"),
    tuple: tr("مثلاً (2, -1)", "e.g. (2, -1)"),
    matrix: tr("سطرها با ; … مثلاً 1 2; 3 4", "Rows separated by ; … e.g. 1 2; 3 4"),
  });
  const stepsHtml = steps => '<div class="steps">' + steps.map(s => `<div class="stepc"><h4>${esc(s.t || "")}</h4>${s.tex ? `<div class="m">${MD.renderMath(s.tex, true)}</div>` : ""}${s.note ? `<div class="n">${/\\/.test(s.note) ? MD.renderMath(s.note, false) : esc(s.note)}</div>` : ""}</div>`).join("") + "</div>";
  APP.stepsHtml = stepsHtml;
  function solutionSteps(p) {
    let steps = [];
    if (p.solve) { try { const res = p.solve(); steps = (res.steps || []).map(s => ({ t: s.title, tex: s.tex, note: s.note })); if (res.answer) steps.push({ t: tr("جواب", "Answer"), tex: res.answer }); } catch (e) { steps = []; } }
    if (!steps.length && p.explain) steps = p.explain.map(x => ({ t: x.t, tex: x.tex }));
    if (!steps.length) steps = [{ t: tr("جواب", "Answer"), tex: p.ansTex || "" }];
    return steps;
  }

  /* opts: { onResult(ok, skipped), onNext(), nextLabel, allowSkip, allowSolution, allowHint, autoSolution, note, skipLabel, xp } */
  APP.mountProblem = function (root, p, opts) {
    opts = opts || {};
    let answered = false, choiceSel = null;
    const place = PLACE();
    root.innerHTML = `<div class="card prob"><div class="prob-q">${MD.render(p.q)}</div>${p.tex ? `<div class="prob-tex">${MD.renderMath(p.tex, true)}</div>` : ""}
      ${p.type === "choice" ? `<div class="choices">${p.choices.map((c, i) => `<button class="qopt" data-i="${i}">${MD.render(c).replace(/^<p>|<\/p>$/g, "")}</button>`).join("")}</div>`
        : `<div class="ans-row"><input class="ans-input" dir="ltr" autocomplete="off" spellcheck="false" autocapitalize="off" placeholder="${esc(place[p.type] || "")}" aria-label="${tr("جواب", "Answer")}"><button class="btn check-btn">${tr("بررسی", "Check")}</button></div>
        <div class="ans-keys">${KEYS.map(k => `<button type="button" data-k="${esc(k)}" aria-label="${esc(KLAB[k] || k)}">${esc(KLAB[k] || k)}</button>`).join("")}</div><div class="ans-preview"></div>`}
      <div class="feedback" role="status"></div>
      <div class="prob-actions"><button class="btn alt hint-btn"${p.hint && opts.allowHint !== false ? "" : " hidden"}>💡 ${tr("راهنمایی", "Hint")}</button>${opts.allowSolution === false ? "" : `<button class="btn alt sol-btn">${tr("راه‌حل کامل", "Full solution")}</button>`}
      <button class="btn next-btn" hidden>${esc(opts.nextLabel || tr("مسئلهٔ بعدی", "Next problem"))} <span class="arrow">←</span></button>${opts.allowSkip === false ? "" : `<button class="btn alt skip-btn">${esc(opts.skipLabel || tr("رد کردن", "Skip"))}</button>`}</div>
      <div class="md-box md-tip hint-box" hidden></div><div class="sol-box" hidden></div></div>${opts.note ? `<p class="muted center">${opts.note}</p>` : ""}`;
    const q = sel => root.querySelector(sel);
    const inp = q(".ans-input"), fb = q(".feedback");
    const preview = () => {
      const v = inp.value.trim(), box = q(".ans-preview");
      if (!v || ["ineq", "matrix"].includes(p.type)) { box.innerHTML = ""; return; }
      try {
        const tex = v.split(/,(?![^()]*\))/).map(x => x.trim()).filter(Boolean).map(x => E.parseStatement(x).map(g => g.parts.map(E.tex).reduce((a, t, i) => a + (i ? " " + E.relTex(g.rels[i - 1]) + " " : "") + t, "")).join(", ")).join(",\\; ");
        box.innerHTML = MD.renderMath(tex, false);
      } catch (e) { box.innerHTML = ""; }
    };
    const finish = (ok, r, gaveUp) => {
      answered = true;
      const ans = p.ansTex ? MD.renderMath(p.ansTex, false) : esc(p.ansText ? p.ansText.replace(/\$/g, "") : p.ansStr);
      fb.className = "feedback show " + (ok ? "good" : "bad");
      fb.innerHTML = ok ? "✓ " + tr("درست است!", "Correct!") + (opts.xp ? " +" + I.num(opts.xp) + " XP" : "") : (gaveUp ? "" : "✗ " + (r && r.msg ? esc(r.msg) + " " : tr("درست نیست. ", "Not quite. "))) + tr("جواب درست: ", "Correct answer: ") + ans;
      if (inp) { inp.readOnly = true; q(".check-btn").disabled = true; }
      if (p.type === "choice") root.querySelectorAll(".qopt").forEach((b, j) => { b.disabled = true; if (j === p.ans) b.classList.add("right"); else if (j === choiceSel) b.classList.add("wrong"); });
      const nb = q(".next-btn"); nb.hidden = false; const sk = q(".skip-btn"); if (sk) sk.hidden = true;
      if (opts.onResult) opts.onResult(ok);
      if (!ok && opts.autoSolution !== false) showSolution();
      setTimeout(() => nb.focus(), 30);
    };
    const showSolution = () => { const box = q(".sol-box"); box.hidden = false; box.innerHTML = `<h3>${tr("راه‌حل", "Solution")}</h3>` + stepsHtml(solutionSteps(p)); };
    const submit = () => {
      if (answered) return;
      const r = CHECK.check(p, p.type === "choice" ? choiceSel : inp.value);
      if (r.empty) { fb.className = "feedback show bad"; fb.textContent = r.msg; return; }
      finish(r.ok, r);
    };
    if (inp) {
      inp.addEventListener("input", preview);
      inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); if (answered) q(".next-btn").click(); else submit(); } });
      root.querySelectorAll("[data-k]").forEach(b => { b.onmousedown = e => e.preventDefault(); b.onclick = () => { if (answered) return; const k = b.dataset.k, s0 = inp.selectionStart ?? inp.value.length; inp.setRangeText(k.endsWith("(") ? k + ")" : k, s0, inp.selectionEnd ?? s0, "end"); if (k.endsWith("(")) inp.setSelectionRange(inp.selectionStart - 1, inp.selectionStart - 1); inp.focus(); preview(); }; });
      q(".check-btn").onclick = submit;
      if (opts.autofocus !== false) setTimeout(() => inp.focus({ preventScroll: true }), 50);
    } else root.querySelectorAll(".qopt").forEach(b => b.onclick = () => { if (answered) return; choiceSel = +b.dataset.i; submit(); });
    if (q(".hint-btn")) q(".hint-btn").onclick = () => { const h = q(".hint-box"); h.hidden = false; h.innerHTML = `<div class="md-box-h"><span class="md-tag">${tr("راهنمایی", "Hint")}</span></div>` + MD.render(p.hint || ""); };
    if (q(".sol-btn")) q(".sol-btn").onclick = () => { if (!answered) finish(false, null, true); else showSolution(); };
    q(".next-btn").onclick = () => opts.onNext && opts.onNext();
    if (q(".skip-btn")) q(".skip-btn").onclick = () => { if (!answered) { answered = true; if (opts.onResult) opts.onResult(false, true); } if (opts.onNext) opts.onNext(); };
    return { isAnswered: () => answered };
  };
})();
