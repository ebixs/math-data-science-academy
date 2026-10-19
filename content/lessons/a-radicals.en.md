## Roots as exponents

Square roots appear in distances (Pythagoras), standard deviations ($\sigma = \sqrt{\text{variance}}$), and the "square-root law" of statistics: the error of an average shrinks like $\dfrac{1}{\sqrt n}$. Writing roots as **fractional exponents** lets you use every exponent rule you already know.

:::why $a^{1/2}$ must be $\sqrt a$
The power rule says $(a^{1/2})^2 = a^{1/2 \cdot 2} = a$. So $a^{1/2}$ is a number whose square is $a$ — that is the square root. In the same way $a^{1/3} = \sqrt[3]{a}$ and $a^{m/n} = \sqrt[n]{a^m} = (\sqrt[n]{a})^m$.
:::

## Rules

:::def Radical rules (for $a, b \ge 0$)
$$\sqrt{ab} = \sqrt a\,\sqrt b,\qquad \sqrt{\frac ab} = \frac{\sqrt a}{\sqrt b},\qquad \sqrt{a^2} = |a|.$$
:::

**Simplifying**: pull out the largest perfect square. $\sqrt{50} = 5\sqrt2$, $\sqrt{12x^3} = 2x\sqrt{3x}$ (for $x \ge 0$).

**Like radicals** combine: $3\sqrt2 + 5\sqrt2 = 8\sqrt2$, and $\sqrt{18} + \sqrt{8} = 3\sqrt2 + 2\sqrt2 = 5\sqrt2$.

:::example Rationalizing the denominator
Simplify $\dfrac{6}{\sqrt3}$ and $\dfrac{4}{3 - \sqrt5}$.
---
$\dfrac{6}{\sqrt3}\cdot\dfrac{\sqrt3}{\sqrt3} = \dfrac{6\sqrt3}{3} = 2\sqrt3$.

Multiply by the **conjugate** $3 + \sqrt5$: $\dfrac{4(3 + \sqrt5)}{9 - 5} = 3 + \sqrt5$.
:::

:::example Fractional exponents
Evaluate $32^{3/5}$ and simplify $\dfrac{x^{1/2} \cdot x^{3/4}}{x^{1/4}}$.
---
$32^{3/5} = (\sqrt[5]{32})^3 = 2^3 = 8$. Exponents: $\tfrac12 + \tfrac34 - \tfrac14 = 1$, so the answer is $x$.
:::

## Radical equations

Isolate the radical, square both sides, solve — and **check**, because squaring can introduce false solutions.

:::example
Solve $\sqrt{x + 7} = x - 5$.
---
Square: $x + 7 = x^2 - 10x + 25 \Rightarrow x^2 - 11x + 18 = 0 \Rightarrow (x - 9)(x - 2) = 0$.
Check $x = 9$: $\sqrt{16} = 4 = 9 - 5$ ✓. Check $x = 2$: $\sqrt9 = 3$ but $2 - 5 = -3$ ✗. Only $x = 9$.
:::

:::graph The square-root function
f: a*sqrt(x - h)
range: -2,10
params: a=1:-2:3; h=0:-2:4
:::

## Common mistakes

:::mistake $\sqrt{a + b} = \sqrt a + \sqrt b$
$\sqrt{9 + 16} = 5$, but $3 + 4 = 7$.
:::

:::mistake Skipping the check
Squaring both sides can create extraneous roots; always substitute back.
:::

:::mistake $\sqrt{x^2} = x$
It is $|x|$. For $x = -3$: $\sqrt9 = 3 \ne -3$.
:::

## Try it yourself

:::try
Simplify $\sqrt{75} - 2\sqrt{12}$.
---
$5\sqrt3 - 4\sqrt3 = \sqrt3$.
:::

:::try
Evaluate $(\tfrac{8}{27})^{-2/3}$.
---
$(\tfrac{27}{8})^{2/3} = (\tfrac32)^2 = \tfrac94$.
:::

:::try
Solve $\sqrt{2x - 1} = 3$.
---
$2x - 1 = 9$, $x = 5$ (check: $\sqrt9 = 3$ ✓).
:::

:::ds In data science
The standard error of a mean is $\dfrac{\sigma}{\sqrt n}$: to halve the uncertainty you need **four times** as much data. Root-mean-square error $\sqrt{\tfrac1n\sum e_i^2}$ brings squared errors back to the original units.
:::

## Summary

- $\sqrt[n]{a} = a^{1/n}$ and $a^{m/n} = (\sqrt[n]a)^m$; all exponent rules apply.
- Simplify by extracting perfect powers; rationalize with conjugates.
- Isolate, square, solve, check.
