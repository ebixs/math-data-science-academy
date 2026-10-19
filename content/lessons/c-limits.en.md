## Getting arbitrarily close

What is the speed of a car **at one instant**? Speed is distance over time, but in an instant no time passes: $\tfrac00$. Calculus solves this with **limits**: look at what happens as the time interval gets closer and closer to zero. Limits are the foundation of derivatives, integrals and infinite series.

:::def Limit (intuitive)
$\displaystyle\lim_{x\to a} f(x) = L$ means: $f(x)$ can be made as close to $L$ as we like by taking $x$ close enough to $a$ (but not equal to $a$). What happens **at** $a$ doesn't matter.
:::

:::example A hole in the graph
$\displaystyle\lim_{x\to 2}\frac{x^2 - 4}{x - 2}$.
---
At $x = 2$ we get $\tfrac00$. But for $x \ne 2$, $\dfrac{(x-2)(x+2)}{x-2} = x + 2$, which approaches $4$. So the limit is 4, even though the function is undefined at 2.
:::

## Computing limits

1. **Substitute.** If $f$ is continuous at $a$, the limit is $f(a)$.
2. If you get $\tfrac00$: **factor and cancel**, **rationalize** (multiply by a conjugate), or simplify.
3. $\tfrac{k}{0}$ with $k \ne 0$ means the function blows up: the limit is $\pm\infty$ or doesn't exist.

:::example Rationalizing
$\displaystyle\lim_{x\to 0}\frac{\sqrt{x + 9} - 3}{x}$.
---
Multiply by $\dfrac{\sqrt{x+9} + 3}{\sqrt{x+9} + 3}$: $\dfrac{x}{x(\sqrt{x + 9} + 3)} = \dfrac{1}{\sqrt{x+9} + 3} \to \dfrac16$.
:::

:::def One-sided limits
$\lim_{x\to a^-}$ approaches from the left, $\lim_{x\to a^+}$ from the right. The (two-sided) limit exists exactly when both exist and are equal.
:::

## Limits at infinity

For rational functions, compare the highest powers:
$$\lim_{x\to\infty}\frac{3x^2 + 1}{5x^2 - x} = \frac35,\qquad \lim_{x\to\infty}\frac{x}{x^2 + 1} = 0.$$
Divide top and bottom by the highest power of $x$ in the denominator to see why.

:::def Two famous limits
$$\lim_{x\to 0}\frac{\sin x}{x} = 1,\qquad \lim_{n\to\infty}\left(1 + \frac1n\right)^n = e.$$
:::

:::graph Approaching a limit
f: sin(x)/x
g: (1 + 1/x)^x
range: -10,10
:::

## Continuity

:::def Continuous function
$f$ is **continuous** at $a$ if $\lim_{x\to a}f(x) = f(a)$ — no holes, jumps or blow-ups. Polynomials, $e^x$, $\sin$, $\cos$ are continuous everywhere; rational functions wherever the denominator is non-zero.
:::

:::tip Intermediate value theorem
A continuous function on $[a, b]$ takes every value between $f(a)$ and $f(b)$. So if $f(a) < 0 < f(b)$, there's a root in between — the idea behind the bisection method.
:::

## Common mistakes

:::mistake $\tfrac00 = 0$ or $1$
$\tfrac00$ is an **indeterminate form**: it means "more work needed", and the limit can be anything.
:::

:::mistake Limit = function value
The limit ignores the value at $a$; they agree only for continuous functions.
:::

## Try it yourself

:::try
$\displaystyle\lim_{x\to 3}\frac{x^2 - 2x - 3}{x - 3}$.
---
$(x + 1) \to 4$.
:::

:::try
$\displaystyle\lim_{x\to\infty}\frac{2x^3 - x}{4x^3 + 7}$.
---
$\tfrac24 = \tfrac12$.
:::

:::try
Is $f(x) = \begin{cases}x^2, & x < 1\\ 2x - 1, & x \ge 1\end{cases}$ continuous at 1?
---
Left limit 1, right limit 1, $f(1) = 1$: yes.
:::

:::ds In data science
"Convergence" in training means a limit: the loss approaches a value as iterations $\to\infty$. Numerical derivatives use a small $h$ to approximate $\lim_{h\to0}$ — too small and floating-point rounding takes over.
:::

## Summary

- A limit describes behaviour **near** $a$, not at $a$.
- Substitute; for $\tfrac00$ factor, cancel or rationalize.
- Continuous: limit equals value.
