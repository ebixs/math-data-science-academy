/* Python notebook (Pyodide): code and markdown cells, stdout/stderr, last-expression results, pandas tables,
   matplotlib figures, autosave, .py/.ipynb export, and guided projects with real datasets and automatic checks.
   Uses a local copy of Pyodide when bundled (desktop app), otherwise the official CDN (internet needed once). */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const I = window.I18N, tr = I.T, num = n => I.num(n);
  const L2 = v => (Array.isArray(v) ? (I.lang === "en" ? v[1] : v[0]) : v);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const VERSION = "0.27.8";
  const SOURCES = ["assets/vendor/pyodide/", "https://cdn.jsdelivr.net/pyodide/v" + VERSION + "/full/"];
  const KEY = "mdsa.python.notebook.v1", PKEY = "mdsa.python.project.";
  const PROJECTS = window.PROJECTS || [];
  const DATA = [...new Set(PROJECTS.flatMap(p => p.data || []))];

  const SAMPLES = {
    basics: { title: ["مبانی پایتون", "Python basics"], cells: [
      ["# متغیر، لیست و حلقه\nnames = ['سارا', 'علی', 'مریم']\nscores = [17, 19.5, 15]\nfor n, s in zip(names, scores):\n    print(f'{n}: {s}')",
       "# Variables, lists and loops\nnames = ['Sara', 'Ali', 'Maryam']\nscores = [17, 19.5, 15]\nfor n, s in zip(names, scores):\n    print(f'{n}: {s}')"],
      ["# تابع و شرط\ndef grade(s):\n    if s >= 18: return 'عالی'\n    elif s >= 15: return 'خوب'\n    return 'نیاز به تمرین'\n\n[grade(s) for s in scores]",
       "# Functions and conditions\ndef grade(s):\n    if s >= 18: return 'excellent'\n    elif s >= 15: return 'good'\n    return 'needs practice'\n\n[grade(s) for s in scores]"],
      ["# دیکشنری\navg = sum(scores) / len(scores)\n{'میانگین': round(avg, 2), 'بیشینه': max(scores), 'کمینه': min(scores)}",
       "# Dictionaries\navg = sum(scores) / len(scores)\n{'mean': round(avg, 2), 'max': max(scores), 'min': min(scores)}"],
    ] },
    stats: { title: ["آمار توصیفی از صفر", "Descriptive statistics from scratch"], cells: [
      ["data = [12, 15, 11, 18, 20, 14, 13, 30]\nn = len(data)\nmean = sum(data) / n\nsorted_d = sorted(data)\nmedian = (sorted_d[n//2 - 1] + sorted_d[n//2]) / 2 if n % 2 == 0 else sorted_d[n//2]\nvar = sum((x - mean) ** 2 for x in data) / (n - 1)\nstd = var ** 0.5\nprint('میانگین:', mean, '| میانه:', median, '| انحراف معیار نمونه:', round(std, 3))",
       "data = [12, 15, 11, 18, 20, 14, 13, 30]\nn = len(data)\nmean = sum(data) / n\nsorted_d = sorted(data)\nmedian = (sorted_d[n//2 - 1] + sorted_d[n//2]) / 2 if n % 2 == 0 else sorted_d[n//2]\nvar = sum((x - mean) ** 2 for x in data) / (n - 1)\nstd = var ** 0.5\nprint('mean:', mean, '| median:', median, '| sample std:', round(std, 3))"],
      ["# مقایسه با ماژول statistics\nimport statistics as st\nst.mean(data), st.median(data), round(st.stdev(data), 3)", "# Compare with the statistics module\nimport statistics as st\nst.mean(data), st.median(data), round(st.stdev(data), 3)"],
    ] },
    numpy: { title: ["NumPy و جبر خطی", "NumPy and linear algebra"], cells: [
      "import numpy as np\nA = np.array([[2, 1], [1, 3]])\nb = np.array([3, 5])\nx = np.linalg.solve(A, b)\nprint('x =', x)\nprint('det(A) =', round(np.linalg.det(A), 6))",
      "vals, vecs = np.linalg.eig(np.array([[4, 1], [2, 3]]))\nvals",
      ["# بردارسازی: میانگین و انحراف معیار ستون‌ها\nM = np.random.default_rng(0).normal(50, 10, size=(1000, 3))\nM.mean(axis=0).round(2), M.std(axis=0).round(2)", "# Vectorization: column means and standard deviations\nM = np.random.default_rng(0).normal(50, 10, size=(1000, 3))\nM.mean(axis=0).round(2), M.std(axis=0).round(2)"],
    ] },
    pandas: { title: ["تحلیل داده با pandas", "Data analysis with pandas"], cells: [
      "import pandas as pd, io\ncsv = '''city,month,sales\nTehran,1,120\nTehran,2,135\nTabriz,1,80\nTabriz,2,95\nShiraz,1,70\nShiraz,2,88'''\ndf = pd.read_csv(io.StringIO(csv))\ndf.head()",
      "df.groupby('city')['sales'].agg(['mean', 'sum']).sort_values('sum', ascending=False)",
      ["# رشد ماه دوم نسبت به ماه اول\npivot = df.pivot(index='city', columns='month', values='sales')\npivot['growth_%'] = ((pivot[2] - pivot[1]) / pivot[1] * 100).round(1)\npivot", "# Growth of month 2 over month 1\npivot = df.pivot(index='city', columns='month', values='sales')\npivot['growth_%'] = ((pivot[2] - pivot[1]) / pivot[1] * 100).round(1)\npivot"],
    ] },
    plot: { title: ["نمودار با matplotlib", "Plotting with matplotlib"], cells: [
      "import numpy as np\nimport matplotlib.pyplot as plt\nx = np.linspace(-3, 3, 200)\nplt.figure(figsize=(6, 3.5))\nplt.plot(x, x**2 - 1, label='x^2 - 1')\nplt.plot(x, np.sin(2*x), label='sin(2x)')\nplt.axhline(0, color='gray', lw=.8)\nplt.legend(); plt.grid(alpha=.3)\nplt.title('Functions')\nplt.show()",
      "rng = np.random.default_rng(1)\nsample = rng.normal(70, 8, 500)\nplt.figure(figsize=(6, 3.5))\nplt.hist(sample, bins=25, color='#22d3ee', edgecolor='#0a1524')\nplt.title('Histogram of a normal sample')\nplt.show()",
    ] },
    sim: { title: ["شبیه‌سازی احتمال (مونت‌کارلو)", "Probability simulation (Monte Carlo)"], cells: [
      ["import random\nrandom.seed(42)\ntrials = 100_000\nhits = sum(1 for _ in range(trials) if random.randint(1, 6) + random.randint(1, 6) == 7)\nprint('تخمین P(مجموع = 7):', hits / trials, '| مقدار دقیق:', 1/6)", "import random\nrandom.seed(42)\ntrials = 100_000\nhits = sum(1 for _ in range(trials) if random.randint(1, 6) + random.randint(1, 6) == 7)\nprint('estimate of P(sum = 7):', hits / trials, '| exact:', 1/6)"],
      ["# تخمین عدد پی با نقاط تصادفی\ninside = sum(1 for _ in range(200_000) if random.random()**2 + random.random()**2 <= 1)\n4 * inside / 200_000", "# Estimate pi with random points\ninside = sum(1 for _ in range(200_000) if random.random()**2 + random.random()**2 <= 1)\n4 * inside / 200_000"],
    ] },
  };

  /* ---------------- state ---------------- */
  let view = "free", project = null;           /* view: free | list | project */
  let cells = [];
  let py = null, loading = null, runCount = 0;
  const codeCell = src => ({ kind: "code", src, out: null });

  function loadFree() {
    try { const v = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(v) && v.length) return v.map(c => codeCell(String(c.src || ""))); } catch (e) { }
    return SAMPLES.basics.cells.map(s => codeCell(L2(s)));
  }
  function loadProject(p) {
    let saved = null; try { saved = JSON.parse(localStorage.getItem(PKEY + p.id)); } catch (e) { }
    return p.cells.map((c, i) => {
      if (c.md) return { kind: "md", md: L2(c.md) };
      const src = saved && typeof saved[i] === "string" ? saved[i] : c.code;
      return c.task ? { kind: "task", src, out: null, task: L2(c.task), sol: c.sol, check: c.check, n: 0 } : codeCell(src);
    });
  }
  function persist() {
    try {
      if (view === "free") localStorage.setItem(KEY, JSON.stringify(cells.map(c => ({ src: c.src }))));
      else if (project) { const o = {}; cells.forEach((c, i) => { if (c.kind !== "md") o[i] = c.src; }); localStorage.setItem(PKEY + project.id, JSON.stringify(o)); }
    } catch (e) { }
  }
  const setStatus = (t, kind) => { const s = $("pyStatus"); s.textContent = t; s.dataset.kind = kind || ""; };

  /* shared progress (same storage as the main app) */
  function progress(fn) {
    try {
      const S = JSON.parse(localStorage.getItem("academyProgress")) || {};
      if (!S.activity || typeof S.activity !== "object" || Array.isArray(S.activity)) S.activity = {};
      if (!S.projects || typeof S.projects !== "object" || Array.isArray(S.projects)) S.projects = {};
      const r = fn(S);
      if (r === false) return S;
      S.updatedAt = Date.now();
      localStorage.setItem("academyProgress", JSON.stringify(S));
      if (location.protocol !== "file:") fetch("api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(S) }).catch(() => { });
      return S;
    } catch (e) { return {}; }
  }
  const dayKey = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const projState = id => (progress(() => false).projects || {})[id] || {};

  /* ---------------- Pyodide ---------------- */
  async function exists(url) { try { const r = await fetch(url, { method: "HEAD" }); return r.ok; } catch (e) { return false; } }
  function addScript(src) { return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("load failed")); document.head.appendChild(s); }); }
  async function ensurePy() {
    if (py) return py;
    if (loading) return loading;
    loading = (async () => {
      setStatus(tr("در حال بارگذاری پایتون (Pyodide)… بار اول ممکن است چند ثانیه طول بکشد.", "Loading Python (Pyodide)… the first time can take a few seconds."), "busy");
      let lastErr = null;
      for (const base of SOURCES) {
        try {
          if (base.startsWith("assets") && !(await exists(base + "pyodide.js"))) continue;
          if (!window.loadPyodide) await addScript(base + "pyodide.js");
          py = await window.loadPyodide({ indexURL: base });
          py.globals.set("_LANG", I.lang);
          await py.runPythonAsync(BOOT);
          await loadData();
          setStatus(tr("پایتون ", "Python ") + py.runPython("import sys; sys.version.split()[0]") + tr(" آماده است", " is ready") + (base.startsWith("assets") ? tr(" (نسخهٔ محلی، بدون اینترنت)", " (local copy, works offline)") : "") + ".", "ok");
          return py;
        } catch (e) { lastErr = e; py = null; window.loadPyodide = undefined; }
      }
      loading = null;
      setStatus(tr("بارگذاری پایتون ممکن نشد. برای اولین اجرا به اینترنت نیاز است (یا از نسخهٔ نصبی دسکتاپ استفاده کن).", "Python could not be loaded. The first run needs internet access (or use the desktop app)."), "err");
      throw lastErr || new Error("pyodide");
    })();
    return loading;
  }
  async function loadData() {
    const home = py.runPython("import os; os.getcwd()");
    try { py.FS.mkdirTree(home + "/data"); } catch (e) { }
    await Promise.all(DATA.map(async f => {
      try { const r = await fetch("assets/data/" + f); if (r.ok) py.FS.writeFile(home + "/data/" + f, await r.text()); } catch (e) { }
    }));
  }
  const BOOT = `
import sys, io, ast, base64, os, traceback
os.environ['MPLBACKEND'] = 'AGG'
import warnings
warnings.filterwarnings('ignore', message='.*non-interactive.*')
_G = {'__name__': '__main__'}
def _T(fa, en):
    return en if _LANG == 'en' else fa
def _run_cell(code):
    out = io.StringIO()
    old = sys.stdout, sys.stderr
    sys.stdout = sys.stderr = out
    result = None; err = None; figs = []; html = None
    try:
        tree = ast.parse(code, '<cell>', 'exec')
        last = None
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            last = ast.Expression(tree.body.pop().value)
        exec(compile(tree, '<cell>', 'exec'), _G)
        if last is not None:
            result = eval(compile(last, '<cell>', 'eval'), _G)
    except BaseException:
        etype, value, tb = sys.exc_info()
        lines = traceback.format_exception(etype, value, tb)
        lines = [l for l in lines if '_run_cell' not in l and 'File "<exec>"' not in l]
        err = ''.join(lines)
    finally:
        sys.stdout, sys.stderr = old
    if 'matplotlib.pyplot' in sys.modules:
        plt = sys.modules['matplotlib.pyplot']
        for n in plt.get_fignums():
            buf = io.BytesIO()
            plt.figure(n).savefig(buf, format='png', dpi=110, bbox_inches='tight')
            figs.append(base64.b64encode(buf.getvalue()).decode())
        plt.close('all')
    text = None
    if result is not None:
        if hasattr(result, '_repr_html_'):
            try: html = result._repr_html_()
            except Exception: html = None
        try: text = repr(result)
        except Exception: text = '<unprintable>'
    return [out.getvalue(), text, html, figs, err]
def _check(code):
    ns = dict(_G); ns['T'] = _T
    old = sys.stdout; sys.stdout = io.StringIO()
    try:
        exec(compile(code, '<check>', 'exec'), ns)
        return ''
    except AssertionError as e:
        return str(e) or _T('هنوز درست نیست.', 'Not right yet.')
    except Exception as e:
        return _T('کدت هنوز کامل نیست', 'Your code is not complete yet') + ' (' + type(e).__name__ + ': ' + str(e)[:160] + ')'
    finally:
        sys.stdout = old
`;
  async function runCell(i) {
    const c = cells[i]; if (!c || c.kind === "md" || !c.src.trim()) return;
    const box = document.querySelector(`[data-cell="${i}"] .cout`);
    box.innerHTML = `<span class="muted">${tr("در حال اجرا…", "Running…")}</span>`;
    try { await ensurePy(); } catch (e) { box.innerHTML = `<pre class="err">${tr("پایتون بارگذاری نشد.", "Python did not load.")}</pre>`; return; }
    try {
      setStatus(tr("در حال نصب بسته‌های لازم…", "Installing the packages it needs…"), "busy");
      await py.loadPackagesFromImports(c.src);
      setStatus(tr("در حال اجرا…", "Running…"), "busy");
      const res = py.globals.get("_run_cell")(c.src);
      const [stdout, text, html, figs, err] = res.toJs(); res.destroy();
      c.out = { stdout, text, html, figs: Array.from(figs || []), err };
      if (c.kind === "task") {
        c.n++;
        c.verdict = err ? tr("اول خطای کد را برطرف کن.", "Fix the error in your code first.") : py.globals.get("_check")(c.check);
        c.passed = !c.verdict;
        if (c.passed) recordTask(i);
      }
      setStatus(tr("آماده.", "Ready."), "ok");
    } catch (e) { c.out = { err: String(e && e.message || e) }; setStatus(tr("خطا در اجرا.", "Error while running."), "err"); }
    renderOut(i); bump();
  }
  function recordTask(i) {
    if (!project) return;
    const total = cells.filter(c => c.kind === "task").length;
    let finished = false;
    progress(S => {
      const st = S.projects[project.id] = S.projects[project.id] || {};
      st.t = Array.isArray(st.t) ? st.t : [];
      if (!st.t.includes(i)) st.t.push(i);
      if (!st.done && st.t.length >= total) { st.done = true; st.at = Date.now(); finished = true; }
      S.activity[dayKey()] = (S.activity[dayKey()] || 0) + 1;
    });
    renderProjHead();
    if (finished) toast("🎉 " + tr("پروژه کامل شد! ۱۵۰ XP گرفتی.", "Project complete! You earned 150 XP."));
  }
  function toast(html) {
    let t = $("nbToast"); if (!t) { t = document.createElement("div"); t.id = "nbToast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.innerHTML = html; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 3200);
  }
  function renderOut(i) {
    const c = cells[i], box = document.querySelector(`[data-cell="${i}"] .cout`); if (!box) return;
    let h = "";
    if (c.out) {
      if (c.out.stdout) h += `<pre>${esc(c.out.stdout)}</pre>`;
      if (c.out.html) h += `<div class="df">${sanitize(c.out.html)}</div>`;
      else if (c.out.text !== null && c.out.text !== undefined) h += `<pre class="res">${esc(c.out.text)}</pre>`;
      (c.out.figs || []).forEach(f => { h += `<img alt="${tr("نمودار", "Chart")}" src="data:image/png;base64,${f}">`; });
      if (c.out.err) h += `<pre class="err">${esc(c.out.err)}</pre>`;
      if (!h) h = `<span class="muted">${tr("(بدون خروجی)", "(no output)")}</span>`;
    }
    if (c.kind === "task" && c.n) h += `<div class="verdict ${c.passed ? "good" : "bad"}">${c.passed ? "✓ " + tr("آفرین! این مرحله درست است.", "Well done — this step is correct.") : "✗ " + esc(c.verdict)}</div>`;
    box.innerHTML = h;
    const cellEl = document.querySelector(`[data-cell="${i}"]`); if (cellEl) cellEl.classList.toggle("passed", !!c.passed);
  }
  function sanitize(html) { /* pandas HTML: keep table markup only */
    const t = document.createElement("template"); t.innerHTML = html;
    t.content.querySelectorAll("script,style,iframe,object,embed,link,meta").forEach(n => n.remove());
    t.content.querySelectorAll("*").forEach(n => [...n.attributes].forEach(a => { if (!["class", "colspan", "rowspan", "border"].includes(a.name)) n.removeAttribute(a.name); }));
    return t.innerHTML;
  }
  function bump() {
    runCount++;
    progress(S => { S.pyRuns = (+S.pyRuns || 0) + 1; if (runCount <= 5) S.activity[dayKey()] = (S.activity[dayKey()] || 0) + 1; });
  }

  /* ---------------- rendering ---------------- */
  function renderCells() {
    let taskNo = 0;
    $("cells").innerHTML = cells.map((c, i) => {
      if (c.kind === "md") return `<div class="cell md-cell card" data-cell="${i}">${window.MD ? MD.render(c.md) : esc(c.md)}</div>`;
      const isTask = c.kind === "task";
      if (isTask) taskNo++;
      const head = isTask ? `<div class="task-h"><span class="task-tag">${tr("تمرین ", "Task ")}${num(taskNo)}</span><div class="task-q">${window.MD ? MD.render(c.task) : esc(c.task)}</div></div>` : "";
      const tools = project ? "" : `<button class="btn alt" data-up="${i}" aria-label="${tr("بالا", "Move up")}">↑</button><button class="btn alt" data-down="${i}" aria-label="${tr("پایین", "Move down")}">↓</button><button class="btn alt" data-del="${i}" aria-label="${tr("حذف", "Delete")}">✕</button>`;
      const solBtn = isTask ? `<button class="btn alt" data-sol="${i}">${tr("راه‌حل", "Solution")}</button>` : "";
      return `<div class="cell card${isTask ? " task" : ""}${c.passed ? " passed" : ""}" data-cell="${i}">${head}<div class="cbar"><span class="cnum">[${i + 1}]</span><div class="cact"><button class="btn" data-run="${i}" title="Ctrl+Enter">▶ ${tr("اجرا", "Run")}</button>${solBtn}${tools}</div></div><textarea class="code" spellcheck="false" rows="${Math.max(3, c.src.split("\n").length)}" aria-label="${tr("کد سلول ", "Code of cell ")}${i + 1}">${esc(c.src)}</textarea><div class="sol" hidden></div><div class="cout"></div></div>`;
    }).join("");
    document.querySelectorAll("[data-cell]").forEach(cellEl => {
      const i = +cellEl.dataset.cell, ta = cellEl.querySelector("textarea");
      if (window.MD && cells[i].kind !== "code") MD.mount(cellEl);
      if (!ta) return;
      ta.addEventListener("input", () => { cells[i].src = ta.value; ta.rows = Math.max(3, ta.value.split("\n").length); persist(); });
      ta.addEventListener("keydown", e => {
        if (e.key === "Tab") { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText("    ", s, ta.selectionEnd, "end"); ta.dispatchEvent(new Event("input")); }
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); runCell(i); }
        if (e.key === "Enter" && e.shiftKey) { e.preventDefault(); runCell(i).then(() => { const nx = [...document.querySelectorAll("[data-cell] textarea")].find(t => +t.closest("[data-cell]").dataset.cell > i); if (nx) nx.focus(); else if (!project) addCell(); }); }
      });
      renderOut(i);
    });
    document.querySelectorAll("[data-run]").forEach(b => b.onclick = () => runCell(+b.dataset.run));
    document.querySelectorAll("[data-sol]").forEach(b => b.onclick = () => {
      const i = +b.dataset.sol, box = document.querySelector(`[data-cell="${i}"] .sol`);
      box.hidden = !box.hidden;
      box.innerHTML = `<p class="muted">${tr("اول خودت تلاش کن؛ دیدن راه‌حل اشکالی ندارد، اما بعدش بدون نگاه دوباره بنویسش.", "Try first. Peeking is fine — but then rewrite it without looking.")}</p><pre>${esc(cells[i].sol)}</pre><button class="btn alt" data-use="${i}">${tr("جایگزینی کد با راه‌حل", "Replace my code with this")}</button>`;
      box.querySelector("[data-use]").onclick = () => { cells[i].src = cells[i].sol; persist(); renderCells(); };
    });
    document.querySelectorAll("[data-del]").forEach(b => b.onclick = () => { cells.splice(+b.dataset.del, 1); if (!cells.length) cells.push(codeCell("")); persist(); renderCells(); });
    document.querySelectorAll("[data-up]").forEach(b => b.onclick = () => { const i = +b.dataset.up; if (i > 0) { [cells[i - 1], cells[i]] = [cells[i], cells[i - 1]]; persist(); renderCells(); } });
    document.querySelectorAll("[data-down]").forEach(b => b.onclick = () => { const i = +b.dataset.down; if (i < cells.length - 1) { [cells[i + 1], cells[i]] = [cells[i], cells[i + 1]]; persist(); renderCells(); } });
  }
  function addCell(src = "") { cells.push(codeCell(src)); persist(); renderCells(); const t = document.querySelectorAll("textarea.code"); t[t.length - 1].focus(); }
  function download(name, text, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }

  function renderProjList() {
    $("projList").innerHTML = PROJECTS.map(p => {
      const st = projState(p.id), total = p.cells.filter(c => c.task).length, done = (st.t || []).length;
      return `<a class="card proj-card${st.done ? " done" : ""}" href="#project/${p.id}"><span class="proj-ic">${esc(p.icon)}</span><h3>${esc(L2(p.title))}</h3><p class="muted">${esc(L2(p.desc))}</p>
        <div class="bar"><i style="width:${(100 * Math.min(done, total) / total).toFixed(0)}%"></i></div><small class="muted">${st.done ? "✓ " + tr("کامل شد", "Completed") : num(Math.min(done, total)) + " / " + num(total) + tr(" تمرین", " tasks")}${p.data.length ? " · " + p.data.map(esc).join(", ") : ""}</small></a>`;
    }).join("");
  }
  function renderProjHead() {
    if (!project) return;
    const st = projState(project.id), total = cells.filter(c => c.kind === "task").length, done = Math.min((st.t || []).length, total);
    $("projHead").innerHTML = `<div class="proj-top"><a class="btn alt" href="#projects"><span class="arrow back">→</span> ${tr("همهٔ پروژه‌ها", "All projects")}</a><span class="muted"><bdi dir="ltr">${num(done)} / ${num(total)}</bdi> ${tr("تمرین درست", "tasks passed")}${st.done ? " · ✓ " + tr("کامل", "complete") : ""}</span></div>
      <h2>${esc(project.icon)} ${esc(L2(project.title))}</h2><p>${esc(L2(project.desc))}</p><div class="bar"><i style="width:${(100 * done / total).toFixed(0)}%"></i></div>
      <p class="muted">${project.data.length ? tr("داده‌ها: ", "Data: ") + project.data.map(f => `<a href="assets/data/${f}" download>${esc(f)}</a>`).join(" · ") + " · " : ""}${tr("سلول‌ها را به ترتیب اجرا کن؛ هر «تمرین» بعد از اجرا خودکار بررسی می‌شود.", "Run the cells in order; each task is checked automatically when you run it.")}</p>
      <div class="row-btns"><button class="btn alt" id="projReset">${tr("شروع دوباره", "Start over")}</button></div>`;
    $("projReset").onclick = () => { try { localStorage.removeItem(PKEY + project.id); } catch (e) { } cells = loadProject(project); renderCells(); };
  }
  function show() {
    const h = decodeURIComponent(location.hash.slice(1));
    const pid = h.startsWith("project/") ? h.slice(8) : null, p = PROJECTS.find(x => x.id === pid);
    view = p ? "project" : h === "projects" ? "list" : "free";
    project = p || null;
    document.querySelectorAll(".nb-tab").forEach(t => { const on = t.dataset.view === (view === "free" ? "free" : "projects"); t.classList.toggle("active", on); t.setAttribute("aria-selected", on); });
    $("freeTools").hidden = view !== "free"; $("samplesRow").hidden = view !== "free";
    $("projList").hidden = view !== "list"; $("projHead").hidden = view !== "project"; $("cells").hidden = view === "list"; $("dlRow").hidden = view === "list";
    if (view === "list") { renderProjList(); return; }
    cells = view === "project" ? loadProject(project) : loadFree();
    if (view === "project") renderProjHead();
    renderCells();
    window.scrollTo(0, 0);
  }

  /* ---------------- wiring ---------------- */
  $("samples").innerHTML = Object.entries(SAMPLES).map(([k, s]) => `<button class="chip-btn" data-sample="${k}">${esc(L2(s.title))}</button>`).join("");
  document.querySelectorAll("[data-sample]").forEach(b => b.onclick = () => {
    const s = SAMPLES[b.dataset.sample];
    if (cells.some(c => c.src && c.src.trim()) && !b.dataset.armed) { b.dataset.armed = "1"; b.textContent = tr("جایگزینی سلول‌ها؟ دوباره بزن", "Replace cells? Click again"); setTimeout(() => { delete b.dataset.armed; b.textContent = L2(s.title); }, 4000); return; }
    delete b.dataset.armed; b.textContent = L2(s.title);
    cells = s.cells.map(src => codeCell(L2(src))); persist(); renderCells();
  });
  document.querySelectorAll(".nb-tab").forEach(t => t.onclick = () => { location.hash = t.dataset.view === "free" ? "" : "projects"; if (t.dataset.view === "free") show(); });
  $("addCell").onclick = () => addCell();
  $("runAll").onclick = async () => { for (let i = 0; i < cells.length; i++) await runCell(i); };
  $("clearOut").onclick = () => { cells.forEach(c => { c.out = null; c.n = 0; c.passed = false; }); renderCells(); };
  $("restart").onclick = async () => { if (!py) return; py.runPython("_G.clear(); _G['__name__'] = '__main__'"); cells.forEach(c => { c.out = null; }); renderCells(); setStatus(tr("حافظهٔ پایتون پاک شد.", "Python memory cleared."), "ok"); };
  const baseName = () => (project ? project.id : "notebook");
  $("dlPy").onclick = () => download(baseName() + ".py", cells.map((c, i) => c.kind === "md" ? c.md.split("\n").map(l => "# " + l).join("\n") : "# %% [" + (i + 1) + "]\n" + c.src).join("\n\n") + "\n", "text/x-python");
  $("dlIpynb").onclick = () => download(baseName() + ".ipynb", JSON.stringify({ nbformat: 4, nbformat_minor: 5, metadata: { kernelspec: { name: "python3", display_name: "Python 3", language: "python" }, language_info: { name: "python" } },
    cells: cells.map(c => c.kind === "md" ? { cell_type: "markdown", metadata: {}, source: c.md.split(/(?<=\n)/) } : { cell_type: "code", metadata: {}, execution_count: null, outputs: [], source: (c.kind === "task" ? "# " + c.task.replace(/\n/g, " ") + "\n" : "") .split(/(?<=\n)/).concat(c.src.split(/(?<=\n)/)).filter(Boolean) }) }, null, 1), "application/json");
  $("warm").onclick = () => ensurePy().catch(() => { });
  $("projCount").textContent = num(PROJECTS.length);
  window.addEventListener("hashchange", show);
  show();
})();
