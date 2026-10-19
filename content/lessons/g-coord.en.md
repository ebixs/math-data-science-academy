## Geometry with numbers

Descartes' idea: give every point coordinates $(x, y)$ and geometric questions become algebra. Is a quadrilateral a parallelogram? Compare slopes. Where do two lines meet? Solve a system. Is a point inside a circle? Compare a distance with the radius. This is also exactly how data lives: each row of a dataset is a point in coordinate space.

## Key formulas

:::def Midpoint, distance, slope
For $A(x_1, y_1)$ and $B(x_2, y_2)$:
- midpoint $M = \left(\dfrac{x_1 + x_2}{2}, \dfrac{y_1 + y_2}{2}\right)$;
- distance $AB = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$;
- slope $m = \dfrac{y_2 - y_1}{x_2 - x_1}$.
:::

:::example Classify a quadrilateral
$A(0, 0)$, $B(4, 1)$, $C(5, 5)$, $D(1, 4)$. What kind of quadrilateral?
---
All sides: $AB = BC = CD = DA = \sqrt{17}$, so it is a rhombus. Diagonals: $AC = \sqrt{50}$, $BD = \sqrt{18}$ — unequal, so not a square. (Also slopes: $m_{AC} = 1$, $m_{BD} = -1$, perpendicular diagonals, as in every rhombus.)
:::

:::example Perpendicular bisector
Find the perpendicular bisector of $A(1, 2)$, $B(7, 6)$.
---
Midpoint $(4, 4)$, slope $AB = \tfrac{4}{6} = \tfrac23$, perpendicular slope $-\tfrac32$: $y - 4 = -\tfrac32(x - 4)$, i.e. $y = -\tfrac32 x + 10$. Every point on it is equally far from $A$ and $B$.
:::

## Circles

:::def Equation of a circle
The circle with centre $(h, k)$ and radius $r$ is the set of points at distance $r$ from the centre:
$$(x - h)^2 + (y - k)^2 = r^2.$$
:::

:::example Completing the square
Find the centre and radius of $x^2 + y^2 - 6x + 4y - 12 = 0$.
---
$(x^2 - 6x + 9) + (y^2 + 4y + 4) = 12 + 9 + 4$, so $(x - 3)^2 + (y + 2)^2 = 25$. Centre $(3, -2)$, radius 5.
:::

:::example Point inside or outside?
Is $(6, 1)$ inside that circle?
---
Distance² from the centre: $9 + 9 = 18 < 25$: inside.
:::

## Area from coordinates

:::def Shoelace formula
For a polygon with vertices $(x_1,y_1), \dots, (x_n, y_n)$ in order:
$$\text{Area} = \tfrac12\left|\sum_{i=1}^n (x_iy_{i+1} - x_{i+1}y_i)\right|,\quad (x_{n+1}, y_{n+1}) = (x_1, y_1).$$
:::

:::example Triangle $(0,0)$, $(4,0)$, $(1,3)$
---
$\tfrac12|0\cdot0 - 4\cdot0 + 4\cdot3 - 1\cdot0 + 1\cdot0 - 0\cdot3| = \tfrac12(12) = 6$.
:::

## Common mistakes

:::mistake Sign in the circle equation
$(x + 2)^2 + (y - 1)^2 = 9$ has centre $(-2, 1)$, radius 3 (not 9).
:::

:::mistake Midpoint as a difference
The midpoint averages coordinates; it doesn't subtract them.
:::

## Try it yourself

:::try
$M(2, -1)$ is the midpoint of $A(-3, 4)$ and $B$. Find $B$.
---
$B = (2\cdot2 + 3, 2\cdot(-1) - 4) = (7, -6)$.
:::

:::try
Equation of the circle with diameter from $(1, 1)$ to $(7, 9)$.
---
Centre $(4, 5)$, radius $\tfrac12\sqrt{36 + 64} = 5$: $(x - 4)^2 + (y - 5)^2 = 25$.
:::

:::ds In data science
A dataset with two numeric columns is a cloud of points in the plane; with $d$ columns, a cloud in $d$-dimensional space. "Is this point within distance $r$ of a centroid?" is how k-means assigns clusters and how anomaly detection flags outliers.
:::

## Summary

- Midpoint = average, distance = Pythagoras, slope = rise/run.
- Circle: $(x - h)^2 + (y - k)^2 = r^2$; complete the square to find centre and radius.
- Shoelace formula gives polygon areas from coordinates.
