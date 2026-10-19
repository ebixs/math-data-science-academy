## Functions of many variables

A house price depends on area, location and age. A model's loss depends on thousands of weights. To understand and optimize such functions we need derivatives with respect to **each** input separately — **partial derivatives** — and the vector that collects them, the **gradient**, which points uphill.

:::why One knob at a time
Imagine a mixing desk with many knobs controlling the volume. The partial derivative with respect to one knob tells you how fast the volume changes when you turn **only that knob**, holding all others fixed.
:::

## Partial derivatives

:::def Partial derivative
For $f(x, y)$:
$$\frac{\partial f}{\partial x} = \lim_{h\to0}\frac{f(x + h, y) - f(x, y)}{h},$$
i.e. differentiate with respect to $x$, treating $y$ as a constant. Similarly $\tfrac{\partial f}{\partial y}$.
:::

:::example
$f(x, y) = x^2y + 3xy^3 - 2y$. Find $f_x$ and $f_y$.
---
$f_x = 2xy + 3y^3$. $f_y = x^2 + 9xy^2 - 2$.
:::

:::example With the chain rule
$f(x, y) = e^{x^2 + y^2}$.
---
$f_x = 2xe^{x^2 + y^2}$, $f_y = 2ye^{x^2 + y^2}$.
:::

## The gradient

:::def Gradient
$$\nabla f = \left(\frac{\partial f}{\partial x_1}, \dots, \frac{\partial f}{\partial x_n}\right).$$
It points in the direction of **steepest increase**; its length is the steepest slope. $-\nabla f$ points steepest downhill. The gradient is perpendicular to level curves $f = c$.
:::

:::example
$\nabla f$ for $f(x, y) = x^2 + 4y^2$ at $(1, 1)$?
---
$\nabla f = (2x, 8y) = (2, 8)$. Moving in direction $(2, 8)$ increases $f$ fastest; moving along $(-2, -8)$ decreases it fastest.
:::

:::def Directional derivative
The rate of change in the direction of a unit vector $\mathbf u$ is $D_{\mathbf u}f = \nabla f\cdot\mathbf u$ — largest when $\mathbf u$ points along $\nabla f$.
:::

## Critical points and the Hessian

At a minimum or maximum of a smooth function, $\nabla f = \mathbf 0$. The **Hessian** (matrix of second partials) classifies such points: for two variables with $D = f_{xx}f_{yy} - f_{xy}^2$:
- $D > 0$, $f_{xx} > 0$: minimum; $D > 0$, $f_{xx} < 0$: maximum; $D < 0$: saddle point.

:::example
Classify the critical point of $f = x^2 - y^2$.
---
$\nabla f = (2x, -2y) = 0$ at $(0, 0)$. $D = (2)(-2) - 0 = -4 < 0$: a saddle (up in $x$, down in $y$).
:::

## Common mistakes

:::mistake Forgetting that other variables are constants
$\tfrac{\partial}{\partial x}(x^2y^3) = 2xy^3$, not $2xy^3 + 3x^2y^2$.
:::

:::mistake $\nabla f = 0$ means a minimum
It could be a maximum or a saddle point.
:::

## Try it yourself

:::try
$\nabla f$ for $f(x, y, z) = xy + yz^2$.
---
$(y,\ x + z^2,\ 2yz)$.
:::

:::try
Mean squared error $L(w, b) = \tfrac1n\sum (wx_i + b - y_i)^2$. Find $\tfrac{\partial L}{\partial w}$.
---
$\tfrac2n\sum (wx_i + b - y_i)x_i$.
:::

:::ds In data science
Every training step of a model computes the gradient of the loss with respect to all parameters (often millions) — automatically, by the chain rule. The gradient-descent regression project in the notebook derives and checks $\tfrac{\partial L}{\partial w}$ and $\tfrac{\partial L}{\partial b}$ by hand.
:::

## Summary

- Partial derivative: vary one input, hold the rest fixed.
- $\nabla f$ points uphill, perpendicular to level curves; $D_{\mathbf u}f = \nabla f\cdot\mathbf u$.
- $\nabla f = 0$ at extrema and saddles; the Hessian tells them apart.
