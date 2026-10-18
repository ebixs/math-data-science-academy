/* Request handler for the desktop app's private app:// origin.
   Serves the bundled web files read-only and implements /api/progress (same contract as server.py),
   storing progress in the user's app-data folder. Pure Node — unit-tested without Electron. */
"use strict";
const fs = require("fs");
const path = require("path");

const MAX_BODY = 2000000;
const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json; charset=utf-8", ".md": "text/plain; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf",
  ".wasm": "application/wasm", ".zip": "application/zip", ".whl": "application/zip", ".tar": "application/x-tar", ".map": "application/json",
};

function json(status, payload) {
  return { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, body: Buffer.from(JSON.stringify(payload), "utf8") };
}

/* Resolve a URL path inside root; returns null if it escapes root. */
function resolveInside(root, urlPath) {
  let p;
  try { p = decodeURIComponent(urlPath.split("?")[0].split("#")[0]); } catch (e) { return null; }
  if (p.includes("\0")) return null;
  if (p === "/" || p === "") p = "/index.html";
  const full = path.resolve(root, "." + path.posix.normalize("/" + p));
  const rel = path.relative(root, full);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return full;
}

function createHandler({ root, dataDir }) {
  const progressFile = path.join(dataDir, "progress.json");
  return async function handle({ method, pathname, body }) {
    if (pathname === "/api/progress") {
      if (method === "GET") {
        try {
          if (!fs.existsSync(progressFile)) return json(200, {});
          return json(200, JSON.parse(fs.readFileSync(progressFile, "utf8")));
        } catch (e) { return json(500, { error: "Could not read progress file" }); }
      }
      if (method === "POST") {
        if (!body || body.length === 0 || body.length > MAX_BODY) return json(413, { error: "Invalid payload size" });
        let payload;
        try { payload = JSON.parse(Buffer.from(body).toString("utf8")); } catch (e) { return json(400, { error: "Invalid JSON" }); }
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) return json(400, { error: "Progress must be a JSON object" });
        try {
          fs.mkdirSync(dataDir, { recursive: true });
          const tmp = progressFile + ".tmp";
          fs.writeFileSync(tmp, JSON.stringify(payload, null, 2) + "\n", "utf8");
          fs.renameSync(tmp, progressFile);
          return json(200, { ok: true });
        } catch (e) { return json(500, { error: "Could not save progress" }); }
      }
      return json(405, { error: "Method not allowed" });
    }
    if (method !== "GET" && method !== "HEAD") return json(405, { error: "Method not allowed" });
    const file = resolveInside(root, pathname);
    if (!file) return json(403, { error: "Forbidden" });
    let st;
    try { st = fs.statSync(file); } catch (e) { return { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" }, body: Buffer.from("Not found") }; }
    if (st.isDirectory()) return handle({ method, pathname: pathname.replace(/\/?$/, "/index.html"), body });
    const type = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
    return { status: 200, headers: { "Content-Type": type, "Content-Length": String(st.size), "Cache-Control": "no-cache" }, body: method === "HEAD" ? Buffer.alloc(0) : fs.readFileSync(file) };
  };
}

module.exports = { createHandler, resolveInside, MIME };
