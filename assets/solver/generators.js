/* Random "similar problem" generators for practice, per solver category/mode.
   Each returns { input, params? } using small integers so answers stay clean. */
(function (root) {
  "use strict";
  const E = root.MathEngine;
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const nz = (a, b) => { let v = 0; while (!v) v = R(a, b); return v; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const sg = (k, first) => (k < 0 ? (first ? "-" : " - ") + Math.abs(k) : (first ? "" : " + ") + k);
  const term = (k, body, first) => { if (k === 0) return ""; const a = Math.abs(k); const coef = a === 1 && body ? "" : String(a); return (k < 0 ? (first ? "-" : " - ") : (first ? "" : " + ")) + coef + body; };
  const lin = (a, b) => (term(a, "x", true) + (b ? sg(b, false) : "")) || "0";
  const quad = (a, b, c) => term(a, "x^2", true) + term(b, "x", false) + (c ? sg(c, false) : "");

  const G = {
    arith: {
      calc: () => pick([
        () => R(2, 9) + " + " + R(2, 9) + " * (" + R(10, 20) + " - " + R(1, 9) + ")",
        () => R(1, 5) + "/" + R(2, 7) + " + " + R(1, 5) + "/" + R(2, 7),
        () => R(2, 5) + "^" + R(2, 3) + " - sqrt(" + pick([16, 25, 36, 49, 64, 81]) + ") / " + pick([2, 4]),
        () => "(" + R(1, 4) + "/" + R(2, 5) + ") * (" + R(2, 9) + "/" + R(2, 6) + ")",
      ])(),
      prime: () => String(pick([2, 3, 5]) ** R(1, 3) * pick([3, 7, 11]) * pick([1, 5, 13])),
      gcd: () => { const g = R(2, 12); return g * R(2, 9) + ", " + g * R(2, 9); },
    },
    algebra: {
      simplify: () => pick([() => R(2, 5) + "(x" + sg(nz(-6, 6)) + ")" + sg(nz(-5, 5)) + "(x" + sg(nz(-6, 6)) + ")", () => { const a = nz(-6, 6); return "(x^2 - " + a * a + ")/(x" + sg(-a) + ")"; }])(),
      expand: () => pick([() => "(x" + sg(nz(-7, 7)) + ")(x" + sg(nz(-7, 7)) + ")", () => "(" + R(2, 4) + "x" + sg(nz(-5, 5)) + ")^2", () => "(x" + sg(nz(-3, 3)) + ")^3"])(),
      factor: () => { const r = nz(-7, 7), s = nz(-7, 7), a = pick([1, 1, 1, 2, 3]); return quad(a, -a * (r + s), a * r * s); },
    },
    equation: {
      eq: () => pick([
        () => { const x = nz(-9, 9), a = nz(-6, 6), c = nz(-6, 6), b = R(-10, 10); const cc = c === a ? c + 1 : c; const d = a * x + b - cc * x; return lin(a, b) + " = " + lin(cc, d); },
        () => { const r = nz(-8, 8), s = nz(-8, 8); return quad(1, -(r + s), r * s) + " = 0"; },
        () => { const r = nz(-5, 5), s = nz(-5, 5), a = pick([2, 3]); return quad(a, -a * (r + s), a * r * s) + " = 0"; },
        () => { const k = R(1, 9), b = nz(-6, 6); return "|x" + sg(b) + "| = " + k; },
        () => { const b = pick([2, 3, 5]), k = R(2, 4); return b + "^x = " + b ** k; },
        () => quad(1, nz(-6, 6), R(-10, 10)) + " = 0",
      ])(),
      ineq: () => pick([
        () => lin(nz(-5, 5), R(-9, 9)) + pick([" < ", " > ", " <= ", " >= "]) + R(-9, 9),
        () => { const r = nz(-6, 6), s = nz(-6, 6); return quad(1, -(r + s), r * s) + pick([" < 0", " >= 0"]); },
      ])(),
    },
    system: { sys: () => { const x = nz(-6, 6), y = nz(-6, 6); let a, b, c, d; do { a = nz(-5, 5); b = nz(-5, 5); c = nz(-5, 5); d = nz(-5, 5); } while (a * d - b * c === 0); return lin(a, 0).replace("x", "x") + term(b, "y", false) + " = " + (a * x + b * y) + "\n" + lin(c, 0) + term(d, "y", false) + " = " + (c * x + d * y); } },
    graph: { plot: () => pick(["x^2 - " + R(1, 9), "sin(" + R(1, 3) + "x)", "x^3 - " + R(2, 6) + "x", "1/(x" + sg(nz(-3, 3)) + ")", "e^(-x^2)", "abs(x" + sg(nz(-4, 4)) + ") - " + R(1, 4)]) },
    derivative: { d: () => pick([
      () => R(2, 6) + "x^" + R(2, 5) + term(nz(-7, 7), "x", false) + sg(R(1, 9), false),
      () => "x^" + R(2, 4) + "*sin(x)", () => "e^(" + R(2, 5) + "x)*cos(x)", () => "ln(x^2 + " + R(1, 9) + ")",
      () => "sqrt(" + R(2, 5) + "x^2 + " + R(1, 9) + ")", () => "(x" + sg(nz(-5, 5)) + ")/(x^2 + " + R(1, 4) + ")", () => "(" + R(2, 4) + "x + 1)^" + R(3, 6),
    ])() },
    integral: { i: () => pick([
      () => R(2, 9) + "x^" + R(2, 4) + term(nz(-6, 6), "x", false) + sg(nz(-9, 9), false),
      () => "x*e^(" + R(2, 3) + "x)", () => "x*cos(x)", () => "cos(" + R(2, 5) + "x + " + R(1, 3) + ")", () => R(2, 3) + "x*sin(x^2)",
      () => "x/(x^2 + " + R(1, 9) + ")", () => "1/(x^2 - " + pick([1, 4, 9]) + ")", () => "x^2*ln(x)",
    ])() },
    limit: { lim: () => pick([
      () => { const a = nz(-5, 5); return { input: "(x^2 - " + a * a + ")/(x" + sg(-a) + ")", params: { point: String(a) } }; },
      () => ({ input: "(" + R(2, 6) + "x^2 + " + R(1, 5) + ")/(" + R(2, 6) + "x^2 - x)", params: { point: "oo" } }),
      () => ({ input: "sin(" + R(2, 5) + "x)/x", params: { point: "0" } }),
      () => ({ input: "(e^x - 1)/(" + R(2, 4) + "x)", params: { point: "0" } }),
    ])() },
    apps: {
      tangent: () => ({ input: quad(1, nz(-4, 4), R(-5, 5)), params: { point: String(nz(-3, 3)) } }),
      extrema: () => { const a = R(1, 3); return "x^3 - " + 3 * a * a + "x"; },
      taylor: () => ({ input: pick(["e^x", "sin(x)", "cos(x)", "ln(1+x)"]), params: { center: "0", order: String(R(3, 5)) } }),
    },
    matrix: { m: () => { const n = pick([2, 2, 3]); return { matrix: Array.from({ length: n }, () => Array.from({ length: n }, () => R(-5, 6))) }; } },
    stats: {
      describe: () => Array.from({ length: R(7, 12) }, () => R(1, 30)).join(", "),
      regression: () => { const b = R(1, 4), a = R(-3, 5); return Array.from({ length: 6 }, (_, i) => (i + 1) + ", " + (a + b * (i + 1) + R(-2, 2))).join("\n"); },
      comb: () => ({ params: { n: String(R(5, 15)), k: String(R(1, 5)) } }),
      binom: () => ({ params: { n: String(R(5, 15)), p: pick(["0.5", "0.3", "0.2"]), k: String(R(1, 5)) } }),
      normal: () => ({ params: { mu: String(R(50, 70)), sigma: String(R(5, 12)), a: String(R(40, 55)), b: String(R(60, 80)) } }),
    },
  };
  E.generate = function (cat, mode) {
    const g = G[cat]; if (!g) return null;
    const fn = g[mode] || Object.values(g)[0];
    const r = fn();
    return typeof r === "string" ? { input: r } : r;
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
