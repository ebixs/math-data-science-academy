#!/usr/bin/env python3
"""Regenerate the service worker's precache list (sw.js) from the app's files.
Run after adding or renaming app files:  python3 scripts/build_sw.py"""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
VERSION = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]


def rel(paths):
    return [p.relative_to(ROOT).as_posix() for p in sorted(paths)]


files = ["./", "index.html", "solver.html", "math-tools.html", "python.html", "manifest.webmanifest", "assets/theme.css", "assets/i18n.js", "assets/pwa.js"]
for folder in ["solver", "learn", "tools", "python", "app", "curriculum"]:
    files += rel((ROOT / "assets" / folder).glob("*.js"))
files += rel((ROOT / "assets/learn").glob("*.css"))
files += rel((ROOT / "assets/data").glob("*.csv"))
files += ["assets/vendor/katex/katex.min.css", "assets/vendor/katex/katex.min.js", "assets/vendor/nerdamer/nerdamer.min.js"]
files += rel((ROOT / "assets/vendor/katex/fonts").glob("*.woff2"))
files += rel((ROOT / "assets/vendor/vazirmatn").glob("*.woff2"))
files += rel((ROOT / "assets/icons").glob("*.png"))
missing = [f for f in files if f != "./" and not (ROOT / f).exists()]
if missing:
    raise SystemExit("missing files: " + ", ".join(missing))

sw = (ROOT / "sw.js").read_text(encoding="utf-8")
sw = re.sub(r'const VERSION = "[^"]*";', f'const VERSION = "mdsa-v{VERSION}";', sw)
sw = re.sub(r"const SHELL = \[.*?\];", "const SHELL = " + json.dumps(files, ensure_ascii=False, indent=1) + ";", sw, flags=re.S)
(ROOT / "sw.js").write_text(sw, encoding="utf-8")
print(f"sw.js updated: {len(files)} files, cache mdsa-v{VERSION}")
