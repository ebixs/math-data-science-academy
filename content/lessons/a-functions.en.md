## A machine that turns inputs into outputs

A **function** is a rule that takes an input and gives exactly one output. The price you pay is a function of the weight of fruit; the temperature is a function of the time of day; a trained model is a function from features to predictions. Functions are the central idea of all mathematics after arithmetic.

:::why One input, one output
A vending machine is a function: press B3, get one specific snack. If pressing B3 sometimes gave chips and sometimes chocolate, it would not be a function. Different buttons may give the same snack — that's fine.
:::

## Definitions

:::def Function, domain, range
A function $f$ assigns to each input $x$ in its **domain** exactly one output $f(x)$. The set of all outputs is the **range**. We write $f(x) = 2x + 1$, read "$f$ of $x$".
:::

:::example Evaluating
For $f(x) = x^2 - 3x$, find $f(4)$, $f(-1)$ and $f(a + 1)$.
---
$f(4) = 16 - 12 = 4$. $f(-1) = 1 + 3 = 4$. $f(a+1) = (a+1)^2 - 3(a+1) = a^2 - a - 2$.
Note $f(4) = f(-1)$: two inputs can share an output.
:::

:::example Natural domain
Find the domain of $g(x) = \dfrac{1}{x - 2}$ and $h(x) = \sqrt{x + 5}$.
---
$g$: we cannot divide by zero, so $x \ne 2$. $h$: the square root needs $x + 5 \ge 0$, so $x \ge -5$, i.e. $[-5, \infty)$.
:::

## Graphs

The **graph** of $f$ is the set of points $(x, f(x))$. Reading a graph:
- $f(a)$ is the height of the graph above $x = a$;
- the **zeros** (roots) are where the graph meets the $x$-axis;
- the **$y$-intercept** is $f(0)$;
- $f$ is **increasing** where the graph rises from left to right.

:::tip The vertical line test
A curve is the graph of a function exactly when every vertical line meets it at most once. A circle fails the test: $x = 0$ hits it twice.
:::

:::graph Explore a function
f: a*x^2 + b*x + c
range: -6,6
params: a=1:-2:2; b=0:-4:4; c=-2:-5:5
:::

## Ways to describe a function

A function can be given by a **formula**, a **table**, a **graph** or **words**. Being able to move between these is the real skill.

| $x$ | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| $f(x)$ | 1 | 3 | 5 | 7 |

The output rises by 2 each step and starts at 1, so the formula is $f(x) = 2x + 1$.

:::example A piecewise function
A delivery fee is 20 for orders under 100 and free otherwise. Write it as a function of the order value $v$.
---
$$F(v) = \begin{cases} 20, & v < 100 \\ 0, & v \ge 100 \end{cases}$$
:::

## Common mistakes

:::mistake $f(x + h) \ne f(x) + h$
For $f(x) = x^2$: $f(x + 1) = x^2 + 2x + 1$, not $x^2 + 1$. Substitute the whole expression.
:::

:::mistake Reading $f(x)$ as multiplication
$f(x)$ is not "$f$ times $x$". It's the output of $f$ at $x$.
:::

:::mistake Forgetting domain restrictions
$\dfrac{x^2 - 4}{x - 2}$ looks like $x + 2$, but it is undefined at $x = 2$.
:::

## Try it yourself

:::try
For $f(x) = 3 - 2x$, solve $f(x) = 11$.
---
$3 - 2x = 11 \Rightarrow x = -4$.
:::

:::try
Find the domain of $k(x) = \dfrac{\sqrt{x}}{x - 9}$.
---
$x \ge 0$ and $x \ne 9$: $[0, 9) \cup (9, \infty)$.
:::

:::try
Is $y^2 = x$ the graph of a function $y = f(x)$?
---
No: for $x = 4$ both $y = 2$ and $y = -2$ work, so the vertical line $x = 4$ meets it twice.
:::

:::ds In data science
A trained model is literally a function `predict(x)`. Functions in Python (`def f(x): ...`) and vectorized NumPy expressions like `f = lambda x: x**2 - 3*x` let you evaluate a function on a whole array of inputs at once.
:::

## Summary

- A function gives exactly one output per input; domain = allowed inputs, range = outputs.
- Evaluate by substituting the whole input expression.
- Graph points are $(x, f(x))$; the vertical line test checks "is it a function?".
