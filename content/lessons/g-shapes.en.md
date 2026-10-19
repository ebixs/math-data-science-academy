## Shapes and angles

Geometry is the math of space: angles, lengths and shapes. Its rules are a model of careful reasoning — every fact follows from a few simple ones — and they underpin trigonometry, vectors and computer graphics.

:::why Angles measure turning
An angle measures how much you turn. A full turn is $360^\circ$, half a turn (a straight line) is $180^\circ$, a quarter turn (a right angle) is $90^\circ$. Almost every angle fact below is just "the turns must add up".
:::

## Angle facts

:::def Angle relationships
- Angles on a straight line add to $180^\circ$ (**supplementary**); angles in a right angle add to $90^\circ$ (**complementary**).
- Angles around a point add to $360^\circ$.
- **Vertically opposite** angles (formed by two crossing lines) are equal.
- With a line crossing two **parallel** lines: corresponding angles are equal, alternate angles are equal, and co-interior angles add to $180^\circ$.
:::

## Triangles

:::def Angle sum of a triangle
The interior angles of any triangle add to $180^\circ$. The exterior angle equals the sum of the two opposite interior angles.
:::

:::why Why 180°?
Draw a line through one vertex parallel to the opposite side. The three angles of the triangle reappear along that straight line as alternate angles — and a straight line is $180^\circ$.
:::

Types: **equilateral** (all sides equal, all angles $60^\circ$), **isosceles** (two equal sides and two equal base angles), **scalene**; and **acute**, **right**, **obtuse**.

:::def Congruent and similar triangles
**Congruent** triangles have the same shape and size (tests: SSS, SAS, ASA, RHS). **Similar** triangles have the same angles, so their sides are in the same ratio $k$; their areas are in ratio $k^2$.
:::

:::example Similar triangles
A 1.8 m person casts a 2.4 m shadow while a tree casts a 16 m shadow. How tall is the tree?
---
Same sun angle, so the triangles are similar: $\dfrac{h}{16} = \dfrac{1.8}{2.4} \Rightarrow h = 12$ m.
:::

## Polygons

:::def Interior angle sum
A polygon with $n$ sides can be split into $n - 2$ triangles from one vertex, so its interior angles add to
$$(n - 2)\times 180^\circ.$$
Each interior angle of a **regular** $n$-gon is $\dfrac{(n-2)\,180^\circ}{n}$; the exterior angles of any convex polygon add to $360^\circ$.
:::

:::example
Find one interior angle of a regular hexagon, and the number of sides of a regular polygon whose exterior angle is $24^\circ$.
---
Hexagon: $\dfrac{4 \times 180}{6} = 120^\circ$. Exterior $24^\circ$: $n = \dfrac{360}{24} = 15$ sides.
:::

## Common mistakes

:::mistake Using 360° for a triangle
Triangle: $180^\circ$; quadrilateral: $360^\circ$.
:::

:::mistake Assuming lines are parallel
Corresponding/alternate angle rules only work if the lines are known to be parallel.
:::

:::mistake Area ratio = side ratio
If sides double, area becomes $4\times$ (ratio $k^2$), volume $8\times$ ($k^3$).
:::

## Try it yourself

:::try
Two angles of a triangle are $47^\circ$ and $68^\circ$. Find the third and its exterior angle.
---
$180 - 115 = 65^\circ$; exterior angle $115^\circ$.
:::

:::try
Sum of interior angles of a decagon?
---
$8 \times 180 = 1440^\circ$.
:::

:::try
Triangles with sides 3, 4, 5 and 6, 8, 10 are similar. Compare areas.
---
Ratio $k = 2$, area ratio $4$: areas 6 and 24.
:::

:::ds In data science
Similarity and scaling are why features are standardized: shapes (patterns) stay the same while sizes change. In images, convolutional networks learn to recognize the same shape regardless of where it appears.
:::

## Summary

- Straight line $180^\circ$, full turn $360^\circ$, triangle $180^\circ$, $n$-gon $(n-2)180^\circ$.
- Parallel lines give equal corresponding and alternate angles.
- Similar figures: lengths $\times k$, areas $\times k^2$.
