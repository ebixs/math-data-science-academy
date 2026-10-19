## Adding up infinitely many small pieces

If you know a car's speed at every moment, how far did it travel? If you know a probability density, what's the chance of landing in an interval? Both questions ask for the **area under a curve**. The integral computes it by adding up infinitely many thin rectangles — and the **fundamental theorem of calculus** says this is just "undoing" a derivative.

## The definite integral

:::def Riemann sums and the definite integral
Split $[a, b]$ into $n$ strips of width $\Delta x$ and add $f(x_i)\Delta x$. As $n\to\infty$:
$$\int_a^b f(x)\,dx = \lim_{n\to\infty}\sum_{i=1}^n f(x_i)\,\Delta x.$$
It's the **signed** area: parts below the axis count negative.
:::

:::graph Area accumulated from 0 to x (pink curve) grows at the rate f(x)
f: 0.5*x^2 + 1
g: x^3/6 + x
range: -1,4
:::

## Antiderivatives

:::def Antiderivative
$F$ is an antiderivative of $f$ if $F' = f$. The **indefinite integral** $\int f(x)\,dx = F(x) + C$ collects all of them ($C$ is any constant, since constants have derivative 0).
:::

| $f(x)$ | $\int f(x)\,dx$ |
|---|---|
| $x^n$ ($n \ne -1$) | $\dfrac{x^{n+1}}{n + 1} + C$ |
| $\dfrac1x$ | $\ln\lvert x\rvert + C$ |
| $e^{kx}$ | $\dfrac1ke^{kx} + C$ |
| $\sin x$ | $-\cos x + C$ |
| $\cos x$ | $\sin x + C$ |

## The fundamental theorem

:::def Fundamental theorem of calculus
If $F' = f$ (and $f$ is continuous), then
$$\int_a^b f(x)\,dx = F(b) - F(a).$$
Also, $\dfrac{d}{dx}\displaystyle\int_a^x f(t)\,dt = f(x)$.
:::

:::why Why derivatives and areas are linked
Let $A(x)$ be the area from $a$ to $x$. Increasing $x$ by a tiny $h$ adds a thin strip of area $\approx f(x)\,h$. So $\dfrac{A(x + h) - A(x)}{h} \approx f(x)$: the rate at which area grows is the height of the curve. Area is an antiderivative.
:::

:::example
$\displaystyle\int_1^3 (3x^2 - 2x)\,dx$.
---
$F(x) = x^3 - x^2$. $F(3) - F(1) = (27 - 9) - (1 - 1) = 18$.
:::

:::example Distance from speed
A car's speed is $v(t) = 20 + 6t$ m/s. Distance in the first 5 s?
---
$\int_0^5 (20 + 6t)\,dt = [20t + 3t^2]_0^5 = 100 + 75 = 175$ m.
:::

:::example Probability as area
$f(x) = 2x$ on $[0, 1]$ is a density. $P(X \le 0.5)$?
---
$\int_0^{0.5}2x\,dx = [x^2]_0^{0.5} = 0.25$.
:::

## Common mistakes

:::mistake Forgetting $+C$
Indefinite integrals need $+C$; definite ones don't (it cancels).
:::

:::mistake Area vs integral
$\int_0^{2\pi}\sin x\,dx = 0$, but the total area between the curve and the axis is 4. For area, split where $f$ changes sign.
:::

:::mistake $\int x^{-1}dx = \dfrac{x^0}{0}$
The power rule fails at $n = -1$; the answer is $\ln|x|$.
:::

## Try it yourself

:::try
$\displaystyle\int (4x^3 - \tfrac{2}{x} + e^{2x})\,dx$.
---
$x^4 - 2\ln|x| + \tfrac12e^{2x} + C$.
:::

:::try
$\displaystyle\int_0^{\pi}\sin x\,dx$.
---
$[-\cos x]_0^\pi = 1 + 1 = 2$.
:::

:::ds In data science
Probabilities, expected values $E[X] = \int x f(x)\,dx$ and the area under the ROC curve (AUC) are integrals. Numerically, `np.trapz(y, x)` (the trapezoid rule) or `scipy.integrate.quad(f, a, b)` approximate them.
:::

## Summary

- $\int_a^b f$ = limit of Riemann sums = signed area.
- Antiderivatives reverse derivatives (+C).
- $\int_a^b f = F(b) - F(a)$.
