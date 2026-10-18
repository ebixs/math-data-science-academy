/* Offline service worker: precaches the app shell, serves same-origin files cache-first
   (refreshing in the background), and caches fonts / Pyodide from CDNs after first use.
   Bump VERSION when releasing so clients pick up new files. */
const VERSION = "mdsa-v1.0.0";
const SHELL = [
 "./",
 "index.html",
 "solver.html",
 "math-tools.html",
 "python.html",
 "manifest.webmanifest",
 "assets/theme.css",
 "assets/pwa.js",
 "assets/solver/algebra.js",
 "assets/solver/calculus.js",
 "assets/solver/core.js",
 "assets/solver/generators.js",
 "assets/solver/graph.js",
 "assets/solver/matrix.js",
 "assets/solver/stats.js",
 "assets/solver/ui.js",
 "assets/learn/extra.js",
 "assets/learn/review-bank.js",
 "assets/tools/manipulatives.js",
 "assets/python/notebook.js",
 "assets/vendor/katex/katex.min.css",
 "assets/vendor/katex/katex.min.js",
 "assets/vendor/nerdamer/nerdamer.min.js",
 "assets/vendor/katex/fonts/KaTeX_AMS-Regular.woff2",
 "assets/vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff2",
 "assets/vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff2",
 "assets/vendor/katex/fonts/KaTeX_Fraktur-Bold.woff2",
 "assets/vendor/katex/fonts/KaTeX_Fraktur-Regular.woff2",
 "assets/vendor/katex/fonts/KaTeX_Main-Bold.woff2",
 "assets/vendor/katex/fonts/KaTeX_Main-BoldItalic.woff2",
 "assets/vendor/katex/fonts/KaTeX_Main-Italic.woff2",
 "assets/vendor/katex/fonts/KaTeX_Main-Regular.woff2",
 "assets/vendor/katex/fonts/KaTeX_Math-BoldItalic.woff2",
 "assets/vendor/katex/fonts/KaTeX_Math-Italic.woff2",
 "assets/vendor/katex/fonts/KaTeX_SansSerif-Bold.woff2",
 "assets/vendor/katex/fonts/KaTeX_SansSerif-Italic.woff2",
 "assets/vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2",
 "assets/vendor/katex/fonts/KaTeX_Script-Regular.woff2",
 "assets/vendor/katex/fonts/KaTeX_Size1-Regular.woff2",
 "assets/vendor/katex/fonts/KaTeX_Size2-Regular.woff2",
 "assets/vendor/katex/fonts/KaTeX_Size3-Regular.woff2",
 "assets/vendor/katex/fonts/KaTeX_Size4-Regular.woff2",
 "assets/vendor/katex/fonts/KaTeX_Typewriter-Regular.woff2",
 "assets/vendor/vazirmatn/Vazirmatn-Variable.woff2",
 "assets/icons/apple-touch-icon.png",
 "assets/icons/favicon-32.png",
 "assets/icons/icon-192.png",
 "assets/icons/icon-512.png",
 "assets/icons/maskable-512.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== "mdsa-runtime").map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (url.pathname.startsWith("/api/")) return;              /* progress API: always network */
    e.respondWith(caches.open(VERSION).then(async cache => {
      const hit = await cache.match(req, { ignoreSearch: true });
      const net = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
      if (hit) { e.waitUntil(net); return hit; }
      const res = await net; return res || (req.mode === "navigate" ? cache.match("index.html") : Response.error());
    }));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname) || url.hostname === "cdn.jsdelivr.net") {
    e.respondWith(caches.open("mdsa-runtime").then(async cache => {
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req); if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()); return res;
    }));
  }
});
