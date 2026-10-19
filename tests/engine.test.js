/* Engine tests: run with `node tests/engine.test.js` (Persian) or `MDSA_LANG=en node tests/engine.test.js`.
   Checks answers and renders every step through KaTeX so broken TeX fails the suite. */
"use strict";
const path = require("path");
const ROOT = path.join(__dirname, "..");
globalThis.nerdamer = require(path.join(ROOT, "assets/vendor/nerdamer/nerdamer.min.js"));
const katex = require(path.join(ROOT, "assets/vendor/katex/katex.min.js"));
for (const f of ["core", "algebra", "calculus", "matrix", "stats"]) require(path.join(ROOT, "assets/solver", f + ".js"));
const E = globalThis.MathEngine;
globalThis.MDSA_LANG = process.env.MDSA_LANG === "en" ? "en" : "fa";
const L = (fa, en) => (globalThis.MDSA_LANG === "en" ? en : fa);

let pass = 0, fail = 0;
const failures = [];
function renderAll(r, label) {
  const texs = [r.answer, r.approx].filter(Boolean).concat((r.steps || []).map(s => s.tex).filter(Boolean));
  for (const t of texs) {
    try { katex.renderToString(t, { throwOnError: true, displayMode: true, strict: "ignore", trust: false }); }
    catch (e) { throw new Error("KaTeX failed in " + label + ": " + e.message + "\n    TeX: " + t.slice(0, 300)); }
  }
}
function check(label, fn, expect) {
  try {
    const r = fn();
    renderAll(r, label);
    if (globalThis.MDSA_LANG === "en") {
      const text = [r.answer, r.approx, r.note].concat((r.steps || []).flatMap(st => [st.title, st.tex, st.note])).filter(Boolean).join(" ");
      const m = text.match(/[\u0600-\u06FF]+/);
      if (m) throw new Error("Persian text in English output: " + m[0]);
    }
    const ans = r.answer.replace(/\s+/g, "");
    const ok = (Array.isArray(expect) ? expect : [expect]).every(x => x instanceof RegExp ? x.test(r.answer) : ans.includes(String(x).replace(/\s+/g, "")));
    if (!ok) throw new Error("unexpected answer: " + r.answer);
    pass++;
  } catch (e) { fail++; failures.push("✘ " + label + " — " + e.message); }
}
const eq = s => { const st = E.parseStatement(s)[0]; return st.rels[0] === "=" ? E.solveEquation(st.parts[0], st.parts[1]) : E.solveInequality(st.parts[0], st.rels[0], st.parts[1]); };
const sys = s => E.solveSystem(E.parseStatement(s).map(g => g.parts));
const P = E.parse;

/* arithmetic & numbers */
check("order of operations", () => E.arithmetic(P("2+3*4")), "14");
check("fractions", () => E.arithmetic(P("1/2+1/3")), "\\frac{5}{6}");
check("powers & roots", () => E.arithmetic(P("2^3-sqrt(16)/2")), "6");
check("factorial", () => E.arithmetic(P("5!/(3!*2!)")), "10");
check("trig exact", () => E.arithmetic(P("sin(pi/6)+1")), "1.5");
check("prime factors", () => E.primeFactorSteps(360), "2^{3}");
check("gcd/lcm", () => E.gcdSteps([12, 18]), ["6", "36"]);
check("persian digits", () => E.arithmetic(P("۲+۳×۴")), "14");
/* linear */
check("linear", () => eq("2x+3=11"), "x = 4");
check("linear parens", () => eq("3(x-2)+4=2x+1"), "x = 3");
check("linear fractions", () => eq("x/2+1/3=5/6"), "x = 1");
check("identity", () => eq("2(x+1)=2x+2"), "\\mathbb{R}");
check("contradiction", () => eq("2x+1=2x+3"), "\\varnothing");
check("literal", () => eq("ax+b=c"), "x =");
/* quadratic & polynomial */
check("quadratic factor", () => eq("x^2-5x+6=0"), ["x = 2", "x = 3"]);
check("quadratic ac", () => eq("2x^2+3x-2=0"), ["-2", "\\frac{1}{2}"]);
check("quadratic formula", () => eq("x^2-2x-1=0"), "\\sqrt{2}");
check("quadratic complex", () => eq("x^2+x+1=0"), "i");
check("double root", () => eq("x^2-4x+4=0"), "x = 2");
check("cubic", () => eq("x^3-6x^2+11x-6=0"), ["1", "2", "3"]);
check("biquadratic", () => eq("x^4-5x^2+4=0"), ["-2", "-1"]);
check("rational eq", () => eq("1/x+1/2=1"), "x = 2");
check("rational extraneous", () => eq("(x^2-1)/(x-1)=0"), "x = -1");
check("abs", () => eq("|2x-1|=5"), ["-2", "3"]);
check("abs none", () => eq("|x|+3=1"), "\\varnothing");
check("radical extraneous", () => eq("sqrt(x+3)=x-3"), "x = 6");
check("exponential", () => eq("2^x=8"), "x = 3");
check("exponential ln", () => eq("3e^x=12"), "\\ln");
check("log", () => eq("log(x-1)=2"), "101");
check("trig general", () => eq("sin(x)=1/2"), ["2k\\pi", "\\frac{5 \\pi}{6}"]);
check("trig none", () => eq("sin(x)=2"), "\\varnothing");
check("numeric", () => eq("2^x=x+2"), "\\approx");
/* inequalities */
check("linear ineq flip", () => eq("-3x+1>=7"), "\\le -2");
check("quadratic ineq", () => eq("x^2-5x+6<0"), "\\left(2,\\; 3\\right)");
check("quadratic ineq outside", () => eq("x^2-4>=0"), "\\cup");
check("rational ineq", () => eq("(x-1)/(x+2)<=0"), "\\left(-2,\\; 1\\right]");
/* systems */
check("system 2x2", () => sys("2x+3y=7,4x-y=7"), ["x = 2", "y = 1"]);
check("system 3x3", () => sys("x+y+z=6,2x-y+z=3,x+2y-z=2"), ["x = 1", "y = 2", "z = 3"]);
check("system dependent", () => sys("x+y=2,2x+2y=4"), "\\mathbb{R}");
check("system inconsistent", () => sys("x+y=2,x+y=3"), L("ندارد", "no solution"));
/* algebraic manipulation */
check("factor trinomial", () => E.factorSteps(P("x^2-5x+6")), "\\left(x - 2\\right)\\left(x - 3\\right)");
check("factor squares", () => E.factorSteps(P("x^4-16")), "x^{2} + 4");
check("factor cubes", () => E.factorSteps(P("x^3+8")), "x^{2} - 2 x + 4");
check("factor ac", () => E.factorSteps(P("6x^2+x-2")), "2 x - 1");
check("factor multivariate", () => E.factorSteps(P("2x^2y+4xy^2")), "2 x y");
check("expand", () => E.simplifySteps(P("(x+1)(x+2)")), "x^{2} + 3 x + 2");
check("expand cube", () => E.simplifySteps(P("(a+b)^3")), "a^{3} + 3 a^{2} b");
check("rational simplify", () => E.simplifySteps(P("(x^2-1)/(x-1)")), "x + 1");
check("trig identity", () => E.simplifySteps(P("sin(x)^2+cos(x)^2")), "1");
/* derivatives */
check("d power", () => E.derivativeSteps(P("x^3+2x"), "x"), "3 x^{2} + 2");
check("d product", () => E.derivativeSteps(P("x^2*sin(x)"), "x"), "x^{2} \\cos");
check("d quotient", () => E.derivativeSteps(P("sin(x)/x"), "x"), "\\frac{x \\cos");
check("d chain", () => E.derivativeSteps(P("sqrt(3x^2+1)"), "x"), "\\frac{3 x}{\\sqrt{3 x^{2} + 1}}");
check("d log", () => E.derivativeSteps(P("ln(x^2+1)"), "x"), "\\frac{2 x}{x^{2} + 1}");
check("d x^x", () => E.derivativeSteps(P("x^x"), "x"), "\\ln");
check("d second", () => E.derivativeSteps(P("x^4-3x^2"), "x", 2), "12 x^{2} - 6");
/* integrals */
check("∫ poly", () => E.integralSteps(P("3x^2+2x-5"), "x"), "x^{3} + x^{2} - 5 x");
check("∫ 1/x", () => E.integralSteps(P("1/x"), "x"), "\\ln\\left|x\\right|");
check("∫ linear sub", () => E.integralSteps(P("cos(3x+1)"), "x"), "\\frac{\\sin\\left(3 x + 1\\right)}{3}");
check("∫ u-sub", () => E.integralSteps(P("2x*cos(x^2)"), "x"), "\\sin\\left(x^{2}\\right)");
check("∫ u-sub log", () => E.integralSteps(P("x/(x^2+1)"), "x"), "\\ln");
check("∫ by parts", () => E.integralSteps(P("x*e^x"), "x"), "x e^{x} - e^{x}");
check("∫ by parts ln", () => E.integralSteps(P("x^2*ln(x)"), "x"), "\\ln");
check("∫ partial fractions", () => E.integralSteps(P("1/(x^2-1)"), "x"), "\\ln\\left|x - 1\\right|");
check("∫ division", () => E.integralSteps(P("x^3/(x-1)"), "x"), "\\ln\\left|x - 1\\right|");
check("∫ atan", () => E.integralSteps(P("1/(1+x^2)"), "x"), "\\arctan");
check("∫ sin^2", () => E.integralSteps(P("sin(x)^2"), "x"), "\\sin\\left(2 x\\right)");
check("∫ definite", () => E.integralSteps(P("x^2"), "x", [P("0"), P("3")]), "= 9");
check("∫ definite trig", () => E.integralSteps(P("sin(x)"), "x", [P("0"), P("pi")]), "= 2");
check("∫ numeric", () => E.integralSteps(P("e^(x^2)"), "x", [P("0"), P("1")]), "1.4626");
check("∫ improper", () => E.integralSteps(P("1/x^2"), "x", [P("1"), P("oo")]), "= 1");
check("∫ divergent", () => E.integralSteps(P("1/x"), "x", [P("1"), P("oo")]), L("واگرا", "diverges"));
/* limits */
check("lim substitution", () => E.limitSteps(P("x^2+1"), "x", P("2")), "= 5");
check("lim factor", () => E.limitSteps(P("(x^2-1)/(x-1)"), "x", P("1")), "= 2");
check("lim sinx/x", () => E.limitSteps(P("sin(x)/x"), "x", P("0")), "= 1");
check("lim hopital twice", () => E.limitSteps(P("(1-cos(x))/x^2"), "x", P("0")), "\\frac{1}{2}");
check("lim infinity", () => E.limitSteps(P("(3x^2+1)/(2x^2-x)"), "x", P("oo")), "\\frac{3}{2}");
check("lim e", () => E.limitSteps(P("(1+1/x)^x"), "x", P("oo")), "= e");
check("lim dne", () => E.limitSteps(P("1/x"), "x", P("0")), L("وجود ندارد", "does not exist"));
check("lim radical", () => E.limitSteps(P("(sqrt(x+4)-2)/x"), "x", P("0")), "\\frac{1}{4}");
check("tangent", () => E.tangentSteps(P("x^2"), "x", P("1")), "y = 2 x - 1");
check("extrema", () => E.extremaSteps(P("x^3-3x"), "x"), ["\\max", "\\min"]);
check("taylor", () => E.taylorSteps(P("sin(x)"), "x", P("0"), 5), "\\frac{x^{5}}{120}");
/* matrices */
const M = E.parseMatrix;
check("det 2x2", () => E.matrixOp("det", M("2 1;1 3")), "= 5");
check("det 3x3", () => E.matrixOp("det", M("1 2 3;0 1 4;5 6 0")), "= 1");
check("det 4x4", () => E.matrixOp("det", M("1 2 3 4;5 6 7 8;2 6 4 8;3 1 1 2")), "= 72");
check("inverse 2x2", () => E.matrixOp("inv", M("2 1;1 3")), "\\frac{3}{5}");
check("inverse 3x3", () => E.matrixOp("inv", M("1 2 3;0 1 4;5 6 0")), "-24");
check("singular", () => E.matrixOp("inv", M("1 2;2 4")), L("نیست", "not invertible"));
check("product", () => E.matrixOp("mul", M("2 1;1 3"), M("1 2;3 4")), "5 & 8");
check("rref", () => E.matrixOp("rref", M("1 2 3;4 5 6;7 8 9")), "rank}(A) = 2");
check("eigen", () => E.matrixOp("eig", M("4 1;2 3")), ["\\lambda = 2", "\\lambda = 5"]);
check("Ax=b", () => E.matrixOp("solve", M("2 1;1 3"), M("3;5")), "\\frac{4}{5}");
/* statistics */
check("describe", () => E.describeSteps(E.parseData("2, 4, 4, 4, 5, 5, 7, 9")), ["\\bar{x} = 5", L("میانه} = 4.5", "median} = 4.5")]);
check("regression", () => E.regressionSteps(E.parsePairs("1 2\n2 4\n3 6\n4 8")), ["\\hat{y} = 2x", "r = 1"]);
check("nCr", () => E.combSteps("C", 10, 3), "= 120");
check("nPr", () => E.combSteps("P", 5, 2), "= 20");
check("binomial", () => E.binomialSteps(10, 0.5, 5), "0.246094");
check("normal", () => E.normalSteps(0, 1, -1.96, 1.96), "0.950004");

console.log(failures.join("\n"));
console.log((fail ? "FAIL" : "PASS") + " [" + globalThis.MDSA_LANG + "]: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
