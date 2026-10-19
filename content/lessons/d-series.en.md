## Adding up a sequence

A **series** is the sum of the terms of a sequence. Total savings after 12 deposits, the total distance a bouncing ball travels, the average of a dataset, the expected value of a random variable — all are sums. Sigma notation writes them compactly, and a few formulas compute them instantly.

## Sigma notation

:::def Sigma notation
$$\sum_{i=1}^{n} a_i = a_1 + a_2 + \dots + a_n.$$
$i$ is the index, 1 and $n$ are the limits.
:::

:::def Rules
$$\sum (a_i + b_i) = \sum a_i + \sum b_i,\qquad \sum c\,a_i = c\sum a_i,\qquad \sum_{i=1}^n c = nc.$$
But $\sum a_ib_i \ne \left(\sum a_i\right)\left(\sum b_i\right)$ in general.
:::

:::example
Compute $\sum_{k=1}^{4} (2k + 1)$.
---
$3 + 5 + 7 + 9 = 24$. Or: $2\sum k + \sum 1 = 2(10) + 4 = 24$.
:::

## Arithmetic series

:::def Sum of an arithmetic series
$$S_n = \frac{n}{2}(a_1 + a_n) = \frac n2\big(2a_1 + (n - 1)d\big),\qquad\text{in particular } \sum_{i=1}^n i = \frac{n(n+1)}{2}.$$
:::

:::why Gauss's trick
Write $1 + 2 + \dots + 100$ forwards and backwards and add: every column gives 101, and there are 100 columns, so twice the sum is $10\,100$ and the sum is $5050$.
:::

## Geometric series

:::def Sum of a geometric series
For $r \ne 1$:
$$S_n = a_1\frac{1 - r^n}{1 - r}.$$
If $|r| < 1$, the infinite series converges:
$$\sum_{k=0}^{\infty} a_1 r^k = \frac{a_1}{1 - r}.$$
:::

:::example Saving
You deposit 100 at the start of each month for 12 months at 1% monthly interest. Value at the end of the year?
---
Deposits grow by $1.01^{12}, 1.01^{11}, \dots, 1.01^1$: $100\cdot1.01\cdot\dfrac{1.01^{12} - 1}{0.01} \approx 1280.93$.
:::

:::example A bouncing ball
Dropped from 10 m, a ball bounces back to 60% of its height each time. Total distance travelled?
---
Down 10, then up and down $2(6 + 3.6 + \dots) = 2\cdot\dfrac{6}{1 - 0.6} = 30$. Total 40 m.
:::

:::example A repeating decimal
Write $0.\overline{27}$ as a fraction.
---
$0.27 + 0.0027 + \dots = \dfrac{0.27}{1 - 0.01} = \dfrac{27}{99} = \dfrac{3}{11}$.
:::

## Common mistakes

:::mistake Infinite sum with $|r| \ge 1$
$1 + 2 + 4 + \dots$ has no finite sum; $\tfrac{a}{1-r}$ only works for $|r| < 1$.
:::

:::mistake Wrong number of terms
$\sum_{i=3}^{10}$ has $10 - 3 + 1 = 8$ terms.
:::

## Try it yourself

:::try
Sum of the first 50 odd numbers.
---
$\tfrac{50}{2}(1 + 99) = 2500 = 50^2$.
:::

:::try
$\sum_{k=0}^{\infty} 5\left(\tfrac13\right)^k$.
---
$\dfrac{5}{1 - \tfrac13} = 7.5$.
:::

:::ds In data science
The mean is $\bar x = \tfrac1n\sum x_i$; the variance is $\tfrac{1}{n-1}\sum (x_i - \bar x)^2$; a loss function is a sum over examples. In NumPy, `x.sum()` and `np.sum(w * x)` are sigma notation. Discounted rewards in reinforcement learning are a geometric series $\sum \gamma^t r_t$.
:::

## Summary

- $\sum$ is linear: split sums and pull out constants.
- Arithmetic: $S_n = \tfrac n2(a_1 + a_n)$. Geometric: $S_n = a_1\tfrac{1-r^n}{1-r}$; infinite $\tfrac{a_1}{1-r}$ when $|r|<1$.
