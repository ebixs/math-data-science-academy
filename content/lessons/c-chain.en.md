## Derivatives of functions inside functions

$\sin(3x^2)$, $e^{-x^2/2}$, $\ln(1 + e^x)$, $\sqrt{1 - x^2}$: most real formulas are **compositions** — one function fed into another. The **chain rule** differentiates them, and it is literally the "backpropagation" algorithm that trains every neural network.

:::def Chain rule
If $y = f(g(x))$, then
$$\frac{dy}{dx} = f'(g(x))\cdot g'(x).$$
In Leibniz notation with $u = g(x)$: $\dfrac{dy}{dx} = \dfrac{dy}{du}\cdot\dfrac{du}{dx}$.
:::

:::why Rates multiply
If $u$ changes 3 times as fast as $x$, and $y$ changes 5 times as fast as $u$, then $y$ changes $5\times3 = 15$ times as fast as $x$. Gears: the outer function's rate times the inner function's rate.
:::

:::example
Differentiate $(3x^2 + 1)^5$, $\sin(4x)$, $e^{-x^2}$.
---
$5(3x^2 + 1)^4\cdot 6x = 30x(3x^2 + 1)^4$. $4\cos(4x)$. $-2xe^{-x^2}$.
:::

:::example Layers
$\dfrac{d}{dx}\ln(\cos(x^2))$.
---
Outer $\ln$, middle $\cos$, inner $x^2$: $\dfrac{1}{\cos(x^2)}\cdot(-\sin(x^2))\cdot 2x = -2x\tan(x^2)$.
:::

## Transcendental functions

| function | derivative |
|---|---|
| $e^{kx}$ | $ke^{kx}$ |
| $a^x$ | $a^x\ln a$ |
| $\ln(g(x))$ | $\dfrac{g'(x)}{g(x)}$ |
| $\log_a x$ | $\dfrac{1}{x\ln a}$ |
| $\tan x$ | $\sec^2x$ |
| $\arctan x$ | $\dfrac{1}{1 + x^2}$ |
| $\arcsin x$ | $\dfrac{1}{\sqrt{1 - x^2}}$ |

:::example The sigmoid
$\sigma(x) = \dfrac{1}{1 + e^{-x}}$. Show $\sigma'(x) = \sigma(x)(1 - \sigma(x))$.
---
$\sigma = (1 + e^{-x})^{-1}$, so $\sigma' = -(1 + e^{-x})^{-2}\cdot(-e^{-x}) = \dfrac{e^{-x}}{(1 + e^{-x})^2} = \dfrac{1}{1 + e^{-x}}\cdot\dfrac{e^{-x}}{1 + e^{-x}} = \sigma(1 - \sigma)$.
:::

:::graph The sigmoid and its derivative
f: 1/(1 + exp(-k*x))
g: k*exp(-k*x)/(1 + exp(-k*x))^2
range: -6,6
params: k=1:0.3:3
:::

## Implicit differentiation

For $x^2 + y^2 = 25$, differentiate both sides treating $y$ as a function of $x$: $2x + 2y\,y' = 0 \Rightarrow y' = -\dfrac{x}{y}$. At $(3, 4)$ the slope is $-\tfrac34$.

## Common mistakes

:::mistake Forgetting the inner derivative
$\dfrac{d}{dx}\sin(5x) = 5\cos(5x)$, not $\cos(5x)$.
:::

:::mistake Changing the inside
$\dfrac{d}{dx}(x^2 + 1)^3 = 3(x^2 + 1)^2\cdot2x$ — the inside stays $(x^2 + 1)$ in the outer derivative.
:::

## Try it yourself

:::try
$\dfrac{d}{dx}\sqrt{1 + x^2}$.
---
$\dfrac{x}{\sqrt{1 + x^2}}$.
:::

:::try
$\dfrac{d}{dx}\, 3^{2x}$.
---
$2\ln3\cdot 3^{2x}$.
:::

:::try
$\dfrac{d}{dx}\ln(1 + e^x)$ (the "softplus").
---
$\dfrac{e^x}{1 + e^x} = \sigma(x)$.
:::

:::ds In data science
**Backpropagation** is the chain rule applied layer by layer from the loss back to each weight: $\tfrac{\partial L}{\partial w} = \tfrac{\partial L}{\partial \hat y}\cdot\tfrac{\partial \hat y}{\partial z}\cdot\tfrac{\partial z}{\partial w}$. The identity $\sigma' = \sigma(1 - \sigma)$ makes logistic regression's gradient remarkably simple.
:::

## Summary

- $(f\circ g)' = f'(g(x))\,g'(x)$: outer derivative (inside unchanged) × inner derivative.
- $\tfrac{d}{dx}e^{g} = g'e^g$, $\tfrac{d}{dx}\ln g = \tfrac{g'}{g}$.
- Backpropagation = chain rule.
