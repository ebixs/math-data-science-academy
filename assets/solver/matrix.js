/* MathEngine matrices: exact rational matrices with steps — determinant (formula, cofactor,
   elimination), inverse (Gauss–Jordan), products, transpose, powers, RREF/rank, Ax = b,
   eigenvalues (characteristic polynomial) and eigenvectors. */
(function (root) {
  "use strict";
  const E = root.MathEngine;
  const { Q, N, MathError, step } = E;
  const q = (n, d = 1) => Q.of(n, d);
  const T = E.tex;

  function parseMatrix(text) {
    const src = String(text).split("\n").map(l => E.normalizeInput(l)).join("\n").trim().replace(/^\s*\[|\]\s*$/g, "");
    const rows = src.split(/\n|;|\]\s*,?\s*\[/).map(r => r.trim().replace(/^\[|\]$/g, "")).filter(Boolean);
    if (!rows.length) throw new MathError("ماتریس خالی است.");
    const M = rows.map(r => r.split(/[\s,]+/).filter(Boolean).map(x => {
      const v = E.evalExact(E.parse(x)); if (!v) throw new MathError("درایهٔ «" + x + "» عدد گویا نیست.");
      return v;
    }));
    const c = M[0].length;
    if (M.some(r => r.length !== c)) throw new MathError("همهٔ سطرهای ماتریس باید هم‌اندازه باشند.");
    if (M.length > 8 || c > 8) throw new MathError("حداکثر اندازهٔ ماتریس ۸×۸ است.");
    return M;
  }
  E.parseMatrix = parseMatrix;
  const mtex = (M, aug) => {
    if (aug) return E.matTex(M, true);
    return "\\begin{bmatrix}" + M.map(r => r.map(x => x.toTeX()).join(" & ")).join(" \\\\ ") + "\\end{bmatrix}";
  };
  const vmat = M => "\\begin{vmatrix}" + M.map(r => r.map(x => x.toTeX()).join(" & ")).join(" \\\\ ") + "\\end{vmatrix}";
  E.mtex = mtex;
  const clone = M => M.map(r => r.slice());
  const I = n => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => q(i === j ? 1 : 0)));
  const sq = M => { if (M.length !== M[0].length) throw new MathError("این عملیات فقط برای ماتریس مربعی تعریف شده است."); };
  const pt = x => x.sign() < 0 ? "\\left(" + x.toTeX() + "\\right)" : x.toTeX();

  function detValue(M) {
    const A = clone(M), n = A.length; let d = q(1);
    for (let c = 0; c < n; c++) {
      let p = -1; for (let i = c; i < n; i++) if (!A[i][c].isZero()) { p = i; break; }
      if (p < 0) return q(0);
      if (p !== c) { [A[p], A[c]] = [A[c], A[p]]; d = d.neg(); }
      d = d.mul(A[c][c]);
      for (let i = c + 1; i < n; i++) { const f = A[i][c].div(A[c][c]); if (!f.isZero()) A[i] = A[i].map((x, j) => x.sub(f.mul(A[c][j]))); }
    }
    return d;
  }
  E.detValue = detValue;
  const minor = (M, i, j) => M.filter((_, r) => r !== i).map(r => r.filter((_, c) => c !== j));

  function determinantSteps(M) {
    sq(M);
    const n = M.length, steps = [];
    if (n === 1) return { answer: "\\det = " + M[0][0].toTeX(), steps: [step("ماتریس ۱×۱", "\\det = " + M[0][0].toTeX(), null)] };
    if (n === 2) {
      const [[a, b], [c, d]] = M, r = a.mul(d).sub(b.mul(c));
      steps.push(step("فرمول دترمینان ۲×۲", vmat(M) + " = ad - bc = " + pt(a) + "\\cdot" + pt(d) + " - " + pt(b) + "\\cdot" + pt(c) + " = " + r.toTeX(), "حاصل‌ضرب قطر اصلی منهای حاصل‌ضرب قطر فرعی"));
      return { answer: "\\det(A) = " + r.toTeX(), steps, value: r };
    }
    if (n === 3) {
      const parts = [], vals = [];
      for (let j = 0; j < 3; j++) {
        const s = j % 2 ? "-" : "+", m = minor(M, 0, j), md = detValue(m);
        parts.push((j ? " " + s + " " : "") + pt(M[0][j]) + vmat(m));
        vals.push((j ? (j % 2 ? " - " : " + ") : "") + pt(M[0][j]) + "\\left(" + md.toTeX() + "\\right)");
      }
      const r = detValue(M);
      steps.push(step("بسط کهادی روی سطر اول", vmat(M) + " = " + parts.join(""), "علامت‌ها به‌ترتیب + − + هستند (قاعدهٔ شطرنجی)."));
      steps.push(step("محاسبهٔ کهادهای ۲×۲", "= " + vals.join("") + " = " + r.toTeX(), "هر کهاد ۲×۲ با ad − bc محاسبه می‌شود."));
      return { answer: "\\det(A) = " + r.toTeX(), steps, value: r };
    }
    /* elimination */
    const A = clone(M); let sign = 1;
    for (let c = 0; c < n; c++) {
      let p = -1; for (let i = c; i < n; i++) if (!A[i][c].isZero()) { p = i; break; }
      if (p < 0) { steps.push(step("ستون صفر", mtex(A), "ستونی بدون محور پیدا شد؛ دترمینان صفر است.")); return { answer: "\\det(A) = 0", steps, value: q(0) }; }
      if (p !== c) { [A[p], A[c]] = [A[c], A[p]]; sign = -sign; steps.push(step("جابه‌جایی سطر (علامت عوض می‌شود)", "R_{" + (c + 1) + "} \\leftrightarrow R_{" + (p + 1) + "}\\quad " + mtex(A), null)); }
      const ops = [];
      for (let i = c + 1; i < n; i++) { const f = A[i][c].div(A[c][c]); if (!f.isZero()) { A[i] = A[i].map((x, j) => x.sub(f.mul(A[c][j]))); ops.push("R_{" + (i + 1) + "} - " + pt(f) + "R_{" + (c + 1) + "}"); } }
      if (ops.length) steps.push(step("صفر کردن زیر محور ستون " + (c + 1), ops.join(",\\; ") + "\\quad " + mtex(A), "افزودن مضربی از یک سطر به سطر دیگر دترمینان را تغییر نمی‌دهد."));
    }
    let d = q(sign); const diag = []; for (let i = 0; i < n; i++) { d = d.mul(A[i][i]); diag.push(pt(A[i][i])); }
    steps.push(step("حاصل‌ضرب قطر ماتریس بالامثلثی", "\\det = " + (sign < 0 ? "-" : "") + diag.join("\\cdot") + " = " + d.toTeX(), null));
    return { answer: "\\det(A) = " + d.toTeX(), steps, value: d };
  }
  E.determinantSteps = determinantSteps;

  function inverseSteps(M) {
    sq(M);
    const n = M.length, steps = [];
    const d = detValue(M);
    steps.push(step("بررسی وارون‌پذیری", "\\det(A) = " + d.toTeX(), d.isZero() ? "دترمینان صفر است؛ ماتریس وارون ندارد." : "دترمینان ناصفر است؛ وارون وجود دارد."));
    if (d.isZero()) return { answer: "\\text{ماتریس وارون‌پذیر نیست}", steps };
    if (n === 2) {
      const [[a, b], [c, dd]] = M;
      const inv = [[dd.div(d), b.neg().div(d)], [c.neg().div(d), a.div(d)]];
      steps.push(step("فرمول وارون ۲×۲", "A^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix} = \\frac{1}{" + d.toTeX() + "}" + mtex([[dd, b.neg()], [c.neg(), a]]) + " = " + mtex(inv), "جای درایه‌های قطر اصلی عوض و علامت قطر فرعی قرینه می‌شود."));
      return { answer: "A^{-1} = " + mtex(inv), steps, value: inv };
    }
    const A = M.map((r, i) => r.concat(I(n)[i]));
    const aug = X => "\\left[\\begin{array}{" + "c".repeat(n) + "|" + "c".repeat(n) + "}" + X.map(r => r.map(x => x.toTeX()).join(" & ")).join(" \\\\ ") + "\\end{array}\\right]";
    steps.push(step("ماتریس افزودهٔ [A | I]", aug(A), "روی سطرها عملیات انجام می‌دهیم تا سمت چپ ماتریس همانی شود."));
    for (let c = 0; c < n; c++) {
      let p = -1; for (let i = c; i < n; i++) if (!A[i][c].isZero()) { p = i; break; }
      if (p !== c) { [A[p], A[c]] = [A[c], A[p]]; steps.push(step("جابه‌جایی سطرها", "R_{" + (c + 1) + "} \\leftrightarrow R_{" + (p + 1) + "}\\quad " + aug(A), null)); }
      const pv = A[c][c];
      if (!pv.isOne()) { A[c] = A[c].map(x => x.div(pv)); steps.push(step("یکه کردن محور سطر " + (c + 1), "R_{" + (c + 1) + "} \\to \\frac{1}{" + pv.toTeX() + "}R_{" + (c + 1) + "}\\quad " + aug(A), null)); }
      const ops = [];
      for (let i = 0; i < n; i++) if (i !== c && !A[i][c].isZero()) { const f = A[i][c]; A[i] = A[i].map((x, j) => x.sub(f.mul(A[c][j]))); ops.push("R_{" + (i + 1) + "} - " + pt(f) + "R_{" + (c + 1) + "}"); }
      if (ops.length) steps.push(step("صفر کردن ستون " + (c + 1), ops.join(",\\; ") + "\\quad " + aug(A), null));
    }
    const inv = A.map(r => r.slice(n));
    steps.push(step("نتیجه", "A^{-1} = " + mtex(inv), "سمت راست ماتریس افزوده اکنون وارون A است."));
    return { answer: "A^{-1} = " + mtex(inv), steps, value: inv };
  }
  E.inverseSteps = inverseSteps;

  function mul(A, B) {
    if (A[0].length !== B.length) throw new MathError("ضرب تعریف نشده است: تعداد ستون‌های A (" + A[0].length + ") باید با تعداد سطرهای B (" + B.length + ") برابر باشد.");
    return A.map(r => B[0].map((_, j) => r.reduce((s, x, k) => s.add(x.mul(B[k][j])), q(0))));
  }
  E.matMul = mul;
  function multiplySteps(A, B) {
    const C = mul(A, B), steps = [];
    steps.push(step("ابعاد", "(" + A.length + "\\times" + A[0].length + ")\\cdot(" + B.length + "\\times" + B[0].length + ") \\Rightarrow " + C.length + "\\times" + C[0].length, "درایهٔ c_{ij} حاصل ضرب داخلی سطر i از A در ستون j از B است."));
    if (C.length * C[0].length <= 9) {
      const lines = [];
      C.forEach((r, i) => r.forEach((x, j) => lines.push("c_{" + (i + 1) + (j + 1) + "} = " + A[i].map((a, k) => pt(a) + "\\cdot" + pt(B[k][j])).join(" + ") + " = " + x.toTeX())));
      steps.push(step("محاسبهٔ درایه‌ها", lines.join(" \\\\ "), null));
    }
    steps.push(step("نتیجه", mtex(A) + mtex(B) + " = " + mtex(C), null));
    return { answer: "AB = " + mtex(C), steps, value: C };
  }
  function addSteps(A, B, sign = 1) {
    if (A.length !== B.length || A[0].length !== B[0].length) throw new MathError("برای جمع یا تفریق، ابعاد دو ماتریس باید برابر باشد.");
    const C = A.map((r, i) => r.map((x, j) => sign > 0 ? x.add(B[i][j]) : x.sub(B[i][j])));
    return { answer: (sign > 0 ? "A + B = " : "A - B = ") + mtex(C), steps: [step(sign > 0 ? "جمع درایه‌به‌درایه" : "تفریق درایه‌به‌درایه", mtex(A) + (sign > 0 ? " + " : " - ") + mtex(B) + " = " + mtex(C), "درایه‌های هم‌مکان با هم جمع (تفریق) می‌شوند.")], value: C };
  }
  function transposeSteps(A) {
    const C = A[0].map((_, j) => A.map(r => r[j]));
    return { answer: "A^{T} = " + mtex(C), steps: [step("ترانهاده", "A^{T} = " + mtex(C), "سطرها ستون می‌شوند: (A^{T})_{ij} = a_{ji}")], value: C };
  }
  function powerSteps(A, k) {
    sq(A); if (k < 0) { const inv = inverseSteps(A); if (!inv.value) throw new MathError("ماتریس وارون ندارد."); A = inv.value; k = -k; }
    let R = I(A.length), steps = [];
    for (let i = 1; i <= k; i++) { R = mul(R, A); if (i <= 4 && i > 1) steps.push(step("A^{" + i + "}", "A^{" + i + "} = A^{" + (i - 1) + "}A = " + mtex(R), null)); }
    if (k > 4) steps.push(step("ادامهٔ ضرب", "A^{" + k + "} = " + mtex(R), null));
    return { answer: "A^{" + k + "} = " + mtex(R), steps, value: R };
  }
  function rrefSteps(M, augmented) {
    const A = clone(M), rows = A.length, cols = A[0].length, steps = [];
    const show = X => augmented ? E.matTex(X, true) : mtex(X);
    let r = 0; const pivots = [];
    const lim = augmented ? cols - 1 : cols;
    for (let c = 0; c < lim && r < rows; c++) {
      let p = -1; for (let i = r; i < rows; i++) if (!A[i][c].isZero()) { p = i; break; }
      if (p < 0) continue;
      if (p !== r) { [A[p], A[r]] = [A[r], A[p]]; steps.push(step("جابه‌جایی سطرها", "R_{" + (r + 1) + "} \\leftrightarrow R_{" + (p + 1) + "}\\quad " + show(A), null)); }
      const pv = A[r][c];
      if (!pv.isOne()) { A[r] = A[r].map(x => x.div(pv)); steps.push(step("یکه کردن محور", "R_{" + (r + 1) + "} \\to \\frac{1}{" + pv.toTeX() + "}R_{" + (r + 1) + "}\\quad " + show(A), null)); }
      const ops = [];
      for (let i = 0; i < rows; i++) if (i !== r && !A[i][c].isZero()) { const f = A[i][c]; A[i] = A[i].map((x, j) => x.sub(f.mul(A[r][j]))); ops.push("R_{" + (i + 1) + "} - " + pt(f) + "R_{" + (r + 1) + "}"); }
      if (ops.length) steps.push(step("صفر کردن ستون " + (c + 1), ops.join(",\\; ") + "\\quad " + show(A), null));
      pivots.push(c); r++;
    }
    steps.push(step("شکل سطری‌پلکانی کاهش‌یافته", show(A), "رتبه = تعداد سطرهای ناصفر = " + pivots.length));
    return { answer: "\\operatorname{rref}(A) = " + show(A) + ",\\quad \\operatorname{rank}(A) = " + pivots.length, steps, value: A, rank: pivots.length, pivots };
  }
  E.rrefSteps = rrefSteps;

  /* characteristic polynomial via polynomial-entry determinant (Bareiss-free cofactor for n<=4, else Faddeev–LeVerrier) */
  function charPoly(A) {
    const n = A.length;
    /* Faddeev–LeVerrier: exact over Q */
    let Mk = I(n).map(r => r.map(() => q(0))), c = [q(1)];
    let AM;
    const coeffs = Array(n + 1).fill(null); coeffs[n] = q(1);
    let M = I(n).map(r => r.map(() => q(0)));
    let prevC = q(1);
    for (let k = 1; k <= n; k++) {
      /* M_k = A M_{k-1} + c_{n-k+1} I */
      const AMk = mul(A, M);
      M = AMk.map((r, i) => r.map((x, j) => i === j ? x.add(prevC) : x));
      const AM2 = mul(A, M);
      let tr = q(0); for (let i = 0; i < n; i++) tr = tr.add(AM2[i][i]);
      const ck = tr.neg().div(q(k));
      coeffs[n - k] = ck; prevC = ck;
    }
    return new E.Poly(coeffs);
  }
  E.charPoly = charPoly;
  function eigenSteps(A) {
    sq(A); const n = A.length; if (n > 4) throw new MathError("مقادیر ویژه برای حداکثر ۴×۴ پشتیبانی می‌شود.");
    const steps = [];
    const P = charPoly(A);
    steps.push(step("چندجمله‌ای مشخصه", "\\det(A - \\lambda I) = " + P.tex("\\lambda"), "مقادیر ویژه ریشه‌های این چندجمله‌ای هستند."));
    const sub = [];
    const sol = P.deg() === 1 ? { answer: "\\lambda = " + P.co(0).neg().toTeX(), sols: [N.num(P.co(0).neg())] } : (function () { const r = E.solveEquation(P.toAst("L"), N.num(q(0)), "L"); return r; })();
    const ans = sol.answer.replace(/L/g, "\\lambda");
    steps.push(step("حل معادلهٔ مشخصه", ans, null));
    /* eigenvectors for rational eigenvalues */
    const vecs = [];
    (Array.isArray(sol.sols) ? sol.sols : []).forEach(s => {
      const lam = E.evalExact(s); if (!lam) return;
      const B = A.map((r, i) => r.map((x, j) => i === j ? x.sub(lam) : x));
      const rr = rrefSteps(B).value;
      const free = []; const piv = [];
      let r = 0; for (let c = 0; c < n && r < n; c++) { if (!rr[r][c].isZero() && rr[r][c].isOne()) { piv.push([r, c]); r++; } else free.push(c); }
      for (let c = piv.length ? piv[piv.length - 1][1] + 1 : 0; c < n; c++) if (!free.includes(c) && !piv.some(p => p[1] === c)) free.push(c);
      free.forEach(fc => {
        const v = Array(n).fill(q(0)); v[fc] = q(1);
        piv.forEach(([pr, pc]) => { v[pc] = rr[pr][fc].neg(); });
        let L = 1n; v.forEach(x => { L = E.blcm(L, x.d); }); const vi = v.map(x => x.mul(new Q(L)));
        vecs.push("\\lambda = " + lam.toTeX() + ":\\; \\vec v = " + mtex(vi.map(x => [x])));
      });
    });
    if (vecs.length) steps.push(step("بردارهای ویژه", vecs.join(" \\\\ "), "برای هر λ، فضای پوچ (A − λI) را با حذف گاوسی پیدا می‌کنیم."));
    return { answer: ans, steps };
  }
  E.eigenSteps = eigenSteps;

  E.matrixOp = function (op, A, B, k) {
    switch (op) {
      case "det": return determinantSteps(A);
      case "inv": return inverseSteps(A);
      case "mul": return multiplySteps(A, B);
      case "add": return addSteps(A, B, 1);
      case "sub": return addSteps(A, B, -1);
      case "T": return transposeSteps(A);
      case "pow": return powerSteps(A, k);
      case "rref": return rrefSteps(A);
      case "eig": return eigenSteps(A);
      case "solve": {
        if (!B || B[0].length !== 1 || B.length !== A.length) throw new MathError("بردار b باید یک ستون با " + A.length + " سطر باشد.");
        const aug = A.map((r, i) => r.concat([B[i][0]]));
        const res = rrefSteps(aug, true);
        const rows = res.value, n = A[0].length;
        const incons = rows.some(r => r.slice(0, n).every(x => x.isZero()) && !r[n].isZero());
        if (incons) return { answer: "\\text{دستگاه جواب ندارد}", steps: res.steps };
        if (res.rank < n) return { answer: "\\text{بی‌شمار جواب (رتبه } " + res.rank + " < " + n + ")", steps: res.steps };
        const x = rows.slice(0, n).map(r => [r[n]]);
        return { answer: "\\vec{x} = " + mtex(x), steps: res.steps, value: x };
      }
    }
    throw new MathError("عملیات ناشناخته");
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
