/* Interactive graphing for the solver: multiple functions, pan/zoom (mouse, wheel, touch),
   trace, key points (roots, y-intercept, extrema), shaded area, points, and stats charts. */
(function (root) {
  "use strict";
  const E = root.MathEngine;
  const tr = (fa, en) => (E.lang() === "en" && en !== undefined ? en : fa);
  const COLORS = ["#22d3ee", "#f472b6", "#a3e635", "#fbbf24", "#c084fc", "#fb7185"];
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const nice = s => { const p = Math.pow(10, Math.floor(Math.log10(s))), m = s / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; };
  const fmt = x => { const r = Math.abs(x) < 1e-10 ? 0 : x; return Math.abs(r) >= 1e5 || (Math.abs(r) < 1e-3 && r !== 0) ? r.toExponential(1) : String(+r.toFixed(4)); };

  class Plot {
    constructor(canvas, opts = {}) {
      this.c = canvas; this.ctx = canvas.getContext("2d"); canvas.setAttribute("dir", "ltr"); this.ctx.direction = "ltr";
      this.fns = []; this.points = []; this.area = null; this.marks = []; this.special = [];
      this.view = { x0: -10, x1: 10, y0: -7, y1: 7 };
      this.hover = null; this.onTrace = opts.onTrace || null;
      this.resize(); this.bind();
      if (root.ResizeObserver) new ResizeObserver(() => { this.resize(); this.draw(); }).observe(canvas);
    }
    resize() {
      const r = this.c.getBoundingClientRect(), dpr = root.devicePixelRatio || 1;
      const w = Math.max(280, r.width || 600), h = Math.max(220, r.height || 360);
      this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr); this.w = w; this.h = h; this.dpr = dpr;
    }
    set({ fns = [], points = [], area = null, marks = [], fit = true, lines = [] } = {}) {
      this.fns = fns.map((f, i) => ({ ...f, color: f.color || COLORS[i % COLORS.length], f: f.f || E.compile(f.ast, f.v || "x") }));
      this.points = points; this.area = area; this.marks = marks; this.lines = lines;
      if (fit) this.autoFit();
      this.computeSpecial(); this.draw();
    }
    autoFit() {
      let xs = [-10, 10];
      const px = this.points.map(p => p[0]).concat(this.marks.filter(Number.isFinite)).concat(this.area ? this.area : []);
      if (px.length) { const lo = Math.min(...px), hi = Math.max(...px), pad = Math.max(1, (hi - lo) * 0.35); xs = [Math.min(lo - pad, -1), Math.max(hi + pad, 1)]; if (hi - lo < 4) xs = [lo - 5, hi + 5]; }
      const [x0, x1] = xs, ys = [];
      const cx = (x0 + x1) / 2, cw = (x1 - x0) / 3;
      this.fns.forEach(fn => { for (let i = 0; i <= 200; i++) { const x = cx - cw + 2 * cw * i / 200, y = fn.f(x); if (Number.isFinite(y)) ys.push(y); } });
      this.points.forEach(p => ys.push(p[1]));
      let y0 = -7, y1 = 7;
      if (ys.length) {
        ys.sort((a, b) => a - b);
        const lo = ys[Math.floor(ys.length * 0.03)], hi = ys[Math.floor(ys.length * 0.97)];
        const pad = Math.max(1, (hi - lo) * 0.2); y0 = Math.min(lo - pad, -1); y1 = Math.max(hi + pad, 1);
      }
      /* keep aspect sensible */
      const aspect = (this.h / this.w) * (x1 - x0);
      if (y1 - y0 < aspect) { const m = (y0 + y1) / 2; y0 = m - aspect / 2; y1 = m + aspect / 2; }
      this.view = { x0, x1, y0, y1 };
    }
    X(x) { return (x - this.view.x0) / (this.view.x1 - this.view.x0) * this.w; }
    Y(y) { return this.h - (y - this.view.y0) / (this.view.y1 - this.view.y0) * this.h; }
    ix(px) { return this.view.x0 + px / this.w * (this.view.x1 - this.view.x0); }
    iy(py) { return this.view.y0 + (this.h - py) / this.h * (this.view.y1 - this.view.y0); }
    computeSpecial() {
      this.special = [];
      const { x0, x1 } = this.view, span = x1 - x0;
      this.fns.forEach(fn => {
        if (fn.noSpecial) return;
        const roots = E.numericScan(fn.f, x0 - span, x1 + span, 1600);
        roots.forEach(r => this.special.push({ x: r, y: 0, label: tr("ریشه", "root"), color: fn.color }));
        const y0 = fn.f(0); if (Number.isFinite(y0)) this.special.push({ x: 0, y: y0, label: tr("عرض از مبدأ", "y-intercept"), color: fn.color });
        const d = x => (fn.f(x + 1e-5) - fn.f(x - 1e-5)) / 2e-5;
        const ex = E.numericScan(d, x0 - span, x1 + span, 1600);
        ex.forEach(x => { const y = fn.f(x), yl = fn.f(x - 1e-3), yr = fn.f(x + 1e-3); if (!Number.isFinite(y)) return; const kind = yl > y && yr > y ? tr("کمینه", "minimum") : yl < y && yr < y ? tr("بیشینه", "maximum") : null; if (kind) this.special.push({ x, y, label: kind, color: fn.color }); });
      });
    }
    draw() {
      const g = this.ctx, { w, h, dpr } = this;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = "#0a1524"; g.fillRect(0, 0, w, h);
      const { x0, x1, y0, y1 } = this.view;
      const sx = nice((x1 - x0) / (w / 70)), sy = nice((y1 - y0) / (h / 55));
      g.lineWidth = 1; g.font = "11px Vazirmatn, Tahoma, sans-serif"; g.fillStyle = "#5b7290";
      /* minor grid */
      g.strokeStyle = "rgba(56,189,248,.06)";
      for (let x = Math.ceil(x0 / (sx / 5)) * sx / 5; x <= x1; x += sx / 5) { const X = Math.round(this.X(x)) + .5; g.beginPath(); g.moveTo(X, 0); g.lineTo(X, h); g.stroke(); }
      for (let y = Math.ceil(y0 / (sy / 5)) * sy / 5; y <= y1; y += sy / 5) { const Y = Math.round(this.Y(y)) + .5; g.beginPath(); g.moveTo(0, Y); g.lineTo(w, Y); g.stroke(); }
      g.strokeStyle = "rgba(56,189,248,.14)";
      const ax = Math.min(Math.max(this.X(0), 0), w), ay = Math.min(Math.max(this.Y(0), 0), h);
      for (let x = Math.ceil(x0 / sx) * sx; x <= x1; x += sx) { const X = Math.round(this.X(x)) + .5; g.beginPath(); g.moveTo(X, 0); g.lineTo(X, h); g.stroke(); if (Math.abs(x) > sx / 2) g.fillText(fmt(x), X + 3, Math.min(h - 4, ay + 14)); }
      for (let y = Math.ceil(y0 / sy) * sy; y <= y1; y += sy) { const Y = Math.round(this.Y(y)) + .5; g.beginPath(); g.moveTo(0, Y); g.lineTo(w, Y); g.stroke(); if (Math.abs(y) > sy / 2) g.fillText(fmt(y), Math.min(w - 30, ax + 4), Y - 3); }
      g.strokeStyle = "rgba(230,241,255,.55)"; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(0, Math.round(ay) + .5); g.lineTo(w, Math.round(ay) + .5); g.stroke();
      g.beginPath(); g.moveTo(Math.round(ax) + .5, 0); g.lineTo(Math.round(ax) + .5, h); g.stroke();
      /* area */
      if (this.area && this.fns[0]) {
        const [a, b] = this.area, f = this.fns[0].f;
        g.beginPath(); g.moveTo(this.X(a), this.Y(0));
        for (let i = 0; i <= 300; i++) { const x = a + (b - a) * i / 300, y = f(x); if (Number.isFinite(y)) g.lineTo(this.X(x), this.Y(Math.max(y0 - 1e3, Math.min(y1 + 1e3, y)))); }
        g.lineTo(this.X(b), this.Y(0)); g.closePath(); g.fillStyle = "rgba(34,211,238,.18)"; g.fill();
      }
      /* lines (regression) */
      (this.lines || []).forEach(L => { g.strokeStyle = L.color || "#f472b6"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, this.Y(L.a + L.b * x0)); g.lineTo(w, this.Y(L.a + L.b * x1)); g.stroke(); });
      /* functions */
      this.fns.forEach(fn => {
        g.strokeStyle = fn.color; g.lineWidth = 2.6; g.shadowColor = fn.color; g.shadowBlur = 8; g.beginPath();
        let pen = false, prev = null; const N = Math.ceil(w * 1.5);
        for (let i = 0; i <= N; i++) {
          const x = x0 + (x1 - x0) * i / N, y = fn.f(x);
          if (!Number.isFinite(y)) { pen = false; prev = null; continue; }
          const Y = this.Y(y);
          if (prev !== null && Math.abs(Y - prev) > h * 1.5) pen = false; /* asymptote jump */
          if (Y < -h * 4 || Y > h * 5) { pen = false; prev = Y; continue; }
          if (!pen) { g.moveTo(this.X(x), Y); pen = true; } else g.lineTo(this.X(x), Y);
          prev = Y;
        }
        g.stroke(); g.shadowBlur = 0;
      });
      /* marks (vertical lines) */
      this.marks.forEach(m => { if (!Number.isFinite(m)) return; g.setLineDash([5, 5]); g.strokeStyle = "rgba(251,191,36,.7)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(this.X(m), 0); g.lineTo(this.X(m), h); g.stroke(); g.setLineDash([]); });
      /* special points */
      this.special.forEach(p => { if (p.x < x0 || p.x > x1 || p.y < y0 || p.y > y1) return; g.fillStyle = "#0a1524"; g.strokeStyle = p.color; g.lineWidth = 2; g.beginPath(); g.arc(this.X(p.x), this.Y(p.y), 4, 0, 7); g.fill(); g.stroke(); });
      /* data points */
      this.points.forEach(p => { g.fillStyle = p[2] || "#fbbf24"; g.beginPath(); g.arc(this.X(p[0]), this.Y(p[1]), 4.5, 0, 7); g.fill(); });
      /* hover trace */
      if (this.hover) {
        const { x, y, color, label } = this.hover;
        g.fillStyle = color; g.beginPath(); g.arc(this.X(x), this.Y(y), 5.5, 0, 7); g.fill();
        const t = (label ? label + "  " : "") + "(" + fmt(x) + ", " + fmt(y) + ")";
        g.font = "12px Vazirmatn, Tahoma, sans-serif";
        const tw = g.measureText(t).width + 16; let bx = this.X(x) + 10, by = this.Y(y) - 34;
        if (bx + tw > w) bx = this.X(x) - tw - 10; if (by < 4) by = this.Y(y) + 12;
        g.fillStyle = "rgba(8,20,34,.95)"; g.strokeStyle = "rgba(34,211,238,.4)"; g.lineWidth = 1;
        roundRect(g, bx, by, tw, 24, 7); g.fill(); g.stroke();
        g.fillStyle = "#e6f1ff"; g.fillText(t, bx + 8, by + 16);
      }
    }
    zoom(f, cx, cy) {
      const v = this.view; cx = cx === undefined ? (v.x0 + v.x1) / 2 : cx; cy = cy === undefined ? (v.y0 + v.y1) / 2 : cy;
      this.view = { x0: cx - (cx - v.x0) * f, x1: cx + (v.x1 - cx) * f, y0: cy - (cy - v.y0) * f, y1: cy + (v.y1 - cy) * f };
      this.computeSpecial(); this.draw();
    }
    reset() { this.autoFit(); this.computeSpecial(); this.draw(); }
    traceAt(px, py) {
      const x = this.ix(px); let best = null;
      /* snap to special points */
      this.special.forEach(p => { const d = Math.hypot(this.X(p.x) - px, this.Y(p.y) - py); if (d < 12 && (!best || d < best.d)) best = { d, x: p.x, y: p.y, color: p.color, label: p.label }; });
      if (!best) this.fns.forEach(fn => { const y = fn.f(x); if (!Number.isFinite(y)) return; const d = Math.abs(this.Y(y) - py); if (d < 40 && (!best || d < best.d)) best = { d, x, y, color: fn.color }; });
      if (!best) this.points.forEach(p => { const d = Math.hypot(this.X(p[0]) - px, this.Y(p[1]) - py); if (d < 12 && (!best || d < best.d)) best = { d, x: p[0], y: p[1], color: "#fbbf24" }; });
      this.hover = best; this.draw(); if (this.onTrace) this.onTrace(best);
    }
    bind() {
      const c = this.c; let drag = null, pinch = null;
      const pos = e => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      c.addEventListener("pointerdown", e => { c.setPointerCapture(e.pointerId); drag = { p: pos(e), v: { ...this.view }, moved: false }; });
      c.addEventListener("pointermove", e => {
        const p = pos(e);
        if (drag && !pinch) {
          const dx = p[0] - drag.p[0], dy = p[1] - drag.p[1]; if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
          if (drag.moved) { const v = drag.v, kx = (v.x1 - v.x0) / this.w, ky = (v.y1 - v.y0) / this.h; this.view = { x0: v.x0 - dx * kx, x1: v.x1 - dx * kx, y0: v.y0 + dy * ky, y1: v.y1 + dy * ky }; this.hover = null; this.draw(); }
        } else this.traceAt(p[0], p[1]);
      });
      c.addEventListener("pointerup", e => { if (drag && drag.moved) this.computeSpecial(); if (drag && !drag.moved) { const p = pos(e); this.traceAt(p[0], p[1]); } drag = null; this.draw(); });
      c.addEventListener("pointerleave", () => { if (!drag) { this.hover = null; this.draw(); } });
      c.addEventListener("wheel", e => { e.preventDefault(); const p = pos(e); this.zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, this.ix(p[0]), this.iy(p[1])); }, { passive: false });
      c.addEventListener("touchstart", e => { if (e.touches.length === 2) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); pinch = { d, v: { ...this.view } }; } }, { passive: true });
      c.addEventListener("touchmove", e => { if (pinch && e.touches.length === 2) { e.preventDefault(); const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); this.view = pinch.v; this.zoom(pinch.d / d); } }, { passive: false });
      c.addEventListener("touchend", () => { pinch = null; });
      c.style.touchAction = "none"; c.style.cursor = "crosshair";
    }
  }
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  E.Plot = Plot;

  /* ---------- static statistic charts ---------- */
  function setup(canvas) { const r = canvas.getBoundingClientRect(), dpr = root.devicePixelRatio || 1; const w = Math.max(280, r.width || 600), h = Math.max(200, r.height || 300); canvas.width = w * dpr; canvas.height = h * dpr; canvas.setAttribute("dir", "ltr"); const g = canvas.getContext("2d"); g.direction = "ltr"; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = "#0a1524"; g.fillRect(0, 0, w, h); g.font = "11px Vazirmatn, Tahoma, sans-serif"; return { g, w, h }; }
  function axisX(g, w, h, lo, hi, X, pad) { const s = nice((hi - lo) / 8); g.fillStyle = "#8aa0bb"; g.strokeStyle = "rgba(230,241,255,.4)"; g.beginPath(); g.moveTo(pad, h - pad); g.lineTo(w - pad, h - pad); g.stroke(); for (let x = Math.ceil(lo / s) * s; x <= hi + 1e-9; x += s) { g.fillText(fmt(x), X(x) - 8, h - pad + 15); g.beginPath(); g.moveTo(X(x), h - pad); g.lineTo(X(x), h - pad + 4); g.stroke(); } }
  E.drawStatChart = function (canvas, ch) {
    const { g, w, h } = setup(canvas), pad = 30;
    if (ch.kind === "box+hist") {
      const d = ch.data, lo = d[0], hi = d[d.length - 1], span = hi - lo || 1, L = lo - span * 0.08, H = hi + span * 0.08;
      const X = x => pad + (x - L) / (H - L) * (w - 2 * pad);
      const bins = Math.max(4, Math.min(16, Math.ceil(Math.sqrt(d.length)) + 1)), bw = span / bins || 1, counts = Array(bins).fill(0);
      d.forEach(x => counts[Math.min(bins - 1, Math.floor((x - lo) / bw))]++);
      const maxc = Math.max(...counts), top = h * 0.42, base = h - pad;
      counts.forEach((c, i) => { const x = X(lo + i * bw), x2 = X(lo + (i + 1) * bw), y = base - c / maxc * (base - top); g.fillStyle = "rgba(34,211,238,.35)"; g.strokeStyle = "#22d3ee"; g.fillRect(x + 1, y, x2 - x - 2, base - y); g.strokeRect(x + 1, y, x2 - x - 2, base - y); if (c) { g.fillStyle = "#c3d3e8"; g.fillText(String(c), (x + x2) / 2 - 3, y - 4); } });
      const by = h * 0.2;
      g.strokeStyle = "#f472b6"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(X(ch.lo), by); g.lineTo(X(ch.q1), by); g.moveTo(X(ch.q3), by); g.lineTo(X(ch.hi), by); g.moveTo(X(ch.lo), by - 8); g.lineTo(X(ch.lo), by + 8); g.moveTo(X(ch.hi), by - 8); g.lineTo(X(ch.hi), by + 8); g.stroke();
      g.fillStyle = "rgba(244,114,182,.18)"; g.fillRect(X(ch.q1), by - 16, X(ch.q3) - X(ch.q1), 32); g.strokeRect(X(ch.q1), by - 16, X(ch.q3) - X(ch.q1), 32);
      g.beginPath(); g.moveTo(X(ch.med), by - 16); g.lineTo(X(ch.med), by + 16); g.stroke();
      ch.out.forEach(o => { g.beginPath(); g.arc(X(o), by, 4, 0, 7); g.stroke(); });
      g.lineWidth = 1; axisX(g, w, h, L, H, X, pad);
      g.fillStyle = "#8aa0bb"; g.fillText(tr("نمودار جعبه‌ای", "box plot"), w - pad - 70, by - 22); g.fillText(tr("بافت‌نگار", "histogram"), w - pad - 50, top - 10);
    } else if (ch.kind === "bars") {
      const n = ch.xs.length, maxy = Math.max(...ch.ys), X = i => pad + (i + 0.5) / n * (w - 2 * pad), bw = Math.max(2, (w - 2 * pad) / n * 0.7);
      ch.xs.forEach((x, i) => { const y = h - pad - ch.ys[i] / maxy * (h - 2 * pad); g.fillStyle = x === ch.hi ? "#f472b6" : "rgba(34,211,238,.6)"; g.fillRect(X(i) - bw / 2, y, bw, h - pad - y); });
      g.fillStyle = "#8aa0bb"; const step = Math.ceil(n / 12); ch.xs.forEach((x, i) => { if (i % step === 0) g.fillText(String(x), X(i) - 4, h - pad + 15); });
      g.strokeStyle = "rgba(230,241,255,.4)"; g.beginPath(); g.moveTo(pad, h - pad); g.lineTo(w - pad, h - pad); g.stroke();
    } else if (ch.kind === "normal") {
      const { mu, sigma } = ch, L = mu - 4 * sigma, H = mu + 4 * sigma, X = x => pad + (x - L) / (H - L) * (w - 2 * pad);
      const pdf = x => Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI)), top = pdf(mu), Y = y => h - pad - y / top * (h - 2 * pad - 10);
      const a = Number.isFinite(ch.a) ? Math.max(L, ch.a) : L, b = Number.isFinite(ch.b) ? Math.min(H, ch.b) : H;
      g.beginPath(); g.moveTo(X(a), Y(0)); for (let i = 0; i <= 200; i++) { const x = a + (b - a) * i / 200; g.lineTo(X(x), Y(pdf(x))); } g.lineTo(X(b), Y(0)); g.closePath(); g.fillStyle = "rgba(34,211,238,.25)"; g.fill();
      g.strokeStyle = "#22d3ee"; g.lineWidth = 2.5; g.beginPath(); for (let i = 0; i <= 300; i++) { const x = L + (H - L) * i / 300; i ? g.lineTo(X(x), Y(pdf(x))) : g.moveTo(X(x), Y(pdf(x))); } g.stroke();
      g.lineWidth = 1; axisX(g, w, h, L, H, X, pad);
    }
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
