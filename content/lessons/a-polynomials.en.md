## Why polynomials?

Polynomials are the expressions you can build from $x$ using only addition, subtraction and multiplication: $3x^2 - 5x + 2$, $x^3 - 8$. They model areas, volumes, projectile paths and profit curves, and they approximate almost any smooth function (that's what Taylor series do). **Factoring** — writing a polynomial as a product — is the key that unlocks equations: a product is zero only when one of its factors is zero.

:::why Factoring is "un-multiplying"
Expanding turns $(x + 2)(x + 3)$ into $x^2 + 5x + 6$. Factoring goes back. Think of the area of a rectangle: $x^2 + 5x + 6$ is an area; factoring finds the side lengths $x + 2$ and $x + 3$.
:::

## Vocabulary

:::def Polynomial, degree, leading coefficient
A polynomial in $x$ is $a_nx^n + \dots + a_1x + a_0$ with whole-number exponents. The **degree** is the highest exponent with a non-zero coefficient; that coefficient is the **leading coefficient**. $4x^3 - x + 7$ has degree 3 and leading coefficient 4.
:::

Adding polynomials = combining like terms. Multiplying = every term times every term.

## Special products

$$(a + b)^2 = a^2 + 2ab + b^2,\qquad (a - b)^2 = a^2 - 2ab + b^2,\qquad (a + b)(a - b) = a^2 - b^2.$$

These are worth memorizing in **both** directions: $49x^2 - 25 = (7x - 5)(7x + 5)$ and $x^2 - 10x + 25 = (x - 5)^2$.

## A factoring checklist

1. **Common factor** first: $6x^3 - 9x^2 = 3x^2(2x - 3)$.
2. **Two terms**: difference of squares $a^2 - b^2$ (sum of squares does not factor over the reals).
3. **Three terms** $x^2 + bx + c$: find two numbers with product $c$ and sum $b$.
4. **Leading coefficient $\ne 1$** ($ax^2 + bx + c$): split the middle term using two numbers with product $ac$ and sum $b$ (the "ac method").
5. **Four terms**: try grouping.

:::example $x^2 - 2x - 15$
---
Numbers with product $-15$ and sum $-2$: $-5$ and $3$. So $(x - 5)(x + 3)$.
:::

:::example The ac method: $6x^2 + 7x - 3$
---
$ac = -18$; numbers with product $-18$ and sum $7$: $9$ and $-2$.
$6x^2 + 9x - 2x - 3 = 3x(2x + 3) - 1(2x + 3) = (3x - 1)(2x + 3)$.
:::

:::example Grouping: $x^3 + 2x^2 - 9x - 18$
---
$x^2(x + 2) - 9(x + 2) = (x + 2)(x^2 - 9) = (x + 2)(x - 3)(x + 3)$.
:::

## Roots and factors

:::def Factor theorem
$r$ is a root of $p(x)$ (i.e. $p(r) = 0$) exactly when $(x - r)$ is a factor of $p(x)$.
:::

So the factored form shows the $x$-intercepts of the graph. Move the sliders: the graph of $(x - r)(x - s)$ always crosses the axis at $r$ and $s$.

:::graph Roots from factors
f: (x - r)*(x - s)
range: -6,6
params: r=-2:-5:5; s=3:-5:5
:::

## Common mistakes

:::mistake $(a + b)^2 = a^2 + b^2$
The middle term $2ab$ is missing. Check with numbers: $(1 + 2)^2 = 9 \ne 5$.
:::

:::mistake Forgetting to factor completely
$2x^2 - 8 = 2(x^2 - 4)$ is not finished: $2(x - 2)(x + 2)$.
:::

:::mistake Sign slips in grouping
$x^3 - 3x^2 - 4x + 12 = x^2(x - 3) - 4(x - 3)$: the second group needs $-4$, not $+4$.
:::

## Try it yourself

:::try
Expand $(2x - 3)^2 - (x + 1)(x - 1)$.
---
$4x^2 - 12x + 9 - (x^2 - 1) = 3x^2 - 12x + 10$.
:::

:::try
Factor $3x^2 - 12x - 36$.
---
$3(x^2 - 4x - 12) = 3(x - 6)(x + 2)$.
:::

:::try
Factor $4x^2 - 4x - 15$.
---
$ac = -60$, numbers $-10$ and $6$: $4x^2 - 10x + 6x - 15 = 2x(2x - 5) + 3(2x - 5) = (2x + 3)(2x - 5)$.
:::

:::ds In data science
Polynomial regression fits $\hat y = b_0 + b_1x + b_2x^2 + \dots$ to curved data. A higher degree fits the training data better but can wildly overfit — a central lesson of machine learning. `numpy.polyfit(x, y, 2)` fits a quadratic.
:::

## Summary

- Polynomials are built from $+$, $-$, $\times$ and whole powers; degree = highest power.
- Know the special products both ways.
- Factor: common factor → patterns → $ac$ method → grouping. Roots ↔ factors $(x - r)$.
