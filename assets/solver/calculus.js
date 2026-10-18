/* MathEngine calculus: derivatives with rule-by-rule steps, integrals (table, linearity,
   linear & u-substitution, integration by parts, partial fractions, trig identities),
   definite integrals, limits (substitution, factor & cancel, L'Hôpital, degree comparison),
   tangent lines, extrema and Taylor polynomials. */
(function (root) {
  "use strict";
  const E = root.MathEngine;
  const { Q, N, MathError, simp, pretty, evalNum, evalExact, step } = E;
  const T = E.tex, q = (n, d = 1) => Q.of(n, d);
  const has = E.has;
  const two = () => N.num(q(2)), one = () => N.num(q(1)), zero = () => N.num(q(0));
  const ddx = (v, a) => "\\frac{d}{d" + v + "}\\left[" + T(a) + "\\right]";

  /* ======================= derivative ======================= */
  function D(a, v) {
    if (!has(a, v)) return zero();
    switch (a.t) {
      case "var": return one();
      case "neg": return simp(N.neg(D(a.a, v)));
      case "bin": {
        const { l, r, op } = a;
        if (op === "+" || op === "-") return simp(N.bin(op, D(l, v), D(r, v)));
        if (op === "*") {
          if (!has(l, v)) return simp(N.mul(l, D(r, v)));
          if (!has(r, v)) return simp(N.mul(D(l, v), r));
          return simp(N.add(N.mul(D(l, v), r), N.mul(l, D(r, v))));
        }
        if (op === "/") {
          if (!has(r, v)) return simp(N.div(D(l, v), r));
          if (!has(l, v)) return simp(N.neg(N.div(N.mul(l, D(r, v)), N.pow(r, two()))));
          return simp(N.div(N.sub(N.mul(D(l, v), r), N.mul(l, D(r, v))), N.pow(r, two())));
        }
        if (op === "^") {
          if (!has(r, v)) { const n1 = simp(N.sub(r, one())); return simp(N.mul(N.mul(r, N.pow(l, n1)), D(l, v))); }
          if (!has(l, v)) { const lnb = l.t === "const" && l.n === "e" ? one() : N.fn("ln", l); return simp(N.mul(N.mul(a, lnb), D(r, v))); }
          return simp(N.mul(a, N.add(N.mul(D(r, v), N.fn("ln", l)), N.div(N.mul(r, D(l, v)), l))));
        }
        break;
      }
      case "fn": {
        const u = a.a[0], du = D(u, v);
        const outer = dOuter(a, u);
        return simp(N.mul(outer, du));
      }
      case "fact": throw new MathError("مشتق فاکتوریل پشتیبانی نمی‌شود.");
    }
    throw new MathError("مشتق این عبارت پشتیبانی نمی‌شود.");
  }
  function dOuter(a, u) { /* derivative of f(u) with respect to u */
    const sq = x => N.pow(x, two());
    switch (a.n) {
      case "sin": return N.fn("cos", u);
      case "cos": return N.neg(N.fn("sin", u));
      case "tan": return sq(N.fn("sec", u));
      case "cot": return N.neg(sq(N.fn("csc", u)));
      case "sec": return N.mul(N.fn("sec", u), N.fn("tan", u));
      case "csc": return N.neg(N.mul(N.fn("csc", u), N.fn("cot", u)));
      case "asin": return N.div(one(), N.fn("sqrt", N.sub(one(), sq(u))));
      case "acos": return N.neg(N.div(one(), N.fn("sqrt", N.sub(one(), sq(u)))));
      case "atan": return N.div(one(), N.add(one(), sq(u)));
      case "sinh": return N.fn("cosh", u);
      case "cosh": return N.fn("sinh", u);
      case "tanh": return N.sub(one(), sq(N.fn("tanh", u)));
      case "ln": return N.div(one(), u);
      case "log": return N.div(one(), N.mul(u, N.fn("ln", N.num(q(10)))));
      case "exp": return N.fn("exp", u);
      case "sqrt": return N.div(one(), N.mul(two(), N.fn("sqrt", u)));
      case "cbrt": return N.div(one(), N.mul(N.num(q(3)), N.pow(N.fn("cbrt", u), two())));
      case "abs": return N.div(u, N.fn("abs", u));
      case "root": { const n = a.a[1]; return N.mul(N.div(one(), n), N.pow(u, simp(N.sub(N.div(one(), n), one())))); }
      case "sign": case "floor": case "ceil": return zero();
    }
    throw new MathError("مشتق تابع " + a.n + " پشتیبانی نمی‌شود.");
  }
  E.D = D;
  const RULE_FN = { sin: "(\\sin u)' = \\cos u \\cdot u'", cos: "(\\cos u)' = -\\sin u \\cdot u'", tan: "(\\tan u)' = \\sec^{2} u \\cdot u'", cot: "(\\cot u)' = -\\csc^{2} u \\cdot u'",
    sec: "(\\sec u)' = \\sec u \\tan u \\cdot u'", csc: "(\\csc u)' = -\\csc u \\cot u \\cdot u'", ln: "(\\ln u)' = \\frac{u'}{u}", log: "(\\log u)' = \\frac{u'}{u \\ln 10}",
    exp: "(e^{u})' = e^{u} \\cdot u'", sqrt: "(\\sqrt{u})' = \\frac{u'}{2\\sqrt{u}}", asin: "(\\arcsin u)' = \\frac{u'}{\\sqrt{1-u^{2}}}", acos: "(\\arccos u)' = -\\frac{u'}{\\sqrt{1-u^{2}}}",
    atan: "(\\arctan u)' = \\frac{u'}{1+u^{2}}", abs: "(|u|)' = \\frac{u}{|u|} \\cdot u'", sinh: "(\\sinh u)' = \\cosh u \\cdot u'", cosh: "(\\cosh u)' = \\sinh u \\cdot u'", cbrt: "(\\sqrt[3]{u})' = \\frac{u'}{3\\sqrt[3]{u^{2}}}" };
  const isSimpleTerm = (a, v) => !has(a, v) || a.t === "var" || (a.t === "bin" && a.op === "^" && a.l.t === "var" && !has(a.r, v)) || (a.t === "bin" && a.op === "*" && !has(a.l, v) && isSimpleTerm(a.r, v) && a.r.t !== "bin");

  function explainD(a, v, steps, depth = 0) {
    if (steps.length > 30 || !has(a, v)) return;
    const dd = x => ddx(v, x);
    const push = (title, rhs, note) => steps.push(step(title, dd(a) + " = " + rhs, note));
    if (a.t === "var") return;
    if (a.t === "neg") { push("قاعدهٔ ضریب ثابت", "-" + dd(a.a)); explainD(a.a, v, steps, depth + 1); return; }
    if (a.t === "bin") {
      const { l, r, op } = a;
      if (op === "+" || op === "-") {
        const terms = flatSum(a);
        push("قاعدهٔ جمع/تفریق", terms.map((t, i) => (i === 0 ? (t.s < 0 ? "-" : "") : (t.s < 0 ? " - " : " + ")) + dd(t.a)).join(""), "مشتق جمع، جمع مشتق‌هاست.");
        terms.forEach(t => explainD(t.a, v, steps, depth + 1)); return;
      }
      if (op === "*") {
        if (!has(l, v) || !has(r, v)) {
          const c = has(l, v) ? r : l, f = has(l, v) ? l : r;
          if (f.t === "var") { push("مشتق ضریب ثابت در " + v, T(c)); return; }
          push("قاعدهٔ ضریب ثابت", T(c) + " \\cdot " + dd(f), "ضریب ثابت بیرون از مشتق می‌ماند.");
          explainD(f, v, steps, depth + 1); return;
        }
        push("قاعدهٔ ضرب", dd(l) + " \\cdot " + paren(r) + " + " + paren(l) + " \\cdot " + dd(r), "(fg)' = f'g + fg'");
        explainD(l, v, steps, depth + 1); explainD(r, v, steps, depth + 1); return;
      }
      if (op === "/") {
        if (!has(r, v)) { push("قاعدهٔ ضریب ثابت", "\\frac{1}{" + T(r) + "} \\cdot " + dd(l)); explainD(l, v, steps, depth + 1); return; }
        push("قاعدهٔ تقسیم", "\\frac{" + dd(l) + " \\cdot " + paren(r) + " - " + paren(l) + " \\cdot " + dd(r) + "}{" + paren(r) + "^{2}}", "\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^{2}}");
        explainD(l, v, steps, depth + 1); explainD(r, v, steps, depth + 1); return;
      }
      if (op === "^") {
        if (!has(r, v)) {
          const n1 = simp(N.sub(r, one()));
          if (l.t === "var") { push("قاعدهٔ توان", T(r) + " " + T(N.pow(l, n1)), "(x^{n})' = n x^{n-1}"); return; }
          push("قاعدهٔ توان + قاعدهٔ زنجیره‌ای", T(r) + paren(l) + "^{" + T(n1) + "} \\cdot " + dd(l), "(u^{n})' = n u^{n-1} \\cdot u'");
          explainD(l, v, steps, depth + 1); return;
        }
        if (!has(l, v)) {
          if (l.t === "const" && l.n === "e") { push("مشتق تابع نمایی", T(a) + " \\cdot " + dd(r), "(e^{u})' = e^{u} \\cdot u'"); }
          else push("مشتق تابع نمایی", T(a) + " \\ln\\left(" + T(l) + "\\right) \\cdot " + dd(r), "(a^{u})' = a^{u} \\ln a \\cdot u'");
          if (r.t !== "var") explainD(r, v, steps, depth + 1); return;
        }
        push("مشتق‌گیری لگاریتمی", T(a) + "\\left(" + dd(r) + " \\ln\\left(" + T(l) + "\\right) + " + T(r) + "\\frac{" + dd(l) + "}{" + T(l) + "}\\right)", "f^{g} = e^{g \\ln f}");
        explainD(l, v, steps, depth + 1); explainD(r, v, steps, depth + 1); return;
      }
    }
    if (a.t === "fn") {
      const u = a.a[0];
      const outer = T(simp(dOuter(a, u)));
      if (u.t === "var") { push("مشتق تابع " + a.n, outer, RULE_FN[a.n] ? RULE_FN[a.n].replace(/u'/g, "1").replace(/ \\cdot 1/g, "") : null); return; }
      push("قاعدهٔ زنجیره‌ای", outer + " \\cdot " + dd(u), RULE_FN[a.n] || "(f(u))' = f'(u) \\cdot u'");
      explainD(u, v, steps, depth + 1);
    }
  }
  const paren = a => (a.t === "bin" && (a.op === "+" || a.op === "-")) || a.t === "neg" ? "\\left(" + T(a) + "\\right)" : T(a);
  function flatSum(a, s = 1) {
    if (a.t === "bin" && a.op === "+") return flatSum(a.l, s).concat(flatSum(a.r, s));
    if (a.t === "bin" && a.op === "-") return flatSum(a.l, s).concat(flatSum(a.r, -s));
    return [{ a, s }];
  }
  function canon(a) { /* polynomial sub-expressions in standard descending order */
    if (!a || typeof a !== "object") return a;
    if (a.t === "bin" && (a.op === "+" || a.op === "-")) { const m = E.toMPoly(a); if (m && m.termCount() > 1) return m.toAst(); }
    if (a.t === "bin") return { ...a, l: canon(a.l), r: canon(a.r) };
    if (a.t === "neg" || a.t === "fact") return { ...a, a: canon(a.a) };
    if (a.t === "fn") return { ...a, a: a.a.map(canon) };
    return a;
  }
  E.canon = canon;
  function nicest(a) {
    const whole = E.toMPoly(a);
    if (whole) { try { return pretty(whole.toAst()); } catch (e) { } }
    const cands = [pretty(simp(a))];
    try { cands.push(E.casAst("simplify(" + E.str(a) + ")")); } catch (e) { }
    try { cands.push(E.casAst(E.str(a))); } catch (e) { }
    const ok = cands.filter(c => E.equivalent(c, a) || E.vars(a).size === 0);
    const pool = (ok.length ? ok : cands).map(c => pretty(canon(c)));
    pool.sort((x, y) => T(x).length - T(y).length);
    return pool[0];
  }
  E.nicest = nicest;

  function derivativeSteps(a, v, order = 1) {
    v = v || E.pickVar([a]);
    const steps = [];
    let cur = a, res;
    for (let k = 1; k <= order; k++) {
      const sub = [];
      if (order > 1) steps.push(step("مشتق مرتبهٔ " + E.fa(k), k === 1 ? ddx(v, cur) : "\\frac{d}{d" + v + "}\\left[" + T(cur) + "\\right]", null));
      explainD(cur, v, sub);
      if (order > 1 && k > 1 && sub.length > 6) sub.splice(6);
      sub.forEach(s => steps.push(s));
      const raw = D(cur, v);
      res = nicest(raw);
      steps.push(step(order > 1 ? "نتیجهٔ مشتق مرتبهٔ " + E.fa(k) : "ساده‌سازی نتیجه", (k === 1 ? "f'(" + v + ")" : "f^{(" + k + ")}(" + v + ")") + " = " + T(res), null));
      cur = res;
    }
    const lab = order === 1 ? "\\frac{d}{d" + v + "}" : "\\frac{d^{" + order + "}}{d" + v + "^{" + order + "}}";
    return { answer: lab + "\\left[" + T(a) + "\\right] = " + T(res), result: res, steps, plot: { exprs: [a, res], v, labels: ["f", "f'"] } };
  }
  E.derivativeSteps = derivativeSteps;

  /* ======================= integral ======================= */
  const PLUS_C = " + C";
  const lnAbs = u => N.fn("ln", N.fn("abs", u));
  function linearParts(u, v) { /* u = a*v + b with a,b numeric -> [a,b] or null */
    const P = E.toPoly(u, v); if (!P || P.deg() !== 1) return null; return [P.co(1), P.co(0)];
  }
  /* table integral of f(u) du (returns AST in u) */
  function tableInt(a, v) {
    /* returns {r, rule} or null; a must depend on v */
    if (a.t === "var" && a.n === v) return { r: N.div(N.pow(a, two()), two()), rule: "\\int x\\,dx = \\frac{x^{2}}{2}" };
    if (a.t === "bin" && a.op === "^" && a.l.t === "var" && a.l.n === v && !has(a.r, v)) {
      const n = a.r, e = evalExact(n);
      if (e && e.eq(q(-1))) return { r: lnAbs(a.l), rule: "\\int x^{-1}\\,dx = \\ln|x|" };
      const n1 = simp(N.add(n, one()));
      return { r: N.div(N.pow(a.l, n1), n1), rule: "\\int x^{n}\\,dx = \\frac{x^{n+1}}{n+1}" };
    }
    if (a.t === "bin" && a.op === "/" && !has(a.l, v)) {
      const d = a.r;
      if (d.t === "var" && d.n === v) return { r: N.mul(a.l, lnAbs(d)), rule: "\\int \\frac{1}{x}\\,dx = \\ln|x|" };
      if (d.t === "bin" && d.op === "^" && d.l.t === "var" && d.l.n === v && !has(d.r, v)) { return tableInt(simp(N.mul(a.l, N.pow(d.l, simp(N.neg(d.r))))), v); }
      if (d.t === "fn" && d.n === "sqrt" && d.a[0].t === "var" && d.a[0].n === v) return { r: N.mul(simp(N.mul(two(), a.l)), N.fn("sqrt", d.a[0])), rule: "\\int \\frac{1}{\\sqrt{x}}\\,dx = 2\\sqrt{x}" };
      /* 1/(1+x^2) */
      const P = E.toPoly(d, v);
      if (P && P.deg() === 2 && P.co(1).isZero() && P.co(0).sign() > 0 && P.co(2).sign() > 0) {
        const A = P.co(2), C = P.co(0); /* ∫ k/(A x^2 + C) = k/sqrt(AC) atan(x sqrt(A/C)) */
        const k = evalExact(a.l);
        if (k) {
          const ac = E.qRoot(A.mul(C), q(1, 2)), ratio = E.qRoot(A.div(C), q(1, 2));
          if (ac && ratio) return { r: N.mul(N.num(k.div(ac)), N.fn("atan", simp(N.mul(N.num(ratio), N.v(v))))), rule: "\\int \\frac{dx}{a^{2}+x^{2}} = \\frac{1}{a}\\arctan\\frac{x}{a}" };
        }
      }
      if (d.t === "fn" && d.n === "sqrt") {
        const P2 = E.toPoly(d.a[0], v);
        if (P2 && P2.deg() === 2 && P2.co(1).isZero() && P2.co(2).eq(q(-1)) && P2.co(0).sign() > 0) {
          const s = E.qRoot(P2.co(0), q(1, 2)), k = evalExact(a.l);
          if (s && k) return { r: N.mul(N.num(k), N.fn("asin", simp(N.div(N.v(v), N.num(s))))), rule: "\\int \\frac{dx}{\\sqrt{a^{2}-x^{2}}} = \\arcsin\\frac{x}{a}" };
        }
      }
    }
    if (a.t === "bin" && a.op === "^" && !has(a.l, v) && a.r.t === "var" && a.r.n === v) {
      if (a.l.t === "const" && a.l.n === "e") return { r: a, rule: "\\int e^{x}\\,dx = e^{x}" };
      return { r: N.div(a, N.fn("ln", a.l)), rule: "\\int a^{x}\\,dx = \\frac{a^{x}}{\\ln a}" };
    }
    if (a.t === "fn" && a.a[0].t === "var" && a.a[0].n === v) {
      const x = a.a[0];
      switch (a.n) {
        case "sin": return { r: N.neg(N.fn("cos", x)), rule: "\\int \\sin x\\,dx = -\\cos x" };
        case "cos": return { r: N.fn("sin", x), rule: "\\int \\cos x\\,dx = \\sin x" };
        case "tan": return { r: N.neg(lnAbs(N.fn("cos", x))), rule: "\\int \\tan x\\,dx = -\\ln|\\cos x|" };
        case "cot": return { r: lnAbs(N.fn("sin", x)), rule: "\\int \\cot x\\,dx = \\ln|\\sin x|" };
        case "sec": return { r: lnAbs(N.add(N.fn("sec", x), N.fn("tan", x))), rule: "\\int \\sec x\\,dx = \\ln|\\sec x + \\tan x|" };
        case "csc": return { r: N.neg(lnAbs(N.add(N.fn("csc", x), N.fn("cot", x)))), rule: "\\int \\csc x\\,dx = -\\ln|\\csc x + \\cot x|" };
        case "exp": return { r: a, rule: "\\int e^{x}\\,dx = e^{x}" };
        case "sqrt": return { r: N.mul(N.num(q(2, 3)), N.pow(x, N.num(q(3, 2)))), rule: "\\int \\sqrt{x}\\,dx = \\frac{2}{3}x^{3/2}" };
        case "ln": return { r: N.sub(N.mul(x, N.fn("ln", x)), x), rule: "\\int \\ln x\\,dx = x\\ln x - x \\;(\\text{جزء‌به‌جزء})" };
        case "log": return { r: N.div(N.sub(N.mul(x, N.fn("ln", x)), x), N.fn("ln", N.num(q(10)))), rule: "\\int \\log x\\,dx = \\frac{x\\ln x - x}{\\ln 10}" };
        case "sinh": return { r: N.fn("cosh", x), rule: "\\int \\sinh x\\,dx = \\cosh x" };
        case "cosh": return { r: N.fn("sinh", x), rule: "\\int \\cosh x\\,dx = \\sinh x" };
        case "atan": return { r: N.sub(N.mul(x, N.fn("atan", x)), N.div(N.fn("ln", N.add(one(), N.pow(x, two()))), two())), rule: "\\int \\arctan x\\,dx = x\\arctan x - \\tfrac12\\ln(1+x^{2})" };
      }
    }
    /* sec^2 x, csc^2 x, sec x tan x */
    if (a.t === "bin" && a.op === "^" && a.l.t === "fn" && a.l.a[0].t === "var" && a.l.a[0].n === v && evalExact(a.r) && evalExact(a.r).eq(q(2))) {
      const x = a.l.a[0];
      if (a.l.n === "sec") return { r: N.fn("tan", x), rule: "\\int \\sec^{2} x\\,dx = \\tan x" };
      if (a.l.n === "csc") return { r: N.neg(N.fn("cot", x)), rule: "\\int \\csc^{2} x\\,dx = -\\cot x" };
      if (a.l.n === "sin") return { r: N.sub(N.div(x, two()), N.div(N.fn("sin", N.mul(two(), x)), N.num(q(4)))), rule: "\\sin^{2}x = \\frac{1-\\cos 2x}{2}" };
      if (a.l.n === "cos") return { r: N.add(N.div(x, two()), N.div(N.fn("sin", N.mul(two(), x)), N.num(q(4)))), rule: "\\cos^{2}x = \\frac{1+\\cos 2x}{2}" };
      if (a.l.n === "tan") return { r: N.sub(N.fn("tan", x), x), rule: "\\tan^{2}x = \\sec^{2}x - 1" };
    }
    if (a.t === "bin" && a.op === "*" && a.l.t === "fn" && a.r.t === "fn" && a.l.a[0].t === "var" && E.eqAst(a.l.a[0], a.r.a[0])) {
      const names = [a.l.n, a.r.n].sort().join(",");
      if (names === "sec,tan") return { r: N.fn("sec", a.l.a[0]), rule: "\\int \\sec x\\tan x\\,dx = \\sec x" };
      if (names === "cot,csc") return { r: N.neg(N.fn("csc", a.l.a[0])), rule: "\\int \\csc x\\cot x\\,dx = -\\csc x" };
      if (names === "cos,sin") return { r: N.div(N.pow(N.fn("sin", a.l.a[0]), two()), two()), rule: "\\int \\sin x\\cos x\\,dx = \\frac{\\sin^{2}x}{2}" };
    }
    return null;
  }
  /* split numeric/constant coefficient: a = c * f */
  function splitConst(a, v) {
    if (a.t === "neg") { const [c, f] = splitConst(a.a, v); return [simp(N.neg(c)), f]; }
    if (a.t === "bin" && a.op === "*") {
      if (!has(a.l, v)) { const [c, f] = splitConst(a.r, v); return [simp(N.mul(a.l, c)), f]; }
      if (!has(a.r, v)) { const [c, f] = splitConst(a.l, v); return [simp(N.mul(a.r, c)), f]; }
    }
    if (a.t === "bin" && a.op === "/" && !has(a.r, v)) { const [c, f] = splitConst(a.l, v); return [simp(N.div(c, a.r)), f]; }
    if (a.t === "bin" && a.op === "/" && !has(a.l, v) && !(a.l.t === "num" && a.l.q.isOne())) return [a.l, N.div(one(), a.r)];
    return [one(), a];
  }
  /* factor list of a product/quotient: [{a, e}] where e = +1 or -1 power, plus numeric coefficient */
  function factorsOf(a, v, sign = 1, out = { c: one(), f: [] }) {
    if (!has(a, v)) { out.c = simp(sign > 0 ? N.mul(out.c, a) : N.div(out.c, a)); return out; }
    if (a.t === "bin" && a.op === "*") { factorsOf(a.l, v, sign, out); factorsOf(a.r, v, sign, out); return out; }
    if (a.t === "bin" && a.op === "/") { factorsOf(a.l, v, sign, out); factorsOf(a.r, v, -sign, out); return out; }
    if (a.t === "neg") { out.c = simp(N.neg(out.c)); factorsOf(a.a, v, sign, out); return out; }
    out.f.push({ a, e: sign }); return out;
  }
  function rebuild(c, fs) {
    let num = null, den = null;
    fs.forEach(({ a, e }) => { if (e > 0) num = num ? N.mul(num, a) : a; else den = den ? N.mul(den, a) : a; });
    let r = num || one(); if (den) r = N.div(r, den);
    return simp(N.mul(c, r));
  }
  const propConst = (f, g, v) => { /* f/g constant? returns AST constant or null */
    const pts = [0.37, 1.21, 2.43, -0.83, 3.7]; let k = null;
    for (const t of pts) { let x, y; try { x = evalNum(f, { [v]: t }); y = evalNum(g, { [v]: t }); } catch (e) { return null; } if (!Number.isFinite(x) || !Number.isFinite(y) || y === 0) continue; const r = x / y; if (k === null) k = r; else if (Math.abs(r - k) > 1e-9 * Math.max(1, Math.abs(k))) return null; }
    if (k === null) return null;
    const kq = Q.fromNumber(Math.round(k * 1e9) / 1e9); return N.num(kq);
  };

  function integrate(a, v, steps, depth = 0) {
    if (depth > 8) return null;
    a = simp(a);
    if (!has(a, v)) { steps.push(step("انتگرال عدد ثابت", "\\int " + T(a) + "\\,d" + v + " = " + T(a) + v, "\\int k\\,dx = kx")); return simp(N.mul(a, N.v(v))); }
    /* sums */
    if (a.t === "bin" && (a.op === "+" || a.op === "-")) {
      const terms = flatSum(a);
      if (depth === 0 || terms.length > 1) steps.push(step("خاصیت خطی انتگرال", "\\int \\left(" + T(a) + "\\right) d" + v + " = " + terms.map((t, i) => (i === 0 ? (t.s < 0 ? "-" : "") : (t.s < 0 ? " - " : " + ")) + "\\int " + paren(t.a) + "\\,d" + v).join(""), "انتگرال جمع، جمع انتگرال‌هاست."));
      let res = null;
      for (const t of terms) { const r = integrate(t.a, v, steps, depth + 1); if (!r) return null; res = res ? (t.s < 0 ? N.sub(res, r) : N.add(res, r)) : (t.s < 0 ? N.neg(r) : r); }
      return simp(res);
    }
    /* constants out */
    const [c, f] = splitConst(a, v);
    if (!(c.t === "num" && c.q.isOne())) {
      steps.push(step("بیرون آوردن ضریب ثابت", "\\int " + T(a) + "\\,d" + v + " = " + T(c) + " \\int " + paren(f) + "\\,d" + v, "\\int k f(x)\\,dx = k\\int f(x)\\,dx"));
      const r = integrate(f, v, steps, depth + 1); return r && simp(N.mul(c, r));
    }
    /* table */
    const t = tableInt(a, v);
    if (t) { steps.push(step("فرمول انتگرال پایه", "\\int " + T(a) + "\\,d" + v + " = " + T(t.r), t.rule)); return t.r; }
    /* polynomial / rational in v */
    const R = E.toRat(a, v);
    if (R) {
      if (R.isPoly()) {
        const P = R.n, expanded = P.toAst(v);
        if (!E.eqAst(expanded, a)) { steps.push(step("بسط چندجمله‌ای", "\\int " + T(a) + "\\,d" + v + " = \\int \\left(" + T(expanded) + "\\right)d" + v, null)); return integrate(expanded, v, steps, depth + 1); }
      } else {
        const red = R.reduce();
        let [quo, rem] = red.n.divmod(red.d);
        if (!quo.isZero()) {
          steps.push(step("تقسیم چندجمله‌ای", "\\frac{" + red.n.tex(v) + "}{" + red.d.tex(v) + "} = " + quo.tex(v) + (rem.isZero() ? "" : " + \\frac{" + rem.tex(v) + "}{" + red.d.tex(v) + "}"), "درجهٔ صورت از مخرج کمتر نیست؛ ابتدا تقسیم می‌کنیم."));
          const whole = rem.isZero() ? quo.toAst(v) : N.add(quo.toAst(v), N.div(rem.toAst(v), red.d.toAst(v)));
          return integrate(whole, v, steps, depth + 1);
        }
        /* partial fractions */
        if (red.d.deg() >= 2) {
          try {
            const pf = E.casAst("partfrac(" + E.str(N.div(red.n.toAst(v), red.d.toAst(v))) + "," + v + ")");
            const pfTerms = flatSum(pf);
            if (pfTerms.length > 1) {
              steps.push(step("تجزیه به کسرهای جزئی", "\\frac{" + red.n.tex(v) + "}{" + red.d.tex(v) + "} = " + T(pf), "مخرج را تجزیه می‌کنیم و کسر را به مجموع کسرهای ساده‌تر می‌شکنیم."));
              return integrate(pf, v, steps, depth + 1);
            }
          } catch (e) { }
        }
      }
    }
    /* linear substitution f(a x + b) */
    const ls = linearSub(a, v, steps, depth); if (ls) return ls;
    /* u-substitution */
    const us = uSub(a, v, steps, depth); if (us) return us;
    /* integration by parts */
    const bp = byParts(a, v, steps, depth); if (bp) return bp;
    return null;
  }
  function linearSub(a, v, steps, depth) {
    let inner = null;
    const cand = n => {
      if (n.t === "fn" && n.a[0] && has(n.a[0], v)) return n.a[0];
      if (n.t === "bin" && n.op === "^" && has(n.l, v) && !has(n.r, v)) return n.l;
      if (n.t === "bin" && n.op === "^" && !has(n.l, v) && has(n.r, v)) return n.r;
      if (n.t === "bin" && n.op === "/" && !has(n.l, v)) return cand(n.r) || (has(n.r, v) ? n.r : null);
      return null;
    };
    inner = cand(a);
    if (!inner || inner.t === "var") return null;
    const lp = linearParts(inner, v); if (!lp) return null;
    const [k] = lp;
    const U = "u";
    const g = E.subst(replaceAst(a, inner, N.v("__u")), "__u", N.v(U));
    if (has(g, v)) return null;
    const sub = [];
    const r = integrate(g, U, sub, depth + 1); if (!r) return null;
    steps.push(step("جایگذاری خطی", "u = " + T(inner) + ",\\quad du = " + k.toTeX() + "\\,d" + v + " \\;\\Rightarrow\\; d" + v + " = \\frac{du}{" + k.toTeX() + "}", "عبارت داخلی خطی است."));
    sub.forEach(s => steps.push(s));
    const res = simp(N.mul(N.num(k.inv()), E.subst(r, U, inner)));
    steps.push(step("بازگشت به متغیر " + v, "\\frac{1}{" + k.toTeX() + "}\\left(" + T(r) + "\\right)\\Big|_{u = " + T(inner) + "} = " + T(res), null));
    return res;
  }
  function replaceAst(a, target, rep) {
    if (E.eqAst(a, target)) return rep;
    if (a.t === "bin") return { ...a, l: replaceAst(a.l, target, rep), r: replaceAst(a.r, target, rep) };
    if (a.t === "neg" || a.t === "fact") return { ...a, a: replaceAst(a.a, target, rep) };
    if (a.t === "fn") return { ...a, a: a.a.map(x => replaceAst(x, target, rep)) };
    return a;
  }
  function innerCandidates(a, v, out = []) {
    if (a.t === "fn") { if (has(a.a[0], v) && a.a[0].t !== "var") out.push(a.a[0]); innerCandidates(a.a[0], v, out); if (a.n !== "abs") out.push(a); }
    else if (a.t === "bin") {
      if (a.op === "^" && has(a.l, v) && a.l.t !== "var") out.push(a.l);
      if (a.op === "^" && has(a.r, v) && a.r.t !== "var") out.push(a.r);
      if (a.op === "/" && has(a.r, v)) out.push(a.r);
      innerCandidates(a.l, v, out); innerCandidates(a.r, v, out);
    } else if (a.t === "neg") innerCandidates(a.a, v, out);
    return out;
  }
  function uSub(a, v, steps, depth) {
    const cands = innerCandidates(a, v).filter((c, i, arr) => arr.findIndex(x => E.eqAst(x, c)) === i);
    for (const u of cands) {
      const du = D(u, v);
      if (!has(du, v) && false) continue;
      const fa_ = factorsOf(a, v), fd = factorsOf(du, v);
      let c = simp(N.div(fa_.c, fd.c)); const rest = fa_.f.slice(); let ok = true;
      for (const g of fd.f) {
        const idx = rest.findIndex(f => f.e === g.e && propConst(f.a, g.a, v));
        if (idx < 0) {
          /* du factor might be the reciprocal of a power factor */ ok = false; break;
        }
        c = simp(N.mul(c, propConst(rest[idx].a, g.a, v))); rest.splice(idx, 1);
      }
      if (!ok) continue;
      let g = rebuild(c, rest);
      g = replaceAst(g, u, N.v("__u"));
      /* allow u^n patterns: if u appears as power base */
      if (has(g, v)) {
        /* try writing g in terms of u when u is polynomial: e.g. x^2 when u = x^2+1 */
        continue;
      }
      g = E.subst(g, "__u", N.v("u"));
      const sub = [];
      const r = integrate(g, "u", sub, depth + 1); if (!r) continue;
      steps.push(step("جایگذاری (تغییر متغیر)", "u = " + T(u) + ",\\quad du = " + T(nicest(du)) + "\\,d" + v, "مشتق عبارت داخلی (یا مضربی از آن) در انتگرال‌ده دیده می‌شود."));
      steps.push(step("انتگرال برحسب u", "\\int " + T(g) + "\\,du", null));
      sub.forEach(s => steps.push(s));
      const res = E.subst(r, "u", u);
      steps.push(step("بازگشت به متغیر " + v, T(r) + "\\Big|_{u = " + T(u) + "} = " + T(res), null));
      return res;
    }
    return null;
  }
  function byParts(a, v, steps, depth) {
    if (depth > 5) return null;
    const fs = factorsOf(a, v);
    if (fs.f.length < 1 || fs.f.some(f => f.e < 0)) return null;
    const rank = f => { /* LIATE: lower -> choose as u first */
      const x = f.a;
      if (x.t === "fn" && (x.n === "ln" || x.n === "log")) return 0;
      if (x.t === "fn" && (x.n === "atan" || x.n === "asin" || x.n === "acos")) return 1;
      if (E.toPoly(x, v)) return 2;
      if (x.t === "fn" && ["sin", "cos", "tan", "sec"].includes(x.n)) return 3;
      return 4;
    };
    const sorted = fs.f.slice().sort((p, r) => rank(p) - rank(r));
    if (fs.f.length === 1 && rank(sorted[0]) > 1) return null;
    const u = sorted[0].a;
    const dvParts = sorted.slice(1);
    const dv = dvParts.length ? rebuild(fs.c, dvParts) : fs.c;
    if (rank(sorted[0]) === 2 && dvParts.every(p => rank(p) === 2)) return null;
    const sub = [];
    const V = integrate(dv, v, sub, depth + 2); if (!V) return null;
    const du = D(u, v);
    const Vn = nicest(V);
    steps.push(step("انتگرال جزء‌به‌جزء", "u = " + T(u) + ",\\; dv = " + T(dv) + "\\,d" + v + " \\;\\Rightarrow\\; du = " + T(nicest(du)) + "\\,d" + v + ",\\; v = " + T(Vn), "\\int u\\,dv = uv - \\int v\\,du \\quad (\\text{انتخاب u با قاعدهٔ LIATE})"));
    const inner = simp(N.mul(Vn, du));
    const sub2 = [];
    const W = integrate(nicest(inner), v, sub2, depth + 1); if (!W) return null;
    steps.push(step("اعمال فرمول", "\\int " + T(a) + "\\,d" + v + " = " + T(simp(N.mul(u, Vn))) + " - \\int " + paren(nicest(inner)) + "\\,d" + v, null));
    sub2.slice(0, 8).forEach(s => steps.push(s));
    return simp(N.sub(N.mul(u, Vn), W));
  }

  function integralSteps(a, v, bounds) {
    v = v || E.pickVar([a]);
    const steps = [];
    let F = integrate(a, v, steps, 0), method = "steps";
    if (F) { if (!E.equivalent(D(F, v), a, [v])) { F = null; steps.length = 0; } }
    if (!F) {
      try {
        const r = E.casAst("integrate(" + E.str(a) + "," + v + ")");
        if (/integrate/.test(E.str(r)) || E.str(r).includes("integrate")) throw new Error("no");
        F = r; method = "cas";
        steps.push(step("محاسبهٔ انتگرال", "\\int " + T(a) + "\\,d" + v + " = " + T(F), "این انتگرال با روش‌های پیشرفته (موتور نمادین) محاسبه شد؛ درستی آن با مشتق‌گیری بررسی می‌شود."));
      } catch (e) { F = null; }
    }
    if (F && !E.equivalent(D(F, v), a, [v])) { if (method === "cas") F = null; }
    if (bounds) return definite(a, v, F, bounds, steps);
    if (!F) throw new MathError("پاد‌مشتق این تابع به شکل بسته پیدا نشد. می‌توانی انتگرال معین آن را به‌صورت عددی حساب کنی.");
    const Fn = dropLnConst(nicest(F));
    steps.push(step("ساده‌سازی و افزودن ثابت", "\\int " + paren(a) + "\\,d" + v + " = " + T(Fn) + PLUS_C, null));
    steps.push(step("بررسی با مشتق‌گیری", "\\frac{d}{d" + v + "}\\left[" + T(Fn) + "\\right] = " + T(a) + " \\;\\checkmark", "مشتق جواب باید با انتگرال‌ده برابر باشد."));
    return { answer: "\\int " + paren(a) + "\\,d" + v + " = " + T(Fn) + PLUS_C, result: Fn, steps, plot: { exprs: [a, Fn], v, labels: ["f", "F"] } };
  }
  function dropLnConst(a) { /* ln|k*u| = ln|u| + const  -> absorbed in C */
    if (!a || typeof a !== "object") return a;
    if (a.t === "fn" && a.n === "ln" && a.a[0].t === "fn" && a.a[0].n === "abs") {
      const u = a.a[0].a[0];
      if (u.t === "bin" && u.op === "*" && u.l.t === "num" && !E.vars(u.l).size) return N.fn("ln", N.fn("abs", u.r));
    }
    if (a.t === "bin") return { ...a, l: dropLnConst(a.l), r: dropLnConst(a.r) };
    if (a.t === "neg") return { ...a, a: dropLnConst(a.a) };
    if (a.t === "fn") return { ...a, a: a.a.map(dropLnConst) };
    return a;
  }
  function simpson(f, a, b, n = 2000) {
    if (n % 2) n++; const h = (b - a) / n; let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
    return s * h / 3;
  }
  E.simpson = simpson;
  function definite(a, v, F, [lo, hi], steps) {
    const fnum = E.compile(a, v);
    const lv = evalNum(lo), hv = evalNum(hi);
    const infinite = !Number.isFinite(lv) || !Number.isFinite(hv);
    /* singularity scan */
    if (!infinite) { const N1 = 400; for (let i = 0; i <= N1; i++) { const x = lv + (hv - lv) * i / N1, y = fnum(x); if (!Number.isFinite(y) && i > 0 && i < N1) { steps.push(step("هشدار ناپیوستگی", "", "انتگرال‌ده در بازه ناپیوستگی یا مجانب دارد؛ انتگرال ممکن است ناسره یا واگرا باشد.")); break; } } }
    const head = "\\int_{" + T(lo) + "}^{" + T(hi) + "} " + T(a) + "\\,d" + v;
    let exact = null, value;
    if (F && !infinite) {
      const Fn = nicest(F);
      steps.push(step("قضیهٔ اساسی حسابان", head + " = \\Big[" + T(Fn) + "\\Big]_{" + T(lo) + "}^{" + T(hi) + "} = F\\left(" + T(hi) + "\\right) - F\\left(" + T(lo) + "\\right)", "\\int_a^b f(x)\\,dx = F(b) - F(a)"));
      const Fb = E.subst(Fn, v, hi), Fa = E.subst(Fn, v, lo);
      try { exact = nicest(N.sub(Fb, Fa)); } catch (e) { exact = null; }
      value = evalNum(Fb) - evalNum(Fa);
      if (exact && E.vars(exact).size === 0 && Math.abs(evalNum(exact) - value) < 1e-8 * Math.max(1, Math.abs(value))) steps.push(step("جایگذاری حدود", "\\left(" + T(Fb) + "\\right) - \\left(" + T(Fa) + "\\right) = " + T(exact), null));
      else exact = null;
    }
    if (infinite && F) {
      const Fn = nicest(F);
      const lim = (bAst) => { const bv = evalNum(bAst); if (Number.isFinite(bv)) { const r = nicest(E.subst(Fn, v, bAst)); return { ast: r, val: evalNum(r) }; } const nv = E.compile(Fn, v)(Math.sign(bv) * 1e8); try { const r = E.casAst("limit(" + E.str(Fn) + "," + v + "," + E.str(bAst) + ")"); const rv = evalNum(r); if (!E.vars(r).size && (Math.abs(rv - nv) < 1e-4 * Math.max(1, Math.abs(nv)) || (!Number.isFinite(rv) && Math.sign(rv) === Math.sign(nv)))) return { ast: Number.isFinite(rv) ? r : null, val: rv }; } catch (e) { } const f_ = E.compile(Fn, v), n1 = f_(Math.sign(bv) * 1e6), n2 = f_(Math.sign(bv) * 1e12); if (Math.abs(nv) > 1e6 || (Number.isFinite(n2) && Math.abs(n2 - n1) > 1e-6 * Math.max(1, Math.abs(n2)))) return { val: Math.sign(n2 || nv) * Infinity }; return { val: nv }; };
      const Fb = lim(hi), Fa = lim(lo);
      steps.push(step("انتگرال ناسره به‌صورت حد", head + " = \\lim_{b\\to" + T(Number.isFinite(hv) ? lo : hi) + "} \\Big[" + T(Fn) + "\\Big]", "کران بی‌نهایت را با حد جایگزین می‌کنیم."));
      value = Fb.val - Fa.val;
      if (!Number.isFinite(value)) { steps.push(step("واگرایی", "", "حد متناهی نیست؛ انتگرال واگراست.")); return { answer: head + " = " + (value > 0 ? "\\infty" : "-\\infty") + "\\;(\\text{واگرا})", steps, value }; }
      try { exact = nicest(N.sub(Fb.ast || E.parse(String(Fb.val)), Fa.ast || E.parse(String(Fa.val)))); } catch (e) { exact = null; }
      if (exact && Math.abs(evalNum(exact) - value) > 1e-6) exact = null;
      steps.push(step("محاسبهٔ حدها", "F(" + T(hi) + ") - F(" + T(lo) + ") = " + E.trimNum(Fb.val, 6) + " - " + E.trimNum(Fa.val, 6) + " = " + (exact ? T(exact) : E.trimNum(value, 6)), null));
    } else if (infinite) {
      try { const r = E.casAst("defint(" + E.str(a) + "," + v + "," + E.str(lo) + "," + E.str(hi) + ")"); exact = r; value = evalNum(r); steps.push(step("انتگرال ناسره", head + " = \\lim_{b\\to\\infty}\\int^{b} \\cdots = " + T(r), "حد انتگرال معین وقتی کران به بی‌نهایت میل می‌کند.")); }
      catch (e) { throw new MathError("محاسبهٔ این انتگرال ناسره ممکن نشد."); }
    }
    const num = infinite ? value : simpson(fnum, lv, hv);
    if (value === undefined || !Number.isFinite(value)) { value = num; steps.push(step("محاسبهٔ عددی (روش سیمپسون)", head + " \\approx " + E.trimNum(num, 8), "پاد‌مشتق بسته پیدا نشد؛ مقدار با روش عددی سیمپسون تقریب زده شد.")); }
    else if (!infinite && Math.abs(num - value) > 1e-5 * Math.max(1, Math.abs(value))) steps.push(step("هشدار", "", "مقدار عددی (" + E.trimNum(num, 6) + ") با مقدار دقیق تفاوت دارد؛ ممکن است انتگرال ناسره باشد."));
    const ans = head + (exact ? " = " : " ") + (exact ? T(exact) + (exact.t === "num" && exact.q.isInt() ? "" : " \\approx " + E.trimNum(value, 6)) : "\\approx " + E.trimNum(value, 8));
    return { answer: ans, value, steps, plot: { exprs: [a], v, area: [lv, hv] } };
  }
  E.integralSteps = integralSteps;

  /* ======================= limits ======================= */
  function evalAt(a, v, p) { /* exact if possible */
    const s = E.subst(a, v, p);
    const ex = evalExact(s); if (ex) return { ast: N.num(ex), val: ex.num(), exact: true };
    let val; try { val = evalNum(s); } catch (e) { val = NaN; }
    return { ast: Number.isFinite(val) ? (function () { try { const c = nicest(s); return E.vars(c).size ? N.fl(val) : c; } catch (e) { return N.fl(val); } })() : null, val };
  }
  function numericLimit(a, v, p, side) {
    const f = E.compile(a, v);
    if (!Number.isFinite(p)) { const s = Math.sign(p); const xs = [1e3, 1e5, 1e7].map(x => s * x); const ys = xs.map(f); return { val: ys[2], trend: ys }; }
    const hs = [1e-3, 1e-5, 1e-7];
    const L = hs.map(h => f(p - h)), R = hs.map(h => f(p + h));
    return { left: L[2], right: R[2], L, R };
  }
  const isQuot = a => a.t === "bin" && a.op === "/";
  function limitSteps(a, v, pointAst, side) {
    v = v || E.pickVar([a]);
    const steps = [];
    const p = evalNum(pointAst), inf = !Number.isFinite(p);
    const head = "\\lim_{" + v + " \\to " + T(pointAst) + (side ? "^{" + side + "}" : "") + "} " + T(a);
    const fin = (res, note) => ({ answer: head + " = " + res, steps, plot: { exprs: [a], v, mark: inf ? null : p }, note });
    const verifyText = (val) => {
      const n = numericLimit(a, v, p, side);
      if (inf) return Number.isFinite(n.val) ? E.trimNum(n.val, 6) : "";
      return "";
    };
    if (!inf) {
      const d = evalAt(a, v, pointAst);
      if (d.ast && Number.isFinite(d.val) && !hasDisc(a, v, p)) {
        steps.push(step("جایگذاری مستقیم", head + " = " + T(E.subst(a, v, pointAst)) + " = " + T(d.ast), "تابع در این نقطه پیوسته است؛ مقدار را مستقیم جایگذاری می‌کنیم."));
        return fin(T(d.ast) + (d.ast.t === "num" && d.ast.q.isInt() ? "" : (d.ast.t === "fl" ? "" : " \\approx " + E.trimNum(d.val, 6))));
      }
    }
    /* rational function */
    const R = E.toRat(a, v);
    if (R && !R.isPoly()) {
      if (inf) {
        const dn = R.n.deg(), dd = R.d.deg();
        steps.push(step("مقایسهٔ درجه‌ها", "\\deg(\\text{صورت}) = " + dn + ",\\quad \\deg(\\text{مخرج}) = " + dd, "صورت و مخرج را بر بزرگ‌ترین توان " + v + " در مخرج تقسیم می‌کنیم."));
        if (dn < dd) { steps.push(step("درجهٔ صورت کمتر است", head + " = 0", "جمله‌های تقسیم بر توان‌های " + v + " به صفر میل می‌کنند.")); return fin("0"); }
        if (dn === dd) { const r = R.n.lead().div(R.d.lead()); steps.push(step("درجه‌ها برابرند", head + " = \\frac{" + R.n.lead().toTeX() + "}{" + R.d.lead().toTeX() + "} = " + r.toTeX(), "حد برابر نسبت ضریب‌های بزرگ‌ترین توان است.")); return fin(r.toTeX()); }
        const s = Math.sign(R.n.lead().num() / R.d.lead().num()) * (p > 0 ? 1 : ((dn - dd) % 2 ? -1 : 1));
        steps.push(step("درجهٔ صورت بیشتر است", head + " = " + (s > 0 ? "\\infty" : "-\\infty"), "صورت سریع‌تر رشد می‌کند؛ حد بی‌نهایت است."));
        return fin(s > 0 ? "\\infty" : "-\\infty");
      }
      const nv = R.n.evalN(p), dv = R.d.evalN(p);
      if (Math.abs(nv) < 1e-12 && Math.abs(dv) < 1e-12) {
        steps.push(step("حالت مبهم ۰/۰", "\\frac{" + R.n.tex(v) + "}{" + R.d.tex(v) + "} \\;\\to\\; \\frac{0}{0}", "با جایگذاری مستقیم صورت و مخرج هر دو صفر می‌شوند."));
        const nf = E.factorPoly(R.n, v, []), df = E.factorPoly(R.d, v, []);
        const red = R.reduce();
        steps.push(step("تجزیه و حذف عامل مشترک", "\\frac{" + E.factorsTex(nf.k, nf.factors, v) + "}{" + E.factorsTex(df.k, df.factors, v) + "} = \\frac{" + red.n.tex(v) + "}{" + red.d.tex(v) + "}", "عامل صفرکننده از صورت و مخرج حذف می‌شود (" + v + " ≠ " + T(pointAst) + ")."));
        const sub = limitSteps(red.d.isConst() ? red.n.scale(red.d.co(0).inv()).toAst(v) : N.div(red.n.toAst(v), red.d.toAst(v)), v, pointAst, side);
        sub.steps.forEach(s => steps.push(s));
        return fin(sub.answer.split(" = ").slice(1).join(" = "));
      }
      if (Math.abs(dv) < 1e-12) return infiniteSide(a, v, p, steps, head, fin, side);
    }
    /* L'Hôpital */
    if (isQuot(a)) {
      let num = a.l, den = a.r, k = 0;
      while (k < 4) {
        const nv = inf ? numericLimit(num, v, p).val : safe(() => evalNum(E.subst(num, v, pointAst)));
        const dv = inf ? numericLimit(den, v, p).val : safe(() => evalNum(E.subst(den, v, pointAst)));
        const zz = Math.abs(nv) < 1e-9 && Math.abs(dv) < 1e-9, ii = !Number.isFinite(nv) && !Number.isFinite(dv) && !isNaN(nv) && !isNaN(dv);
        const iiInf = inf && Math.abs(nv) > 1e6 && Math.abs(dv) > 1e6;
        if (!(zz || ii || iiInf)) break;
        steps.push(step("قاعدهٔ هوپیتال" + (k ? " (دوباره)" : ""), "\\text{حالت } " + (zz ? "\\frac{0}{0}" : "\\frac{\\infty}{\\infty}") + " \\;\\Rightarrow\\; \\lim \\frac{f}{g} = \\lim \\frac{f'}{g'} = \\lim \\frac{" + T(nicest(D(num, v))) + "}{" + T(nicest(D(den, v))) + "}", "از صورت و مخرج جداگانه مشتق می‌گیریم."));
        num = nicest(D(num, v)); den = nicest(D(den, v)); k++;
      }
      if (k) {
        const sub = limitSteps(nicest(N.div(num, den)), v, pointAst, side);
        sub.steps.forEach(s => steps.push(s));
        return fin(sub.answer.split(" = ").slice(1).join(" = "));
      }
    }
    if (!inf) {
      const n = numericLimit(a, v, p);
      if (!Number.isFinite(n.left) || !Number.isFinite(n.right) || Math.abs(n.left) > 1e6 || Math.abs(n.right) > 1e6) return infiniteSide(a, v, p, steps, head, fin, side);
    }
    /* CAS fallback with numeric check */
    try {
      const r = E.casAst("limit(" + E.str(a) + "," + v + "," + E.str(pointAst) + ")");
      steps.push(step("محاسبهٔ حد", head + " = " + T(r), "با روش‌های جبری پیشرفته؛ مقدار با محاسبهٔ عددی نزدیک نقطه تأیید شد."));
      const chk = numericLimit(a, v, p);
      const val = inf ? chk.val : (side === "-" ? chk.left : side === "+" ? chk.right : (chk.left + chk.right) / 2);
      if (Number.isFinite(val) && E.vars(r).size === 0 && Math.abs(evalNum(r) - val) > 1e-3 * Math.max(1, Math.abs(val))) throw new Error("mismatch");
      return fin(T(r));
    } catch (e) {
      const chk = numericLimit(a, v, p);
      const val = inf ? chk.val : (side === "-" ? chk.left : side === "+" ? chk.right : chk.left);
      if (!inf && !side && Math.abs(chk.left - chk.right) > 1e-4 * Math.max(1, Math.abs(chk.left))) { steps.push(step("حد چپ و راست", "\\lim^{-} \\approx " + E.trimNum(chk.left, 6) + ",\\quad \\lim^{+} \\approx " + E.trimNum(chk.right, 6), "حدهای چپ و راست برابر نیستند؛ حد وجود ندارد.")); return fin("\\text{وجود ندارد}"); }
      steps.push(step("تقریب عددی", head + " \\approx " + E.trimNum(val, 6), "با محاسبهٔ مقدار تابع در نقاط بسیار نزدیک."));
      return fin("\\approx " + E.trimNum(val, 6), "مقدار تقریبی است.");
    }
  }
  const safe = f => { try { return f(); } catch (e) { return NaN; } };
  function hasDisc(a, v, p) { const f = E.compile(a, v); const y0 = f(p), y1 = f(p - 1e-7), y2 = f(p + 1e-7); return !Number.isFinite(y0) || Math.abs(y1 - y2) > 1e-3 * Math.max(1, Math.abs(y0)); }
  function infiniteSide(a, v, p, steps, head, fin, side) {
    const n = numericLimit(a, v, p);
    const sg = x => x > 1e6 ? "\\infty" : x < -1e6 ? "-\\infty" : E.trimNum(x, 6);
    const L = sg(n.left), R = sg(n.right);
    steps.push(step("بررسی حدهای یک‌طرفه", "\\lim_{" + v + "\\to " + E.trimNum(p) + "^{-}} = " + L + ",\\quad \\lim_{" + v + "\\to " + E.trimNum(p) + "^{+}} = " + R, "مخرج صفر و صورت ناصفر است؛ تابع در این نقطه مجانب قائم دارد."));
    if (side === "-") return fin(L); if (side === "+") return fin(R);
    if (L === R) return fin(L);
    return fin("\\text{وجود ندارد}", "حدهای چپ و راست برابر نیستند.");
  }
  E.limitSteps = limitSteps;

  /* ======================= applications ======================= */
  function tangentSteps(a, v, x0Ast) {
    v = v || E.pickVar([a]);
    const steps = [];
    const x0 = evalNum(x0Ast);
    const y0 = nicest(E.subst(a, v, x0Ast));
    steps.push(step("مقدار تابع در نقطه", "f\\left(" + T(x0Ast) + "\\right) = " + T(y0), null));
    const d = nicest(D(a, v));
    steps.push(step("مشتق تابع", "f'(" + v + ") = " + T(d), null));
    const m = nicest(E.subst(d, v, x0Ast));
    steps.push(step("شیب خط مماس", "m = f'\\left(" + T(x0Ast) + "\\right) = " + T(m), "شیب مماس برابر مقدار مشتق در نقطه است."));
    const line = nicest(N.add(N.mul(m, N.sub(N.v(v), x0Ast)), y0));
    steps.push(step("معادلهٔ نقطه-شیب", "y - " + paren(y0) + " = " + T(m) + "\\left(" + v + " - " + paren(x0Ast) + "\\right) \\;\\Rightarrow\\; y = " + T(line), "y − y₀ = m(x − x₀)"));
    return { answer: "y = " + T(line), steps, plot: { exprs: [a, line], v, mark: x0, labels: ["f", "مماس"] } };
  }
  E.tangentSteps = tangentSteps;

  function extremaSteps(a, v) {
    v = v || E.pickVar([a]);
    const steps = [];
    const d1 = nicest(D(a, v)), d2 = nicest(D(d1, v));
    steps.push(step("مشتق اول", "f'(" + v + ") = " + T(d1), null));
    const sol = E.solveEquation(d1, zero(), v);
    steps.push(step("نقاط بحرانی: f'(" + v + ") = 0", sol.answer, "جایی که مشتق صفر است، شیب مماس افقی است."));
    const pts = Array.isArray(sol.sols) ? sol.sols : [];
    const rows = [];
    steps.push(step("مشتق دوم", "f''(" + v + ") = " + T(d2), "برای آزمون مشتق دوم"));
    pts.slice(0, 8).forEach(s => {
      const x = evalNum(s), yv = nicest(E.subst(a, v, s)), c = safe(() => evalNum(E.subst(d2, v, s)));
      const kind = c > 1e-12 ? "کمینهٔ نسبی" : c < -1e-12 ? "بیشینهٔ نسبی" : "نامشخص (آزمون مشتق اول لازم است)";
      rows.push(v + " = " + T(s) + ":\\; f'' " + (c > 0 ? "> 0" : c < 0 ? "< 0" : "= 0") + " \\Rightarrow \\text{" + kind + "},\\; f = " + T(yv));
    });
    if (rows.length) steps.push(step("آزمون مشتق دوم", rows.join(" \\\\ "), "f'' > 0 ⇒ تقعر رو به بالا (کمینه)؛ f'' < 0 ⇒ تقعر رو به پایین (بیشینه)"));
    const summary = pts.slice(0, 8).map(s => { const c = safe(() => evalNum(E.subst(d2, v, s))); return (c > 0 ? "\\min" : c < 0 ? "\\max" : "?") + "\\left(" + T(s) + ",\\; " + T(nicest(E.subst(a, v, s))) + "\\right)"; });
    return { answer: summary.length ? summary.join(",\\quad ") : "\\text{نقطهٔ بحرانی ندارد}", steps, plot: { exprs: [a], v, points: pts.slice(0, 8).map(s => [evalNum(s), safe(() => evalNum(E.subst(a, v, s)))]) } };
  }
  E.extremaSteps = extremaSteps;

  function taylorSteps(a, v, centerAst, order) {
    v = v || E.pickVar([a]);
    const steps = [];
    let cur = a, poly = null;
    const rows = [];
    for (let k = 0; k <= order; k++) {
      const val = nicest(E.subst(cur, v, centerAst));
      let fk = 1n; for (let i = 2n; i <= BigInt(k); i++) fk *= i;
      const term = nicest(N.mul(N.div(val, N.num(new Q(fk))), N.pow(N.sub(N.v(v), centerAst), N.num(q(k)))));
      rows.push("f^{(" + k + ")}\\left(" + T(centerAst) + "\\right) = " + T(val));
      if (!(val.t === "num" && val.q.isZero())) poly = poly ? N.add(poly, term) : term;
      if (k < order) cur = nicest(D(cur, v));
    }
    steps.push(step("مشتق‌ها در نقطهٔ مرکز", rows.join(" \\\\ "), null));
    steps.push(step("فرمول تیلور", "P_{" + order + "}(" + v + ") = \\sum_{k=0}^{" + order + "} \\frac{f^{(k)}(a)}{k!}(" + v + "-a)^{k}", "a = " + T(centerAst)));
    const res = poly ? nicest(poly) : zero();
    return { answer: "P_{" + order + "}(" + v + ") = " + T(res), steps, plot: { exprs: [a, res], v, labels: ["f", "P"] } };
  }
  E.taylorSteps = taylorSteps;
})(typeof globalThis !== "undefined" ? globalThis : this);
