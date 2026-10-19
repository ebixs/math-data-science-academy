## A few basic shapes, endless variations

Once you know the graphs of $x^2$, $|x|$, $\sqrt x$, $\tfrac1x$, $e^x$ and $\sin x$, you can draw thousands of others by **shifting, stretching and reflecting**. Composition chains functions together, and inverses run them backwards — both ideas are at the heart of how neural networks and data pipelines work.

## Transformations

:::def The four moves
Starting from $y = f(x)$:
- $f(x) + k$: shift **up** by $k$.
- $f(x - h)$: shift **right** by $h$ (note the minus!).
- $a\,f(x)$: stretch vertically by $a$; if $a < 0$, also reflect in the $x$-axis.
- $f(bx)$: compress horizontally by $b$; $f(-x)$ reflects in the $y$-axis.
:::

:::why Why "minus means right"
$g(x) = f(x - 3)$ takes the value $f$ had at $x - 3$. So $g(5) = f(2)$: the graph of $g$ shows at $x = 5$ what $f$ showed at $x = 2$ — everything has moved 3 to the right.
:::

:::graph Transforming $|x|$
f: a*abs(x - h) + k
range: -8,8
params: a=1:-3:3; h=0:-5:5; k=0:-4:4
:::

## Composition

:::def Composition
$(f \circ g)(x) = f(g(x))$: apply $g$ first, then $f$.
:::

:::example
For $f(x) = x^2 + 1$ and $g(x) = 3x - 2$, find $f(g(x))$ and $g(f(x))$.
---
$f(g(x)) = (3x - 2)^2 + 1 = 9x^2 - 12x + 5$. $g(f(x)) = 3(x^2 + 1) - 2 = 3x^2 + 1$. Order matters: $f\circ g \ne g\circ f$.
:::

## Inverse functions

:::def Inverse
$f^{-1}$ undoes $f$: $f^{-1}(f(x)) = x$. A function has an inverse when it is **one-to-one** (each output comes from one input — the horizontal line test). The graph of $f^{-1}$ is the reflection of $f$'s graph in the line $y = x$.
:::

:::example Finding an inverse
Find the inverse of $f(x) = \dfrac{2x + 1}{3}$.
---
Write $y = \dfrac{2x + 1}{3}$, swap $x$ and $y$: $x = \dfrac{2y + 1}{3}$, solve: $y = \dfrac{3x - 1}{2}$. So $f^{-1}(x) = \dfrac{3x - 1}{2}$.
Check: $f^{-1}(f(4)) = f^{-1}(3) = 4$ ✓.
:::

:::tip Famous inverse pairs
$e^x \leftrightarrow \ln x$, $x^2\ (x \ge 0) \leftrightarrow \sqrt x$, $\sin x$ on $[-\tfrac\pi2,\tfrac\pi2] \leftrightarrow \arcsin x$.
:::

## Common mistakes

:::mistake Shifting the wrong way
$(x + 2)^2$ moves the parabola **left** by 2.
:::

:::mistake $f^{-1}(x) = \dfrac{1}{f(x)}$
The inverse function is not the reciprocal. For $f(x) = 2x$, $f^{-1}(x) = \tfrac x2$ but $\tfrac{1}{f(x)} = \tfrac{1}{2x}$.
:::

:::mistake Wrong order in composition
$f(g(x))$ means $g$ first.
:::

## Try it yourself

:::try
Describe $y = -2(x + 1)^2 + 3$ relative to $y = x^2$.
---
Shift left 1, stretch by 2, reflect (opens down), shift up 3. Vertex $(-1, 3)$.
:::

:::try
If $f(x) = \sqrt x$ and $g(x) = x - 4$, what is the domain of $f(g(x))$?
---
$\sqrt{x - 4}$ needs $x \ge 4$.
:::

:::try
Find the inverse of $f(x) = e^{2x}$.
---
$x = e^{2y} \Rightarrow y = \tfrac12\ln x$.
:::

:::ds In data science
Standardizing a feature, $z = \tfrac{x - \mu}{\sigma}$, is a shift and a stretch; un-standardizing a prediction applies the inverse $x = \mu + \sigma z$. A neural network is a long composition $f_L\circ\dots\circ f_2\circ f_1$ of simple functions.
:::

## Summary

- $f(x - h) + k$ shifts right $h$, up $k$; $a f(x)$ stretches/reflects vertically.
- $f(g(x))$: inside first. Inverses undo, reflecting the graph in $y = x$.
