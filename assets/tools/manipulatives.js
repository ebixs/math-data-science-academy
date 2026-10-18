/* Hands-on manipulatives for math-tools.html: pattern blocks, base-ten number pieces,
   algebra tiles and an area-model (partial products) multiplication finder. Original designs. */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const NS = "http://www.w3.org/2000/svg";
  const fa = n => new Intl.NumberFormat("fa-IR").format(n);
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const svgPoint = (svg, ev) => { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };

  /* ================= 1. Pattern blocks ================= */
  const S = 46; /* side length */
  const h3 = Math.sqrt(3) / 2;
  const SHAPES = {
    hex: { name: "شش‌ضلعی", color: "#fbbf24", tri: 6, pts: [[S, 0], [S / 2, S * h3], [-S / 2, S * h3], [-S, 0], [-S / 2, -S * h3], [S / 2, -S * h3]] },
    trap: { name: "ذوزنقه", color: "#fb7185", tri: 3, pts: [[S, 0], [S / 2, S * h3], [-S / 2, S * h3], [-S, 0]].map(([x, y]) => [x, y - S * h3 / 2]) },
    rhom: { name: "لوزی", color: "#38bdf8", tri: 2, pts: [[0, -S * h3], [S / 2, 0], [0, S * h3], [-S / 2, 0]].map(([x, y]) => [x * 1, y]) },
    tri: { name: "مثلث", color: "#4ade80", tri: 1, pts: [[0, -S * h3 * 2 / 3], [S / 2, S * h3 / 3], [-S / 2, S * h3 / 3]] },
    sq: { name: "مربع", color: "#fb923c", tri: null, pts: [[-S / 2, -S / 2], [S / 2, -S / 2], [S / 2, S / 2], [-S / 2, S / 2]] },
    thin: { name: "لوزی باریک", color: "#e9d5a6", tri: null, pts: [[0, -S * Math.cos(Math.PI / 12)], [S * Math.sin(Math.PI / 12), 0], [0, S * Math.cos(Math.PI / 12)], [-S * Math.sin(Math.PI / 12), 0]] },
  };
  function patternBlocks() {
    const svg = $("pbBoard"); if (!svg) return;
    let pieces = [], sel = null, drag = null, idc = 0;
    $("pbPalette").innerHTML = Object.entries(SHAPES).map(([k, s]) => `<button class="btn alt pb-btn" data-shape="${k}" title="${s.name}"><svg viewBox="-50 -50 100 100" width="34" height="34"><polygon points="${s.pts.map(p => p.join(",")).join(" ")}" fill="${s.color}" stroke="#0a1524" stroke-width="2"/></svg><span>${s.name}</span></button>`).join("");
    $("pbPalette").querySelectorAll("[data-shape]").forEach(b => b.onclick = () => { const vb = svg.viewBox.baseVal; pieces.push({ id: ++idc, k: b.dataset.shape, x: vb.width / 2 + (Math.random() - .5) * 120, y: vb.height / 2 + (Math.random() - .5) * 80, r: 0 }); sel = idc; draw(); });
    function draw() {
      svg.innerHTML = "";
      const vb = svg.viewBox.baseVal;
      for (let x = 0; x < vb.width; x += 23) for (let y = 0; y < vb.height; y += 23) el("circle", { cx: x, cy: y, r: 1, fill: "rgba(56,189,248,.18)" }, svg);
      pieces.forEach(p => {
        const s = SHAPES[p.k];
        const g = el("g", { transform: `translate(${p.x} ${p.y}) rotate(${p.r})`, "data-id": p.id, style: "cursor:grab" }, svg);
        el("polygon", { points: s.pts.map(q => q.join(",")).join(" "), fill: s.color, stroke: p.id === sel ? "#ffffff" : "#0a1524", "stroke-width": p.id === sel ? 3 : 2, "stroke-linejoin": "round", opacity: .95 }, g);
      });
      const tri = pieces.reduce((t, p) => t + (SHAPES[p.k].tri || 0), 0), other = pieces.filter(p => !SHAPES[p.k].tri).length;
      const hexFrac = tri ? simplifyFrac(tri, 6) : "۰";
      $("pbOut").innerHTML = `تعداد قطعه‌ها: ${fa(pieces.length)} · مساحت بر حسب مثلث سبز: <b>${fa(tri)}</b> · اگر شش‌ضلعی زرد = ۱ باشد، شکل‌های مثلثی برابرند با <b dir="ltr">${hexFrac}</b>${other ? " · (" + fa(other) + " مربع/لوزی باریک در این شمارش نیست)" : ""}`;
    }
    function simplifyFrac(n, d) { const g = (a, b) => b ? g(b, a % b) : a; const k = g(n, d); n /= k; d /= k; if (d === 1) return fa(n); const w = Math.floor(n / d), r = n % d; return (w ? fa(w) + " و " : "") + fa(r) + "/" + fa(d); }
    svg.addEventListener("pointerdown", e => {
      const g = e.target.closest("[data-id]"); if (!g) { sel = null; draw(); return; }
      const id = +g.dataset.id, p = pieces.find(x => x.id === id); sel = id;
      pieces = pieces.filter(x => x.id !== id).concat([p]); /* bring to front */
      const pt = svgPoint(svg, e); drag = { p, dx: pt.x - p.x, dy: pt.y - p.y }; svg.setPointerCapture(e.pointerId); draw();
    });
    svg.addEventListener("pointermove", e => { if (!drag) return; const pt = svgPoint(svg, e); drag.p.x = pt.x - drag.dx; drag.p.y = pt.y - drag.dy; draw(); });
    svg.addEventListener("pointerup", () => { if (drag) { /* snap to grid */ drag.p.x = Math.round(drag.p.x / 11.5) * 11.5; drag.p.y = Math.round(drag.p.y / 11.5) * 11.5; } drag = null; draw(); });
    svg.addEventListener("dblclick", e => { const g = e.target.closest("[data-id]"); if (!g) return; const p = pieces.find(x => x.id === +g.dataset.id); p.r = (p.r + 30) % 360; draw(); });
    const cur = () => pieces.find(x => x.id === sel);
    $("pbRotL").onclick = () => { const p = cur(); if (p) { p.r = (p.r + 330) % 360; draw(); } };
    $("pbRotR").onclick = () => { const p = cur(); if (p) { p.r = (p.r + 30) % 360; draw(); } };
    $("pbDup").onclick = () => { const p = cur(); if (p) { pieces.push({ ...p, id: ++idc, x: p.x + 30, y: p.y + 30 }); sel = idc; draw(); } };
    $("pbDel").onclick = () => { if (sel) { pieces = pieces.filter(x => x.id !== sel); sel = null; draw(); } };
    $("pbClear").onclick = () => { pieces = []; sel = null; draw(); };
    document.addEventListener("keydown", e => { if (!sel || document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return; if (e.key === "Delete" || e.key === "Backspace") { $("pbDel").click(); } if (e.key === "r" || e.key === "R") $("pbRotR").click(); });
    draw();
  }

  /* ================= 2. Base-ten number pieces ================= */
  function numberPieces() {
    const svg = $("npBoard"); if (!svg) return;
    let c = { h: 1, t: 3, o: 5 };
    function draw() {
      svg.innerHTML = "";
      const W = 600, H = 300; svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      const cols = [["h", "صدگان", 20, 230], ["t", "دهگان", 260, 190], ["o", "یکان", 460, 120]];
      cols.forEach(([k, name, x0, w]) => {
        el("rect", { x: x0 - 8, y: 8, width: w, height: H - 16, rx: 12, fill: "rgba(255,255,255,.02)", stroke: "rgba(56,189,248,.18)" }, svg);
        const t = el("text", { x: x0 + w / 2 - 8, y: 30, "text-anchor": "middle", fill: "#8aa0bb", "font-size": 14 }, svg); t.textContent = name + " (" + fa(c[k]) + ")";
      });
      const u = 8.5;
      for (let i = 0; i < c.h; i++) { const x = 24 + (i % 2) * 100, y = 44 + Math.floor(i / 2) * 92; if (y > H - 30) break; const g = el("g", { "data-k": "h", style: "cursor:pointer" }, svg); el("rect", { x, y, width: u * 10, height: u * 10, fill: "#22d3ee", opacity: .9, rx: 2 }, g); for (let j = 1; j < 10; j++) { el("line", { x1: x + j * u, y1: y, x2: x + j * u, y2: y + u * 10, stroke: "#0a1524", "stroke-width": .6 }, g); el("line", { x1: x, y1: y + j * u, x2: x + u * 10, y2: y + j * u, stroke: "#0a1524", "stroke-width": .6 }, g); } }
      for (let i = 0; i < c.t; i++) { const x = 262 + (i % 9) * 19, y = 44 + Math.floor(i / 9) * 92; if (y > H - 30) break; const g = el("g", { "data-k": "t", style: "cursor:pointer" }, svg); el("rect", { x, y, width: u, height: u * 10, fill: "#f472b6", rx: 2 }, g); for (let j = 1; j < 10; j++) el("line", { x1: x, y1: y + j * u, x2: x + u, y2: y + j * u, stroke: "#0a1524", "stroke-width": .6 }, g); }
      for (let i = 0; i < c.o; i++) { const x = 464 + (i % 5) * 20, y = 44 + Math.floor(i / 5) * 20; if (y > H - 20) break; const g = el("g", { "data-k": "o", style: "cursor:pointer" }, svg); el("rect", { x, y, width: u * 1.6, height: u * 1.6, fill: "#a3e635", rx: 2 }, g); }
      const total = c.h * 100 + c.t * 10 + c.o;
      $("npOut").innerHTML = `${fa(c.h)} صدتایی + ${fa(c.t)} ده‌تایی + ${fa(c.o)} یکی = <b>${fa(total)}</b>` + (c.t >= 10 || c.o >= 10 ? " · می‌توانی ۱۰ قطعهٔ هم‌نوع را با «گروه‌بندی» عوض کنی." : "");
    }
    svg.addEventListener("click", e => { const g = e.target.closest("[data-k]"); if (!g) return; const k = g.dataset.k; if (k === "h") { c.h--; c.t += 10; } else if (k === "t") { c.t--; c.o += 10; } draw(); });
    document.querySelectorAll("[data-np]").forEach(b => b.onclick = () => { const k = b.dataset.np; if (k.startsWith("-")) { const kk = k.slice(1); if (c[kk] > 0) c[kk]--; } else c[k] = Math.min(c[k] + 1, k === "h" ? 9 : 40); draw(); });
    $("npGroup").onclick = () => { while (c.o >= 10) { c.o -= 10; c.t++; } while (c.t >= 10 && c.h < 9) { c.t -= 10; c.h++; } draw(); };
    $("npBuild").onclick = () => { const n = Math.max(0, Math.min(999, parseInt(String($("npNum").value).replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)), 10) || 0)); c = { h: Math.floor(n / 100), t: Math.floor(n / 10) % 10, o: n % 10 }; draw(); };
    $("npClear").onclick = () => { c = { h: 0, t: 0, o: 0 }; draw(); };
    draw();
  }

  /* ================= 3. Algebra tiles ================= */
  function algebraTiles() {
    const box = $("atBoard"); if (!box) return;
    let tiles = [{ k: "x2", s: 1 }, { k: "x", s: 1 }, { k: "x", s: 1 }, { k: "x", s: 1 }, { k: "1", s: 1 }, { k: "1", s: 1 }];
    const exprOf = () => { const n = { x2: 0, x: 0, 1: 0 }; tiles.forEach(t => n[t.k] += t.s); return n; };
    const fmt = n => { const parts = []; const add = (c, b) => { if (!c) return; const a = Math.abs(c), sgn = c < 0 ? "−" : "+"; parts.push({ sgn, s: (a === 1 && b ? "" : a) + b }); }; add(n.x2, "x²"); add(n.x, "x"); add(n[1], ""); if (!parts.length) return "0"; return parts.map((p, i) => (i === 0 ? (p.sgn === "−" ? "−" : "") : " " + p.sgn + " ") + p.s).join(""); };
    function draw() {
      const order = { x2: 0, x: 1, 1: 2 };
      const sorted = tiles.map((t, i) => ({ ...t, i })).sort((a, b) => order[a.k] - order[b.k] || b.s - a.s);
      box.innerHTML = sorted.map(t => `<button class="tile t-${t.k} ${t.s < 0 ? "neg" : ""}" data-i="${t.i}" title="برای حذف کلیک کن" aria-label="${t.s < 0 ? "منفی " : ""}${t.k === "x2" ? "x²" : t.k}">${t.s < 0 ? "−" : ""}${t.k === "x2" ? "x²" : t.k}</button>`).join("") || '<span class="muted">کاشی‌ها را از دکمه‌های بالا اضافه کن.</span>';
      box.querySelectorAll("[data-i]").forEach(b => b.onclick = () => { tiles.splice(+b.dataset.i, 1); draw(); });
      const n = exprOf(), raw = { x2: [0, 0], x: [0, 0], 1: [0, 0] }; tiles.forEach(t => raw[t.k][t.s > 0 ? 0 : 1]++);
      const pairs = Math.min(raw.x2[0], raw.x2[1]) + Math.min(raw.x[0], raw.x[1]) + Math.min(raw[1][0], raw[1][1]);
      $("atOut").innerHTML = `عبارت: <bdi dir="ltr" style="direction:ltr;unicode-bidi:isolate;font-weight:700;font-family:Georgia,serif">${fmt(n)}</bdi>` + (pairs ? ` · ${fa(pairs)} جفت صفر (یک کاشی مثبت و منفی هم‌نوع با هم صفر می‌شوند)` : "");
    }
    document.querySelectorAll("[data-at]").forEach(b => b.onclick = () => { const [k, s] = b.dataset.at.split(":"); if (tiles.length < 80) tiles.push({ k, s: +s }); draw(); });
    $("atZero").onclick = () => { ["x2", "x", "1"].forEach(k => { let pos = tiles.filter(t => t.k === k && t.s > 0).length, neg = tiles.filter(t => t.k === k && t.s < 0).length, m = Math.min(pos, neg); for (let r = 0; r < m; r++) { tiles.splice(tiles.findIndex(t => t.k === k && t.s > 0), 1); tiles.splice(tiles.findIndex(t => t.k === k && t.s < 0), 1); } }); draw(); };
    $("atClear").onclick = () => { tiles = []; draw(); };
    $("atBuild").onclick = () => {
      const s = String($("atExpr").value).replace(/\s+/g, "").replace(/−/g, "-").replace(/²/g, "^2");
      const m = s.match(/^([+-]?\d*)x\^2/); let a = 0, b = 0, c = 0, rest = s;
      if (m) { a = m[1] === "" || m[1] === "+" ? 1 : m[1] === "-" ? -1 : +m[1]; rest = s.slice(m[0].length); }
      const m2 = rest.match(/^([+-]?\d*)x(?!\^)/); if (m2) { b = m2[1] === "" || m2[1] === "+" ? 1 : m2[1] === "-" ? -1 : +m2[1]; rest = rest.slice(m2[0].length); }
      if (rest) { if (!/^[+-]?\d+$/.test(rest)) { $("atOut").textContent = "قالب را به شکل ax^2+bx+c بنویس، مثلاً x^2-3x+2"; return; } c = +rest; }
      if (Math.abs(a) + Math.abs(b) + Math.abs(c) > 60) { $("atOut").textContent = "ضریب‌ها برای نمایش با کاشی خیلی بزرگ‌اند."; return; }
      tiles = []; [["x2", a], ["x", b], ["1", c]].forEach(([k, n]) => { for (let i = 0; i < Math.abs(n); i++) tiles.push({ k, s: Math.sign(n) }); }); draw();
    };
    draw();
  }

  /* ================= 4. Area model for multiplication ================= */
  function areaModel() {
    const svg = $("amBoard"); if (!svg) return;
    const parts = n => { const s = String(n); return s.split("").map((d, i) => +d * 10 ** (s.length - 1 - i)).filter(Boolean); };
    function draw() {
      const a = Math.max(1, Math.min(999, parseInt($("amA").value, 10) || 1)), b = Math.max(1, Math.min(999, parseInt($("amB").value, 10) || 1));
      const pa = parts(a), pb = parts(b);
      const W = 560, H = 320, L = 70, T = 40, w = W - L - 20, h = H - T - 20;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.innerHTML = "";
      const sa = pa.reduce((x, y) => x + Math.sqrt(y), 0), sb = pb.reduce((x, y) => x + Math.sqrt(y), 0);
      const colors = ["rgba(34,211,238,.35)", "rgba(244,114,182,.35)", "rgba(163,230,53,.35)", "rgba(251,191,36,.35)", "rgba(192,132,252,.35)"];
      let x = L, rows = [];
      pa.forEach((va, i) => {
        const cw = Math.max(40, w * Math.sqrt(va) / sa); let y = T;
        const lab = el("text", { x: x + cw / 2, y: T - 12, "text-anchor": "middle", fill: "#22d3ee", "font-size": 15, "font-weight": 700 }, svg); lab.textContent = String(va);
        pb.forEach((vb, j) => {
          const rh = Math.max(36, h * Math.sqrt(vb) / sb);
          el("rect", { x, y, width: cw - 3, height: rh - 3, rx: 6, fill: colors[(i + j) % colors.length], stroke: "rgba(230,241,255,.35)" }, svg);
          const t = el("text", { x: x + cw / 2, y: y + rh / 2 + 5, "text-anchor": "middle", fill: "#e6f1ff", "font-size": 14 }, svg); t.textContent = va + "×" + vb + "=" + va * vb;
          if (i === 0) { const lt = el("text", { x: L - 10, y: y + rh / 2 + 5, "text-anchor": "end", fill: "#f472b6", "font-size": 15, "font-weight": 700 }, svg); lt.textContent = String(vb); }
          rows.push(va * vb); y += rh;
        });
        x += cw;
      });
      svg.querySelectorAll("text").forEach(t => t.setAttribute("direction", "ltr"));
      $("amOut").innerHTML = `<span dir="ltr" class="ltr">${a} × ${b} = ${rows.join(" + ")} = <b>${a * b}</b></span><br><span class="note">هر مستطیل یک «حاصل‌ضرب جزئی» است: هر رقم با ارزش مکانی‌اش در هر رقم عدد دیگر ضرب می‌شود؛ مجموع مساحت‌ها جواب ضرب است.</span>`;
    }
    ["amA", "amB"].forEach(id => $(id).addEventListener("input", draw));
    draw();
  }

  patternBlocks(); numberPieces(); algebraTiles(); areaModel();
})();
