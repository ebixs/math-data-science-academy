## Counting successes

How many of 20 customers will click? How many of 10 free throws go in? How many defective items in a batch of 50? When you repeat the same yes/no trial a fixed number of times, the number of "yes" results follows the **binomial distribution**.

:::def Binomial setting
1. A fixed number $n$ of trials.
2. Each trial is success or failure.
3. The probability of success $p$ is the same each time.
4. Trials are independent.

Then $X$ = number of successes is $\operatorname{Bin}(n, p)$.
:::

## The formula

:::def Binomial probability
$$P(X = k) = \binom{n}{k}p^k(1 - p)^{n-k},\qquad k = 0, 1, \dots, n.$$
:::

:::why Where it comes from
One particular sequence with $k$ successes and $n-k$ failures (e.g. SSFSF…) has probability $p^k(1-p)^{n-k}$ by independence. There are $\binom nk$ ways to place the $k$ successes among $n$ positions, and all these sequences are mutually exclusive — so multiply.
:::

:::example Free throws
A player makes 70% of free throws. In 10 attempts, $P(\text{exactly } 8)$?
---
$\binom{10}{8}(0.7)^8(0.3)^2 = 45 \times 0.05765 \times 0.09 \approx 0.233$.
:::

:::example At least one
Each of 12 light bulbs fails within a year with probability 0.05, independently. $P(\text{at least one fails})$?
---
$1 - P(X = 0) = 1 - 0.95^{12} \approx 0.46$.
:::

## Mean and variance

:::def Mean and variance of $\operatorname{Bin}(n, p)$
$$E[X] = np,\qquad \operatorname{Var}(X) = np(1 - p).$$
:::

These follow from writing $X$ as a sum of $n$ independent 0/1 variables, each with mean $p$ and variance $p(1-p)$.

:::example
An ad has a 4% click rate and is shown to 500 people. Expected clicks and SD?
---
$\mu = 20$, $\sigma = \sqrt{500(0.04)(0.96)} = \sqrt{19.2} \approx 4.38$. So 20 ± about 9 clicks is typical.
:::

:::graph The binomial shape (normal curve with the same mean and SD)
f: exp(-(x - n*p)^2/(2*n*p*(1-p)))/sqrt(2*pi*n*p*(1-p))
range: 0,40
params: n=20:5:60; p=0.3:0.05:0.95
:::

For large $n$ the binomial histogram looks like this bell curve — a first glimpse of the central limit theorem.

## Common mistakes

:::mistake Forgetting $\binom nk$
$p^k(1-p)^{n-k}$ is the probability of **one** specific order.
:::

:::mistake Using it without independence or fixed $p$
Drawing cards without replacement changes $p$ each time (that's the hypergeometric distribution).
:::

## Try it yourself

:::try
$X \sim \operatorname{Bin}(5, 0.5)$. $P(X \ge 4)$?
---
$\tfrac{\binom54 + \binom55}{32} = \tfrac{6}{32} = 0.1875$.
:::

:::try
A multiple-choice test has 20 questions with 4 options. Guessing, what are the mean and SD of correct answers?
---
$\mu = 5$, $\sigma = \sqrt{20(0.25)(0.75)} \approx 1.94$.
:::

:::ds In data science
Conversion rates, A/B tests and accuracy on a test set are binomial counts. `scipy.stats.binom.pmf(8, 10, 0.7)` computes $P(X = 8)$, and `numpy.random.binomial(10, 0.7, size=10000)` simulates it.
:::

## Summary

- Fixed $n$, independent trials, constant $p$ → $\operatorname{Bin}(n, p)$.
- $P(X = k) = \binom nk p^k(1-p)^{n-k}$.
- $E = np$, $\operatorname{Var} = np(1-p)$.
