## The best possible answer when there is no exact one

Fit a line through 100 data points: 100 equations, 2 unknowns. There is no exact solution — the points aren't on one line. **Least squares** finds the closest possible answer, and geometrically it is a **projection**: drop a perpendicular from the data vector onto the space of all possible predictions. This one idea is linear regression.

## Projection onto a line

:::def Projection onto a vector
The projection of $\mathbf b$ onto the line through $\mathbf a$ is
$$\mathbf p = \frac{\mathbf a\cdot\mathbf b}{\mathbf a\cdot\mathbf a}\,\mathbf a,$$
and the error $\mathbf e = \mathbf b - \mathbf p$ is **perpendicular** to $\mathbf a$.
:::

:::why Shortest distance = perpendicular
The closest point on a line to $\mathbf b$ is where the connecting segment meets the line at a right angle — Pythagoras says any other point is farther. That orthogonality condition, $\mathbf a\cdot(\mathbf b - \mathbf p) = 0$, gives the formula.
:::

## Projection onto a subspace

For $A\mathbf x = \mathbf b$ with no solution, the possible outputs $A\mathbf x$ form the **column space** of $A$. We look for $\hat{\mathbf x}$ such that $A\hat{\mathbf x}$ is closest to $\mathbf b$. The error must be perpendicular to every column: $A^\top(\mathbf b - A\hat{\mathbf x}) = \mathbf 0$.

:::def Normal equations
$$A^\top A\,\hat{\mathbf x} = A^\top\mathbf b,\qquad \hat{\mathbf x} = (A^\top A)^{-1}A^\top\mathbf b.$$
The projection is $\mathbf p = A\hat{\mathbf x}$ and $\hat{\mathbf x}$ minimizes $\lVert A\mathbf x - \mathbf b\rVert^2$.
:::

:::example Fitting a line
Fit $y = c + mx$ to $(0, 1), (1, 2), (2, 4)$.
---
$A = \begin{bmatrix}1 & 0\\ 1 & 1\\ 1 & 2\end{bmatrix}$, $\mathbf b = (1, 2, 4)$.
$A^\top A = \begin{bmatrix}3 & 3\\ 3 & 5\end{bmatrix}$, $A^\top\mathbf b = (7, 10)$.
Solve: $3c + 3m = 7$, $3c + 5m = 10 \Rightarrow m = 1.5$, $c = \tfrac{5}{6}$. Line: $y \approx 0.833 + 1.5x$.
Residuals $(0.167, -0.333, 0.167)$ sum to 0 and are perpendicular to $(0, 1, 2)$ ✓.
:::

:::graph Least-squares line through three points
f: m*x + c
points: 0,1; 1,2; 2,4
range: -1,3
params: m=1.5:0:3; c=0.83:-1:2
:::

## Orthogonal bases make it easy

If the columns of $Q$ are orthonormal ($Q^\top Q = I$), the normal equations simplify to $\hat{\mathbf x} = Q^\top\mathbf b$ — no inverse needed. The QR decomposition $A = QR$ is how software solves least squares stably.

## Common mistakes

:::mistake Using $A^{-1}$ for a non-square $A$
A tall matrix has no inverse; use the normal equations or QR.
:::

:::mistake Least squares minimizes vertical distances only
It minimizes errors in $y$, not perpendicular distances to the line (that's PCA / total least squares).
:::

## Try it yourself

:::try
Project $(2, 3)$ onto $(1, 1)$.
---
$\tfrac{5}{2}(1, 1) = (2.5, 2.5)$; error $(-0.5, 0.5)$ ⟂ $(1, 1)$ ✓.
:::

:::try
For least squares, what is $A^\top\mathbf e$?
---
The zero vector: the error is orthogonal to the column space.
:::

:::ds In data science
`np.linalg.lstsq(A, b, rcond=None)` solves least squares; scikit-learn's `LinearRegression` does the same. With several features, $A$ has one column per feature plus a column of ones for the intercept. The CO₂ project in the notebook fits linear and quadratic trends this way.
:::

## Summary

- Projection = closest point; the error is perpendicular.
- Normal equations $A^\top A\hat{\mathbf x} = A^\top\mathbf b$ give the least-squares solution.
- Linear regression is projection of $\mathbf y$ onto the column space of $X$.
