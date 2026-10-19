## Any triangle, not just right ones

Surveying a field, navigating, or computing the distance between two GPS points needs trigonometry for triangles **without** a right angle. Two laws do the job: the law of sines and the law of cosines. Label the triangle with angles $A, B, C$ and opposite sides $a, b, c$.

## The law of sines

:::def Law of sines
$$\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C}.$$
Use it when you know an angle and its opposite side, plus one more piece (AAS, ASA, or SSA).
:::

:::why Why it works
Drop a height $h$ from $C$ to side $c$. In the two right triangles, $h = b\sin A$ and $h = a\sin B$. So $b\sin A = a\sin B$, i.e. $\tfrac{a}{\sin A} = \tfrac{b}{\sin B}$.
:::

:::example ASA
$A = 40^\circ$, $B = 75^\circ$, $c = 12$. Find $a$.
---
$C = 180 - 115 = 65^\circ$. $a = \dfrac{c\sin A}{\sin C} = \dfrac{12\sin40^\circ}{\sin65^\circ} \approx \dfrac{12(0.643)}{0.906} \approx 8.51$.
:::

:::tip The ambiguous case (SSA)
Given two sides and a non-included angle, there may be 0, 1 or 2 triangles, because $\sin B = \sin(180^\circ - B)$. Always check whether $180^\circ - B$ also fits.
:::

## The law of cosines

:::def Law of cosines
$$c^2 = a^2 + b^2 - 2ab\cos C.$$
Use it for SAS (two sides and the angle between) or SSS (three sides). When $C = 90^\circ$, $\cos C = 0$ and it becomes Pythagoras.
:::

:::example SAS
Two roads leave a town at an angle of $110^\circ$. After 8 km and 5 km, how far apart are two cars?
---
$c^2 = 64 + 25 - 80\cos110^\circ \approx 89 + 27.36 = 116.36$, so $c \approx 10.8$ km.
:::

:::example SSS
Sides 7, 8, 10. Largest angle?
---
Opposite 10: $\cos C = \dfrac{49 + 64 - 100}{2\cdot7\cdot8} = \dfrac{13}{112} \approx 0.116$, $C \approx 83.3^\circ$.
:::

## Area

:::def Area with an angle
$$\text{Area} = \tfrac12ab\sin C.$$
:::

:::example
Sides 6 and 9 with included angle $30^\circ$: area?
---
$\tfrac12(6)(9)\tfrac12 = 13.5$.
:::

## Common mistakes

:::mistake Using the sine law for SAS
With two sides and the included angle, no side–angle pair is known: start with the cosine law.
:::

:::mistake Forgetting the second triangle in SSA
If $\sin B = 0.8$, $B$ could be $53.1^\circ$ or $126.9^\circ$.
:::

## Try it yourself

:::try
$a = 10$, $A = 30^\circ$, $B = 45^\circ$. Find $b$.
---
$b = \dfrac{10\sin45^\circ}{\sin30^\circ} = 10\sqrt2 \approx 14.14$.
:::

:::try
Sides 5 and 7 with included angle $60^\circ$. Third side?
---
$c^2 = 25 + 49 - 70\cdot\tfrac12 = 39$, $c = \sqrt{39} \approx 6.24$.
:::

:::ds In data science
The law of cosines is behind a neat identity for vectors: $\lVert\mathbf u - \mathbf v\rVert^2 = \lVert\mathbf u\rVert^2 + \lVert\mathbf v\rVert^2 - 2\,\mathbf u\cdot\mathbf v$. It links Euclidean distance with the dot product and lets algorithms compute all pairwise distances quickly with matrix multiplication.
:::

## Summary

- Sines: $\tfrac{a}{\sin A} = \tfrac{b}{\sin B} = \tfrac{c}{\sin C}$ (watch SSA).
- Cosines: $c^2 = a^2 + b^2 - 2ab\cos C$ for SAS and SSS.
- Area $= \tfrac12ab\sin C$.
