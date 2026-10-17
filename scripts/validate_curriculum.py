#!/usr/bin/env python3
"""Lightweight structural QA for the Math & Data Science Academy repository."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
CHAPTERS = [
    "00-arithmetic-foundations.md",
    "01-algebra-and-modeling.md",
    "02-geometry-and-measurement.md",
    "03-probability-and-statistics.md",
    "04-linear-algebra.md",
    "05-python-data-analysis.md",
    "06-calculus-optimization.md",
    "07-sql-for-data-analysis.md",
    "08-machine-learning-foundations.md",
    "09-exploratory-data-analysis.md",
    "10-feature-engineering-model-evaluation.md",
    "11-inferential-statistics-ab-testing.md",
    "12-probability-distributions-simulation.md",
]
REQUIRED_MARKERS = {
    "end-of-chapter assessment": re.compile(r"آزمون پایان فصل|آزمون پایانی|آزمون پایان"),
    "answer key": re.compile(r"پاسخ‌نامه|پاسخنامه|پاسخ آزمون|پاسخ کوتاه آزمون"),
    "project": re.compile(r"پروژه"),
}
errors = []
warnings = []

for filename in CHAPTERS:
    path = ROOT / "chapters" / filename
    if not path.is_file():
        errors.append(f"Missing chapter: {path.relative_to(ROOT)}")
        continue
    text = path.read_text(encoding="utf-8")
    fences = len(re.findall(r"^\s*```", text, re.MULTILINE))
    if fences % 2:
        errors.append(f"{filename}: unbalanced Markdown code fences ({fences})")
    for label, pattern in REQUIRED_MARKERS.items():
        if not pattern.search(text):
            errors.append(f"{filename}: missing {label} marker")
    if re.search(r"TODO|FIXME|PLACEHOLDER|Lorem ipsum", text, re.IGNORECASE):
        warnings.append(f"{filename}: placeholder marker found")
    if len(text.strip()) < 1500:
        warnings.append(f"{filename}: unusually short chapter ({len(text)} characters)")

index = ROOT / "index.html"
if not index.is_file():
    errors.append("Missing index.html")
else:
    html = index.read_text(encoding="utf-8")
    for number in range(13):
        chapter = f"{number:02d}-"
        if chapter not in html:
            warnings.append(f"index.html: no visible reference to chapter prefix {chapter}")

readme = ROOT / "README.md"
if not readme.is_file():
    warnings.append("Missing README.md")

for item in warnings:
    print(f"WARNING: {item}")
for item in errors:
    print(f"ERROR: {item}")

if errors:
    print(f"FAIL: {len(errors)} error(s), {len(warnings)} warning(s)")
    sys.exit(1)
print(f"PASS: checked {len(CHAPTERS)} chapter files and core structure; {len(warnings)} warning(s)")
