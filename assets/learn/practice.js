/* Practice problem generators: one generator per skill, endless fresh problems with exact answers.
   Each problem: { q (markdown with $math$), tex, type, ans, ansStr (canonical typed answer), ansTex,
   hint, solve() → solver-engine result with steps, or explain: [{t, tex}], opts, choices }.
   Checking lives in check.js. */
(function (root) {
  "use strict";
  const E = root.MathEngine;
  const tr = (fa, en) => (root.I18N ? root.I18N.T(fa, en) : (root.MDSA_LANG === "en" ? en : fa));
  const Q = (n, d = 1) => E.Q.of(n, d);
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const nz = (a, b) => { let v = 0; while (v === 0) v = R(a, b); return v; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const P = s => E.parse(s);
  const T = s => E.tex(P(s));
  const qT = q => q.toTeX();
  const sg = (k, first) => (k < 0 ? (first ? "-" : " - ") + Math.abs(k) : (first ? "" : " + ") + k);
  const term = (k, body, first) => { if (k === 0) return ""; const a = Math.abs(k); return (k < 0 ? (first ? "-" : " - ") : (first ? "" : " + ")) + (a === 1 && body ? "" : a) + body; };
  const poly = (cs, v = "x") => { /* cs = [a_n, ..., a_0] → "3x^2 - x + 5" */
    const n = cs.length - 1; let s = "";
    cs.forEach((c, i) => {
      const p = n - i; if (!c) return;
      const a = Math.abs(c), body = p === 0 ? "" : p === 1 ? v : v + "^" + p;
      const coef = p === 0 || a !== 1 ? String(a) : "";
      s += (s === "" ? (c < 0 ? "-" : "") : (c < 0 ? " - " : " + ")) + coef + body;
    });
    return s || "0";
  };
  const fmt = x => E.trimNum(x, 6);
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const fact = n => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
  const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
  const qStr = q => (q.isInt() ? q.toString() : (q.n < 0n ? "-" : "") + (q.n < 0n ? -q.n : q.n) + "/" + q.d);
  const deg = r => r * 180 / Math.PI;

  /* problem builders */
  const num = (q, tex, ans, extra) => Object.assign({ type: "num", q, tex, ans, ansStr: typeof ans === "number" ? fmt(ans) : qStr(ans), ansTex: typeof ans === "number" ? fmt(ans) : qT(ans) }, extra || {});
  const expr = (q, tex, ansS, extra) => { const a = P(ansS); return Object.assign({ type: "expr", q, tex, ans: a, ansStr: ansS, ansTex: E.tex(a) }, extra || {}); };
  const set = (q, tex, vals, extra) => {
    const sorted = vals.slice().sort((a, b) => (typeof a === "number" ? a : a.num()) - (typeof b === "number" ? b : b.num()));
    return Object.assign({ type: "set", q, tex, ans: sorted, ansStr: sorted.length ? sorted.map(v => (typeof v === "number" ? fmt(v) : qStr(v))).join(", ") : "none",
      ansTex: sorted.length ? sorted.map(v => (typeof v === "number" ? fmt(v) : qT(v))).join(",\\; ") : "\\varnothing" }, extra || {});
  };
  const choice = (q, tex, options, correct, extra) => {
    const idx = options.map((_, i) => i), order = shuffle(idx);
    return Object.assign({ type: "choice", q, tex, choices: order.map(i => options[i]), ans: order.indexOf(correct), ansStr: String(order.indexOf(correct)), ansTex: null, ansText: options[correct] }, extra || {});
  };
  const tuple = (q, tex, obj, vars, extra) => Object.assign({ type: "tuple", q, tex, ans: obj, opts: { vars },
    ansStr: "(" + vars.map(v => (typeof obj[v] === "number" ? fmt(obj[v]) : qStr(obj[v]))).join(", ") + ")",
    ansTex: "\\left(" + vars.map(v => (typeof obj[v] === "number" ? fmt(obj[v]) : qT(obj[v]))).join(",\\; ") + "\\right)" }, extra || {});
  const matrix = (q, tex, M, extra) => Object.assign({ type: "matrix", q, tex, ans: M, ansStr: M.map(r => r.map(x => (typeof x === "number" ? fmt(x) : qStr(x))).join(" ")).join("; "),
    ansTex: "\\begin{bmatrix}" + M.map(r => r.map(x => (typeof x === "number" ? fmt(x) : qT(x))).join(" & ")).join(" \\\\ ") + "\\end{bmatrix}" }, extra || {});
  const mtex = M => "\\begin{bmatrix}" + M.map(r => r.join(" & ")).join(" \\\\ ") + "\\end{bmatrix}";
  const vtex = v => "\\begin{bmatrix}" + v.join(" \\\\ ") + "\\end{bmatrix}";
  const step = (t, tex) => ({ t, tex });
  const solveEq = s => () => { const g = E.parseStatement(s)[0]; return E.solveEquation(g.parts[0], g.parts[1]); };
  const solveIneq = s => () => { const g = E.parseStatement(s)[0]; return E.solveInequality(g.parts[0], g.rels[0], g.parts[1]); };
  const SOLVER = (c, m, q, p) => ({ c, m, q, p: p || {} });

  const G = {};

  /* ===================== Foundations ===================== */
  G["f-numbers"] = () => {
    const k = R(0, 4);
    if (k === 0) { const a = R(-20, 20), b = nz(-20, 20), op = pick(["+", "-", "*"]); const s = a + " " + op + " (" + b + ")"; const v = op === "+" ? a + b : op === "-" ? a - b : a * b;
      return num(tr("حاصل را حساب کن.", "Compute."), T(s), Q(v), { solve: () => E.arithmetic(P(s)), hint: tr("قرینه را به جمع تبدیل کن: کم کردن یک عدد منفی یعنی اضافه کردن قرینه‌اش.", "Subtracting a negative number is the same as adding its opposite.") }); }
    if (k === 1) { const b = nz(-9, 9), q = nz(-9, 9), a = b * q; const s = a + " / (" + b + ")";
      return num(tr("حاصل تقسیم را بنویس.", "Compute the quotient."), T(s), Q(q), { solve: () => E.arithmetic(P(s)), hint: tr("علامت: دو عدد هم‌علامت ← مثبت؛ دو عدد با علامت مخالف ← منفی.", "Signs: same signs → positive, different signs → negative.") }); }
    if (k === 2) { const a = R(-15, 15), b = R(-15, 15);
      return num(tr("فاصلهٔ دو عدد $" + a + "$ و $" + b + "$ روی خط اعداد چقدر است؟", "What is the distance between $" + a + "$ and $" + b + "$ on the number line?"), "", Q(Math.abs(a - b)), {
        explain: [step(tr("فاصله = قدرمطلق تفاضل", "distance = absolute value of the difference"), "\\left|" + a + " - (" + b + ")\\right| = " + Math.abs(a - b))], hint: tr("فاصله همیشه نامنفی است: |a − b|.", "Distance is never negative: |a − b|.") }); }
    if (k === 3) { const a = R(-12, 12), b = R(-12, 12), s = "abs(" + a + ") - abs(" + b + ")";
      return num(tr("حاصل را حساب کن.", "Compute."), T(s), Q(Math.abs(a) - Math.abs(b)), { solve: () => E.arithmetic(P(s)) }); }
    const t = R(-12, -1), d = R(3, 15);
    return num(tr("دمای هوا $" + t + "$ درجه است و $" + d + "$ درجه گرم‌تر می‌شود. دمای جدید چند درجه است؟", "The temperature is $" + t + "$ degrees and rises by $" + d + "$ degrees. What is the new temperature?"), "", Q(t + d), {
      explain: [step(tr("جمع با عدد منفی", "add to a negative number"), t + " + " + d + " = " + (t + d))] });
  };
  G["f-order"] = () => {
    const a = R(2, 9), b = R(2, 9), c = R(2, 6), d = R(1, 9);
    const forms = [a + " + " + b + " * " + c, "(" + a + " + " + b + ") * " + c, a * c + " / " + c + " + " + b + "^2", a + " * (" + (b + d) + " - " + d + ") - " + c, (a * b) + " - " + b + " * (" + c + " - " + (c - 2) + ")^2", "2 * " + a + "^2 - " + b * 2 + " / 2"];
    const s = pick(forms), r = E.arithmetic(P(s));
    return num(tr("با رعایت ترتیب عملیات حساب کن.", "Compute using the order of operations."), T(s), E.evalExact(P(s)), { solve: () => E.arithmetic(P(s)), hint: tr("ترتیب: پرانتز، توان، ضرب و تقسیم (از چپ به راست)، جمع و تفریق.", "Order: parentheses, exponents, multiplication/division (left to right), then addition/subtraction.") });
  };
  G["f-factors"] = () => {
    const k = R(0, 3);
    if (k <= 1) { const g = pick([2, 3, 4, 5, 6, 7, 8, 9, 12, 15]); let m = R(2, 9), n = R(2, 9); while (gcd(m, n) !== 1 || m === n) { m = R(2, 9); n = R(2, 9); }
      const A = g * m, B = g * n, isG = k === 0, ans = isG ? g : g * m * n;
      return num(isG ? tr("بزرگ‌ترین مقسوم‌علیه مشترک (ب.م.م) دو عدد $" + A + "$ و $" + B + "$ را پیدا کن.", "Find the greatest common divisor of $" + A + "$ and $" + B + "$.") : tr("کوچک‌ترین مضرب مشترک (ک.م.م) دو عدد $" + A + "$ و $" + B + "$ را پیدا کن.", "Find the least common multiple of $" + A + "$ and $" + B + "$."), "", Q(ans), {
        solve: () => E.gcdSteps([A, B]), hint: isG ? tr("از الگوریتم اقلیدس استفاده کن یا هر دو را به عوامل اول تجزیه کن.", "Use the Euclidean algorithm or factor both numbers into primes.") : tr("ک.م.م = حاصل‌ضرب دو عدد ÷ ب.م.م", "lcm = product of the numbers ÷ gcd") }); }
    if (k === 2) { const n = pick([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 91, 87, 51, 57, 49, 77, 81, 63, 93, 99, 85, 65, 39]);
      let p = 2; while (p * p <= n && n % p) p++; const prime = p * p > n;
      return choice(tr("آیا $" + n + "$ عدد اول است؟", "Is $" + n + "$ a prime number?"), "", [tr("بله، اول است", "Yes, it is prime"), tr("نه، مرکب است", "No, it is composite")], prime ? 0 : 1, {
        explain: [step(tr("آزمون مقسوم‌علیه‌ها تا ریشهٔ دوم", "test divisors up to the square root"), prime ? "\\sqrt{" + n + "} \\approx " + fmt(Math.sqrt(n)) + "\\Rightarrow \\text{" + tr("هیچ مقسوم‌علیهی ندارد", "no divisor") + "}" : n + " = " + p + " \\times " + n / p)],
        hint: tr("فقط کافی است بخش‌پذیری بر اعداد اول تا √n را بررسی کنی.", "You only need to test primes up to √n.") }); }
    const n = pick([2, 3, 4, 5, 6, 8, 9, 10, 12]) * pick([3, 5, 7, 9, 11, 13]) * pick([1, 2, 5]);
    let p = 2; while (n % p) p++;
    return num(tr("کوچک‌ترین عامل اول $" + n + "$ چیست؟", "What is the smallest prime factor of $" + n + "$?"), "", Q(p), { solve: () => E.primeFactorSteps(n) });
  };
  G["f-fractions"] = () => {
    const k = R(0, 4);
    if (k === 4) { const g = R(2, 9); let a = R(1, 9), b = R(2, 12); while (gcd(a, b) !== 1 || a >= b) { a = R(1, 9); b = R(2, 12); }
      const s = a * g + "/" + b * g;
      return num(tr("کسر را به ساده‌ترین شکل بنویس.", "Write the fraction in lowest terms."), T(s), Q(a, b), { opts: { lowest: true }, explain: [step(tr("صورت و مخرج را بر ب.م.م تقسیم کن", "divide top and bottom by the gcd"), "\\frac{" + a * g + "}{" + b * g + "} = \\frac{" + a * g + " \\div " + g + "}{" + b * g + " \\div " + g + "} = \\frac{" + a + "}{" + b + "}")] }); }
    const b = R(2, 12), d = R(2, 12), a = nz(1, b * 2), c = nz(1, d * 2), op = ["+", "-", "*", "/"][k];
    const s = "(" + a + "/" + b + ") " + op + " (" + c + "/" + d + ")";
    return num(tr("حاصل را به صورت کسر ساده بنویس.", "Write the result as a fraction in lowest terms."), T(s), E.evalExact(P(s)), { opts: { lowest: true }, solve: () => E.arithmetic(P(s)),
      hint: op === "+" || op === "-" ? tr("اول مخرج مشترک بگیر.", "Find a common denominator first.") : op === "*" ? tr("صورت در صورت، مخرج در مخرج.", "Multiply numerators and denominators.") : tr("در معکوس کسر دوم ضرب کن.", "Multiply by the reciprocal of the second fraction.") });
  };
  G["f-decimals"] = () => {
    const k = R(0, 3);
    if (k === 0) { const p = pick([5, 10, 12, 15, 20, 25, 30, 40, 75]), n = pick([40, 60, 80, 120, 200, 240, 360, 500]);
      return num(tr("$" + p + "\\%$ از $" + n + "$ چقدر است؟", "What is $" + p + "\\%$ of $" + n + "$?"), "", Q(p * n, 100), { explain: [step(tr("درصد را به کسر تبدیل کن", "turn the percent into a fraction"), "\\frac{" + p + "}{100} \\times " + n + " = " + fmt(p * n / 100))] }); }
    if (k === 1) { const a = pick([40, 50, 80, 120, 200, 250]), ch = pick([-50, -25, -20, -10, 10, 15, 20, 25, 50, 75]), b = a * (100 + ch) / 100;
      return num(tr("قیمتی از $" + a + "$ به $" + b + "$ رسیده است. درصد تغییر چقدر است؟ (کاهش را با علامت منفی بنویس)", "A price changes from $" + a + "$ to $" + b + "$. What is the percent change? (write a decrease as negative)"), "", Q(ch), {
        explain: [step(tr("درصد تغییر", "percent change"), "\\frac{" + b + " - " + a + "}{" + a + "} \\times 100 = " + ch + "\\%")], hint: tr("تغییر را بر مقدار قدیمی تقسیم کن، نه جدید.", "Divide the change by the old value, not the new one.") }); }
    if (k === 2) { const pair = pick([[1, 4], [3, 4], [1, 5], [2, 5], [3, 8], [7, 20], [9, 25], [1, 8], [5, 8], [3, 20]]);
      return num(tr("کسر $\\frac{" + pair[0] + "}{" + pair[1] + "}$ چند درصد است؟", "What percent is $\\frac{" + pair[0] + "}{" + pair[1] + "}$?"), "", Q(pair[0] * 100, pair[1]), { explain: [step(tr("ضرب در ۱۰۰", "multiply by 100"), "\\frac{" + pair[0] + "}{" + pair[1] + "} \\times 100 = " + fmt(pair[0] * 100 / pair[1]) + "\\%")] }); }
    const a = R(11, 99) / 10, b = R(2, 9) / 10, s = a + " * " + b;
    return num(tr("حاصل‌ضرب اعشاری را حساب کن.", "Multiply the decimals."), T(s), E.evalExact(P(s)), { solve: () => E.arithmetic(P(s)), hint: tr("بدون ممیز ضرب کن و بعد تعداد رقم‌های اعشار را بشمار.", "Multiply without the decimal points, then count decimal places.") });
  };
  G["f-ratio"] = () => {
    const k = R(0, 3);
    if (k === 0) { const a = R(2, 9), b = R(2, 9), m = R(2, 6), c = b * m;
      return set(tr("معادلهٔ تناسب را حل کن.", "Solve the proportion."), "\\frac{" + a + "}{" + b + "} = \\frac{x}{" + c + "}", [Q(a * m)], { solve: solveEq(a + "/" + b + " = x/" + c), hint: tr("ضرب طرفین در وسطین: a·d = b·c", "Cross-multiply: a·d = b·c") }); }
    if (k === 1) { const a = R(1, 5), b = R(1, 5), t = (a + b) * R(5, 30);
      return num(tr("مبلغ $" + t + "$ به نسبت $" + a + ":" + b + "$ بین دو نفر تقسیم می‌شود. سهم نفر اول چقدر است؟", "An amount of $" + t + "$ is split in the ratio $" + a + ":" + b + "$. How much does the first person get?"), "", Q(t * a, a + b), {
        explain: [step(tr("تعداد کل سهم‌ها", "total parts"), a + " + " + b + " = " + (a + b)), step(tr("سهم نفر اول", "first share"), "\\frac{" + a + "}{" + (a + b) + "} \\times " + t + " = " + fmt(t * a / (a + b)))] }); }
    if (k === 2) { const n = R(3, 12), price = R(2, 9) * n;
      return num(tr("$" + n + "$ عدد قلم $" + price + "$ هزار تومان قیمت دارد. قیمت هر قلم چند هزار تومان است؟", "$" + n + "$ pens cost $" + price + "$ dollars. What is the price per pen?"), "", Q(price, n), { explain: [step(tr("آهنگ واحد", "unit rate"), "\\frac{" + price + "}{" + n + "} = " + fmt(price / n))] }); }
    const sc = pick([1000, 2000, 5000, 10000, 25000]), cm = R(2, 15);
    return num(tr("در نقشه‌ای با مقیاس $1:" + sc + "$، فاصلهٔ $" + cm + "$ سانتی‌متری چند متر واقعی است؟", "On a map with scale $1:" + sc + "$, how many real meters is $" + cm + "$ cm?"), "", Q(cm * sc, 100), {
      explain: [step(tr("در مقیاس ضرب کن و به متر تبدیل کن", "multiply by the scale and convert to meters"), cm + " \\times " + sc + " = " + cm * sc + "\\text{ cm} = " + fmt(cm * sc / 100) + "\\text{ m}")] });
  };
  G["f-exponents"] = () => {
    const k = R(0, 4);
    if (k === 0) { const a = R(2, 5), n = R(-3, 4), s = a + "^(" + n + ")";
      return num(tr("مقدار توان را حساب کن.", "Evaluate the power."), T(s), E.evalExact(P(s)), { solve: () => E.arithmetic(P(s)), hint: tr("توان منفی یعنی معکوس: a⁻ⁿ = 1/aⁿ؛ و a⁰ = 1.", "A negative exponent means a reciprocal: a⁻ⁿ = 1/aⁿ, and a⁰ = 1.") }); }
    if (k === 1) { const m = R(2, 7), n = R(2, 7), f = R(0, 2);
      const s = f === 0 ? "x^" + m + " * x^" + n : f === 1 ? "(x^" + m + ")^" + n : "x^" + (m + n) + " / x^" + n;
      const ans = f === 0 ? "x^" + (m + n) : f === 1 ? "x^" + m * n : "x^" + m;
      return expr(tr("به صورت یک توان از x ساده کن.", "Simplify to a single power of x."), T(s), ans, { opts: { form: "simplest", vars: ["x"] }, explain: [step(tr("قانون توان", "exponent rule"), (f === 0 ? "x^{a}x^{b} = x^{a+b}" : f === 1 ? "(x^{a})^{b} = x^{ab}" : "\\frac{x^{a}}{x^{b}} = x^{a-b}") + "\\;\\Rightarrow\\; " + T(ans))] }); }
    if (k === 2) { const r = R(2, 15), s = "sqrt(" + r * r + ")";
      return num(tr("ریشهٔ دوم را حساب کن.", "Find the square root."), T(s), Q(r), { explain: [step(tr("عددی که مربعش برابر است", "the number whose square it is"), r + "^{2} = " + r * r)] }); }
    if (k === 3) { const m = R(11, 99) / 10, e = R(-6, -2), val = m * Math.pow(10, e);
      return num(tr("عدد $" + val.toFixed(-e + 1).replace(/0+$/, "") + "$ را به نماد علمی $a \\times 10^{n}$ بنویس. مقدار $n$ چیست؟", "Write $" + val.toFixed(-e + 1).replace(/0+$/, "") + "$ in scientific notation $a \\times 10^{n}$. What is $n$?"), "", Q(e), {
        explain: [step(tr("ممیز را جابه‌جا کن تا 1 ≤ a < 10", "move the decimal point so 1 ≤ a < 10"), fmt(val) + " = " + m + " \\times 10^{" + e + "}")] }); }
    const a = R(2, 4), b = R(2, 3), m = R(2, 5), n = R(2, 5), s = "(" + a + "*10^" + m + ")*(" + b + "*10^" + n + ")";
    return num(tr("حاصل‌ضرب را حساب کن (می‌توانی جواب را به شکل a*10^n بنویسی).", "Compute the product (you may write the answer as a*10^n)."), T(s), Q(a * b * Math.pow(10, m + n)), {
      explain: [step(tr("ضریب‌ها را ضرب و توان‌ها را جمع کن", "multiply the coefficients and add the exponents"), "(" + a + " \\times " + b + ") \\times 10^{" + m + " + " + n + "} = " + a * b + " \\times 10^{" + (m + n) + "}")] });
  };

  /* ===================== Algebra ===================== */
  G["a-expressions"] = () => {
    if (R(0, 2) === 0) { const a = nz(-5, 5), b = nz(-5, 5), x = R(-4, 4), s = poly([a, b]); const v = a * x + b;
      return num(tr("مقدار عبارت را به ازای $x = " + x + "$ حساب کن.", "Evaluate the expression for $x = " + x + "$."), T(s), Q(v), { solve: () => E.arithmetic(E.subst(P(s), "x", E.N.num(Q(x)))) }); }
    const a = nz(-5, 5), b = nz(-6, 6), c = nz(-5, 5), d = nz(-6, 6);
    const s = a + "(x" + sg(b) + ")" + sg(c) + "(x" + sg(d) + ")";
    const A = a + c, B = a * b + c * d;
    return expr(tr("عبارت را ساده کن (پرانتزها را باز کن و جمله‌های متشابه را جمع کن).", "Simplify (expand and combine like terms)."), T(s), poly([A, B]), { opts: { form: "expanded", vars: ["x"] }, solve: () => E.simplifySteps(P(s)), hint: tr("ضریب پشت پرانتز در همهٔ جمله‌های داخل ضرب می‌شود.", "The number in front multiplies every term inside the parentheses.") });
  };
  G["a-linear-eq"] = () => {
    const x = nz(-9, 9), k = R(0, 2);
    let s;
    if (k === 0) { const a = nz(-7, 7), b = R(-12, 12); s = poly([a, b]) + " = " + (a * x + b); }
    else if (k === 1) { const a = nz(-6, 6); let c = nz(-6, 6); while (c === a) c = nz(-6, 6); const b = R(-10, 10), d = a * x + b - c * x; s = poly([a, b]) + " = " + poly([c, d]); }
    else { const a = nz(2, 5), b = nz(-6, 6), c = R(2, 4); s = a + "(x" + sg(b) + ") = " + (a * (x + b) + c) + " - " + c; }
    return set(tr("معادله را حل کن.", "Solve the equation."), T(s.split("=")[0]) + " = " + T(s.split("=")[1]), [Q(x)], { solve: solveEq(s), hint: tr("هر کاری که روی یک طرف انجام می‌دهی، روی طرف دیگر هم انجام بده تا x تنها بماند.", "Do the same operation to both sides until x is alone.") });
  };
  G["a-inequalities"] = () => {
    const a = nz(-6, 6), x0 = R(-8, 8), b = R(-10, 10), op = pick(["<", ">", "<=", ">="]), c = a * x0 + b;
    const s = poly([a, b]) + " " + op + " " + c;
    const flip = { "<": ">", ">": "<", "<=": ">=", ">=": "<=" }, fop = a < 0 ? flip[op] : op;
    const cmp = (x, o) => (o === "<" ? x < x0 : o === ">" ? x > x0 : o === "<=" ? x <= x0 : x >= x0);
    const rel = { "<": "<", ">": ">", "<=": "\\le", ">=": "\\ge" };
    return { type: "ineq", q: tr("نامعادله را حل کن (مثلاً به شکل $x < 3$ بنویس).", "Solve the inequality (write e.g. $x < 3$)."), tex: T(poly([a, b])) + " " + rel[op] + " " + c, ans: x => cmp(x, fop), opts: { v: "x", critical: [x0] },
      ansStr: "x " + fop + " " + x0, ansTex: "x " + rel[fop] + " " + x0, solve: solveIneq(s), hint: a < 0 ? tr("ضریب x منفی است؛ موقع تقسیم جهت نامساوی برعکس می‌شود.", "The coefficient of x is negative, so dividing flips the inequality.") : tr("مثل معادله حل کن.", "Solve it like an equation.") };
  };
  G["a-functions"] = () => {
    const k = R(0, 2);
    if (k === 0) { const a = nz(-3, 3), b = R(-5, 5), c = R(-6, 6), x = R(-3, 3), f = poly([a, b, c]);
      return num(tr("اگر $f(x) = " + T(f) + "$ باشد، $f(" + x + ")$ را حساب کن.", "If $f(x) = " + T(f) + "$, find $f(" + x + ")$."), "", Q(a * x * x + b * x + c), { solve: () => E.arithmetic(E.subst(P(f), "x", E.N.num(Q(x)))), hint: tr("هر جا x هست، عدد را داخل پرانتز بگذار.", "Replace every x with the number, in parentheses.") }); }
    if (k === 1) { const a = nz(-5, 5), b = R(-9, 9), x = R(-6, 6), v = a * x + b, f = poly([a, b]);
      return set(tr("اگر $f(x) = " + T(f) + "$ باشد، به ازای چه $x$ای $f(x) = " + v + "$ است؟", "If $f(x) = " + T(f) + "$, for which $x$ is $f(x) = " + v + "$?"), "", [Q(x)], { solve: solveEq(f + " = " + v) }); }
    const a = nz(-3, 3), b = R(-4, 4), c = nz(-2, 2), d = R(-3, 3), x = R(-2, 2);
    const g = poly([c, d]), f = poly([a, b]), gx = c * x + d;
    return num(tr("اگر $f(x) = " + T(f) + "$ و $g(x) = " + T(g) + "$، مقدار $f(g(" + x + "))$ چیست؟", "If $f(x) = " + T(f) + "$ and $g(x) = " + T(g) + "$, what is $f(g(" + x + "))$?"), "", Q(a * gx + b), {
      explain: [step(tr("اول تابع داخلی", "inner function first"), "g(" + x + ") = " + gx), step(tr("سپس تابع بیرونی", "then the outer function"), "f(" + gx + ") = " + (a * gx + b))] });
  };
  G["a-lines"] = () => {
    const k = R(0, 2);
    let x1 = R(-6, 6), x2 = R(-6, 6); while (x2 === x1) x2 = R(-6, 6);
    const m = pick([-3, -2, -1, 1, 2, 3, Q(1, 2), Q(-1, 2), Q(2, 3)]), mq = typeof m === "number" ? Q(m) : m, b = R(-5, 5);
    const y = x => mq.mul(Q(x)).add(Q(b));
    if (k === 0) return num(tr("شیب خطی که از نقطه‌های $(" + x1 + ", " + qStr(y(x1)) + ")$ و $(" + x2 + ", " + qStr(y(x2)) + ")$ می‌گذرد چیست؟", "What is the slope of the line through $(" + x1 + ", " + qStr(y(x1)) + ")$ and $(" + x2 + ", " + qStr(y(x2)) + ")$?"), "", mq, {
      explain: [step(tr("فرمول شیب", "slope formula"), "m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{" + qT(y(x2)) + " - (" + qT(y(x1)) + ")}{" + x2 + " - (" + x1 + ")} = " + qT(mq))] });
    if (k === 1) { const ans = E.plain(E.simp(E.N.add(E.N.mul(E.N.num(mq), E.N.v("x")), E.N.num(Q(b)))));
      return expr(tr("معادلهٔ خطی را که از $(" + x1 + ", " + qStr(y(x1)) + ")$ و $(" + x2 + ", " + qStr(y(x2)) + ")$ می‌گذرد به شکل $y = mx + b$ بنویس.", "Write the equation of the line through $(" + x1 + ", " + qStr(y(x1)) + ")$ and $(" + x2 + ", " + qStr(y(x2)) + ")$ in the form $y = mx + b$."), "", ans, { opts: { vars: ["x"] },
        explain: [step(tr("شیب", "slope"), "m = " + qT(mq)), step(tr("عرض از مبدأ با جایگذاری یک نقطه", "intercept from one point"), "b = y_1 - m x_1 = " + b), step(tr("معادله", "equation"), "y = " + T(ans))] }); }
    const A = nz(-6, 6), B = nz(-6, 6), Cc = A * R(-3, 3) + B * R(-3, 3);
    return num(tr("عرض از مبدأ خط $" + T(poly([A, 0]) + " + " + B + "*y") + " = " + Cc + "$ چیست؟", "What is the y-intercept of the line $" + T(poly([A, 0]) + " + " + B + "*y") + " = " + Cc + "$?"), "", Q(Cc, B), {
      explain: [step(tr("x = 0 بگذار", "set x = 0"), B + "y = " + Cc + " \\Rightarrow y = " + qT(Q(Cc, B)))] });
  };
  G["a-systems"] = () => {
    const x = nz(-6, 6), y = nz(-6, 6); let a, b, c, d; do { a = nz(-5, 5); b = nz(-5, 5); c = nz(-5, 5); d = nz(-5, 5); } while (a * d - b * c === 0);
    const e1 = term(a, "x", true) + term(b, "y") + " = " + (a * x + b * y), e2 = term(c, "x", true) + term(d, "y") + " = " + (c * x + d * y);
    return tuple(tr("دستگاه را حل کن و جواب را به شکل $(x, y)$ بنویس.", "Solve the system and write the answer as $(x, y)$."), "\\begin{cases}" + T(e1.split("=")[0]) + " = " + (a * x + b * y) + " \\\\ " + T(e2.split("=")[0]) + " = " + (c * x + d * y) + "\\end{cases}", { x: Q(x), y: Q(y) }, ["x", "y"], {
      solve: () => E.solveSystem(E.parseStatement(e1 + "," + e2).map(g => g.parts)), hint: tr("یکی از متغیرها را با ضرب و جمع معادله‌ها حذف کن، یا از یک معادله جایگذاری کن.", "Eliminate one variable by multiplying and adding the equations, or substitute from one equation.") });
  };
  G["a-polynomials"] = () => {
    const k = R(0, 2);
    if (k === 0) { const r = nz(-7, 7), s = nz(-7, 7), a = pick([1, 1, 1, 2, 3]); const f = poly([a, -a * (r + s), a * r * s]);
      const ans = (a > 1 ? a + "*" : "") + "(x" + sg(-r) + ")(x" + sg(-s) + ")";
      return expr(tr("چندجمله‌ای را تجزیه کن.", "Factor the polynomial."), T(f), ans, { opts: { form: "factored", vars: ["x"] }, solve: () => E.factorSteps(P(f)), hint: tr("اگر ضریب مشترک هست اول آن را بیرون بکش؛ بعد دو عدد با حاصل‌ضرب c و مجموع b پیدا کن.", "Take out any common factor first, then find two numbers with product c and sum b.") }); }
    if (k === 1) { const a = nz(-4, 4), b = nz(-6, 6), c = nz(-4, 4), d = nz(-6, 6); const s = "(" + poly([a, b]) + ")(" + poly([c, d]) + ")";
      return expr(tr("حاصل‌ضرب را بسط بده.", "Expand the product."), T(s), poly([a * c, a * d + b * c, b * d]), { opts: { form: "expanded", vars: ["x"] }, solve: () => E.expandSteps(P(s)), hint: tr("هر جملهٔ پرانتز اول را در هر جملهٔ پرانتز دوم ضرب کن.", "Multiply each term of the first factor by each term of the second.") }); }
    const p1 = [nz(-4, 4), R(-6, 6), R(-6, 6)], p2 = [nz(-4, 4), R(-6, 6), R(-6, 6)], minus = R(0, 1) === 1;
    const s = "(" + poly(p1) + ") " + (minus ? "-" : "+") + " (" + poly(p2) + ")";
    return expr(tr("ساده کن.", "Simplify."), T(s), poly(p1.map((v, i) => v + (minus ? -1 : 1) * p2[i])), { opts: { form: "expanded", vars: ["x"] }, solve: () => E.simplifySteps(P(s)), hint: minus ? tr("علامت منفی پشت پرانتز همهٔ علامت‌های داخل را عوض می‌کند.", "A minus sign before parentheses changes every sign inside.") : null });
  };
  G["a-quadratics"] = () => {
    const k = R(0, 3);
    let f, roots;
    if (k <= 1) { const r = nz(-8, 8), s = R(-8, 8), a = k === 0 ? 1 : pick([2, 3, -1]); f = poly([a, -a * (r + s), a * r * s]); roots = r === s ? [Q(r)] : [Q(r), Q(s)]; }
    else if (k === 2) { const b = pick([2, 4, 6, -2, -4]), c = pick([-1, -2, -3, 1, -5]); f = poly([1, b, c]); const D = b * b - 4 * c; roots = D < 0 ? [] : [(-b - Math.sqrt(D)) / 2, (-b + Math.sqrt(D)) / 2]; }
    else { const b = R(-3, 3), c = R(5, 12); f = poly([1, b, c]); roots = []; }
    return set(tr("معادله را حل کن (ریشه‌ها را با ویرگول جدا کن؛ اگر جواب حقیقی ندارد بنویس none).", "Solve (separate roots with commas; if there is no real solution, write none)."), T(f) + " = 0", roots, { opts: { rtol: 1e-6, tol: 1e-6 }, solve: solveEq(f + " = 0"), hint: tr("اول سعی کن تجزیه کنی؛ اگر نشد از فرمول x = (−b ± √Δ)/2a استفاده کن.", "Try factoring first; if that fails, use x = (−b ± √Δ)/2a.") });
  };
  G["a-rational"] = () => {
    if (R(0, 1) === 0) { const r = nz(-6, 6), s = nz(-6, 6); const num_ = poly([1, r + s, r * s]), den = "x" + sg(r);
      return expr(tr("کسر جبری را ساده کن.", "Simplify the rational expression."), "\\frac{" + T(num_) + "}{" + T(den) + "}", "x" + sg(s), { opts: { form: "simplest", vars: ["x"] }, solve: () => E.simplifySteps(P("(" + num_ + ")/(" + den + ")")), hint: tr("صورت را تجزیه کن و عامل مشترک را حذف کن.", "Factor the numerator and cancel the common factor.") }); }
    const a = R(2, 6), x = pick([2, 3, 4, 6, -2, -3]), b = a * x / (x + a);
    const rhs = E.Q.of(1, 1).div(Q(x)).add(Q(1, a));
    return set(tr("معادلهٔ کسری را حل کن.", "Solve the rational equation."), "\\frac{1}{x} + \\frac{1}{" + a + "} = " + qT(rhs), [Q(x)], { solve: solveEq("1/x + 1/" + a + " = " + qStr(rhs)), hint: tr("دو طرف را در مخرج مشترک ضرب کن و یادت باشد x ≠ 0.", "Multiply both sides by the common denominator; remember x ≠ 0.") });
  };
  G["a-radicals"] = () => {
    const k = R(0, 2);
    if (k === 0) { const a = R(2, 7), b = pick([2, 3, 5, 6, 7]), n = a * a * b;
      return expr(tr("رادیکال را ساده کن.", "Simplify the radical."), "\\sqrt{" + n + "}", a + "*sqrt(" + b + ")", { opts: { form: "radical", vars: [] }, explain: [step(tr("بزرگ‌ترین مربع کامل را جدا کن", "split off the largest perfect square"), "\\sqrt{" + n + "} = \\sqrt{" + a * a + " \\cdot " + b + "} = " + a + "\\sqrt{" + b + "}")] }); }
    if (k === 1) { const base = pick([[8, 3], [27, 3], [16, 4], [32, 5], [64, 3], [125, 3], [81, 4]]), r = Math.round(Math.pow(base[0], 1 / base[1])), p = R(1, 3) * (R(0, 3) === 0 ? -1 : 1);
      const s = base[0] + "^(" + p + "/" + base[1] + ")";
      return num(tr("مقدار را حساب کن.", "Evaluate."), T(s), E.evalExact(P(s)) || Q(Math.round(Math.pow(r, p))), { explain: [step(tr("اول ریشه، بعد توان", "root first, then power"), base[0] + "^{" + p + "/" + base[1] + "} = \\left(\\sqrt[" + base[1] + "]{" + base[0] + "}\\right)^{" + p + "} = " + r + "^{" + p + "}")] }); }
    const x = R(1, 12), a = R(-3, 6), b = Math.sqrt(x + a); if (!Number.isInteger(b)) return G["a-radicals"]();
    return set(tr("معادله را حل کن.", "Solve the equation."), "\\sqrt{x" + (a < 0 ? " - " + -a : " + " + a) + "} = " + b, [Q(x)], { solve: solveEq("sqrt(x" + sg(a) + ") = " + b), hint: tr("دو طرف را به توان ۲ برسان و جواب را در معادلهٔ اصلی امتحان کن.", "Square both sides and check the answer in the original equation.") });
  };
  G["a-explog"] = () => {
    const k = R(0, 3);
    if (k === 0) { const b = pick([2, 3, 5, 10]), n = R(-2, 4), v = Math.pow(b, n);
      return num(tr("مقدار لگاریتم را حساب کن.", "Evaluate the logarithm."), "\\log_{" + b + "}\\left(" + (n < 0 ? "\\frac{1}{" + Math.pow(b, -n) + "}" : v) + "\\right)", Q(n), { explain: [step(tr("لگاریتم یعنی توان", "a logarithm is an exponent"), b + "^{" + n + "} = " + (n < 0 ? "\\frac{1}{" + Math.pow(b, -n) + "}" : v))], hint: tr("بپرس: پایه را به چه توانی برسانم تا این عدد بشود؟", "Ask: to what power must I raise the base to get this number?") }); }
    if (k === 1) { const b = pick([2, 3, 5]), x = R(1, 5), c = Math.pow(b, x);
      return set(tr("معادلهٔ نمایی را حل کن.", "Solve the exponential equation."), b + "^{x} = " + c, [Q(x)], { solve: solveEq(b + "^x = " + c) }); }
    if (k === 2) { const b = pick([2, 3, 10]), m = R(1, 3), n = R(1, 3);
      return num(tr("با قوانین لگاریتم ساده کن.", "Simplify using log rules."), "\\log_{" + b + "}" + Math.pow(b, m) + " + \\log_{" + b + "}" + Math.pow(b, n), Q(m + n), { explain: [step(tr("قانون ضرب", "product rule"), "\\log_b M + \\log_b N = \\log_b (MN) = \\log_{" + b + "} " + Math.pow(b, m + n) + " = " + (m + n))] }); }
    const kk = R(1, 3);
    return set(tr("معادله را حل کن (جواب را دقیق مثل e^2 یا تقریبی بنویس).", "Solve (give the exact answer like e^2, or a decimal)."), "\\ln(x) = " + kk, [Math.exp(kk)], { opts: { rtol: 1e-3 }, solve: solveEq("ln(x) = " + kk), hint: tr("ln x = k یعنی x = eᵏ.", "ln x = k means x = eᵏ.") });
  };
  G["a-transform"] = () => {
    const k = R(0, 2);
    if (k === 0) { const a = nz(-4, 4), b = R(-6, 6);
      return expr(tr("وارون تابع $f(x) = " + T(poly([a, b])) + "$ را پیدا کن.", "Find the inverse of $f(x) = " + T(poly([a, b])) + "$."), "", "(x" + sg(-b) + ")/(" + a + ")", { opts: { vars: ["x"] },
        explain: [step(tr("y را بنویس و x و y را جابه‌جا کن", "write y and swap x and y"), "x = " + T(poly([a, b], "y"))), step(tr("y را تنها کن", "solve for y"), "f^{-1}(x) = " + T("(x" + sg(-b) + ")/(" + a + ")"))] }); }
    if (k === 1) { const a = nz(-3, 3), b = R(-3, 3), c = nz(-3, 3), d = R(-3, 3);
      return expr(tr("اگر $f(x) = " + T(poly([a, b])) + "$ و $g(x) = " + T(poly([c, d])) + "$، تابع $f(g(x))$ را بنویس.", "If $f(x) = " + T(poly([a, b])) + "$ and $g(x) = " + T(poly([c, d])) + "$, write $f(g(x))$."), "", poly([a * c, a * d + b]), { opts: { vars: ["x"] },
        explain: [step(tr("g(x) را به جای x در f بگذار", "plug g(x) into f"), "f(g(x)) = " + a + "(" + T(poly([c, d])) + ")" + sg(b) + " = " + T(poly([a * c, a * d + b])))] }); }
    const h = nz(-4, 4), kk = R(-5, 5);
    return expr(tr("نمودار $f(x) = x^2$ را $" + Math.abs(h) + "$ واحد به " + (h > 0 ? "راست" : "چپ") + " و $" + Math.abs(kk) + "$ واحد به " + (kk >= 0 ? "بالا" : "پایین") + " منتقل کن. ضابطهٔ تابع جدید چیست؟", "Shift the graph of $f(x) = x^2$ " + Math.abs(h) + " units " + (h > 0 ? "right" : "left") + " and " + Math.abs(kk) + " units " + (kk >= 0 ? "up" : "down") + ". What is the new function?"), "", "(x" + sg(-h) + ")^2" + sg(kk), { opts: { vars: ["x"] },
      explain: [step(tr("انتقال افقی داخل پرانتز با علامت مخالف، انتقال عمودی بیرون", "horizontal shift inside with the opposite sign, vertical shift outside"), "g(x) = f(x - h) + k = " + T("(x" + sg(-h) + ")^2" + sg(kk)))] });
  };

  /* ===================== Geometry & trigonometry ===================== */
  G["g-shapes"] = () => {
    const k = R(0, 3);
    if (k === 0) { const a = R(25, 90), b = R(20, 160 - a);
      return num(tr("دو زاویهٔ یک مثلث $" + a + "^\\circ$ و $" + b + "^\\circ$ است. زاویهٔ سوم چند درجه است؟", "Two angles of a triangle are $" + a + "^\\circ$ and $" + b + "^\\circ$. What is the third angle?"), "", Q(180 - a - b), { explain: [step(tr("مجموع زاویه‌های مثلث ۱۸۰ درجه است", "angles in a triangle sum to 180°"), "180 - " + a + " - " + b + " = " + (180 - a - b))] }); }
    if (k === 1) { const n = R(5, 12);
      return num(tr("مجموع زاویه‌های داخلی یک $" + n + "$ضلعی چند درجه است؟", "What is the sum of the interior angles of a $" + n + "$-sided polygon?"), "", Q((n - 2) * 180), { explain: [step(tr("فرمول", "formula"), "(n - 2) \\times 180 = " + (n - 2) + " \\times 180 = " + (n - 2) * 180)] }); }
    if (k === 2) { const n = pick([5, 6, 8, 9, 10, 12, 15, 18, 20]);
      return num(tr("هر زاویهٔ داخلی یک $" + n + "$ضلعی منتظم چند درجه است؟", "Each interior angle of a regular $" + n + "$-gon measures how many degrees?"), "", Q((n - 2) * 180, n), { explain: [step(tr("مجموع تقسیم بر تعداد", "sum divided by count"), "\\frac{(" + n + " - 2) \\times 180}{" + n + "} = " + fmt((n - 2) * 180 / n))] }); }
    const a = R(10, 80), sup = R(0, 1) === 1;
    return num(sup ? tr("مکمل زاویهٔ $" + a + "^\\circ$ (جمعشان ۱۸۰) چند درجه است؟", "What is the supplement of $" + a + "^\\circ$ (they sum to 180°)?") : tr("متمم زاویهٔ $" + a + "^\\circ$ (جمعشان ۹۰) چند درجه است؟", "What is the complement of $" + a + "^\\circ$ (they sum to 90°)?"), "", Q((sup ? 180 : 90) - a));
  };
  G["g-measure"] = () => {
    const k = R(0, 4);
    if (k === 0) { const w = R(2, 15), h = R(2, 15), per = R(0, 1) === 1;
      return num(per ? tr("محیط مستطیلی به ابعاد $" + w + " \\times " + h + "$ چقدر است؟", "What is the perimeter of a $" + w + " \\times " + h + "$ rectangle?") : tr("مساحت مستطیلی به ابعاد $" + w + " \\times " + h + "$ چقدر است؟", "What is the area of a $" + w + " \\times " + h + "$ rectangle?"), "", Q(per ? 2 * (w + h) : w * h)); }
    if (k === 1) { const b = R(3, 20), h = R(2, 16);
      return num(tr("مساحت مثلثی با قاعدهٔ $" + b + "$ و ارتفاع $" + h + "$ چقدر است؟", "What is the area of a triangle with base $" + b + "$ and height $" + h + "$?"), "", Q(b * h, 2), { explain: [step(tr("نصف قاعده ضرب در ارتفاع", "half base times height"), "\\frac{" + b + " \\times " + h + "}{2} = " + fmt(b * h / 2))] }); }
    if (k === 2) { const r = R(2, 12), area = R(0, 1) === 1;
      return num(area ? tr("مساحت دایره‌ای به شعاع $" + r + "$ چقدر است؟ (می‌توانی جواب را با pi بنویس)", "What is the area of a circle of radius $" + r + "$? (you may use pi)") : tr("محیط دایره‌ای به شعاع $" + r + "$ چقدر است؟ (می‌توانی جواب را با pi بنویس)", "What is the circumference of a circle of radius $" + r + "$? (you may use pi)"), "", area ? Math.PI * r * r : 2 * Math.PI * r, {
        opts: { rtol: 2e-3 }, ansStr: (area ? r * r : 2 * r) + "pi", ansTex: (area ? r * r : 2 * r) + "\\pi \\approx " + fmt(area ? Math.PI * r * r : 2 * Math.PI * r), explain: [step(tr("فرمول", "formula"), area ? "A = \\pi r^{2} = " + r * r + "\\pi" : "C = 2\\pi r = " + 2 * r + "\\pi")] }); }
    if (k === 3) { const a = R(2, 9), b = R(2, 9), c = R(2, 9);
      return num(tr("حجم مکعب‌مستطیلی به ابعاد $" + a + " \\times " + b + " \\times " + c + "$ چقدر است؟", "What is the volume of an $" + a + " \\times " + b + " \\times " + c + "$ box?"), "", Q(a * b * c)); }
    const r = R(1, 6), h = R(2, 10);
    return num(tr("حجم استوانه‌ای با شعاع $" + r + "$ و ارتفاع $" + h + "$ چقدر است؟ (می‌توانی با pi بنویسی)", "What is the volume of a cylinder with radius $" + r + "$ and height $" + h + "$? (you may use pi)"), "", Math.PI * r * r * h, { opts: { rtol: 2e-3 }, ansStr: r * r * h + "pi", ansTex: r * r * h + "\\pi", explain: [step(tr("مساحت قاعده × ارتفاع", "base area × height"), "\\pi r^{2} h = " + r * r * h + "\\pi")] });
  };
  G["g-pythag"] = () => {
    const k = R(0, 2);
    if (k <= 1) { const tri = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [1, 1, 0], [2, 3, 0], [1, 2, 0]]); let [a, b, c] = tri; const s = R(1, 2); a *= s; b *= s; c = c ? c * s : 0;
      if (k === 0 || !c) { const hyp = Math.sqrt(a * a + b * b);
        return num(tr("در مثلث قائم‌الزاویه‌ای ضلع‌های قائم $" + a + "$ و $" + b + "$ هستند. وتر چقدر است؟", "A right triangle has legs $" + a + "$ and $" + b + "$. How long is the hypotenuse?"), "", Number.isInteger(hyp) ? Q(hyp) : hyp, { opts: { rtol: 1e-4 }, ansStr: Number.isInteger(hyp) ? String(hyp) : "sqrt(" + (a * a + b * b) + ")",
          explain: [step(tr("فیثاغورس", "Pythagoras"), "c = \\sqrt{" + a + "^{2} + " + b + "^{2}} = \\sqrt{" + (a * a + b * b) + "}" + (Number.isInteger(hyp) ? " = " + hyp : " \\approx " + fmt(hyp)))] }); }
      return num(tr("وتر یک مثلث قائم‌الزاویه $" + c + "$ و یک ضلع قائم $" + a + "$ است. ضلع قائم دیگر چقدر است؟", "A right triangle has hypotenuse $" + c + "$ and one leg $" + a + "$. How long is the other leg?"), "", Q(b), { explain: [step(tr("فیثاغورس", "Pythagoras"), "b = \\sqrt{" + c + "^{2} - " + a + "^{2}} = \\sqrt{" + (c * c - a * a) + "} = " + b)] }); }
    const x1 = R(-5, 5), y1 = R(-5, 5), t = pick([[3, 4], [5, 12], [6, 8], [1, 1], [2, 1], [1, 3]]), x2 = x1 + t[0] * pick([1, -1]), y2 = y1 + t[1] * pick([1, -1]), d = Math.hypot(t[0], t[1]);
    return num(tr("فاصلهٔ نقطه‌های $(" + x1 + ", " + y1 + ")$ و $(" + x2 + ", " + y2 + ")$ چقدر است؟", "What is the distance between $(" + x1 + ", " + y1 + ")$ and $(" + x2 + ", " + y2 + ")$?"), "", Number.isInteger(d) ? Q(d) : d, { opts: { rtol: 1e-4 }, ansStr: Number.isInteger(d) ? String(d) : "sqrt(" + (t[0] * t[0] + t[1] * t[1]) + ")",
      explain: [step(tr("فرمول فاصله", "distance formula"), "\\sqrt{(" + x2 + " - " + x1 + ")^{2} + (" + y2 + " - " + y1 + ")^{2}} = \\sqrt{" + (t[0] * t[0] + t[1] * t[1]) + "}")] });
  };
  G["g-coord"] = () => {
    const k = R(0, 2);
    if (k === 0) { const x1 = R(-8, 8), y1 = R(-8, 8), x2 = R(-8, 8), y2 = R(-8, 8);
      return tuple(tr("نقطهٔ وسط پاره‌خط بین $(" + x1 + ", " + y1 + ")$ و $(" + x2 + ", " + y2 + ")$ را به شکل $(x, y)$ بنویس.", "Find the midpoint of $(" + x1 + ", " + y1 + ")$ and $(" + x2 + ", " + y2 + ")$ as $(x, y)$."), "", { x: Q(x1 + x2, 2), y: Q(y1 + y2, 2) }, ["x", "y"], {
        explain: [step(tr("میانگین مختصات", "average the coordinates"), "\\left(\\frac{" + x1 + " + " + x2 + "}{2}, \\frac{" + y1 + " + " + y2 + "}{2}\\right)")] }); }
    if (k === 1) { const h = R(-5, 5), kk = R(-5, 5), r = R(1, 9);
      return num(tr("شعاع دایرهٔ $" + T("(x" + sg(-h) + ")^2 + (y" + sg(-kk) + ")^2") + " = " + r * r + "$ چقدر است؟", "What is the radius of the circle $" + T("(x" + sg(-h) + ")^2 + (y" + sg(-kk) + ")^2") + " = " + r * r + "$?"), "", Q(r), { explain: [step(tr("شکل استاندارد", "standard form"), "(x - h)^{2} + (y - k)^{2} = r^{2} \\Rightarrow r = \\sqrt{" + r * r + "} = " + r)] }); }
    const m = pick([2, 3, -2, Q(1, 2), Q(-3, 4), Q(2, 5)]), mq = typeof m === "number" ? Q(m) : m;
    return num(tr("شیب خطی که بر خطی با شیب $" + qT(mq) + "$ عمود است چیست؟", "What is the slope of a line perpendicular to a line of slope $" + qT(mq) + "$?"), "", mq.inv().neg(), { explain: [step(tr("شیب‌های عمود: حاصل‌ضرب −۱", "perpendicular slopes multiply to −1"), "m_\\perp = -\\frac{1}{m} = " + qT(mq.inv().neg()))] });
  };
  G["t-right"] = () => {
    const k = R(0, 2);
    const tri = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]);
    if (k === 0) { const f = pick(["sin", "cos", "tan"]), [a, b, c] = tri; const val = f === "sin" ? Q(a, c) : f === "cos" ? Q(b, c) : Q(a, b);
      return num(tr("در مثلث قائم‌الزاویه، ضلع روبه‌روی زاویهٔ $\\theta$ برابر $" + a + "$، ضلع مجاور $" + b + "$ و وتر $" + c + "$ است. $\\" + f + "\\theta$ چیست؟", "In a right triangle, the side opposite $\\theta$ is $" + a + "$, the adjacent side is $" + b + "$ and the hypotenuse is $" + c + "$. What is $\\" + f + "\\theta$?"), "", val, {
        explain: [step("SOH CAH TOA", "\\" + f + "\\theta = " + (f === "sin" ? "\\frac{\\text{opp}}{\\text{hyp}}" : f === "cos" ? "\\frac{\\text{adj}}{\\text{hyp}}" : "\\frac{\\text{opp}}{\\text{adj}}") + " = " + qT(val))] }); }
    if (k === 1) { const ang = pick([20, 25, 30, 35, 40, 50, 55, 60, 70]), hyp = R(5, 20), v = hyp * Math.sin(ang * Math.PI / 180);
      return num(tr("وتر یک مثلث قائم‌الزاویه $" + hyp + "$ و یک زاویهٔ آن $" + ang + "^\\circ$ است. طول ضلع روبه‌روی این زاویه چقدر است؟ (تا دو رقم اعشار)", "A right triangle has hypotenuse $" + hyp + "$ and an angle of $" + ang + "^\\circ$. How long is the side opposite that angle? (2 decimal places)"), "", v, { opts: { tol: 0.011 },
        explain: [step(tr("سینوس", "sine"), "\\text{opp} = " + hyp + " \\sin " + ang + "^\\circ \\approx " + fmt(v))] }); }
    const [a, b] = tri, ang = deg(Math.atan(a / b));
    return num(tr("در مثلث قائم‌الزاویه، ضلع روبه‌رو $" + a + "$ و ضلع مجاور $" + b + "$ است. زاویه چند درجه است؟ (تا یک رقم اعشار)", "In a right triangle the opposite side is $" + a + "$ and the adjacent side is $" + b + "$. What is the angle in degrees? (1 decimal place)"), "", ang, { opts: { tol: 0.051 },
      explain: [step(tr("وارون تانژانت", "inverse tangent"), "\\theta = \\tan^{-1}\\frac{" + a + "}{" + b + "} \\approx " + ang.toFixed(1) + "^\\circ")] });
  };
  G["t-unit"] = () => {
    const k = R(0, 2);
    const angs = [[30, "pi/6"], [45, "pi/4"], [60, "pi/3"], [90, "pi/2"], [120, "2pi/3"], [135, "3pi/4"], [150, "5pi/6"], [180, "pi"], [210, "7pi/6"], [270, "3pi/2"], [300, "5pi/3"], [360, "2pi"]];
    const [d, r] = pick(angs);
    if (k === 0) return num(tr("$" + d + "^\\circ$ را به رادیان تبدیل کن (مثلاً pi/6 بنویس).", "Convert $" + d + "^\\circ$ to radians (e.g. write pi/6)."), "", d * Math.PI / 180, { opts: { rtol: 1e-3 }, ansStr: r, ansTex: T(r), explain: [step(tr("ضرب در π/180", "multiply by π/180"), d + " \\times \\frac{\\pi}{180} = " + T(r))] });
    if (k === 1) return num(tr("$" + T(r) + "$ رادیان چند درجه است؟", "How many degrees is $" + T(r) + "$ radians?"), "", Q(d), { explain: [step(tr("ضرب در 180/π", "multiply by 180/π"), T(r) + " \\times \\frac{180}{\\pi} = " + d + "^\\circ")] });
    const [dd, rr] = pick(angs.slice(0, 11)), f = pick(["sin", "cos"]); const v = Math[f](dd * Math.PI / 180);
    const exact = E.casAst(f + "(" + rr.replace("pi", "*pi").replace(/^\*/, "") + ")");
    return num(tr("مقدار دقیق را بنویس (می‌توانی از sqrt استفاده کنی).", "Give the exact value (you may use sqrt)."), "\\" + f + "\\left(" + dd + "^\\circ\\right)", Math.abs(v) < 1e-12 ? 0 : v, { opts: { tol: 1e-6 }, ansStr: E.plain(exact), ansTex: E.tex(exact), explain: [step(tr("دایرهٔ مثلثاتی", "unit circle"), "\\" + f + "\\left(" + T(rr) + "\\right) = " + E.tex(exact))] });
  };
  G["t-identities"] = () => {
    if (R(0, 2) === 0) { const items = [["1 - sin(x)^2", "cos(x)^2"], ["sin(x)/cos(x)", "tan(x)"], ["(sin(x)^2 + cos(x)^2)/cos(x)", "1/cos(x)"], ["2*sin(x)*cos(x)", "sin(2*x)"], ["cos(x)^2 - sin(x)^2", "cos(2*x)"], ["1 + tan(x)^2", "1/cos(x)^2"]];
      const [q, a] = pick(items);
      return expr(tr("عبارت را با اتحادهای مثلثاتی ساده کن.", "Simplify with trigonometric identities."), T(q), a, { opts: { form: "simplest", vars: ["x"] }, explain: [step(tr("اتحاد", "identity"), T(q) + " = " + T(a))], hint: tr("sin²x + cos²x = 1 ؛ sin 2x = 2 sin x cos x ؛ cos 2x = cos²x − sin²x", "sin²x + cos²x = 1; sin 2x = 2 sin x cos x; cos 2x = cos²x − sin²x") }); }
    const cases = [["2*sin(x) - 1 = 0", [Math.PI / 6, 5 * Math.PI / 6]], ["2*cos(x) - 1 = 0", [Math.PI / 3, 5 * Math.PI / 3]], ["tan(x) = 1", [Math.PI / 4, 5 * Math.PI / 4]], ["2*sin(x) + 1 = 0", [7 * Math.PI / 6, 11 * Math.PI / 6]], ["2*cos(x) + sqrt(3) = 0", [5 * Math.PI / 6, 7 * Math.PI / 6]], ["sin(x) = 0", [0, Math.PI]], ["cos(x) = 0", [Math.PI / 2, 3 * Math.PI / 2]]];
    const [s, sols] = pick(cases), g = E.parseStatement(s)[0];
    return set(tr("همهٔ جواب‌ها را در بازهٔ $[0, 2\\pi)$ پیدا کن (مثلاً pi/6, 5pi/6).", "Find all solutions in $[0, 2\\pi)$ (e.g. pi/6, 5pi/6)."), E.tex(g.parts[0]) + " = " + E.tex(g.parts[1]), sols, { opts: { rtol: 1e-4, tol: 1e-4 }, solve: solveEq(s), hint: tr("جواب کلی را بنویس و kها را طوری انتخاب کن که جواب در بازه باشد.", "Write the general solution and choose k so the answers fall in the interval.") });
  };
  G["t-laws"] = () => {
    if (R(0, 1) === 0) { const a = R(4, 12), b = R(4, 12), Cdeg = pick([30, 45, 60, 75, 100, 120]), c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(Cdeg * Math.PI / 180));
      return num(tr("در مثلثی $a = " + a + "$، $b = " + b + "$ و زاویهٔ بینشان $C = " + Cdeg + "^\\circ$ است. ضلع $c$ را تا دو رقم اعشار حساب کن.", "In a triangle $a = " + a + "$, $b = " + b + "$ and the angle between them is $C = " + Cdeg + "^\\circ$. Find side $c$ to two decimals."), "", c, { opts: { tol: 0.011 },
        explain: [step(tr("قانون کسینوس‌ها", "law of cosines"), "c^{2} = a^{2} + b^{2} - 2ab\\cos C = " + fmt(c * c) + " \\Rightarrow c \\approx " + c.toFixed(2))] }); }
    const A = pick([30, 40, 45, 50, 60]), B = pick([35, 55, 65, 70, 80]), a = R(5, 15), b = a * Math.sin(B * Math.PI / 180) / Math.sin(A * Math.PI / 180);
    return num(tr("در مثلثی $A = " + A + "^\\circ$، $B = " + B + "^\\circ$ و $a = " + a + "$ است. ضلع $b$ را تا دو رقم اعشار پیدا کن.", "In a triangle $A = " + A + "^\\circ$, $B = " + B + "^\\circ$ and $a = " + a + "$. Find $b$ to two decimals."), "", b, { opts: { tol: 0.011 },
      explain: [step(tr("قانون سینوس‌ها", "law of sines"), "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} \\Rightarrow b = \\frac{" + a + "\\sin " + B + "^\\circ}{\\sin " + A + "^\\circ} \\approx " + b.toFixed(2))] });
  };

  /* ===================== Discrete math ===================== */
  G["d-sets"] = () => {
    if (R(0, 1) === 0) { const ab = R(2, 15), a = ab + R(3, 20), b = ab + R(3, 20);
      return num(tr("$|A| = " + a + "$، $|B| = " + b + "$ و $|A \\cap B| = " + ab + "$. مقدار $|A \\cup B|$ چیست؟", "$|A| = " + a + "$, $|B| = " + b + "$ and $|A \\cap B| = " + ab + "$. What is $|A \\cup B|$?"), "", Q(a + b - ab), { explain: [step(tr("اصل شمول و طرد", "inclusion–exclusion"), "|A \\cup B| = |A| + |B| - |A \\cap B| = " + (a + b - ab))] }); }
    const U = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), A = U.slice(0, R(3, 5)).sort((x, y) => x - y), B = shuffle(U).slice(0, R(3, 5)).sort((x, y) => x - y), op = pick(["cap", "cup", "minus"]);
    const res = op === "cap" ? A.filter(x => B.includes(x)) : op === "cup" ? [...new Set(A.concat(B))].sort((x, y) => x - y) : A.filter(x => !B.includes(x));
    const sym = { cap: "A \\cap B", cup: "A \\cup B", minus: "A \\setminus B" }[op];
    return set(tr("اگر $A = \\{" + A.join(", ") + "\\}$ و $B = \\{" + B.join(", ") + "\\}$، مجموعهٔ $" + sym + "$ را بنویس (عضوها را با ویرگول جدا کن؛ اگر تهی است none).", "If $A = \\{" + A.join(", ") + "\\}$ and $B = \\{" + B.join(", ") + "\\}$, list $" + sym + "$ (comma-separated; none if empty)."), "", res.map(x => Q(x)), {
      explain: [step(tr("تعریف", "definition"), { cap: tr("\\text{عضوهای مشترک}", "\\text{common elements}"), cup: tr("\\text{همهٔ عضوها بدون تکرار}", "\\text{all elements, no repeats}"), minus: tr("\\text{در A ولی نه در B}", "\\text{in A but not in B}") }[op] + ": \\{" + res.join(", ") + "\\}")] });
  };
  G["d-logic"] = () => {
    const k = R(0, 2);
    if (k === 0) { const p = R(0, 1) === 1, q = R(0, 1) === 1;
      const forms = [["p \\land q", p && q], ["p \\lor \\lnot q", p || !q], ["p \\to q", !p || q], ["\\lnot (p \\land q)", !(p && q)], ["p \\leftrightarrow q", p === q], ["\\lnot p \\to q", p || q]];
      const [f, v] = pick(forms), TF = b => (b ? tr("درست", "true") : tr("نادرست", "false"));
      return choice(tr("اگر $p$ " + TF(p) + " و $q$ " + TF(q) + " باشد، ارزش گزارهٔ زیر چیست؟", "If $p$ is " + TF(p) + " and $q$ is " + TF(q) + ", what is the truth value of the statement?"), f, [tr("درست", "True"), tr("نادرست", "False")], v ? 0 : 1, {
        explain: [step(tr("جایگذاری ارزش‌ها", "substitute the values"), f + " \\equiv \\text{" + (v ? "T" : "F") + "}")], hint: tr("p → q فقط وقتی نادرست است که p درست و q نادرست باشد.", "p → q is false only when p is true and q is false.") }); }
    if (k === 1) { const n = R(2, 6);
      return num(tr("جدول درستی گزاره‌ای با $" + n + "$ متغیر چند سطر دارد؟", "How many rows does the truth table of a statement with $" + n + "$ variables have?"), "", Q(Math.pow(2, n)), { explain: [step(tr("هر متغیر دو حالت دارد", "each variable has two values"), "2^{" + n + "} = " + Math.pow(2, n))] }); }
    const items = [
      [tr("نقیض «همهٔ دانش‌آموزان قبول شدند» کدام است؟", "What is the negation of “all students passed”?"), [tr("دست‌کم یک دانش‌آموز قبول نشد.", "At least one student did not pass."), tr("هیچ دانش‌آموزی قبول نشد.", "No student passed."), tr("همهٔ دانش‌آموزان رد شدند.", "All students failed."), tr("بعضی دانش‌آموزان قبول شدند.", "Some students passed.")]],
      [tr("عکس نقیض «اگر باران ببارد، زمین خیس است» کدام است؟", "What is the contrapositive of “if it rains, the ground is wet”?"), [tr("اگر زمین خیس نباشد، باران نباریده است.", "If the ground is not wet, it did not rain."), tr("اگر زمین خیس باشد، باران باریده است.", "If the ground is wet, it rained."), tr("اگر باران نبارد، زمین خیس نیست.", "If it does not rain, the ground is not wet."), tr("باران می‌بارد و زمین خشک است.", "It rains and the ground is dry.")]],
      [tr("نقیض «$x > 3$ و $y < 2$» کدام است؟", "What is the negation of “$x > 3$ and $y < 2$”?"), ["$x \\le 3$ " + tr("یا", "or") + " $y \\ge 2$", "$x \\le 3$ " + tr("و", "and") + " $y \\ge 2$", "$x < 3$ " + tr("یا", "or") + " $y > 2$", "$x > 3$ " + tr("یا", "or") + " $y < 2$"]],
      [tr("گزارهٔ $p \\to q$ با کدام گزاره هم‌ارز است؟", "Which statement is equivalent to $p \\to q$?"), ["$\\lnot p \\lor q$", "$p \\lor \\lnot q$", "$\\lnot q \\to p$", "$q \\to p$"]],
    ];
    const [q, opts] = pick(items);
    return choice(q, "", opts, 0, { hint: tr("قانون دمورگان: ¬(p ∧ q) ≡ ¬p ∨ ¬q", "De Morgan: ¬(p ∧ q) ≡ ¬p ∨ ¬q") });
  };
  G["d-counting"] = () => {
    const k = R(0, 3);
    if (k === 0) { const n = R(5, 12), r = R(2, 4);
      return num(tr("به چند طریق می‌توان از $" + n + "$ نفر، $" + r + "$ نفر را برای یک کمیته (بدون ترتیب) انتخاب کرد؟", "In how many ways can a committee of $" + r + "$ be chosen from $" + n + "$ people (order does not matter)?"), "", Q(C(n, r)), { solve: () => E.combSteps("C", n, r) }); }
    if (k === 1) { const n = R(5, 10), r = R(2, 4);
      return num(tr("به چند طریق می‌توان از $" + n + "$ دونده، نفرات اول تا " + (r === 2 ? "دوم" : r === 3 ? "سوم" : "چهارم") + " را مشخص کرد؟", "In how many ways can the top $" + r + "$ places be filled from $" + n + "$ runners?"), "", Q(fact(n) / fact(n - r)), { solve: () => E.combSteps("P", n, r) }); }
    if (k === 2) { const a = R(2, 6), b = R(2, 6), c = R(2, 4);
      return num(tr("$" + a + "$ پیراهن، $" + b + "$ شلوار و $" + c + "$ جفت کفش داری. چند ترکیب لباس متفاوت ممکن است؟", "You have $" + a + "$ shirts, $" + b + "$ pairs of pants and $" + c + "$ pairs of shoes. How many different outfits are possible?"), "", Q(a * b * c), { explain: [step(tr("اصل ضرب", "multiplication principle"), a + " \\times " + b + " \\times " + c + " = " + a * b * c)] }); }
    const w = pick(["LEVEL", "BANANA", "APPLE", "COOKIE", "PAPAYA", "TOOTH", "DATA"]), cnt = {}; [...w].forEach(ch => { cnt[ch] = (cnt[ch] || 0) + 1; });
    const ans = fact(w.length) / Object.values(cnt).reduce((s, x) => s * fact(x), 1);
    return num(tr("حروف کلمهٔ $\\text{" + w + "}$ را به چند ترتیب متمایز می‌توان چید؟", "How many distinct arrangements of the letters of $\\text{" + w + "}$ are there?"), "", Q(ans), { explain: [step(tr("جایگشت با تکرار", "permutations with repetition"), "\\frac{" + w.length + "!}{" + Object.values(cnt).filter(x => x > 1).map(x => x + "!").join("\\,") + "} = " + ans)], hint: tr("n! را بر فاکتوریل تعداد تکرار هر حرف تقسیم کن.", "Divide n! by the factorial of each letter's count.") });
  };
  G["d-sequences"] = () => {
    const k = R(0, 2);
    if (k === 0) { const a = R(-10, 10), d = nz(-6, 6), n = R(8, 30);
      return num(tr("در دنبالهٔ حسابی با جملهٔ اول $" + a + "$ و قدرنسبت $" + d + "$، جملهٔ $" + n + "$ام چیست؟", "In an arithmetic sequence with first term $" + a + "$ and common difference $" + d + "$, what is term $" + n + "$?"), "", Q(a + (n - 1) * d), { explain: [step(tr("جملهٔ عمومی", "general term"), "a_n = a_1 + (n - 1)d = " + a + " + " + (n - 1) + " \\times " + d + " = " + (a + (n - 1) * d))] }); }
    if (k === 1) { const a = pick([1, 2, 3, 5, -2]), r = pick([2, 3, -2, Q(1, 2)]), rq = typeof r === "number" ? Q(r) : r, n = R(4, 8), v = Q(a).mul(rq.pow(n - 1));
      return num(tr("در دنبالهٔ هندسی با جملهٔ اول $" + a + "$ و قدرنسبت $" + qT(rq) + "$، جملهٔ $" + n + "$ام چیست؟", "In a geometric sequence with first term $" + a + "$ and ratio $" + qT(rq) + "$, what is term $" + n + "$?"), "", v, { explain: [step(tr("جملهٔ عمومی", "general term"), "a_n = a_1 r^{n-1} = " + a + " \\cdot \\left(" + qT(rq) + "\\right)^{" + (n - 1) + "} = " + qT(v))] }); }
    const a = R(-5, 10), d = nz(-5, 5), m = R(2, 4), n = m + R(3, 6);
    return num(tr("در یک دنبالهٔ حسابی $a_{" + m + "} = " + (a + (m - 1) * d) + "$ و $a_{" + n + "} = " + (a + (n - 1) * d) + "$ است. قدرنسبت چیست؟", "In an arithmetic sequence $a_{" + m + "} = " + (a + (m - 1) * d) + "$ and $a_{" + n + "} = " + (a + (n - 1) * d) + "$. What is the common difference?"), "", Q(d), { explain: [step(tr("تفاضل تقسیم بر فاصلهٔ اندیس‌ها", "difference over the gap in indices"), "d = \\frac{" + (a + (n - 1) * d) + " - " + (a + (m - 1) * d) + "}{" + n + " - " + m + "} = " + d)] });
  };
  G["d-series"] = () => {
    const k = R(0, 3);
    if (k === 0) { const n = R(10, 50);
      return num(tr("مجموع $1 + 2 + 3 + \\cdots + " + n + "$ چیست؟", "What is $1 + 2 + 3 + \\cdots + " + n + "$?"), "", Q(n * (n + 1) / 2), { explain: [step(tr("فرمول گاوس", "Gauss's formula"), "\\frac{n(n+1)}{2} = \\frac{" + n + " \\times " + (n + 1) + "}{2} = " + n * (n + 1) / 2)] }); }
    if (k === 1) { const a = R(1, 6), b = R(-5, 5), n = R(4, 12); let s = 0; for (let i = 1; i <= n; i++) s += a * i + b;
      return num(tr("مقدار سیگما را حساب کن.", "Evaluate the sum."), "\\sum_{k=1}^{" + n + "} \\left(" + T(poly([a, b], "k")) + "\\right)", Q(s), { explain: [step(tr("خطی بودن سیگما", "linearity"), a + "\\sum k + " + b + " \\cdot " + n + " = " + a + " \\cdot \\frac{" + n + " \\cdot " + (n + 1) + "}{2} " + (b < 0 ? "- " + -b * n : "+ " + b * n) + " = " + s)] }); }
    if (k === 2) { const a = pick([1, 2, 3]), r = pick([2, 3]), n = R(4, 8), s = a * (Math.pow(r, n) - 1) / (r - 1);
      return num(tr("مجموع $" + n + "$ جملهٔ اول دنبالهٔ هندسی با جملهٔ اول $" + a + "$ و قدرنسبت $" + r + "$ چیست؟", "What is the sum of the first $" + n + "$ terms of a geometric sequence with first term $" + a + "$ and ratio $" + r + "$?"), "", Q(s), { explain: [step(tr("فرمول", "formula"), "S_n = a\\frac{r^{n} - 1}{r - 1} = " + a + "\\cdot\\frac{" + r + "^{" + n + "} - 1}{" + (r - 1) + "} = " + s)] }); }
    const a = pick([1, 2, 3, 4, 6]), r = pick([Q(1, 2), Q(1, 3), Q(-1, 2), Q(2, 3), Q(1, 4)]), s = Q(a).div(Q(1).sub(r));
    return num(tr("مجموع سری هندسی بی‌پایان با جملهٔ اول $" + a + "$ و قدرنسبت $" + qT(r) + "$ چیست؟", "What is the sum of the infinite geometric series with first term $" + a + "$ and ratio $" + qT(r) + "$?"), "", s, { explain: [step(tr("چون |r| < 1 همگراست", "converges since |r| < 1"), "S = \\frac{a}{1 - r} = \\frac{" + a + "}{1 - \\left(" + qT(r) + "\\right)} = " + qT(s))] });
  };
  G["d-induction"] = () => {
    if (R(0, 1) === 0) { const items = [["1 + 3 + 5 + \\cdots + (2n-1)", n => n * n], ["1 + 2 + \\cdots + n", n => n * (n + 1) / 2], ["1^{2} + 2^{2} + \\cdots + n^{2}", n => n * (n + 1) * (2 * n + 1) / 6], ["2 + 4 + 8 + \\cdots + 2^{n}", n => Math.pow(2, n + 1) - 2]];
      const [s, f] = pick(items), n = R(4, 9);
      return num(tr("مقدار مجموع زیر را به ازای $n = " + n + "$ حساب کن (این همان چیزی است که در گام پایه و بررسی فرمول انجام می‌دهی).", "Compute the sum for $n = " + n + "$ (this is what you do when checking a formula)."), s, Q(f(n))); }
    const items = [
      [tr("در اثبات استقرایی $P(n)$ برای همهٔ $n \\ge 1$، گام استقرا چه چیزی را نشان می‌دهد؟", "In an induction proof of $P(n)$ for all $n \\ge 1$, what does the inductive step show?"), [tr("اگر $P(k)$ درست باشد آنگاه $P(k+1)$ درست است.", "If $P(k)$ is true then $P(k+1)$ is true."), tr("$P(1)$ درست است.", "$P(1)$ is true."), tr("$P(k)$ برای همهٔ $k$ درست است.", "$P(k)$ is true for every $k$."), tr("اگر $P(k+1)$ درست باشد آنگاه $P(k)$ درست است.", "If $P(k+1)$ is true then $P(k)$ is true.")]],
      [tr("برای اثبات $2^{n} > n$ به ازای $n \\ge 1$، گام پایه کدام است؟", "To prove $2^{n} > n$ for $n \\ge 1$, what is the base case?"), ["$2^{1} > 1$", "$2^{0} > 0$", "$2^{k+1} > k+1$", "$2^{k} > k$"]],
      [tr("در گام استقرای $1 + 2 + \\cdots + n = \\frac{n(n+1)}{2}$، به دو طرف فرض استقرا چه چیزی اضافه می‌کنیم؟", "In the inductive step for $1 + 2 + \\cdots + n = \\frac{n(n+1)}{2}$, what do we add to both sides of the hypothesis?"), ["$k + 1$", "$k$", "$1$", "$\\frac{k+1}{2}$"]],
    ];
    const [q, opts] = pick(items);
    return choice(q, "", opts, 0);
  };

  /* ===================== Probability ===================== */
  G["p-basics"] = () => {
    const k = R(0, 3);
    if (k === 0) { const s = R(2, 12); let c = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === s) c++;
      return num(tr("دو تاس سالم ریخته می‌شود. احتمال اینکه مجموع $" + s + "$ شود چیست؟", "Two fair dice are rolled. What is the probability the sum is $" + s + "$?"), "", Q(c, 36), { opts: { tol: 1e-3 }, explain: [step(tr("حالت‌های مطلوب تقسیم بر ۳۶", "favorable outcomes over 36"), "\\frac{" + c + "}{36} = " + qT(Q(c, 36)))] }); }
    if (k === 1) { const n = R(2, 6);
      return num(tr("یک سکهٔ سالم $" + n + "$ بار پرتاب می‌شود. احتمال اینکه دست‌کم یک بار «شیر» بیاید چیست؟", "A fair coin is tossed $" + n + "$ times. What is the probability of at least one head?"), "", Q(Math.pow(2, n) - 1, Math.pow(2, n)), { opts: { tol: 1e-3 }, explain: [step(tr("متمم: هیچ شیری نیاید", "complement: no heads"), "1 - \\left(\\frac{1}{2}\\right)^{" + n + "} = " + qT(Q(Math.pow(2, n) - 1, Math.pow(2, n))))], hint: tr("«دست‌کم یکی» را با متمم حساب کن.", "Use the complement for “at least one”.") }); }
    if (k === 2) { const items = [[13, tr("دل", "a heart")], [4, tr("آس", "an ace")], [12, tr("صورت‌دار (سرباز، بی‌بی، شاه)", "a face card (J, Q, K)")], [26, tr("قرمز", "a red card")], [16, tr("آس یا صورت‌دار", "an ace or a face card")]]; const [c, name] = pick(items);
      return num(tr("از یک دستهٔ ۵۲تایی ورق یک کارت بیرون می‌کشیم. احتمال اینکه " + name + " باشد چیست؟", "One card is drawn from a 52-card deck. What is the probability it is " + name + "?"), "", Q(c, 52), { opts: { tol: 1e-3 }, explain: [step(tr("مطلوب تقسیم بر کل", "favorable over total"), "\\frac{" + c + "}{52} = " + qT(Q(c, 52)))] }); }
    const r = R(2, 8), b = R(2, 8), g = R(1, 6);
    return num(tr("کیسه‌ای $" + r + "$ مهرهٔ قرمز، $" + b + "$ آبی و $" + g + "$ سبز دارد. احتمال اینکه مهرهٔ بیرون‌آمده قرمز نباشد چیست؟", "A bag has $" + r + "$ red, $" + b + "$ blue and $" + g + "$ green marbles. What is the probability that a drawn marble is not red?"), "", Q(b + g, r + b + g), { opts: { tol: 1e-3 }, explain: [step(tr("متمم", "complement"), "1 - \\frac{" + r + "}{" + (r + b + g) + "} = " + qT(Q(b + g, r + b + g)))] });
  };
  G["p-conditional"] = () => {
    if (R(0, 1) === 0) { const a = R(10, 40), b = R(10, 40), c = R(10, 40), d = R(10, 40);
      return num(tr("در یک نظرسنجی: از کسانی که «ورزش می‌کنند»، $" + a + "$ نفر قهوه می‌نوشند و $" + b + "$ نفر نه. از کسانی که ورزش نمی‌کنند، $" + c + "$ نفر قهوه می‌نوشند و $" + d + "$ نفر نه. احتمال $P(\\text{ورزش} \\mid \\text{قهوه})$ چیست؟", "In a survey: among people who exercise, $" + a + "$ drink coffee and $" + b + "$ do not. Among those who don't exercise, $" + c + "$ drink coffee and $" + d + "$ do not. What is $P(\\text{exercise} \\mid \\text{coffee})$?"), "", Q(a, a + c), { opts: { tol: 2e-3 },
        explain: [step(tr("فقط سطر/ستون شرط را نگاه کن", "restrict to the condition"), "\\frac{" + a + "}{" + a + " + " + c + "} = " + qT(Q(a, a + c)))] }); }
    const p = pick([0.01, 0.02, 0.05, 0.1]), sens = pick([0.9, 0.95, 0.99]), spec = pick([0.9, 0.95, 0.98]);
    const post = sens * p / (sens * p + (1 - spec) * (1 - p));
    return num(tr("بیماری‌ای در $" + p * 100 + "\\%$ جمعیت وجود دارد. آزمایشی با حساسیت $" + sens * 100 + "\\%$ و ویژگی $" + spec * 100 + "\\%$ مثبت شده است. احتمال اینکه فرد واقعاً بیمار باشد چیست؟ (تا سه رقم اعشار)", "A disease affects $" + p * 100 + "\\%$ of people. A test with sensitivity $" + sens * 100 + "\\%$ and specificity $" + spec * 100 + "\\%$ comes back positive. What is the probability the person has the disease? (3 decimals)"), "", post, { opts: { tol: 2e-3 },
      explain: [step(tr("قاعدهٔ بیز", "Bayes' rule"), "P(D \\mid +) = \\frac{" + sens + " \\cdot " + p + "}{" + sens + " \\cdot " + p + " + " + fmt(1 - spec) + " \\cdot " + fmt(1 - p) + "} \\approx " + post.toFixed(3))], hint: tr("P(D|+) = P(+|D)P(D) / P(+)، و P(+) شامل مثبت‌های کاذب هم هست.", "P(D|+) = P(+|D)P(D)/P(+), and P(+) includes false positives.") });
  };
  G["p-rv"] = () => {
    const xs = [R(0, 2), R(3, 5), R(6, 10)], ps = pick([[Q(1, 4), Q(1, 2), Q(1, 4)], [Q(1, 5), Q(3, 5), Q(1, 5)], [Q(1, 2), Q(1, 3), Q(1, 6)], [Q(1, 10), Q(3, 10), Q(3, 5)]]);
    const EX = xs.reduce((s, x, i) => s.add(ps[i].mul(Q(x))), Q(0)), EX2 = xs.reduce((s, x, i) => s.add(ps[i].mul(Q(x * x))), Q(0)), V = EX2.sub(EX.mul(EX));
    const table = "\\begin{array}{c|ccc} x & " + xs.join(" & ") + " \\\\ \\hline P(X=x) & " + ps.map(qT).join(" & ") + "\\end{array}";
    if (R(0, 2) < 2) return num(tr("امید ریاضی $E[X]$ را حساب کن.", "Compute the expected value $E[X]$."), table, EX, { opts: { tol: 1e-3 }, explain: [step(tr("مجموع x·p", "sum of x·p"), "E[X] = \\sum x\\,P(X=x) = " + xs.map((x, i) => x + "\\cdot" + qT(ps[i])).join(" + ") + " = " + qT(EX))] });
    return num(tr("واریانس $\\operatorname{Var}(X)$ را حساب کن.", "Compute the variance $\\operatorname{Var}(X)$."), table, V, { opts: { tol: 1e-3 }, explain: [step(tr("امید", "mean"), "E[X] = " + qT(EX)), step(tr("گشتاور دوم", "second moment"), "E[X^{2}] = " + qT(EX2)), step(tr("واریانس", "variance"), "E[X^{2}] - E[X]^{2} = " + qT(V))] });
  };
  G["p-binomial"] = () => {
    const n = R(4, 10), p = pick([0.5, 0.3, 0.2, 0.6]), k = R(0, Math.min(n, 5));
    if (R(0, 3) === 0) return num(tr("اگر $X \\sim \\text{Bin}(" + n + ", " + p + ")$ باشد، $E[X]$ چیست؟", "If $X \\sim \\text{Bin}(" + n + ", " + p + ")$, what is $E[X]$?"), "", n * p, { opts: { tol: 1e-6 }, explain: [step(tr("امید دوجمله‌ای", "binomial mean"), "np = " + n + " \\times " + p + " = " + fmt(n * p))] });
    const v = C(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    return num(tr("اگر $X \\sim \\text{Bin}(" + n + ", " + p + ")$ باشد، $P(X = " + k + ")$ را تا چهار رقم اعشار حساب کن.", "If $X \\sim \\text{Bin}(" + n + ", " + p + ")$, find $P(X = " + k + ")$ to four decimals."), "", v, { opts: { tol: 6e-4 }, solve: () => E.binomialSteps(n, p, k, "eq") });
  };
  G["p-normal"] = () => {
    const k = R(0, 2), mu = pick([50, 60, 70, 100, 170]), s = pick([5, 8, 10, 15]);
    if (k === 0) { const x = mu + s * pick([-2, -1.5, -1, 0.5, 1, 1.2, 2, 2.5]);
      return num(tr("اگر $X \\sim N(" + mu + ", " + s + "^{2})$ باشد، امتیاز استاندارد (z) مقدار $x = " + x + "$ چیست؟", "If $X \\sim N(" + mu + ", " + s + "^{2})$, what is the z-score of $x = " + x + "$?"), "", (x - mu) / s, { opts: { tol: 0.011 }, explain: [step(tr("استانداردسازی", "standardize"), "z = \\frac{x - \\mu}{\\sigma} = \\frac{" + x + " - " + mu + "}{" + s + "} = " + fmt((x - mu) / s))] }); }
    const z = pick([-2, -1, 1, 1.5, 2, 0.5]), x = mu + z * s, gt = R(0, 1) === 1, v = gt ? 1 - E.Phi(z) : E.Phi(z);
    return num(tr("اگر $X \\sim N(" + mu + ", " + s + "^{2})$ باشد، $P(X " + (gt ? ">" : "<") + " " + x + ")$ را تا سه رقم اعشار حساب کن.", "If $X \\sim N(" + mu + ", " + s + "^{2})$, find $P(X " + (gt ? ">" : "<") + " " + x + ")$ to three decimals."), "", v, { opts: { tol: 3e-3 },
      solve: () => E.normalSteps(mu, s, gt ? x : -Infinity, gt ? Infinity : x), hint: tr("قاعدهٔ ۶۸–۹۵–۹۹٫۷ کمک می‌کند جوابت را تخمین بزنی.", "The 68–95–99.7 rule helps you estimate the answer.") });
  };
  G["p-clt"] = () => {
    const s = pick([10, 12, 15, 20, 24]), n = pick([4, 9, 16, 25, 36, 64, 100]), se = s / Math.sqrt(n);
    if (R(0, 1) === 0) return num(tr("انحراف معیار جامعه $\\sigma = " + s + "$ است. خطای استاندارد میانگین نمونه‌ای به اندازهٔ $n = " + n + "$ چیست؟", "The population standard deviation is $\\sigma = " + s + "$. What is the standard error of the mean for a sample of size $n = " + n + "$?"), "", se, { opts: { tol: 0.011 }, explain: [step(tr("خطای استاندارد", "standard error"), "\\frac{\\sigma}{\\sqrt{n}} = \\frac{" + s + "}{\\sqrt{" + n + "}} = " + fmt(se))] });
    const mu = pick([50, 100, 200]), z = pick([1, 1.5, 2]), x = mu + z * se, v = 1 - E.Phi(z);
    return num(tr("جامعه‌ای میانگین $" + mu + "$ و انحراف معیار $" + s + "$ دارد. برای نمونه‌ای با $n = " + n + "$، احتمال $P(\\bar{X} > " + fmt(x) + ")$ تقریباً چقدر است؟ (سه رقم اعشار)", "A population has mean $" + mu + "$ and standard deviation $" + s + "$. For a sample of $n = " + n + "$, approximately what is $P(\\bar{X} > " + fmt(x) + ")$? (3 decimals)"), "", v, { opts: { tol: 3e-3 },
      explain: [step(tr("قضیهٔ حد مرکزی", "central limit theorem"), "\\bar{X} \\approx N\\left(" + mu + ", " + fmt(se) + "^{2}\\right)"), step(tr("استانداردسازی", "standardize"), "z = \\frac{" + fmt(x) + " - " + mu + "}{" + fmt(se) + "} = " + z + " \\Rightarrow P = 1 - \\Phi(" + z + ") \\approx " + v.toFixed(3))] });
  };

  /* ===================== Statistics ===================== */
  const dataset = (n, lo, hi) => Array.from({ length: n }, () => R(lo, hi));
  G["s-describe"] = () => {
    const d = dataset(R(5, 9), 1, 20), k = R(0, 4), sorted = d.slice().sort((a, b) => a - b), n = d.length, mean = d.reduce((s, x) => s + x, 0) / n;
    const tex = "\\{" + d.join(",\\; ") + "\\}";
    if (k === 0) return num(tr("میانگین داده‌ها را حساب کن.", "Compute the mean of the data."), tex, Q(d.reduce((s, x) => s + x, 0), n), { opts: { tol: 0.006 }, solve: () => E.describeSteps(d) });
    if (k === 1) return num(tr("میانهٔ داده‌ها را پیدا کن.", "Find the median of the data."), tex, n % 2 ? Q(sorted[(n - 1) / 2]) : Q(sorted[n / 2 - 1] + sorted[n / 2], 2), { solve: () => E.describeSteps(d) });
    if (k === 2) return num(tr("دامنهٔ تغییرات داده‌ها چیست؟", "What is the range of the data?"), tex, Q(sorted[n - 1] - sorted[0]), { solve: () => E.describeSteps(d) });
    const sd = Math.sqrt(d.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1));
    if (k === 3) return num(tr("انحراف معیار نمونه ($s$، با تقسیم بر $n-1$) را تا دو رقم اعشار حساب کن.", "Compute the sample standard deviation ($s$, dividing by $n-1$) to two decimals."), tex, sd, { opts: { tol: 0.011 }, solve: () => E.describeSteps(d) });
    const base = R(1, 9), dd = [base, base + R(1, 5), base, base + R(6, 9), base + R(1, 5), base];
    return num(tr("نمای (مُد) داده‌ها چیست؟", "What is the mode of the data?"), "\\{" + shuffle(dd).join(",\\; ") + "\\}", Q(base), { solve: () => E.describeSteps(dd) });
  };
  G["s-viz"] = () => {
    const k = R(0, 2);
    if (k <= 1) { const d = dataset(pick([7, 8, 9, 10, 11]), 1, 30), sorted = d.slice().sort((a, b) => a - b), qs = E.quartiles(sorted);
      if (k === 0) return num(tr("دامنهٔ میان‌چارکی (IQR) داده‌ها را حساب کن (چارک‌ها = میانهٔ نیمهٔ پایین و بالا، بدون میانه).", "Compute the interquartile range (IQR) (quartiles = medians of the lower and upper halves, excluding the median)."), "\\{" + d.join(",\\; ") + "\\}", qs.q3 - qs.q1, { opts: { tol: 1e-6 }, solve: () => E.describeSteps(d) });
      const out = sorted[sorted.length - 1] + R(25, 60), dd = shuffle(d.concat([out]));
      return num(tr("کدام مقدار طبق قاعدهٔ $1.5 \\times IQR$ داده‌ٔ پرت است؟", "Which value is an outlier by the $1.5 \\times IQR$ rule?"), "\\{" + dd.join(",\\; ") + "\\}", Q(out), { solve: () => E.describeSteps(dd) }); }
    const items = [
      [tr("برای نشان دادن توزیع یک متغیر عددی پیوسته (مثل قد) کدام نمودار مناسب‌تر است؟", "Which chart best shows the distribution of one continuous numeric variable (like height)?"), [tr("بافت‌نگار", "Histogram"), tr("نمودار دایره‌ای", "Pie chart"), tr("نمودار خطی زمانی", "Time-series line chart"), tr("جدول متقاطع", "Cross table")]],
      [tr("برای بررسی رابطهٔ دو متغیر عددی کدام نمودار مناسب است؟", "Which chart shows the relationship between two numeric variables?"), [tr("نمودار پراکنش", "Scatter plot"), tr("نمودار میله‌ای", "Bar chart"), tr("نمودار دایره‌ای", "Pie chart"), tr("بافت‌نگار", "Histogram")]],
      [tr("در توزیعی با چولگی به راست معمولاً کدام درست است؟", "In a right-skewed distribution, which is usually true?"), [tr("میانگین از میانه بزرگ‌تر است", "The mean is greater than the median"), tr("میانه از میانگین بزرگ‌تر است", "The median is greater than the mean"), tr("میانگین و میانه همیشه برابرند", "The mean always equals the median"), tr("نما بزرگ‌ترین مقدار است", "The mode is the largest value")]],
      [tr("برای مقایسهٔ میانگین فروش چند شهر کدام نمودار مناسب‌تر است؟", "Which chart is best for comparing average sales across several cities?"), [tr("نمودار میله‌ای", "Bar chart"), tr("نمودار پراکنش", "Scatter plot"), tr("بافت‌نگار", "Histogram"), tr("نمودار جعبه‌ای یک متغیر", "A single box plot")]],
    ];
    const [q, opts] = pick(items);
    return choice(q, "", opts, 0);
  };
  G["s-correlation"] = () => {
    const b = pick([-3, -2, -1, 1, 2, 3, 0.5]), a = R(-5, 10), xs = [1, 2, 3, 4, 5], ys = xs.map(x => Math.round(a + b * x + R(-2, 2)));
    const n = xs.length, mx = 3, my = ys.reduce((s, y) => s + y, 0) / n, sxy = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0), sxx = 10, slope = sxy / sxx, inter = my - slope * mx;
    const tex = "\\begin{array}{c|ccccc} x & " + xs.join(" & ") + " \\\\ \\hline y & " + ys.join(" & ") + "\\end{array}";
    const k = R(0, 2);
    if (k === 0) return num(tr("شیب خط رگرسیون کمترین مربعات را تا دو رقم اعشار حساب کن.", "Compute the slope of the least-squares regression line to two decimals."), tex, slope, { opts: { tol: 0.011 }, solve: () => E.regressionSteps(xs.map((x, i) => [x, ys[i]])) });
    if (k === 1) { const x0 = 6; return num(tr("با خط رگرسیون، مقدار $y$ را به ازای $x = " + x0 + "$ پیش‌بینی کن (دو رقم اعشار).", "Use the regression line to predict $y$ at $x = " + x0 + "$ (two decimals)."), tex, inter + slope * x0, { opts: { tol: 0.03 }, solve: () => E.regressionSteps(xs.map((x, i) => [x, ys[i]])) }); }
    const r = sxy / Math.sqrt(sxx * ys.reduce((s, y) => s + (y - my) ** 2, 0));
    return choice(tr("علامت ضریب همبستگی $r$ برای این داده‌ها چیست؟", "What is the sign of the correlation coefficient $r$ for these data?"), tex, [tr("مثبت", "Positive"), tr("منفی", "Negative"), tr("صفر", "Zero")], Math.abs(r) < 1e-9 ? 2 : r > 0 ? 0 : 1, { solve: () => E.regressionSteps(xs.map((x, i) => [x, ys[i]])) });
  };
  G["s-sampling"] = () => {
    const s = pick([8, 10, 12, 15, 20]), n = pick([16, 25, 36, 49, 64, 100]), xbar = R(40, 120), z = 1.96, me = z * s / Math.sqrt(n);
    if (R(0, 1) === 0) return num(tr("با $\\sigma = " + s + "$ و $n = " + n + "$، حاشیهٔ خطای بازهٔ اطمینان ۹۵٪ ($z^{*} = 1.96$) چیست؟ (دو رقم اعشار)", "With $\\sigma = " + s + "$ and $n = " + n + "$, what is the margin of error of a 95% confidence interval ($z^{*} = 1.96$)? (two decimals)"), "", me, { opts: { tol: 0.011 },
      explain: [step(tr("حاشیهٔ خطا", "margin of error"), "z^{*}\\frac{\\sigma}{\\sqrt{n}} = 1.96 \\times \\frac{" + s + "}{\\sqrt{" + n + "}} = " + me.toFixed(2))] });
    return set(tr("میانگین نمونه $\\bar{x} = " + xbar + "$، $\\sigma = " + s + "$ و $n = " + n + "$ است. دو سر بازهٔ اطمینان ۹۵٪ را بنویس (دو رقم اعشار، با ویرگول).", "The sample mean is $\\bar{x} = " + xbar + "$, $\\sigma = " + s + "$ and $n = " + n + "$. Give the two ends of the 95% confidence interval (two decimals, comma-separated)."), "", [xbar - me, xbar + me], { opts: { tol: 0.011 },
      explain: [step(tr("بازه", "interval"), "\\bar{x} \\pm 1.96\\frac{\\sigma}{\\sqrt{n}} = " + xbar + " \\pm " + me.toFixed(2))] });
  };
  G["s-hypothesis"] = () => {
    if (R(0, 1) === 0) { const mu0 = pick([50, 100, 200]), s = pick([10, 12, 15, 20]), n = pick([25, 36, 64, 100]), xbar = mu0 + pick([-1, 1]) * R(1, 6), zz = (xbar - mu0) / (s / Math.sqrt(n));
      return num(tr("فرض صفر $\\mu = " + mu0 + "$ است. نمونه‌ای با $n = " + n + "$ میانگین $" + xbar + "$ دارد و $\\sigma = " + s + "$. آمارهٔ $z$ را تا دو رقم اعشار حساب کن.", "The null hypothesis is $\\mu = " + mu0 + "$. A sample of $n = " + n + "$ has mean $" + xbar + "$ and $\\sigma = " + s + "$. Compute the $z$ statistic to two decimals."), "", zz, { opts: { tol: 0.011 },
        explain: [step(tr("آماره", "statistic"), "z = \\frac{\\bar{x} - \\mu_0}{\\sigma/\\sqrt{n}} = \\frac{" + xbar + " - " + mu0 + "}{" + s + "/\\sqrt{" + n + "}} = " + zz.toFixed(2))] }); }
    const p = pick([0.001, 0.01, 0.03, 0.04, 0.06, 0.12, 0.3]), a = pick([0.05, 0.01]);
    return choice(tr("مقدار $p$ برابر $" + p + "$ و سطح معناداری $\\alpha = " + a + "$ است. نتیجه چیست؟", "The $p$-value is $" + p + "$ and the significance level is $\\alpha = " + a + "$. What is the conclusion?"), "", [tr("فرض صفر را رد می‌کنیم", "Reject the null hypothesis"), tr("فرض صفر را رد نمی‌کنیم", "Fail to reject the null hypothesis"), tr("فرض صفر قطعاً درست است", "The null hypothesis is certainly true")], p < a ? 0 : 1, {
      explain: [step(tr("مقایسه", "compare"), p + (p < a ? " < " : " \\ge ") + a)], hint: tr("اگر p < α، شواهد برای رد فرض صفر کافی است. «رد نکردن» به معنی «اثبات» نیست.", "If p < α the evidence is strong enough to reject H₀. Failing to reject is not proof.") });
  };
  G["s-mle"] = () => {
    const k = R(0, 2);
    if (k === 0) { const n = R(10, 60), x = R(1, n - 1);
      return num(tr("در $" + n + "$ آزمایش برنولی مستقل، $" + x + "$ موفقیت دیده شده است. برآورد درست‌نمایی بیشینهٔ $p$ چیست؟", "In $" + n + "$ independent Bernoulli trials there were $" + x + "$ successes. What is the maximum likelihood estimate of $p$?"), "", Q(x, n), { opts: { tol: 1e-3 },
        explain: [step(tr("لگاریتم درست‌نمایی", "log-likelihood"), "\\ell(p) = " + x + "\\ln p + " + (n - x) + "\\ln(1 - p)"), step(tr("مشتق برابر صفر", "set the derivative to zero"), "\\frac{" + x + "}{p} - \\frac{" + (n - x) + "}{1 - p} = 0 \\Rightarrow \\hat{p} = \\frac{" + x + "}{" + n + "}")] }); }
    if (k === 1) { const d = dataset(R(5, 8), 0, 9);
      return num(tr("داده‌های شمارشی $\\{" + d.join(", ") + "\\}$ از توزیع پواسون آمده‌اند. برآورد درست‌نمایی بیشینهٔ $\\lambda$ چیست؟", "Count data $\\{" + d.join(", ") + "\\}$ come from a Poisson distribution. What is the MLE of $\\lambda$?"), "", Q(d.reduce((s, x) => s + x, 0), d.length), { opts: { tol: 1e-3 }, explain: [step(tr("برای پواسون، MLE برابر میانگین نمونه است", "for Poisson the MLE is the sample mean"), "\\hat{\\lambda} = \\bar{x} = " + fmt(d.reduce((s, x) => s + x, 0) / d.length))] }); }
    const d = dataset(R(4, 7), 1, 12), n = d.length, m = d.reduce((s, x) => s + x, 0) / n, v = d.reduce((s, x) => s + (x - m) ** 2, 0) / n;
    return num(tr("برای داده‌های $\\{" + d.join(", ") + "\\}$ از توزیع نرمال، برآورد درست‌نمایی بیشینهٔ واریانس ($\\hat{\\sigma}^{2}$، تقسیم بر $n$) را تا دو رقم اعشار حساب کن.", "For normal data $\\{" + d.join(", ") + "\\}$, compute the maximum likelihood estimate of the variance ($\\hat{\\sigma}^{2}$, dividing by $n$) to two decimals."), "", v, { opts: { tol: 0.011 },
      explain: [step(tr("میانگین", "mean"), "\\hat{\\mu} = " + fmt(m)), step(tr("واریانس MLE", "MLE variance"), "\\hat{\\sigma}^{2} = \\frac{1}{n}\\sum (x_i - \\hat{\\mu})^{2} = " + fmt(v))] });
  };
  G["s-bayes"] = () => {
    if (R(0, 1) === 0) { const a = R(1, 5), b = R(1, 5), n = R(5, 30), k = R(0, n), pm = (a + k) / (a + b + n);
      return num(tr("پیشین $p \\sim \\text{Beta}(" + a + ", " + b + ")$ است. در $" + n + "$ آزمایش $" + k + "$ موفقیت دیدیم. میانگین پسین $p$ چیست؟ (سه رقم اعشار)", "The prior is $p \\sim \\text{Beta}(" + a + ", " + b + ")$. We observe $" + k + "$ successes in $" + n + "$ trials. What is the posterior mean of $p$? (3 decimals)"), "", pm, { opts: { tol: 2e-3 },
        explain: [step(tr("مزدوج بودن بتا و دوجمله‌ای", "beta–binomial conjugacy"), "p \\mid \\text{data} \\sim \\text{Beta}(" + (a + k) + ", " + (b + n - k) + ")"), step(tr("میانگین بتا", "beta mean"), "\\frac{" + (a + k) + "}{" + (a + b + n) + "} \\approx " + pm.toFixed(3))] }); }
    const pr = pick([0.5, 0.3, 0.2]), l1 = pick([0.8, 0.6, 0.9]), l0 = pick([0.2, 0.3, 0.4]), post = l1 * pr / (l1 * pr + l0 * (1 - pr));
    return num(tr("دو فرضیه داریم: $H_1$ با احتمال پیشین $" + pr + "$ و $H_0$ با $" + fmt(1 - pr) + "$. احتمال دیدن داده تحت $H_1$ برابر $" + l1 + "$ و تحت $H_0$ برابر $" + l0 + "$ است. احتمال پسین $H_1$ چیست؟ (سه رقم اعشار)", "Two hypotheses: $H_1$ with prior $" + pr + "$ and $H_0$ with prior $" + fmt(1 - pr) + "$. The likelihood of the data is $" + l1 + "$ under $H_1$ and $" + l0 + "$ under $H_0$. What is the posterior probability of $H_1$? (3 decimals)"), "", post, { opts: { tol: 2e-3 },
      explain: [step(tr("پسین ∝ درست‌نمایی × پیشین", "posterior ∝ likelihood × prior"), "\\frac{" + l1 + "\\cdot " + pr + "}{" + l1 + "\\cdot " + pr + " + " + l0 + "\\cdot " + fmt(1 - pr) + "} \\approx " + post.toFixed(3))] });
  };

  /* ===================== Linear algebra ===================== */
  const vstr = v => "(" + v.join(", ") + ")";
  G["l-vectors"] = () => {
    const u = [R(-5, 5), R(-5, 5)], v = [R(-5, 5), R(-5, 5)], k = R(0, 2);
    if (k === 0) { const a = nz(-3, 3), b = nz(-3, 3), w = [a * u[0] + b * v[0], a * u[1] + b * v[1]];
      return matrix(tr("اگر $\\vec u = " + vstr(u) + "$ و $\\vec v = " + vstr(v) + "$، بردار $" + T(term(a, "u", true) + term(b, "v")).replace(/u/g, "\\vec u").replace(/v/g, "\\vec v") + "$ را بنویس (مثلاً (1, 2)).", "If $\\vec u = " + vstr(u) + "$ and $\\vec v = " + vstr(v) + "$, find $" + T(term(a, "u", true) + term(b, "v")).replace(/u/g, "\\vec u").replace(/v/g, "\\vec v") + "$ (e.g. (1, 2))."), "", [w.map(x => Q(x))], {
        explain: [step(tr("مؤلفه‌به‌مؤلفه", "component by component"), a + vstr(u) + " + " + b + vstr(v) + " = " + vstr(w))] }); }
    const w = pick([[3, 4], [5, 12], [6, 8], [1, 2], [2, 2], [1, 3]]).map(x => x * pick([1, -1])), m = Math.hypot(w[0], w[1]);
    return num(tr("طول (نُرم) بردار $" + vstr(w) + "$ چیست؟", "What is the length (norm) of $" + vstr(w) + "$?"), "", Number.isInteger(m) ? Q(m) : m, { opts: { rtol: 1e-4 }, ansStr: Number.isInteger(m) ? String(m) : "sqrt(" + (w[0] ** 2 + w[1] ** 2) + ")", explain: [step(tr("فیثاغورس", "Pythagoras"), "\\|\\vec v\\| = \\sqrt{" + w[0] + "^{2} + " + w[1] + "^{2}} = \\sqrt{" + (w[0] ** 2 + w[1] ** 2) + "}")] });
  };
  G["l-dot"] = () => {
    const k = R(0, 2), dim = R(2, 3), u = Array.from({ length: dim }, () => R(-5, 5)), v = Array.from({ length: dim }, () => R(-5, 5)), dot = u.reduce((s, x, i) => s + x * v[i], 0);
    if (k === 0) return num(tr("ضرب داخلی $" + vstr(u) + " \\cdot " + vstr(v) + "$ را حساب کن.", "Compute the dot product $" + vstr(u) + " \\cdot " + vstr(v) + "$."), "", Q(dot), { explain: [step(tr("جمع حاصل‌ضرب مؤلفه‌ها", "sum of componentwise products"), u.map((x, i) => "(" + x + ")(" + v[i] + ")").join(" + ") + " = " + dot)] });
    if (k === 1) { const a = pick([[1, 0], [1, 1], [3, 4], [1, 2]]), b = pick([[0, 1], [1, 0], [-1, 1], [2, 1], [4, -3]]), ang = deg(Math.acos((a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b))));
      return num(tr("زاویهٔ بین $" + vstr(a) + "$ و $" + vstr(b) + "$ چند درجه است؟ (یک رقم اعشار)", "What is the angle between $" + vstr(a) + "$ and $" + vstr(b) + "$ in degrees? (1 decimal)"), "", ang, { opts: { tol: 0.06 }, explain: [step(tr("فرمول زاویه", "angle formula"), "\\cos\\theta = \\frac{\\vec a \\cdot \\vec b}{\\|\\vec a\\|\\|\\vec b\\|} \\Rightarrow \\theta \\approx " + ang.toFixed(1) + "^\\circ")] }); }
    const a = [R(-4, 4), R(-4, 4)], orth = R(0, 1) === 1, b = orth ? [-a[1] * pick([1, 2]), a[0] * pick([1, 2])] : [a[0] + 1, a[1] + R(1, 2)];
    if (a[0] === 0 && a[1] === 0) return G["l-dot"]();
    return choice(tr("آیا $" + vstr(a) + "$ و $" + vstr(b) + "$ بر هم عمودند؟", "Are $" + vstr(a) + "$ and $" + vstr(b) + "$ orthogonal?"), "", [tr("بله", "Yes"), tr("نه", "No")], a[0] * b[0] + a[1] * b[1] === 0 ? 0 : 1, { explain: [step(tr("عمود ⇔ ضرب داخلی صفر", "orthogonal ⇔ dot product is zero"), a[0] * b[0] + a[1] * b[1] + "")] });
  };
  G["l-matrices"] = () => {
    const k = R(0, 2), M = () => [[R(-4, 4), R(-4, 4)], [R(-4, 4), R(-4, 4)]];
    if (k === 0) { const A = M(), B = M(), Cm = A.map(r => B[0].map((_, j) => r[0] * B[0][j] + r[1] * B[1][j]));
      return matrix(tr("حاصل‌ضرب $AB$ را حساب کن (سطرها را با ; جدا کن، مثلاً 1 2; 3 4).", "Compute $AB$ (separate rows with ;, e.g. 1 2; 3 4)."), "A = " + mtex(A) + ",\\quad B = " + mtex(B), Cm.map(r => r.map(x => Q(x))), { solve: () => E.matrixOp("mul", E.parseMatrix(A.map(r => r.join(" ")).join(";")), E.parseMatrix(B.map(r => r.join(" ")).join(";"))) }); }
    if (k === 1) { const A = M(), v = [R(-4, 4), R(-4, 4)], w = A.map(r => r[0] * v[0] + r[1] * v[1]);
      return matrix(tr("حاصل $A\\vec v$ را به شکل ستونی بنویس (مثلاً 3; -1).", "Compute $A\\vec v$ as a column (e.g. 3; -1)."), "A = " + mtex(A) + ",\\quad \\vec v = " + vtex(v), w.map(x => [Q(x)]), { explain: [step(tr("هر سطر در بردار", "each row times the vector"), vtex(A.map((r, i) => r[0] + "\\cdot" + v[0] + " + " + r[1] + "\\cdot" + v[1])) + " = " + vtex(w))] }); }
    const A = [[R(-5, 5), R(-5, 5), R(-5, 5)], [R(-5, 5), R(-5, 5), R(-5, 5)]];
    return matrix(tr("ترانهادهٔ $A$ را بنویس.", "Write the transpose of $A$."), "A = " + mtex(A), A[0].map((_, j) => A.map(r => Q(r[j]))), { explain: [step(tr("سطرها ستون می‌شوند", "rows become columns"), "A^{T}")] });
  };
  G["l-systems"] = () => {
    const sol = [nz(-4, 4), nz(-4, 4), nz(-4, 4)]; let A;
    do { A = [[R(-3, 3), R(-3, 3), R(-3, 3)], [R(-3, 3), R(-3, 3), R(-3, 3)], [R(-3, 3), R(-3, 3), R(-3, 3)]]; } while (Math.abs(E.detValue(A.map(r => r.map(x => Q(x)))).num()) < 0.5);
    const vs = ["x", "y", "z"], eqs = A.map(r => r.map((c, i) => term(c, vs[i], i === 0 || r.slice(0, i).every(x => x === 0))).join("") + " = " + r.reduce((s, c, i) => s + c * sol[i], 0));
    return tuple(tr("دستگاه را با حذف گاوسی حل کن و جواب را به شکل $(x, y, z)$ بنویس.", "Solve by Gaussian elimination and write the answer as $(x, y, z)$."), "\\begin{cases}" + eqs.map(e => T(e.split("=")[0]) + " = " + e.split("=")[1]).join(" \\\\ ") + "\\end{cases}", { x: Q(sol[0]), y: Q(sol[1]), z: Q(sol[2]) }, vs, {
      solve: () => E.solveSystem(E.parseStatement(eqs.join(",")).map(g => g.parts)) });
  };
  G["l-inverse"] = () => {
    const k = R(0, 2);
    if (k === 0) { const A = [[R(-6, 6), R(-6, 6)], [R(-6, 6), R(-6, 6)]];
      return num(tr("دترمینان را حساب کن.", "Compute the determinant."), mtex(A).replace("bmatrix", "vmatrix").replace("bmatrix", "vmatrix"), Q(A[0][0] * A[1][1] - A[0][1] * A[1][0]), { solve: () => E.matrixOp("det", E.parseMatrix(A.map(r => r.join(" ")).join(";"))) }); }
    if (k === 1) { const A = [[R(-3, 3), R(-3, 3), R(-3, 3)], [R(-3, 3), R(-3, 3), R(-3, 3)], [R(-3, 3), R(-3, 3), R(-3, 3)]], Aq = E.parseMatrix(A.map(r => r.join(" ")).join(";"));
      return num(tr("دترمینان ماتریس ۳×۳ را حساب کن.", "Compute the determinant of the 3×3 matrix."), mtex(A).replace(/bmatrix/g, "vmatrix"), E.detValue(Aq), { solve: () => E.matrixOp("det", Aq) }); }
    let A; do { A = [[R(-5, 5), R(-5, 5)], [R(-5, 5), R(-5, 5)]]; } while (A[0][0] * A[1][1] - A[0][1] * A[1][0] === 0);
    const Aq = E.parseMatrix(A.map(r => r.join(" ")).join(";")), inv = E.inverseSteps(Aq).value;
    return matrix(tr("وارون $A$ را بنویس (کسرها مجازند، سطرها با ;).", "Write $A^{-1}$ (fractions allowed, rows separated by ;)."), "A = " + mtex(A), inv, { solve: () => E.matrixOp("inv", Aq) });
  };
  G["l-eigen"] = () => {
    let l1 = R(-4, 6), l2 = R(-4, 6); while (l2 === l1) l2 = R(-4, 6);
    const a = R(-3, 6), d = l1 + l2 - a, p = a * d - l1 * l2;
    let b, c;
    if (p === 0) { b = 0; c = R(-3, 3); } else { const divs = []; for (let i = 1; i <= Math.abs(p); i++) if (p % i === 0) divs.push(i, -i); b = pick(divs); c = p / b; }
    const A = [[a, b], [c, d]], Aq = E.parseMatrix(A.map(r => r.join(" ")).join(";"));
    return set(tr("مقادیر ویژهٔ ماتریس را پیدا کن (با ویرگول جدا کن).", "Find the eigenvalues of the matrix (comma-separated)."), "A = " + mtex(A), [Q(l1), Q(l2)], { solve: () => E.matrixOp("eig", Aq), hint: tr("معادلهٔ مشخصه: λ² − (اثر)λ + دترمینان = 0", "Characteristic equation: λ² − (trace)λ + det = 0") });
  };
  G["l-projection"] = () => {
    if (R(0, 1) === 0) { const a = [nz(-3, 3), R(-3, 3)], b = [R(-5, 5), R(-5, 5)], k = Q(a[0] * b[0] + a[1] * b[1], a[0] ** 2 + a[1] ** 2);
      return matrix(tr("تصویر $\\vec b = " + vstr(b) + "$ روی $\\vec a = " + vstr(a) + "$ را به شکل (x, y) بنویس.", "Write the projection of $\\vec b = " + vstr(b) + "$ onto $\\vec a = " + vstr(a) + "$ as (x, y)."), "", [a.map(x => k.mul(Q(x)))], {
        explain: [step(tr("فرمول تصویر", "projection formula"), "\\operatorname{proj}_{\\vec a}\\vec b = \\frac{\\vec a \\cdot \\vec b}{\\vec a \\cdot \\vec a}\\vec a = " + qT(k) + vstr(a))] }); }
    const xs = [0, 1, 2, 3], ys = xs.map(x => R(-2, 2) + 2 * x + R(0, 3)), mx = 1.5, my = ys.reduce((s, y) => s + y, 0) / 4, sl = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
    return num(tr("شیب خط کمترین مربعات برای نقطه‌های زیر را حساب کن (دو رقم اعشار). این همان جواب $(X^{T}X)^{-1}X^{T}y$ است.", "Compute the least-squares slope for these points (two decimals). This is the solution of $(X^{T}X)^{-1}X^{T}y$."), "\\{" + xs.map((x, i) => "(" + x + ", " + ys[i] + ")").join(",\\; ") + "\\}", sl, { opts: { tol: 0.011 }, solve: () => E.regressionSteps(xs.map((x, i) => [x, ys[i]])) });
  };
  G["l-svd"] = () => {
    if (R(0, 1) === 0) { const a = nz(-6, 6), b = nz(-6, 6), A = [[a, 0], [0, b]];
      const rot = R(0, 1) === 1, M = rot ? [[0, a], [b, 0]] : A;
      return set(tr("مقادیر منفرد ماتریس را پیدا کن (با ویرگول جدا کن).", "Find the singular values of the matrix (comma-separated)."), mtex(M), [Q(Math.abs(a)), Q(Math.abs(b))], {
        explain: [step(tr("مقادیر منفرد = ریشهٔ دوم مقادیر ویژهٔ AᵀA", "singular values = square roots of the eigenvalues of AᵀA"), "A^{T}A = \\begin{bmatrix}" + (rot ? b * b : a * a) + " & 0 \\\\ 0 & " + (rot ? a * a : b * b) + "\\end{bmatrix} \\Rightarrow \\sigma = " + Math.abs(a) + ",\\; " + Math.abs(b))] }); }
    const ev = [R(20, 60), R(5, 20), R(1, 5), R(0, 3)].sort((a, b) => b - a), k = R(1, 2), tot = ev.reduce((s, x) => s + x, 0), ratio = ev.slice(0, k).reduce((s, x) => s + x, 0) / tot;
    return num(tr("مقادیر ویژهٔ ماتریس کوواریانس $" + ev.join(", ") + "$ هستند. $" + k + "$ مؤلفهٔ اصلی اول چه کسری از واریانس را توضیح می‌دهند؟ (سه رقم اعشار)", "The eigenvalues of a covariance matrix are $" + ev.join(", ") + "$. What fraction of the variance do the first $" + k + "$ principal components explain? (3 decimals)"), "", ratio, { opts: { tol: 2e-3 },
      explain: [step(tr("نسبت واریانس توضیح‌داده‌شده", "explained variance ratio"), "\\frac{" + ev.slice(0, k).join(" + ") + "}{" + tot + "} \\approx " + ratio.toFixed(3))] });
  };

  /* ===================== Calculus ===================== */
  G["c-limits"] = () => {
    const k = R(0, 2);
    if (k === 0) { const a = nz(-5, 5), b = nz(-5, 5); const f = "(" + poly([1, b - a, -a * b]) + ")/(x" + sg(-a) + ")";
      return num(tr("حد را حساب کن.", "Evaluate the limit."), "\\lim_{x \\to " + a + "} " + T(f), Q(a + b), { solve: () => E.limitSteps(P(f), "x", P(String(a))), hint: tr("جایگذاری مستقیم 0/0 می‌دهد؛ صورت را تجزیه کن.", "Direct substitution gives 0/0; factor the numerator.") }); }
    if (k === 1) { const c = nz(2, 7), d = R(0, 1) ? 1 : nz(2, 4);
      return num(tr("حد را حساب کن.", "Evaluate the limit."), "\\lim_{x \\to 0} " + T("sin(" + c + "x)/(" + d + "x)"), Q(c, d), { solve: () => E.limitSteps(P("sin(" + c + "x)/(" + d + "x)"), "x", P("0")), hint: tr("از حد معروف sin(u)/u → 1 استفاده کن.", "Use the famous limit sin(u)/u → 1.") }); }
    const a = nz(-6, 6), b = R(-5, 5), c = nz(-6, 6), d = R(-5, 5), f = "(" + poly([a, b, 1]) + ")/(" + poly([c, d, 3]) + ")";
    return num(tr("حد در بی‌نهایت را حساب کن.", "Evaluate the limit at infinity."), "\\lim_{x \\to \\infty} " + T(f), Q(a, c), { solve: () => E.limitSteps(P(f), "x", P("oo")), hint: tr("درجه‌ها برابرند؛ ضرایب بزرگ‌ترین توان را مقایسه کن.", "Equal degrees: compare the leading coefficients.") });
  };
  G["c-derivative"] = () => {
    const cs = [R(-4, 4), R(-6, 6), nz(-6, 6), R(-9, 9)], f = poly(cs), d = poly([3 * cs[0], 2 * cs[1], cs[2]]);
    if (R(0, 2) === 0) { const x = R(-3, 3); return num(tr("اگر $f(x) = " + T(f) + "$، مقدار $f'(" + x + ")$ چیست؟", "If $f(x) = " + T(f) + "$, what is $f'(" + x + ")$?"), "", Q(3 * cs[0] * x * x + 2 * cs[1] * x + cs[2]), { solve: () => E.derivativeSteps(P(f), "x") }); }
    return expr(tr("مشتق را پیدا کن.", "Find the derivative."), "\\frac{d}{dx}\\left[" + T(f) + "\\right]", d, { opts: { vars: ["x"] }, solve: () => E.derivativeSteps(P(f), "x"), hint: tr("قاعدهٔ توان: (xⁿ)′ = n·xⁿ⁻¹ و مشتق عدد ثابت صفر است.", "Power rule: (xⁿ)′ = n·xⁿ⁻¹; the derivative of a constant is 0.") });
  };
  G["c-chain"] = () => {
    const a = nz(2, 5), b = nz(-5, 5), n = R(2, 5), k = nz(-4, 4);
    const items = [["(" + poly([a, b]) + ")^" + n, n * a + "*(" + poly([a, b]) + ")^" + (n - 1)], ["e^(" + k + "x)", k + "*e^(" + k + "x)"], ["ln(" + a + "x^2 + " + Math.abs(b) + ")", "2*" + a + "*x/(" + a + "x^2 + " + Math.abs(b) + ")"], ["sin(" + k + "x)", k + "*cos(" + k + "x)"], ["x*e^(" + k + "x)", "e^(" + k + "x) + " + k + "*x*e^(" + k + "x)"], ["sqrt(" + a + "x + " + Math.abs(b) + ")", a + "/(2*sqrt(" + a + "x + " + Math.abs(b) + "))"], ["cos(x^2)", "-2x*sin(x^2)"]];
    const [f, d] = pick(items);
    return expr(tr("مشتق را پیدا کن.", "Find the derivative."), "\\frac{d}{dx}\\left[" + T(f) + "\\right]", d, { opts: { vars: ["x"] }, solve: () => E.derivativeSteps(P(f), "x"), hint: tr("قاعدهٔ زنجیره‌ای: مشتق بیرونی (با داخل دست‌نخورده) × مشتق داخلی.", "Chain rule: derivative of the outside (inside unchanged) × derivative of the inside.") });
  };
  G["c-applications"] = () => {
    const k = R(0, 2);
    if (k === 0) { const a = R(1, 4), f = "x^3 - " + 3 * a * a + "x";
      return set(tr("نقاط بحرانی تابع $f(x) = " + T(f) + "$ را پیدا کن (مقادیر x).", "Find the critical points of $f(x) = " + T(f) + "$ (the x values)."), "", [Q(-a), Q(a)], { solve: () => E.extremaSteps(P(f), "x"), hint: tr("f′(x) = 0 را حل کن.", "Solve f′(x) = 0.") }); }
    if (k === 1) { const p = R(-4, 4), m = R(-5, 9), f = poly([-1, 2 * p, m - p * p]);
      return num(tr("بیشینهٔ مقدار تابع $f(x) = " + T(f) + "$ چیست؟", "What is the maximum value of $f(x) = " + T(f) + "$?"), "", Q(m), { solve: () => E.extremaSteps(P(f), "x"), hint: tr("f′ = 0 را حل کن و مقدار f را در آن نقطه حساب کن.", "Solve f′ = 0, then evaluate f there.") }); }
    const P_ = R(20, 80) * 2;
    return num(tr("مستطیلی با محیط $" + P_ + "$ متر می‌خواهیم که بیشترین مساحت را داشته باشد. بیشترین مساحت چند متر مربع است؟", "A rectangle has perimeter $" + P_ + "$ m. What is the largest possible area in m²?"), "", Q(P_ * P_, 16), {
      explain: [step(tr("مساحت بر حسب یک ضلع", "area in terms of one side"), "A(x) = x\\left(" + P_ / 2 + " - x\\right)"), step(tr("مشتق صفر", "derivative zero"), "A'(x) = " + P_ / 2 + " - 2x = 0 \\Rightarrow x = " + P_ / 4), step(tr("مربع بهینه است", "the square is optimal"), "A = " + fmt(P_ * P_ / 16))] });
  };
  G["c-integral"] = () => {
    const cs = [R(-3, 3), nz(-4, 4), R(-5, 5)], f = poly(cs);
    if (R(0, 1) === 0) { const a = R(-2, 1), b = a + R(1, 3);
      const F = x => Q(cs[0] * x * x * x, 3).add(Q(cs[1] * x * x, 2)).add(Q(cs[2] * x));
      return num(tr("انتگرال معین را حساب کن.", "Evaluate the definite integral."), "\\int_{" + a + "}^{" + b + "} \\left(" + T(f) + "\\right) dx", F(b).sub(F(a)), { solve: () => E.integralSteps(P(f), "x", [P(String(a)), P(String(b))]), hint: tr("پاد‌مشتق را پیدا کن و F(b) − F(a) را حساب کن.", "Find an antiderivative F and compute F(b) − F(a).") }); }
    const p = { type: "expr", q: tr("یک پاد‌مشتق پیدا کن (نوشتن + C لازم نیست).", "Find an antiderivative (no need to write + C)."), tex: "\\int \\left(" + T(f) + "\\right) dx", integrand: P(f), opts: { form: "antideriv", vars: ["x"] } };
    const Fs = E.plain(E.nicest(E.integralSteps(P(f), "x").result));
    return Object.assign(p, { ans: P(Fs), ansStr: Fs, ansTex: T(Fs) + " + C", solve: () => E.integralSteps(P(f), "x"), hint: tr("∫xⁿ dx = xⁿ⁺¹/(n+1)", "∫xⁿ dx = xⁿ⁺¹/(n+1)") });
  };
  G["c-techniques"] = () => {
    const k = nz(2, 4), a = R(1, 6);
    const items = [["x*e^(" + k + "x)", tr("جزءبه‌جزء", "by parts")], ["2x*cos(x^2)", tr("جایگذاری", "substitution")], ["x/(x^2 + " + a + ")", tr("جایگذاری", "substitution")], ["ln(x)", tr("جزءبه‌جزء", "by parts")], ["x*sin(x)", tr("جزءبه‌جزء", "by parts")], ["(" + k + "x + 1)^3", tr("جایگذاری خطی", "linear substitution")], ["x*e^(x^2)", tr("جایگذاری", "substitution")]];
    const [f, how] = pick(items), res = E.integralSteps(P(f), "x"), Fs = E.plain(res.result);
    return { type: "expr", q: tr("یک پاد‌مشتق پیدا کن (روش پیشنهادی: " + how + "). نوشتن + C لازم نیست.", "Find an antiderivative (suggested method: " + how + "). No need to write + C."), tex: "\\int " + T(f) + "\\, dx", integrand: P(f), opts: { form: "antideriv", vars: ["x"] }, ans: P(Fs), ansStr: Fs, ansTex: T(Fs) + " + C", solve: () => E.integralSteps(P(f), "x") };
  };
  G["c-taylor"] = () => {
    const k = R(0, 2);
    if (k === 0) { const a = nz(-3, 3), n = R(2, 5);
      return num(tr("ضریب $x^{" + n + "}$ در سری مک‌لورن $e^{" + a + "x}$ چیست؟", "What is the coefficient of $x^{" + n + "}$ in the Maclaurin series of $e^{" + a + "x}$?"), "", Q(Math.pow(a, n), fact(n)), { opts: { tol: 1e-6 }, explain: [step(tr("سری نمایی", "exponential series"), "e^{u} = \\sum \\frac{u^{n}}{n!} \\Rightarrow \\frac{" + a + "^{" + n + "}}{" + n + "!} = " + qT(Q(Math.pow(a, n), fact(n))))] }); }
    if (k === 1) { const f = pick([["sin(x)", "x - x^3/6"], ["cos(x)", "1 - x^2/2"], ["e^x", "1 + x + x^2/2 + x^3/6"], ["1/(1-x)", "1 + x + x^2 + x^3"], ["ln(1+x)", "x - x^2/2 + x^3/3"]]);
      return expr(tr("چندجمله‌ای مک‌لورن مرتبهٔ ۳ را بنویس.", "Write the degree-3 Maclaurin polynomial."), f[0], f[1], { opts: { vars: ["x"] }, solve: () => E.taylorSteps(P(f[0]), "x", P("0"), 3) }); }
    const x = pick([0.1, 0.2, 0.5]), v = 1 + x + x * x / 2;
    return num(tr("با چندجمله‌ای تیلور مرتبهٔ ۲ حول صفر، $e^{" + x + "}$ را تقریب بزن (چهار رقم اعشار).", "Use the degree-2 Taylor polynomial at 0 to approximate $e^{" + x + "}$ (four decimals)."), "", v, { opts: { tol: 6e-5 }, explain: [step(tr("تقریب", "approximation"), "e^{x} \\approx 1 + x + \\frac{x^{2}}{2} = " + fmt(v))] });
  };
  G["m-partial"] = () => {
    const a = nz(-4, 4), b = nz(-4, 4), c = R(-5, 5), f = term(a, "x^2*y", true) + term(b, "x*y^3") + term(c, "y");
    if (R(0, 1) === 0) { const wrt = pick(["x", "y"]), d = wrt === "x" ? term(2 * a, "x*y", true) + term(b, "y^3") : term(a, "x^2", true) + term(3 * b, "x*y^2") + term(c, "");
      return expr(tr("مشتق جزئی $\\frac{\\partial f}{\\partial " + wrt + "}$ را پیدا کن.", "Find the partial derivative $\\frac{\\partial f}{\\partial " + wrt + "}$."), "f(x, y) = " + T(f), d || "0", { opts: { vars: ["x", "y"] }, explain: [step(tr("متغیر دیگر را ثابت بگیر", "treat the other variable as a constant"), "\\frac{\\partial f}{\\partial " + wrt + "} = " + T(d || "0"))] }); }
    const x = R(-2, 2), y = R(-2, 2), gx = 2 * a * x * y + b * y ** 3, gy = a * x * x + 3 * b * x * y * y + c;
    return matrix(tr("گرادیان $\\nabla f$ را در نقطهٔ $(" + x + ", " + y + ")$ به شکل (a, b) بنویس.", "Write the gradient $\\nabla f$ at $(" + x + ", " + y + ")$ as (a, b)."), "f(x, y) = " + T(f), [[Q(gx), Q(gy)]], {
      explain: [step(tr("مشتق‌های جزئی", "partial derivatives"), "f_x = " + T(term(2 * a, "x*y", true) + term(b, "y^3")) + ",\\quad f_y = " + T(term(a, "x^2", true) + term(3 * b, "x*y^2") + term(c, "") || "0")), step(tr("جایگذاری", "substitute"), "\\nabla f = (" + gx + ", " + gy + ")")] });
  };
  G["m-gd"] = () => {
    if (R(0, 1) === 0) { const a = R(-5, 5), x0 = R(-5, 5), eta = pick([0.1, 0.25, 0.05]), grad = 2 * (x0 - a), x1 = x0 - eta * grad;
      return num(tr("برای $f(x) = (x " + (a < 0 ? "+ " + -a : "- " + a) + ")^{2}$ از $x_0 = " + x0 + "$ با نرخ یادگیری $\\eta = " + eta + "$ یک گام گرادیان کاهشی بردار. $x_1$ چیست؟", "For $f(x) = (x " + (a < 0 ? "+ " + -a : "- " + a) + ")^{2}$, take one gradient-descent step from $x_0 = " + x0 + "$ with learning rate $\\eta = " + eta + "$. What is $x_1$?"), "", x1, { opts: { tol: 1e-6 },
        explain: [step(tr("گرادیان", "gradient"), "f'(x_0) = 2(" + x0 + " - (" + a + ")) = " + grad), step(tr("به‌روزرسانی", "update"), "x_1 = x_0 - \\eta f'(x_0) = " + x0 + " - " + eta + " \\times " + grad + " = " + fmt(x1))] }); }
    const x0 = R(-4, 4), y0 = R(-4, 4), eta = pick([0.1, 0.25]), g = [2 * x0, 4 * y0];
    return matrix(tr("برای $f(x, y) = x^{2} + 2y^{2}$ از $(" + x0 + ", " + y0 + ")$ با $\\eta = " + eta + "$ یک گام گرادیان کاهشی بردار و نقطهٔ جدید را به شکل (x, y) بنویس.", "For $f(x, y) = x^{2} + 2y^{2}$, take one gradient-descent step from $(" + x0 + ", " + y0 + ")$ with $\\eta = " + eta + "$. Write the new point as (x, y)."), "", [[x0 - eta * g[0], y0 - eta * g[1]]], { opts: { tol: 1e-6 },
      explain: [step(tr("گرادیان", "gradient"), "\\nabla f = (2x, 4y) = (" + g.join(", ") + ")"), step(tr("به‌روزرسانی", "update"), "(x, y) - " + eta + "\\nabla f = (" + fmt(x0 - eta * g[0]) + ", " + fmt(y0 - eta * g[1]) + ")")] });
  };
  G["m-convex"] = () => {
    const k = R(0, 2);
    if (k === 0) { const fs = [["x^2 + 3x", true], ["-x^2 + 4", false], ["e^x", true], ["x^4", true], ["ln(x)", false], ["-sqrt(x)", true], ["x^3", false], ["abs(x)", true]];
      const [f, cvx] = pick(fs);
      return choice(tr("آیا $f(x) = " + T(f) + "$ روی دامنه‌اش (برای $x^3$ کل اعداد حقیقی) محدب است؟", "Is $f(x) = " + T(f) + "$ convex on its domain (for $x^3$, all real numbers)?"), "", [tr("بله، محدب است", "Yes, convex"), tr("نه، محدب نیست", "No, not convex")], cvx ? 0 : 1, { hint: tr("اگر f″ ≥ 0 در همه جا، تابع محدب است.", "If f″ ≥ 0 everywhere, the function is convex.") }); }
    if (k === 1) { const a = R(1, 5), b = R(-10, 10), c = R(-5, 5), v = Q(c).sub(Q(b * b, 4 * a));
      return num(tr("کمینهٔ تابع محدب $f(x) = " + T(poly([a, b, c])) + "$ چیست؟", "What is the minimum value of the convex function $f(x) = " + T(poly([a, b, c])) + "$?"), "", v, { solve: () => E.extremaSteps(P(poly([a, b, c])), "x") }); }
    const s = R(4, 20);
    return num(tr("بیشینهٔ $xy$ را با قید $x + y = " + s + "$ پیدا کن (ضرایب لاگرانژ).", "Maximize $xy$ subject to $x + y = " + s + "$ (Lagrange multipliers)."), "", Q(s * s, 4), {
      explain: [step(tr("لاگرانژی", "Lagrangian"), "\\mathcal{L} = xy - \\lambda(x + y - " + s + ")"), step(tr("شرایط", "conditions"), "y = \\lambda,\\; x = \\lambda \\Rightarrow x = y = " + fmt(s / 2)), step(tr("مقدار", "value"), "xy = " + fmt(s * s / 4))] });
  };

  function generate(skill) {
    const g = G[skill]; if (!g) return null;
    for (let i = 0; i < 6; i++) {
      try { const p = g(); if (p) { p.skill = skill; p.opts = p.opts || {}; return p; } } catch (e) { if (i === 5) throw e; }
    }
    return null;
  }
  const PRACTICE = { generate, generators: G, has: id => !!G[id] };
  root.PRACTICE = PRACTICE;
  if (typeof module !== "undefined" && module.exports) module.exports = PRACTICE;
})(typeof globalThis !== "undefined" ? globalThis : this);
