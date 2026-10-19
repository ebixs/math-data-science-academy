## Lists of numbers with a direction

A **vector** is an ordered list of numbers. Geometrically it's an arrow with a length and a direction (a velocity, a force, a displacement). In data science, every data point is a vector: a house is (area, rooms, age, price); a word is a 300-number embedding; an image is a vector of pixel values. Linear algebra is the toolkit for working with many such vectors at once.

:::why Two views of the same object
$\mathbf v = (3, 2)$ is both an **arrow** from the origin to the point $(3, 2)$ and a **list** "3 right, 2 up". Arrows give intuition in 2D and 3D; lists let us compute in 1000 dimensions where we can't draw.
:::

## Operations

:::def Addition and scalar multiplication
For $\mathbf u = (u_1, u_2)$, $\mathbf v = (v_1, v_2)$ and a number $c$:
$$\mathbf u + \mathbf v = (u_1 + v_1,\ u_2 + v_2),\qquad c\,\mathbf v = (cv_1,\ cv_2).$$
Addition = put arrows head to tail. Scaling stretches the arrow (and flips it if $c < 0$).
:::

:::example
$\mathbf u = (1, 3)$, $\mathbf v = (4, -1)$. Find $2\mathbf u - \mathbf v$.
---
$(2, 6) - (4, -1) = (-2, 7)$.
:::

:::def Length (norm)
$$\lVert\mathbf v\rVert = \sqrt{v_1^2 + v_2^2 + \dots + v_n^2}.$$
A **unit vector** has length 1: $\hat{\mathbf v} = \dfrac{\mathbf v}{\lVert\mathbf v\rVert}$.
:::

:::example
Length of $(3, 4)$ and the unit vector in its direction.
---
$\lVert\mathbf v\rVert = 5$, $\hat{\mathbf v} = (0.6, 0.8)$.
:::

## Linear combinations and span

:::def Linear combination and span
A **linear combination** of $\mathbf v_1, \dots, \mathbf v_k$ is $c_1\mathbf v_1 + \dots + c_k\mathbf v_k$. The set of all such combinations is their **span**.
:::

- The span of one non-zero vector in 2D is a line through the origin.
- The span of two non-parallel vectors in 2D is the whole plane: any point can be reached.

:::example Reaching a point
Write $(7, 1)$ as $a(1, 1) + b(2, -1)$.
---
$a + 2b = 7$, $a - b = 1$. Subtract: $3b = 6$, $b = 2$, $a = 3$.
:::

:::def Linear independence
Vectors are **linearly independent** if none is a linear combination of the others — equivalently, $c_1\mathbf v_1 + \dots + c_k\mathbf v_k = \mathbf 0$ only when all $c_i = 0$. Independent vectors carry no redundant information.
:::

## Common mistakes

:::mistake Adding vectors of different lengths
$(1, 2) + (1, 2, 3)$ is undefined: vectors must have the same dimension.
:::

:::mistake $\lVert\mathbf u + \mathbf v\rVert = \lVert\mathbf u\rVert + \lVert\mathbf v\rVert$
Only if they point the same way. In general $\lVert\mathbf u + \mathbf v\rVert \le \lVert\mathbf u\rVert + \lVert\mathbf v\rVert$ (triangle inequality).
:::

## Try it yourself

:::try
$\mathbf a = (2, -1, 3)$. Find $\lVert\mathbf a\rVert$ and $-3\mathbf a$.
---
$\sqrt{14} \approx 3.74$; $(-6, 3, -9)$.
:::

:::try
Are $(2, 4)$ and $(-1, -2)$ independent?
---
No: $(2, 4) = -2(-1, -2)$. They lie on the same line.
:::

:::ds In data science
A dataset with $n$ rows and $d$ features is $n$ vectors in $\mathbb R^d$. NumPy arrays add and scale element-wise: `u + v`, `3 * v`, `np.linalg.norm(v)`. Redundant (dependent) features, like "price in dollars" and "price in euros", carry no new information.
:::

## Summary

- Vectors: arrows and lists; add component-wise, scale by numbers.
- Length $\lVert\mathbf v\rVert = \sqrt{\sum v_i^2}$; unit vector $\mathbf v/\lVert\mathbf v\rVert$.
- Span = all linear combinations; independence = no redundancy.
