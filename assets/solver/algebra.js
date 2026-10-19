/* MathEngine algebra: polynomials, step-by-step arithmetic, simplify/expand/factor,
   equations (linear, quadratic, polynomial, rational, absolute value, radical, exponential, log),
   inequalities (sign charts) and linear systems (Gaussian elimination). */
(function (root) {
  "use strict";
  const E = root.MathEngine;
  const tr = (fa, en) => (E.lang() === "en" && en !== undefined ? en : fa);
  const { Q, N, MathError, tex, simp, pretty, evalNum, evalExact, step, bgcd, blcm, iroot } = E;
  const q = (n, d = 1) => Q.of(n, d);
  const fa = E.fa;

  /* ======================= univariate polynomials ======================= */
  class Poly {
    constructor(c) { this.c = (c || []).slice(); this.trim(); }
    trim() { while (this.c.length && this.c[this.c.length - 1].isZero()) this.c.pop(); return this; }
    static const(k) { return new Poly([k instanceof Q ? k : q(k)]); }
    static x(k = 1) { const c = []; for (let i = 0; i < k; i++) c.push(q(0)); c.push(q(1)); return new Poly(c); }
    static fromRoots(rs) { let p = Poly.const(1); rs.forEach(r => { p = p.mul(new Poly([r.neg(), q(1)])); }); return p; }
    deg() { return this.c.length - 1; }
    isZero() { return this.c.length === 0; }
    co(i) { return this.c[i] || q(0); }
    lead() { return this.co(this.deg()); }
    add(b) { const n = Math.max(this.c.length, b.c.length), r = []; for (let i = 0; i < n; i++) r.push(this.co(i).add(b.co(i))); return new Poly(r); }
    neg() { return new Poly(this.c.map(x => x.neg())); }
    sub(b) { return this.add(b.neg()); }
    scale(k) { return new Poly(this.c.map(x => x.mul(k))); }
    mul(b) {
      if (this.isZero() || b.isZero()) return new Poly([]);
      const r = Array(this.c.length + b.c.length - 1).fill(null).map(() => q(0));
      this.c.forEach((x, i) => b.c.forEach((y, j) => { r[i + j] = r[i + j].add(x.mul(y)); }));
      return new Poly(r);
    }
    pow(k) { let r = Poly.const(1); for (let i = 0; i < k; i++) r = r.mul(this); return r; }
    divmod(b) {
      if (b.isZero()) throw new MathError(tr("تقسیم بر چندجمله‌ای صفر", "Division by the zero polynomial"));
      let r = new Poly(this.c), quo = [];
      const db = b.deg(), lb = b.lead();
      while (!r.isZero() && r.deg() >= db) {
        const k = r.deg() - db, f = r.lead().div(lb);
        quo[k] = f; const t = []; for (let i = 0; i < k; i++) t.push(q(0)); t.push(f);
        r = r.sub(new Poly(t).mul(b));
      }
      for (let i = 0; i < quo.length; i++) if (!quo[i]) quo[i] = q(0);
      return [new Poly(quo), r];
    }
    monic() { return this.isZero() ? this : this.scale(this.lead().inv()); }
    evalQ(x) { let r = q(0); for (let i = this.deg(); i >= 0; i--) r = r.mul(x).add(this.co(i)); return r; }
    evalN(x) { let r = 0; for (let i = this.deg(); i >= 0; i--) r = r * x + this.co(i).num(); return r; }
    deriv() { return new Poly(this.c.slice(1).map((x, i) => x.mul(q(i + 1)))); }
    isConst() { return this.deg() <= 0; }
    eq(b) { return this.sub(b).isZero(); }
    lowDeg() { let i = 0; while (i < this.c.length && this.c[i].isZero()) i++; return i; }
    /* integer-coefficient primitive form: returns [content(Q), primitive Poly with integer coeffs, positive lead] */
    primitive() {
      if (this.isZero()) return [q(0), this];
      let L = 1n; this.c.forEach(x => { L = blcm(L, x.d); });
      let ints = this.c.map(x => x.n * (L / x.d)), g = 0n; ints.forEach(v => { g = bgcd(g, v); });
      if (this.lead().sign() < 0) g = -g;
      return [new Q(g, L), new Poly(ints.map(v => new Q(v / g)))];
    }
    toAst(v = "x") {
      const terms = [];
      for (let i = this.deg(); i >= 0; i--) {
        const k = this.co(i); if (k.isZero()) continue;
        let base = i === 0 ? null : (i === 1 ? N.v(v) : N.pow(N.v(v), N.num(q(i))));
        terms.push({ k, base });
      }
      if (!terms.length) return N.num(q(0));
      let ast = null;
      terms.forEach(({ k, base }, idx) => {
        const neg = k.sign() < 0, ka = k.abs();
        let t = base ? (ka.isOne() ? base : N.mul(N.num(ka), base)) : N.num(ka);
        if (base && !ka.isOne()) t.imp = true;
        if (idx === 0) ast = neg ? (t.t === "num" ? N.num(t.q.neg()) : N.neg(t)) : t;
        else ast = neg ? N.sub(ast, t) : N.add(ast, t);
      });
      return ast;
    }
    tex(v = "x") { return tex(this.toAst(v)); }
  }
  E.Poly = Poly;

  /* rational function n/d */
  class Rat {
    constructor(n, d) { this.n = n; this.d = d || Poly.const(1); }
    static P(p) { return new Rat(p, Poly.const(1)); }
    add(b) { return new Rat(this.n.mul(b.d).add(b.n.mul(this.d)), this.d.mul(b.d)).norm(); }
    sub(b) { return new Rat(this.n.mul(b.d).sub(b.n.mul(this.d)), this.d.mul(b.d)).norm(); }
    mul(b) { return new Rat(this.n.mul(b.n), this.d.mul(b.d)).norm(); }
    div(b) { if (b.n.isZero()) throw new MathError(tr("تقسیم بر صفر", "Division by zero")); return new Rat(this.n.mul(b.d), this.d.mul(b.n)).norm(); }
    neg() { return new Rat(this.n.neg(), this.d); }
    pow(k) { if (k >= 0) return new Rat(this.n.pow(k), this.d.pow(k)); return new Rat(this.d.pow(-k), this.n.pow(-k)).norm(); }
    norm() { /* make denominator monic, keep factors (no gcd) */
      if (this.d.isConst()) { const k = this.d.co(0); return new Rat(this.n.scale(k.inv()), Poly.const(1)); }
      const l = this.d.lead(); return new Rat(this.n.scale(l.inv()), this.d.scale(l.inv()));
    }
    reduce() { const g = polyGcd(this.n, this.d); if (g.deg() > 0) { return new Rat(this.n.divmod(g)[0], this.d.divmod(g)[0]).norm(); } return this; }
    isPoly() { return this.d.isConst(); }
  }
  E.Rat = Rat;
  function polyGcd(a, b) {
    a = new Poly(a.c); b = new Poly(b.c);
    while (!b.isZero()) { const r = a.divmod(b)[1]; a = b; b = r; }
    return a.isZero() ? a : a.monic();
  }
  E.polyGcd = polyGcd;

  /* AST -> Rat in variable v (null if not rational in v, or other vars present) */
  function toRat(a, v) {
    switch (a.t) {
      case "num": return Rat.P(Poly.const(a.q));
      case "var": return a.n === v ? Rat.P(Poly.x()) : null;
      case "neg": { const x = toRat(a.a, v); return x && x.neg(); }
      case "bin": {
        if (a.op === "^") {
          const b = toRat(a.l, v), e = evalExact(a.r);
          if (!b || !e || !e.isInt() || e.n > 40n || e.n < -40n) {
            if (!E.has(a, v)) { const c = evalExact(a); return c ? Rat.P(Poly.const(c)) : null; }
            return null;
          }
          if (e.sign() < 0 && b.n.isZero()) return null;
          return b.pow(Number(e.n));
        }
        const l = toRat(a.l, v), r = toRat(a.r, v); if (!l || !r) return null;
        if (a.op === "+") return l.add(r);
        if (a.op === "-") return l.sub(r);
        if (a.op === "*") return l.mul(r);
        if (a.op === "/") return r.n.isZero() ? null : l.div(r);
      }
      case "fn": case "fact": case "const": {
        if (!E.has(a, v)) { const c = evalExact(a); return c ? Rat.P(Poly.const(c)) : null; }
        return null;
      }
    }
    return null;
  }
  E.toRat = toRat;
  const toPoly = (a, v) => { const r = toRat(a, v); return r && r.isPoly() ? r.n : null; };
  E.toPoly = toPoly;

  /* ======================= multivariate polynomials ======================= */
  /* monomial key: "x^2*y" sorted by variable; "" for constant */
  const monoKey = m => Object.keys(m).filter(k => m[k]).sort().map(k => k + (m[k] === 1 ? "" : "^" + m[k])).join("*");
  const parseKey = k => { const m = {}; if (!k) return m; k.split("*").forEach(p => { const [v, e] = p.split("^"); m[v] = e ? +e : 1; }); return m; };
  class MPoly {
    constructor(t) { this.t = t || new Map(); }
    static c(k) { const m = new MPoly(); if (!k.isZero()) m.t.set("", k); return m; }
    static v(n) { const m = new MPoly(); m.t.set(n, q(1)); return m; }
    add(b) { const r = new Map(this.t); b.t.forEach((k, key) => { const s = (r.get(key) || q(0)).add(k); if (s.isZero()) r.delete(key); else r.set(key, s); }); return new MPoly(r); }
    neg() { const r = new Map(); this.t.forEach((k, key) => r.set(key, k.neg())); return new MPoly(r); }
    sub(b) { return this.add(b.neg()); }
    scale(c) { if (c.isZero()) return new MPoly(); const r = new Map(); this.t.forEach((k, key) => r.set(key, k.mul(c))); return new MPoly(r); }
    mul(b) {
      let r = new MPoly();
      this.t.forEach((k1, a1) => b.t.forEach((k2, a2) => {
        const m = parseKey(a1), m2 = parseKey(a2); Object.keys(m2).forEach(v => m[v] = (m[v] || 0) + m2[v]);
        const one = new MPoly(); one.t.set(monoKey(m), k1.mul(k2)); r = r.add(one);
      }));
      return r;
    }
    pow(k) { let r = MPoly.c(q(1)); for (let i = 0; i < k; i++) r = r.mul(this); return r; }
    deg() { let d = 0; this.t.forEach((k, key) => { const m = parseKey(key); d = Math.max(d, Object.values(m).reduce((s, x) => s + x, 0)); }); return d; }
    isConst() { return [...this.t.keys()].every(k => k === ""); }
    constTerm() { return this.t.get("") || q(0); }
    vars() { const s = new Set(); this.t.forEach((k, key) => Object.keys(parseKey(key)).forEach(v => s.add(v))); return s; }
    termCount() { return this.t.size; }
    toAst() {
      const keys = [...this.t.keys()].sort((a, b) => {
        const da = Object.values(parseKey(a)).reduce((s, x) => s + x, 0), db = Object.values(parseKey(b)).reduce((s, x) => s + x, 0);
        if (da !== db) return db - da;
        const ma = parseKey(a), mb = parseKey(b), vs = [...new Set([...Object.keys(ma), ...Object.keys(mb)])].sort();
        for (const v of vs) { const x = ma[v] || 0, y = mb[v] || 0; if (x !== y) return y - x; }
        return 0;
      });
      if (!keys.length) return N.num(q(0));
      let ast = null;
      keys.forEach((key, i) => {
        const k = this.t.get(key), m = parseKey(key), neg = k.sign() < 0, ka = k.abs();
        let base = null;
        Object.keys(m).sort().forEach(v => { const f = m[v] === 1 ? N.v(v) : N.pow(N.v(v), N.num(q(m[v]))); base = base ? Object.assign(N.mul(base, f), { imp: true }) : f; });
        let t = base ? (ka.isOne() ? base : Object.assign(N.mul(N.num(ka), base), { imp: true })) : N.num(ka);
        if (i === 0) ast = neg ? (t.t === "num" ? N.num(t.q.neg()) : N.neg(t)) : t;
        else ast = neg ? N.sub(ast, t) : N.add(ast, t);
      });
      return ast;
    }
  }
  E.MPoly = MPoly;
  function toMPoly(a) {
    switch (a.t) {
      case "num": return MPoly.c(a.q);
      case "var": return MPoly.v(a.n);
      case "neg": { const x = toMPoly(a.a); return x && x.neg(); }
      case "bin": {
        const l = toMPoly(a.l); if (!l) return null;
        if (a.op === "^") { const e = evalExact(a.r); if (!e || !e.isInt() || e.n < 0n || e.n > 30n) return null; return l.pow(Number(e.n)); }
        const r = toMPoly(a.r); if (!r) return null;
        if (a.op === "+") return l.add(r); if (a.op === "-") return l.sub(r); if (a.op === "*") return l.mul(r);
        if (a.op === "/") { if (!r.isConst() || r.constTerm().isZero()) return null; return l.scale(r.constTerm().inv()); }
      }
      default: { if (E.vars(a).size === 0) { const c = evalExact(a); return c ? MPoly.c(c) : null; } return null; }
    }
  }
  E.toMPoly = toMPoly;

  /* ======================= helpers ======================= */
  const T = E.tex;
  const eqTex = (l, r, rel = "=") => (typeof l === "string" ? l : T(l)) + " " + relTex(rel) + " " + (typeof r === "string" ? r : T(r));
  const relTex = r => ({ "=": "=", "<": "<", ">": ">", "<=": "\\le", ">=": "\\ge", "!=": "\\ne" }[r] || r);
  E.relTex = relTex;
  const qTex = x => x.toTeX();
  const containsDiv = a => a && (a.t === "bin" ? (a.op === "/" && E.has(a.r, "__any") ? true : (a.op === "/" || containsDiv(a.l) || containsDiv(a.r))) : (a.t === "neg" || a.t === "fact") ? containsDiv(a.a) : a.t === "fn" ? a.a.some(containsDiv) : false);
  const containsParenProduct = a => a && a.t === "bin" && ((a.op === "*" && ((a.l.t === "bin" && "+-".includes(a.l.op)) || (a.r.t === "bin" && "+-".includes(a.r.op)))) || (a.op === "^" && a.l.t === "bin" && "+-".includes(a.l.op)) || containsParenProduct(a.l) || containsParenProduct(a.r)) || (a && a.t === "neg" && containsParenProduct(a.a));
  function divisorsBig(n) {
    n = n < 0n ? -n : n; if (n === 0n) return [0n];
    if (n > 10n ** 12n) return [1n, n];
    const small = [], large = [];
    for (let i = 1n; i * i <= n; i++) if (n % i === 0n) { small.push(i); if (i * i !== n) large.unshift(n / i); }
    return small.concat(large);
  }
  E.divisorsBig = divisorsBig;

  /* square-free decomposition of a non-negative integer: n = k^2 * m */
  function sqrtParts(n) {
    let k = 1n, m = n;
    for (let p = 2n; p * p <= m; p++) { while (m % (p * p) === 0n) { m /= p * p; k *= p; } }
    return [k, m];
  }
  E.sqrtParts = sqrtParts;
  /* sqrt of rational -> {k: Q, m: BigInt}  meaning k*sqrt(m) */
  function sqrtQ(x) {
    const [k1, m1] = sqrtParts(x.n * x.d); /* sqrt(n/d) = sqrt(n*d)/d */
    return { k: new Q(k1, x.d), m: m1 };
  }
  /* exact value  A + B*sqrt(m)  (or complex when im) */
  function surdAst(A, B, m, sign, im) {
    const rad = m === 1n ? null : N.fn("sqrt", N.num(new Q(m)));
    let part = rad ? (B.isOne() ? rad : Object.assign(N.mul(N.num(B), rad), { imp: true })) : N.num(B);
    if (im) part = rad || !B.isOne() ? Object.assign(N.mul(part, N.v("i")), { imp: true }) : N.v("i");
    if (A.isZero()) return sign < 0 ? N.neg(part) : part;
    return sign < 0 ? N.sub(N.num(A), part) : N.add(N.num(A), part);
  }
  function surdTexFraction(A, B, m, im) { /* (p ± r√m)/D */
    const D = blcm(A.d, B.d), p = A.n * (D / A.d), r = B.n * (D / B.d);
    const rad = (m === 1n ? "" : "\\sqrt{" + m + "}") + (im ? "\\,i" : "");
    const rpart = (r === 1n && rad ? "" : r.toString()) + rad;
    const top = (p === 0n ? "" : p.toString() + " ") + "\\pm " + rpart;
    return D === 1n ? top : "\\frac{" + top + "}{" + D + "}";
  }

  /* numeric polynomial roots (Durand–Kerner), returns complex [re,im][] */
  function numericRoots(p) {
    const n = p.deg(); if (n < 1) return [];
    const a = p.c.map(x => x.num()), lead = a[n], c = a.map(x => x / lead);
    let roots = []; for (let i = 0; i < n; i++) { const ang = 2 * Math.PI * i / n + 0.4; roots.push([0.9 * Math.cos(ang), 0.9 * Math.sin(ang)]); }
    const R = 1 + Math.max(...c.slice(0, n).map(Math.abs));
    roots = roots.map(([x, y]) => [x * R, y * R]);
    const mul = (A, B) => [A[0] * B[0] - A[1] * B[1], A[0] * B[1] + A[1] * B[0]];
    const div = (A, B) => { const d = B[0] * B[0] + B[1] * B[1]; return [(A[0] * B[0] + A[1] * B[1]) / d, (A[1] * B[0] - A[0] * B[1]) / d]; };
    const ev = z => { let r = [1, 0]; for (let i = n - 1; i >= 0; i--) { r = mul(r, z); r[0] += c[i]; } return r; };
    for (let it = 0; it < 800; it++) {
      let delta = 0;
      roots = roots.map((z, i) => {
        let den = [1, 0]; roots.forEach((w, j) => { if (i !== j) den = mul(den, [z[0] - w[0], z[1] - w[1]]); });
        const step = div(ev(z), den); delta = Math.max(delta, Math.hypot(step[0], step[1]));
        return [z[0] - step[0], z[1] - step[1]];
      });
      if (delta < 1e-14) break;
    }
    /* polish real roots with Newton */
    const f = x => p.evalN(x), df = p.deriv();
    return roots.map(([x, y]) => {
      if (Math.abs(y) < 1e-7 * Math.max(1, Math.abs(x))) { for (let k = 0; k < 30; k++) { const d = df.evalN(x); if (!d) break; const nx = x - f(x) / d; if (!Number.isFinite(nx)) break; if (Math.abs(nx - x) < 1e-15) { x = nx; break; } x = nx; } return [x, 0]; }
      return [x, y];
    });
  }
  E.numericRoots = numericRoots;
  const realRootsNum = p => numericRoots(p).filter(r => r[1] === 0).map(r => r[0]).sort((a, b) => a - b).filter((x, i, arr) => i === 0 || Math.abs(x - arr[i - 1]) > 1e-9);

  /* rational roots by the rational root theorem */
  function rationalRoots(p) {
    const [, prim] = p.primitive(); const res = [];
    let P = prim;
    const low = P.lowDeg(); if (low > 0) { res.push(q(0)); P = new Poly(P.c.slice(low)); }
    if (P.deg() < 1) return res;
    const a0 = P.co(0).n, an = P.lead().n;
    const ps = divisorsBig(a0), qs = divisorsBig(an);
    if (ps.length * qs.length > 20000) return res;
    const seen = new Set();
    for (const pp of ps) for (const qq of qs) for (const s of [1n, -1n]) {
      const r = new Q(s * pp, qq), key = r.toString(); if (seen.has(key)) continue; seen.add(key);
      if (P.evalQ(r).isZero()) res.push(r);
    }
    return res;
  }
  E.rationalRoots = rationalRoots;

  /* ======================= factoring with steps ======================= */
  /* returns {factors:[{p:Poly, m:int}], k: Q, steps} with original = k * prod(p^m) */
  function factorPoly(P, v, steps) {
    steps = steps || [];
    const [cont, prim] = P.primitive();
    const factors = [];
    let k = cont, R = prim;
    const low = R.lowDeg();
    const gcfParts = [];
    if (!k.isOne()) gcfParts.push(k.toTeX());
    if (low > 0) gcfParts.push(low === 1 ? v : v + "^{" + low + "}");
    if (low > 0) { factors.push({ p: Poly.x(), m: low }); R = new Poly(R.c.slice(low)); }
    if (gcfParts.length && R.deg() >= 1) steps.push(step(tr("فاکتورگیری از عامل مشترک", "Factor out the common factor"), T(P.toAst(v)) + " = " + gcfParts.join(" ") + T(N.num(q(1))).replace(/^1$/, "") + "\\left(" + R.tex(v) + "\\right)", tr("بزرگ‌ترین عامل مشترک همهٔ جمله‌ها بیرون کشیده می‌شود.", "The greatest common factor of all terms is pulled out.")));
    const work = [R];
    const done = [];
    while (work.length) {
      const F = work.pop();
      if (F.deg() <= 1) { if (F.deg() === 1) done.push(F); continue; }
      const terms = F.c.filter(x => !x.isZero()).length;
      /* difference of squares a^2 x^(2k) - b^2 */
      if (terms === 2 && F.deg() % 2 === 0 && F.co(0).sign() < 0 && F.lead().sign() > 0) {
        const n = F.deg() / 2, A = E.qRoot(F.lead(), q(1, 2)), B = E.qRoot(F.co(0).neg(), q(1, 2));
        if (A && B) {
          const xa = n === 1 ? Poly.x() : Poly.x(n);
          const f1 = xa.scale(A).sub(Poly.const(B)), f2 = xa.scale(A).add(Poly.const(B));
          steps.push(step(tr("اتحاد مزدوج (تفاضل دو مربع)", "Difference of two squares"), F.tex(v) + " = \\left(" + f1.tex(v) + "\\right)\\left(" + f2.tex(v) + "\\right)", tr("از اتحاد a² − b² = (a − b)(a + b) استفاده می‌کنیم.", "We use the identity a² − b² = (a − b)(a + b).")));
          work.push(f1, f2); continue;
        }
      }
      /* sum / difference of cubes */
      if (terms === 2 && F.deg() === 3) {
        const A = E.qRoot(F.lead(), q(1, 3)), B = E.qRoot(F.co(0), q(1, 3));
        if (A && B) {
          const lin = Poly.x().scale(A).add(Poly.const(B)), quad = new Poly([B.mul(B), A.mul(B).neg(), A.mul(A)]);
          const sum = F.co(0).sign() > 0;
          steps.push(step(sum ? tr("اتحاد مجموع مکعب‌ها", "Sum of cubes identity") : tr("اتحاد تفاضل مکعب‌ها", "Difference of cubes identity"), F.tex(v) + " = \\left(" + lin.tex(v) + "\\right)\\left(" + quad.tex(v) + "\\right)", sum ? "a³ + b³ = (a + b)(a² − ab + b²)" : "a³ − b³ = (a − b)(a² + ab + b²)"));
          work.push(lin, quad); continue;
        }
      }
      if (F.deg() === 2) {
        const a = F.co(2), b = F.co(1), c = F.co(0), disc = b.mul(b).sub(q(4).mul(a).mul(c));
        const sq = disc.sign() >= 0 ? E.qRoot(disc, q(1, 2)) : null;
        if (sq) {
          const r1 = b.neg().add(sq).div(a.mul(q(2))), r2 = b.neg().sub(sq).div(a.mul(q(2)));
          /* integer factors (px+q)(rx+s) */
          const f1 = new Poly([r1.neg().mul(q(r1.d)), q(r1.d)]), f2 = new Poly([r2.neg().mul(q(r2.d)), q(r2.d)]);
          const rest = a.div(q(r1.d * r2.d));
          if (r1.eq(r2)) {
            steps.push(step(tr("مربع کامل", "Perfect square"), F.tex(v) + " = " + (rest.isOne() ? "" : rest.toTeX()) + "\\left(" + f1.tex(v) + "\\right)^{2}", tr("عبارت مربع کامل است: a² ± 2ab + b² = (a ± b)²", "The expression is a perfect square: a² ± 2ab + b² = (a ± b)²")));
            if (!rest.isOne()) k = k.mul(rest);
            done.push(f1, f1); continue;
          }
          const ac = a.mul(c);
          const note = a.isOne() ? tr("دو عدد پیدا می‌کنیم که حاصل‌ضربشان ", "We look for two numbers whose product is ") + qTex(c) + tr(" و مجموعشان ", " and whose sum is ") + qTex(b) + tr(" باشد: ", ": ") + r1.neg().toTeX() + tr(" و ", " and ") + r2.neg().toTeX() + "."
            : tr("روش ac: دو عدد با حاصل‌ضرب ac = ", "ac method: find two numbers with product ac = ") + qTex(ac) + tr(" و مجموع b = ", " and sum b = ") + qTex(b) + tr(" پیدا می‌کنیم و جملهٔ وسط را می‌شکنیم.", ", then split the middle term.");
          steps.push(step(tr("تجزیهٔ سه‌جمله‌ای درجه دو", "Factor the quadratic trinomial"), F.tex(v) + " = " + (rest.isOne() ? "" : rest.toTeX()) + "\\left(" + f1.tex(v) + "\\right)\\left(" + f2.tex(v) + "\\right)", note));
          if (!rest.isOne()) k = k.mul(rest);
          done.push(f1, f2); continue;
        }
        done.push(F); continue; /* irreducible over Q */
      }
      /* higher degree: rational root */
      const rr = rationalRoots(F).filter(r => !r.isZero());
      if (rr.length) {
        const r = rr[0], lin = new Poly([r.neg().mul(q(r.d)), q(r.d)]);
        const [quo] = F.divmod(lin);
        steps.push(step(tr("قضیهٔ ریشهٔ گویا و تقسیم چندجمله‌ای", "Rational root theorem and polynomial division"), "P\\left(" + r.toTeX() + "\\right) = 0 \\;\\Rightarrow\\; " + F.tex(v) + " = \\left(" + lin.tex(v) + "\\right)\\left(" + quo.tex(v) + "\\right)", tr("نامزدهای ریشه به شکل ±(مقسوم‌علیه جملهٔ ثابت)/(مقسوم‌علیه ضریب اول) هستند. با آزمودن آن‌ها، ", "Candidate roots have the form ±(divisor of the constant term)/(divisor of the leading coefficient). Testing them, ") + r.toTeX() + tr(" ریشه است؛ پس (", " is a root; so (") + lin.tex(v) + tr(") عامل است و با تقسیم، عامل دیگر به دست می‌آید.", ") is a factor, and dividing gives the other factor.")));
        work.push(lin, quo); continue;
      }
      /* biquadratic a x^4 + b x^2 + c */
      if (F.deg() === 4 && F.co(1).isZero() && F.co(3).isZero()) {
        const inner = new Poly([F.co(0), F.co(2), F.co(4)]);
        const sub = [];
        const fr = factorPoly(inner, "u", sub);
        if (fr.factors.length > 1 || (fr.factors[0] && fr.factors[0].m > 1)) {
          steps.push(step(tr("تغییر متغیر u = ", "Substitute u = ") + v + "²", F.tex(v) + " \\;\\to\\; " + inner.tex("u"), tr("عبارت فقط توان‌های زوج دارد.", "The expression has only even powers.")));
          fr.factors.forEach(f => { const back = new Poly(f.p.c.flatMap((x, i) => i === 0 ? [x] : [q(0), x])); for (let i = 0; i < f.m; i++) work.push(back); });
          k = k.mul(fr.k); continue;
        }
      }
      done.push(F);
    }
    /* group equal factors */
    done.forEach(F => {
      /* make leading coeff positive integer form */
      let [c, p] = F.primitive(); k = k.mul(c);
      const ex = factors.find(f => f.p.eq(p)); if (ex) ex.m++; else factors.push({ p, m: 1 });
    });
    const isMono = f => f.p.deg() === 1 && f.p.co(0).isZero();
    const keyOf = f => isMono(f) ? -1e18 : f.p.deg() === 1 ? 0 : 1;
    factors.sort((a, b) => keyOf(a) - keyOf(b) || (a.p.deg() === 1 && b.p.deg() === 1 ? a.p.co(0).neg().div(a.p.co(1)).num() - b.p.co(0).neg().div(b.p.co(1)).num() : a.p.deg() - b.p.deg()));
    return { k, factors, steps };
  }
  E.factorPoly = factorPoly;
  function factorsTex(k, factors, v) {
    const parts = factors.map(f => {
      const isX = f.p.deg() === 1 && f.p.co(0).isZero() && f.p.co(1).isOne();
      const base = isX ? v : "\\left(" + f.p.tex(v) + "\\right)";
      return f.m > 1 ? base + "^{" + f.m + "}" : base;
    });
    /* put monomial first */
    let s = parts.join("");
    if (factors.length === 1 && factors[0].m === 1 && k.isOne()) s = factors[0].p.tex(v);
    if (k.isOne()) return s || "1";
    if (k.eq(q(-1))) return "-" + s;
    return k.toTeX() + (s ? " " + s : "");
  }
  E.factorsTex = factorsTex;

  /* ======================= arithmetic with order of operations ======================= */
  const isValue = a => a.t === "num" || a.t === "fl";
  const valNum = a => (a.t === "num" ? a.q.num() : a.v);
  function reduceOne(a) {
    /* priority: fn/fact (innermost), ^, * /, + -  ; returns {node, desc} */
    let best = null;
    const order = { fn: 0, fact: 0, neg: 0, "^": 1, "*": 2, "/": 2, "+": 3, "-": 3 };
    let idx = 0;
    (function walk(n, path) {
      if (n.t === "bin") {
        walk(n.l, path.concat("l")); walk(n.r, path.concat("r"));
        if (isValue(n.l) && isValue(n.r)) { const pr = order[n.op]; if (!best || pr < best.pr) best = { pr, path, n, i: idx }; }
      } else if (n.t === "fn") { n.a.forEach((x, i) => walk(x, path.concat("a" + i))); if (n.a.every(isValue)) { if (!best || 0 < best.pr) best = { pr: 0, path, n }; } }
      else if (n.t === "fact" || n.t === "neg") { walk(n.a, path.concat("a")); if (isValue(n.a)) { if (!best || 0 < best.pr) best = { pr: 0, path, n }; } }
      else if (n.t === "const") { if (!best || 0 < best.pr) best = { pr: 0, path, n }; }
      idx++;
    })(a, []);
    if (!best) return null;
    const n = best.n;
    let val, desc, title;
    const exactOrFl = (x, flv) => x ? N.num(x) : N.fl(flv);
    if (n.t === "const") { val = N.fl(evalNum(n)); title = tr("مقدار ثابت", "Constant value"); desc = T(n) + " \\approx " + E.trimNum(val.v, 6); }
    else if (n.t === "neg") { val = n.a.t === "num" ? N.num(n.a.q.neg()) : N.fl(-n.a.v); title = tr("قرینه", "Negation"); desc = T(n) + " = " + T(val); }
    else if (n.t === "fact") {
      const ex = evalExact(n); val = ex ? N.num(ex) : N.fl(evalNum(n)); title = tr("فاکتوریل", "Factorial");
      const k = ex && n.a.t === "num" ? Number(n.a.q.n) : 0;
      desc = T(n) + " = " + (k > 1 && k <= 8 ? Array.from({ length: k }, (_, i) => k - i).join(" \\times ") + " = " : "") + T(val);
    } else if (n.t === "fn") {
      const ex = evalExact(n);
      let exactStr = null;
      if (!ex && E.nd && root.nerdamer) { try { const s = root.nerdamer(E.str(n)).toString(); if (/^-?\d+(\/\d+)?$/.test(s)) exactStr = Q.parse(s.split("/")[0]).div(Q.parse(s.split("/")[1] || "1")); } catch (e) { } }
      val = ex ? N.num(ex) : exactStr ? N.num(exactStr) : N.fl(evalNum(n));
      title = { sqrt: tr("ریشهٔ دوم", "Square root"), abs: tr("قدرمطلق", "Absolute value"), ln: tr("لگاریتم طبیعی", "Natural logarithm"), log: tr("لگاریتم", "Logarithm"), sin: tr("سینوس", "Sine"), cos: tr("کسینوس", "Cosine"), tan: tr("تانژانت", "Tangent") }[n.n] || tr("محاسبهٔ تابع", "Evaluate the function");
      if (val.t === "fl" && !Number.isFinite(val.v)) throw new MathError(tr("مقدار ", "The value ") + T(n) + tr(" تعریف نشده است (خارج از دامنه).", " is undefined (outside the domain)."));
      desc = T(n) + (val.t === "fl" ? " \\approx " : " = ") + T(val);
    } else {
      const L = n.l, R = n.r, op = n.op;
      title = { "+": tr("جمع", "Add"), "-": tr("تفریق", "Subtract"), "*": tr("ضرب", "Multiply"), "/": tr("تقسیم", "Divide"), "^": tr("توان", "Power") }[op];
      if (L.t === "num" && R.t === "num") {
        const a = L.q, b = R.q;
        if (op === "/" && b.isZero()) throw new MathError(tr("تقسیم بر صفر تعریف نشده است.", "Division by zero is undefined."));
        if (op === "^") { const ex = evalExact(n); val = exactOrFl(ex, evalNum(n)); }
        else val = N.num(op === "+" ? a.add(b) : op === "-" ? a.sub(b) : op === "*" ? a.mul(b) : a.div(b));
        if ((op === "+" || op === "-") && (!a.isInt() || !b.isInt())) {
          const D = blcm(a.d, b.d);
          desc = T(n) + " = \\frac{" + a.n * (D / a.d) + "}{" + D + "} " + op + " \\frac{" + b.n * (D / b.d) + "}{" + D + "} = " + T(val);
          title += tr(" کسرها با مخرج مشترک ", " fractions with common denominator ") + fa(D.toString());
        } else if (op === "*" && (!a.isInt() || !b.isInt())) {
          desc = T(n) + " = \\frac{" + a.n + " \\times " + (b.n < 0n ? "(" + b.n + ")" : b.n) + "}{" + a.d + " \\times " + b.d + "} = " + T(val); title += tr(" کسرها: صورت در صورت، مخرج در مخرج", " fractions: numerator × numerator, denominator × denominator");
        } else if (op === "/" && (!a.isInt() || !b.isInt())) {
          desc = T(n) + " = " + T(N.num(a)) + " \\times " + T(N.num(b.inv())) + " = " + T(val); title += tr(" کسرها: ضرب در معکوس", " fractions: multiply by the reciprocal");
        } else if (op === "^" && b.isInt() && b.n > 1n && b.n <= 6n && a.isInt()) {
          desc = T(n) + " = " + Array(Number(b.n)).fill(a.sign() < 0 ? "(" + a.n + ")" : a.n.toString()).join(" \\times ") + " = " + T(val);
        } else desc = T(n) + " = " + T(val);
      } else {
        const x = valNum(L), y = valNum(R);
        const r = op === "+" ? x + y : op === "-" ? x - y : op === "*" ? x * y : op === "/" ? x / y : Math.pow(x, y);
        if (!Number.isFinite(r)) throw new MathError(tr("نتیجه تعریف نشده است.", "The result is undefined."));
        val = N.fl(r); desc = T(n) + " \\approx " + E.trimNum(r, 8);
      }
    }
    /* replace at path */
    const rep = (node, path) => {
      if (!path.length) return val;
      const [h, ...t] = path;
      if (h === "l" || h === "r") return { ...node, [h]: rep(node[h], t) };
      if (h === "a") return { ...node, a: rep(node.a, t) };
      const i = +h.slice(1); const arr = node.a.slice(); arr[i] = rep(arr[i], t); return { ...node, a: arr };
    };
    return { node: rep(a, best.path), title, desc };
  }
  function arithmetic(a) {
    const steps = [];
    let cur = a, guard = 0;
    while (!isValue(cur) && guard++ < 200) {
      const r = reduceOne(cur); if (!r) break;
      steps.push(step(r.title, r.desc, null));
      cur = r.node;
      if (!isValue(cur)) steps[steps.length - 1].tex += "\\\\[4pt] \\Rightarrow\\; " + T(cur);
    }
    if (steps.length === 1 && steps[0].tex === T(a) + " = " + T(cur)) { /* trivial */ }
    let answer = T(cur), extra = [];
    if (cur.t === "num" && !cur.q.isInt()) { const d = cur.q.toDecimal(); extra.push(d ? "= " + d : "\\approx " + E.trimNum(cur.q.num(), 10)); }
    if (cur.t === "fl" && root.nerdamer) { try { const ex = E.casAst(E.str(a)); if (ex.t !== "fl" && !(ex.t === "num")) answer = T(ex) + " \\approx " + T(cur); } catch (e) { } }
    return { answer: answer + (extra.length ? " " + extra.join(" ") : ""), steps, value: cur };
  }
  E.arithmetic = arithmetic;

  /* ======================= expand / simplify / factor ======================= */
  function expandSteps(a) {
    const steps = [];
    const mp = toMPoly(a);
    if (!mp) {
      const r = E.expandAst(a);
      return { answer: T(r), steps: [step(tr("بسط با موتور نمادین", "Expand with the symbolic engine"), T(a) + " = " + T(r), tr("این عبارت شامل توابع است؛ بسط به‌صورت مستقیم انجام شد.", "This expression contains functions; it was expanded directly."))] };
    }
    /* describe each product of sums */
    (function walk(n) {
      if (n.t !== "bin") { if (n.t === "neg") walk(n.a); return; }
      walk(n.l); walk(n.r);
      const isSum = x => x.t === "bin" && (x.op === "+" || x.op === "-");
      if (n.op === "^" && isSum(n.l)) {
        const e = evalExact(n.r);
        if (e && e.eq(q(2))) { const r = toMPoly(n); steps.push(step(tr("اتحاد مربع دوجمله‌ای", "Square of a binomial"), T(n) + " = " + T(r.toAst()), "(a ± b)² = a² ± 2ab + b²")); }
        else if (e && e.eq(q(3))) { const r = toMPoly(n); steps.push(step(tr("اتحاد مکعب دوجمله‌ای", "Cube of a binomial"), T(n) + " = " + T(r.toAst()), "(a ± b)³ = a³ ± 3a²b + 3ab² ± b³")); }
        else if (e) { const r = toMPoly(n); steps.push(step(tr("بسط توان", "Expand the power"), T(n) + " = " + T(r.toAst()), tr("با ضرب متوالی یا بسط دوجمله‌ای نیوتن", "By repeated multiplication or the binomial theorem"))); }
      }
      if (n.op === "*" && (isSum(n.l) || isSum(n.r))) {
        const L = toMPoly(n.l), R = toMPoly(n.r); if (!L || !R) return;
        const la = splitTerms(L.toAst()), ra = splitTerms(R.toAst());
        if (la.length * ra.length <= 12) {
          const prods = []; la.forEach(x => ra.forEach(y => prods.push(T(x) === "1" ? T(y) : T(y) === "1" ? T(x) : (needP(x) ? "\\left(" + T(x) + "\\right)" : T(x)) + " \\cdot " + (needP(y) ? "\\left(" + T(y) + "\\right)" : T(y)))));
          steps.push(step(tr("خاصیت توزیع‌پذیری (پخش)", "Distributive property"), T(n) + " = " + prods.join(" + ") + " = " + T(toMPoly(n).toAst()), tr("هر جملهٔ اول در هر جملهٔ دوم ضرب می‌شود.", "Every term of the first factor multiplies every term of the second.")));
        }
      }
    })(a);
    const res = mp.toAst();
    steps.push(step(tr("جمع جمله‌های متشابه", "Combine like terms"), T(a) + " = " + T(res), tr("جمله‌هایی که متغیر و توان یکسان دارند با هم جمع می‌شوند.", "Terms with the same variables and powers are added together.")));
    return { answer: T(res), steps, result: res };
  }
  const needP = x => x.t === "num" ? x.q.sign() < 0 : x.t === "neg";
  function splitTerms(a) { /* top-level terms with sign */
    if (a.t === "bin" && a.op === "+") return splitTerms(a.l).concat(splitTerms(a.r));
    if (a.t === "bin" && a.op === "-") return splitTerms(a.l).concat(splitTerms(a.r).map(t => simp(N.neg(t))));
    return [a];
  }
  E.splitTerms = splitTerms;
  E.expandSteps = expandSteps;

  function factorSteps(a, v) {
    const vs = [...E.vars(a)];
    v = v || E.pickVar([a]);
    const P = vs.length <= 1 ? toPoly(a, v) : null;
    if (P) {
      if (P.deg() < 1) return { answer: T(a), steps: [step(tr("عبارت ثابت", "Constant expression"), T(a), tr("عبارت متغیری ندارد.", "The expression has no variable."))] };
      const steps = [];
      const expanded = P.toAst(v);
      if (T(expanded) !== T(a)) steps.push(step(tr("نوشتن به شکل استاندارد", "Write in standard form"), T(a) + " = " + T(expanded), tr("جمله‌ها از بزرگ‌ترین توان مرتب می‌شوند.", "Terms are ordered from the highest power down.")));
      const fr = factorPoly(P, v, steps);
      const ans = factorsTex(fr.k, fr.factors, v);
      const irreducible = fr.factors.filter(f => f.p.deg() >= 2);
      if (!steps.length || (fr.factors.length === 1 && fr.factors[0].m === 1 && fr.k.isOne())) steps.push(step(tr("بررسی تجزیه", "Check factoring"), ans, tr("این چندجمله‌ای روی اعداد گویا تجزیه‌پذیر نیست.", "This polynomial cannot be factored over the rational numbers.")));
      else steps.push(step(tr("نتیجهٔ تجزیه", "Factored result"), T(a) + " = " + ans, irreducible.length ? tr("عامل‌های درجهٔ دو یا بالاتر باقی‌مانده روی اعداد گویا تجزیه نمی‌شوند.", "The remaining factors of degree two or higher do not factor over the rational numbers.") : null));
      return { answer: ans, steps };
    }
    /* multivariate: common factor + nerdamer */
    const steps = [];
    const mp = toMPoly(a);
    if (mp) {
      const terms = [...mp.t.entries()];
      let g = 0n, L = 1n; terms.forEach(([, k]) => { g = bgcd(g, k.n); L = blcm(L, k.d); });
      const common = {}; let first = true;
      terms.forEach(([key]) => { const m = parseKey(key); if (first) { Object.assign(common, m); first = false; } else Object.keys(common).forEach(v2 => common[v2] = Math.min(common[v2], m[v2] || 0)); });
      const cm = new MPoly(); const ck = new Q(g, L); cm.t.set(monoKey(common), ck);
      if (!(ck.isOne() && monoKey(common) === "")) {
        let rest = new MPoly(); mp.t.forEach((k, key) => { const m = parseKey(key); Object.keys(common).forEach(v2 => m[v2] -= common[v2]); const one = new MPoly(); one.t.set(monoKey(m), k.div(ck)); rest = rest.add(one); });
        steps.push(step(tr("فاکتورگیری از عامل مشترک", "Factor out the common factor"), T(a) + " = " + T(cm.toAst()) + "\\left(" + T(rest.toAst()) + "\\right)", tr("بزرگ‌ترین عامل مشترک ضریب‌ها و متغیرها بیرون کشیده می‌شود.", "The greatest common factor of the coefficients and variables is pulled out.")));
        let restF = null; try { restF = E.casAst("factor(" + E.str(rest.toAst()) + ")"); } catch (e) { }
        const rf = restF && T(restF) !== T(rest.toAst()) ? T(restF) : "\\left(" + T(rest.toAst()) + "\\right)";
        if (restF && T(restF) !== T(rest.toAst())) steps.push(step(tr("تجزیهٔ عامل باقی‌مانده", "Factor the remaining factor"), T(rest.toAst()) + " = " + T(restF), null));
        const ans = T(cm.toAst()) + (rf.startsWith("\\left(") ? "" : " ") + rf;
        return { answer: ans, steps };
      }
    }
    try {
      const r = E.casAst("factor(" + E.str(a) + ")");
      steps.push(step(tr("تجزیهٔ کامل", "Complete factorization"), T(a) + " = " + T(r), null));
      return { answer: T(r), steps };
    } catch (e) { throw new MathError(tr("تجزیهٔ این عبارت ممکن نشد.", "Could not factor this expression.")); }
  }
  E.factorSteps = factorSteps;

  function simplifySteps(a) {
    const vs = [...E.vars(a)];
    const steps = [];
    if (vs.length === 0) { const r = arithmetic(a); return r; }
    if (vs.length === 1) {
      const v = vs[0], R = toRat(a, v);
      if (R && !R.isPoly()) {
        const nf = factorPoly(R.n, v, []), df = factorPoly(R.d, v, []);
        steps.push(step(tr("ترکیب کسرها در یک کسر", "Combine into a single fraction"), T(a) + " = \\frac{" + R.n.tex(v) + "}{" + R.d.tex(v) + "}", tr("با مخرج مشترک، همهٔ جمله‌ها را یک کسر می‌کنیم.", "Using a common denominator, all terms become one fraction.")));
        steps.push(step(tr("تجزیهٔ صورت و مخرج", "Factor numerator and denominator"), "\\frac{" + factorsTex(nf.k, nf.factors, v) + "}{" + factorsTex(df.k, df.factors, v) + "}", null));
        const g = polyGcd(R.n, R.d);
        const red = R.reduce();
        const restr = realRootsExact(R.d).map(r => v + " \\ne " + r.tex);
        if (g.deg() > 0) steps.push(step(tr("حذف عامل‌های مشترک", "Cancel common factors"), "\\frac{" + red.n.tex(v) + "}{" + red.d.tex(v) + "}", tr("عامل (", "The factor (") + g.tex(v) + tr(") از صورت و مخرج حذف می‌شود", ") cancels from the numerator and denominator") + (restr.length ? tr("؛ با شرط ", "; provided ") + restr.join(tr("، ", ", ")) : "") + "."));
        const nf2 = factorPoly(red.n, v, []), df2 = factorPoly(red.d, v, []);
        let ans = red.d.isConst() ? T(red.n.scale(red.d.co(0).inv()).toAst(v)) : "\\frac{" + factorsTex(nf2.k, nf2.factors, v) + "}{" + factorsTex(df2.k, df2.factors, v) + "}";
        return { answer: ans, steps, note: restr.length ? tr("دامنه: ", "Domain: ") + restr.join(tr("، ", ", ")) : null };
      }
      if (R && R.isPoly()) {
        const res = R.n.toAst(v);
        const ex = expandSteps(a); ex.answer = T(res); return ex;
      }
    }
    if (toMPoly(a)) return expandSteps(a);
    const r = E.simplifyAst(a);
    steps.push(step(tr("ساده‌سازی", "Simplify"), T(a) + " = " + T(r), tr("با قواعد جبری و اتحادهای مثلثاتی/لگاریتمی", "Using algebraic rules and trigonometric/logarithmic identities")));
    return { answer: T(r), steps };
  }
  E.simplifySteps = simplifySteps;

  /* exact real roots of a polynomial: [{val:number, tex, ast}] */
  function realRootsExact(P) {
    if (P.isConst()) return [];
    const fr = factorPoly(P, "x", []);
    const out = [];
    fr.factors.forEach(f => {
      const p = f.p;
      if (p.deg() === 1) { const r = p.co(0).neg().div(p.co(1)); out.push({ val: r.num(), tex: r.toTeX(), ast: N.num(r), m: f.m }); }
      else if (p.deg() === 2) {
        const a = p.co(2), b = p.co(1), c = p.co(0), D = b.mul(b).sub(q(4).mul(a).mul(c));
        if (D.sign() < 0) return;
        const { k, m } = sqrtQ(D); const A = b.neg().div(a.mul(q(2))), B = k.div(a.mul(q(2))).abs();
        [-1, 1].forEach(s => out.push({ val: A.num() + s * B.num() * Math.sqrt(Number(m)), tex: T(surdAst(A, B, m, s)), ast: surdAst(A, B, m, s), m: f.m }));
      } else realRootsNum(p).forEach(x => out.push({ val: x, tex: "\\approx " + E.trimNum(x, 6), ast: N.fl(x), m: f.m, approx: true }));
    });
    out.sort((x, y) => x.val - y.val);
    return out.filter((r, i) => i === 0 || Math.abs(r.val - out[i - 1].val) > 1e-10);
  }
  E.realRootsExact = realRootsExact;

  /* ======================= equations ======================= */
  function linearSteps(L, R, v, steps) {
    /* L, R ASTs, both linear in v */
    const Lr = toRat(L, v), Rr = toRat(R, v);
    let Lp = Lr.n, Rp = Rr.n;
    /* clear fractional coefficients */
    let D = 1n; [Lp, Rp].forEach(p => p.c.forEach(c => { D = blcm(D, c.d); }));
    if (containsParenProduct(L) || containsParenProduct(R)) {
      steps.push(step(tr("باز کردن پرانتزها", "Expand the parentheses"), eqTex(Lp.toAst(v), Rp.toAst(v)), tr("با خاصیت توزیع‌پذیری پرانتزها را باز و جمله‌های متشابه را جمع می‌کنیم.", "Use the distributive property to remove parentheses and combine like terms.")));
    } else if (T(Lp.toAst(v)) !== T(L) || T(Rp.toAst(v)) !== T(R)) {
      steps.push(step(tr("ساده کردن هر طرف", "Simplify each side"), eqTex(Lp.toAst(v), Rp.toAst(v)), tr("جمله‌های متشابه هر طرف را با هم جمع می‌کنیم.", "Combine like terms on each side.")));
    }
    if (D > 1n) {
      const k = new Q(D); Lp = Lp.scale(k); Rp = Rp.scale(k);
      steps.push(step(tr("حذف مخرج‌ها", "Clear the denominators"), eqTex(Lp.toAst(v), Rp.toAst(v)), tr("دو طرف را در مخرج مشترک ", "Multiply both sides by the common denominator ") + fa(D.toString()) + tr(" ضرب می‌کنیم.", ".")));
    }
    const a = Lp.co(1), b = Lp.co(0), c = Rp.co(1), d = Rp.co(0);
    if (!c.isZero()) {
      const cx = new Poly([q(0), c]);
      Lp = Lp.sub(cx); Rp = Rp.sub(cx);
      steps.push(step((c.sign() > 0 ? tr("تفریق ", "Subtract ") : tr("جمع ", "Add ")) + T(N.mul(N.num(c.abs()), N.v(v))).replace("1 " + v, v) + (c.sign() > 0 ? tr(" از", " from") : tr(" با", " to")) + tr(" دو طرف", " both sides"), eqTex(Lp.toAst(v), Rp.toAst(v)), tr("جمله‌های دارای ", "Move the terms containing ") + v + tr(" را به سمت چپ می‌بریم.", " to the left side.")));
    }
    if (!b.isZero()) {
      Lp = Lp.sub(Poly.const(b)); Rp = Rp.sub(Poly.const(b));
      steps.push(step((b.sign() > 0 ? tr("تفریق ", "Subtract ") + b.toTeX() + tr(" از", " from") : tr("جمع ", "Add ") + b.neg().toTeX() + tr(" با", " to")) + tr(" دو طرف", " both sides"), eqTex(Lp.toAst(v), Rp.toAst(v)), tr("عددهای ثابت را به سمت راست می‌بریم.", "Move the constants to the right side.")));
    }
    const A = Lp.co(1), B = Rp.co(0);
    if (A.isZero()) {
      if (B.isZero()) { steps.push(step(tr("نتیجه", "Result"), "0 = 0", tr("تساوی همیشه برقرار است؛ هر عدد حقیقی جواب است.", "The equality always holds; every real number is a solution."))); return { answer: v + " \\in \\mathbb{R}", sols: "all" }; }
      steps.push(step(tr("نتیجه", "Result"), "0 = " + B.toTeX(), tr("این تساوی هرگز برقرار نیست؛ معادله جواب ندارد.", "This equality never holds; the equation has no solution."))); return { answer: "\\varnothing", sols: [] };
    }
    const x = B.div(A);
    if (!A.isOne()) steps.push(step(tr("تقسیم دو طرف بر ", "Divide both sides by ") + A.toTeX(), v + " = \\frac{" + B.toTeX() + "}{" + A.toTeX() + "} = " + x.toTeX(), tr("ضریب ", "This removes the coefficient of ") + v + tr(" را حذف می‌کنیم.", ".")));
    return { answer: v + " = " + x.toTeX() + (x.isInt() ? "" : (x.toDecimal() ? " = " + x.toDecimal() : " \\approx " + E.trimNum(x.num(), 6))), sols: [N.num(x)], exact: [x] };
  }

  function quadraticSteps(P, v, steps) {
    const a = P.co(2), b = P.co(1), c = P.co(0);
    steps.push(step(tr("شکل استاندارد", "Standard form"), P.tex(v) + " = 0", "a = " + a.toTeX() + tr("، b = ", ", b = ") + b.toTeX() + tr("، c = ", ", c = ") + c.toTeX()));
    if (b.isZero()) {
      const rhs = c.neg().div(a);
      steps.push(step(tr("جداسازی ", "Isolate ") + v + "²", v + "^{2} = " + rhs.toTeX(), tr("جملهٔ ثابت را به طرف دیگر می‌بریم و بر a تقسیم می‌کنیم.", "Move the constant term to the other side and divide by a.")));
      if (rhs.sign() < 0) {
        const { k, m } = sqrtQ(rhs.neg());
        steps.push(step(tr("جذر دو طرف", "Take the square root of both sides"), v + " = \\pm\\sqrt{" + rhs.toTeX() + "}", tr("مربع هیچ عدد حقیقی منفی نیست؛ جواب‌ها مختلط‌اند.", "The square of a real number is never negative; the solutions are complex.")));
        const z = surdTexFraction(q(0), k, m, true);
        return { answer: v + " = " + z, sols: [], complex: true, note: tr("معادله جواب حقیقی ندارد.", "The equation has no real solution.") };
      }
      const { k, m } = sqrtQ(rhs);
      steps.push(step(tr("جذر دو طرف", "Take the square root of both sides"), v + " = \\pm\\sqrt{" + rhs.toTeX() + "} = " + surdTexFraction(q(0), k, m, false), tr("یادت باشد هر عدد مثبت دو ریشهٔ دوم دارد: مثبت و منفی.", "Remember: every positive number has two square roots, one positive and one negative.")));
      const sols = rhs.isZero() ? [N.num(q(0))] : [surdAst(q(0), k, m, -1), surdAst(q(0), k, m, 1)];
      return { answer: rhs.isZero() ? v + " = 0" : v + " = " + surdTexFraction(q(0), k, m, false), sols };
    }
    if (c.isZero()) {
      const r = b.neg().div(a);
      steps.push(step(tr("فاکتورگیری از ", "Factor out ") + v, v + "\\left(" + new Poly([b, a]).tex(v) + "\\right) = 0", tr("از هر دو جمله ", "Factor ") + v + tr(" فاکتور می‌گیریم.", " out of both terms.")));
      steps.push(step(tr("خاصیت حاصل‌ضرب صفر", "Zero-product property"), v + tr(" = 0 \\quad \\text{یا} \\quad ", " = 0 \\quad \\text{or} \\quad ") + new Poly([b, a]).tex(v) + " = 0", tr("اگر حاصل‌ضرب صفر باشد، دست‌کم یکی از عامل‌ها صفر است.", "If a product is zero, at least one of the factors is zero.")));
      const s = [q(0), r].sort((x, y) => x.cmp(y));
      return { answer: v + " = " + s.map(x => x.toTeX()).join(",\\; " + v + " = "), sols: s.map(x => N.num(x)) };
    }
    const disc = b.mul(b).sub(q(4).mul(a).mul(c));
    const sq = disc.sign() >= 0 ? E.qRoot(disc, q(1, 2)) : null;
    if (sq) {
      const fr = factorPoly(P, v, []);
      const r1 = b.neg().sub(sq).div(a.mul(q(2))), r2 = b.neg().add(sq).div(a.mul(q(2)));
      steps.push(step(tr("تجزیه", "Factor"), factorsTex(fr.k, fr.factors, v) + " = 0", a.isOne() ? tr("دو عدد با حاصل‌ضرب ", "Find two numbers with product ") + c.toTeX() + tr(" و مجموع ", " and sum ") + b.toTeX() + tr(" پیدا می‌کنیم.", ".") : tr("با روش ac یا مبین، سه‌جمله‌ای را تجزیه می‌کنیم.", "Factor the trinomial with the ac method or the discriminant.")));
      if (r1.eq(r2)) { steps.push(step(tr("ریشهٔ مضاعف", "Double root"), v + " = " + r1.toTeX(), tr("Δ = 0 است؛ معادله یک ریشهٔ تکراری دارد.", "Δ = 0; the equation has one repeated root."))); return { answer: v + " = " + r1.toTeX(), sols: [N.num(r1)] }; }
      steps.push(step(tr("خاصیت حاصل‌ضرب صفر", "Zero-product property"), fr.factors.map(f => f.p.tex(v) + " = 0").join(tr(" \\quad \\text{یا} \\quad ", " \\quad \\text{or} \\quad ")), tr("هر عامل را برابر صفر قرار می‌دهیم.", "Set each factor equal to zero.")));
      const s = [r1, r2].sort((x, y) => x.cmp(y));
      return { answer: v + " = " + s.map(x => x.toTeX()).join(",\\; " + v + " = "), sols: s.map(x => N.num(x)) };
    }
    steps.push(step(tr("فرمول کلی (دلتا)", "Quadratic formula"), v + " = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}, \\quad \\Delta = b^{2} - 4ac", tr("عبارت روی اعداد گویا تجزیه نمی‌شود؛ از فرمول کلی استفاده می‌کنیم.", "The expression does not factor over the rationals; we use the quadratic formula.")));
    steps.push(step(tr("محاسبهٔ Δ", "Compute Δ"), "\\Delta = \\left(" + b.toTeX() + "\\right)^{2} - 4\\left(" + a.toTeX() + "\\right)\\left(" + c.toTeX() + "\\right) = " + disc.toTeX(), disc.sign() > 0 ? tr("Δ > 0 ⇒ دو ریشهٔ حقیقی متمایز", "Δ > 0 ⇒ two distinct real roots") : tr("Δ < 0 ⇒ ریشهٔ حقیقی ندارد (دو ریشهٔ مختلط)", "Δ < 0 ⇒ no real roots (two complex roots)")));
    const { k, m } = sqrtQ(disc.abs());
    const A = b.neg().div(a.mul(q(2))), B = k.div(a.mul(q(2))).abs();
    const rad = (m === 1n ? k.toTeX() : (k.isOne() ? "" : k.toTeX()) + "\\sqrt{" + m + "}");
    steps.push(step(tr("جایگذاری در فرمول", "Substitute into the formula"), v + " = \\frac{" + b.neg().toTeX() + " \\pm " + (disc.sign() < 0 ? rad + "\\,i" : (m === 1n ? rad : "\\sqrt{" + disc.toTeX() + "}")) + "}{" + a.mul(q(2)).toTeX() + "}", m !== 1n && !k.isOne() ? "\\sqrt{" + disc.abs().toTeX() + "} = " + rad : null));
    const ans = v + " = " + surdTexFraction(A, B, m, disc.sign() < 0);
    if (disc.sign() < 0) return { answer: ans, sols: [], complex: true, note: tr("معادله ریشهٔ حقیقی ندارد؛ ریشه‌ها مختلط‌اند.", "The equation has no real roots; the roots are complex.") };
    const s1 = surdAst(A, B, m, -1), s2 = surdAst(A, B, m, 1);
    const approx = [evalNum(s1), evalNum(s2)].sort((x, y) => x - y).map(x => E.trimNum(x, 6));
    return { answer: ans, approx: v + " \\approx " + approx.join(",\\; "), sols: [s1, s2] };
  }

  function polySolveSteps(P, v, steps) {
    if (P.deg() === 2) return quadraticSteps(P, v, steps);
    steps.push(step(tr("شکل استاندارد", "Standard form"), P.tex(v) + " = 0", tr("همهٔ جمله‌ها را به یک طرف می‌بریم.", "Move all terms to one side.")));
    const fsteps = [];
    const fr = factorPoly(P, v, fsteps);
    fsteps.forEach(s => steps.push(s));
    if (fr.factors.length > 1 || (fr.factors[0] && fr.factors[0].m > 1)) steps.push(step(tr("خاصیت حاصل‌ضرب صفر", "Zero-product property"), factorsTex(fr.k, fr.factors, v) + " = 0", tr("هر عامل را جداگانه برابر صفر قرار می‌دهیم.", "Set each factor equal to zero separately.")));
    let sols = [], texs = [], approx = [], complexNote = false;
    fr.factors.forEach(f => {
      const p = f.p;
      if (p.deg() === 1) { const r = p.co(0).neg().div(p.co(1)); sols.push({ v: r.num(), ast: N.num(r), tex: r.toTeX() }); }
      else if (p.deg() === 2) {
        const sub = []; const r = quadraticSteps(p, v, sub);
        if (fr.factors.length > 1) steps.push(step(tr("حل عامل درجه دو: ", "Solve the quadratic factor: ") + p.tex(v) + " = 0", r.answer, null)); else sub.forEach(s => steps.push(s));
        if (r.complex) complexNote = true;
        (r.sols || []).forEach(s => sols.push({ v: evalNum(s), ast: s, tex: T(s) }));
      } else {
        const nr = numericRoots(p);
        const reals = nr.filter(z => z[1] === 0).map(z => z[0]);
        if (nr.length > reals.length) complexNote = true;
        steps.push(step(tr("ریشه‌یابی عددی", "Numerical root finding"), p.tex(v) + " = 0", tr("این عامل روی اعداد گویا تجزیه نمی‌شود؛ ریشه‌های حقیقی با روش عددی (نیوتن) تقریب زده می‌شوند.", "This factor does not factor over the rationals; real roots are approximated numerically (Newton's method).")));
        reals.forEach(x => { sols.push({ v: x, ast: N.fl(x), tex: "\\approx " + E.trimNum(x, 6), approx: true }); });
      }
    });
    sols.sort((a, b) => a.v - b.v);
    sols = sols.filter((s, i) => i === 0 || Math.abs(s.v - sols[i - 1].v) > 1e-9);
    if (!sols.length) return { answer: "\\varnothing", sols: [], note: complexNote ? tr("ریشهٔ حقیقی وجود ندارد.", "There is no real root.") : null };
    return { answer: sols.map(s => v + (s.approx ? " " : " = ") + s.tex).join(",\\; "), sols: sols.map(s => s.ast), note: complexNote ? tr("برخی ریشه‌ها مختلط‌اند و نمایش داده نشده‌اند.", "Some roots are complex and are not shown.") : null };
  }

  /* verify solutions numerically against original equation */
  function checkSol(L, R, v, s) {
    try { const x = typeof s === "number" ? s : evalNum(s); const a = evalNum(L, { [v]: x }), b = evalNum(R, { [v]: x }); return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b)); } catch (e) { return false; }
  }
  E.checkSol = checkSol;

  /* isolate a single special term: returns {inner, k, c} for k*f(inner)+c, where f is matched by pred */
  function affineIn(a, pred, v) {
    /* try to write a as k*T + c with T the unique node satisfying pred; numeric k,c */
    let target = null, count = 0;
    (function find(n) { if (pred(n)) { if (!target || !E.eqAst(target, n)) { target = n; count++; } return; } if (n.t === "bin") { find(n.l); find(n.r); } else if (n.t === "neg" || n.t === "fact") find(n.a); else if (n.t === "fn") n.a.forEach(find); })(a);
    if (!target || count !== 1) return null;
    const tv = "__T";
    const rep = (n) => { if (E.eqAst(n, target)) return N.v(tv); if (n.t === "bin") return { ...n, l: rep(n.l), r: rep(n.r) }; if (n.t === "neg" || n.t === "fact") return { ...n, a: rep(n.a) }; if (n.t === "fn") return { ...n, a: n.a.map(rep) }; return n; };
    const b = rep(a); if (E.has(b, v)) return null;
    const P = toPoly(b, tv); if (!P || P.deg() !== 1) return null;
    return { T: target, k: P.co(1), c: P.co(0) };
  }

  function solveEquation(L, R, v) {
    const steps = [];
    const rawL = L, rawR = R;
    v = v || E.pickVar([L, R]);
    const others = [...new Set([...E.vars(L), ...E.vars(R)])].filter(x => x !== v);
    const Lr = toRat(L, v), Rr = toRat(R, v);
    const done = (res, extra) => Object.assign({ steps, plot: { exprs: [L, R], v } }, res, extra || {});
    if (Lr && Rr) {
      const D = Lr.sub(Rr);
      if (D.isPoly()) {
        const P = D.n;
        if (P.deg() <= 1) return done(linearSteps(L, R, v, steps));
        return done(polySolveSteps(P, v, steps));
      }
      /* rational equation */
      const restr = realRootsExact(Lr.d.mul(Rr.d));
      steps.push(step(tr("شرط دامنه", "Domain condition"), restr.length ? restr.map(r => v + " \\ne " + r.tex).join(",\\; ") : tr("\\text{همهٔ اعداد حقیقی}", "\\text{all real numbers}"), tr("مخرج‌ها نباید صفر شوند.", "Denominators must not be zero.")));
      const red = new Rat(D.n, D.d);
      steps.push(step(tr("یک‌طرفه کردن و مخرج مشترک", "Move to one side and use a common denominator"), "\\frac{" + red.n.tex(v) + "}{" + red.d.tex(v) + "} = 0", tr("همهٔ جمله‌ها را به یک طرف می‌بریم و یک کسر می‌سازیم.", "Move all terms to one side and make a single fraction.")));
      steps.push(step(tr("صورت برابر صفر", "Numerator equals zero"), red.n.tex(v) + " = 0", tr("کسر وقتی صفر است که صورتش صفر و مخرجش ناصفر باشد.", "A fraction is zero when its numerator is zero and its denominator is not.")));
      if (red.n.isZero()) return done({ answer: v + " \\in \\mathbb{R}" + (restr.length ? ",\\; " + restr.map(r => v + " \\ne " + r.tex).join(",\\; ") : ""), sols: "all" });
      const sub = red.n.deg() <= 1 ? linearSteps(red.n.toAst(v), N.num(q(0)), v, []) : polySolveSteps(red.n, v, []);
      if (red.n.deg() >= 1) steps.push(step(tr("حل معادلهٔ صورت", "Solve the numerator equation"), sub.answer, null));
      const sols = (sub.sols === "all" ? [] : sub.sols || []);
      const good = sols.filter(s => Math.abs(red.d.evalN(evalNum(s))) > 1e-9);
      const bad = sols.filter(s => !good.includes(s));
      if (bad.length) steps.push(step(tr("حذف جواب غیرقابل‌قبول", "Reject an invalid solution"), bad.map(s => v + " = " + T(s)).join(",\\; "), tr("این مقدار مخرج را صفر می‌کند و در دامنه نیست.", "This value makes a denominator zero, so it is not in the domain.")));
      return done({ answer: good.length ? good.map(s => v + " = " + T(s)).join(",\\; ") : "\\varnothing", sols: good });
    }
    if (others.length) { /* literal equation: solve for v symbolically */
      return solveLiteral(L, R, v, steps);
    }
    /* absolute value */
    for (const [A, B] of [[L, R], [R, L]]) {
      if (E.has(B, v) && !(toRat(B, v) && toRat(B, v).isPoly())) continue;
      const m = affineIn(A, n => n.t === "fn" && n.n === "abs" && E.has(n, v), v);
      if (m && toRat(m.T.a[0], v)) {
        const rhs = simp(N.div(N.sub(B, N.num(m.c)), N.num(m.k)));
        if (!m.c.isZero() || !m.k.isOne()) steps.push(step(tr("جداسازی قدرمطلق", "Isolate the absolute value"), eqTex(m.T, rhs), tr("جمله‌های دیگر را به طرف دیگر می‌بریم.", "Move the other terms to the other side.")));
        const u = m.T.a[0];
        const rv = evalExact(rhs);
        if (rv && rv.sign() < 0) { steps.push(step(tr("بررسی علامت", "Check the sign"), eqTex(m.T, rhs), tr("قدرمطلق هرگز منفی نیست؛ پس معادله جواب ندارد.", "An absolute value is never negative, so the equation has no solution."))); return done({ answer: "\\varnothing", sols: [] }); }
        steps.push(step(tr("دو حالت", "Two cases"), eqTex(u, rhs) + tr(" \\quad \\text{یا} \\quad ", " \\quad \\text{or} \\quad ") + eqTex(u, simp(N.neg(rhs))), tr("اگر |u| = k باشد، آنگاه u = k یا u = −k.", "If |u| = k, then u = k or u = −k.")));
        let sols = [];
        [rhs, simp(N.neg(rhs))].forEach(rr => { const r = solveEquation(u, rr, v); steps.push(step(tr("حل حالت ", "Solve case ") + eqTex(u, rr), r.answer, null)); if (Array.isArray(r.sols)) sols = sols.concat(r.sols); });
        const good = sols.filter(s => checkSol(rawL, rawR, v, s)).sort((a, b) => evalNum(a) - evalNum(b)).filter((s, i, arr) => i === 0 || Math.abs(evalNum(s) - evalNum(arr[i - 1])) > 1e-9);
        if (good.length < sols.length) steps.push(step(tr("بررسی جواب‌ها", "Check the solutions"), "", tr("جواب‌هایی که در معادلهٔ اصلی صدق نمی‌کنند حذف شدند.", "Solutions that do not satisfy the original equation were removed.")));
        return done({ answer: good.length ? good.map(s => v + " = " + T(s)).join(",\\; ") : "\\varnothing", sols: good });
      }
    }
    /* radical */
    for (const [A, B] of [[L, R], [R, L]]) {
      const m = affineIn(A, n => n.t === "fn" && n.n === "sqrt" && E.has(n, v), v);
      if (m && toRat(m.T.a[0], v) && toRat(B, v)) {
        const rhs = simp(N.div(N.sub(B, N.num(m.c)), N.num(m.k)));
        if (!m.c.isZero() || !m.k.isOne()) steps.push(step(tr("جداسازی رادیکال", "Isolate the radical"), eqTex(m.T, rhs), tr("رادیکال را در یک طرف تنها می‌کنیم.", "Get the radical alone on one side.")));
        const sq = toRat(rhs, v).pow(2), inner = toRat(m.T.a[0], v);
        steps.push(step(tr("به توان ۲ رساندن دو طرف", "Square both sides"), eqTex(m.T.a[0], N.pow(rhs, N.num(q(2)))), tr("دو طرف را مربع می‌کنیم؛ ممکن است جواب اضافی ایجاد شود که باید بررسی شود.", "Squaring both sides may introduce extraneous solutions, which must be checked.")));
        const diff = inner.sub(sq);
        const r = diff.isPoly() ? (diff.n.deg() <= 1 ? linearSteps(m.T.a[0], (sq.isPoly() ? sq.n.toAst(v) : N.pow(rhs, N.num(q(2)))), v, []) : polySolveSteps(diff.n, v, [])) : null;
        if (!r) break;
        steps.push(step(tr("حل معادلهٔ حاصل", "Solve the resulting equation"), r.answer, null));
        const cand = Array.isArray(r.sols) ? r.sols : [];
        const good = cand.filter(s => checkSol(rawL, rawR, v, s));
        const bad = cand.filter(s => !good.includes(s));
        steps.push(step(tr("بررسی در معادلهٔ اصلی", "Check in the original equation"), (good.map(s => v + " = " + T(s) + " \\;\\checkmark").concat(bad.map(s => v + " = " + T(s) + " \\;\\times"))).join(",\\quad "), bad.length ? tr("جواب‌های علامت‌خورده با × جواب اضافی (ناشی از مربع کردن) هستند.", "Solutions marked × are extraneous (introduced by squaring).") : tr("همهٔ جواب‌ها قابل قبول‌اند.", "All solutions are valid.")));
        return done({ answer: good.length ? good.map(s => v + " = " + T(s)).join(",\\; ") : "\\varnothing", sols: good });
      }
    }
    /* exponential: k*b^u + c = rhs */
    for (const [A, B] of [[L, R], [R, L]]) {
      if (E.has(B, v)) continue;
      const m = affineIn(A, n => ((n.t === "bin" && n.op === "^" && !E.has(n.l, v) && E.has(n.r, v)) || (n.t === "fn" && n.n === "exp" && E.has(n, v))), v);
      if (m) {
        const base = m.T.t === "fn" ? N.c("e") : m.T.l, u = m.T.t === "fn" ? m.T.a[0] : m.T.r;
        const rhs = simp(N.div(N.sub(B, N.num(m.c)), N.num(m.k)));
        if (!m.c.isZero() || !m.k.isOne()) steps.push(step(tr("جداسازی جملهٔ نمایی", "Isolate the exponential term"), eqTex(m.T, rhs), null));
        const rv = evalNum(rhs), bv = evalNum(base);
        if (!(rv > 0)) { steps.push(step(tr("بررسی علامت", "Check the sign"), eqTex(m.T, rhs), tr("توان یک پایهٔ مثبت همیشه مثبت است؛ جواب حقیقی ندارد.", "A positive base raised to any power is positive; there is no real solution."))); return done({ answer: "\\varnothing", sols: [] }); }
        let kexp = null;
        const bq = evalExact(base), rq = evalExact(rhs);
        if (bq && rq) { const lg = Math.log(rv) / Math.log(bv); const cand = Q.fromNumber(Math.round(lg * 12) / 12); if (Math.abs(lg - cand.num()) < 1e-12) { const chk = E.evalExact(N.pow(N.num(bq), N.num(cand))); if (chk && chk.eq(rq)) kexp = cand; } }
        let rhsU;
        if (kexp) { steps.push(step(tr("هم‌پایه کردن", "Rewrite with the same base"), T(base) + "^{" + T(u) + "} = " + T(base) + "^{" + kexp.toTeX() + "}", T(rhs) + tr(" را به صورت توانی از ", " written as a power of ") + T(base) + tr(" می‌نویسیم.", "."))); rhsU = N.num(kexp); steps.push(step(tr("برابری توان‌ها", "Equate the exponents"), eqTex(u, rhsU), tr("وقتی پایه‌ها برابرند، توان‌ها برابرند.", "When the bases are equal, the exponents are equal."))); }
        else {
          rhsU = base.t === "const" && base.n === "e" ? N.fn("ln", rhs) : N.div(N.fn("ln", rhs), N.fn("ln", base));
          steps.push(step(tr("لگاریتم گرفتن از دو طرف", "Take logarithms of both sides"), eqTex(u, rhsU), base.t === "const" ? "ln(eᵘ) = u" : tr("از ln دو طرف و قاعدهٔ ln(aᵘ) = u·ln a استفاده می‌کنیم.", "Take ln of both sides and use ln(aᵘ) = u·ln a.")));
        }
        const r = solveEquation(u, rhsU, v);
        r.steps.forEach(s => steps.push(s));
        const sols = Array.isArray(r.sols) ? r.sols : [];
        const approx = sols.filter(s => s.t !== "num").map(s => E.trimNum(evalNum(s), 6));
        return done({ answer: r.answer, sols, approx: approx.length ? v + " \\approx " + approx.join(",\\; ") : null });
      }
    }
    /* logarithm: k*log(u)+c = rhs */
    for (const [A, B] of [[L, R], [R, L]]) {
      if (E.has(B, v)) continue;
      const m = affineIn(A, n => n.t === "fn" && (n.n === "ln" || n.n === "log") && E.has(n, v), v);
      if (m && toRat(m.T.a[0], v)) {
        const rhs = simp(N.div(N.sub(B, N.num(m.c)), N.num(m.k)));
        if (!m.c.isZero() || !m.k.isOne()) steps.push(step(tr("جداسازی لگاریتم", "Isolate the logarithm"), eqTex(m.T, rhs), null));
        const base = m.T.n === "ln" ? N.c("e") : N.num(q(10));
        const rhsU = simp(N.pow(base, rhs));
        steps.push(step(tr("تعریف لگاریتم", "Definition of the logarithm"), eqTex(m.T.a[0], rhsU), m.T.n === "ln" ? "ln u = k ⇔ u = eᵏ" : "log u = k ⇔ u = 10ᵏ"));
        const r = solveEquation(m.T.a[0], rhsU, v);
        r.steps.forEach(s => steps.push(s));
        const sols = (Array.isArray(r.sols) ? r.sols : []).filter(s => checkSol(rawL, rawR, v, s));
        steps.push(step(tr("شرط دامنه", "Domain condition"), T(m.T.a[0]) + " > 0", tr("ورودی لگاریتم باید مثبت باشد؛ جواب‌ها بررسی شدند.", "The argument of a logarithm must be positive; solutions were checked.")));
        return done({ answer: sols.length ? sols.map(s => v + " = " + T(s)).join(",\\; ") : "\\varnothing", sols });
      }
    }
    /* basic trig: k*f(u)+c = rhs, u linear */
    for (const [A, B] of [[L, R], [R, L]]) {
      if (E.has(B, v)) continue;
      const m = affineIn(A, n => n.t === "fn" && ["sin", "cos", "tan"].includes(n.n) && E.has(n, v), v);
      if (!m) continue;
      const u = m.T.a[0];
      const ub = simp(E.subst(u, v, N.num(q(0)))), ua = simp(N.sub(E.subst(u, v, N.num(q(1))), ub));
      const lin = [2, -3, 0.7].every(t => { try { return Math.abs(evalNum(u, { [v]: t }) - (evalNum(ua) * t + evalNum(ub))) < 1e-9; } catch (e) { return false; } });
      if (!lin || E.vars(ua).size || Math.abs(evalNum(ua)) < 1e-12) continue;
      const rhs = simp(N.div(N.sub(B, N.num(m.c)), N.num(m.k))), r = evalNum(rhs), f = m.T.n;
      if (!m.c.isZero() || !m.k.isOne()) steps.push(step(tr("جداسازی تابع مثلثاتی", "Isolate the trigonometric function"), eqTex(m.T, rhs), null));
      if (f !== "tan" && Math.abs(r) > 1 + 1e-12) { steps.push(step(tr("بررسی برد", "Check the range"), eqTex(m.T, rhs), tr("برد سینوس و کسینوس بازهٔ [−۱، ۱] است؛ جواب ندارد.", "The range of sine and cosine is [−1, 1]; no solution."))); return done({ answer: "\\varnothing", sols: [], note: tr("جواب حقیقی ندارد.", "No real solution.") }); }
      let alpha; try { alpha = E.casAst("a" + f + "(" + E.str(rhs) + ")"); } catch (e) { alpha = N.fl(Math["a" + f](r)); }
      steps.push(step(tr("زاویهٔ اصلی", "Reference angle"), "\\alpha = \\" + (f === "sin" ? "arcsin" : f === "cos" ? "arccos" : "arctan") + "\\left(" + T(rhs) + "\\right) = " + T(alpha), tr("زاویه‌ای که مقدار ", "The angle whose ") + f + tr(" آن برابر ", " equals ") + T(rhs) + tr(" است.", ".")));
      const per = f === "tan" ? N.c("pi") : N.mul(N.num(q(2)), N.c("pi"));
      const bases = f === "sin" ? [alpha, N.sub(N.c("pi"), alpha)] : f === "cos" ? [alpha, simp(N.neg(alpha))] : [alpha];
      const kTerm = (P) => { const c = E.simplifyAst(P); return T(c).startsWith("-") ? null : c; };
      const famTex = (base, A, Bv) => {
        const principal = A ? E.simplifyAst(N.div(N.sub(base, Bv), A)) : E.simplifyAst(base);
        const pk = A ? E.simplifyAst(N.div(per, A)) : per;
        const pkAbs = T(pk).startsWith("-") ? E.simplifyAst(N.neg(pk)) : pk;
        return { principal, tex: T(principal) + " + " + (T(pkAbs) === "\\pi" ? "k\\pi" : T(pkAbs).replace(/^\\pi$/, "k\\pi").replace(/(\\frac\{)([^}]*)\\pi/, "$1$2k\\pi").replace(/^2 \\pi$/, "2k\\pi").replace(/^(\d+) \\pi$/, "$1k\\pi")) };
      };
      steps.push(step(tr("جواب کلی برای ", "General solution for ") + T(u), bases.map(b0 => T(u) + " = " + famTex(b0, null, null).tex).join(tr(" \\quad \\text{یا} \\quad ", " \\quad \\text{or} \\quad ")) + ",\\; k \\in \\mathbb{Z}", f === "sin" ? tr("sin u = sin α ⇒ u = α + 2kπ یا u = π − α + 2kπ", "sin u = sin α ⇒ u = α + 2kπ or u = π − α + 2kπ") : f === "cos" ? "cos u = cos α ⇒ u = ±α + 2kπ" : "tan u = tan α ⇒ u = α + kπ"));
      const unit = Math.abs(evalNum(ua) - 1) < 1e-12 && Math.abs(evalNum(ub)) < 1e-12;
      const fams = bases.map(b0 => unit ? famTex(b0, null, null) : famTex(b0, ua, ub));
      const uniq = fams.filter((x, i) => i === 0 || Math.abs(evalNum(x.principal) - evalNum(fams[0].principal)) > 1e-12);
      const gen = uniq.map(x => v + " = " + x.tex);
      if (!unit) steps.push(step(tr("حل نسبت به ", "Solve for ") + v, gen.join(tr(" \\quad \\text{یا} \\quad ", " \\quad \\text{or} \\quad ")), tr("دو طرف را منهای ", "Subtract ") + T(ub) + tr(" و تقسیم بر ", " from both sides and divide by ") + T(ua) + tr(" می‌کنیم.", ".")));
      return done({ answer: gen.join(",\\; ") + ",\\; k \\in \\mathbb{Z}", sols: uniq.map(x => x.principal), note: tr("جواب‌های اصلی (k = 0): ", "Principal solutions (k = 0): ") + uniq.map(x => E.trimNum(evalNum(x.principal), 6)).join(tr("، ", ", ")) });
    }
    return genericSolve(L, R, v, steps);
  }
  const subst0 = x => E.subst(x, "k", N.num(q(0)));
  E.solveEquation = solveEquation;

  function solveLiteral(L, R, v, steps) {
    /* linear in v with other letters as parameters */
    const D = toMPoly(N.sub(L, R));
    if (D) {
      let a = new MPoly(), b = new MPoly(), ok = true;
      D.t.forEach((k, key) => { const m = parseKey(key); const e = m[v] || 0; if (e > 1) ok = false; delete m[v]; const one = new MPoly(); one.t.set(monoKey(m), k); if (e === 1) a = a.add(one); else b = b.add(one); });
      if (ok && a.termCount()) {
        steps.push(step(tr("جمع‌آوری جمله‌های دارای ", "Collect the terms containing ") + v, T(a.toAst()) === "1" ? v + " = " + T(b.neg().toAst()) : "\\left(" + T(a.toAst()) + "\\right)" + v + " = " + T(b.neg().toAst()), tr("جمله‌های دارای ", "Move the terms containing ") + v + tr(" یک طرف و بقیه طرف دیگر.", " on one side and everything else on the other.")));
        const res = a.isConst() ? simp(N.div(b.neg().toAst(), N.num(a.constTerm()))) : N.div(b.neg().toAst(), a.toAst());
        const ans = v + " = " + T(pretty(res));
        steps.push(step(tr("تقسیم بر ضریب ", "Divide by the coefficient of ") + v, ans, a.isConst() ? null : tr("به شرط اینکه ", "provided that ") + T(a.toAst()) + " \\ne 0"));
        return { answer: ans, steps, sols: [] };
      }
    }
    try {
      const s = root.nerdamer.solve(E.str(L) + "=" + E.str(R), v).toString().replace(/^\[|\]$/g, "");
      const parts = splitTop(s).map(E.parseNerd).map(x => pretty(simp(x)));
      steps.push(step(tr("حل نسبت به ", "Solve for ") + v, parts.map(p => v + " = " + T(p)).join(",\\; "), tr("با موتور نمادین", "With the symbolic engine")));
      return { answer: parts.map(p => v + " = " + T(p)).join(",\\; "), steps, sols: [] };
    } catch (e) { throw new MathError(tr("حل این معادله نسبت به ", "Could not solve this equation for ") + v + tr(" ممکن نشد.", ".")); }
  }
  function splitTop(s) { const out = []; let d = 0, cur = ""; for (const ch of s) { if (ch === "(" || ch === "[") d++; if (ch === ")" || ch === "]") d--; if (ch === "," && d === 0) { out.push(cur); cur = ""; } else cur += ch; } if (cur.trim()) out.push(cur); return out.map(x => x.trim()).filter(Boolean); }
  E.splitTop = splitTop;

  function numericScan(f, lo = -60, hi = 60, n = 2400) {
    const roots = []; let px = lo, py = f(lo);
    for (let i = 1; i <= n; i++) {
      const x = lo + (hi - lo) * i / n, y = f(x);
      if (Number.isFinite(py) && Number.isFinite(y)) {
        if (py === 0) roots.push(px);
        else if (py * y < 0) { let a = px, b = x, fa_ = py; for (let k = 0; k < 80; k++) { const m = (a + b) / 2, fm = f(m); if (fa_ * fm <= 0) b = m; else { a = m; fa_ = fm; } } const r = (a + b) / 2; if (Math.abs(f(r)) < 1e-6) roots.push(r); }
      }
      px = x; py = y;
    }
    return roots.filter((r, i) => i === 0 || Math.abs(r - roots[i - 1]) > 1e-7);
  }
  E.numericScan = numericScan;

  function genericSolve(L, R, v, steps) {
    let sols = [], exact = false;
    try {
      const s = root.nerdamer.solve(E.str(L) + "=" + E.str(R), v).toString().replace(/^\[|\]$/g, "");
      const parts = splitTop(s).map(x => { try { return pretty(simp(E.parseNerd(x))); } catch (e) { return null; } }).filter(Boolean);
      sols = parts.filter(p => !E.vars(p).size && checkSol(L, R, v, p)); exact = sols.length > 0;
    } catch (e) { }
    if (!sols.length) {
      const f = x => { try { return evalNum(L, { [v]: x }) - evalNum(R, { [v]: x }); } catch (e) { return NaN; } };
      sols = numericScan(f).map(x => N.fl(x));
      steps.push(step(tr("حل عددی", "Numerical solution"), eqTex(L, R), tr("برای این نوع معادله روش جبری مستقیم پیاده نشده است؛ جواب‌ها در بازهٔ [−۶۰، ۶۰] با روش تنصیف (bisection) پیدا شدند.", "No direct algebraic method is implemented for this kind of equation; solutions were found on [−60, 60] by bisection.") + (/sin|cos|tan/.test(E.str(L) + E.str(R)) ? tr(" معادلهٔ مثلثاتی می‌تواند بی‌نهایت جواب دوره‌ای داشته باشد.", " A trigonometric equation can have infinitely many periodic solutions.") : "")));
    } else steps.push(step(tr("حل با موتور نمادین", "Solved with the symbolic engine"), eqTex(L, R), tr("جواب‌ها با جایگذاری در معادلهٔ اصلی تأیید شدند.", "The solutions were verified by substitution into the original equation.")));
    sols.sort((a, b) => evalNum(a) - evalNum(b));
    return { answer: sols.length ? sols.map(s => v + (s.t === "fl" ? " \\approx " + E.trimNum(s.v, 6) : " = " + T(s))).join(",\\; ") : "\\varnothing", sols, steps, plot: { exprs: [L, R], v }, note: exact ? null : (sols.length ? tr("مقادیر تقریبی هستند.", "The values are approximate.") : tr("در بازهٔ بررسی‌شده جوابی پیدا نشد.", "No solution was found in the searched range.")) };
  }

  /* ======================= inequalities ======================= */
  const flip = r => ({ "<": ">", ">": "<", "<=": ">=", ">=": "<=" }[r]);
  function solveInequality(L, rel, R, v) {
    const steps = [];
    v = v || E.pickVar([L, R]);
    const Lr = toRat(L, v), Rr = toRat(R, v);
    if (!Lr || !Rr) return genericInequality(L, rel, R, v, steps);
    const D = Lr.sub(Rr);
    if (D.isPoly() && D.n.deg() <= 1) {
      let Lp = Lr.n, Rp = Rr.n;
      if (containsParenProduct(L) || containsParenProduct(R)) steps.push(step(tr("باز کردن پرانتزها", "Expand the parentheses"), eqTex(Lp.toAst(v), Rp.toAst(v), rel), null));
      const c = Rp.co(1);
      if (!c.isZero()) { const cx = new Poly([q(0), c]); Lp = Lp.sub(cx); Rp = Rp.sub(cx); steps.push(step(tr("جمع‌آوری جمله‌های ", "Collect the ") + v + tr(" در سمت چپ", " terms on the left"), eqTex(Lp.toAst(v), Rp.toAst(v), rel), null)); }
      const b = Lp.co(0);
      if (!b.isZero()) { Lp = Lp.sub(Poly.const(b)); Rp = Rp.sub(Poly.const(b)); steps.push(step(tr("انتقال عدد ثابت", "Move the constant"), eqTex(Lp.toAst(v), Rp.toAst(v), rel), tr("جمع یا تفریق یک عدد از دو طرف جهت نامساوی را تغییر نمی‌دهد.", "Adding or subtracting a number on both sides does not change the inequality direction."))); }
      const A = Lp.co(1), B = Rp.co(0);
      if (A.isZero()) {
        const truth = { "<": 0 < B.num(), ">": 0 > B.num(), "<=": 0 <= B.num(), ">=": 0 >= B.num() }[rel];
        steps.push(step(tr("نتیجه", "Result"), "0 " + relTex(rel) + " " + B.toTeX(), truth ? tr("همیشه درست است.", "Always true.") : tr("هرگز درست نیست.", "Never true.")));
        return { answer: truth ? v + " \\in \\mathbb{R}" : "\\varnothing", steps, interval: truth ? "(-\\infty, \\infty)" : "\\varnothing" };
      }
      let r2 = rel; const x = B.div(A);
      if (A.sign() < 0) { r2 = flip(rel); steps.push(step(tr("تقسیم بر ", "Divide by ") + A.toTeX() + tr(" و برعکس کردن جهت", " and flip the inequality"), v + " " + relTex(r2) + " " + x.toTeX(), tr("تقسیم یا ضرب دو طرف در عدد منفی، جهت نامساوی را برعکس می‌کند.", "Multiplying or dividing both sides by a negative number reverses the inequality."))); }
      else if (!A.isOne()) steps.push(step(tr("تقسیم دو طرف بر ", "Divide both sides by ") + A.toTeX(), v + " " + relTex(r2) + " " + x.toTeX(), tr("تقسیم بر عدد مثبت جهت را تغییر نمی‌دهد.", "Dividing by a positive number keeps the direction.")));
      const xs = x.toTeX(), closed = r2.includes("=");
      const interval = r2.startsWith("<") ? "\\left(-\\infty,\\; " + xs + (closed ? "\\right]" : "\\right)") : (closed ? "\\left[" : "\\left(") + xs + ",\\; \\infty\\right)";
      return { answer: v + " " + relTex(r2) + " " + xs, interval, steps, plot: { exprs: [L, R], v } };
    }
    /* sign chart */
    steps.push(step(tr("یک‌طرفه کردن", "Move everything to one side"), (D.isPoly() ? D.n.tex(v) : "\\frac{" + D.n.tex(v) + "}{" + D.d.tex(v) + "}") + " " + relTex(rel) + " 0", tr("همهٔ جمله‌ها را به یک طرف می‌بریم تا با صفر مقایسه کنیم.", "Move all terms to one side to compare with zero.")));
    const nf = factorPoly(D.n, v, []), df = D.isPoly() ? null : factorPoly(D.d, v, []);
    steps.push(step(tr("تجزیه", "Factor"), (df ? "\\frac{" + factorsTex(nf.k, nf.factors, v) + "}{" + factorsTex(df.k, df.factors, v) + "}" : factorsTex(nf.k, nf.factors, v)) + " " + relTex(rel) + " 0", null));
    const zN = realRootsExact(D.n).map(r => ({ ...r, kind: "z" })), zD = D.isPoly() ? [] : realRootsExact(D.d).map(r => ({ ...r, kind: "p" }));
    const crit = zN.concat(zD).sort((a, b) => a.val - b.val).filter((r, i, arr) => i === 0 || Math.abs(r.val - arr[i - 1].val) > 1e-10 || (arr[i - 1].kind = arr[i - 1].kind === "p" || r.kind === "p" ? "p" : "z", false));
    steps.push(step(tr("نقاط بحرانی", "Critical points"), crit.length ? crit.map(c => v + " = " + c.tex + (c.kind === "p" ? tr("\\;(\\text{مخرج})", "\\;(\\text{denominator})") : "")).join(",\\quad ") : tr("\\text{ندارد}", "\\text{none}"), tr("ریشه‌های صورت و مخرج، محور اعداد را به بازه‌هایی تقسیم می‌کنند.", "The zeros of the numerator and denominator split the number line into intervals.")));
    const f = x => D.n.evalN(x) / D.d.evalN(x);
    const pts = [-Infinity, ...crit.map(c => c.val), Infinity];
    const intervals = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const t = a === -Infinity ? (b === Infinity ? 0 : b - 1) : b === Infinity ? a + 1 : (a + b) / 2;
      intervals.push({ a: i === 0 ? null : crit[i - 1], b: i === pts.length - 2 ? null : crit[i], sign: Math.sign(f(t)), t });
    }
    const want = s => rel.startsWith("<") ? s < 0 : s > 0;
    /* sign table */
    const head = ["-\\infty"].concat(crit.map(c => c.tex.replace("\\approx ", ""))).concat(["\\infty"]);
    let table = "\\begin{array}{c|" + "c".repeat(head.length * 2 - 1) + "}\n" + v + " & " + head.map((h, i) => i < head.length - 1 ? h + " & " : h).join("") + tr(" \\\\ \\hline\n\\text{علامت} & ", " \\\\ \\hline\n\\text{sign} & ");
    const cells = []; intervals.forEach((I, i) => { cells.push(""); cells.push(I.sign > 0 ? "+" : I.sign < 0 ? "-" : "0"); if (i < crit.length) cells.push(crit[i].kind === "p" ? "\\nexists" : "0"); });
    table += cells.slice(1).concat([""]).join(" & ") + "\n\\end{array}";
    steps.push(step(tr("جدول تعیین علامت", "Sign chart"), table, tr("در هر بازه یک نقطهٔ آزمون جایگذاری می‌کنیم تا علامت عبارت مشخص شود.", "In each interval we substitute a test point to find the sign of the expression.")));
    const closed = rel.includes("=");
    const parts = [];
    intervals.forEach(I => {
      if (!want(I.sign)) return;
      const lo = I.a ? I.a.tex.replace("\\approx ", "") : "-\\infty", hi = I.b ? I.b.tex.replace("\\approx ", "") : "\\infty";
      const lc = I.a && closed && I.a.kind === "z" ? "\\left[" : "\\left(", rc = I.b && closed && I.b.kind === "z" ? "\\right]" : "\\right)";
      parts.push({ lo: I.a, hi: I.b, s: lc + lo + ",\\; " + hi + rc });
    });
    /* isolated zeros for closed relations (double roots) */
    if (closed) zN.forEach(z => { if (!parts.some(p => (p.lo && p.lo.val === z.val) || (p.hi && p.hi.val === z.val))) parts.push({ lo: z, hi: z, s: "\\{" + z.tex + "\\}" }); });
    parts.sort((x, y) => (x.lo ? x.lo.val : -Infinity) - (y.lo ? y.lo.val : -Infinity));
    /* merge adjacent closed intervals sharing a closed endpoint */
    const merged = []; parts.forEach(p => { const last = merged[merged.length - 1]; if (last && last.hi && p.lo && Math.abs(last.hi.val - p.lo.val) < 1e-12 && closed && p.lo.kind === "z") { last.hi = p.hi; last.s = last.s.replace(/,; [^,]*$/, "") + ",\\; " + (p.hi ? p.hi.tex.replace("\\approx ", "") : "\\infty") + (p.s.endsWith("\\right]") ? "\\right]" : "\\right)"); } else merged.push({ ...p }); });
    const ans = merged.length ? merged.map(p => p.s).join(" \\cup ") : "\\varnothing";
    return { answer: v + " \\in " + ans, interval: ans, steps, plot: { exprs: [L, R], v } };
  }
  function genericInequality(L, rel, R, v, steps) {
    const f = x => { try { return evalNum(L, { [v]: x }) - evalNum(R, { [v]: x }); } catch (e) { return NaN; } };
    const roots = numericScan(f);
    steps.push(step(tr("حل معادلهٔ مرزی به‌صورت عددی", "Solve the boundary equation numerically"), eqTex(L, R), tr("نقاط مرزی تقریبی: ", "Approximate boundary points: ") + (roots.map(r => E.trimNum(r, 5)).join(tr("، ", ", ")) || tr("ندارد", "none"))));
    const pts = [-60, ...roots, 60], parts = [];
    for (let i = 0; i < pts.length - 1; i++) { const t = (pts[i] + pts[i + 1]) / 2, s = f(t); if (Number.isFinite(s) && (rel.startsWith("<") ? s < 0 : s > 0)) parts.push("\\left(" + (i === 0 ? "-\\infty" : E.trimNum(pts[i], 5)) + ",\\; " + (i === pts.length - 2 ? "\\infty" : E.trimNum(pts[i + 1], 5)) + "\\right)"); }
    return { answer: v + " \\in " + (parts.join(" \\cup ") || "\\varnothing"), steps, plot: { exprs: [L, R], v }, note: tr("بازه‌ها تقریبی‌اند و فقط در محدودهٔ [−۶۰، ۶۰] بررسی شدند.", "The intervals are approximate and were only checked on [−60, 60].") };
  }
  E.solveInequality = solveInequality;

  /* ======================= linear systems ======================= */
  function matTex(M, aug) {
    const cols = M[0].length;
    return "\\left[\\begin{array}{" + (aug ? "c".repeat(cols - 1) + "|c" : "c".repeat(cols)) + "}" + M.map(r => r.map(x => x.toTeX()).join(" & ")).join(" \\\\ ") + "\\end{array}\\right]";
  }
  E.matTex = matTex;
  function solveSystem(eqs) {
    const steps = [];
    const lin = eqs.map(([L, R]) => toMPoly(N.sub(L, R)));
    const allVars = [...new Set(eqs.flatMap(([L, R]) => [...E.vars(L), ...E.vars(R)]))].sort();
    if (lin.some(p => !p || p.deg() > 1)) return nonlinearSystem(eqs, allVars, steps);
    const vs = allVars;
    const M = lin.map(p => vs.map(v => p.t.get(v) || q(0)).concat([p.constTerm().neg()]));
    steps.push(step(tr("نوشتن به شکل استاندارد", "Write in standard form"), "\\begin{cases}" + lin.map((p, i) => T(MPoly.prototype.sub.call(p, MPoly.c(p.constTerm())).toAst()) + " = " + M[i][vs.length].toTeX()).join(" \\\\ ") + "\\end{cases}", tr("متغیرها در سمت چپ و اعداد ثابت در سمت راست.", "Variables on the left and constants on the right.")));
    steps.push(step(tr("ماتریس افزوده", "Augmented matrix"), matTex(M, true), tr("ضریب‌های هر معادله یک سطر ماتریس می‌شوند.", "The coefficients of each equation form one row of the matrix.")));
    const rows = M.length, cols = vs.length; let r = 0; const pivots = [];
    for (let c = 0; c < cols && r < rows; c++) {
      let p = -1; for (let i = r; i < rows; i++) if (!M[i][c].isZero()) { p = i; break; }
      if (p < 0) continue;
      if (p !== r) { [M[p], M[r]] = [M[r], M[p]]; steps.push(step(tr("جابه‌جایی سطرها", "Swap rows"), "R_{" + (r + 1) + "} \\leftrightarrow R_{" + (p + 1) + "} \\quad " + matTex(M, true), null)); }
      const pv = M[r][c];
      if (!pv.isOne()) { M[r] = M[r].map(x => x.div(pv)); steps.push(step(tr("یکه کردن محور", "Make the pivot 1"), "R_{" + (r + 1) + "} \\to \\frac{1}{" + pv.toTeX() + "}R_{" + (r + 1) + "} \\quad " + matTex(M, true), null)); }
      const ops = [];
      for (let i = 0; i < rows; i++) if (i !== r && !M[i][c].isZero()) { const f = M[i][c]; M[i] = M[i].map((x, j) => x.sub(f.mul(M[r][j]))); ops.push("R_{" + (i + 1) + "} \\to R_{" + (i + 1) + "} " + (f.sign() > 0 ? "- " + (f.isOne() ? "" : f.toTeX()) : "+ " + (f.neg().isOne() ? "" : f.neg().toTeX())) + "R_{" + (r + 1) + "}"); }
      if (ops.length) steps.push(step(tr("حذف متغیر ", "Eliminate ") + vs[c] + tr(" از سطرهای دیگر", " from the other rows"), ops.join(",\\; ") + " \\quad " + matTex(M, true), tr("با ترکیب سطرها ضریب ", "Combine rows to make the coefficient of ") + vs[c] + tr(" را در سایر معادله‌ها صفر می‌کنیم.", " zero in the other equations.")));
      pivots.push(c); r++;
    }
    for (let i = r; i < rows; i++) if (!M[i][cols].isZero()) { steps.push(step(tr("تناقض", "Contradiction"), "0 = " + M[i][cols].toTeX(), tr("یک سطر به شکل 0 = عدد ناصفر درآمد؛ دستگاه جواب ندارد (ناسازگار).", "A row became 0 = nonzero number; the system has no solution (inconsistent)."))); return { answer: tr("\\text{دستگاه جواب ندارد}", "\\text{the system has no solution}"), steps, sols: null }; }
    if (pivots.length < cols) {
      const free = vs.filter((_, c) => !pivots.includes(c));
      const exprs = pivots.map((c, i) => { let e = MPoly.c(M[i][cols]); vs.forEach((v, j) => { if (j !== c && !M[i][j].isZero()) e = e.sub(MPoly.v(v).scale(M[i][j])); }); return vs[c] + " = " + T(e.toAst()); });
      steps.push(step(tr("بی‌شمار جواب", "Infinitely many solutions"), exprs.join(",\\; "), tr("متغیرهای آزاد: ", "Free variables: ") + free.join(tr("، ", ", "))));
      return { answer: exprs.join(",\\; ") + ",\\; " + free.map(f => f + " \\in \\mathbb{R}").join(",\\; "), steps, sols: "many" };
    }
    const sol = {}; pivots.forEach((c, i) => sol[vs[c]] = M[i][cols]);
    const ans = vs.map(v => v + " = " + sol[v].toTeX()).join(",\\; ");
    steps.push(step(tr("جواب", "Solution"), ans, tr("ستون آخر ماتریس سطری‌پلکانی کاهش‌یافته مقدار متغیرهاست.", "The last column of the reduced row echelon form gives the variables.")));
    const check = eqs.map(([L, R]) => { const env = {}; vs.forEach(v => env[v] = sol[v].num()); return Math.abs(evalNum(L, env) - evalNum(R, env)) < 1e-9; });
    steps.push(step(tr("بررسی", "Check"), eqs.map(([L, R]) => eqTex(L, R) + " \\;\\checkmark").join(" \\\\ "), check.every(Boolean) ? tr("جواب در همهٔ معادله‌ها صدق می‌کند.", "The solution satisfies every equation.") : tr("هشدار: بررسی ناموفق بود.", "Warning: the check failed.")));
    return { answer: ans, steps, sols: sol, vars: vs, plot: vs.length === 2 ? { lines: eqs, vars: vs, point: [sol[vs[0]].num(), sol[vs[1]].num()] } : null };
  }
  function nonlinearSystem(eqs, vs, steps) {
    try {
      const res = root.nerdamer.solveEquations(eqs.map(([L, R]) => E.str(L) + "=" + E.str(R)));
      let pairs = Array.isArray(res) ? res : [];
      const sols = pairs.map(p => Array.isArray(p) ? p : null).filter(Boolean);
      if (sols.length && Array.isArray(sols[0]) && typeof sols[0][0] === "string") {
        const ans = sols.map(([v, val]) => v + " = " + T(pretty(simp(E.parseNerd(String(val)))))).join(",\\; ");
        steps.push(step(tr("حل دستگاه غیرخطی", "Solve the nonlinear system"), ans, tr("با جایگذاری و حذف (موتور نمادین)", "By substitution and elimination (symbolic engine)")));
        return { answer: ans, steps };
      }
    } catch (e) { }
    try {
      const r = root.nerdamer("solveeqs([" + eqs.map(([L, R]) => E.str(L) + "=" + E.str(R)).join(",") + "])").toString();
      steps.push(step(tr("حل دستگاه غیرخطی", "Solve the nonlinear system"), "\\text{" + r.replace(/=>/g, "=").replace(/[{}\[\]]/g, " ") + "}", tr("با جایگذاری و حذف (موتور نمادین)", "By substitution and elimination (symbolic engine)")));
      return { answer: r.replace(/[\[\]{}]/g, "").replace(/=>/g, "=").replace(/\*/g, "\\cdot "), steps };
    } catch (e) { throw new MathError(tr("حل این دستگاه غیرخطی ممکن نشد.", "Could not solve this nonlinear system.")); }
  }
  E.solveSystem = solveSystem;

  /* ======================= number theory ======================= */
  function primeFactorSteps(nBig) {
    let n = BigInt(nBig); if (n < 2n) throw new MathError(tr("عددی بزرگ‌تر از ۱ وارد کن.", "Enter a whole number greater than 1."));
    if (n > 10n ** 15n) throw new MathError(tr("عدد خیلی بزرگ است (حداکثر ۱۵ رقم).", "The number is too large (at most 15 digits)."));
    const steps = [], fac = []; let m = n;
    for (let p = 2n; p * p <= m; p += (p === 2n ? 1n : 2n)) {
      while (m % p === 0n) { steps.push(step(tr("تقسیم بر ", "Divide by ") + p, m + " \\div " + p + " = " + (m / p), null)); fac.push(p); m /= p; }
    }
    if (m > 1n) { fac.push(m); steps.push(step(tr("عدد اول باقی‌مانده", "Remaining prime"), m.toString(), m === n ? n + tr(" خودش عدد اول است.", " is itself prime.") : tr("عدد باقی‌مانده اول است.", "The remaining number is prime."))); }
    const grp = {}; fac.forEach(p => grp[p] = (grp[p] || 0) + 1);
    const t = Object.keys(grp).map(p => grp[p] > 1 ? p + "^{" + grp[p] + "}" : p).join(" \\times ");
    return { answer: n + " = " + t, steps, factors: grp };
  }
  function gcdSteps(nums) {
    const steps = []; nums = nums.map(x => { const v = BigInt(x); return v < 0n ? -v : v; });
    let g = nums[0];
    for (let i = 1; i < nums.length; i++) {
      let a = g, b = nums[i]; const lines = [];
      while (b) { lines.push(a + " = " + (a / b) + " \\times " + b + " + " + (a % b)); [a, b] = [b, a % b]; }
      steps.push(step(tr("الگوریتم اقلیدس برای ", "Euclidean algorithm for ") + g + tr(" و ", " and ") + nums[i], lines.join(" \\\\ "), tr("باقی‌مانده را تا رسیدن به صفر ادامه می‌دهیم؛ آخرین باقی‌ماندهٔ ناصفر ب.م.م است.", "Keep dividing until the remainder is zero; the last nonzero remainder is the gcd.")));
      g = a;
    }
    let l = nums[0]; for (let i = 1; i < nums.length; i++) l = blcm(l, nums[i]);
    steps.push(step(tr("کوچک‌ترین مضرب مشترک", "Least common multiple"), "\\operatorname{lcm} = " + (nums.length === 2 ? "\\frac{" + nums[0] + " \\times " + nums[1] + "}{" + g + "} = " : "") + l, tr("ک.م.م = حاصل‌ضرب دو عدد تقسیم بر ب.م.م", "lcm = product of the two numbers ÷ gcd")));
    return { answer: "\\gcd = " + g + ",\\quad \\operatorname{lcm} = " + l, steps };
  }
  E.primeFactorSteps = primeFactorSteps; E.gcdSteps = gcdSteps;
})(typeof globalThis !== "undefined" ? globalThis : this);
