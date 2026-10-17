#!/usr/bin/env python3
"""Syntax-check inline JavaScript blocks in every top-level HTML page using Node.js."""
from pathlib import Path
import re
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
if not HTML_FILES:
    print("ERROR: no HTML files found")
    sys.exit(1)

errors = []
checked = 0
for html in HTML_FILES:
    source = html.read_text(encoding="utf-8")
    blocks = re.findall(r"<script\b([^>]*)>(.*?)</script\s*>", source, re.IGNORECASE | re.DOTALL)
    inline = [(attrs, body) for attrs, body in blocks if "src=" not in attrs.lower() and body.strip()]
    if not inline:
        print(f"WARNING: no inline JavaScript blocks in {html.name}")
        continue
    for index, (_, body) in enumerate(inline, start=1):
        checked += 1
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
            errors.append(f"{html.name}, script block {index}:\n{result.stderr.strip()}")

if errors:
    print("\n".join(errors))
    sys.exit(1)

print(f"PASS: JavaScript syntax valid in {checked} inline script block(s) across {len(HTML_FILES)} HTML page(s)")
