# Datasets / مجموعه‌داده‌ها

Small, real datasets bundled for the Python projects (they load offline inside the notebook as `data/<name>.csv`).

| File | Rows | What it is | Source and license |
|---|---|---|---|
| `iris.csv` | 150 | Sepal/petal measurements of three iris species (Fisher, 1936) | UCI Machine Learning Repository, CC BY 4.0; exported from scikit-learn |
| `wine.csv` | 178 | Chemical analysis of wines from three cultivars in Italy | UCI Machine Learning Repository, CC BY 4.0; exported from scikit-learn |
| `diabetes.csv` | 442 | Ten baseline variables and a disease-progression score one year later (Efron, Hastie, Johnstone & Tibshirani, 2004, *Least Angle Regression*) | Distributed with scikit-learn (BSD-3-Clause); unscaled version. Columns: `sex` is coded 1/2; `tc, ldl, hdl, tch, ltg, glu` are blood serum measurements |
| `co2_monthly.csv` | 526 | Monthly mean atmospheric CO₂ (ppm) at Mauna Loa, March 1958 – December 2001 | Keeling & Whorf, Scripps/CDIAC; public domain (via statsmodels). Weekly values averaged per month; a few missing months are linearly interpolated |

These files are for learning. Do not use the diabetes data for medical decisions.
