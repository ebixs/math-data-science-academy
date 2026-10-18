/* MathEngine statistics: descriptive statistics with steps, quartiles and outliers,
   least-squares regression and correlation, combinatorics, binomial and normal probabilities. */
(function (root) {
  "use strict";
  const E = root.MathEngine;
  const { MathError, step } = E;
  const f = (x, d = 4) => E.trimNum(x, d);
  const fa = E.fa;

  function parseData(text) {
    const s = E.normalizeInput(String(text)).replace(/[\[\]()]/g, " ");
    const vals = s.split(/[\s,;]+/).filter(Boolean).map(x => { const v = Number(x); if (!Number.isFinite(v)) throw new MathError("«" + x + "» عدد نیست."); return v; });
    if (!vals.length) throw new MathError("داده‌ای وارد نشده است.");
    if (vals.length > 10000) throw new MathError("حداکثر ۱۰٬۰۰۰ داده پشتیبانی می‌شود.");
    return vals;
  }
  function parsePairs(text) {
    const lines = String(text).split(/\n|;/).map(l => E.normalizeInput(l).trim()).filter(Boolean);
    const pts = lines.map(l => { const p = l.replace(/[()]/g, "").split(/[\s,]+/).filter(Boolean).map(Number); if (p.length !== 2 || p.some(x => !Number.isFinite(x))) throw new MathError("هر سطر باید دو عدد x و y داشته باشد: «" + l + "»"); return p; });
    if (pts.length < 2) throw new MathError("دست‌کم دو نقطه لازم است.");
    return pts;
  }
  E.parseData = parseData; E.parsePairs = parsePairs;
  const sum = a => a.reduce((s, x) => s + x, 0);
  function medianOf(sorted) { const n = sorted.length, m = Math.floor(n / 2); return n % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2; }
  function quartiles(sorted) {
    const n = sorted.length, half = Math.floor(n / 2);
    const lower = sorted.slice(0, half), upper = sorted.slice(n % 2 ? half + 1 : half);
    return { q1: lower.length ? medianOf(lower) : sorted[0], q3: upper.length ? medianOf(upper) : sorted[n - 1], lower, upper };
  }
  E.quartiles = quartiles;
  const list = (a, max = 14) => (a.length > max ? a.slice(0, max).map(x => f(x)).join(",\\; ") + ",\\; \\ldots" : a.map(x => f(x)).join(",\\; "));

  function describeSteps(data) {
    const n = data.length, steps = [];
    const s = sum(data), mean = s / n, sorted = data.slice().sort((a, b) => a - b);
    steps.push(step("تعداد و مجموع", "n = " + n + ",\\quad \\sum x_i = " + list(data, 10).replace(/,\\; /g, " + ") + " = " + f(s, 8), null));
    steps.push(step("میانگین", "\\bar{x} = \\frac{\\sum x_i}{n} = \\frac{" + f(s, 8) + "}{" + n + "} = " + f(mean, 6), "میانگین مرکز ثقل داده‌هاست و به داده‌های پرت حساس است."));
    const med = medianOf(sorted);
    steps.push(step("میانه", "\\text{مرتب‌شده: } " + list(sorted) + " \\;\\Rightarrow\\; \\text{میانه} = " + f(med, 6), n % 2 ? "تعداد فرد است؛ میانه داده‌ٔ وسط (رتبهٔ " + fa((n + 1) / 2) + ") است." : "تعداد زوج است؛ میانه میانگین دو داده‌ٔ وسط است."));
    const cnt = new Map(); data.forEach(x => cnt.set(x, (cnt.get(x) || 0) + 1));
    const maxc = Math.max(...cnt.values()); const modes = [...cnt.entries()].filter(([, c]) => c === maxc).map(([x]) => x).sort((a, b) => a - b);
    steps.push(step("نما (مُد)", maxc === 1 ? "\\text{ندارد}" : list(modes) + "\\;(\\text{تکرار } " + maxc + ")", maxc === 1 ? "هیچ داده‌ای بیش از یک بار تکرار نشده است." : "پرتکرارترین مقدار(ها)."));
    const range = sorted[n - 1] - sorted[0];
    steps.push(step("دامنهٔ تغییرات", "R = " + f(sorted[n - 1]) + " - " + f(sorted[0]) + " = " + f(range), null));
    const dev = data.map(x => (x - mean) ** 2), ss = sum(dev);
    if (n <= 12) steps.push(step("مجذور انحراف از میانگین", data.map(x => "(" + f(x) + " - " + f(mean) + ")^{2} = " + f((x - mean) ** 2)).join(" \\\\ "), null));
    const vp = ss / n, vs = n > 1 ? ss / (n - 1) : NaN;
    steps.push(step("واریانس", "\\sigma^{2} = \\frac{\\sum (x_i - \\bar x)^{2}}{n} = \\frac{" + f(ss, 6) + "}{" + n + "} = " + f(vp, 6) + (n > 1 ? ",\\qquad s^{2} = \\frac{" + f(ss, 6) + "}{n-1} = " + f(vs, 6) : ""), "σ² واریانس جامعه و s² واریانس نمونه (با تصحیح بسل) است."));
    steps.push(step("انحراف معیار", "\\sigma = \\sqrt{" + f(vp, 6) + "} = " + f(Math.sqrt(vp), 6) + (n > 1 ? ",\\qquad s = \\sqrt{" + f(vs, 6) + "} = " + f(Math.sqrt(vs), 6) : ""), "انحراف معیار هم‌واحد با داده‌هاست."));
    const qs = quartiles(sorted), iqr = qs.q3 - qs.q1;
    steps.push(step("چارک‌ها", "Q_1 = " + f(qs.q1) + ",\\quad Q_2 = " + f(med) + ",\\quad Q_3 = " + f(qs.q3) + ",\\quad IQR = " + f(iqr), "Q₁ میانهٔ نیمهٔ پایین و Q₃ میانهٔ نیمهٔ بالای داده‌های مرتب‌شده است."));
    const lo = qs.q1 - 1.5 * iqr, hi = qs.q3 + 1.5 * iqr, out = sorted.filter(x => x < lo || x > hi);
    steps.push(step("داده‌های پرت (قاعدهٔ ۱٫۵IQR)", "[" + f(lo) + ",\\; " + f(hi) + "] \\;\\Rightarrow\\; " + (out.length ? list(out) : "\\text{ندارد}"), "داده‌های بیرون از Q₁ − 1.5·IQR و Q₃ + 1.5·IQR پرت محسوب می‌شوند."));
    const summary = [["تعداد", n], ["میانگین", mean], ["میانه", med], ["نما", maxc === 1 ? "—" : modes.map(x => f(x)).join("، ")], ["کمینه", sorted[0]], ["بیشینه", sorted[n - 1]], ["دامنه", range], ["واریانس جامعه σ²", vp], ["واریانس نمونه s²", vs], ["انحراف معیار σ", Math.sqrt(vp)], ["انحراف معیار s", Math.sqrt(vs)], ["Q₁", qs.q1], ["Q₃", qs.q3], ["IQR", iqr]];
    return { answer: "\\bar{x} = " + f(mean, 6) + ",\\quad \\text{میانه} = " + f(med, 6) + ",\\quad s = " + f(Math.sqrt(vs), 6), steps, table: summary, chart: { kind: "box+hist", data: sorted, q1: qs.q1, q3: qs.q3, med, lo: Math.max(sorted[0], lo), hi: Math.min(sorted[n - 1], hi), out } };
  }
  E.describeSteps = describeSteps;

  function regressionSteps(pts) {
    const n = pts.length, steps = [];
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const mx = sum(xs) / n, my = sum(ys) / n;
    steps.push(step("میانگین‌ها", "\\bar{x} = " + f(mx, 6) + ",\\quad \\bar{y} = " + f(my, 6), null));
    const sxx = sum(xs.map(x => (x - mx) ** 2)), syy = sum(ys.map(y => (y - my) ** 2)), sxy = sum(pts.map(([x, y]) => (x - mx) * (y - my)));
    if (sxx === 0) throw new MathError("همهٔ xها برابرند؛ خط رگرسیون تعریف نمی‌شود.");
    steps.push(step("مجموع مربعات و حاصل‌ضرب‌ها", "S_{xx} = \\sum (x_i-\\bar x)^{2} = " + f(sxx, 6) + ",\\quad S_{xy} = \\sum (x_i-\\bar x)(y_i-\\bar y) = " + f(sxy, 6), null));
    const b = sxy / sxx, a = my - b * mx;
    steps.push(step("شیب و عرض از مبدأ (کمترین مربعات)", "b = \\frac{S_{xy}}{S_{xx}} = " + f(b, 6) + ",\\quad a = \\bar y - b\\bar x = " + f(a, 6), "خطی که مجموع مجذور خطاها را کمینه می‌کند."));
    const r = syy === 0 ? NaN : sxy / Math.sqrt(sxx * syy);
    steps.push(step("ضریب همبستگی پیرسون", "r = \\frac{S_{xy}}{\\sqrt{S_{xx}S_{yy}}} = " + f(r, 4) + ",\\quad r^{2} = " + f(r * r, 4), Math.abs(r) > 0.8 ? "همبستگی خطی قوی" : Math.abs(r) > 0.5 ? "همبستگی خطی متوسط" : "همبستگی خطی ضعیف" + " — یادت باشد همبستگی به‌تنهایی علیت را ثابت نمی‌کند."));
    const resid = pts.map(([x, y]) => y - (a + b * x)), sse = sum(resid.map(e => e * e));
    steps.push(step("خطای مدل", "SSE = " + f(sse, 6) + ",\\quad RMSE = " + f(Math.sqrt(sse / n), 6), "RMSE میانگین اندازهٔ خطای پیش‌بینی است."));
    const line = "\\hat{y} = " + f(b, 6) + "x " + (a < 0 ? "- " + f(-a, 6) : "+ " + f(a, 6));
    return { answer: line + ",\\quad r = " + f(r, 4), steps, chart: { kind: "scatter", pts, a, b } };
  }
  E.regressionSteps = regressionSteps;

  const bigFact = n => { let r = 1n; for (let i = 2n; i <= BigInt(n); i++) r *= i; return r; };
  function combSteps(kind, n, k) {
    if (!Number.isInteger(n) || n < 0 || n > 500) throw new MathError("n باید عدد صحیح بین ۰ تا ۵۰۰ باشد.");
    if (kind !== "fact" && (!Number.isInteger(k) || k < 0 || k > n)) throw new MathError("k باید عدد صحیح بین ۰ و n باشد.");
    const steps = [];
    if (kind === "fact") { const r = bigFact(n); steps.push(step("فاکتوریل", n + "! = " + (n <= 10 ? Array.from({ length: n }, (_, i) => n - i).join(" \\times ") + " = " : "") + r, "حاصل‌ضرب اعداد ۱ تا n")); return { answer: n + "! = " + r, steps }; }
    if (kind === "P") { const r = bigFact(n) / bigFact(n - k); steps.push(step("جایگشت (ترتیب مهم است)", "P(n,k) = \\frac{n!}{(n-k)!} = \\frac{" + n + "!}{" + (n - k) + "!} = " + r, k <= 8 ? Array.from({ length: k }, (_, i) => n - i).join(" \\times ") + " = " + r : null)); return { answer: "P(" + n + "," + k + ") = " + r, steps }; }
    const r = bigFact(n) / (bigFact(k) * bigFact(n - k));
    steps.push(step("ترکیب (ترتیب مهم نیست)", "\\binom{n}{k} = \\frac{n!}{k!(n-k)!} = \\frac{" + n + "!}{" + k + "!\\," + (n - k) + "!} = " + r, "تعداد انتخاب k شیء از n شیء بدون توجه به ترتیب"));
    return { answer: "\\binom{" + n + "}{" + k + "} = " + r, steps };
  }
  E.combSteps = combSteps;

  function binomialSteps(n, p, k, mode = "eq") {
    if (!Number.isInteger(n) || n < 1 || n > 1000) throw new MathError("n باید عدد صحیح ۱ تا ۱۰۰۰ باشد.");
    if (!(p >= 0 && p <= 1)) throw new MathError("p باید بین ۰ و ۱ باشد.");
    const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
    const pmf = j => C(n, j) * p ** j * (1 - p) ** (n - j);
    const steps = [];
    steps.push(step("توزیع دوجمله‌ای", "P(X = k) = \\binom{n}{k} p^{k}(1-p)^{n-k},\\quad n = " + n + ",\\; p = " + f(p), "n آزمایش مستقل با احتمال موفقیت ثابت p"));
    let val, label;
    if (mode === "eq") { val = pmf(k); label = "P(X = " + k + ")"; steps.push(step("جایگذاری", label + " = \\binom{" + n + "}{" + k + "}(" + f(p) + ")^{" + k + "}(" + f(1 - p) + ")^{" + (n - k) + "} = " + f(C(n, k), 10) + " \\times " + f(p ** k, 6) + " \\times " + f((1 - p) ** (n - k), 6), null)); }
    else if (mode === "le") { val = 0; for (let j = 0; j <= k; j++) val += pmf(j); label = "P(X \\le " + k + ")"; steps.push(step("جمع احتمال‌ها", label + " = \\sum_{j=0}^{" + k + "} P(X=j)", null)); }
    else { val = 0; for (let j = k; j <= n; j++) val += pmf(j); label = "P(X \\ge " + k + ")"; steps.push(step("جمع احتمال‌ها", label + " = \\sum_{j=" + k + "}^{" + n + "} P(X=j) = 1 - P(X \\le " + (k - 1) + ")", null)); }
    steps.push(step("میانگین و واریانس", "E[X] = np = " + f(n * p) + ",\\quad Var(X) = np(1-p) = " + f(n * p * (1 - p)), null));
    return { answer: label + " \\approx " + f(val, 6), steps, chart: { kind: "bars", xs: Array.from({ length: Math.min(n, 60) + 1 }, (_, j) => j), ys: Array.from({ length: Math.min(n, 60) + 1 }, (_, j) => pmf(j)), hi: k } };
  }
  E.binomialSteps = binomialSteps;

  function erf(x) { /* Abramowitz–Stegun 7.1.26 with refinement via series for small x */
    const s = Math.sign(x); x = Math.abs(x);
    if (x < 2) { let sumv = x, term = x; for (let n = 1; n < 60; n++) { term *= -x * x / n; sumv += term / (2 * n + 1); } return s * 2 / Math.sqrt(Math.PI) * sumv; }
    const t = 1 / (1 + 0.3275911 * x); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  const Phi = z => 0.5 * (1 + erf(z / Math.SQRT2));
  E.Phi = Phi;
  function normalSteps(mu, sigma, a, b) {
    if (!(sigma > 0)) throw new MathError("انحراف معیار باید مثبت باشد.");
    const steps = [];
    const za = Number.isFinite(a) ? (a - mu) / sigma : -Infinity, zb = Number.isFinite(b) ? (b - mu) / sigma : Infinity;
    steps.push(step("استانداردسازی", "Z = \\frac{X - \\mu}{\\sigma}:\\quad z_1 = " + (Number.isFinite(za) ? "\\frac{" + f(a) + " - " + f(mu) + "}{" + f(sigma) + "} = " + f(za) : "-\\infty") + ",\\quad z_2 = " + (Number.isFinite(zb) ? "\\frac{" + f(b) + " - " + f(mu) + "}{" + f(sigma) + "} = " + f(zb) : "\\infty"), "هر توزیع نرمال را به نرمال استاندارد N(0,1) تبدیل می‌کنیم."));
    const pv = Phi(zb) - Phi(za);
    steps.push(step("استفاده از تابع توزیع تجمعی", "P = \\Phi(z_2) - \\Phi(z_1) = " + f(Phi(zb), 6) + " - " + f(Phi(za), 6) + " = " + f(pv, 6), "Φ(z) مساحت زیر منحنی نرمال استاندارد تا z است."));
    const lab = (Number.isFinite(a) ? f(a) + " < " : "") + "X" + (Number.isFinite(b) ? " < " + f(b) : "");
    return { answer: "P(" + lab + ") \\approx " + f(pv, 6), steps, chart: { kind: "normal", mu, sigma, a, b } };
  }
  E.normalSteps = normalSteps;
})(typeof globalThis !== "undefined" ? globalThis : this);
