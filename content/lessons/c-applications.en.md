## Finding the best

What price maximizes profit? What dimensions minimize material? Which parameter minimizes a model's error? At a smooth maximum or minimum, the graph is momentarily flat, so the derivative is zero. That simple observation turns optimization into equation solving.

## Increasing, decreasing, critical points

:::def Using $f'$
- $f' > 0$ on an interval → $f$ increasing; $f' < 0$ → decreasing.
- A **critical point** is where $f'(x) = 0$ or $f'$ is undefined. Local maxima and minima can only occur there (or at endpoints).
:::

:::def First derivative test
If $f'$ changes from $+$ to $-$ at $c$: local **maximum**. From $-$ to $+$: local **minimum**. No sign change: neither (e.g. $x^3$ at 0).
:::

:::def Second derivative and concavity
$f'' > 0$: concave up (cup, slopes increasing); $f'' < 0$: concave down. **Second derivative test**: at a critical point, $f''(c) > 0$ → minimum, $f''(c) < 0$ → maximum. **Inflection points** are where concavity changes.
:::

:::example Curve sketching
Analyse $f(x) = x^3 - 3x^2 - 9x + 5$.
---
$f'(x) = 3x^2 - 6x - 9 = 3(x - 3)(x + 1)$: critical points $-1$ and $3$.
$f''(x) = 6x - 6$: $f''(-1) = -12 < 0$ → local max $f(-1) = 10$; $f''(3) = 12 > 0$ → local min $f(3) = -22$.
Inflection at $x = 1$. Increasing on $(-\infty, -1)$ and $(3, \infty)$, decreasing on $(-1, 3)$.
:::

:::graph A cubic, its derivative and second derivative
f: x^3 - 3*x^2 - 9*x + 5
g: 3*x^2 - 6*x - 9
h: 6*x - 6
range: -4,6
:::

## Optimization problems

:::tip A recipe
1. Draw and name the variables.
2. Write the quantity to optimize as a function of **one** variable (use the constraint).
3. Find the domain.
4. Differentiate, solve $f' = 0$.
5. Compare critical points and endpoints; answer the question asked.
:::

:::example An open box
From a $30\times30$ cm sheet, cut squares of side $x$ from the corners and fold up. Which $x$ maximizes the volume?
---
$V(x) = x(30 - 2x)^2$, $0 < x < 15$. $V'(x) = (30 - 2x)^2 - 4x(30 - 2x) = (30 - 2x)(30 - 6x)$. Critical: $x = 5$ (inside), $x = 15$ (endpoint). $V(5) = 5\cdot400 = 2000$ cm³ — the maximum.
:::

:::example Profit
Demand $q = 200 - 4p$; cost per unit 10. Price for maximum profit?
---
$\Pi(p) = (p - 10)(200 - 4p) = -4p^2 + 240p - 2000$. $\Pi' = -8p + 240 = 0 \Rightarrow p = 30$, profit 1600.
:::

## Common mistakes

:::mistake $f'(c) = 0$ means extremum
$x^3$ has $f'(0) = 0$ but no extremum. Check the sign change or $f''$.
:::

:::mistake Ignoring endpoints
On a closed interval, the absolute max/min may be at an endpoint.
:::

## Try it yourself

:::try
Local extrema of $f(x) = x^4 - 8x^2$.
---
$f' = 4x(x^2 - 4)$: $x = 0$ (max, $f = 0$), $x = \pm2$ (min, $f = -16$).
:::

:::try
Two positive numbers sum to 20. Maximize their product.
---
$x(20 - x)$, max at $x = 10$: product 100.
:::

:::ds In data science
Training a model = finding a minimum of the loss. For simple models we can set the derivative to zero (the mean minimizes squared error, the median absolute error); for complex ones we use gradient descent, which follows $-f'$ downhill.
:::

## Summary

- Critical points: $f' = 0$; classify by sign change or $f''$.
- $f''$ gives concavity and inflection points.
- Optimization: one-variable function → derivative → compare candidates.
