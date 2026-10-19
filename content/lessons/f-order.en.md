## Why we need rules

What is $2 + 3 \times 4$? If you work left to right you get $20$; if you multiply first you get $14$. Both can't be right. Mathematicians, calculators and programming languages all agree on **one** order so that an expression means the same thing to everyone. Python, Excel and your phone's calculator all answer $14$.

:::why Multiplication is "stronger glue"
Think of $3 \times 4$ as a single block — "three fours". The expression $2 + 3\times 4$ says "two, plus three fours". The multiplication binds its numbers together more tightly than addition does, so it is done first. Exponents bind even more tightly: $3 \times 4^2$ is "three lots of $4^2$".
:::

## The order

:::def Order of operations
1. **Brackets** (parentheses) — innermost first.
2. **Exponents** (powers and roots).
3. **Multiplication and division** — together, from **left to right**.
4. **Addition and subtraction** — together, from **left to right**.
:::

Many people remember this as PEMDAS or BODMAS. The trap is that the acronym seems to put multiplication before division (or addition before subtraction). It doesn't: each pair has **equal rank** and is done left to right.

$$12 \div 3 \times 2 = 4 \times 2 = 8,\qquad\text{not } 12 \div 6 = 2.$$
$$10 - 4 + 3 = 6 + 3 = 9,\qquad\text{not } 10 - 7 = 3.$$

:::tip Fraction bars and roots act as brackets
In $\dfrac{8 + 4}{2 + 1}$ the bar groups the top and the bottom: $\dfrac{12}{3} = 4$. Likewise $\sqrt{9 + 16} = \sqrt{25} = 5$, not $3 + 4$. When you type such an expression into a calculator or into code, you must add the brackets yourself: `(8 + 4) / (2 + 1)`.
:::

## Worked examples

:::example Step by step
Evaluate $5 + 2 \times (7 - 3)^2 \div 8$.
---
1. Bracket: $7 - 3 = 4$, giving $5 + 2 \times 4^2 \div 8$.
2. Exponent: $4^2 = 16$, giving $5 + 2 \times 16 \div 8$.
3. Multiply/divide left to right: $2 \times 16 = 32$, then $32 \div 8 = 4$.
4. Add: $5 + 4 = 9$.
:::

:::example Nested brackets
Evaluate $3 \times [\,20 - 2 \times (1 + 4)\,] - 6$.
---
Innermost: $1 + 4 = 5$. Inside the square bracket: $20 - 2 \times 5 = 20 - 10 = 10$. Then $3 \times 10 - 6 = 30 - 6 = 24$.
:::

:::example Negative numbers and powers
Evaluate $-2^2 + (-2)^3 - 3 \times (-1)$.
---
$-2^2 = -(2^2) = -4$. $(-2)^3 = -8$. $3 \times (-1) = -3$, so $-(-3) = +3$. Total: $-4 - 8 + 3 = -9$.
:::

## The distributive law

Brackets can also be *removed* using the distributive law:
$$a(b + c) = ab + ac.$$
For example $7 \times 98 = 7 \times (100 - 2) = 700 - 14 = 686$ — a mental-math trick that relies on exactly this rule. Order of operations tells you *how to evaluate*; the distributive law tells you *how to rewrite* without changing the value.

## Common mistakes

:::mistake Always multiplying before dividing
$24 \div 4 \times 2$ is $12$ (left to right), not $3$.
:::

:::mistake Adding before multiplying
$6 + 4 \times 5 = 26$, not $50$.
:::

:::mistake Forgetting that the exponent sits on one number
$2 \times 3^2 = 2 \times 9 = 18$, not $6^2 = 36$. Only a bracket can make the exponent apply to a product: $(2\times 3)^2 = 36$.
:::

:::mistake Missing brackets in code
To compute the average of 4 and 8, `4 + 8 / 2` gives `8.0`, but the correct code is `(4 + 8) / 2`, which gives `6.0`.
:::

## Try it yourself

:::try
Evaluate $18 - 6 \div 3 \times 2 + 1$.
---
$6 \div 3 = 2$, then $2 \times 2 = 4$. Then $18 - 4 + 1 = 15$.
:::

:::try
Evaluate $\dfrac{3^2 + 7}{2 \times (5 - 3)}$.
---
Top: $9 + 7 = 16$. Bottom: $2 \times 2 = 4$. Answer: $4$.
:::

:::try
Insert brackets so that $2 + 3 \times 4 + 5$ equals $45$.
---
One pair is not enough: $2 + 3 \times (4 + 5) = 29$ and $(2 + 3) \times 4 + 5 = 25$. Two pairs work: $(2+3)\times(4+5) = 45$. Testing every option is a good habit.
:::

:::ds In data science
Formulas such as the standardized score $z = \dfrac{x - \mu}{\sigma}$ are written in code as `(x - mu) / sigma`. Forgetting the brackets (`x - mu / sigma`) is one of the most common silent bugs: the code runs, but every number is wrong.
:::

## Summary

- Brackets → exponents → multiply/divide (left to right) → add/subtract (left to right).
- Fraction bars and roots group like brackets.
- When in doubt in code, add brackets; they cost nothing and remove ambiguity.
