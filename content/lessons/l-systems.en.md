## Many equations at once

Two equations in two unknowns can be solved by hand. But regression with 50 features, a circuit with 30 currents, or a supply chain with 100 products gives large systems $A\mathbf x = \mathbf b$. **Gaussian elimination** is the systematic algorithm behind every solver — it's what you did with two equations, organized so that a computer can do it with thousands.

## Augmented matrix and row operations

The system
$$\begin{cases} x + 2y + z = 9\\ 2x - y + 3z = 8\\ 3x + y - z = 3\end{cases}$$
is stored as the **augmented matrix** $\left[\begin{array}{ccc|c}1 & 2 & 1 & 9\\ 2 & -1 & 3 & 8\\ 3 & 1 & -1 & 3\end{array}\right]$.

:::def Elementary row operations
1. Swap two rows.
2. Multiply a row by a non-zero number.
3. Add a multiple of one row to another.

None of them changes the solution set.
:::

:::def Row echelon form
Use the operations to get zeros **below** each leading entry (pivot), creating a staircase. Then solve from the bottom up (**back substitution**).
:::

:::example Solve the system above
---
$R_2 \leftarrow R_2 - 2R_1$, $R_3 \leftarrow R_3 - 3R_1$:
$\left[\begin{array}{ccc|c}1 & 2 & 1 & 9\\ 0 & -5 & 1 & -10\\ 0 & -5 & -4 & -24\end{array}\right]$.
$R_3 \leftarrow R_3 - R_2$: $\left[\begin{array}{ccc|c}1 & 2 & 1 & 9\\ 0 & -5 & 1 & -10\\ 0 & 0 & -5 & -14\end{array}\right]$.
Back substitution: $z = 2.8$; $-5y + 2.8 = -10 \Rightarrow y = 2.56$; $x = 9 - 5.12 - 2.8 = 1.08$.
:::

## How many solutions?

After elimination:
- a row $[0\ 0\ 0 \mid c]$ with $c \ne 0$ → **no solution** (inconsistent);
- fewer pivots than unknowns (and consistent) → **infinitely many** solutions, with **free variables**;
- a pivot in every column → **exactly one** solution.

:::example Infinitely many
$\begin{cases} x + y + z = 3\\ 2x + 2y + 2z = 6\end{cases}$
---
The second row becomes $0 = 0$. One pivot, three unknowns: two free variables. Solutions: $x = 3 - s - t$, $y = s$, $z = t$ — a whole plane.
:::

:::def Rank
The **rank** of $A$ is the number of pivots = the number of independent rows (or columns). For $n$ unknowns, a unique solution needs rank $n$.
:::

## Common mistakes

:::mistake Operating on only the left side
Row operations act on the whole augmented row, including the right-hand side.
:::

:::mistake Dividing by a zero pivot
If a pivot is 0, swap with a lower row that has a non-zero entry in that column.
:::

## Try it yourself

:::try
Solve $\begin{cases} x + y = 5\\ 2x + 3y = 13\end{cases}$ with row operations.
---
$R_2 - 2R_1$: $y = 3$; $x = 2$.
:::

:::try
What does a final row $[0\ 0 \mid 4]$ mean?
---
$0 = 4$: the system has no solution.
:::

:::ds In data science
`np.linalg.solve(A, b)` uses LU decomposition — Gaussian elimination stored as matrices. In regression, perfectly collinear features make the system rank-deficient (infinitely many weight vectors fit equally well), which is why libraries warn or regularize.
:::

## Summary

- Write $[A\mid\mathbf b]$; use row operations to reach echelon form; back-substitute.
- Inconsistent row → none; free variables → infinitely many; full rank → one.
