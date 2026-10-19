## When "downhill" is guaranteed to work

Gradient descent can get stuck in a local minimum. For **convex** functions it can't: every local minimum is a global minimum. Linear regression, logistic regression, ridge, lasso and support vector machines all have convex losses — which is why they train reliably. And when there are **constraints** ("the budget is fixed", "weights sum to 1"), **Lagrange multipliers** find the optimum.

## Convex sets and functions

:::def Convex function
$f$ is **convex** if the segment between any two points of its graph lies on or above the graph:
$$f(\lambda x + (1 - \lambda)y) \le \lambda f(x) + (1 - \lambda)f(y),\quad 0 \le \lambda \le 1.$$
For twice-differentiable $f$ of one variable: convex $\iff f''(x) \ge 0$ everywhere. For several variables: the Hessian is positive semidefinite.
:::

:::why Bowls have one bottom
A convex function looks like a bowl. Any point where the ground is flat ($\nabla f = 0$) must be the bottom — there are no other dips to get trapped in.
:::

:::example Which are convex?
$x^2$, $e^x$, $|x|$, $-\ln x$ (for $x > 0$), $\sin x$?
---
$x^2$: $f'' = 2$ ✓. $e^x$: ✓. $|x|$: convex (not differentiable at 0, but satisfies the definition). $-\ln x$: $f'' = \tfrac{1}{x^2} > 0$ ✓. $\sin x$: $f''$ changes sign ✗.
:::

:::tip Building convex functions
Sums of convex functions are convex, and so are positive multiples and maxima of convex functions. Mean squared error $\tfrac1n\sum (y_i - \mathbf w\cdot\mathbf x_i)^2$ is a sum of convex functions of $\mathbf w$, so it's convex.
:::

:::graph Convex (bowl) vs non-convex (two dips)
f: x^2 + a
g: x^4 - 4*x^2 + x
range: -3,3
params: a=0:-2:2
:::

## Constrained optimization: Lagrange multipliers

:::def Lagrange multipliers
To optimize $f(x, y)$ subject to $g(x, y) = c$, solve
$$\nabla f = \lambda\nabla g,\qquad g(x, y) = c.$$
Equivalently, find critical points of $\mathcal L = f - \lambda(g - c)$.
:::

:::why Tangent level curves
Walking along the constraint curve, $f$ stops increasing exactly where the constraint curve is tangent to a level curve of $f$. Tangent curves have parallel normals: $\nabla f \parallel \nabla g$.
:::

:::example Maximum area with a fixed perimeter
Maximize $A = xy$ subject to $2x + 2y = 40$.
---
$\nabla A = (y, x)$, $\nabla g = (2, 2)$. $y = 2\lambda$, $x = 2\lambda$, so $x = y$; with $x + y = 20$: $x = y = 10$, $A = 100$.
:::

:::example Closest point on a line
Minimize $x^2 + y^2$ subject to $x + 2y = 5$.
---
$(2x, 2y) = \lambda(1, 2) \Rightarrow y = 2x$. Then $5x = 5$: $(1, 2)$, distance² $= 5$.
:::

## Common mistakes

:::mistake Convex = has a minimum
$e^x$ is convex but has no minimum (it approaches 0). Convexity guarantees that any minimum found is global, not that one exists.
:::

:::mistake Forgetting the constraint equation
$\nabla f = \lambda\nabla g$ alone has too many unknowns; include $g = c$.
:::

## Try it yourself

:::try
Is $f(x) = x^4 - x$ convex?
---
$f'' = 12x^2 \ge 0$: yes. Minimum at $4x^3 = 1$, $x = 4^{-1/3} \approx 0.63$.
:::

:::try
Maximize $x + y$ on the circle $x^2 + y^2 = 8$.
---
$(1, 1) = \lambda(2x, 2y) \Rightarrow x = y = 2$ (positive one): max $4$.
:::

:::ds In data science
Ridge regression minimizes $\lVert\mathbf y - X\mathbf w\rVert^2 + \alpha\lVert\mathbf w\rVert^2$ — the Lagrangian form of "minimize the error with $\lVert\mathbf w\rVert^2 \le t$". Support vector machines are constrained convex problems solved through their Lagrange dual. Portfolio optimization ("maximize return for fixed risk") is the same idea.
:::

## Summary

- Convex: $f'' \ge 0$ (bowl); local minimum = global minimum.
- Sums and maxima of convex functions are convex.
- Constraints: solve $\nabla f = \lambda\nabla g$ with $g = c$.
