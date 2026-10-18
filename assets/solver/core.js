/* MathEngine core: exact rationals, parser, AST utilities, TeX/strings, numeric evaluation.
   Persian, offline. Loaded before algebra.js, calculus.js, matrix.js, stats.js. */
(function (root) {
  "use strict";
  const E = root.MathEngine = root.MathEngine || {};

  /* ---------------- exact rationals (BigInt) ---------------- */
  const babs = a => (a < 0n ? -a : a);
  function bgcd(a, b) { a = babs(a); b = babs(b); while (b) { [a, b] = [b, a % b]; } return a; }
  class Q {
    constructor(n, d = 1n) {
      n = BigInt(n); d = BigInt(d);
      if (d === 0n) throw new MathError("تقسیم بر صفر تعریف نشده است.");
      if (d < 0n) { n = -n; d = -d; }
      const g = bgcd(n, d) || 1n;
      this.n = n / g; this.d = d / g;
    }
    static of(n, d = 1) { return new Q(BigInt(n), BigInt(d)); }
    static parse(s) {
      s = String(s).trim();
      const m = /^(-?)(\d*)(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(s);
      if (!m) throw new MathError("عدد نامعتبر: " + s);
      const int = m[2] || "0", frac = m[3] || "";
      let n = BigInt(int + frac), d = 10n ** BigInt(frac.length);
      if (m[4]) { const e = BigInt(m[4]); if (e >= 0n) n *= 10n ** e; else d *= 10n ** -e; }
      return new Q(m[1] ? -n : n, d);
    }
    static fromNumber(x) {
      if (Number.isInteger(x)) return new Q(BigInt(x));
      const s = x.toString(); if (/e/i.test(s) && Math.abs(x) < 1e-15) return new Q(0n);
      return Q.parse(s);
    }
    add(b) { return new Q(this.n * b.d + b.n * this.d, this.d * b.d); }
    sub(b) { return new Q(this.n * b.d - b.n * this.d, this.d * b.d); }
    mul(b) { return new Q(this.n * b.n, this.d * b.d); }
    div(b) { if (b.n === 0n) throw new MathError("تقسیم بر صفر تعریف نشده است."); return new Q(this.n * b.d, this.d * b.n); }
    neg() { return new Q(-this.n, this.d); }
    abs() { return new Q(babs(this.n), this.d); }
    inv() { return new Q(this.d, this.n); }
    pow(k) {
      k = BigInt(k);
      if (k === 0n) return Q.of(1);
      if (k < 0n) return this.inv().pow(-k);
      return new Q(this.n ** k, this.d ** k);
    }
    cmp(b) { const x = this.n * b.d - b.n * this.d; return x > 0n ? 1 : x < 0n ? -1 : 0; }
    eq(b) { return this.n === b.n && this.d === b.d; }
    sign() { return this.n > 0n ? 1 : this.n < 0n ? -1 : 0; }
    isZero() { return this.n === 0n; }
    isOne() { return this.n === 1n && this.d === 1n; }
    isInt() { return this.d === 1n; }
    num() { return Number(this.n) / Number(this.d); }
    toString() { return this.d === 1n ? this.n.toString() : this.n + "/" + this.d; }
    toTeX() {
      if (this.d === 1n) return this.n.toString();
      return (this.n < 0n ? "-" : "") + "\\frac{" + babs(this.n) + "}{" + this.d + "}";
    }
    /* decimal text when it terminates (denominator 2^a5^b) */
    toDecimal(maxDigits = 8) {
      let d = this.d; while (d % 2n === 0n) d /= 2n; while (d % 5n === 0n) d /= 5n;
      if (d !== 1n) return null;
      return trimNum(this.num(), maxDigits);
    }
  }
  E.Q = Q; E.bgcd = bgcd;
  const blcm = (a, b) => (a === 0n || b === 0n ? 0n : babs(a * b) / bgcd(a, b));
  E.blcm = blcm;

  class MathError extends Error { constructor(m) { super(m); this.name = "MathError"; } }
  E.MathError = MathError;

  function trimNum(x, digits = 8) {
    if (!Number.isFinite(x)) return x > 0 ? "∞" : x < 0 ? "-∞" : "تعریف‌نشده";
    if (Math.abs(x) < 1e-12) return "0";
    let s = Number(x.toPrecision(Math.min(15, digits + Math.max(0, Math.floor(Math.log10(Math.abs(x))) + 1)))).toString();
    if (/e/.test(s)) s = x.toPrecision(digits);
    if (s.includes(".")) { const [a, b] = s.split("."); s = a + "." + b.slice(0, digits).replace(/0+$/, ""); s = s.replace(/\.$/, ""); }
    return s;
  }
  E.trimNum = trimNum;

  /* ---------------- AST constructors ---------------- */
  const N = {
    num: q => ({ t: "num", q: q instanceof Q ? q : Q.fromNumber(q) }),
    fl: x => ({ t: "fl", v: x }),                 /* inexact float */
    v: n => ({ t: "var", n }),
    c: n => ({ t: "const", n }),
    bin: (op, l, r) => ({ t: "bin", op, l, r }),
    add: (l, r) => ({ t: "bin", op: "+", l, r }),
    sub: (l, r) => ({ t: "bin", op: "-", l, r }),
    mul: (l, r) => ({ t: "bin", op: "*", l, r }),
    div: (l, r) => ({ t: "bin", op: "/", l, r }),
    pow: (l, r) => ({ t: "bin", op: "^", l, r }),
    neg: a => ({ t: "neg", a }),
    fn: (n, ...a) => ({ t: "fn", n, a }),
    fact: a => ({ t: "fact", a }),
  };
  E.N = N;
  const isNum = (a) => a && a.t === "num";
  E.isNum = isNum;

  /* ---------------- tokenizer & parser ---------------- */
  const FUNCS = ["arcsin", "arccos", "arctan", "asin", "acos", "atan", "sinh", "cosh", "tanh", "sin", "cos", "tan", "cot", "sec", "csc",
    "sqrt", "cbrt", "root", "abs", "ln", "log10", "log", "exp", "floor", "ceil", "sign"];
  const FN_ALIAS = { arcsin: "asin", arccos: "acos", arctan: "atan", log10: "log" };
  E.FUNCS = FUNCS;
  function normalizeInput(s) {
    return String(s)
      .replace(/[۰-۹]/g, ch => String(ch.charCodeAt(0) - 0x06F0))
      .replace(/[٠-٩]/g, ch => String(ch.charCodeAt(0) - 0x0660))
      .replace(/٫/g, ".").replace(/،/g, ",")
      .replace(/[×·∙]/g, "*").replace(/÷/g, "/").replace(/[−–—]/g, "-")
      .replace(/π/g, "pi").replace(/∞/g, "oo").replace(/√/g, "sqrt")
      .replace(/²/g, "^2").replace(/³/g, "^3").replace(/⁴/g, "^4")
      .replace(/≤/g, "<=").replace(/≥/g, ">=").replace(/≠/g, "!=")
      .replace(/\*\*/g, "^").replace(/\s+/g, " ").trim();
  }
  E.normalizeInput = normalizeInput;

  function tokenize(src, opts = {}) {
    const s = normalizeInput(src), out = [];
    let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (ch === " ") { i++; continue; }
      if (/[0-9.]/.test(ch)) {
        const m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
        if (!m) throw new MathError("عدد نامعتبر در موقعیت " + (i + 1));
        out.push({ k: "num", v: m[1] }); i += m[1].length; continue;
      }
      if (/[a-zA-Z]/.test(ch)) {
        const m = /^[a-zA-Z]+/.exec(s.slice(i))[0];
        let j = 0;
        while (j < m.length) {
          const rest = m.slice(j);
          const f = FUNCS.find(fn => rest.toLowerCase().startsWith(fn));
          if (f) {
            let name = FN_ALIAS[f] || f;
            if (opts.nerd) { if (f === "log") name = "ln"; else if (f === "log10") name = "log"; }
            out.push({ k: "fn", v: name }); j += f.length; continue;
          }
          if (rest.startsWith("pi")) { out.push({ k: "const", v: "pi" }); j += 2; continue; }
          if (rest.startsWith("oo") || rest.toLowerCase().startsWith("infinity")) {
            const L = rest.startsWith("oo") ? 2 : 8; out.push({ k: "const", v: "oo" }); j += L; continue;
          }
          const c = rest[0];
          if (c === "e" && !opts.eVar) out.push({ k: "const", v: "e" });
          else out.push({ k: "var", v: c });
          j += 1;
        }
        i += m.length; continue;
      }
      const two = s.slice(i, i + 2);
      if (["<=", ">=", "!="].includes(two)) { out.push({ k: "rel", v: two }); i += 2; continue; }
      if ("<>=".includes(ch)) { out.push({ k: "rel", v: ch }); i++; continue; }
      if ("+-*/^(),!|[]{}".includes(ch)) {
        const v = ch === "[" || ch === "{" ? "(" : ch === "]" || ch === "}" ? ")" : ch;
        out.push({ k: "op", v }); i++; continue;
      }
      if (ch === "\\;") { out.push({ k: "op", v: "," }); i++; continue; }
      throw new MathError("نماد ناشناخته: «" + ch + "»");
    }
    return out;
  }

  function Parser(tokens) { this.t = tokens; this.i = 0; this.absDepth = 0; }
  Parser.prototype = {
    peek() { return this.t[this.i]; },
    next() { return this.t[this.i++]; },
    isOp(v) { const p = this.peek(); return p && p.k === "op" && p.v === v; },
    expect(v) { if (!this.isOp(v)) throw new MathError(v === ")" ? "پرانتز بسته نشده است." : "انتظار «" + v + "» می‌رفت."); this.i++; },
    expr() {
      let l = this.term();
      while (this.isOp("+") || this.isOp("-")) { const op = this.next().v; const r = this.term(); l = N.bin(op, l, r); }
      return l;
    },
    term() {
      let l = this.unary();
      for (;;) {
        if (this.isOp("*") || this.isOp("/")) { const op = this.next().v; const r = this.unary(); l = N.bin(op, l, r); continue; }
        const p = this.peek();
        if (p && (p.k === "num" || p.k === "var" || p.k === "const" || p.k === "fn" || (p.k === "op" && p.v === "("))) {
          const r = this.power(); l = N.mul(l, r); l.imp = true; continue;
        }
        if (p && p.k === "op" && p.v === "|" && this.absDepth === 0) { const r = this.power(); l = N.mul(l, r); l.imp = true; continue; }
        break;
      }
      return l;
    },
    unary() {
      if (this.isOp("-")) { this.next(); const a = this.unary(); return a.t === "num" ? N.num(a.q.neg()) : N.neg(a); }
      if (this.isOp("+")) { this.next(); return this.unary(); }
      return this.power();
    },
    power() {
      let b = this.postfix();
      if (this.isOp("^")) { this.next(); const e = this.unary(); return N.pow(b, e); }  /* right assoc */
      return b;
    },
    postfix() {
      let a = this.primary();
      while (this.isOp("!")) { this.next(); a = N.fact(a); }
      return a;
    },
    primary() {
      const p = this.next();
      if (!p) throw new MathError("عبارت ناقص است.");
      if (p.k === "num") return N.num(Q.parse(p.v));
      if (p.k === "var") return N.v(p.v);
      if (p.k === "const") return N.c(p.v);
      if (p.k === "op" && p.v === "(") { const e = this.expr(); this.expect(")"); return e; }
      if (p.k === "op" && p.v === "|") { this.absDepth++; const e = this.expr(); this.absDepth--; this.expect("|"); return N.fn("abs", e); }
      if (p.k === "fn") {
        let name = p.v;
        if (this.isOp("(")) {
          this.next(); const args = [this.expr()];
          while (this.isOp(",")) { this.next(); args.push(this.expr()); }
          this.expect(")");
          if (name === "root" && args.length === 1) args.push(N.num(Q.of(2)));
          if (name === "log" && args.length === 2) { return N.div(N.fn("ln", args[0]), N.fn("ln", args[1])); }
          const node = N.fn(name, ...args);
          if (this.isOp("^") && ["sin", "cos", "tan", "cot", "sec", "csc"].includes(name)) { /* sin(x)^2 */ }
          return node;
        }
        /* sin^2 x  or  sin x */
        if (this.isOp("^") && ["sin", "cos", "tan", "cot", "sec", "csc", "ln", "log"].includes(name)) {
          this.next(); const e = this.postfix(); const arg = this.power();
          return N.pow(N.fn(name, arg), e);
        }
        const arg = this.power();
        return N.fn(name, arg);
      }
      if (p.k === "op" && p.v === "-") { const a = this.power(); return N.neg(a); }
      throw new MathError("عبارت در اینجا نامعتبر است: «" + p.v + "»");
    },
  };

  function parse(src, opts = {}) {
    const toks = tokenize(src, opts);
    if (!toks.length) throw new MathError("عبارتی وارد نشده است.");
    const P = new Parser(toks);
    const e = P.expr();
    if (P.i < toks.length) {
      const t = toks[P.i];
      if (t.k === "op" && t.v === ")") throw new MathError("پرانتز اضافه وجود دارد.");
      throw new MathError("عبارت پس از «" + (t.v) + "» قابل فهم نیست.");
    }
    return e;
  }
  E.parse = parse;
  E.parseNerd = s => parse(String(s), { nerd: true });

  /* split statement into relation parts: "a = b", "a < b", list "a=b, c=d" */
  function parseStatement(src) {
    const toks = tokenize(src);
    /* split at top-level commas */
    const groups = [[]]; let depth = 0;
    for (const t of toks) {
      if (t.k === "op" && t.v === "(") depth++;
      if (t.k === "op" && t.v === ")") depth--;
      if (depth === 0 && t.k === "op" && t.v === ",") { groups.push([]); continue; }
      groups[groups.length - 1].push(t);
    }
    return groups.filter(g => g.length).map(g => {
      const parts = [], rels = []; let cur = [];
      for (const t of g) { if (t.k === "rel") { parts.push(cur); rels.push(t.v); cur = []; } else cur.push(t); }
      parts.push(cur);
      const asts = parts.map(p => { if (!p.length) throw new MathError("یک طرف رابطه خالی است."); const P = new Parser(p); const e = P.expr(); if (P.i < p.length) throw new MathError("عبارت نامعتبر است."); return e; });
      return { parts: asts, rels };
    });
  }
  E.parseStatement = parseStatement;

  /* ---------------- AST utilities ---------------- */
  function vars(a, set = new Set()) {
    if (!a) return set;
    if (a.t === "var") set.add(a.n);
    else if (a.t === "bin") { vars(a.l, set); vars(a.r, set); }
    else if (a.t === "neg" || a.t === "fact") vars(a.a, set);
    else if (a.t === "fn") a.a.forEach(x => vars(x, set));
    return set;
  }
  E.vars = vars;
  const has = (a, v) => vars(a).has(v);
  E.has = has;
  function subst(a, v, b) {
    if (a.t === "var") return a.n === v ? b : a;
    if (a.t === "bin") return { ...a, l: subst(a.l, v, b), r: subst(a.r, v, b) };
    if (a.t === "neg" || a.t === "fact") return { ...a, a: subst(a.a, v, b) };
    if (a.t === "fn") return { ...a, a: a.a.map(x => subst(x, v, b)) };
    return a;
  }
  E.subst = subst;
  function eqAst(a, b) {
    if (a.t !== b.t) return false;
    switch (a.t) {
      case "num": return a.q.eq(b.q);
      case "fl": return a.v === b.v;
      case "var": case "const": return a.n === b.n;
      case "bin": return a.op === b.op && eqAst(a.l, b.l) && eqAst(a.r, b.r);
      case "neg": case "fact": return eqAst(a.a, b.a);
      case "fn": return a.n === b.n && a.a.length === b.a.length && a.a.every((x, i) => eqAst(x, b.a[i]));
    }
    return false;
  }
  E.eqAst = eqAst;
  function pickVar(asts, pref = ["x", "y", "t", "z", "n", "a", "b"]) {
    const s = new Set(); asts.forEach(a => vars(a, s));
    for (const p of pref) if (s.has(p)) return p;
    return [...s].sort()[0] || "x";
  }
  E.pickVar = pickVar;

  /* ---------------- numeric evaluation ---------------- */
  const fact = n => { if (n < 0 || !Number.isInteger(n)) return gammaFn(n + 1); let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
  function gammaFn(z) {
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gammaFn(1 - z));
    z -= 1; const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    let x = c[0]; for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
    const t = z + g + 0.5; return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }
  E.fact = fact;
  const FN_NUM = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan, cot: x => 1 / Math.tan(x), sec: x => 1 / Math.cos(x), csc: x => 1 / Math.sin(x),
    asin: Math.asin, acos: Math.acos, atan: Math.atan, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    sqrt: x => (x < 0 ? NaN : Math.sqrt(x)), cbrt: Math.cbrt, abs: Math.abs, ln: Math.log, log: Math.log10, exp: Math.exp,
    floor: Math.floor, ceil: Math.ceil, sign: Math.sign,
  };
  function evalNum(a, env = {}) {
    switch (a.t) {
      case "num": return a.q.num();
      case "fl": return a.v;
      case "var": if (a.n in env) return env[a.n]; throw new MathError("مقدار متغیر " + a.n + " مشخص نیست.");
      case "const": return a.n === "pi" ? Math.PI : a.n === "e" ? Math.E : a.n === "oo" ? Infinity : NaN;
      case "neg": return -evalNum(a.a, env);
      case "fact": return fact(evalNum(a.a, env));
      case "fn": {
        if (a.n === "root") { const x = evalNum(a.a[0], env), k = evalNum(a.a[1], env); return x < 0 && k % 2 === 1 ? -Math.pow(-x, 1 / k) : Math.pow(x, 1 / k); }
        const f = FN_NUM[a.n]; if (!f) throw new MathError("تابع ناشناخته: " + a.n);
        return f(evalNum(a.a[0], env));
      }
      case "bin": {
        const l = evalNum(a.l, env), r = evalNum(a.r, env);
        switch (a.op) {
          case "+": return l + r; case "-": return l - r; case "*": return l * r; case "/": return l / r;
          case "^": {
            if (l < 0 && !Number.isInteger(r)) { /* odd root of negative: (-8)^(1/3) */
              const rq = a.r.t === "num" ? a.r.q : (a.r.t === "bin" && a.r.op === "/" && isNum(a.r.l) && isNum(a.r.r) ? a.r.l.q.div(a.r.r.q) : null);
              if (rq && rq.d % 2n === 1n) return (rq.n % 2n === 0n ? 1 : -1) * Math.pow(-l, r);
            }
            return Math.pow(l, r);
          }
        }
      }
    }
    throw new MathError("ارزیابی ممکن نیست.");
  }
  E.evalNum = evalNum;
  E.compile = (a, v = "x") => (x) => { try { return evalNum(a, { [v]: x }); } catch (e) { return NaN; } };

  /* exact evaluation when possible: returns Q or null */
  function evalExact(a) {
    switch (a.t) {
      case "num": return a.q;
      case "neg": { const x = evalExact(a.a); return x && x.neg(); }
      case "bin": {
        const l = evalExact(a.l), r = evalExact(a.r); if (!l || !r) return null;
        switch (a.op) {
          case "+": return l.add(r); case "-": return l.sub(r); case "*": return l.mul(r);
          case "/": return r.isZero() ? null : l.div(r);
          case "^": if (r.isInt() && babs(r.n) <= 64n && !(l.isZero() && r.sign() < 0)) return l.pow(r.n);
            { const rt = qRoot(l, r); return rt; }
        }
        return null;
      }
      case "fact": { const x = evalExact(a.a); if (x && x.isInt() && x.n >= 0n && x.n <= 170n) { let r = 1n; for (let i = 2n; i <= x.n; i++) r *= i; return new Q(r); } return null; }
      case "fn": {
        const x = a.a.map(evalExact); if (x.some(v => !v)) return null;
        if (a.n === "abs") return x[0].abs();
        if (a.n === "sqrt") return qRoot(x[0], Q.of(1, 2));
        if (a.n === "cbrt") return qRoot(x[0], Q.of(1, 3));
        if (a.n === "root" && x[1].isInt()) return qRoot(x[0], Q.of(1).div(x[1]));
        if (a.n === "floor") return new Q(floorDiv(x[0].n, x[0].d));
        if (a.n === "ceil") return new Q(-floorDiv(-x[0].n, x[0].d));
        return null;
      }
    }
    return null;
  }
  const floorDiv = (n, d) => { const q = n / d; return (n % d !== 0n && (n < 0n) !== (d < 0n)) ? q - 1n : q; };
  function iroot(n, k) { /* exact integer k-th root or null */
    if (n < 0n) return null; if (n < 2n) return n;
    let x = BigInt(Math.round(Math.pow(Number(n), 1 / Number(k))));
    for (const c of [x - 1n, x, x + 1n]) if (c >= 0n && c ** k === n) return c;
    return null;
  }
  E.iroot = iroot;
  function qRoot(q, e) { /* q^(p/r) exact if possible */
    if (e.d > 12n) return null;
    const r = e.d, p = e.n;
    let n = q.n, d = q.d, neg = false;
    if (n < 0n) { if (r % 2n === 0n) return null; neg = true; n = -n; }
    const a = iroot(n, r), b = iroot(d, r); if (a === null || b === null) return null;
    let base = new Q(neg ? -a : a, b);
    if (base.isZero() && p < 0n) return null;
    return base.pow(p);
  }
  E.qRoot = qRoot;
  E.evalExact = evalExact;

  /* ---------------- printing ---------------- */
  const PREC = { "+": 1, "-": 1, "*": 2, "/": 2, neg: 2, "^": 4 };
  function prec(a) {
    if (a.t === "bin") return PREC[a.op];
    if (a.t === "neg") return 2;
    if (a.t === "num") return a.q.sign() < 0 ? 1.5 : (a.q.isInt() ? 9 : 2);
    if (a.t === "fl") return a.v < 0 ? 1.5 : 9;
    return 9;
  }
  const TEXFN = { sin: "\\sin", cos: "\\cos", tan: "\\tan", cot: "\\cot", sec: "\\sec", csc: "\\csc", asin: "\\arcsin", acos: "\\arccos", atan: "\\arctan",
    sinh: "\\sinh", cosh: "\\cosh", tanh: "\\tanh", ln: "\\ln", log: "\\log", sign: "\\operatorname{sgn}" };
  const P_ = s => "\\left(" + s + "\\right)";
  function startsNumeric(a) { /* for choosing \cdot between factors */
    if (a.t === "num" || a.t === "fl") return true;
    if (a.t === "bin" && (a.op === "*" || a.op === "^")) return startsNumeric(a.l);
    if (a.t === "bin" && a.op === "/") return false;
    return false;
  }
  function tex(a) {
    switch (a.t) {
      case "num": return a.q.toTeX();
      case "fl": return trimNum(a.v);
      case "var": return a.n;
      case "const": return a.n === "pi" ? "\\pi" : a.n === "oo" ? "\\infty" : "e";
      case "neg": { const s = tex(a.a); return "-" + (prec(a.a) <= 2 && !(a.a.t === "bin" && a.a.op === "/") ? P_(s) : s); }
      case "fact": { const s = tex(a.a); return (a.a.t === "num" && a.a.q.sign() >= 0 && a.a.q.isInt()) || a.a.t === "var" ? s + "!" : P_(s) + "!"; }
      case "fn": {
        const x = a.a.map(tex);
        if (a.n === "sqrt") return "\\sqrt{" + x[0] + "}";
        if (a.n === "cbrt") return "\\sqrt[3]{" + x[0] + "}";
        if (a.n === "root") return "\\sqrt[" + x[1] + "]{" + x[0] + "}";
        if (a.n === "abs") return "\\left|" + x[0] + "\\right|";
        if (a.n === "exp") return "e^{" + x[0] + "}";
        if (a.n === "floor") return "\\lfloor " + x[0] + " \\rfloor";
        if (a.n === "ceil") return "\\lceil " + x[0] + " \\rceil";
        if ((a.n === "ln" || a.n === "log") && a.a[0].t === "fn" && a.a[0].n === "abs") return TEXFN[a.n] + x[0];
        const head = TEXFN[a.n] || "\\operatorname{" + a.n + "}";
        return head + P_(x.join(", "));
      }
      case "bin": {
        const l = a.l, r = a.r;
        if (a.op === "/") { if (l.t === "num" && l.q.sign() < 0) return "-\\frac{" + l.q.neg().toTeX() + "}{" + tex(r) + "}"; if (l.t === "neg") return "-\\frac{" + tex(l.a) + "}{" + tex(r) + "}"; return "\\frac{" + tex(l) + "}{" + tex(r) + "}"; }
        if (a.op === "^") {
          let base = tex(l);
          if (l.t === "fn" && TEXFN[l.n] && !(r.t === "num" && r.q.sign() < 0)) { /* sin^2(x) */
            return TEXFN[l.n] + "^{" + tex(r) + "}" + P_(l.a.map(tex).join(", "));
          }
          if (!(l.t === "var" || l.t === "const" || (l.t === "num" && l.q.sign() >= 0 && l.q.isInt()) || (l.t === "fl" && l.v >= 0) || (l.t === "fn" && ["sqrt", "abs", "cbrt", "root"].includes(l.n)))) base = P_(base);
          return base + "^{" + tex(r) + "}";
        }
        if (a.op === "+") {
          const rs = tex(r);
          if (rs.startsWith("-")) return tex(l) + " + " + P_(rs);
          return tex(l) + " + " + rs;
        }
        if (a.op === "-") {
          let rs = tex(r); if (prec(r) <= 1.5) rs = P_(rs);
          return tex(l) + " - " + rs;
        }
        if (a.op === "*") {
          let ls = tex(l), rs = tex(r);
          if (prec(l) < 2 || (l.t === "num" && l.q.sign() < 0 && false)) ls = P_(ls);
          if (prec(r) < 2 || rs.startsWith("-")) rs = P_(rs);
          else if (r.t === "bin" && r.op === "*" && false) rs = rs;
          const juxt = !startsNumeric(r) && !(r.t === "bin" && r.op === "/") && (l.t === "num" || l.t === "var" || l.t === "const" || (l.t === "bin" && l.op === "^") || (l.t === "bin" && l.op === "/" && (r.t === "var" || r.t === "fn" || r.t === "const")) || (l.t === "bin" && l.op === "*" && !startsNumeric(r))) && !rs.startsWith("\\left(") ;
          if (juxt) return ls + " " + rs;
          if (rs.startsWith("\\left(") && !(l.t === "num" && r.t === "num")) return ls + rs;
          return ls + " \\cdot " + rs;
        }
      }
    }
    return "?";
  }
  E.tex = tex;

  /* plain string, nerdamer compatible */
  const NFN = { ln: "log", log: "log10", asin: "asin", acos: "acos", atan: "atan" };
  function str(a) {
    switch (a.t) {
      case "num": return a.q.isInt() ? a.q.toString() : "(" + a.q.toString() + ")";
      case "fl": return "(" + a.v.toPrecision(15) + ")";
      case "var": return a.n;
      case "const": return a.n === "pi" ? "pi" : a.n === "oo" ? "Infinity" : "e";
      case "neg": return "(-" + str(a.a) + ")";
      case "fact": return "factorial(" + str(a.a) + ")";
      case "fn": {
        if (a.n === "root") return "(" + str(a.a[0]) + ")^(1/(" + str(a.a[1]) + "))";
        if (a.n === "exp") return "e^(" + str(a.a[0]) + ")";
        if (a.n === "cot") return "(1/tan(" + str(a.a[0]) + "))";
        if (a.n === "sec") return "(1/cos(" + str(a.a[0]) + "))";
        if (a.n === "csc") return "(1/sin(" + str(a.a[0]) + "))";
        return (NFN[a.n] || a.n) + "(" + a.a.map(str).join(",") + ")";
      }
      case "bin": return "(" + str(a.l) + ")" + a.op + "(" + str(a.r) + ")";
    }
    return "";
  }
  E.str = str;
  /* human-readable plain text (for history, inputs) */
  function plain(a) {
    switch (a.t) {
      case "num": return a.q.toString();
      case "fl": return trimNum(a.v);
      case "var": return a.n;
      case "const": return a.n === "oo" ? "∞" : a.n;
      case "neg": return "-" + (prec(a.a) <= 2 ? "(" + plain(a.a) + ")" : plain(a.a));
      case "fact": return (prec(a.a) < 9 ? "(" + plain(a.a) + ")" : plain(a.a)) + "!";
      case "fn": return a.n + "(" + a.a.map(plain).join(", ") + ")";
      case "bin": {
        const p = PREC[a.op];
        const L = prec(a.l) < p || (a.op === "^" && prec(a.l) <= p) ? "(" + plain(a.l) + ")" : plain(a.l);
        const R = prec(a.r) < p || (prec(a.r) === p && a.op !== "+" && a.op !== "*" && a.op !== "^") || (a.op === "-" && prec(a.r) === 1) ? "(" + plain(a.r) + ")" : plain(a.r);
        const op = a.op === "*" ? (a.imp ? "" : "*") : a.op;
        return L + (op === "+" || op === "-" ? " " + op + " " : op) + R;
      }
    }
    return "";
  }
  E.plain = plain;

  /* ---------------- light simplifier (for readable intermediate steps) ---------------- */
  const ZERO = () => N.num(Q.of(0)), ONE = () => N.num(Q.of(1));
  const isZ = a => a.t === "num" && a.q.isZero();
  const isO = a => a.t === "num" && a.q.isOne();
  E.isZ = isZ; E.isO = isO;
  function simp(a) {
    switch (a.t) {
      case "neg": {
        const x = simp(a.a);
        if (x.t === "num") return N.num(x.q.neg());
        if (x.t === "neg") return x.a;
        if (x.t === "bin" && x.op === "*" && x.l.t === "num") return simp(N.mul(N.num(x.l.q.neg()), x.r));
        if (x.t === "bin" && x.op === "/" && x.l.t === "num") return N.div(N.num(x.l.q.neg()), x.r);
        return N.neg(x);
      }
      case "fact": return N.fact(simp(a.a));
      case "fn": {
        const args = a.a.map(simp), node = { ...a, a: args };
        const ex = evalExact(node); if (ex && ["abs", "sqrt", "cbrt", "root", "floor", "ceil"].includes(a.n)) return N.num(ex);
        if (a.n === "ln" && args[0].t === "const" && args[0].n === "e") return ONE();
        if (a.n === "ln" && isO(args[0])) return ZERO();
        if (a.n === "exp" && isZ(args[0])) return ONE();
        if ((a.n === "sin" || a.n === "tan") && isZ(args[0])) return ZERO();
        if (a.n === "cos" && isZ(args[0])) return ONE();
        return node;
      }
      case "bin": {
        let l = simp(a.l), r = simp(a.r);
        const op = a.op;
        if (l.t === "num" && r.t === "num") {
          if (op !== "/" && op !== "^") return N.num(op === "+" ? l.q.add(r.q) : op === "-" ? l.q.sub(r.q) : l.q.mul(r.q));
          if (op === "/" && !r.q.isZero()) return N.num(l.q.div(r.q));
          if (op === "^") { const v = evalExact(N.pow(l, r)); if (v) return N.num(v); }
        }
        if (op === "+") {
          if (isZ(l)) return r; if (isZ(r)) return l;
          if (r.t === "num" && r.q.sign() < 0) return N.sub(l, N.num(r.q.neg()));
          if (r.t === "neg") return N.sub(l, r.a);
          if (r.t === "bin" && r.op === "*" && r.l.t === "num" && r.l.q.sign() < 0) return N.sub(l, simp(N.mul(N.num(r.l.q.neg()), r.r)));
          if (l.t === "neg") return N.sub(r, l.a);
          return N.add(l, r);
        }
        if (op === "-") {
          if (isZ(r)) return l; if (isZ(l)) return simp(N.neg(r));
          if (r.t === "num" && r.q.sign() < 0) return N.add(l, N.num(r.q.neg()));
          if (r.t === "neg") return N.add(l, r.a);
          if (eqAst(l, r)) return ZERO();
          return N.sub(l, r);
        }
        if (op === "*") {
          if (isZ(l) || isZ(r)) return ZERO();
          if (isO(l)) return r; if (isO(r)) return l;
          if (l.t === "num" && l.q.eq(Q.of(-1))) return simp(N.neg(r));
          if (r.t === "num" && l.t !== "num") return simp(N.mul(r, l));
          if (l.t === "num" && r.t === "bin" && r.op === "*" && r.l.t === "num") return simp(N.mul(N.num(l.q.mul(r.l.q)), r.r));
          if (l.t === "num" && r.t === "bin" && r.op === "/" && r.l.t === "num") return simp(N.div(N.num(l.q.mul(r.l.q)), r.r));
          if (l.t === "neg") return simp(N.neg(N.mul(l.a, r)));
          if (r.t === "neg") return simp(N.neg(N.mul(l, r.a)));
          if (eqAst(l, r)) return N.pow(l, N.num(Q.of(2)));
          if (l.t === "bin" && l.op === "^" && eqAst(l.l, r) && l.r.t === "num") return N.pow(r, N.num(l.r.q.add(Q.of(1))));
          if (r.t === "bin" && r.op === "^" && eqAst(r.l, l) && r.r.t === "num") return N.pow(l, N.num(r.r.q.add(Q.of(1))));
          if (l.t === "bin" && l.op === "^" && r.t === "bin" && r.op === "^" && eqAst(l.l, r.l) && l.r.t === "num" && r.r.t === "num") return simp(N.pow(l.l, N.num(l.r.q.add(r.r.q))));
          const m = N.mul(l, r); if (a.imp) m.imp = true; return m;
        }
        if (op === "/") {
          if (isZ(l)) return ZERO(); if (isO(r)) return l;
          if (eqAst(l, r)) return ONE();
          if (r.t === "num" && l.t === "bin" && l.op === "*" && l.l.t === "num" && !r.q.isZero()) return simp(N.mul(N.num(l.l.q.div(r.q)), l.r));
          if (l.t === "neg") return simp(N.neg(N.div(l.a, r)));
          return N.div(l, r);
        }
        if (op === "^") {
          if (isZ(r)) return ONE(); if (isO(r)) return l; if (isO(l)) return ONE();
          if (l.t === "bin" && l.op === "^" && l.r.t === "num" && r.t === "num") return simp(N.pow(l.l, N.num(l.r.q.mul(r.q))));
          if (l.t === "fn" && l.n === "sqrt" && r.t === "num" && r.q.eq(Q.of(2))) return l.a[0];
          return N.pow(l, r);
        }
      }
    }
    return a;
  }
  E.simp = simp;

  /* make negative / fractional powers readable: x^(-2) -> 1/x^2, x^(1/2) -> sqrt(x) */
  function pretty(a) {
    if (!a || typeof a !== "object") return a;
    if (a.t === "bin") {
      let l = pretty(a.l), r = pretty(a.r);
      if (a.op === "^" && r.t === "num") {
        if (r.q.eq(Q.of(1, 2))) return N.fn("sqrt", l);
        if (r.q.eq(Q.of(1, 3))) return N.fn("cbrt", l);
        if (r.q.sign() < 0) { const pos = r.q.neg(); return N.div(ONE(), pos.isOne() ? l : (pos.eq(Q.of(1, 2)) ? N.fn("sqrt", l) : N.pow(l, N.num(pos)))); }
        if (!r.q.isInt() && r.q.d <= 12n && r.q.n > 0n) { const inner = r.q.n === 1n ? l : N.pow(l, N.num(new Q(r.q.n))); return r.q.d === 2n ? N.fn("sqrt", inner) : N.fn("root", inner, N.num(new Q(r.q.d))); }
      }
      if (a.op === "*") {
        /* (k)*(1/x) -> k/x */
        if (r.t === "bin" && r.op === "/" && isO(r.l)) return pretty(N.div(l, r.r));
        if (l.t === "bin" && l.op === "/" && isO(l.l)) return pretty(N.div(r, l.r));
        if (l.t === "num" && !l.q.isInt() && r.t !== "num") { /* (1/2)x -> x/2 , (3/4)x -> 3x/4 */
          const num = l.q.n === 1n ? r : (l.q.n === -1n ? N.neg(r) : N.mul(N.num(new Q(l.q.n)), r));
          return N.div(num, N.num(new Q(l.q.d)));
        }
        if (l.t === "num" && r.t === "bin" && r.op === "/" && !(r.l.t === "num")) return N.div(simp(N.mul(l, r.l)), r.r);
      }
      if (a.op === "+" && r.t === "neg") return N.sub(l, r.a);
      if (a.op === "+" && r.t === "num" && r.q.sign() < 0) return N.sub(l, N.num(r.q.neg()));
      if (a.op === "+" && r.t === "bin" && r.op === "*" && r.l.t === "num" && r.l.q.sign() < 0) return N.sub(l, pretty(N.mul(N.num(r.l.q.neg()), r.r)));
      if (a.op === "+" && r.t === "bin" && r.op === "/" && r.l.t === "num" && r.l.q.sign() < 0) return N.sub(l, N.div(N.num(r.l.q.neg()), r.r));
      if (a.op === "+" && l.t === "num" && r.t !== "num") return pretty(N.add(r, l));
      if (a.op === "/" && l.t === "num" && !l.q.isInt()) return N.div(N.num(new Q(l.q.n)), simp(N.mul(N.num(new Q(l.q.d)), r)));
      return { ...a, l, r };
    }
    if (a.t === "neg") { const x = pretty(a.a); return x.t === "num" ? N.num(x.q.neg()) : N.neg(x); }
    if (a.t === "fn") return { ...a, a: a.a.map(pretty) };
    if (a.t === "fact") return { ...a, a: pretty(a.a) };
    return a;
  }
  E.pretty = pretty;

  /* ---------------- nerdamer bridge ---------------- */
  function nd() { const n = root.nerdamer; if (!n) throw new MathError("موتور نمادین بارگذاری نشده است."); return n; }
  E.nd = nd;
  E.cas = function (expr) { return nd()(expr).toString(); };
  /* run nerdamer, parse back to our AST (nerdamer log = ln) */
  E.casAst = function (expr) {
    const s = nd()(expr).toString();
    if (/undefined|NaN/i.test(s)) throw new MathError("محاسبه ممکن نبود.");
    return pretty(simp(E.parseNerd(s)));
  };
  E.simplifyAst = function (a) {
    try { return E.casAst("simplify(" + str(a) + ")"); } catch (e) { return pretty(simp(a)); }
  };
  E.expandAst = function (a) { try { return E.casAst("expand(" + str(a) + ")"); } catch (e) { return a; } };

  /* numeric equivalence test of two expressions over sample points */
  E.equivalent = function (a, b, vlist) {
    vlist = vlist || [...new Set([...vars(a), ...vars(b)])];
    let tested = 0;
    for (let k = 0; k < 14; k++) {
      const env = {}; vlist.forEach((v, i) => env[v] = 0.37 + k * 0.613 + i * 0.29 - (k % 3) * 1.7);
      let x, y; try { x = evalNum(a, env); y = evalNum(b, env); } catch (e) { continue; }
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      tested++;
      if (Math.abs(x - y) > 1e-7 * Math.max(1, Math.abs(x), Math.abs(y))) return false;
    }
    return tested >= 3;
  };

  /* step helpers */
  E.step = (title, texStr, note) => ({ title, tex: texStr, note });
  E.fa = n => String(n).replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
  E.ZERO = ZERO; E.ONE = ONE;
})(typeof globalThis !== "undefined" ? globalThis : this);
