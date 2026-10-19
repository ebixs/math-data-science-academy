## Measuring alignment

How similar are two documents? Is a force pushing along the direction of motion or against it? How much of a vector lies along another? The **dot product** answers all of these with one number — and it is the single most common operation in machine learning (every neuron computes one).

## Definition

:::def Dot product
$$\mathbf u\cdot\mathbf v = u_1v_1 + u_2v_2 + \dots + u_nv_n.$$
Geometrically,
$$\mathbf u\cdot\mathbf v = \lVert\mathbf u\rVert\,\lVert\mathbf v\rVert\cos\theta,$$
where $\theta$ is the angle between them.
:::

:::why Why the two formulas agree
By the law of cosines, $\lVert\mathbf u - \mathbf v\rVert^2 = \lVert\mathbf u\rVert^2 + \lVert\mathbf v\rVert^2 - 2\lVert\mathbf u\rVert\lVert\mathbf v\rVert\cos\theta$. Expanding the left side component by component gives $\lVert\mathbf u\rVert^2 + \lVert\mathbf v\rVert^2 - 2(u_1v_1 + \dots + u_nv_n)$. Compare the two.
:::

:::def Reading the sign
- $\mathbf u\cdot\mathbf v > 0$: angle < 90°, they point roughly the same way.
- $\mathbf u\cdot\mathbf v = 0$: **orthogonal** (perpendicular).
- $\mathbf u\cdot\mathbf v < 0$: angle > 90°.

Also $\mathbf v\cdot\mathbf v = \lVert\mathbf v\rVert^2$.
:::

:::example Angle between vectors
$\mathbf u = (1, 2, 2)$, $\mathbf v = (2, 0, 1)$. Angle?
---
$\mathbf u\cdot\mathbf v = 2 + 0 + 2 = 4$, $\lVert\mathbf u\rVert = 3$, $\lVert\mathbf v\rVert = \sqrt5$. $\cos\theta = \tfrac{4}{3\sqrt5} \approx 0.596$, $\theta \approx 53.4^\circ$.
:::

:::example Orthogonal?
Find $k$ so that $(3, k)$ is perpendicular to $(2, -6)$.
---
$6 - 6k = 0 \Rightarrow k = 1$.
:::

## Projection

:::def Scalar and vector projection
The component of $\mathbf u$ along $\mathbf v$ is $\dfrac{\mathbf u\cdot\mathbf v}{\lVert\mathbf v\rVert}$, and the projection vector is
$$\operatorname{proj}_{\mathbf v}\mathbf u = \frac{\mathbf u\cdot\mathbf v}{\mathbf v\cdot\mathbf v}\,\mathbf v.$$
:::

:::example
Project $(4, 3)$ onto $(1, 0)$ and onto $(1, 1)$.
---
Onto $(1, 0)$: $(4, 0)$. Onto $(1, 1)$: $\tfrac{7}{2}(1, 1) = (3.5, 3.5)$.
:::

## Cosine similarity

:::def Cosine similarity
$$\cos\theta = \frac{\mathbf u\cdot\mathbf v}{\lVert\mathbf u\rVert\,\lVert\mathbf v\rVert}\in[-1, 1].$$
It compares **direction** only, ignoring length.
:::

:::example Documents as word counts
Doc A has counts (data: 3, model: 2, cat: 0), doc B (6, 4, 0), doc C (0, 1, 5). Which is most similar to A?
---
B is exactly $2\times$A, so $\cos = 1$. With C: $\tfrac{2}{\sqrt{13}\sqrt{26}} \approx 0.11$. B is the near-duplicate even though it's twice as long.
:::

## Common mistakes

:::mistake The dot product is a vector
It's a **number** (scalar).
:::

:::mistake Orthogonal means "unrelated" in every sense
In statistics, uncorrelated centred variables are orthogonal vectors — but they may still be dependent in a non-linear way.
:::

## Try it yourself

:::try
$(2, -1)\cdot(3, 4)$?
---
$6 - 4 = 2$.
:::

:::try
Unit vectors $\mathbf a, \mathbf b$ have $\mathbf a\cdot\mathbf b = -1$. What's the angle?
---
$\cos\theta = -1$: $180^\circ$, opposite directions.
:::

:::ds In data science
A linear model computes $\mathbf w\cdot\mathbf x + b$; a neuron applies a function to it. Recommendation systems and search engines rank items by cosine similarity of embeddings: `np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v))`.
:::

## Summary

- $\mathbf u\cdot\mathbf v = \sum u_iv_i = \lVert\mathbf u\rVert\lVert\mathbf v\rVert\cos\theta$.
- Zero dot product ⇔ perpendicular.
- Projection $\tfrac{\mathbf u\cdot\mathbf v}{\mathbf v\cdot\mathbf v}\mathbf v$; cosine similarity compares directions.
