## When the antiderivative isn't obvious

The basic table handles $x^n$, $e^x$, $\sin x$. But $\int xe^{x}\,dx$, $\int 2x\cos(x^2)\,dx$ or $\int \frac{1}{x^2 - 1}dx$ need technique. Each method is a derivative rule run **backwards**: substitution reverses the chain rule, integration by parts reverses the product rule.

## Substitution

:::def $u$-substitution
If the integrand has the form $f(g(x))\,g'(x)$, set $u = g(x)$, $du = g'(x)\,dx$:
$$\int f(g(x))g'(x)\,dx = \int f(u)\,du.$$
For definite integrals, change the limits too.
:::

:::example
$\displaystyle\int 2x\cos(x^2)\,dx$.
---
$u = x^2$, $du = 2x\,dx$: $\int\cos u\,du = \sin u + C = \sin(x^2) + C$.
:::

:::example With limits
$\displaystyle\int_0^1 xe^{-x^2}\,dx$.
---
$u = -x^2$, $du = -2x\,dx$, limits $0 \to -1$: $-\tfrac12\int_0^{-1}e^u\,du = -\tfrac12(e^{-1} - 1) = \tfrac12(1 - e^{-1}) \approx 0.316$.
:::

:::tip What to choose as $u$
Look for an "inside" function whose derivative also appears (up to a constant factor).
:::

## Integration by parts

:::def Integration by parts
$$\int u\,dv = uv - \int v\,du.$$
It comes from $(uv)' = u'v + uv'$.
:::

:::example
$\displaystyle\int xe^x\,dx$.
---
$u = x$, $dv = e^x dx$: $du = dx$, $v = e^x$. $xe^x - \int e^x\,dx = e^x(x - 1) + C$.
:::

:::example
$\displaystyle\int \ln x\,dx$.
---
$u = \ln x$, $dv = dx$: $x\ln x - \int x\cdot\tfrac1x\,dx = x\ln x - x + C$.
:::

:::tip LIATE
Pick $u$ in the order: **L**ogarithms, **I**nverse trig, **A**lgebraic (powers), **T**rig, **E**xponentials. The one that gets simpler when differentiated should be $u$.
:::

## Partial fractions

Split a rational function into simpler pieces:

:::example
$\displaystyle\int\frac{1}{x^2 - 1}\,dx$.
---
$\dfrac{1}{(x - 1)(x + 1)} = \dfrac{A}{x - 1} + \dfrac{B}{x + 1}$ gives $A = \tfrac12$, $B = -\tfrac12$.
So $\tfrac12\ln|x - 1| - \tfrac12\ln|x + 1| + C = \tfrac12\ln\left|\dfrac{x - 1}{x + 1}\right| + C$.
:::

## Improper integrals

Integrals over infinite intervals are limits:
$$\int_0^\infty e^{-x}\,dx = \lim_{b\to\infty}\left[-e^{-x}\right]_0^b = 1.$$
Such integrals define probability distributions: the exponential density $\lambda e^{-\lambda x}$ integrates to 1 on $[0, \infty)$.

## Common mistakes

:::mistake Forgetting $du$
In substitution, every $x$ (including $dx$) must be replaced.
:::

:::mistake Choosing $u$ that gets harder
In $\int xe^x dx$, choosing $u = e^x$ leads to $\int \tfrac{x^2}{2}e^x dx$ — worse.
:::

## Try it yourself

:::try
$\displaystyle\int \frac{2x}{x^2 + 1}\,dx$.
---
$\ln(x^2 + 1) + C$.
:::

:::try
$\displaystyle\int x\sin x\,dx$.
---
$u = x$: $-x\cos x + \sin x + C$.
:::

:::try
$\displaystyle\int_1^\infty \frac{1}{x^2}\,dx$.
---
$\lim_{b\to\infty}(1 - \tfrac1b) = 1$.
:::

:::ds In data science
The expected value of an exponential random variable, $\int_0^\infty x\lambda e^{-\lambda x}dx = \tfrac1\lambda$, is integration by parts. In practice symbolic tools (`sympy.integrate`) or numerical integration handle the algebra — but knowing the techniques tells you what's possible.
:::

## Summary

- Substitution reverses the chain rule; parts reverses the product rule.
- Partial fractions split rational functions.
- Improper integrals are limits.
