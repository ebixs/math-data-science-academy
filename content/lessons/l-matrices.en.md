## Tables that transform

A **matrix** is a rectangular table of numbers. It can be a dataset (rows = examples, columns = features), a system of equations, an image, or — most importantly — a **transformation** that moves vectors: rotate, stretch, project. Matrix multiplication is what GPUs do billions of times per second when training neural networks.

## Basics

:::def Matrix
An $m\times n$ matrix has $m$ rows and $n$ columns; $a_{ij}$ is the entry in row $i$, column $j$. Matrices of the same size add entry-wise, and $cA$ multiplies every entry by $c$. The **transpose** $A^\top$ swaps rows and columns.
:::

## Matrix times vector

:::def $A\mathbf x$
For $A$ ($m\times n$) and $\mathbf x \in\mathbb R^n$, entry $i$ of $A\mathbf x$ is the dot product of row $i$ with $\mathbf x$. Equivalently, $A\mathbf x$ is a **combination of the columns** of $A$ with weights $x_1, \dots, x_n$.
:::

:::example
$\begin{bmatrix}2 & 1\\ 0 & 3\end{bmatrix}\begin{bmatrix}4\\ -1\end{bmatrix}$.
---
Rows: $(8 - 1,\ 0 - 3) = (7, -3)$. Columns: $4(2, 0) + (-1)(1, 3) = (7, -3)$ ✓.
:::

:::why Matrices as transformations
The columns of $A$ tell you where the basis vectors $(1, 0)$ and $(0, 1)$ go. Everything else follows by linearity. $\begin{bmatrix}0 & -1\\ 1 & 0\end{bmatrix}$ sends $(1, 0)\to(0, 1)$ and $(0, 1)\to(-1, 0)$: it rotates by 90°.
:::

## Matrix times matrix

:::def Product $AB$
If $A$ is $m\times n$ and $B$ is $n\times p$, then $AB$ is $m\times p$ with
$$(AB)_{ij} = (\text{row } i \text{ of } A)\cdot(\text{column } j \text{ of } B).$$
The inner sizes must match.
:::

:::example
$\begin{bmatrix}1 & 2\\ 3 & 4\end{bmatrix}\begin{bmatrix}0 & 1\\ 1 & 0\end{bmatrix}$.
---
$\begin{bmatrix}2 & 1\\ 4 & 3\end{bmatrix}$ — the columns swapped.
Reverse order: $\begin{bmatrix}0 & 1\\ 1 & 0\end{bmatrix}\begin{bmatrix}1 & 2\\ 3 & 4\end{bmatrix} = \begin{bmatrix}3 & 4\\ 1 & 2\end{bmatrix}$ — the rows swapped. So $AB \ne BA$.
:::

:::def Properties
- $AB \ne BA$ in general (order matters: transformation $B$ first, then $A$).
- $(AB)C = A(BC)$, $A(B + C) = AB + AC$.
- $(AB)^\top = B^\top A^\top$.
- The **identity** $I$ (1s on the diagonal) satisfies $AI = IA = A$.
:::

## Common mistakes

:::mistake Multiplying entry by entry
$AB$ is not the element-wise product (that's `A * B` in NumPy; the matrix product is `A @ B`).
:::

:::mistake Size mismatch
A $2\times3$ times a $2\times3$ is undefined; check that inner dimensions agree.
:::

## Try it yourself

:::try
Size of $AB$ if $A$ is $4\times2$ and $B$ is $2\times5$?
---
$4\times5$.
:::

:::try
Compute $\begin{bmatrix}1 & 0 & 2\\ -1 & 3 & 1\end{bmatrix}\begin{bmatrix}1\\ 2\\ 0\end{bmatrix}$.
---
$(1, 5)$.
:::

:::ds In data science
Predicting with a linear model for **all** rows at once is one matrix product: $\hat{\mathbf y} = X\mathbf w$. A neural-network layer is $\sigma(W\mathbf x + \mathbf b)$. In NumPy: `X @ w`, `A.T`, `np.eye(3)`.
:::

## Summary

- $A\mathbf x$: rows dot $\mathbf x$, or combination of columns.
- $(AB)_{ij}$ = row $i$ · column $j$; inner sizes must match; $AB \ne BA$.
- Columns of $A$ = images of the basis vectors.
