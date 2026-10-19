## Fractions with variables

A **rational expression** is a fraction of polynomials, like $\dfrac{x + 1}{x^2 - 4}$. They describe averages ("total cost divided by number of units"), rates and inverse relationships. Everything you know about numeric fractions still works — with one new danger: the denominator can become **zero** for some values of $x$.

:::why Same rules, plus a warning label
$\dfrac{x^2 - 9}{x - 3}$ simplifies to $x + 3$ — but not at $x = 3$, where the original is undefined. Simplifying changes the *formula*, not the *domain*. Always write down the excluded values first.
:::

## Simplifying

Factor the numerator and denominator, then cancel common **factors**.

:::example
Simplify $\dfrac{x^2 - 5x + 6}{x^2 - 9}$.
---
$\dfrac{(x - 2)(x - 3)}{(x - 3)(x + 3)} = \dfrac{x - 2}{x + 3}$, for $x \ne 3, -3$.
:::

## Operations

Multiply/divide like fractions; add/subtract with a common denominator (the LCM of the factored denominators).

:::example Adding
$\dfrac{2}{x} + \dfrac{3}{x + 1}$.
---
Common denominator $x(x + 1)$: $\dfrac{2(x + 1) + 3x}{x(x + 1)} = \dfrac{5x + 2}{x(x + 1)}$.
:::

:::example Subtracting with factoring
$\dfrac{x}{x^2 - 1} - \dfrac{1}{x - 1}$.
---
$= \dfrac{x}{(x-1)(x+1)} - \dfrac{x + 1}{(x - 1)(x + 1)} = \dfrac{-1}{(x - 1)(x + 1)}$.
:::

## Rational equations

Multiply both sides by the common denominator to clear fractions — then **check** for values that make a denominator zero (extraneous solutions).

:::example
Solve $\dfrac{x}{x - 2} = \dfrac{2}{x - 2} + 3$.
---
Multiply by $x - 2$: $x = 2 + 3(x - 2) \Rightarrow x = 3x - 4 \Rightarrow x = 2$. But $x = 2$ makes the denominators zero, so it is **rejected**: no solution.
:::

:::example Work rate
Pipe A fills a tank in 4 h, pipe B in 6 h. How long together?
---
$\dfrac{t}{4} + \dfrac{t}{6} = 1 \Rightarrow 3t + 2t = 12 \Rightarrow t = 2.4$ h.
:::

## Graphs: asymptotes

The graph of $\dfrac{1}{x - a}$ has a **vertical asymptote** at $x = a$ (the function blows up) and approaches 0 far away (a horizontal asymptote $y = 0$).

:::graph A vertical asymptote
f: 1/(x - a) + k
range: -6,6
params: a=1:-3:3; k=0:-2:2
:::

## Common mistakes

:::mistake Cancelling terms
$\dfrac{x + 6}{x + 3} \ne \dfrac{6}{3}$. Only factors cancel.
:::

:::mistake Forgetting excluded values
Solutions that make any denominator zero must be thrown out.
:::

:::mistake Adding denominators
$\dfrac{1}{x} + \dfrac{1}{y} \ne \dfrac{2}{x + y}$; it equals $\dfrac{x + y}{xy}$.
:::

## Try it yourself

:::try
Simplify $\dfrac{2x^2 + 6x}{x^2 - 9}$.
---
$\dfrac{2x(x + 3)}{(x - 3)(x + 3)} = \dfrac{2x}{x - 3}$, $x \ne \pm 3$.
:::

:::try
Solve $\dfrac{3}{x} + \dfrac{1}{2} = \dfrac{5}{x}$.
---
Multiply by $2x$: $6 + x = 10$, $x = 4$ (allowed).
:::

:::try
Where is $f(x) = \dfrac{x + 1}{x^2 - 4}$ undefined?
---
$x^2 - 4 = 0$: $x = \pm 2$.
:::

:::ds In data science
Averages are rational expressions: average cost per unit $\dfrac{F + vx}{x}$ falls toward $v$ as volume $x$ grows. Ratios like precision $\dfrac{TP}{TP + FP}$ are undefined when the denominator is 0 — libraries then warn you or return `nan`.
:::

## Summary

- Factor, then cancel factors; record excluded values.
- Combine with a common denominator.
- Clear fractions in equations, then reject solutions that make a denominator zero.
