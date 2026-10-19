## Proving infinitely many statements at once

How do you prove that $1 + 2 + \dots + n = \tfrac{n(n+1)}2$ for **every** $n$? Checking cases never ends. **Induction** proves it for all natural numbers with two finite steps — like knocking over an infinite line of dominoes.

:::why Dominoes
If (1) the first domino falls, and (2) every domino that falls knocks over the next one, then all the dominoes fall. Induction is exactly this: a **base case** and an **inductive step**.
:::

## The principle

:::def Mathematical induction
To prove $P(n)$ for all integers $n \ge n_0$:
1. **Base case**: prove $P(n_0)$.
2. **Inductive step**: assume $P(k)$ is true for some $k \ge n_0$ (the **inductive hypothesis**) and prove $P(k + 1)$.
:::

:::example A sum formula
Prove $1 + 2 + \dots + n = \dfrac{n(n+1)}{2}$ for $n \ge 1$.
---
**Base**: $n = 1$: $1 = \tfrac{1\cdot2}{2}$ ✓.
**Step**: assume $1 + \dots + k = \tfrac{k(k+1)}2$. Then
$$1 + \dots + k + (k+1) = \frac{k(k+1)}{2} + (k + 1) = \frac{(k+1)(k+2)}{2},$$
which is the formula for $n = k + 1$. ∎
:::

:::example Divisibility
Prove $6^n - 1$ is divisible by 5 for all $n \ge 1$.
---
**Base**: $6 - 1 = 5$ ✓.
**Step**: assume $6^k - 1 = 5m$. Then $6^{k+1} - 1 = 6\cdot6^k - 1 = 6(5m + 1) - 1 = 30m + 5 = 5(6m + 1)$ ✓. ∎
:::

:::example An inequality
Prove $2^n > n$ for all $n \ge 1$.
---
**Base**: $2 > 1$ ✓. **Step**: if $2^k > k$, then $2^{k+1} = 2\cdot2^k > 2k = k + k \ge k + 1$ ✓. ∎
:::

:::tip Where to use the hypothesis
In the step, find the $P(k)$ expression **inside** the $P(k+1)$ expression — for sums, it's the first $k$ terms; for $6^{k+1}$, it's $6\cdot6^k$.
:::

## Common mistakes

:::mistake Skipping the base case
"If $P(k)$ then $P(k+1)$" can be true while every $P(n)$ is false (e.g. "$n = n + 1$").
:::

:::mistake Assuming what you want to prove
In the step, you assume $P(k)$ and **derive** $P(k+1)$; you may not start from $P(k+1)$.
:::

## Try it yourself

:::try
Prove $1 + 3 + 5 + \dots + (2n - 1) = n^2$.
---
Base $1 = 1^2$. Step: $k^2 + (2k + 1) = (k + 1)^2$ ✓.
:::

:::try
Prove $\sum_{i=1}^n i^2 = \dfrac{n(n+1)(2n+1)}{6}$ — just the step.
---
$\dfrac{k(k+1)(2k+1)}{6} + (k+1)^2 = \dfrac{(k+1)\big(k(2k+1) + 6(k+1)\big)}{6} = \dfrac{(k+1)(2k^2 + 7k + 6)}{6} = \dfrac{(k+1)(k+2)(2k+3)}{6}$ ✓.
:::

:::ds In data science
Induction is how we prove that **loops and recursive algorithms** are correct: a "loop invariant" true before the first iteration and preserved by each iteration is true at the end. The same reasoning justifies the convergence of iterative methods like gradient descent.
:::

## Summary

- Base case + inductive step ⇒ true for all $n \ge n_0$.
- In the step, rewrite $P(k+1)$ to expose $P(k)$, then use the hypothesis.
