## Beyond right triangles

Right-triangle trig only handles angles below $90^\circ$. But rotations, waves, sound, seasons and daily temperature cycles need **any** angle, including negative ones and angles bigger than a full turn. The unit circle extends sine and cosine to all real numbers and turns them into the functions that describe everything periodic.

:::why Sine and cosine are coordinates
Walk around a circle of radius 1 starting from $(1, 0)$, counter-clockwise. After turning by angle $\theta$, you are at the point $(\cos\theta, \sin\theta)$. That's the definition. Cosine is "how far right", sine is "how far up".
:::

## Radians

:::def Radian
An angle of **1 radian** cuts off an arc equal to the radius. A full turn is $2\pi$ radians, so
$$180^\circ = \pi\text{ rad},\qquad 1\text{ rad} \approx 57.3^\circ.$$
:::

Radians make formulas cleaner: arc length $s = r\theta$, sector area $\tfrac12 r^2\theta$, and (in calculus) $\dfrac{d}{dx}\sin x = \cos x$ — true only in radians.

| degrees | 0 | 30 | 45 | 60 | 90 | 180 | 270 | 360 |
|---|---|---|---|---|---|---|---|---|
| radians | $0$ | $\tfrac\pi6$ | $\tfrac\pi4$ | $\tfrac\pi3$ | $\tfrac\pi2$ | $\pi$ | $\tfrac{3\pi}2$ | $2\pi$ |

## The unit circle

:::def Definitions for any angle
$\cos\theta$ and $\sin\theta$ are the coordinates of the point at angle $\theta$ on the unit circle; $\tan\theta = \dfrac{\sin\theta}{\cos\theta}$.
Consequences: $\sin^2\theta + \cos^2\theta = 1$, $-1 \le \sin\theta, \cos\theta \le 1$, and both repeat every $2\pi$.
:::

:::tip Signs by quadrant
Quadrant I: all positive. II: only $\sin$ positive. III: only $\tan$ positive. IV: only $\cos$ positive.
:::

:::example Exact values
Find $\sin\tfrac{5\pi}{6}$, $\cos\tfrac{4\pi}{3}$ and $\tan\left(-\tfrac{\pi}{4}\right)$.
---
$\tfrac{5\pi}6$ is in quadrant II with reference angle $\tfrac\pi6$: $\sin = \tfrac12$.
$\tfrac{4\pi}3$: quadrant III, reference $\tfrac\pi3$: $\cos = -\tfrac12$.
$-\tfrac\pi4$: quadrant IV: $\tan = -1$.
:::

## Graphs of sine and cosine

:::def Sinusoids
$y = A\sin(B(x - C)) + D$ has **amplitude** $|A|$, **period** $\dfrac{2\pi}{B}$, phase shift $C$ and midline $y = D$.
:::

:::graph A general sinusoid
f: a*sin(b*(x - c)) + d
range: -7,7
params: a=1:-3:3; b=1:0.5:3; c=0:-3:3; d=0:-2:2
:::

:::example Modelling temperature
Daily temperature varies between 12°C (at 4 am) and 26°C (at 4 pm). Write a model with $t$ in hours.
---
Midline 19, amplitude 7, period 24, so $B = \tfrac{2\pi}{24} = \tfrac{\pi}{12}$. Maximum at $t = 16$: $T(t) = 19 + 7\cos\left(\tfrac{\pi}{12}(t - 16)\right)$.
:::

## Common mistakes

:::mistake Period as $B$
The period of $\sin(3x)$ is $\tfrac{2\pi}{3}$, not 3.
:::

:::mistake Forgetting the quadrant sign
$\cos 120^\circ = -\tfrac12$, not $+\tfrac12$.
:::

## Try it yourself

:::try
Convert $225^\circ$ to radians and $\tfrac{7\pi}{6}$ to degrees.
---
$225\cdot\tfrac{\pi}{180} = \tfrac{5\pi}4$; $\tfrac{7\pi}6\cdot\tfrac{180}\pi = 210^\circ$.
:::

:::try
Amplitude and period of $y = -3\cos(4x)$?
---
Amplitude 3, period $\tfrac{2\pi}4 = \tfrac\pi2$.
:::

:::try
If $\sin\theta = \tfrac35$ and $\theta$ is in quadrant II, find $\cos\theta$.
---
$\cos^2\theta = 1 - \tfrac9{25} = \tfrac{16}{25}$, negative in QII: $-\tfrac45$.
:::

:::ds In data science
Time series with daily, weekly or yearly cycles are modelled with sine and cosine features: e.g. `sin(2*pi*hour/24)` and `cos(2*pi*hour/24)` encode the hour so that 23:00 and 00:00 are close. The Fourier transform breaks any signal into sinusoids.
:::

## Summary

- $\pi$ rad $= 180^\circ$; on the unit circle, $(\cos\theta, \sin\theta)$ is the point at angle $\theta$.
- $\sin^2 + \cos^2 = 1$; signs depend on the quadrant.
- $A\sin(B(x - C)) + D$: amplitude $|A|$, period $2\pi/B$.
