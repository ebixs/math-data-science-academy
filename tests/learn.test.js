/* Learning-system tests: curriculum graph, lessons (both languages, KaTeX-valid) and practice generators.
   Run: node tests/learn.test.js   (or MDSA_LANG=en node tests/learn.test.js) */
"use strict";
const path = require("path");
const fs = require("fs");
const ROOT = path.join(__dirname, "..");
globalThis.MDSA_LANG = process.env.MDSA_LANG === "en" ? "en" : "fa";
globalThis.nerdamer = require(path.join(ROOT, "assets/vendor/nerdamer/nerdamer.min.js"));
globalThis.katex = require(path.join(ROOT, "assets/vendor/katex/katex.min.js"));
for (const f of ["core", "algebra", "calculus", "matrix", "stats"]) require(path.join(ROOT, "assets/solver", f + ".js"));
require(path.join(ROOT, "assets/curriculum/skills.js"));
const MD = require(path.join(ROOT, "assets/learn/md.js"));
const CHECK = require(path.join(ROOT, "assets/learn/check.js"));
const PRACTICE = require(path.join(ROOT, "assets/learn/practice.js"));
const CUR = globalThis.CURRICULUM, E = globalThis.MathEngine;
const LESSONS_FILE = path.join(ROOT, "assets/curriculum/lessons.js");
if (fs.existsSync(LESSONS_FILE)) require(LESSONS_FILE);
const LESSONS = globalThis.LESSONS || {};
const N = +(process.env.N || 25);

let pass = 0, fail = 0; const errors = [];
const ok = (cond, msg) => { if (cond) pass++; else { fail++; errors.push(msg); } };

/* curriculum graph */
ok(CUR.order.length === CUR.skills.length, "topological order covers every skill (no cycles)");
CUR.skills.forEach(s => s.pre.forEach(p => ok(!!CUR.byId[p], s.id + ": unknown prerequisite " + p)));
CUR.skills.forEach(s => s.pre.forEach(p => ok(CUR.order.indexOf(p) < CUR.order.indexOf(s.id), s.id + " comes after " + p)));
["s", "u", "d"].forEach(g => ok(CUR.goalSkills(g).length > 10, "goal " + g + " has skills"));

/* lessons */
CUR.skills.forEach(s => {
  ["fa", "en"].forEach(l => {
    const md = LESSONS[s.id] && LESSONS[s.id][l];
    ok(!!md && md.length > 400, "lesson " + s.id + "." + l + " exists and is substantial");
    if (!md) return;
    try { MD.render(md, { strict: true }); pass++; } catch (e) { fail++; errors.push("lesson " + s.id + "." + l + ": " + e.message); }
    if (l === "en") { const m = md.match(/[؀-ۿ]+/); ok(!m, "English lesson " + s.id + " contains Persian text: " + (m && m[0])); }
  });
});

/* practice generators */
const perturb = p => {
  switch (p.type) {
    case "num": { const v = typeof p.ans === "number" ? p.ans : p.ans.num(); let w = v * 1.1 + 1.37; const tol = (p.opts && p.opts.tol) || 0; if (Math.abs(w - v) <= 3 * tol) w = v + 1 + 10 * tol; return String(w); }
    case "set": return p.ans.length ? p.ansStr + ", 987" : "5";
    case "expr": return "(" + p.ansStr + ") + x + 1";
    case "choice": return String((p.ans + 1) % p.choices.length);
    case "tuple": return "(" + p.opts.vars.map((v, i) => (i === 0 ? "1001" : "0")).join(", ") + ")";
    case "matrix": return p.ansStr.replace(/^(\S+)/, "999");
    case "ineq": return "x > 1000";
  }
};
CUR.skills.forEach(s => {
  ok(PRACTICE.has(s.id), "practice generator exists for " + s.id);
  if (!PRACTICE.has(s.id)) return;
  for (let i = 0; i < N; i++) {
    let p;
    try { p = PRACTICE.generate(s.id); } catch (e) { fail++; errors.push(s.id + " generator threw: " + e.message); break; }
    const tag = s.id + " #" + i + " [" + p.type + "] ";
    try { MD.render(p.q, { strict: true }); if (p.tex) MD.renderMath(p.tex, true, true); if (p.ansTex) MD.renderMath(p.ansTex, true, true); }
    catch (e) { fail++; errors.push(tag + "render: " + e.message); continue; }
    const r = CHECK.check(p, p.ansStr);
    ok(r.ok, tag + "canonical answer rejected: " + p.ansStr + " " + (r.msg || "") + " | q=" + p.q.slice(0, 80) + " tex=" + (p.tex || "").slice(0, 80));
    const w = CHECK.check(p, perturb(p));
    ok(!w.ok, tag + "wrong answer accepted: " + perturb(p));
    if (p.solve) {
      try { const res = p.solve(); ok(res && res.answer, tag + "solve() returned no answer"); (res.steps || []).forEach(st => st.tex && MD.renderMath(st.tex, true, true)); }
      catch (e) { fail++; errors.push(tag + "solve() threw: " + e.message + " | " + (p.tex || p.q).slice(0, 100)); }
    }
    if (globalThis.MDSA_LANG === "en") {
      const txt = [p.q, p.tex, p.ansTex, p.hint].concat(p.choices || []).concat((p.explain || []).flatMap(x => [x.t, x.tex])).filter(Boolean).join(" ");
      const m = txt.match(/[؀-ۿ]+/); ok(!m, tag + "Persian text in English problem: " + (m && m[0]));
    }
  }
});

/* checker unit tests */
const pnum = { type: "num", ans: E.Q.of(3, 4), opts: { lowest: true } };
ok(CHECK.check(pnum, "3/4").ok && CHECK.check(pnum, "0.75").ok && !CHECK.check(pnum, "6/8").ok, "num: lowest-terms check");
const pset = { type: "set", ans: [E.Q.of(2), E.Q.of(3)], opts: {} };
ok(CHECK.check(pset, "x = 3, x = 2").ok && CHECK.check(pset, "3 or 2").ok && !CHECK.check(pset, "2").ok, "set: order-free, x= prefixes");
ok(CHECK.check({ type: "set", ans: [], opts: {} }, "none").ok && CHECK.check({ type: "set", ans: [], opts: {} }, "ندارد").ok, "set: empty answers");
const pin = { type: "ineq", ans: x => x <= -2 || x >= 2, opts: { v: "x", critical: [-2, 2] } };
ok(CHECK.check(pin, "x <= -2 or x >= 2").ok && CHECK.check(pin, "(-oo, -2] U [2, oo)").ok && !CHECK.check(pin, "x < -2 or x > 2").ok, "ineq: forms and endpoints");
const pex = { type: "expr", ans: E.parse("(x-2)(x-3)"), opts: { form: "factored", vars: ["x"] } };
ok(CHECK.check(pex, "(x-3)(x-2)").ok && !CHECK.check(pex, "x^2-5x+6").ok, "expr: factored form");
const pad = { type: "expr", ans: E.parse("x^3/3"), integrand: E.parse("x^2"), opts: { form: "antideriv", vars: ["x"] } };
ok(CHECK.check(pad, "x^3/3 + 5").ok && CHECK.check(pad, "x^3/3 + C").ok && !CHECK.check(pad, "x^3").ok, "expr: antiderivative up to a constant");
const ptu = { type: "tuple", ans: { x: E.Q.of(2), y: E.Q.of(-1) }, opts: { vars: ["x", "y"] } };
ok(CHECK.check(ptu, "(2, -1)").ok && CHECK.check(ptu, "y=-1, x=2").ok && !CHECK.check(ptu, "(-1, 2)").ok, "tuple: ordered and named");

console.log(errors.filter(e => !process.env.SKIP_LESSONS || !/^lesson|English lesson/.test(e)).slice(0, +(process.env.SHOW || 40)).join("\n"));
console.log((fail ? "FAIL" : "PASS") + " [" + globalThis.MDSA_LANG + "]: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
