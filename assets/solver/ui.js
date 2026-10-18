/* Solver page UI: categories, math keyboard, live preview, solving, steps, graph,
   history & notebook, practice problems, shareable links and XP/streak integration. */
(function () {
  "use strict";
  const E = window.MathEngine, $ = id => document.getElementById(id);
  const K = (tex, display = true) => { try { return katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: "ignore", output: "html" }); } catch (e) { return "<code>" + esc(tex) + "</code>"; } };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fa = n => new Intl.NumberFormat("fa-IR").format(n);

  /* ---------------- category definitions ---------------- */
  const CATS = [
    { id: "arith", name: "حساب و اعداد", icon: "123", desc: "ترتیب عملیات، کسرها، توان و رادیکال، عوامل اول و ب.م.م",
      modes: [{ id: "calc", name: "محاسبه", ph: "مثلاً 2+3*(4-1)^2 یا 1/2+3/4", ex: ["2+3*(4-1)^2", "1/2+3/4", "(2/3)*(9/4)", "sqrt(144)/3+2^4", "5!/(2!*3!)", "sin(pi/6)+cos(0)"] },
        { id: "prime", name: "تجزیه به عوامل اول", ph: "یک عدد طبیعی، مثلاً 360", ex: ["360", "1001", "2024", "97"] },
        { id: "gcd", name: "ب.م.م و ک.م.م", ph: "اعداد را با ویرگول جدا کن: 12, 18", ex: ["12, 18", "84, 126", "8, 12, 20"] }] },
    { id: "algebra", name: "جبر", icon: "x²", desc: "ساده‌سازی، بسط، تجزیه و ساده کردن کسرهای جبری",
      modes: [{ id: "simplify", name: "ساده‌سازی", ph: "مثلاً 3(x-2)-2(x+1)", ex: ["3(x-2)-2(x+1)", "(x^2-9)/(x+3)", "1/x+1/(x+1)", "sin(x)^2+cos(x)^2"] },
        { id: "expand", name: "بسط", ph: "مثلاً (x+3)(2x-1)", ex: ["(x+3)(2x-1)", "(2x-5)^2", "(a+b)^3", "(x+1)(x^2-x+1)"] },
        { id: "factor", name: "تجزیه", ph: "مثلاً x^2-5x+6", ex: ["x^2-5x+6", "6x^2+x-2", "x^3-8", "x^4-16", "2x^3-8x", "x^3-6x^2+11x-6"] }] },
    { id: "equation", name: "معادله و نامعادله", icon: "=", desc: "خطی، درجه دو، چندجمله‌ای، کسری، قدرمطلق، رادیکالی، نمایی، لگاریتمی و مثلثاتی",
      modes: [{ id: "eq", name: "معادله", ph: "مثلاً x^2-5x+6=0", ex: ["2x+3=11", "x^2-5x+6=0", "2x^2+3x-2=0", "x^2-2x-1=0", "|2x-1|=5", "sqrt(x+3)=x-3", "2^x=32", "1/x+1/2=1", "sin(x)=1/2", "x^3-6x^2+11x-6=0"] },
        { id: "ineq", name: "نامعادله", ph: "مثلاً x^2-4>=0", ex: ["2x-3<5", "-3x+1>=7", "x^2-5x+6<0", "x^2-4>=0", "(x-1)/(x+2)<=0"] }],
      params: [{ id: "var", label: "متغیر", def: "", ph: "خودکار" }] },
    { id: "system", name: "دستگاه معادلات", icon: "{", desc: "دستگاه خطی ۲ یا ۳ مجهولی با حذف گاوسی؛ دستگاه‌های غیرخطی ساده", multiline: true,
      modes: [{ id: "sys", name: "دستگاه", ph: "هر معادله در یک خط:\n2x+3y=7\n4x-y=7", ex: ["2x+3y=7\n4x-y=7", "x+y+z=6\n2x-y+z=3\nx+2y-z=2", "x+y=2\n2x+2y=4", "x^2+y^2=25\nx-y=1"] }] },
    { id: "graph", name: "نمودار تابع", icon: "📈", desc: "رسم چند تابع با هم، ریشه‌ها، عرض از مبدأ و نقاط اکسترمم", multiline: true,
      modes: [{ id: "plot", name: "رسم", ph: "هر تابع در یک خط:\nx^2-4\n2x+1", ex: ["x^2-4\n2x+1", "sin(x)\ncos(x)", "x^3-3x", "1/(x-1)", "e^(-x^2)", "ln(x)\ne^x\nx"] }] },
    { id: "derivative", name: "مشتق", icon: "d/dx", desc: "مشتق با نمایش قاعده‌ها: توان، ضرب، تقسیم، زنجیره‌ای، نمایی، لگاریتمی و مثلثاتی",
      modes: [{ id: "d", name: "مشتق", ph: "مثلاً x^2*sin(x)", ex: ["x^3+2x^2-5x", "x^2*sin(x)", "sin(x)/x", "sqrt(3x^2+1)", "e^(2x)*cos(x)", "ln(x^2+1)", "(2x+1)^5", "x^x"] }],
      params: [{ id: "var", label: "نسبت به", def: "x" }, { id: "order", label: "مرتبه", def: "1", type: "select", options: [["1", "اول"], ["2", "دوم"], ["3", "سوم"]] }, { id: "at", label: "مقدار در نقطه (اختیاری)", def: "", ph: "مثلاً 2" }] },
    { id: "integral", name: "انتگرال", icon: "∫", desc: "نامعین و معین؛ جایگذاری، جزء‌به‌جزء، کسرهای جزئی و انتگرال ناسره",
      modes: [{ id: "i", name: "انتگرال", ph: "مثلاً x*e^x", ex: ["3x^2+2x-5", "x*e^x", "x*sin(x)", "2x*cos(x^2)", "x/(x^2+1)", "1/(x^2-1)", "sin(x)^2", "ln(x)", "x^3/(x-1)"] }],
      params: [{ id: "var", label: "نسبت به", def: "x" }, { id: "lo", label: "کران پایین (اختیاری)", def: "", ph: "مثلاً 0" }, { id: "hi", label: "کران بالا (اختیاری)", def: "", ph: "مثلاً 1 یا oo" }] },
    { id: "limit", name: "حد", icon: "lim", desc: "جایگذاری، حذف عامل مشترک، قاعدهٔ هوپیتال و حد در بی‌نهایت",
      modes: [{ id: "lim", name: "حد", ph: "مثلاً sin(x)/x", ex: [["sin(x)/x", "0"], ["(x^2-1)/(x-1)", "1"], ["(1-cos(x))/x^2", "0"], ["(3x^2+1)/(2x^2-x)", "oo"], ["(1+1/x)^x", "oo"], ["1/x", "0"]] }],
      params: [{ id: "var", label: "متغیر", def: "x" }, { id: "point", label: "به سمت", def: "0", ph: "عدد، pi یا oo" }, { id: "side", label: "سمت", def: "", type: "select", options: [["", "دوطرفه"], ["-", "چپ"], ["+", "راست"]] }] },
    { id: "apps", name: "کاربرد مشتق", icon: "∂", desc: "خط مماس، اکسترمم‌ها با آزمون مشتق دوم و چندجمله‌ای تیلور",
      modes: [{ id: "tangent", name: "خط مماس", ph: "تابع، مثلاً x^2", ex: [["x^2", "1"], ["sin(x)", "0"], ["x^3-2x", "1"]], params: [{ id: "point", label: "در نقطهٔ x =", def: "1" }] },
        { id: "extrema", name: "اکسترمم‌ها", ph: "تابع، مثلاً x^3-3x", ex: ["x^3-3x", "x^4-2x^2", "x*e^(-x)"] },
        { id: "taylor", name: "سری تیلور", ph: "تابع، مثلاً e^x", ex: ["e^x", "sin(x)", "cos(x)", "ln(1+x)"], params: [{ id: "center", label: "حول نقطهٔ", def: "0" }, { id: "order", label: "مرتبه", def: "4" }] }] },
    { id: "matrix", name: "ماتریس", icon: "[ ]", desc: "دترمینان، وارون، ضرب، ترانهاده، توان، RREF، مقادیر ویژه و حل Ax = b", matrix: true, modes: [{ id: "m", name: "ماتریس" }] },
    { id: "stats", name: "آمار و احتمال", icon: "σ", desc: "آمار توصیفی، رگرسیون خطی، ترکیب و جایگشت، توزیع دوجمله‌ای و نرمال",
      modes: [{ id: "describe", name: "آمار توصیفی", data: true, ph: "داده‌ها را با ویرگول یا فاصله جدا کن", ex: ["2, 4, 4, 4, 5, 5, 7, 9", "12 15 11 18 20 14 13 30", "70, 85, 90, 65, 78, 88, 92, 81"] },
        { id: "regression", name: "رگرسیون خطی", data: true, ph: "هر سطر یک نقطه: x, y", ex: ["1, 2\n2, 4.1\n3, 5.9\n4, 8.2\n5, 9.8", "1 3\n2 5\n3 4\n4 8\n5 9\n6 11"] },
        { id: "comb", name: "ترکیب و جایگشت", none: true, params: [{ id: "type", label: "نوع", def: "C", type: "select", options: [["C", "ترکیب C(n,k)"], ["P", "جایگشت P(n,k)"], ["fact", "فاکتوریل n!"]] }, { id: "n", label: "n", def: "10" }, { id: "k", label: "k", def: "3" }] },
        { id: "binom", name: "توزیع دوجمله‌ای", none: true, params: [{ id: "n", label: "n (تعداد آزمایش)", def: "10" }, { id: "p", label: "p (احتمال موفقیت)", def: "0.5" }, { id: "k", label: "k", def: "5" }, { id: "kind", label: "نوع", def: "eq", type: "select", options: [["eq", "P(X = k)"], ["le", "P(X ≤ k)"], ["ge", "P(X ≥ k)"]] }] },
        { id: "normal", name: "توزیع نرمال", none: true, params: [{ id: "mu", label: "میانگین μ", def: "0" }, { id: "sigma", label: "انحراف معیار σ", def: "1" }, { id: "a", label: "از a (خالی = −∞)", def: "-1.96" }, { id: "b", label: "تا b (خالی = ∞)", def: "1.96" }] }] },
  ];
  const catById = id => CATS.find(c => c.id === id) || CATS[2];

  /* ---------------- state ---------------- */
  let cat = catById("equation"), mode = cat.modes[0], last = null, plot = null, practice = false;
  const LS = { get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const HKEY = "mdsa.solver.history", NKEY = "mdsa.solver.notebook";

  /* ---------------- rendering of the input area ---------------- */
  function renderCats() {
    $("cats").innerHTML = "<h2>دسته‌ها</h2>" + CATS.map(c => `<button class="cat${c.id === cat.id ? " active" : ""}" data-cat="${c.id}"><span class="ci">${esc(c.icon)}</span>${esc(c.name)}</button>`).join("");
    $("cats").querySelectorAll("[data-cat]").forEach(b => b.onclick = () => { setCat(b.dataset.cat); });
  }
  function setCat(id, modeId, keep) {
    cat = catById(id); mode = cat.modes.find(m => m.id === modeId) || cat.modes[0];
    renderCats(); renderModes(); renderInput(keep); hideResult(); practice = false; $("practiceBanner").classList.remove("show");
  }
  function renderModes() {
    $("catTitle").textContent = cat.name; $("catDesc").textContent = cat.desc;
    $("modes").innerHTML = cat.modes.length > 1 ? cat.modes.map(m => `<button class="mode${m.id === mode.id ? " active" : ""}" data-mode="${m.id}">${esc(m.name)}</button>`).join("") : "";
    $("modes").querySelectorAll("[data-mode]").forEach(b => b.onclick = () => { mode = cat.modes.find(m => m.id === b.dataset.mode); renderModes(); renderInput(); hideResult(); });
  }
  const paramsFor = () => (mode.params || cat.params || []);
  function renderInput(keep) {
    const prev = keep && $("q") ? $("q").value : "";
    let html = "";
    if (cat.matrix) html = matrixEditor();
    else if (!mode.none) {
      const multi = cat.multiline || mode.data;
      html = `<div class="mathbox">${multi ? `<textarea id="q" rows="4" spellcheck="false" autocomplete="off" placeholder="${esc(mode.ph || "")}" aria-label="ورودی"></textarea>` : `<input id="q" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="${esc(mode.ph || "")}" aria-label="ورودی">`}<button class="btn solve-btn" id="solve">حل کن</button></div>${mode.data ? "" : `<div class="preview" id="preview" aria-live="polite"></div>`}`;
    } else html = `<div class="mathbox"><button class="btn solve-btn" id="solve" style="width:100%">محاسبه کن</button></div>`;
    $("inputArea").innerHTML = html;
    $("params").innerHTML = paramsFor().map(p => p.type === "select" ? `<label>${esc(p.label)}<select data-p="${p.id}">${p.options.map(o => `<option value="${esc(o[0])}"${o[0] === p.def ? " selected" : ""}>${esc(o[1])}</option>`).join("")}</select></label>` : `<label>${esc(p.label)}<input data-p="${p.id}" value="${esc(p.def)}" placeholder="${esc(p.ph || "")}" autocomplete="off"></label>`).join("");
    const ex = mode.ex || [];
    $("examples").innerHTML = ex.length ? "<span>مثال‌ها:</span>" + ex.map((e, i) => `<button class="chip" data-ex="${i}">${esc(Array.isArray(e) ? e[0] + "  (→ " + e[1] + ")" : e.replace(/\n/g, " ؛ "))}</button>`).join("") : "";
    $("examples").querySelectorAll("[data-ex]").forEach(b => b.onclick = () => { const e = ex[+b.dataset.ex]; loadExample(e); });
    $("kbd").style.display = cat.matrix || mode.none || mode.data ? "none" : "";
    if ($("q")) {
      if (prev) $("q").value = prev;
      $("q").addEventListener("input", preview);
      $("q").addEventListener("keydown", e => { if (e.key === "Enter" && (!(cat.multiline || mode.data) || e.ctrlKey || e.metaKey)) { e.preventDefault(); solve(); } });
      preview();
    }
    $("solve").onclick = solve;
    $("params").querySelectorAll("input").forEach(i => i.addEventListener("keydown", e => { if (e.key === "Enter") solve(); }));
    if (cat.matrix) bindMatrix();
  }
  function loadExample(e) {
    if (Array.isArray(e)) { $("q").value = e[0]; const p = $("params").querySelector('[data-p="point"]'); if (p) p.value = e[1]; }
    else $("q").value = e;
    preview(); solve();
  }
  function getParams() { const o = {}; $("params").querySelectorAll("[data-p]").forEach(el => o[el.dataset.p] = el.value.trim()); return o; }
  function setParams(p) { if (!p) return; $("params").querySelectorAll("[data-p]").forEach(el => { if (p[el.dataset.p] !== undefined) el.value = p[el.dataset.p]; }); }

  /* ---------------- live preview ---------------- */
  function preview() {
    const el = $("preview"); if (!el) return;
    const v = $("q").value.trim();
    if (!v) { el.className = "preview"; el.innerHTML = '<span class="muted" style="direction:rtl;display:block;text-align:right">پیش‌نمایش فرمول اینجا نمایش داده می‌شود.</span>'; return; }
    try {
      const lines = v.split(/\n/).filter(x => x.trim());
      const texs = lines.map(line => E.parseStatement(line).map(g => g.parts.map(E.tex).reduce((acc, t, i) => acc + (i ? " " + E.relTex(g.rels[i - 1]) + " " : "") + t, "")).join(",\\quad "));
      el.className = "preview"; el.innerHTML = K(texs.length > 1 ? "\\begin{cases}" + texs.join(" \\\\ ") + "\\end{cases}" : texs[0], false);
    } catch (e) { el.className = "preview err"; el.textContent = "⚠ " + e.message; }
  }

  /* ---------------- math keyboard ---------------- */
  const KEYS = {
    "پایه": ["7", "8", "9", "/", "(", ")", "x", "y", "^2", "sqrt(", "4", "5", "6", "*", "^", "|", "a", "b", "<", ">", "1", "2", "3", "-", "pi", "e", "=", ",", "<=", ">=", "0", ".", "!", "+", "abs(", "frac", "⌫", "←", "→", "پاک"],
    "توابع": ["sin(", "cos(", "tan(", "cot(", "sec(", "csc(", "asin(", "acos(", "atan(", "⌫", "ln(", "log(", "e^(", "root(", "cbrt(", "sinh(", "cosh(", "oo", "^(-1)", "پاک"],
    "حروف": ["x", "y", "z", "t", "a", "b", "c", "k", "m", "n", "p", "q", "r", "s", "u", "v", "w", "⌫", "←", "→"],
  };
  const LABEL = { "/": "÷", "*": "×", "-": "−", "^2": "x²", "^": "xⁿ", "sqrt(": "√", "pi": "π", "<=": "≤", ">=": "≥", "abs(": "|x|", "frac": "a/b", "e^(": "eˣ", "root(": "ⁿ√", "cbrt(": "∛", "oo": "∞", "^(-1)": "x⁻¹", "|": "|" };
  let kbTab = "پایه";
  function renderKbd() {
    $("kbdTabs").innerHTML = Object.keys(KEYS).map(t => `<button class="${t === kbTab ? "active" : ""}" data-t="${t}">${t}</button>`).join("");
    $("kbdTabs").querySelectorAll("[data-t]").forEach(b => b.onclick = () => { kbTab = b.dataset.t; renderKbd(); });
    $("keys").innerHTML = KEYS[kbTab].map(k => `<button type="button" class="${/[a-z]{2,}\(/.test(k) ? "fn" : ""} ${["⌫", "←", "→", "پاک"].includes(k) ? "act" : ""}" data-k="${esc(k)}" aria-label="${esc(LABEL[k] || k)}">${esc(LABEL[k] || (k.length > 1 ? k.replace(/\($/, "") : k))}</button>`).join("");
    $("keys").querySelectorAll("[data-k]").forEach(b => { b.onmousedown = e => e.preventDefault(); b.onclick = () => press(b.dataset.k); });
  }
  function press(k) {
    const q = $("q"); if (!q) return;
    const s = q.selectionStart ?? q.value.length, e = q.selectionEnd ?? s, v = q.value;
    const put = (txt, back = 0) => { q.value = v.slice(0, s) + txt + v.slice(e); const p = s + txt.length - back; q.setSelectionRange(p, p); };
    if (k === "⌫") { if (s === e && s > 0) { q.value = v.slice(0, s - 1) + v.slice(e); q.setSelectionRange(s - 1, s - 1); } else put(""); }
    else if (k === "←") q.setSelectionRange(Math.max(0, s - 1), Math.max(0, s - 1));
    else if (k === "→") q.setSelectionRange(s + 1, s + 1);
    else if (k === "پاک") q.value = "";
    else if (k === "frac") { const sel = v.slice(s, e); put("(" + sel + ")/()", 1); }
    else if (k.endsWith("(")) { const sel = v.slice(s, e); put(k + sel + ")", 1); }
    else put(k);
    q.focus(); preview();
  }

  /* ---------------- matrix editor ---------------- */
  let mats = { A: [[2, 1], [1, 3]], B: [[1, 2], [3, 4]] };
  function matrixEditor() {
    const ed = (name) => { const M = mats[name]; return `<div class="mat"><div class="dims">ماتریس ${name}: <select data-dim="${name}r">${[1, 2, 3, 4, 5, 6].map(n => `<option${n === M.length ? " selected" : ""}>${n}</option>`).join("")}</select> × <select data-dim="${name}c">${[1, 2, 3, 4, 5, 6].map(n => `<option${n === M[0].length ? " selected" : ""}>${n}</option>`).join("")}</select></div><div class="grid" style="grid-template-columns:repeat(${M[0].length},auto)">${M.map((r, i) => r.map((x, j) => `<input data-m="${name}" data-i="${i}" data-j="${j}" value="${esc(x)}" inputmode="decimal" aria-label="${name}${i + 1}${j + 1}">`).join("")).join("")}</div></div>`; };
    const ops = [["det", "det(A)"], ["inv", "A⁻¹"], ["T", "Aᵀ"], ["pow", "Aⁿ"], ["rref", "RREF و رتبه"], ["eig", "مقادیر ویژه"], ["mul", "A × B"], ["add", "A + B"], ["sub", "A − B"], ["solve", "حل Ax = b (b = ستون اول B)"]];
    return `<div class="matrix-ed">${ed("A")}${ed("B")}</div><div class="params" style="justify-content:center"><label>n برای Aⁿ<input data-p="n" value="2"></label></div><div class="mat-ops">${ops.map(o => `<button class="btn ${o[0] === "det" ? "" : "alt"}" data-op="${o[0]}">${o[1]}</button>`).join("")}</div><button class="btn" id="solve" hidden>حل</button>`;
  }
  let matOp = "det";
  function bindMatrix() {
    $("inputArea").querySelectorAll("[data-dim]").forEach(s => s.onchange = () => { const n = s.dataset.dim[0], rc = s.dataset.dim[1], v = +s.value; readMats(); const M = mats[n]; if (rc === "r") { while (M.length < v) M.push(Array(M[0].length).fill(0)); M.length = v; } else M.forEach(r => { while (r.length < v) r.push(0); r.length = v; }); renderInput(); });
    $("inputArea").querySelectorAll("[data-op]").forEach(b => b.onclick = () => { matOp = b.dataset.op; $("inputArea").querySelectorAll("[data-op]").forEach(x => x.classList.toggle("alt", x !== b)); solve(); });
  }
  function readMats() { $("inputArea").querySelectorAll("[data-m]").forEach(i => { mats[i.dataset.m][+i.dataset.i][+i.dataset.j] = i.value.trim() || "0"; }); }
  const toQ = M => E.parseMatrix(M.map(r => r.join(" ")).join("\n"));

  /* ---------------- solving ---------------- */
  function requireInput() { const v = $("q") ? $("q").value.trim() : ""; if (!v) throw new E.MathError("اول یک مسئله بنویس یا یکی از مثال‌ها را انتخاب کن."); return v; }
  const parseOpt = s => (s ? E.parse(s) : null);
  function run() {
    const p = getParams();
    switch (cat.id) {
      case "arith": {
        const v = requireInput();
        if (mode.id === "prime") { if (!/^\d+$/.test(E.normalizeInput(v))) throw new E.MathError("یک عدد طبیعی وارد کن."); return E.primeFactorSteps(BigInt(E.normalizeInput(v))); }
        if (mode.id === "gcd") { const nums = E.normalizeInput(v).split(/[\s,]+/).filter(Boolean); if (nums.length < 2 || nums.some(n => !/^\d+$/.test(n))) throw new E.MathError("دست‌کم دو عدد طبیعی وارد کن."); return E.gcdSteps(nums); }
        const a = E.parse(v); if (E.vars(a).size) throw new E.MathError("این بخش برای عبارت‌های عددی است؛ برای عبارت‌های متغیردار از «جبر» استفاده کن.");
        const r = E.arithmetic(a); r.input = E.tex(a); return r;
      }
      case "algebra": {
        const a = E.parse(requireInput());
        const r = mode.id === "factor" ? E.factorSteps(a) : mode.id === "expand" ? E.expandSteps(a) : E.simplifySteps(a);
        r.input = E.tex(a); r.plot = E.vars(a).size === 1 ? { exprs: [a], v: [...E.vars(a)][0] } : null; return r;
      }
      case "equation": {
        const st = E.parseStatement(requireInput());
        if (st.length > 1) { cat = catById("system"); throw new E.MathError("برای چند معادله از بخش «دستگاه معادلات» استفاده کن."); }
        const g = st[0]; if (g.rels.length !== 1) throw new E.MathError(g.rels.length ? "فقط یک علامت رابطه مجاز است." : "علامت = یا یکی از < > ≤ ≥ را بنویس.");
        const v = p.var || undefined;
        const r = g.rels[0] === "=" ? E.solveEquation(g.parts[0], g.parts[1], v) : g.rels[0] === "!=" ? (() => { throw new E.MathError("علامت ≠ پشتیبانی نمی‌شود."); })() : E.solveInequality(g.parts[0], g.rels[0], g.parts[1], v);
        r.input = E.tex(g.parts[0]) + " " + E.relTex(g.rels[0]) + " " + E.tex(g.parts[1]); return r;
      }
      case "system": {
        const lines = requireInput().split(/\n/).map(x => x.trim()).filter(Boolean);
        const eqs = lines.flatMap(l => E.parseStatement(l)).map(g => { if (g.rels.length !== 1 || g.rels[0] !== "=") throw new E.MathError("هر سطر باید یک معادله با علامت = باشد."); return g.parts; });
        if (eqs.length < 2) throw new E.MathError("دست‌کم دو معادله، هر کدام در یک خط، بنویس.");
        const r = E.solveSystem(eqs);
        r.input = "\\begin{cases}" + eqs.map(([l, rr]) => E.tex(l) + " = " + E.tex(rr)).join(" \\\\ ") + "\\end{cases}"; return r;
      }
      case "graph": {
        const lines = requireInput().split(/\n|;/).map(x => x.trim()).filter(Boolean).slice(0, 6);
        const fns = lines.map(l => { const st = E.parseStatement(l)[0]; const ex = st.rels.length && st.parts[0].t === "var" && st.parts[0].n === "y" ? st.parts[1] : st.parts[st.parts.length - 1]; return ex; });
        const steps = [];
        fns.forEach((a, i) => {
          const v = E.pickVar([a]), f = E.compile(a, v);
          const roots = E.numericScan(f, -50, 50, 4000), y0 = f(0);
          const d = x => (f(x + 1e-5) - f(x - 1e-5)) / 2e-5, crit = E.numericScan(d, -50, 50, 4000);
          const ext = crit.map(x => { const y = f(x), l = f(x - 1e-3), r2 = f(x + 1e-3); return y < l && y < r2 ? "\\min(" + E.trimNum(x, 4) + ",\\; " + E.trimNum(y, 4) + ")" : y > l && y > r2 ? "\\max(" + E.trimNum(x, 4) + ",\\; " + E.trimNum(y, 4) + ")" : null; }).filter(Boolean);
          steps.push(E.step("تحلیل f_{" + (i + 1) + "}", "f_{" + (i + 1) + "}(" + v + ") = " + E.tex(a) + " \\\\ \\text{ریشه‌ها: } " + (roots.length ? roots.slice(0, 8).map(x => E.trimNum(x, 5)).join(",\\; ") : "\\text{ندارد}") + " \\\\ \\text{عرض از مبدأ: } " + (Number.isFinite(y0) ? E.trimNum(y0, 5) : "\\text{تعریف‌نشده}") + (ext.length ? " \\\\ " + ext.slice(0, 6).join(",\\; ") : ""), "مقادیر عددی در بازهٔ [−۵۰، ۵۰] محاسبه شده‌اند."));
        });
        return { answer: fns.map((a, i) => "f_{" + (i + 1) + "}(x) = " + E.tex(a)).join(",\\quad "), steps, plot: { exprs: fns, v: E.pickVar(fns) }, input: "" };
      }
      case "derivative": {
        const a = E.parse(requireInput()), v = p.var || E.pickVar([a]), k = +p.order || 1;
        const r = E.derivativeSteps(a, v, k);
        if (p.at) { const x0 = E.parse(p.at); const val = E.nicest(E.subst(r.result, v, x0)); r.steps.push(E.step("مقدار در نقطه", "f" + "'".repeat(Math.min(k, 3)) + "\\left(" + E.tex(x0) + "\\right) = " + E.tex(val), null)); r.answer += ",\\qquad f" + "'".repeat(Math.min(k, 3)) + "\\left(" + E.tex(x0) + "\\right) = " + E.tex(val); }
        r.input = E.tex(a); return r;
      }
      case "integral": {
        const a = E.parse(requireInput()), v = p.var || E.pickVar([a]);
        const lo = parseOpt(p.lo), hi = parseOpt(p.hi);
        if ((lo && !hi) || (!lo && hi)) throw new E.MathError("برای انتگرال معین هر دو کران را وارد کن.");
        const r = E.integralSteps(a, v, lo ? [lo, hi] : null); r.input = E.tex(a); return r;
      }
      case "limit": {
        const a = E.parse(requireInput()), v = p.var || E.pickVar([a]);
        if (!p.point) throw new E.MathError("نقطه‌ای که متغیر به آن میل می‌کند را وارد کن.");
        const r = E.limitSteps(a, v, E.parse(p.point.replace(/^\+?inf(inity)?$/i, "oo").replace(/^-inf(inity)?$/i, "-oo")), p.side || null); r.input = E.tex(a); return r;
      }
      case "apps": {
        const a = E.parse(requireInput()), v = E.pickVar([a]);
        if (mode.id === "tangent") return E.tangentSteps(a, v, E.parse(p.point || "0"));
        if (mode.id === "extrema") return E.extremaSteps(a, v);
        const ord = Math.max(1, Math.min(10, +p.order || 4)); return E.taylorSteps(a, v, E.parse(p.center || "0"), ord);
      }
      case "matrix": {
        readMats();
        const A = toQ(mats.A), B = toQ(mats.B);
        return E.matrixOp(matOp, A, matOp === "solve" ? B.map(r => [r[0]]) : B, parseInt(p.n || "2", 10));
      }
      case "stats": {
        if (mode.id === "describe") { const d = E.parseData(requireInput()); const r = E.describeSteps(d); return r; }
        if (mode.id === "regression") { const pts = E.parsePairs(requireInput()); return E.regressionSteps(pts); }
        const num = (s, name) => { const v = Number(E.normalizeInput(s)); if (s === "" || !Number.isFinite(v)) throw new E.MathError("مقدار «" + name + "» را درست وارد کن."); return v; };
        if (mode.id === "comb") return E.combSteps(p.type, num(p.n, "n"), p.type === "fact" ? 0 : num(p.k, "k"));
        if (mode.id === "binom") return E.binomialSteps(num(p.n, "n"), num(p.p, "p"), num(p.k, "k"), p.kind);
        if (mode.id === "normal") return E.normalSteps(num(p.mu, "μ"), num(p.sigma, "σ"), p.a === "" ? -Infinity : num(p.a, "a"), p.b === "" ? Infinity : num(p.b, "b"));
      }
    }
    throw new E.MathError("این دسته پشتیبانی نمی‌شود.");
  }
  function solve() {
    hideResult();
    let r;
    try { r = run(); }
    catch (e) {
      const msg = e instanceof E.MathError || e.name === "MathError" ? e.message : "این مسئله را نتوانستم حل کنم. شکل نوشتن را بررسی کن (مثلاً ضرب را با * یا کنار هم نوشتن مشخص کن).";
      if (!(e instanceof E.MathError)) console.error(e);
      $("errCard").textContent = "⚠ " + msg; $("errCard").classList.add("show"); return;
    }
    last = { cat: cat.id, mode: mode.id, q: $("q") ? $("q").value : "", p: getParams(), answer: r.answer, mats: cat.matrix ? JSON.parse(JSON.stringify(mats)) : null, op: matOp };
    showResult(r);
    addHistory(last);
    reward();
    practice = false; $("practiceBanner").classList.remove("show");
    try { history.replaceState(null, "", "#" + shareHash(last)); } catch (e) { }
  }
  function hideResult() { $("result").classList.remove("show"); $("errCard").classList.remove("show"); }
  function noteHTML(n) { if (!n) return ""; return /\\/.test(n) ? K(n, false) : esc(n); }
  function showResult(r) {
    $("answer").innerHTML = K(r.answer);
    $("approx").innerHTML = r.approx ? K(r.approx, false) : "";
    $("noteLine").textContent = r.note || "";
    let extra = "";
    if (r.table) extra += `<table class="stat-table">${r.table.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${typeof v === "number" ? (Number.isFinite(v) ? E.trimNum(v, 6) : "—") : esc(v)}</td></tr>`).join("")}</table>`;
    $("extra").innerHTML = extra;
    $("steps").innerHTML = (r.steps || []).map(s => `<div class="stepc"><h3>${esc(s.title)}</h3>${s.tex ? `<div class="m">${K(s.tex)}</div>` : ""}${s.note ? `<div class="n">${noteHTML(s.note)}</div>` : ""}</div>`).join("") || '<p class="muted">این مسئله مرحلهٔ جداگانه‌ای ندارد.</p>';
    $("steps").style.display = ""; $("toggleSteps").textContent = "پنهان کردن مراحل";
    $("result").classList.add("show");
    drawPlot(r);
    $("result").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  /* ---------------- graph ---------------- */
  const LBL = ["f", "g", "h", "p", "q", "r"];
  function drawPlot(r) {
    const card = $("plotCard"), cv = $("plot");
    let spec = null, legend = [];
    if (r.chart && r.chart.kind !== "scatter") {
      card.hidden = false; cv.style.cursor = "default";
      plot = null; requestAnimationFrame(() => E.drawStatChart(cv, r.chart));
      $("legend").innerHTML = ""; $("trace").textContent = r.chart.kind === "normal" ? "ناحیهٔ رنگی برابر احتمال خواسته‌شده است." : ""; return;
    }
    if (r.chart && r.chart.kind === "scatter") spec = { fns: [], points: r.chart.pts, lines: [{ a: r.chart.a, b: r.chart.b, color: "#f472b6" }] }, legend = [["#fbbf24", "داده‌ها"], ["#f472b6", "خط رگرسیون"]];
    else if (r.plot && r.plot.lines && r.plot.vars) {
      const [vx, vy] = r.plot.vars, fns = [];
      r.plot.lines.forEach(([L, R2], i) => { const m = E.toMPoly(E.N.sub(L, R2)); if (!m) return; const a = m.t.get(vx) || E.Q.of(0), b = m.t.get(vy) || E.Q.of(0), c = m.constTerm(); if (b.isZero()) return; fns.push({ f: x => -(a.num() * x + c.num()) / b.num(), noSpecial: true }); legend.push([["#22d3ee", "#f472b6", "#a3e635"][i], "معادلهٔ " + fa(i + 1)]); });
      spec = { fns, points: r.plot.point ? [[...r.plot.point]] : [] };
    } else if (r.plot && r.plot.exprs) {
      const v = r.plot.v || "x";
      const exprs = r.plot.exprs.filter(e => e && E.vars(e).size <= 1 && (E.vars(e).size === 0 || E.vars(e).has(v)));
      if (!exprs.length) { card.hidden = true; return; }
      const fns = exprs.map((e, i) => ({ ast: e, v, noSpecial: r.plot.area !== undefined && i > 0 }));
      legend = exprs.map((e, i) => [["#22d3ee", "#f472b6", "#a3e635", "#fbbf24", "#c084fc", "#fb7185"][i], (r.plot.labels && r.plot.labels[i] ? r.plot.labels[i] : LBL[i]) + "(" + v + ") = " + E.tex(e)]);
      const pts = (r.plot.points || []).filter(p => Number.isFinite(p[1]));
      if (Array.isArray(r.sols) && cat.id === "equation") r.sols.forEach(s => { try { const x = E.evalNum(s); const y = E.evalNum(exprs[0], { [v]: x }); if (Number.isFinite(y)) pts.push([x, y, "#fbbf24"]); } catch (e) { } });
      spec = { fns, points: pts, area: r.plot.area || null, marks: Number.isFinite(r.plot.mark) ? [r.plot.mark] : [] };
    }
    if (!spec) { card.hidden = true; return; }
    card.hidden = false; cv.style.cursor = "crosshair"; $("trace").textContent = "نشانگر را روی نمودار ببر؛ برای جابه‌جایی بکش و برای زوم از چرخ ماوس یا دو انگشت استفاده کن.";
    $("legend").innerHTML = legend.map(([c, t]) => `<span><i style="background:${c}"></i>${t.includes("\\") || /[=^]/.test(t) ? K(t, false) : esc(t)}</span>`).join("");
    requestAnimationFrame(() => {
      if (!plot) plot = new E.Plot(cv, { onTrace: h => { $("trace").textContent = h ? (h.label ? h.label + ": " : "") + "(" + E.trimNum(h.x, 5) + ", " + E.trimNum(h.y, 5) + ")" : ""; } });
      plot.resize(); plot.set(spec);
    });
  }
  $("zin").onclick = () => plot && plot.zoom(1 / 1.4);
  $("zout").onclick = () => plot && plot.zoom(1.4);
  $("zreset").onclick = () => plot && plot.reset();
  $("toggleSteps").onclick = () => { const s = $("steps"); const hidden = s.style.display === "none"; s.style.display = hidden ? "" : "none"; $("toggleSteps").textContent = hidden ? "پنهان کردن مراحل" : "نمایش مراحل"; };

  /* ---------------- history & notebook ---------------- */
  let tab = "history";
  function addHistory(item) {
    const h = LS.get(HKEY, []).filter(x => !(x.cat === item.cat && x.mode === item.mode && x.q === item.q && JSON.stringify(x.p) === JSON.stringify(item.p) && !item.mats));
    h.unshift({ ...item, t: Date.now() }); LS.set(HKEY, h.slice(0, 40)); renderPanel();
  }
  function renderPanel() {
    document.querySelectorAll(".ptabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    const list = LS.get(tab === "history" ? HKEY : NKEY, []);
    if (!list.length) { $("panelBody").innerHTML = `<p class="empty">${tab === "history" ? "هنوز مسئله‌ای حل نکرده‌ای." : "با دکمهٔ «☆ ذخیره در دفترچه» جواب‌های مهم را اینجا نگه دار."}</p>`; return; }
    $("panelBody").innerHTML = list.map((x, i) => `<div class="hitem" data-i="${i}" role="button" tabindex="0"><small>${esc(catById(x.cat).name)}${x.t ? " · " + new Date(x.t).toLocaleDateString("fa-IR") : ""}</small>${tab === "notebook" ? `<span>${K(x.answer, false)}</span>` : esc((x.q || (x.mats ? "ماتریس · " + x.op : catById(x.cat).modes.find(m => m.id === x.mode)?.name || "")).replace(/\n/g, " ؛ "))}<button class="del" data-del="${i}" aria-label="حذف">×</button></div>`).join("");
    $("panelBody").querySelectorAll("[data-i]").forEach(el => { const open = () => restore(list[+el.dataset.i]); el.onclick = e => { if (e.target.dataset.del === undefined) open(); }; el.onkeydown = e => { if (e.key === "Enter") open(); }; });
    $("panelBody").querySelectorAll("[data-del]").forEach(b => b.onclick = e => { e.stopPropagation(); const k = tab === "history" ? HKEY : NKEY, l = LS.get(k, []); l.splice(+b.dataset.del, 1); LS.set(k, l); renderPanel(); });
  }
  document.querySelectorAll(".ptabs button").forEach(b => b.onclick = () => { tab = b.dataset.tab; renderPanel(); });
  function restore(x) {
    if (x.mats) mats = JSON.parse(JSON.stringify(x.mats)), matOp = x.op || "det";
    setCat(x.cat, x.mode);
    if ($("q")) $("q").value = x.q || "";
    setParams(x.p); preview(); solve();
  }
  $("saveNote").onclick = () => { if (!last) return; const n = LS.get(NKEY, []); n.unshift({ ...last, t: Date.now() }); LS.set(NKEY, n.slice(0, 100)); $("saveNote").textContent = "★ ذخیره شد"; setTimeout(() => $("saveNote").textContent = "☆ ذخیره در دفترچه", 1600); tab = "notebook"; renderPanel(); };
  $("copyTex").onclick = () => { if (!last) return; copy(last.answer, $("copyTex"), "کپی LaTeX"); };
  $("share").onclick = () => { if (!last) return; copy(location.href.split("#")[0] + "#" + shareHash(last), $("share"), "کپی پیوند"); };
  function copy(t, btn, label) { const done = () => { btn.textContent = "کپی شد ✓"; setTimeout(() => btn.textContent = label, 1500); }; if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, () => fallbackCopy(t, done)); else fallbackCopy(t, done); }
  function fallbackCopy(t, done) { const ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) { } ta.remove(); done(); }
  $("similar").onclick = () => {
    const g = E.generate(cat.id, mode.id); if (!g) return;
    if (g.matrix) { mats.A = g.matrix; renderInput(); }
    if (g.input !== undefined && $("q")) $("q").value = g.input;
    setParams(g.params); preview(); hideResult();
    practice = true; $("practiceBanner").classList.add("show"); if ($("q")) $("q").focus(); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  function shareHash(x) { const o = { c: x.cat, m: x.mode, q: x.q, p: x.p }; if (x.mats) { o.A = x.mats.A; o.B = x.mats.B; o.op = x.op; } return "s=" + encodeURIComponent(JSON.stringify(o)); }
  function fromHash() {
    const h = location.hash.slice(1); if (!h) return false;
    const params = new URLSearchParams(h);
    if (params.get("s")) { try { const o = JSON.parse(params.get("s")); if (o.A) mats = { A: o.A, B: o.B || mats.B }, matOp = o.op || "det"; setCat(o.c, o.m); if ($("q")) $("q").value = o.q || ""; setParams(o.p); preview(); if (o.q || o.A) solve(); return true; } catch (e) { return false; } }
    if (params.get("cat")) { setCat(params.get("cat"), params.get("mode")); if (params.get("q") && $("q")) { $("q").value = params.get("q"); preview(); solve(); } return true; }
    return false;
  }

  /* ---------------- XP & streak integration with the dashboard ---------------- */
  function reward() {
    try {
      const S = JSON.parse(localStorage.getItem("academyProgress")) || {};
      S.solved = (S.solved || 0) + 1;
      if (!S.activity || typeof S.activity !== "object") S.activity = {};
      const d = new Date(), k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      const today = (S.solverDays = S.solverDays || {}); today[k] = (today[k] || 0) + 1;
      if (today[k] <= 10) S.activity[k] = (S.activity[k] || 0) + 1;    /* cap heat contribution per day */
      S.done = S.done || []; S.answered = S.answered || []; S.correct = S.correct || 0;
      localStorage.setItem("academyProgress", JSON.stringify(S));
      if (location.protocol !== "file:") fetch("api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(S) }).catch(() => { });
    } catch (e) { }
  }

  /* ---------------- init ---------------- */
  renderKbd();
  if (!fromHash()) setCat("equation");
  renderPanel();
  window.addEventListener("hashchange", fromHash);
})();
