/* Answer checking for practice problems. Uses the solver engine (window.MathEngine).
   Types: num, expr, set, ineq, tuple, matrix, choice. Works in the browser and in Node (tests). */
(function (root) {
  "use strict";
  const E = root.MathEngine;
  const tr = (fa, en) => (root.I18N ? root.I18N.T(fa, en) : (root.MDSA_LANG === "en" ? en : fa));
  const NONE = /^(none|no\s*solution|no\s*real\s*solutions?|empty|∅|\{\s*\}|ندارد|جواب\s*ندارد|تهی|هیچ)$/i;
  const ALL = /^(all|all\s*real(s|\s*numbers)?|r|ℝ|\(-oo,\s*oo\)|همه|همهٔ اعداد|همه اعداد|همه\s*اعداد\s*حقیقی)$/i;

  function clean(s) {
    return E.normalizeInput(String(s || "")).replace(/[٪%]/g, "").replace(/×/g, "*").replace(/\s+/g, " ").trim();
  }
  function stripLhs(s) {
    /* "x = 3", "y = 2x+1", "f(x) = ...", "f'(x)=" , "dy/dx =" → right-hand side */
    const m = s.match(/^\s*(?:[a-zA-Z](?:'+)?(?:\([a-z,\s]*\))?|d\w*\/d\w+|∂\w*\/∂\w+)\s*=\s*(.+)$/);
    return m ? m[1] : s;
  }
  function value(s) {
    const a = E.parse(s);
    const q = E.evalExact(a);
    const v = q ? q.num() : E.evalNum(a, {});
    if (!Number.isFinite(v) && !(Math.abs(v) === Infinity)) throw new E.MathError(tr("مقدار عددی نیست.", "Not a numeric value."));
    return { v, q, ast: a };
  }
  const close = (u, a, opts) => {
    if (!Number.isFinite(a)) return u === a;
    const atol = opts && opts.tol !== undefined ? opts.tol : 1e-9;
    const rtol = opts && opts.rtol !== undefined ? opts.rtol : 1e-7;
    return Math.abs(u - a) <= Math.max(atol, rtol * Math.abs(a));
  };
  const ansNum = a => (typeof a === "number" ? a : a && a.num ? a.num() : E.evalNum(a));
  function nodeCount(a) {
    if (!a || typeof a !== "object") return 0;
    if (a.t === "bin") return 1 + nodeCount(a.l) + nodeCount(a.r);
    if (a.t === "neg" || a.t === "fact") return 1 + nodeCount(a.a);
    if (a.t === "fn") return 1 + a.a.reduce((s, x) => s + nodeCount(x), 0);
    return 1;
  }
  const isSum = a => a && a.t === "bin" && (a.op === "+" || a.op === "-");
  function isFactored(a) {
    if (!a) return false;
    if (a.t === "neg") return isFactored(a.a);
    if (a.t === "bin" && (a.op === "*" || a.op === "^")) return true;
    return !isSum(a);
  }
  function isExpanded(a) {
    let ok = true;
    (function walk(n) {
      if (!n || typeof n !== "object") return;
      if (n.t === "bin") {
        if (n.op === "*" && ((isSum(n.l) && E.vars(n.l).size) || (isSum(n.r) && E.vars(n.r).size))) ok = false;
        if (n.op === "^" && isSum(n.l)) ok = false;
        walk(n.l); walk(n.r);
      } else if (n.t === "neg" || n.t === "fact") walk(n.a);
      else if (n.t === "fn") n.a.forEach(walk);
    })(a);
    return ok;
  }
  function radicalsSimplified(a) {
    let ok = true;
    (function walk(n) {
      if (!n || typeof n !== "object") return;
      if (n.t === "fn" && n.n === "sqrt") {
        const q = E.evalExact(n.a[0]);
        if (q && q.isInt()) { const [k] = E.sqrtParts(q.n < 0n ? -q.n : q.n); if (k > 1n) ok = false; }
        if (q && !q.isInt()) ok = false;
      }
      if (n.t === "bin") { walk(n.l); walk(n.r); } else if (n.t === "neg") walk(n.a); else if (n.t === "fn") n.a.forEach(walk);
    })(a);
    return ok;
  }
  function splitList(s) {
    return s.replace(/\s+(or|and|یا|و)\s+/gi, ",").replace(/[;؛،]/g, ",").split(",").map(x => x.trim()).filter(Boolean);
  }
  function parseNumberList(s) {
    s = clean(s).replace(/^\{|\}$/g, "");
    if (NONE.test(s)) return [];
    return splitList(s).map(p => value(stripLhs(p)).v);
  }
  function sameMultiset(u, a, opts) {
    if (u.length !== a.length) return false;
    const left = a.slice();
    for (const x of u) { const i = left.findIndex(y => close(x, y, opts)); if (i < 0) return false; left.splice(i, 1); }
    return true;
  }

  /* inequality / interval answers → predicate */
  function parseIneq(s, v) {
    s = clean(s).replace(/∪|\bU\b/g, " or ").replace(/∞/g, "oo");
    if (NONE.test(s)) return () => false;
    if (ALL.test(s.replace(/\s/g, ""))) return () => true;
    const parts = s.split(/\s+(?:or|یا)\s+|\s*\|\|\s*/i).map(x => x.trim()).filter(Boolean);
    const preds = parts.map(p => {
      const iv = p.match(/^([\[(])\s*([^,]+?)\s*,\s*([^\])]+?)\s*([\])])$/);
      if (iv) {
        const lo = value(iv[2]).v, hi = value(iv[3]).v, lc = iv[1] === "[", rc = iv[4] === "]";
        return x => (lc ? x >= lo : x > lo) && (rc ? x <= hi : x < hi);
      }
      const toks = p.split(/(<=|>=|<|>)/).map(x => x.trim()).filter(x => x !== "");
      if (toks.length < 3 || toks.length % 2 === 0) throw new E.MathError(tr("قالب نامعادله را نفهمیدم؛ مثلاً x < 3 یا (2, 5] بنویس.", "I couldn't read the inequality; write e.g. x < 3 or (2, 5]."));
      const cmp = (a, op, b) => (op === "<" ? a < b : op === ">" ? a > b : op === "<=" ? a <= b : a >= b);
      const terms = toks.filter((_, i) => i % 2 === 0), ops = toks.filter((_, i) => i % 2 === 1);
      const getter = terms.map(t => (t === v ? null : value(t).v));
      if (!terms.includes(v)) throw new E.MathError(tr("متغیر " + v + " در جواب نیست.", "The variable " + v + " is missing from the answer."));
      return x => ops.every((op, i) => cmp(getter[i] === null ? x : getter[i], op, getter[i + 1] === null ? x : getter[i + 1]));
    });
    return x => preds.some(f => f(x));
  }
  function samePredicate(f, g, critical) {
    const pts = [-1e6, -1000, -100, -37.3, -10.7, -3.3, -1.1, -0.4, 0, 0.3, 1.7, 2.9, 7.1, 13.9, 99, 1e6];
    (critical || []).forEach(c => { pts.push(c, c - 1e-6, c + 1e-6, c - 0.5, c + 0.5); });
    return pts.every(x => !!f(x) === !!g(x));
  }

  function parseTuple(s, vars) {
    s = clean(s);
    const out = {};
    if (/=/.test(s)) {
      splitList(s).forEach(p => { const m = p.match(/^([a-z])\s*=\s*(.+)$/i); if (m) out[m[1]] = value(m[2]).v; });
    } else {
      const items = s.replace(/^[\[(]|[\])]$/g, "").split(/[,;\s]+/).filter(Boolean).map(x => value(x).v);
      vars.forEach((v, i) => { out[v] = items[i]; });
    }
    return out;
  }
  function parseMatrix(s) {
    let t = String(s || "").trim();
    if (/^[\[(][^\[\]()]*[\])]$/.test(t) && !/;/.test(t)) t = t.slice(1, -1); /* (1, 2) → row vector */
    return E.parseMatrix(t.replace(/\],\s*\[/g, ";"));
  }

  /* main entry: returns { ok, msg } (msg optional explanation of a near miss) */
  function check(p, input) {
    const o = p.opts || {};
    try {
      if (p.type === "choice") return { ok: +input === p.ans };
      if (String(input || "").trim() === "") return { ok: false, empty: true, msg: tr("اول جوابت را بنویس.", "Type your answer first.") };
      switch (p.type) {
        case "num": {
          const s = stripLhs(clean(input));
          const u = value(s);
          const exactAns = p.ans && p.ans.num && !o.tol && !o.rtol;
          const ok = exactAns && u.q ? u.q.eq(p.ans) : close(u.v, ansNum(p.ans), exactAns ? { rtol: 1e-9 } : o);
          if (ok && o.lowest && u.ast.t === "bin" && u.ast.op === "/" && u.ast.l.t === "num" && u.ast.r.t === "num" && u.q && !(u.ast.l.q.isInt() && u.ast.r.q.isInt() && E.bgcd(u.ast.l.q.n, u.ast.r.q.n) === 1n))
            return { ok: false, msg: tr("مقدار درست است، اما کسر را تا حد ممکن ساده کن.", "The value is right, but reduce the fraction to lowest terms.") };
          return { ok };
        }
        case "expr": {
          const s = stripLhs(clean(input)).replace(/\+\s*[cC]\s*$/, "");
          const u = E.parse(s);
          const vars = o.vars || [...E.vars(p.ans)];
          if (o.form === "antideriv") {
            const v = vars[0] || "x";
            const ok = E.equivalent(E.D(u, v), p.integrand, [v]);
            return { ok, msg: ok ? null : tr("مشتق جوابت با انتگرال‌ده برابر نیست.", "The derivative of your answer does not match the integrand.") };
          }
          const extra = [...E.vars(u)].filter(x => !vars.includes(x));
          if (extra.length) return { ok: false, msg: tr("متغیر ناشناخته در جواب: ", "Unexpected variable in the answer: ") + extra.join(", ") };
          const ok = E.equivalent(u, p.ans, vars.length ? vars : ["x"]) || (vars.length === 0 && close(E.evalNum(u, {}), E.evalNum(p.ans, {}), o));
          if (!ok) return { ok: false };
          if (o.form === "factored" && !isFactored(u)) return { ok: false, msg: tr("عبارت هم‌ارز است، اما باید به شکل تجزیه‌شده (حاصل‌ضرب) نوشته شود.", "Equivalent, but it must be written in factored form (as a product).") };
          if (o.form === "expanded" && !isExpanded(u)) return { ok: false, msg: tr("عبارت هم‌ارز است، اما پرانتزها را باز کن.", "Equivalent, but expand the parentheses.") };
          if (o.form === "simplest" && nodeCount(u) > nodeCount(p.ans) + 2) return { ok: false, msg: tr("هم‌ارز است، اما هنوز ساده‌تر می‌شود.", "Equivalent, but it can be simplified further.") };
          if (o.form === "radical" && !radicalsSimplified(u)) return { ok: false, msg: tr("مقدار درست است، اما رادیکال را ساده کن (عامل مربع کامل را بیرون بکش).", "The value is right, but simplify the radical (pull out perfect-square factors).") };
          return { ok: true };
        }
        case "set": {
          const u = parseNumberList(input);
          return { ok: sameMultiset(u, p.ans.map(ansNum), o) };
        }
        case "ineq": {
          const f = parseIneq(input, o.v || "x");
          return { ok: samePredicate(f, p.ans, o.critical) };
        }
        case "tuple": {
          const vars = o.vars || Object.keys(p.ans);
          const u = parseTuple(input, vars);
          return { ok: vars.every(v => u[v] !== undefined && close(u[v], ansNum(p.ans[v]), o)) };
        }
        case "matrix": {
          const u = parseMatrix(input), a = p.ans;
          if (u.length !== a.length || u[0].length !== a[0].length) return { ok: false, msg: tr("ابعاد جواب درست نیست.", "The answer has the wrong dimensions.") };
          return { ok: u.every((r, i) => r.every((x, j) => close(x.num(), ansNum(a[i][j]), o))) };
        }
      }
    } catch (e) {
      return { ok: false, msg: tr("جوابت را نتوانستم بخوانم: ", "I couldn't read your answer: ") + (e && e.message ? e.message : e) };
    }
    return { ok: false };
  }
  const CHECK = { check, parseIneq, parseNumberList, parseTuple, nodeCount, isFactored, isExpanded, samePredicate };
  root.CHECK = CHECK;
  if (typeof module !== "undefined" && module.exports) module.exports = CHECK;
})(typeof globalThis !== "undefined" ? globalThis : this);
