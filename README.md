# Math & Data Science Academy

**English** · [فارسی](README.fa.md)

An offline-first app for learning mathematics **from zero to data science**, in **Persian or English** (switch any time from the top bar). It combines a structured learning path with deep lessons, endless auto-graded practice, spaced review, a step-by-step solver, interactive manipulatives and a real Python notebook with guided data projects.

> **Developer: Ebrahim Salimi** — All publication and usage rights of this software are reserved. Publishing this software without the developer's knowledge is subject to legal action. See [LICENSE](LICENSE).

## Install (macOS and Windows)

Download the latest version from [Releases](https://github.com/ebixs/math-data-science-academy/releases/latest):

- **Windows:** run `Math-Data-Science-Academy-Setup-<version>.exe`. If SmartScreen warns: "More info" → "Run anyway".
- **macOS (Apple Silicon and Intel):** open the `.dmg` and drag the app to Applications. The first time, right-click the app and choose "Open". If it still won't open, run in Terminal:
  `xattr -cr "/Applications/Math Data Science Academy.app"`

The desktop app works fully offline — including the Python notebook with NumPy, pandas and matplotlib — and stores progress in the app's data folder (menu "Help → Progress data folder"). The menu follows the language chosen in the app.

**Install from the browser (PWA):** open the app over `https` or the local server and use "Install" in Chrome/Edge (or the profile menu → "Install the app on this device"). After the first load it works offline.

## What's inside

### Learning path (`index.html`)
- **64 skills in 8 areas** — arithmetic foundations, algebra, geometry & trigonometry, discrete math & logic, probability, statistics, linear algebra, calculus & optimization (including multivariable calculus, gradient descent and convex optimization).
- **Prerequisite map**: every skill lists what it needs and what it unlocks. Three goals — school math, university math, data science & ML — each build a personalized path in prerequisite order.
- **Deep bilingual lessons** for every skill: intuition, definitions, worked examples with hidden solutions, common mistakes, "try it yourself" questions, a data-science connection and **interactive graphs with sliders**. Foundation lessons are the most detailed.
- **Endless auto-graded practice**: a problem generator for every skill (numbers, fractions, expressions, equation sets, inequalities, points and matrices are all checked symbolically/numerically), hints and full step-by-step solutions. **Mastery = 8 correct of your last 10 answers.**
- **Adaptive placement test** (binary search through each area) that marks the skills you already know.
- **Daily review** with spaced repetition (Leitner boxes at 1, 3, 7, 14, 30, 60 days), concept questions and a daily challenge.
- XP, levels, streak heat map, 25 achievements, a progress page per area, notes, JSON backup/restore.

### Python notebook and data projects (`python.html`)
Real Python in the browser (Pyodide) with NumPy, pandas and matplotlib, `.py`/`.ipynb` export, and **six guided projects on real datasets**, each with tasks that are **checked automatically**:

| project | dataset | math used |
|---|---|---|
| Descriptive statistics | diabetes (442 patients) | mean, median, SD, z-scores, correlation |
| Monte Carlo | simulated | combinatorics, birthday problem, CLT |
| Regression from scratch | diabetes | loss, partial derivatives, gradient descent, normal equations |
| PCA | wine (178 samples, 13 features) | covariance, eigenvectors, SVD |
| CO₂ trend | Mauna Loa monthly CO₂ 1958–2001 | least squares, derivatives, seasonality |
| k-nearest neighbours | iris | distances, accuracy, confusion matrix |

Dataset sources and licenses: [assets/data/README.md](assets/data/README.md).

### Step-by-step solver (`solver.html`)
Arithmetic, algebra (simplify, expand, factor), equations and inequalities of many kinds, systems (Gaussian elimination), calculus (derivatives, integrals, limits, tangents, extrema, Taylor series), matrices (determinant, inverse, RREF, eigenvalues) and statistics — with interactive graphs, a math keyboard, live preview, history and shareable links. Explanations are bilingual.

### Interactive tools (`math-tools.html`)
Hundred chart, ten frames, fraction bar, number line, clock, money, bead rack, geoboard, vocabulary cards, scratchpad, pattern blocks, base-ten blocks, algebra tiles and the area model of multiplication.

## Run from source

Requirements: Python 3 (no extra packages).

```bash
./start_local.command        # macOS (or: python3 server.py)
start_local.bat              # Windows
```

Then open http://127.0.0.1:8000. With the local server, progress is also saved to `data/progress.json` (don't commit that file).

### Build the desktop app

Requirements: Node.js 22.

```bash
npm install
npm start                        # run the desktop app
node desktop/fetch-pyodide.mjs   # optional: offline Python for the notebook
npm run dist:mac                 # or dist:win
```

Changing `version` in `package.json` and pushing to `main` makes GitHub Actions build the macOS and Windows installers and publish a release.

## Editing lessons

Lessons live in `content/lessons/<skill-id>.<fa|en>.md` (Markdown + KaTeX math + teaching blocks such as `:::def`, `:::example … --- …`, `:::mistake`, `:::try`, `:::graph`). After editing, rebuild the bundle:

```bash
python3 scripts/build_content.py
```

## Tests

```bash
node tests/engine.test.js && MDSA_LANG=en node tests/engine.test.js   # solver: answers + KaTeX for every step
node tests/learn.test.js  && MDSA_LANG=en node tests/learn.test.js    # curriculum, every lesson, every practice generator
node tests/desktop.test.js                                            # desktop request handler
python3 scripts/validate_curriculum.py && python3 scripts/check_inline_js.py
python3 -m unittest discover tests                                    # local progress API
```

After adding or renaming app files, run `python3 scripts/build_sw.py` to refresh the offline cache.

## Repository layout

- `index.html` — dashboard, learning path, skill pages, review, achievements, progress
- `assets/app/` — store (progress, mastery, XP) and shell (router, dashboard)
- `assets/curriculum/` — skill graph (`skills.js`) and the generated lesson bundle (`lessons.js`)
- `assets/learn/` — Markdown renderer, answer checker, practice generators, problem UI, review/placement/achievements
- `assets/i18n.js` — language switch and the developer credit shown on every page
- `content/lessons/` — lesson sources in Persian and English
- `solver.html` + `assets/solver/` — step-by-step solver engine
- `python.html` + `assets/python/` — notebook and projects; `assets/data/` — datasets
- `math-tools.html` + `assets/tools/` — manipulatives
- `desktop/` — Electron app; `server.py` — local server; `chapters/` — longer Persian handbooks
- `tests/`, `scripts/` — tests and build tools

## License

© 2026 Ebrahim Salimi. All rights reserved — see [LICENSE](LICENSE). Bundled third-party components keep their own licenses: KaTeX (MIT), nerdamer (Apache-2.0), Vazirmatn (OFL), Pyodide (MPL-2.0).
