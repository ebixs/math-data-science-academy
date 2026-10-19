## Undoing a transformation

If a matrix $A$ transforms vectors, can we transform them back? The **inverse** $A^{-1}$ does exactly that — when it exists. The **determinant** tells us whether it exists and measures how much $A$ stretches area or volume. Together they explain when a system $A\mathbf x = \mathbf b$ has exactly one solution.

## The determinant

:::def Determinant of a $2\times 2$ matrix
$$\det\begin{bmatrix}a & b\\ c & d\end{bmatrix} = ad - bc.$$
:::

:::why Area scale factor
The columns $(a, c)$ and $(b, d)$ span a parallelogram with area $|ad - bc|$. So $|\det A|$ is the factor by which $A$ scales areas. If $\det A = 0$, the plane is squashed onto a line (or a point) — information is lost and can't be recovered. A negative determinant means orientation is flipped (a mirror image).
:::

:::def $3\times 3$ determinant (cofactor expansion)
$$\det\begin{bmatrix}a & b & c\\ d & e & f\\ g & h & i\end{bmatrix} = a(ei - fh) - b(di - fg) + c(dh - eg).$$
:::

:::example
$\det\begin{bmatrix}2 & 0 & 1\\ 1 & 3 & 2\\ 1 & 1 & 1\end{bmatrix}$.
---
$2(3 - 2) - 0 + 1(1 - 3) = 2 - 2 = 0$. The matrix is **singular**: its columns are dependent (column 3 = ½ column 1 + ½ column 2).
:::

:::def Properties
$\det(AB) = \det A\,\det B$, $\det(A^\top) = \det A$, $\det(A^{-1}) = \dfrac{1}{\det A}$. Swapping two rows changes the sign; adding a multiple of one row to another doesn't change it.
:::

## The inverse

:::def Inverse matrix
$A^{-1}$ is the matrix with $AA^{-1} = A^{-1}A = I$. It exists exactly when $\det A \ne 0$. For $2\times2$:
$$\begin{bmatrix}a & b\\ c & d\end{bmatrix}^{-1} = \frac{1}{ad - bc}\begin{bmatrix}d & -b\\ -c & a\end{bmatrix}.$$
:::

:::example Solve with the inverse
$\begin{cases}3x + y = 9\\ 5x + 2y = 16\end{cases}$
---
$\det = 6 - 5 = 1$. $A^{-1} = \begin{bmatrix}2 & -1\\ -5 & 3\end{bmatrix}$. $\mathbf x = A^{-1}\mathbf b = (18 - 16,\ -45 + 48) = (2, 3)$.
:::

:::tip Larger matrices
Row-reduce $[A \mid I]$ to $[I \mid A^{-1}]$. In practice, solving $A\mathbf x = \mathbf b$ directly is faster and more accurate than computing $A^{-1}$.
:::

:::def The invertible matrix theorem (part)
For a square $A$, these are all equivalent: $\det A \ne 0$; $A$ is invertible; $A\mathbf x = \mathbf b$ has a unique solution for every $\mathbf b$; the columns are independent; rank $= n$.
:::

## Common mistakes

:::mistake $(AB)^{-1} = A^{-1}B^{-1}$
It is $B^{-1}A^{-1}$ — undo the last transformation first (like taking off shoes before socks).
:::

:::mistake $\det(A + B) = \det A + \det B$
False in general.
:::

## Try it yourself

:::try
Inverse of $\begin{bmatrix}4 & 7\\ 2 & 6\end{bmatrix}$.
---
$\det = 10$: $\tfrac{1}{10}\begin{bmatrix}6 & -7\\ -2 & 4\end{bmatrix}$.
:::

:::try
For which $k$ is $\begin{bmatrix}k & 2\\ 8 & k\end{bmatrix}$ singular?
---
$k^2 - 16 = 0$: $k = \pm4$.
:::

:::ds In data science
The normal equations $\hat\beta = (X^\top X)^{-1}X^\top\mathbf y$ need $X^\top X$ to be invertible. Perfectly collinear features make $\det(X^\top X) = 0$; nearly collinear ones make it tiny and the estimates unstable — which ridge regression fixes by using $(X^\top X + \lambda I)^{-1}$.
:::

## Summary

- $\det$ = signed area/volume scale; $\det = 0$ ⇔ singular.
- $2\times2$ inverse: swap the diagonal, negate the off-diagonal, divide by $\det$.
- Invertible ⇔ unique solutions ⇔ independent columns.
