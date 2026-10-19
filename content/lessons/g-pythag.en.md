## The most useful theorem in geometry

In a right triangle, the squares on the two short sides add up to the square on the long side. This single fact gives the distance between two points, the length of a vector, the screen size of a TV, and — in many dimensions — the Euclidean distance used by clustering and nearest-neighbour algorithms.

:::def Pythagorean theorem
In a right triangle with legs $a, b$ and hypotenuse $c$ (opposite the right angle):
$$a^2 + b^2 = c^2.$$
The **converse** also holds: if $a^2 + b^2 = c^2$, the triangle has a right angle.
:::

:::why A proof you can see
Put four copies of the triangle inside a square of side $a + b$, leaving a tilted square of side $c$ in the middle. Total area: $(a + b)^2 = 4\cdot\tfrac12ab + c^2$. Expand: $a^2 + 2ab + b^2 = 2ab + c^2$, so $a^2 + b^2 = c^2$.
:::

## Using it

:::example Missing hypotenuse
Legs 9 and 12. Hypotenuse?
---
$c = \sqrt{81 + 144} = \sqrt{225} = 15$.
:::

:::example Missing leg
A 6.5 m ladder reaches 6 m up a wall. How far is its foot from the wall?
---
$x = \sqrt{6.5^2 - 6^2} = \sqrt{42.25 - 36} = 2.5$ m.
:::

:::tip Pythagorean triples
$(3, 4, 5)$, $(5, 12, 13)$, $(8, 15, 17)$, $(7, 24, 25)$ and their multiples $(6, 8, 10)$, … appear constantly. Recognizing them saves square roots.
:::

## Distance between points

:::def Distance formula
The distance between $(x_1, y_1)$ and $(x_2, y_2)$ is
$$d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}.$$
In 3D add $(z_2 - z_1)^2$; in $n$ dimensions, add all $n$ squared differences.
:::

:::example
Distance from $(-1, 2)$ to $(5, -6)$.
---
$\sqrt{6^2 + (-8)^2} = \sqrt{100} = 10$.
:::

:::example A space diagonal
The diagonal of a $3\times4\times12$ box.
---
$\sqrt{9 + 16 + 144} = \sqrt{169} = 13$.
:::

## Common mistakes

:::mistake Adding to find a leg
For a leg, **subtract**: $b = \sqrt{c^2 - a^2}$.
:::

:::mistake $\sqrt{a^2 + b^2} = a + b$
$\sqrt{9 + 16} = 5$, not $7$.
:::

:::mistake Using it on non-right triangles
Pythagoras needs a right angle; otherwise use the law of cosines.
:::

## Try it yourself

:::try
Is a triangle with sides 7, 24, 25 right-angled?
---
$49 + 576 = 625 = 25^2$: yes.
:::

:::try
A TV is 32 inches wide and 18 high. Diagonal?
---
$\sqrt{1024 + 324} = \sqrt{1348} \approx 36.7$ inches.
:::

:::try
Find $k > 0$ so that $(1, k)$ is 5 units from $(4, 2)$.
---
$9 + (k - 2)^2 = 25 \Rightarrow k - 2 = \pm4 \Rightarrow k = 6$.
:::

:::ds In data science
The Euclidean distance $\sqrt{\sum (x_i - y_i)^2}$ between two data points is Pythagoras in $n$ dimensions. k-nearest neighbours and k-means clustering are built on it — which is why features must be on comparable scales.
:::

## Summary

- $a^2 + b^2 = c^2$ for right triangles (and conversely).
- Distance $= \sqrt{\sum(\text{differences})^2}$ in any dimension.
