## Directions that don't turn

Most vectors change direction when a matrix acts on them. But some special directions are only **stretched**: $A\mathbf v = \lambda\mathbf v$. These **eigenvectors** and their stretch factors, the **eigenvalues**, reveal what a transformation really does. They power PCA, Google's PageRank, vibration analysis, Markov chains and the stability of dynamical systems.

:::def Eigenvalue and eigenvector
A non-zero vector $\mathbf v$ is an **eigenvector** of a square matrix $A$ with **eigenvalue** $\lambda$ if
$$A\mathbf v = \lambda\mathbf v.$$
:::

:::why A picture
$A = \begin{bmatrix}3 & 0\\ 0 & 1\end{bmatrix}$ stretches the $x$-direction by 3 and leaves the $y$-direction alone. So $(1, 0)$ is an eigenvector with $\lambda = 3$ and $(0, 1)$ is one with $\lambda = 1$. Any other vector, like $(1, 1) \to (3, 1)$, gets turned.
:::

## Finding eigenvalues

$A\mathbf v = \lambda\mathbf v \iff (A - \lambda I)\mathbf v = \mathbf 0$ has a non-zero solution $\iff A - \lambda I$ is singular:

:::def Characteristic equation
$$\det(A - \lambda I) = 0.$$
For $2\times2$: $\lambda^2 - (\operatorname{tr}A)\lambda + \det A = 0$, where $\operatorname{tr}A = a + d$.
:::

:::example
Find the eigenvalues and eigenvectors of $A = \begin{bmatrix}4 & 1\\ 2 & 3\end{bmatrix}$.
---
$\operatorname{tr} = 7$, $\det = 10$: $\lambda^2 - 7\lambda + 10 = 0 \Rightarrow \lambda = 5, 2$.
$\lambda = 5$: $(A - 5I)\mathbf v = \begin{bmatrix}-1 & 1\\ 2 & -2\end{bmatrix}\mathbf v = 0 \Rightarrow \mathbf v = (1, 1)$.
$\lambda = 2$: $\begin{bmatrix}2 & 1\\ 2 & 1\end{bmatrix}\mathbf v = 0 \Rightarrow \mathbf v = (1, -2)$.
Check: $A(1, 1) = (5, 5) = 5(1, 1)$ ✓.
:::

:::tip Quick checks
Sum of eigenvalues = trace; product = determinant. Here $5 + 2 = 7$ and $5\cdot2 = 10$ ✓.
:::

## Why they matter: powers of a matrix

If $\mathbf x = c_1\mathbf v_1 + c_2\mathbf v_2$, then
$$A^k\mathbf x = c_1\lambda_1^k\mathbf v_1 + c_2\lambda_2^k\mathbf v_2.$$
After many steps the term with the largest $|\lambda|$ dominates. That's why repeated multiplication (Markov chains, PageRank, the "power method") converges to the top eigenvector.

:::def Diagonalization
If $A$ has $n$ independent eigenvectors (columns of $P$) with eigenvalues on the diagonal of $D$: $A = PDP^{-1}$ and $A^k = PD^kP^{-1}$.
:::

## Symmetric matrices

:::def Spectral theorem
A real **symmetric** matrix ($A = A^\top$) has real eigenvalues and orthogonal eigenvectors: $A = Q\Lambda Q^\top$ with $Q$ orthogonal. Covariance matrices are symmetric — which is what makes PCA work.
:::

## Common mistakes

:::mistake The zero vector as an eigenvector
Eigenvectors must be non-zero (though $\lambda = 0$ is allowed).
:::

:::mistake Eigenvectors are unique
Any non-zero multiple of an eigenvector is also an eigenvector; $(2, 2)$ works as well as $(1, 1)$.
:::

## Try it yourself

:::try
Eigenvalues of $\begin{bmatrix}2 & 0\\ 0 & -3\end{bmatrix}$?
---
Diagonal entries: 2 and $-3$.
:::

:::try
Eigenvalues of $\begin{bmatrix}1 & 2\\ 2 & 1\end{bmatrix}$ and their eigenvectors.
---
$\lambda^2 - 2\lambda - 3 = 0$: $\lambda = 3$ with $(1, 1)$, $\lambda = -1$ with $(1, -1)$ — orthogonal, as for any symmetric matrix.
:::

:::ds In data science
`np.linalg.eig(A)` returns eigenvalues and eigenvectors; for symmetric matrices use `np.linalg.eigh`. In PCA, the eigenvectors of the covariance matrix are the principal directions and the eigenvalues are the variance along each — see the wine PCA project in the Python notebook.
:::

## Summary

- $A\mathbf v = \lambda\mathbf v$: directions only stretched by $A$.
- Solve $\det(A - \lambda I) = 0$; then $(A - \lambda I)\mathbf v = 0$.
- Trace = sum, det = product; symmetric ⇒ real eigenvalues, orthogonal eigenvectors.
