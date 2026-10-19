/* Minimal Markdown renderer for lessons, with KaTeX math and teaching blocks.
   Supports: headings, paragraphs, lists, tables, blockquotes, code, **bold**, *italic*, `code`, [links](url),
   $inline$ and $$display$$ math, and containers:
     :::def | :::why | :::tip | :::mistake | :::note <title>  … :::
     :::example <title>  problem … --- … solution :::   (solution is collapsible)
     :::try  question … --- … answer :::                  (answer is collapsible)
     :::graph  f: x^2 / g: 2x+1 / range: -5,5 / params: a=1:-3:3  :::   (interactive plot, sliders)
   Works in the browser (window.MD) and in Node (module.exports) for tests. */
(function (root) {
  "use strict";
  const tr = (fa, en) => (root.I18N ? root.I18N.T(fa, en) : (root.MDSA_LANG === "en" ? en : fa));
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const katexLib = () => root.katex || (typeof require === "function" ? (() => { try { return require("../vendor/katex/katex.min.js"); } catch (e) { return null; } })() : null);

  function renderMath(tex, display, strict) {
    const k = katexLib();
    if (!k) return "<code>" + esc(tex) + "</code>";
    try { return k.renderToString(tex, { displayMode: display, throwOnError: !!strict, strict: "ignore", output: "html" }); }
    catch (e) { if (strict) throw new Error("KaTeX: " + e.message + " in: " + tex); return "<code>" + esc(tex) + "</code>"; }
  }

  function render(md, opts) {
    opts = opts || {};
    const maths = [];
    /* protect code spans/blocks from math extraction */
    const codes = [];
    md = String(md).replace(/\r/g, "").replace(/```[\s\S]*?```/g, m => { codes.push(m); return "\u0001C" + (codes.length - 1) + "\u0001"; });
    md = md.replace(/`[^`\n]+`/g, m => { codes.push(m); return "\u0001C" + (codes.length - 1) + "\u0001"; });
    md = md.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => { maths.push(renderMath(t.trim(), true, opts.strict)); return "\u0002M" + (maths.length - 1) + "\u0002"; });
    md = md.replace(/(^|[^\\])\$([^\n$]+?)\$/g, (_, pre, t) => { maths.push(renderMath(t.trim(), false, opts.strict)); return pre + "\u0002M" + (maths.length - 1) + "\u0002"; });
    md = md.replace(/\\\$/g, "$");
    md = md.replace(/\u0001C(\d+)\u0001/g, (_, i) => codes[+i]);
    let html = blocks(md.split("\n"), opts);
    html = html.replace(/\u0002M(\d+)\u0002/g, (_, i) => maths[+i]);
    return html;
  }

  function inline(s) {
    let out = esc(s);
    out = out.replace(/`([^`]+)`/g, (_, c) => "<code>" + c + "</code>");
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/(^|[\s(،؛])\*([^*\s][^*]*?)\*(?=[\s).,،؛:!?]|$)/g, "$1<em>$2</em>");
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => {
      const safe = /^(https?:|#|[\w./-]+$)/.test(u) ? u : "#";
      const ext = /^https?:/.test(safe);
      return '<a href="' + safe + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + t + "</a>";
    });
    return out;
  }

  const BOX = {
    def: ["تعریف", "Definition"], why: ["شهود", "Intuition"], tip: ["نکته", "Tip"], mistake: ["اشتباه رایج", "Common mistake"],
    note: ["یادداشت", "Note"], example: ["مثال حل‌شده", "Worked example"], try: ["خودت امتحان کن", "Try it yourself"], ds: ["در علم داده", "In data science"],
  };

  function blocks(lines, opts) {
    const out = [];
    let i = 0;
    const para = [];
    const flush = () => { if (para.length) { out.push("<p>" + inline(para.join(" ")) + "</p>"); para.length = 0; } };
    while (i < lines.length) {
      const line = lines[i];
      const t = line.trim();
      if (!t) { flush(); i++; continue; }
      if (t.startsWith("```")) {
        flush(); const lang = t.slice(3).trim(); const body = []; i++;
        while (i < lines.length && !lines[i].trim().startsWith("```")) body.push(lines[i++]);
        i++; out.push('<pre class="md-code"' + (lang ? ' data-lang="' + esc(lang) + '"' : "") + "><code>" + esc(body.join("\n")) + "</code></pre>"); continue;
      }
      const box = t.match(/^:::\s*(\w+)\s*(.*)$/);
      if (box && box[1] !== "") {
        flush(); const kind = box[1], title = box[2]; const body = []; i++; let depth = 0;
        while (i < lines.length) {
          const l = lines[i].trim();
          if (/^:::\s*\w+/.test(l)) depth++;
          else if (l === ":::") { if (depth === 0) break; depth--; }
          body.push(lines[i]); i++;
        }
        i++;
        out.push(container(kind, title, body, opts)); continue;
      }
      const h = t.match(/^(#{1,4})\s+(.*)$/);
      if (h) {
        flush(); const lv = Math.max(2, Math.min(4, h[1].length));
        const id = "h-" + out.length;
        out.push("<h" + lv + ' id="' + id + '">' + inline(h[2]) + "</h" + lv + ">"); i++; continue;
      }
      if (/^(-{3,}|\*{3,})$/.test(t)) { flush(); out.push("<hr>"); i++; continue; }
      if (t.startsWith(">")) {
        flush(); const q = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) q.push(lines[i++].trim().replace(/^>\s?/, ""));
        out.push("<blockquote>" + blocks(q, opts) + "</blockquote>"); continue;
      }
      if (/^\|.*\|$/.test(t)) {
        flush(); const rows = [];
        while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) rows.push(lines[i++].trim());
        const cells = r => r.slice(1, -1).split("|").map(c => c.trim());
        const head = cells(rows[0]); const bodyRows = rows.slice(/^\|[\s:|-]+\|$/.test(rows[1] || "") ? 2 : 1);
        out.push('<div class="md-table"><table><thead><tr>' + head.map(c => "<th>" + inline(c) + "</th>").join("") + "</tr></thead><tbody>" +
          bodyRows.map(r => "<tr>" + cells(r).map(c => "<td>" + inline(c) + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>");
        continue;
      }
      const li = t.match(/^([-*]|\d+[.)])\s+(.*)$/);
      if (li) {
        flush(); const ordered = /\d/.test(li[1]); const items = [];
        while (i < lines.length) {
          const m = lines[i].trim().match(/^([-*]|\d+[.)])\s+(.*)$/);
          if (m && /\d/.test(m[1]) === ordered) { items.push(m[2]); i++; }
          else if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length) { items[items.length - 1] += " " + lines[i].trim(); i++; }
          else break;
        }
        out.push((ordered ? "<ol>" : "<ul>") + items.map(x => "<li>" + inline(x) + "</li>").join("") + (ordered ? "</ol>" : "</ul>")); continue;
      }
      para.push(t); i++;
    }
    flush();
    return out.join("\n");
  }

  function splitAt(body) {
    const k = body.findIndex(l => l.trim() === "---");
    return k < 0 ? [body, null] : [body.slice(0, k), body.slice(k + 1)];
  }
  function container(kind, title, body, opts) {
    if (kind === "graph") return graphBlock(body, title);
    const label = BOX[kind] ? tr(BOX[kind][0], BOX[kind][1]) : kind;
    const head = '<div class="md-box-h"><span class="md-tag">' + esc(label) + "</span>" + (title ? "<b>" + inline(title) + "</b>" : "") + "</div>";
    if (kind === "example" || kind === "try") {
      const [q, a] = splitAt(body);
      const btn = kind === "try" ? tr("دیدن جواب", "Check the answer") : tr("نمایش راه‌حل", "Show the solution");
      return '<div class="md-box md-' + kind + '">' + head + blocks(q, opts) +
        (a ? '<details class="md-sol"><summary>' + esc(btn) + "</summary>" + blocks(a, opts) + "</details>" : "") + "</div>";
    }
    return '<div class="md-box md-' + esc(kind) + '">' + head + blocks(body, opts) + "</div>";
  }
  function graphBlock(body, title) {
    const spec = { fns: [], range: [-6, 6], params: [] };
    body.forEach(l => {
      const m = l.trim().match(/^(\w+)\s*:\s*(.+)$/); if (!m) return;
      const k = m[1].toLowerCase(), v = m[2].trim();
      if (k === "range") { const r = v.split(",").map(Number); if (r.length === 2 && r.every(Number.isFinite)) spec.range = r; }
      else if (k === "params") v.split(";").forEach(p => { const q = p.trim().match(/^(\w)\s*=\s*(-?[\d.]+)\s*:\s*(-?[\d.]+)\s*:\s*(-?[\d.]+)$/); if (q) spec.params.push({ n: q[1], v: +q[2], lo: +q[3], hi: +q[4] }); });
      else if (k === "points") spec.points = v.split(";").map(p => p.split(",").map(Number)).filter(p => p.length === 2 && p.every(Number.isFinite));
      else spec.fns.push({ label: k, expr: v });
    });
    return '<div class="md-graph" data-spec="' + esc(JSON.stringify(spec)) + '">' + (title ? '<div class="md-graph-t">' + inline(title) + "</div>" : "") + "</div>";
  }

  /* Activate interactive parts after inserting rendered HTML into the page. */
  function mount(container) {
    const E = root.MathEngine;
    container.querySelectorAll(".md-graph").forEach(box => {
      if (box.dataset.ready || !E || !E.Plot) return;
      box.dataset.ready = "1";
      let spec; try { spec = JSON.parse(box.dataset.spec); } catch (e) { return; }
      const vals = {}; spec.params.forEach(p => { vals[p.n] = p.v; });
      const asts = spec.fns.map(f => { try { return E.parse(f.expr); } catch (e) { return null; } });
      const legend = document.createElement("div"); legend.className = "md-graph-legend";
      const cv = document.createElement("canvas"); cv.className = "md-graph-cv"; cv.setAttribute("role", "img"); cv.setAttribute("aria-label", tr("نمودار", "Graph"));
      const sliders = document.createElement("div"); sliders.className = "md-graph-sliders";
      box.append(legend, cv, sliders);
      const COLORS = ["#22d3ee", "#f472b6", "#a3e635", "#fbbf24"];
      const plot = new E.Plot(cv, {});
      const fns = () => asts.map((a, i) => a && { f: x => { try { return E.evalNum(a, Object.assign({ x }, vals)); } catch (e) { return NaN; } }, color: COLORS[i % 4] }).filter(Boolean);
      const draw = (fit) => {
        legend.innerHTML = spec.fns.map((f, i) => '<span><i style="background:' + COLORS[i % 4] + '"></i>' + renderMath(f.label + "(x) = " + (asts[i] ? E.tex(substParams(asts[i])) : esc(f.expr)), false) + "</span>").join("");
        plot.set({ fns: fns(), points: spec.points || [], fit: false });
        if (fit) { plot.view = { x0: spec.range[0], x1: spec.range[1], y0: spec.range[0] * 0.75, y1: spec.range[1] * 0.75 }; plot.autoFit && fitY(); }
        plot.computeSpecial(); plot.draw();
      };
      function substParams(a) { let r = a; Object.keys(vals).forEach(k => { r = E.subst(r, k, E.N.num(E.Q.fromNumber(+(+vals[k]).toFixed(2)))); }); return E.simp(r); }
      function fitY() {
        const ys = []; const [a, b] = spec.range;
        fns().forEach(fn => { for (let i = 0; i <= 120; i++) { const y = fn.f(a + (b - a) * i / 120); if (Number.isFinite(y)) ys.push(y); } });
        if (!ys.length) return; ys.sort((p, q) => p - q);
        let lo = ys[Math.floor(ys.length * 0.03)], hi = ys[Math.floor(ys.length * 0.97)]; const pad = Math.max(0.05, (hi - lo) * 0.15);
        lo = Math.min(lo - pad, 0); hi = Math.max(hi + pad, 0);
        plot.view = { x0: a, x1: b, y0: lo, y1: hi };
      }
      spec.params.forEach(p => {
        const lab = document.createElement("label");
        const out = document.createElement("output"); out.textContent = p.v;
        const inp = document.createElement("input"); inp.type = "range"; inp.min = p.lo; inp.max = p.hi; inp.step = (p.hi - p.lo) / 40; inp.value = p.v;
        inp.addEventListener("input", () => { vals[p.n] = +inp.value; out.textContent = (+inp.value).toFixed(2).replace(/\.?0+$/, ""); draw(false); });
        lab.append(Object.assign(document.createElement("b"), { textContent: p.n + " = " }), out, inp);
        sliders.appendChild(lab);
      });
      requestAnimationFrame(() => { plot.resize(); draw(true); });
    });
  }

  /* Headings for a table of contents */
  function toc(container) { return Array.from(container.querySelectorAll("h2,h3")).map(h => ({ id: h.id, text: h.textContent, level: +h.tagName[1] })); }

  const MD = { render, mount, toc, renderMath, inline };
  root.MD = MD;
  if (typeof module !== "undefined" && module.exports) module.exports = MD;
})(typeof globalThis !== "undefined" ? globalThis : this);
