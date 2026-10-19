## Measuring the unreachable

How tall is a mountain you can't climb? How far is a ship? Ancient surveyors answered with **similar triangles**: all right triangles with the same angle have the same side ratios. Those ratios are sine, cosine and tangent — and they let you find lengths from angles and angles from lengths.

:::why The ratios depend only on the angle
Take any right triangle with a $30^\circ$ angle. Big or small, the side opposite $30^\circ$ is always exactly half the hypotenuse. So "opposite ÷ hypotenuse" is a property of the **angle**, not the triangle. We call it $\sin 30^\circ = 0.5$.
:::

## The three ratios

:::def SOH-CAH-TOA
For an acute angle $\theta$ in a right triangle:
$$\sin\theta = \frac{\text{opposite}}{\text{hypotenuse}},\qquad \cos\theta = \frac{\text{adjacent}}{\text{hypotenuse}},\qquad \tan\theta = \frac{\text{opposite}}{\text{adjacent}} = \frac{\sin\theta}{\cos\theta}.$$
:::

:::def Special angles
| $\theta$ | $\sin\theta$ | $\cos\theta$ | $\tan\theta$ |
|---|---|---|---|
| $30^\circ$ | $\tfrac12$ | $\tfrac{\sqrt3}{2}$ | $\tfrac{1}{\sqrt3}$ |
| $45^\circ$ | $\tfrac{\sqrt2}{2}$ | $\tfrac{\sqrt2}{2}$ | $1$ |
| $60^\circ$ | $\tfrac{\sqrt3}{2}$ | $\tfrac12$ | $\sqrt3$ |

They come from half an equilateral triangle (30–60–90) and half a square (45–45–90).
:::

## Finding sides

:::example Height of a tree
From 20 m away, the angle of elevation to the top of a tree is $35^\circ$. How tall is the tree?
---
$\tan 35^\circ = \dfrac{h}{20} \Rightarrow h = 20\tan35^\circ \approx 20(0.700) = 14.0$ m.
:::

:::example A ramp
A 4 m ramp rises at $10^\circ$. How high does it reach?
---
$h = 4\sin10^\circ \approx 0.69$ m.
:::

## Finding angles

Use the inverse functions $\sin^{-1}$, $\cos^{-1}$, $\tan^{-1}$.

:::example
A ladder 5 m long reaches 4.2 m up a wall. What angle does it make with the ground?
---
$\sin\theta = \dfrac{4.2}{5} = 0.84 \Rightarrow \theta = \sin^{-1}(0.84) \approx 57.1^\circ$.
:::

:::tip Choosing the ratio
Label the sides relative to the angle (opposite, adjacent, hypotenuse), see which two are involved (one known, one wanted), and pick the ratio that uses exactly those two.
:::

## Common mistakes

:::mistake Calculator in radians
$\sin 30$ in radian mode is $-0.988$. Check your calculator is in degrees (or convert).
:::

:::mistake Wrong "adjacent"
Opposite and adjacent depend on which angle you're using; the hypotenuse is always opposite the right angle.
:::

:::mistake $\sin^{-1}x = \dfrac{1}{\sin x}$
$\sin^{-1}$ is the inverse function (arcsin), not the reciprocal.
:::

## Try it yourself

:::try
In a right triangle, the hypotenuse is 10 and one angle is $60^\circ$. Find the side opposite it.
---
$10\sin60^\circ = 5\sqrt3 \approx 8.66$.
:::

:::try
A kite string is 50 m long at $40^\circ$ to the ground. Height of the kite?
---
$50\sin40^\circ \approx 32.1$ m.
:::

:::try
Legs 7 and 24. Find the smaller acute angle.
---
$\tan\theta = \tfrac{7}{24} \Rightarrow \theta \approx 16.3^\circ$.
:::

:::ds In data science
The cosine of the angle between two vectors measures their similarity: **cosine similarity** compares documents, users and embeddings by direction, ignoring length. It is the same cosine — adjacent over hypotenuse — generalized to many dimensions.
:::

## Summary

- $\sin = \tfrac{\text{opp}}{\text{hyp}}$, $\cos = \tfrac{\text{adj}}{\text{hyp}}$, $\tan = \tfrac{\text{opp}}{\text{adj}}$.
- Know the 30°, 45°, 60° values.
- Use the ratio for sides, the inverse function for angles; check degree mode.
