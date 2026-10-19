## Why variables?

Arithmetic answers one question at a time: "how much do 3 notebooks at 25 each cost?" Algebra answers **all** such questions at once: the cost of $n$ notebooks at price $p$ is $np$. A variable is a name for a number we don't know yet, or for a number that can change. Every formula in science and every model in data science is an algebraic expression.

:::why A variable is a labelled box
Think of $x$ as a box with a number inside. $3x + 2$ is a recipe: "take what's in the box, triple it, add 2". If the box holds 4, the result is 14; if it holds $-1$, the result is $-1$. The recipe is the same; only the contents change.
:::

## Vocabulary

:::def Expression, term, coefficient
In $5x^2 - 3x + 7$:
- the **terms** are $5x^2$, $-3x$ and $7$ (pieces joined by $+$ or $-$, sign included);
- $5$ and $-3$ are **coefficients** (the numbers multiplying variables);
- $7$ is a **constant term**.
:::

**Evaluating** an expression means substituting numbers: for $x = -2$, $5x^2 - 3x + 7 = 5(4) + 6 + 7 = 33$. Always put substituted negatives in brackets: $5(-2)^2$, not $5 - 2^2$.

## Like terms

:::def Like terms
Terms are **like** when they have exactly the same variables with the same exponents: $3x^2y$ and $-7x^2y$ are like; $3x^2y$ and $3xy^2$ are not.
:::

You can add like terms by adding coefficients: $4a + 9a - 2a = 11a$. You **cannot** combine unlike terms: $3x + 2y$ stays as it is, just as 3 apples + 2 pears is not 5 "apple-pears".

## Expanding and factoring

The distributive law $a(b + c) = ab + ac$ works in both directions:
- **Expanding**: $-3(2x - 5) = -6x + 15$.
- **Factoring out a common factor**: $12x^2 + 8x = 4x(3x + 2)$.

:::example Simplify $4(2x - 3) - 2(x - 5) + x$
---
Expand: $8x - 12 - 2x + 10 + x$. Collect: $(8 - 2 + 1)x + (-12 + 10) = 7x - 2$.
:::

:::example Expanding two brackets
Expand $(x + 3)(2x - 5)$.
---
Every term of the first bracket multiplies every term of the second:
$x\cdot 2x + x\cdot(-5) + 3\cdot 2x + 3\cdot(-5) = 2x^2 - 5x + 6x - 15 = 2x^2 + x - 15$.
:::

:::example Writing an expression from words
A taxi charges a base fare of 30 plus 12 per km. Write the cost for $d$ km and evaluate for 8 km.
---
$C = 30 + 12d$. For $d = 8$: $30 + 96 = 126$.
:::

## Common mistakes

:::mistake Sign errors when distributing
$-2(x - 5) = -2x + 10$, not $-2x - 10$. The minus multiplies **every** term inside.
:::

:::mistake Combining unlike terms
$3x + 4x^2 \ne 7x^3$. Different powers are different kinds of terms.
:::

:::mistake Losing the coefficient 1
$x$ means $1x$, so $5x - x = 4x$, not $5$.
:::

## Try it yourself

:::try
Evaluate $2a^2 - 3ab + b$ for $a = -1$, $b = 4$.
---
$2(1) - 3(-1)(4) + 4 = 2 + 12 + 4 = 18$.
:::

:::try
Simplify $3(x + 2y) - (2x - y) + 4y$.
---
$3x + 6y - 2x + y + 4y = x + 11y$.
:::

:::try
Factor $15ab - 10a^2$.
---
Common factor $5a$: $5a(3b - 2a)$.
:::

:::ds In data science
A linear model's prediction is an expression: $\hat y = w_1x_1 + w_2x_2 + b$. "Training" means choosing the coefficients $w_1, w_2, b$; "predicting" means evaluating the expression for new values of $x_1, x_2$.
:::

## Summary

- A variable stands for a number; an expression is a recipe built from variables and numbers.
- Only like terms combine.
- Distribute carefully, especially with minus signs; factoring is distributing in reverse.
