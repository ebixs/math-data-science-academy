## Every matrix is rotate–stretch–rotate

Eigen-decomposition works for some square matrices. The **singular value decomposition** (SVD) works for **every** matrix, of any shape. It says any linear transformation is a rotation, then a stretch along perpendicular axes, then another rotation. It's behind PCA, image compression, recommender systems, latent semantic analysis, and numerically stable least squares.

:::def Singular value decomposition
Any $m\times n$ matrix can be written
$$A = U\Sigma V^\top,$$
where $U$ ($m\times m$) and $V$ ($n\times n$) are orthogonal and $\Sigma$ is diagonal with **singular values** $\sigma_1 \ge \sigma_2 \ge \dots \ge 0$.
:::

:::why Where they come from
$A^\top A$ is symmetric, so it has orthogonal eigenvectors — these are the columns of $V$. Its eigenvalues are $\sigma_i^2$. Then $\mathbf u_i = A\mathbf v_i/\sigma_i$ gives the columns of $U$. So $A\mathbf v_i = \sigma_i\mathbf u_i$: $A$ sends the perpendicular directions $\mathbf v_i$ to perpendicular directions $\mathbf u_i$, stretched by $\sigma_i$.
:::

## Low-rank approximation

Writing the SVD as a sum,
$$A = \sigma_1\mathbf u_1\mathbf v_1^\top + \sigma_2\mathbf u_2\mathbf v_2^\top + \dots$$
each term is a simple rank-1 "layer". Keeping only the first $k$ layers gives the **best** rank-$k$ approximation of $A$ (Eckart–Young theorem).

:::example Image compression
A $1000\times1000$ grayscale image has $10^6$ numbers. Keeping $k = 50$ singular triplets stores $50(1000 + 1000 + 1) \approx 10^5$ numbers — 10× smaller, usually still clearly recognizable.
:::

## PCA via SVD

:::def PCA
Centre the data matrix $X$ ($n$ rows = samples, $d$ columns = features, each column with mean 0). Then
- the principal directions are the columns of $V$ (right singular vectors);
- the variance along direction $i$ is $\lambda_i = \dfrac{\sigma_i^2}{n - 1}$ (or $\tfrac{\sigma_i^2}{n}$ with the population convention);
- the **explained-variance ratio** of component $i$ is $\dfrac{\sigma_i^2}{\sum_j\sigma_j^2}$;
- the scores (coordinates in the new axes) are $XV = U\Sigma$.
:::

:::example
Singular values of a centred dataset are $10, 5, 1$. How much variance do the first two components explain?
---
$\dfrac{100 + 25}{100 + 25 + 1} = \dfrac{125}{126} \approx 99.2\%$. Two dimensions capture almost everything.
:::

:::tip Standardize first
If features have different units (cm vs kg), standardize them before PCA; otherwise the feature with the biggest numbers dominates.
:::

## Common mistakes

:::mistake Singular values = eigenvalues of $A$
They are square roots of the eigenvalues of $A^\top A$. For non-symmetric $A$ they differ from $A$'s eigenvalues.
:::

:::mistake Forgetting to centre
PCA on uncentred data finds the direction of the mean, not of the variance.
:::

## Try it yourself

:::try
Singular values of $\begin{bmatrix}3 & 0\\ 0 & -2\end{bmatrix}$?
---
$3$ and $2$ (absolute values; signs go into $U$ or $V$).
:::

:::try
A rank-1 approximation keeps how many numbers for a $100\times 40$ matrix?
---
$100 + 40 + 1 = 141$ instead of 4000.
:::

:::ds In data science
`U, s, Vt = np.linalg.svd(X, full_matrices=False)`; scikit-learn's `PCA` uses exactly this. The wine PCA project in the Python notebook computes PCA both with eigenvectors and with SVD and shows they agree.
:::

## Summary

- $A = U\Sigma V^\top$ for every matrix: rotate, stretch, rotate.
- Truncated SVD = best low-rank approximation.
- PCA: centre, SVD, directions = $V$, variances $\propto \sigma_i^2$.
