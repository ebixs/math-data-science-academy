#!/usr/bin/env python3
"""Syntax-check inline JavaScript blocks in index.html using Node.js."""
from pathlib import Path
import re
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"
if not HTML.is_file():
    print("ERROR: index.html not found")
    sys.exit(1)

source = HTML.read_text(encoding="utf-8")
blocks = re.findall(r"<script\b([^>]*)>(.*?)</script\s*>", source, re.IGNORECASE | re.DOTALL)
inline = [(attrs, body) for attrs, body in blocks if "src=" not in attrs.lower() and body.strip()]
if not inline:
    print("ERROR: no inline JavaScript blocks found")
    sys.exit(1)

errors = []
for index, (_, body) in enumerate(inline, start=1):
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".js") as handle:
        handle.write(body)
        handle.flush()
        result = subprocess.run(
            ["node", "--check", handle.name],
            capture_output=True,
            text=True,
            check=False,
        )
    if result.returncode:
        errors.append(f"Script block {index}:\n{result.stderr.strip()}")

if errors:
    print("\n".join(errors))
    sys.exit(1)

print(f"PASS: JavaScript syntax valid in {len(inline)} inline script block(s)")
