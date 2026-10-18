/* Tests for the desktop app's request handler (no Electron needed): node tests/desktop.test.js */
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createHandler, resolveInside } = require("../desktop/serve");

const ROOT = path.join(__dirname, "..");
const data = fs.mkdtempSync(path.join(os.tmpdir(), "mdsa-"));
const handle = createHandler({ root: ROOT, dataDir: data });
const text = r => Buffer.from(r.body).toString("utf8");

(async () => {
  let r = await handle({ method: "GET", pathname: "/" });
  assert.strictEqual(r.status, 200); assert.match(r.headers["Content-Type"], /text\/html/); assert.match(text(r), /آکادمی ریاضی/);
  r = await handle({ method: "GET", pathname: "/assets/vendor/katex/katex.min.css" });
  assert.strictEqual(r.status, 200); assert.match(r.headers["Content-Type"], /text\/css/);
  r = await handle({ method: "GET", pathname: "/assets/vendor/vazirmatn/Vazirmatn-Variable.woff2" });
  assert.strictEqual(r.headers["Content-Type"], "font/woff2");
  r = await handle({ method: "GET", pathname: "/solver.html?x=1" });
  assert.strictEqual(r.status, 200);
  r = await handle({ method: "GET", pathname: "/nope.html" });
  assert.strictEqual(r.status, 404);
  for (const bad of ["/../../etc/passwd", "/%2e%2e/%2e%2e/etc/passwd", "/..%2f..%2fsecret", "/a%00b", "/%E0%A4%A"]) {
    const p = resolveInside(ROOT, bad);
    assert.ok(p === null || p.startsWith(ROOT + path.sep), "path stays inside app root: " + bad);
    r = await handle({ method: "GET", pathname: bad });
    assert.ok(r.status === 403 || r.status === 404, "outside files never served: " + bad + " got " + r.status);
  }
  assert.strictEqual(resolveInside(ROOT, "/../x"), path.join(ROOT, "x"));   /* normalized inside root */
  r = await handle({ method: "GET", pathname: "/api/progress" });
  assert.strictEqual(r.status, 200); assert.deepStrictEqual(JSON.parse(text(r)), {});
  const S = { done: ["numbers"], correct: 3, notes: "یادداشت", activity: { "2026-10-18": 2 } };
  r = await handle({ method: "POST", pathname: "/api/progress", body: Buffer.from(JSON.stringify(S)) });
  assert.strictEqual(r.status, 200);
  r = await handle({ method: "GET", pathname: "/api/progress" });
  assert.deepStrictEqual(JSON.parse(text(r)), S);
  r = await handle({ method: "POST", pathname: "/api/progress", body: Buffer.from("[1,2]") });
  assert.strictEqual(r.status, 400);
  r = await handle({ method: "POST", pathname: "/api/progress", body: Buffer.from("not json") });
  assert.strictEqual(r.status, 400);
  r = await handle({ method: "POST", pathname: "/api/progress", body: Buffer.alloc(2000001, 32) });
  assert.strictEqual(r.status, 413);
  r = await handle({ method: "POST", pathname: "/index.html", body: Buffer.from("{}") });
  assert.strictEqual(r.status, 405);
  fs.rmSync(data, { recursive: true, force: true });
  console.log("PASS: desktop handler tests");
})().catch(e => { console.error("FAIL:", e.message); process.exit(1); });
