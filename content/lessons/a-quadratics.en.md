## Why quadratics?

A ball thrown in the air, the area of a field with a fixed fence, profit when price and demand trade off, the loss function of linear regression — all are quadratic. Quadratic equations $ax^2 + bx + c = 0$ are the first equations where you need more than "undo the steps", and their graphs, **parabolas**, have a single lowest or highest point: the first taste of optimization.

:::why The vertex is the turning point
A parabola is symmetric. It goes down, turns, and goes up (if $a > 0$). The turning point — the **vertex** — sits exactly halfway between the two roots, at $x = -\dfrac{b}{2a}$. That one formula is where minimization starts.
:::

## Three ways to solve

:::def Zero product property
If $AB = 0$ then $A = 0$ or $B = 0$.
:::

**1. Factoring.** $x^2 - x - 6 = 0 \Rightarrow (x - 3)(x + 2) = 0 \Rightarrow x = 3$ or $x = -2$.

**2. Completing the square.** Rewrite so that $x$ appears once:

:::example Solve $x^2 + 6x - 7 = 0$ by completing the square
---
$x^2 + 6x = 7$. Add $(6/2)^2 = 9$: $x^2 + 6x + 9 = 16$, so $(x + 3)^2 = 16$ and $x + 3 = \pm 4$. Hence $x = 1$ or $x = -7$.
:::

**3. The quadratic formula** (completing the square once and for all):

:::def Quadratic formula and discriminant
For $ax^2 + bx + c = 0$ with $a \ne 0$:
$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}.$$
The **discriminant** $\Delta = b^2 - 4ac$ tells you how many real roots:
- $\Delta > 0$: two; $\Delta = 0$: one (double); $\Delta < 0$: none.
:::

:::example
Solve $2x^2 - 4x - 3 = 0$.
---
$\Delta = 16 + 24 = 40$. $x = \dfrac{4 \pm \sqrt{40}}{4} = \dfrac{4 \pm 2\sqrt{10}}{4} = 1 \pm \dfrac{\sqrt{10}}{2}$, i.e. about $2.58$ and $-0.58$.
:::

## The parabola

:::def Vertex form
$y = a(x - h)^2 + k$ has vertex $(h, k)$. It opens up if $a > 0$ (vertex = minimum) and down if $a < 0$ (vertex = maximum).
:::

:::graph Vertex form
f: a*(x - h)^2 + k
range: -6,6
params: a=1:-2:2; h=1:-4:4; k=-2:-4:4
:::

:::example Maximum area
You have 40 m of fence to make a rectangle. What dimensions give the largest area?
---
Sides $x$ and $20 - x$. Area $A = x(20 - x) = -x^2 + 20x$. Vertex at $x = -\dfrac{20}{2(-1)} = 10$. A $10 \times 10$ square, area 100 m².
:::

:::tip Sum and product of roots
If the roots are $r_1, r_2$, then $r_1 + r_2 = -\dfrac{b}{a}$ and $r_1r_2 = \dfrac{c}{a}$. A quick check of your answers.
:::

## Common mistakes

:::mistake Dividing by $x$
From $x^2 = 5x$, dividing by $x$ loses the root $x = 0$. Instead: $x(x - 5) = 0$.
:::

:::mistake Taking only the positive root
$(x - 2)^2 = 9$ gives $x - 2 = \pm 3$, so $x = 5$ **or** $x = -1$.
:::

:::mistake Sign of $b$ in the formula
For $x^2 - 6x + 5$, $b = -6$, so $-b = +6$.
:::

## Try it yourself

:::try
Solve $3x^2 = 12x$.
---
$3x(x - 4) = 0$: $x = 0$ or $x = 4$.
:::

:::try
How many real roots does $x^2 + 4x + 7 = 0$ have?
---
$\Delta = 16 - 28 = -12 < 0$: none.
:::

:::try
Find the vertex of $y = 2x^2 - 8x + 3$.
---
$x = \dfrac{8}{4} = 2$, $y = 8 - 16 + 3 = -5$. Vertex $(2, -5)$, a minimum.
:::

:::ds In data science
The mean squared error of predicting every value with a constant $c$ is a parabola in $c$: $\tfrac1n\sum (y_i - c)^2$. Its vertex is at $c = \bar y$ — which is why the **mean** is the best constant prediction under squared error.
:::

## Summary

- Solve by factoring, completing the square or the formula $x = \tfrac{-b\pm\sqrt{b^2-4ac}}{2a}$.
- $\Delta = b^2 - 4ac$ counts real roots.
- Vertex at $x = -\tfrac{b}{2a}$; vertex form $a(x-h)^2 + k$.
