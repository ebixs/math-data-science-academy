## Walking downhill in the fog

You're on a mountain in thick fog and want to reach the valley. You can't see the bottom, but you can feel the slope under your feet. Take a step downhill, feel again, repeat. That is **gradient descent** — the algorithm that trains linear regression, logistic regression and every neural network.

## The algorithm

:::def Gradient descent
To minimize $L(\mathbf w)$, start from $\mathbf w_0$ and repeat
$$\mathbf w_{t+1} = \mathbf w_t - \eta\,\nabla L(\mathbf w_t),$$
where $\eta > 0$ is the **learning rate** (step size). Stop when the gradient is tiny or the loss stops improving.
:::

:::example One variable
Minimize $f(x) = (x - 3)^2$ from $x_0 = 0$ with $\eta = 0.1$.
---
$f'(x) = 2(x - 3)$. $x_1 = 0 - 0.1(-6) = 0.6$, $x_2 = 0.6 - 0.1(-4.8) = 1.08$, $x_3 = 1.464$, … Each step closes 20% of the remaining gap: $x_t = 3 - 3(0.8)^t \to 3$.
:::

:::example Two variables
$f(x, y) = x^2 + 2y^2$ from $(4, 2)$ with $\eta = 0.25$: one step.
---
$\nabla f = (2x, 4y) = (8, 8)$. New point $(4 - 2, 2 - 2) = (2, 0)$.
:::

## The learning rate

:::why Too small, too large, just right
- **Too small**: tiny steps; convergence takes forever.
- **Too large**: steps overshoot the minimum and bounce around — or diverge.
- For $f(x) = ax^2$, the update is $x \leftarrow (1 - 2a\eta)x$: it converges only if $|1 - 2a\eta| < 1$, i.e. $\eta < \tfrac1a$.
:::

:::graph Distance to the minimum after t steps: 3·|1 − 2η|^t (η = k)
f: 3*abs(1 - 2*k)^x
range: 0,15
params: k=0.1:0.02:1.05
:::

Try $\eta = 0.5$ (one step lands exactly), $\eta = 0.9$ (oscillation) and $\eta > 1$ (divergence).

## Variants used in practice

:::def Stochastic and mini-batch gradient descent
The loss is an average over $n$ examples. Instead of the full gradient, use the gradient on one example (**SGD**) or a small batch. Each step is noisy but far cheaper — essential for big data.
:::

- **Momentum** keeps a running average of past gradients to roll through small bumps and dampen zig-zags.
- **Adam** adapts the step size for each parameter; it's the default optimizer for deep learning.
- **Feature scaling** matters: when features have very different scales, the loss surface is a long narrow valley and gradient descent zig-zags. Standardizing makes it rounder.

## Common mistakes

:::mistake Adding the gradient
Descent **subtracts** $\eta\nabla L$. Adding it climbs uphill.
:::

:::mistake Assuming the global minimum
On non-convex surfaces, gradient descent may stop at a local minimum or saddle point.
:::

## Try it yourself

:::try
$f(x) = x^2$, $x_0 = 10$, $\eta = 0.1$. Find $x_1$ and $x_2$.
---
$x_1 = 10 - 2 = 8$, $x_2 = 8 - 1.6 = 6.4$.
:::

:::try
For $f(x) = 5x^2$, what learning rates converge?
---
$\eta < \tfrac15 = 0.2$.
:::

:::ds In data science
In the Python notebook's "linear regression with gradient descent" project you implement this loop on real data and see it match the closed-form least-squares solution. In libraries: `SGDRegressor` in scikit-learn, `torch.optim.SGD` / `Adam` in PyTorch.
:::

## Summary

- $\mathbf w \leftarrow \mathbf w - \eta\nabla L(\mathbf w)$.
- Learning rate: too small is slow, too large diverges.
- SGD/mini-batches, momentum, Adam and feature scaling make it practical.
