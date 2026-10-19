## The rate of change at an instant

The derivative measures how fast a quantity changes **right now**: the speed of a car at 3:00 pm, the marginal cost of one more unit, how sensitive a model's error is to one weight. Geometrically, it is the slope of the tangent line. Optimization — the heart of machine learning — is "follow the derivative".

## Definition

:::def Derivative
$$f'(x) = \lim_{h\to 0}\frac{f(x + h) - f(x)}{h}.$$
The fraction is the slope of a secant line through $(x, f(x))$ and $(x + h, f(x + h))$; as $h\to0$ the secant becomes the **tangent**.
:::

:::example From the definition
Find $f'(x)$ for $f(x) = x^2$.
---
$\dfrac{(x + h)^2 - x^2}{h} = \dfrac{2xh + h^2}{h} = 2x + h \to 2x$.
:::

:::graph Tangent line to $x^2$ at $x = a$
f: x^2
g: 2*a*(x - a) + a^2
range: -4,4
params: a=1:-3:3
:::

## Rules

:::def Basic rules
| function | derivative |
|---|---|
| $c$ | $0$ |
| $x^n$ | $nx^{n-1}$ (any real $n$) |
| $e^x$ | $e^x$ |
| $\ln x$ | $\tfrac1x$ |
| $\sin x$ | $\cos x$ |
| $\cos x$ | $-\sin x$ |

**Linearity**: $(af + bg)' = af' + bg'$.
**Product rule**: $(fg)' = f'g + fg'$.
**Quotient rule**: $\left(\dfrac fg\right)' = \dfrac{f'g - fg'}{g^2}$.
:::

:::example
Differentiate $f(x) = 3x^4 - \dfrac{2}{x} + 5\sqrt x$.
---
Rewrite: $3x^4 - 2x^{-1} + 5x^{1/2}$. $f'(x) = 12x^3 + 2x^{-2} + \tfrac52x^{-1/2} = 12x^3 + \dfrac{2}{x^2} + \dfrac{5}{2\sqrt x}$.
:::

:::example Product and quotient
$\dfrac{d}{dx}\big(x^2e^x\big)$ and $\dfrac{d}{dx}\dfrac{x}{x + 1}$.
---
$2xe^x + x^2e^x = xe^x(x + 2)$. $\dfrac{(x + 1) - x}{(x + 1)^2} = \dfrac{1}{(x + 1)^2}$.
:::

## Tangent lines and linear approximation

The tangent at $x = a$ is $y = f(a) + f'(a)(x - a)$. Near $a$, $f(x) \approx f(a) + f'(a)(x - a)$.

:::example Estimate $\sqrt{4.1}$
---
$f(x) = \sqrt x$, $a = 4$, $f'(4) = \tfrac14$. $\sqrt{4.1} \approx 2 + 0.1\cdot\tfrac14 = 2.025$ (true value 2.02485).
:::

## Common mistakes

:::mistake $(fg)' = f'g'$
The product rule has two terms. $(x\cdot x)' = 2x$, not $1$.
:::

:::mistake Differentiating constants as variables
$\dfrac{d}{dx}e^2 = 0$ — it's a number. And $\dfrac{d}{dx}2^x \ne x2^{x-1}$ (that's the power rule applied to an exponential).
:::

## Try it yourself

:::try
Slope of $y = x^3 - 3x$ at $x = 2$?
---
$y' = 3x^2 - 3 = 9$.
:::

:::try
$\dfrac{d}{dx}(x\ln x)$.
---
$\ln x + 1$.
:::

:::try
Where is the tangent to $y = x^2 - 6x + 1$ horizontal?
---
$2x - 6 = 0$: $x = 3$.
:::

:::ds In data science
Automatic differentiation (PyTorch, JAX, TensorFlow) applies exactly these rules to compute derivatives of huge expressions. A gradient check compares them with the definition: $\tfrac{f(x + h) - f(x - h)}{2h}$ for small $h$.
:::

## Summary

- $f'(x)$ = slope of the tangent = instantaneous rate of change.
- Power, exponential, log and trig rules; linearity, product and quotient rules.
- Linear approximation: $f(x) \approx f(a) + f'(a)(x - a)$.
