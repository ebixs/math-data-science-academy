## Equations that are always true

An **identity** holds for every angle, like $\sin^2\theta + \cos^2\theta = 1$. Identities let you rewrite trig expressions into simpler forms, solve trig equations, and — in calculus and signal processing — turn products of waves into sums.

:::why Everything comes from the unit circle
The point $(\cos\theta, \sin\theta)$ is at distance 1 from the origin, so by Pythagoras $\cos^2\theta + \sin^2\theta = 1$. Rotating by $\alpha$ then by $\beta$ is the same as rotating by $\alpha + \beta$; writing that down in coordinates gives the addition formulas.
:::

## Core identities

:::def Pythagorean identities
$$\sin^2\theta + \cos^2\theta = 1,\qquad 1 + \tan^2\theta = \sec^2\theta,\qquad 1 + \cot^2\theta = \csc^2\theta.$$
:::

:::def Symmetry
$\sin(-\theta) = -\sin\theta$ (odd), $\cos(-\theta) = \cos\theta$ (even), $\sin\left(\tfrac\pi2 - \theta\right) = \cos\theta$.
:::

:::def Addition and double-angle formulas
$$\sin(\alpha \pm \beta) = \sin\alpha\cos\beta \pm \cos\alpha\sin\beta,$$
$$\cos(\alpha \pm \beta) = \cos\alpha\cos\beta \mp \sin\alpha\sin\beta,$$
$$\sin2\theta = 2\sin\theta\cos\theta,\qquad \cos2\theta = \cos^2\theta - \sin^2\theta = 1 - 2\sin^2\theta = 2\cos^2\theta - 1.$$
:::

:::example An exact value
Find $\sin 75^\circ$.
---
$\sin(45^\circ + 30^\circ) = \tfrac{\sqrt2}2\cdot\tfrac{\sqrt3}2 + \tfrac{\sqrt2}2\cdot\tfrac12 = \dfrac{\sqrt6 + \sqrt2}{4} \approx 0.966$.
:::

:::example Proving an identity
Show $\dfrac{1 - \cos2\theta}{\sin2\theta} = \tan\theta$.
---
Work on the left side only: $\dfrac{1 - (1 - 2\sin^2\theta)}{2\sin\theta\cos\theta} = \dfrac{2\sin^2\theta}{2\sin\theta\cos\theta} = \dfrac{\sin\theta}{\cos\theta} = \tan\theta$.
:::

## Solving trig equations

Trig equations usually have **infinitely many** solutions because the functions repeat. Find the solutions in one period, then add multiples of the period.

:::example
Solve $2\sin x - 1 = 0$ for $0 \le x < 2\pi$, then in general.
---
$\sin x = \tfrac12$: $x = \tfrac\pi6$ or $x = \tfrac{5\pi}6$. General: $x = \tfrac\pi6 + 2k\pi$ or $x = \tfrac{5\pi}6 + 2k\pi$.
:::

:::example Using an identity
Solve $2\cos^2x - \cos x - 1 = 0$ for $0 \le x < 2\pi$.
---
Quadratic in $\cos x$: $(2\cos x + 1)(\cos x - 1) = 0$. $\cos x = 1$ gives $x = 0$; $\cos x = -\tfrac12$ gives $x = \tfrac{2\pi}3, \tfrac{4\pi}3$.
:::

:::graph Where does $\sin x$ equal $c$?
f: sin(x)
g: c
range: -7,7
params: c=0.5:-1.2:1.2
:::

## Common mistakes

:::mistake $\sin(a + b) = \sin a + \sin b$
Check: $\sin(30^\circ + 60^\circ) = 1$, but $\tfrac12 + \tfrac{\sqrt3}2 \approx 1.37$.
:::

:::mistake Dividing by a trig function
From $\sin x\cos x = \sin x$, dividing by $\sin x$ loses the solutions with $\sin x = 0$. Factor instead: $\sin x(\cos x - 1) = 0$.
:::

:::mistake Only one solution
$\sin x = \tfrac12$ has two solutions per period.
:::

## Try it yourself

:::try
Simplify $\dfrac{\sin^2x}{1 - \cos x}$.
---
$\dfrac{(1 - \cos x)(1 + \cos x)}{1 - \cos x} = 1 + \cos x$.
:::

:::try
If $\cos\theta = \tfrac35$, $\theta$ acute, find $\sin2\theta$.
---
$\sin\theta = \tfrac45$, so $\sin2\theta = 2\cdot\tfrac45\cdot\tfrac35 = \tfrac{24}{25}$.
:::

:::try
Solve $\tan x = -\sqrt3$ for $0 \le x < 2\pi$.
---
$x = \tfrac{2\pi}3$ and $x = \tfrac{5\pi}3$ (period of $\tan$ is $\pi$).
:::

:::ds In data science
Product-to-sum identities are the reason the Fourier transform works: multiplying a signal by $\sin$ and $\cos$ of different frequencies isolates each frequency. Audio compression, spectrograms and seasonal decomposition of time series all rely on it.
:::

## Summary

- $\sin^2 + \cos^2 = 1$; addition and double-angle formulas rewrite expressions.
- Prove identities by transforming one side.
- Solve in one period, then add multiples of the period; factor, don't divide.
