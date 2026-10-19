## The idea: keep the balance

An equation says two expressions are equal, like a balance scale in equilibrium. Solving means finding the value of the variable that makes the statement true. The only rule: **whatever you do to one side, do to the other** — then the scale stays balanced and the solutions don't change.

:::why Undo in reverse order
$3x + 5 = 20$ describes a recipe: "take $x$, triple it, add 5, get 20". To find $x$, undo the steps in reverse: subtract 5 (get 15), then divide by 3 (get 5). Solving an equation is un-doing a recipe.
:::

## Solving linear equations

:::def Linear equation
A **linear equation** in $x$ can be written as $ax + b = 0$ with $a \ne 0$. Its unique solution is $x = -\dfrac{b}{a}$.
:::

A reliable plan:
1. Clear brackets (distribute).
2. Clear fractions (multiply both sides by the LCM of denominators).
3. Collect $x$-terms on one side, numbers on the other.
4. Divide by the coefficient of $x$.
5. **Check** by substituting back.

:::example Variables on both sides
Solve $5x - 7 = 2x + 8$.
---
Subtract $2x$: $3x - 7 = 8$. Add 7: $3x = 15$. Divide: $x = 5$.
Check: $5(5) - 7 = 18$ and $2(5) + 8 = 18$ ✓.
:::

:::example Brackets
Solve $3(2x - 1) - 2(x + 4) = 9$.
---
$6x - 3 - 2x - 8 = 9 \Rightarrow 4x - 11 = 9 \Rightarrow 4x = 20 \Rightarrow x = 5$.
:::

:::example Fractions
Solve $\dfrac{x}{3} + \dfrac{x - 1}{4} = 2$.
---
Multiply both sides by 12: $4x + 3(x - 1) = 24 \Rightarrow 7x - 3 = 24 \Rightarrow x = \dfrac{27}{7}$.
:::

### No solution or infinitely many

- $2(x + 3) = 2x + 1$ gives $6 = 1$: **no solution**.
- $2(x + 3) = 2x + 6$ gives $6 = 6$: **every** $x$ is a solution (an identity).

## Solving for a variable in a formula

The same steps rearrange formulas. From $F = \tfrac{9}{5}C + 32$:
$$F - 32 = \tfrac{9}{5}C \quad\Rightarrow\quad C = \tfrac{5}{9}(F - 32).$$

:::example Word problem
A phone plan costs 50 per month plus 0.4 per GB. Last month's bill was 74. How many GB were used?
---
$50 + 0.4g = 74 \Rightarrow 0.4g = 24 \Rightarrow g = 60$ GB.
:::

## See it graphically

Solving $ax + b = c$ means finding where the line $y = ax + b$ meets the horizontal line $y = c$. Move the sliders and watch the intersection move.

:::graph Where two graphs meet
f: a*x + b
g: c
range: -10,10
params: a=2:-4:4; b=1:-6:6; c=5:-8:8
:::

## Common mistakes

:::mistake Doing something to only one term
From $\dfrac{x}{2} + 3 = 7$, multiplying only $x/2$ by 2 gives $x + 3 = 7$ — wrong. Multiply **every** term: $x + 6 = 14$.
:::

:::mistake Sign errors when moving terms
"Moving" $+5$ to the other side makes it $-5$, because you are subtracting 5 from both sides.
:::

:::mistake Dividing by the wrong number
From $-4x = 12$, $x = -3$, not $3$.
:::

## Try it yourself

:::try
Solve $7 - 2x = 3x - 18$.
---
$25 = 5x$, so $x = 5$.
:::

:::try
Solve $\dfrac{2x + 1}{5} = \dfrac{x - 2}{3}$.
---
Cross-multiply: $3(2x + 1) = 5(x - 2) \Rightarrow 6x + 3 = 5x - 10 \Rightarrow x = -13$.
:::

:::try
Make $r$ the subject of $A = P(1 + rt)$.
---
$\dfrac{A}{P} = 1 + rt \Rightarrow rt = \dfrac{A}{P} - 1 \Rightarrow r = \dfrac{A - P}{Pt}$.
:::

:::ds In data science
Solving for an unknown is how you invert a model: if a linear model says $\hat y = 2.5x + 10$, then the input needed to reach $\hat y = 60$ is $x = 20$. Larger systems of linear equations are solved by linear algebra (e.g. `numpy.linalg.solve`).
:::

## Summary

- Keep the balance: same operation on both sides.
- Clear brackets and fractions, collect terms, divide, check.
- A linear equation has exactly one solution, none, or infinitely many.
