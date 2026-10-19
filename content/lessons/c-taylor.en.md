## Replacing a hard function with a polynomial

How does a calculator compute $e^{0.3}$ or $\sin 1$? It uses polynomials. A **Taylor series** rebuilds a smooth function from its derivatives at one point. Near that point, a few terms already give an excellent approximation — the idea behind linearization, Newton's method, and why gradient descent and second-order optimizers work.

:::why Matching derivatives
The tangent line matches $f$'s value and slope at $a$. A parabola can also match the curvature ($f''$). A cubic matches $f'''$ too… Each extra term matches one more derivative and hugs the curve over a wider range.
:::

## Taylor polynomials

:::def Taylor series about $a$
$$f(x) = f(a) + f'(a)(x - a) + \frac{f''(a)}{2!}(x - a)^2 + \frac{f'''(a)}{3!}(x - a)^3 + \dots = \sum_{n=0}^\infty \frac{f^{(n)}(a)}{n!}(x - a)^n.$$
With $a = 0$ it's called a **Maclaurin series**. Stopping after the $(x - a)^n$ term gives the degree-$n$ Taylor polynomial $T_n$.
:::

:::def Famous series
$$e^x = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \dots$$
$$\sin x = x - \frac{x^3}{3!} + \frac{x^5}{5!} - \dots,\qquad \cos x = 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \dots$$
$$\frac{1}{1 - x} = 1 + x + x^2 + \dots\ (|x| < 1),\qquad \ln(1 + x) = x - \frac{x^2}{2} + \frac{x^3}{3} - \dots\ (|x| < 1).$$
:::

:::example Estimate $e^{0.1}$
---
$1 + 0.1 + 0.005 + 0.000167 \approx 1.105167$ (true: 1.105171).
:::

:::example Build one
Taylor polynomial of degree 2 for $\sqrt x$ about $a = 4$.
---
$f(4) = 2$, $f'(x) = \tfrac12x^{-1/2} \Rightarrow \tfrac14$, $f''(x) = -\tfrac14x^{-3/2} \Rightarrow -\tfrac1{32}$.
$T_2(x) = 2 + \tfrac14(x - 4) - \tfrac{1}{64}(x - 4)^2$.
:::

:::graph Taylor polynomials of $\sin x$
f: sin(x)
g: x - x^3/6
h: x - x^3/6 + x^5/120
range: -6,6
:::

## How good is the approximation?

The error of $T_n$ is roughly the next term: about $\dfrac{f^{(n+1)}(c)}{(n+1)!}(x - a)^{n+1}$ for some $c$ between $a$ and $x$. Close to $a$ and with large $n$, the error is tiny; far away it can blow up. Some series only converge in an interval (radius of convergence), like $\tfrac{1}{1 - x}$ for $|x| < 1$.

## Common mistakes

:::mistake Forgetting the factorials
The $x^n$ coefficient is $\tfrac{f^{(n)}(a)}{n!}$, not $f^{(n)}(a)$.
:::

:::mistake Using a series outside its interval
$\ln(1 + x)$'s series diverges for $x > 1$.
:::

## Try it yourself

:::try
First three non-zero terms of $e^{-x^2}$.
---
Substitute $-x^2$ into $e^u$: $1 - x^2 + \tfrac{x^4}{2}$.
:::

:::try
Use $\sin x \approx x - \tfrac{x^3}{6}$ for $\sin 0.5$.
---
$0.5 - 0.02083 = 0.47917$ (true 0.47943).
:::

:::ds In data science
Gradient descent uses the first-order (linear) Taylor approximation of the loss; Newton's method uses the second-order (quadratic) one, $L(\mathbf w + \Delta) \approx L + \nabla L\cdot\Delta + \tfrac12\Delta^\top H\Delta$. The "delta method" in statistics approximates the variance of $g(\bar X)$ by $g'(\mu)^2\operatorname{Var}(\bar X)$.
:::

## Summary

- $f(x) \approx \sum_{k\le n}\tfrac{f^{(k)}(a)}{k!}(x - a)^k$ near $a$.
- Know $e^x$, $\sin x$, $\cos x$, $\tfrac1{1-x}$, $\ln(1+x)$.
- First-order = tangent line; second-order adds curvature.
