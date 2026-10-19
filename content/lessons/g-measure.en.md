## Measuring in 1, 2 and 3 dimensions

Perimeter is a **length** (1D), area counts unit **squares** (2D), volume counts unit **cubes** (3D). Keeping track of dimensions tells you which formula you need and catches mistakes: an area can never come out in metres.

:::why Area is counting squares
A $5 \times 3$ rectangle holds 5 columns of 3 unit squares: 15. A parallelogram can be cut and rearranged into a rectangle with the same base and height — so its area is also base × height. A triangle is half a parallelogram.
:::

## Area formulas

| shape | area | perimeter |
|---|---|---|
| rectangle | $ab$ | $2(a + b)$ |
| parallelogram | $bh$ | sum of sides |
| triangle | $\tfrac12 bh$ | sum of sides |
| trapezoid | $\tfrac12(a + b)h$ | sum of sides |
| circle | $\pi r^2$ | $2\pi r$ (circumference) |

The height $h$ is always **perpendicular** to the base.

:::example Composite shape
A room is a $6 \times 4$ rectangle with a semicircle of diameter 4 attached to one short side. Find its area.
---
Rectangle 24. Semicircle $\tfrac12\pi(2)^2 = 2\pi \approx 6.28$. Total $\approx 30.28$ m².
:::

:::why Where $\pi r^2$ comes from
Cut a circle into many thin wedges and lay them alternately up and down. They form an almost-rectangle of height $r$ and width half the circumference, $\pi r$. Area $\approx \pi r \cdot r = \pi r^2$.
:::

## Volume and surface area

:::def Prisms and cylinders
Volume $=$ (area of cross-section) × length. Box: $abc$. Cylinder: $\pi r^2 h$.
:::

:::def Pyramids, cones and spheres
Pyramid and cone: $\tfrac13 \times$ base area $\times h$, so a cone is $\tfrac13\pi r^2h$. Sphere: $V = \tfrac43\pi r^3$, surface area $4\pi r^2$.
:::

:::example A can
A can has radius 4 cm and height 10 cm. Volume and surface area (with top and bottom)?
---
$V = \pi(16)(10) = 160\pi \approx 502.7$ cm³. Surface: two discs $2\pi(16) = 32\pi$ plus side $2\pi(4)(10) = 80\pi$; total $112\pi \approx 351.9$ cm².
:::

## Scaling

If every length is multiplied by $k$: perimeters $\times k$, areas $\times k^2$, volumes $\times k^3$. A pizza with twice the diameter has **four** times the area.

:::graph Area and volume grow faster than length
f: k*x
g: x^2
h: x^3/3
range: 0,4
params: k=1:0.5:3
:::

## Common mistakes

:::mistake Slant height instead of height
For a triangle or parallelogram, use the perpendicular height, not the slanted side.
:::

:::mistake Diameter vs radius
$\pi r^2$ uses the radius. A circle of diameter 10 has area $25\pi$, not $100\pi$.
:::

:::mistake Mixing units
Convert first: $1\text{ m}^2 = 10\,000\text{ cm}^2$ and $1\text{ m}^3 = 1000$ litres.
:::

## Try it yourself

:::try
Trapezoid with parallel sides 7 and 13 and height 4: area?
---
$\tfrac12(20)(4) = 40$.
:::

:::try
A circle has circumference $10\pi$. Area?
---
$r = 5$, area $25\pi \approx 78.5$.
:::

:::try
A cone has radius 3 and height 8. Volume?
---
$\tfrac13\pi(9)(8) = 24\pi \approx 75.4$.
:::

:::ds In data science
Units and scaling matter in features: area grows like length², so a model using both "side length" and "area" sees a non-linear relation. Histograms represent probability as **area**, which is why bar width matters.
:::

## Summary

- Perimeter (length), area (squares), volume (cubes) — check units.
- Triangle $\tfrac12bh$, circle $\pi r^2$, prism base × length, cone/pyramid $\tfrac13$ of that, sphere $\tfrac43\pi r^3$.
- Scale by $k$: area $k^2$, volume $k^3$.
