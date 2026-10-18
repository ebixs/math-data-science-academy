/* Python notebook (Pyodide): code cells, stdout/stderr, last-expression results, pandas tables,
   matplotlib figures, autosave, .py/.ipynb export. Uses a local copy of Pyodide when bundled
   (desktop app), otherwise the official CDN (internet needed the first time). */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const VERSION = "0.27.8";
  const SOURCES = ["assets/vendor/pyodide/", "https://cdn.jsdelivr.net/pyodide/v" + VERSION + "/full/"];
  const KEY = "mdsa.python.notebook.v1";

  const SAMPLES = {
    basics: { title: "مبانی پایتون", cells: [
      "# متغیر، لیست و حلقه\nnames = ['سارا', 'علی', 'مریم']\nscores = [17, 19.5, 15]\nfor n, s in zip(names, scores):\n    print(f'{n}: {s}')",
      "# تابع و شرط\ndef grade(s):\n    if s >= 18: return 'عالی'\n    elif s >= 15: return 'خوب'\n    return 'نیاز به تمرین'\n\n[grade(s) for s in scores]",
      "# دیکشنری\navg = sum(scores) / len(scores)\n{'میانگین': round(avg, 2), 'بیشینه': max(scores), 'کمینه': min(scores)}",
    ] },
    stats: { title: "آمار توصیفی از صفر", cells: [
      "data = [12, 15, 11, 18, 20, 14, 13, 30]\nn = len(data)\nmean = sum(data) / n\nsorted_d = sorted(data)\nmedian = (sorted_d[n//2 - 1] + sorted_d[n//2]) / 2 if n % 2 == 0 else sorted_d[n//2]\nvar = sum((x - mean) ** 2 for x in data) / (n - 1)\nstd = var ** 0.5\nprint('میانگین:', mean, '| میانه:', median, '| انحراف معیار نمونه:', round(std, 3))",
      "# مقایسه با ماژول statistics\nimport statistics as st\nst.mean(data), st.median(data), round(st.stdev(data), 3)",
    ] },
    numpy: { title: "NumPy و جبر خطی", cells: [
      "import numpy as np\nA = np.array([[2, 1], [1, 3]])\nb = np.array([3, 5])\nx = np.linalg.solve(A, b)\nprint('x =', x)\nprint('det(A) =', round(np.linalg.det(A), 6))",
      "vals, vecs = np.linalg.eig(np.array([[4, 1], [2, 3]]))\nvals",
      "# بردارسازی: میانگین و انحراف معیار ستون‌ها\nM = np.random.default_rng(0).normal(50, 10, size=(1000, 3))\nM.mean(axis=0).round(2), M.std(axis=0).round(2)",
    ] },
    pandas: { title: "تحلیل داده با pandas", cells: [
      "import pandas as pd, io\ncsv = '''city,month,sales\nTehran,1,120\nTehran,2,135\nTabriz,1,80\nTabriz,2,95\nShiraz,1,70\nShiraz,2,88'''\ndf = pd.read_csv(io.StringIO(csv))\ndf.head()",
      "df.groupby('city')['sales'].agg(['mean', 'sum']).sort_values('sum', ascending=False)",
      "# رشد ماه دوم نسبت به ماه اول\npivot = df.pivot(index='city', columns='month', values='sales')\npivot['growth_%'] = ((pivot[2] - pivot[1]) / pivot[1] * 100).round(1)\npivot",
    ] },
    plot: { title: "نمودار با matplotlib", cells: [
      "import numpy as np\nimport matplotlib.pyplot as plt\nx = np.linspace(-3, 3, 200)\nplt.figure(figsize=(6, 3.5))\nplt.plot(x, x**2 - 1, label='x^2 - 1')\nplt.plot(x, np.sin(2*x), label='sin(2x)')\nplt.axhline(0, color='gray', lw=.8)\nplt.legend(); plt.grid(alpha=.3)\nplt.title('Functions')\nplt.show()",
      "rng = np.random.default_rng(1)\nsample = rng.normal(70, 8, 500)\nplt.figure(figsize=(6, 3.5))\nplt.hist(sample, bins=25, color='#22d3ee', edgecolor='#0a1524')\nplt.title('Histogram of a normal sample')\nplt.show()",
    ] },
    regression: { title: "رگرسیون خطی با NumPy", cells: [
      "import numpy as np\nx = np.array([1, 2, 3, 4, 5, 6])\ny = np.array([2.1, 3.9, 6.2, 7.8, 10.1, 12.2])\nb, a = np.polyfit(x, y, 1)\nr = np.corrcoef(x, y)[0, 1]\nprint(f'y ≈ {b:.3f}x + {a:.3f}   (r = {r:.4f})')",
      "# پیش‌بینی و خطا\npred = a + b * x\nrmse = np.sqrt(np.mean((y - pred) ** 2))\nround(rmse, 4)",
    ] },
    sim: { title: "شبیه‌سازی احتمال (مونت‌کارلو)", cells: [
      "import random\nrandom.seed(42)\ntrials = 100_000\nhits = sum(1 for _ in range(trials) if random.randint(1, 6) + random.randint(1, 6) == 7)\nprint('تخمین P(مجموع = 7):', hits / trials, '| مقدار دقیق:', 1/6)",
      "# تخمین عدد پی با نقاط تصادفی\ninside = sum(1 for _ in range(200_000) if random.random()**2 + random.random()**2 <= 1)\n4 * inside / 200_000",
    ] },
  };

  let cells = load() || SAMPLES.basics.cells.map(src => ({ src, out: null }));
  let py = null, loading = null, runCount = 0;

  function load() { try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) && v.length ? v.map(c => ({ src: String(c.src || ""), out: null })) : null; } catch (e) { return null; } }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(cells.map(c => ({ src: c.src })))); } catch (e) { } }
  const setStatus = (t, kind) => { const s = $("pyStatus"); s.textContent = t; s.dataset.kind = kind || ""; };

  async function exists(url) { try { const r = await fetch(url, { method: "HEAD" }); return r.ok; } catch (e) { return false; } }
  function addScript(src) { return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("load failed")); document.head.appendChild(s); }); }
  async function ensurePy() {
    if (py) return py;
    if (loading) return loading;
    loading = (async () => {
      setStatus("در حال بارگذاری پایتون (Pyodide)… بار اول ممکن است چند ثانیه طول بکشد.", "busy");
      let lastErr = null;
      for (const base of SOURCES) {
        try {
          if (base.startsWith("assets") && !(await exists(base + "pyodide.js"))) continue;
          if (!window.loadPyodide) await addScript(base + "pyodide.js");
          py = await window.loadPyodide({ indexURL: base });
          await py.runPythonAsync(BOOT);
          setStatus("پایتون " + py.runPython("import sys; sys.version.split()[0]") + " آماده است" + (base.startsWith("assets") ? " (نسخهٔ محلی، بدون اینترنت)" : "") + ".", "ok");
          return py;
        } catch (e) { lastErr = e; window.loadPyodide = undefined; }
      }
      loading = null;
      setStatus("بارگذاری پایتون ممکن نشد. برای اولین اجرا به اینترنت نیاز است (یا از نسخهٔ نصبی دسکتاپ استفاده کن).", "err");
      throw lastErr || new Error("pyodide");
    })();
    return loading;
  }
  const BOOT = `
import sys, io, ast, base64, os, traceback
os.environ['MPLBACKEND'] = 'AGG'
_G = {'__name__': '__main__'}
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
`;
  async function runCell(i) {
    const c = cells[i]; if (!c.src.trim()) return;
    const box = document.querySelector(`[data-cell="${i}"] .cout`);
    box.innerHTML = '<span class="muted">در حال اجرا…</span>';
    try { await ensurePy(); } catch (e) { box.innerHTML = '<pre class="err">پایتون بارگذاری نشد.</pre>'; return; }
    try {
      setStatus("در حال نصب بسته‌های لازم…", "busy");
      await py.loadPackagesFromImports(c.src);
      setStatus("در حال اجرا…", "busy");
      const res = py.globals.get("_run_cell")(c.src);
      const [stdout, text, html, figs, err] = res.toJs(); res.destroy();
      c.out = { stdout, text, html, figs: Array.from(figs || []), err };
      setStatus("آماده.", "ok");
    } catch (e) { c.out = { err: String(e && e.message || e) }; setStatus("خطا در اجرا.", "err"); }
    renderOut(i); bump();
  }
  function renderOut(i) {
    const c = cells[i], box = document.querySelector(`[data-cell="${i}"] .cout`); if (!box) return;
    if (!c.out) { box.innerHTML = ""; return; }
    let h = "";
    if (c.out.stdout) h += `<pre>${esc(c.out.stdout)}</pre>`;
    if (c.out.html) h += `<div class="df">${sanitize(c.out.html)}</div>`;
    else if (c.out.text !== null && c.out.text !== undefined) h += `<pre class="res">${esc(c.out.text)}</pre>`;
    (c.out.figs || []).forEach(f => { h += `<img alt="نمودار" src="data:image/png;base64,${f}">`; });
    if (c.out.err) h += `<pre class="err">${esc(c.out.err)}</pre>`;
    box.innerHTML = h || '<span class="muted">(بدون خروجی)</span>';
  }
  function sanitize(html) { /* pandas HTML: keep table markup only */
    const t = document.createElement("template"); t.innerHTML = html;
    t.content.querySelectorAll("script,style,iframe,object,embed,link,meta").forEach(n => n.remove());
    t.content.querySelectorAll("*").forEach(n => [...n.attributes].forEach(a => { if (!["class", "colspan", "rowspan", "border"].includes(a.name)) n.removeAttribute(a.name); }));
    return t.innerHTML;
  }
  function bump() {
    runCount++;
    try {
      const S = JSON.parse(localStorage.getItem("academyProgress")) || {};
      S.pyRuns = (S.pyRuns || 0) + 1; S.done = S.done || []; S.answered = S.answered || []; S.correct = S.correct || 0;
      if (!S.activity || typeof S.activity !== "object") S.activity = {};
      const d = new Date(), k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      if (runCount <= 5) S.activity[k] = (S.activity[k] || 0) + 1;
      localStorage.setItem("academyProgress", JSON.stringify(S));
      if (location.protocol !== "file:") fetch("api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(S) }).catch(() => { });
    } catch (e) { }
  }

  function render() {
    $("cells").innerHTML = cells.map((c, i) => `<div class="cell card" data-cell="${i}"><div class="cbar"><span class="cnum">[${i + 1}]</span><div class="cact"><button class="btn" data-run="${i}" title="Ctrl+Enter">▶ اجرا</button><button class="btn alt" data-up="${i}" aria-label="بالا">↑</button><button class="btn alt" data-down="${i}" aria-label="پایین">↓</button><button class="btn alt" data-del="${i}" aria-label="حذف">✕</button></div></div><textarea class="code" spellcheck="false" rows="${Math.max(3, c.src.split("\n").length)}" aria-label="کد سلول ${i + 1}">${esc(c.src)}</textarea><div class="cout"></div></div>`).join("");
    document.querySelectorAll("[data-cell]").forEach(cellEl => {
      const i = +cellEl.dataset.cell, ta = cellEl.querySelector("textarea");
      ta.addEventListener("input", () => { cells[i].src = ta.value; ta.rows = Math.max(3, ta.value.split("\n").length); persist(); });
      ta.addEventListener("keydown", e => {
        if (e.key === "Tab") { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText("    ", s, ta.selectionEnd, "end"); ta.dispatchEvent(new Event("input")); }
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); runCell(i); }
        if (e.key === "Enter" && e.shiftKey) { e.preventDefault(); runCell(i).then(() => { const nx = document.querySelector(`[data-cell="${i + 1}"] textarea`); if (nx) nx.focus(); else { addCell(); } }); }
      });
      renderOut(i);
    });
    document.querySelectorAll("[data-run]").forEach(b => b.onclick = () => runCell(+b.dataset.run));
    document.querySelectorAll("[data-del]").forEach(b => b.onclick = () => { cells.splice(+b.dataset.del, 1); if (!cells.length) cells.push({ src: "", out: null }); persist(); render(); });
    document.querySelectorAll("[data-up]").forEach(b => b.onclick = () => { const i = +b.dataset.up; if (i > 0) { [cells[i - 1], cells[i]] = [cells[i], cells[i - 1]]; persist(); render(); } });
    document.querySelectorAll("[data-down]").forEach(b => b.onclick = () => { const i = +b.dataset.down; if (i < cells.length - 1) { [cells[i + 1], cells[i]] = [cells[i], cells[i + 1]]; persist(); render(); } });
  }
  function addCell(src = "") { cells.push({ src, out: null }); persist(); render(); const t = document.querySelectorAll("textarea.code"); t[t.length - 1].focus(); }
  function download(name, text, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }

  $("samples").innerHTML = Object.entries(SAMPLES).map(([k, s]) => `<button class="chip-btn" data-sample="${k}">${esc(s.title)}</button>`).join("");
  document.querySelectorAll("[data-sample]").forEach(b => b.onclick = () => { if (cells.some(c => c.src.trim()) && !confirm("سلول‌های فعلی با نمونهٔ «" + SAMPLES[b.dataset.sample].title + "» جایگزین شوند؟")) return; cells = SAMPLES[b.dataset.sample].cells.map(src => ({ src, out: null })); persist(); render(); });
  $("addCell").onclick = () => addCell();
  $("runAll").onclick = async () => { for (let i = 0; i < cells.length; i++) await runCell(i); };
  $("clearOut").onclick = () => { cells.forEach(c => c.out = null); render(); };
  $("restart").onclick = async () => { if (!py) return; py.runPython("_G.clear(); _G['__name__'] = '__main__'"); cells.forEach(c => c.out = null); render(); setStatus("حافظهٔ پایتون پاک شد.", "ok"); };
  $("dlPy").onclick = () => download("notebook.py", cells.map((c, i) => "# %% [" + (i + 1) + "]\n" + c.src).join("\n\n") + "\n", "text/x-python");
  $("dlIpynb").onclick = () => download("notebook.ipynb", JSON.stringify({ nbformat: 4, nbformat_minor: 5, metadata: { kernelspec: { name: "python3", display_name: "Python 3", language: "python" }, language_info: { name: "python" } }, cells: cells.map(c => ({ cell_type: "code", metadata: {}, execution_count: null, outputs: [], source: c.src.split(/(?<=\n)/) })) }, null, 1), "application/json");
  $("warm").onclick = () => ensurePy().catch(() => { });
  render();
})();
