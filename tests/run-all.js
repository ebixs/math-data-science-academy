/* Cross-platform test runner (works on Windows too): runs the engine and learning tests in both languages
   and the desktop handler tests. Usage: node tests/run-all.js  (or npm test) */
"use strict";
const { spawnSync } = require("child_process");
const path = require("path");
const runs = [
  ["engine.test.js", "fa"], ["engine.test.js", "en"],
  ["learn.test.js", "fa"], ["learn.test.js", "en"],
  ["desktop.test.js", "fa"],
];
let failed = 0;
for (const [file, lang] of runs) {
  const r = spawnSync(process.execPath, [path.join(__dirname, file)], { stdio: "inherit", env: Object.assign({}, process.env, { MDSA_LANG: lang }) });
  if (r.status !== 0) { failed++; console.error("✗ " + file + " [" + lang + "] failed"); }
}
process.exit(failed ? 1 : 0);
