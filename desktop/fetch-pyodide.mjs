// Downloads Pyodide plus NumPy, pandas and matplotlib (with dependencies) into
// assets/vendor/pyodide/ so the desktop app's Python notebook works offline.
// Run before packaging:  node desktop/fetch-pyodide.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VERSION = "0.27.8";
const BASE = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "assets", "vendor", "pyodide");
const CORE = ["pyodide.js", "pyodide.asm.js", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];
const WANT = ["numpy", "pandas", "matplotlib"];

async function get(name, attempt = 1) {
  const dest = path.join(OUT, name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return dest;
  try {
    const res = await fetch(BASE + name);
    if (!res.ok) throw new Error(res.status + " " + res.statusText);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log("  ✓", name);
    return dest;
  } catch (e) {
    if (attempt < 4) { await new Promise(r => setTimeout(r, 1500 * attempt)); return get(name, attempt + 1); }
    throw new Error("download failed: " + name + " (" + e.message + ")");
  }
}

fs.mkdirSync(OUT, { recursive: true });
console.log("Pyodide " + VERSION + " → " + path.relative(ROOT, OUT));
for (const f of CORE) await get(f);
const lock = JSON.parse(fs.readFileSync(path.join(OUT, "pyodide-lock.json"), "utf8"));
const pkgs = lock.packages;
const need = new Set();
(function walk(names) {
  for (const n of names) {
    const key = n.toLowerCase();
    if (need.has(key) || !pkgs[key]) continue;
    need.add(key); walk(pkgs[key].depends || []);
  }
})(WANT);
console.log("packages:", [...need].join(", "));
for (const n of need) await get(pkgs[n].file_name);
const total = fs.readdirSync(OUT).reduce((s, f) => s + fs.statSync(path.join(OUT, f)).size, 0);
console.log("done:", (total / 1048576).toFixed(1) + " MB");
