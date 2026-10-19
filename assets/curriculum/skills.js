/* Curriculum structure: domains, skills, prerequisites and learning goals.
   Each skill has a lesson (content/lessons/<id>.<lang>.md → lessons.js) and a practice generator (assets/learn/practice.js).
   g = goals that include the skill directly: s = school math, u = university math, d = data science. */
(function (root) {
  "use strict";
  const domains = [
    { id: "found", fa: "پایه‌های حساب", en: "Arithmetic foundations", icon: "123" },
    { id: "alg", fa: "جبر", en: "Algebra", icon: "x²" },
    { id: "geo", fa: "هندسه و مثلثات", en: "Geometry & trigonometry", icon: "△" },
    { id: "disc", fa: "ریاضیات گسسته و منطق", en: "Discrete math & logic", icon: "∑" },
    { id: "prob", fa: "احتمال", en: "Probability", icon: "🎲" },
    { id: "stats", fa: "آمار", en: "Statistics", icon: "σ" },
    { id: "la", fa: "جبر خطی", en: "Linear algebra", icon: "[ ]" },
    { id: "calc", fa: "حسابان و بهینه‌سازی", en: "Calculus & optimization", icon: "∫" },
  ];
  const S = (id, d, fa, en, pre, g, min) => ({ id, d, fa, en, pre, g, min: min || 30 });
  const skills = [
    S("f-numbers", "found", "اعداد صحیح و خط اعداد", "Integers and the number line", [], "sud", 35),
    S("f-order", "found", "ترتیب عملیات", "Order of operations", ["f-numbers"], "sud", 30),
    S("f-factors", "found", "بخش‌پذیری، عدد اول، ب.م.م و ک.م.م", "Divisibility, primes, GCD and LCM", ["f-numbers"], "sud", 40),
    S("f-fractions", "found", "کسرها", "Fractions", ["f-factors", "f-order"], "sud", 50),
    S("f-decimals", "found", "اعشار و درصد", "Decimals and percent", ["f-fractions"], "sud", 45),
    S("f-ratio", "found", "نسبت، تناسب و آهنگ", "Ratio, proportion and rates", ["f-fractions"], "sud", 40),
    S("f-exponents", "found", "توان، ریشه و نماد علمی", "Exponents, roots and scientific notation", ["f-order", "f-fractions"], "sud", 45),

    S("a-expressions", "alg", "متغیر و عبارت جبری", "Variables and expressions", ["f-order", "f-fractions"], "sud", 40),
    S("a-linear-eq", "alg", "معادلهٔ خطی", "Linear equations", ["a-expressions"], "sud", 45),
    S("a-inequalities", "alg", "نامعادلهٔ خطی", "Linear inequalities", ["a-linear-eq"], "sud", 35),
    S("a-functions", "alg", "تابع و نمودار", "Functions and graphs", ["a-linear-eq"], "sud", 40),
    S("a-lines", "alg", "شیب و معادلهٔ خط", "Slope and linear functions", ["a-functions"], "sud", 40),
    S("a-systems", "alg", "دستگاه معادلات خطی", "Systems of linear equations", ["a-lines"], "sud", 40),
    S("a-polynomials", "alg", "چندجمله‌ای و تجزیه", "Polynomials and factoring", ["a-expressions", "f-exponents"], "sud", 50),
    S("a-quadratics", "alg", "معادلهٔ درجه دو", "Quadratic equations", ["a-polynomials", "a-functions"], "sud", 50),
    S("a-rational", "alg", "عبارت‌ها و معادله‌های گویا", "Rational expressions and equations", ["a-polynomials"], "su", 40),
    S("a-radicals", "alg", "رادیکال و توان گویا", "Radicals and rational exponents", ["f-exponents", "a-linear-eq"], "su", 40),
    S("a-explog", "alg", "تابع نمایی و لگاریتم", "Exponential functions and logarithms", ["a-functions", "f-exponents"], "sud", 50),
    S("a-transform", "alg", "انتقال، ترکیب و وارون تابع", "Transformations, composition and inverses", ["a-functions"], "su", 40),

    S("g-shapes", "geo", "زاویه، مثلث و چندضلعی", "Angles, triangles and polygons", ["f-numbers"], "su", 35),
    S("g-measure", "geo", "محیط، مساحت و حجم", "Perimeter, area and volume", ["g-shapes", "f-exponents"], "su", 40),
    S("g-pythag", "geo", "قضیهٔ فیثاغورس و فاصله", "The Pythagorean theorem and distance", ["g-measure", "a-radicals"], "sud", 35),
    S("g-coord", "geo", "هندسهٔ مختصاتی", "Coordinate geometry", ["g-pythag", "a-lines"], "sud", 40),
    S("t-right", "geo", "مثلثات مثلث قائم‌الزاویه", "Right-triangle trigonometry", ["g-pythag", "f-ratio"], "sud", 40),
    S("t-unit", "geo", "رادیان، دایرهٔ مثلثاتی و نمودارها", "Radians, the unit circle and trig graphs", ["t-right", "a-functions"], "sud", 50),
    S("t-identities", "geo", "اتحادها و معادله‌های مثلثاتی", "Trig identities and equations", ["t-unit"], "su", 50),
    S("t-laws", "geo", "قانون سینوس‌ها و کسینوس‌ها", "Laws of sines and cosines", ["t-right"], "su", 35),

    S("d-sets", "disc", "مجموعه‌ها و نمودار ون", "Sets and Venn diagrams", ["f-numbers"], "sud", 35),
    S("d-logic", "disc", "منطق، جدول درستی و اثبات", "Logic, truth tables and proof", ["d-sets"], "su", 45),
    S("d-counting", "disc", "شمارش: جایگشت و ترکیب", "Counting: permutations and combinations", ["d-sets", "f-exponents"], "sud", 45),
    S("d-sequences", "disc", "دنبالهٔ حسابی و هندسی", "Arithmetic and geometric sequences", ["a-linear-eq", "f-exponents"], "sud", 40),
    S("d-series", "disc", "سیگما و سری‌ها", "Sigma notation and series", ["d-sequences"], "sud", 45),
    S("d-induction", "disc", "استقرای ریاضی", "Mathematical induction", ["d-logic", "d-series"], "u", 40),

    S("p-basics", "prob", "مبانی احتمال", "Probability basics", ["f-fractions", "d-sets"], "sud", 40),
    S("p-conditional", "prob", "احتمال شرطی و قاعدهٔ بیز", "Conditional probability and Bayes' rule", ["p-basics"], "sud", 50),
    S("p-rv", "prob", "متغیر تصادفی و امید ریاضی", "Random variables and expectation", ["p-basics", "d-series"], "ud", 45),
    S("p-binomial", "prob", "توزیع دوجمله‌ای", "The binomial distribution", ["p-rv", "d-counting"], "ud", 40),
    S("p-normal", "prob", "توزیع نرمال", "The normal distribution", ["p-rv"], "ud", 45),
    S("p-clt", "prob", "قانون اعداد بزرگ و قضیهٔ حد مرکزی", "The law of large numbers and the CLT", ["p-normal"], "ud", 45),

    S("s-describe", "stats", "آمار توصیفی", "Descriptive statistics", ["f-decimals"], "sud", 45),
    S("s-viz", "stats", "توزیع داده و نمودارها", "Distributions and data visualization", ["s-describe"], "sud", 40),
    S("s-correlation", "stats", "همبستگی و رگرسیون ساده", "Correlation and simple regression", ["s-describe", "a-lines"], "sud", 50),
    S("s-sampling", "stats", "نمونه‌گیری و بازهٔ اطمینان", "Sampling and confidence intervals", ["p-clt", "s-describe"], "ud", 50),
    S("s-hypothesis", "stats", "آزمون فرض و آزمون A/B", "Hypothesis testing and A/B tests", ["s-sampling"], "ud", 55),
    S("s-mle", "stats", "برآورد درست‌نمایی بیشینه", "Maximum likelihood estimation", ["p-binomial", "c-applications"], "ud", 50),
    S("s-bayes", "stats", "استنباط بیزی", "Bayesian inference", ["p-conditional", "p-binomial"], "ud", 50),

    S("l-vectors", "la", "بردار و عملیات برداری", "Vectors and vector operations", ["g-coord"], "ud", 40),
    S("l-dot", "la", "ضرب داخلی، نُرم و زاویه", "Dot product, norm and angle", ["l-vectors", "t-right"], "ud", 40),
    S("l-matrices", "la", "ماتریس و ضرب ماتریسی", "Matrices and matrix multiplication", ["l-vectors"], "ud", 45),
    S("l-systems", "la", "حذف گاوسی", "Gaussian elimination", ["l-matrices", "a-systems"], "ud", 45),
    S("l-inverse", "la", "دترمینان و وارون", "Determinant and inverse", ["l-systems"], "ud", 45),
    S("l-eigen", "la", "مقدار ویژه و بردار ویژه", "Eigenvalues and eigenvectors", ["l-inverse", "a-quadratics"], "ud", 55),
    S("l-projection", "la", "تصویر و کمترین مربعات", "Projections and least squares", ["l-dot", "l-inverse", "s-correlation"], "ud", 55),
    S("l-svd", "la", "تجزیهٔ مقدار منفرد و PCA", "SVD and PCA", ["l-eigen", "l-projection"], "ud", 60),

    S("c-limits", "calc", "حد و پیوستگی", "Limits and continuity", ["a-functions", "a-rational"], "ud", 50),
    S("c-derivative", "calc", "مشتق و قواعد آن", "The derivative and its rules", ["c-limits"], "ud", 50),
    S("c-chain", "calc", "قاعدهٔ زنجیره‌ای و مشتق توابع متعالی", "Chain rule and transcendental functions", ["c-derivative", "a-explog", "t-unit"], "ud", 50),
    S("c-applications", "calc", "بهینه‌سازی و رسم منحنی", "Optimization and curve sketching", ["c-chain"], "ud", 55),
    S("c-integral", "calc", "انتگرال و قضیهٔ اساسی", "Integrals and the fundamental theorem", ["c-derivative"], "ud", 55),
    S("c-techniques", "calc", "روش‌های انتگرال‌گیری", "Integration techniques", ["c-integral", "c-chain"], "u", 55),
    S("c-taylor", "calc", "سری تیلور", "Taylor series", ["c-chain", "d-series"], "ud", 50),
    S("m-partial", "calc", "مشتق جزئی و گرادیان", "Partial derivatives and the gradient", ["c-chain", "l-vectors"], "ud", 50),
    S("m-gd", "calc", "گرادیان کاهشی", "Gradient descent", ["m-partial"], "ud", 45),
    S("m-convex", "calc", "بهینه‌سازی محدب و ضرایب لاگرانژ", "Convex optimization and Lagrange multipliers", ["m-gd", "c-applications"], "ud", 55),
  ];
  const goals = {
    d: { fa: "علم داده و یادگیری ماشین", en: "Data science & machine learning", desc: { fa: "ریاضیِ لازم برای تحلیل داده، آمار و یادگیری ماشین", en: "The math you need for data analysis, statistics and machine learning" } },
    s: { fa: "ریاضی مدرسه", en: "School math", desc: { fa: "حساب، جبر، هندسه، مثلثات و مبانی احتمال و آمار", en: "Arithmetic, algebra, geometry, trigonometry and basic probability & statistics" } },
    u: { fa: "ریاضی دانشگاهی", en: "University math", desc: { fa: "همهٔ مباحث، از پایه تا حسابان چندمتغیره و جبر خطی", en: "Everything, from the basics to multivariable calculus and linear algebra" } },
  };
  const byId = {};
  skills.forEach(s => { byId[s.id] = s; });
  /* prerequisite closure */
  function closure(ids) {
    const out = new Set();
    (function add(list) { list.forEach(id => { if (!out.has(id) && byId[id]) { out.add(id); add(byId[id].pre); } }); })(ids);
    return out;
  }
  /* topological order: prerequisites first, ties broken by domain order then catalogue order */
  const order = (() => {
    const dIdx = {}; domains.forEach((d, i) => { dIdx[d.id] = i; });
    const cIdx = {}; skills.forEach((s, i) => { cIdx[s.id] = i; });
    const indeg = {}, out = [];
    skills.forEach(s => { indeg[s.id] = s.pre.length; });
    const ready = skills.filter(s => !s.pre.length).map(s => s.id);
    const rank = id => dIdx[byId[id].d] * 1000 + cIdx[id];
    while (ready.length) {
      ready.sort((a, b) => rank(a) - rank(b));
      const id = ready.shift(); out.push(id);
      skills.forEach(s => { if (s.pre.includes(id) && --indeg[s.id] === 0) ready.push(s.id); });
    }
    return out;
  })();
  function goalSkills(goal) {
    const direct = skills.filter(s => s.g.includes(goal)).map(s => s.id);
    const set = closure(direct);
    return order.filter(id => set.has(id));
  }
  root.CURRICULUM = { domains, skills, goals, byId, closure, order, goalSkills };
})(typeof globalThis !== "undefined" ? globalThis : this);
