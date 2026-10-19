## Patterns in order

A **sequence** is an ordered list of numbers $a_1, a_2, a_3, \dots$ — monthly savings, a population each year, the loss of a model after each training epoch. Two patterns appear constantly: adding the same amount each step (**arithmetic**) and multiplying by the same factor (**geometric**). They are the discrete versions of linear and exponential functions.

## Arithmetic sequences

:::def Arithmetic sequence
Each term adds a constant **common difference** $d$:
$$a_n = a_1 + (n - 1)d.$$
Example: $5, 8, 11, 14, \dots$ has $a_1 = 5$, $d = 3$, so $a_n = 3n + 2$.
:::

:::example
The 4th term of an arithmetic sequence is 17 and the 10th is 47. Find $a_1$, $d$ and $a_{20}$.
---
Six steps add $47 - 17 = 30$, so $d = 5$. $a_1 = 17 - 3(5) = 2$. $a_{20} = 2 + 19(5) = 97$.
:::

## Geometric sequences

:::def Geometric sequence
Each term multiplies by a constant **common ratio** $r$:
$$a_n = a_1\, r^{n-1}.$$
Example: $3, 6, 12, 24, \dots$ has $r = 2$, so $a_n = 3\cdot 2^{n-1}$.
:::

:::example Depreciation
A car worth 20 000 loses 15% of its value each year. Value after 5 years?
---
$r = 0.85$: $20\,000 \times 0.85^5 \approx 8874$.
:::

:::tip Recognizing the type
Look at differences $a_{n+1} - a_n$: constant → arithmetic. Look at ratios $a_{n+1}/a_n$: constant → geometric.
:::

## Recursive definitions

Sequences can be defined from the previous term: $a_{n+1} = a_n + d$ (arithmetic), $a_{n+1} = r\,a_n$ (geometric), or the Fibonacci sequence $F_{n+1} = F_n + F_{n-1}$ with $F_1 = F_2 = 1$: $1, 1, 2, 3, 5, 8, 13, \dots$

## Behaviour in the long run

- Arithmetic with $d > 0$ grows without bound, linearly.
- Geometric with $|r| > 1$ blows up; with $|r| < 1$ it shrinks toward 0 — the sequence **converges** to 0.

:::graph Terms of $a\,r^{n}$ (shown as a curve)
f: a*r^x
range: 0,10
params: a=5:1:10; r=0.8:0.3:1.5
:::

## Common mistakes

:::mistake Off-by-one
The $n$-th term uses $(n - 1)$ steps: $a_n = a_1 + (n - 1)d$, not $a_1 + nd$.
:::

:::mistake Adding percentages
15% depreciation for 5 years is not $5 \times 15\% = 75\%$; it's $1 - 0.85^5 \approx 56\%$.
:::

## Try it yourself

:::try
Find the 15th term of $7, 3, -1, \dots$
---
$d = -4$: $7 + 14(-4) = -49$.
:::

:::try
A geometric sequence has $a_2 = 12$, $a_5 = 96$. Find $r$ and $a_1$.
---
$r^3 = 8$, $r = 2$, $a_1 = 6$.
:::

:::try
Which term of $2, 6, 18, \dots$ first exceeds 10 000?
---
$2\cdot3^{n-1} > 10\,000 \Rightarrow 3^{n-1} > 5000 \Rightarrow n - 1 > \tfrac{\ln5000}{\ln3} \approx 7.75$, so $n = 9$.
:::

:::ds In data science
Learning-rate schedules are sequences: "multiply the learning rate by 0.9 every epoch" is geometric. Time series are sequences too, and spotting a constant difference (linear trend) or constant ratio (exponential growth) is the first step of forecasting.
:::

## Summary

- Arithmetic: $a_n = a_1 + (n-1)d$. Geometric: $a_n = a_1r^{n-1}$.
- Check differences or ratios to identify the type.
- $|r| < 1$: geometric terms shrink to 0.
