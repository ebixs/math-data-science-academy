## Numbers that come out of chance

A **random variable** assigns a number to each outcome of a random experiment: the number of heads in 10 flips, the profit of a bet, tomorrow's sales. Once outcomes are numbers we can ask for the **average** we expect (expected value) and how much results **spread** (variance) — the two most important summaries in all of statistics.

## Distributions

:::def Discrete random variable
A discrete random variable $X$ takes values $x_1, x_2, \dots$ with probabilities $p_i = P(X = x_i)$, where $p_i \ge 0$ and $\sum p_i = 1$. The list of values and probabilities is its **distribution**.
:::

:::example
$X$ = number of heads in 2 fair flips.
---
$P(X = 0) = \tfrac14$, $P(X = 1) = \tfrac12$, $P(X = 2) = \tfrac14$.
:::

## Expected value

:::def Expected value
$$E[X] = \mu = \sum_i x_i\,p_i.$$
It's the long-run average if the experiment is repeated many times — a probability-weighted mean.
:::

:::example A game
Pay 5 to roll a die; you win 12 if you roll a 6, otherwise nothing. Is it worth it?
---
Net gain: $+7$ with probability $\tfrac16$, $-5$ with $\tfrac56$. $E = \tfrac76 - \tfrac{25}{6} = -3$. On average you lose 3 per game.
:::

:::def Linearity of expectation
$$E[aX + b] = aE[X] + b,\qquad E[X + Y] = E[X] + E[Y]$$
— always, even if $X$ and $Y$ are dependent.
:::

## Variance and standard deviation

:::def Variance
$$\operatorname{Var}(X) = E\big[(X - \mu)^2\big] = E[X^2] - \mu^2,\qquad \sigma = \sqrt{\operatorname{Var}(X)}.$$
$\operatorname{Var}(aX + b) = a^2\operatorname{Var}(X)$; for **independent** $X, Y$: $\operatorname{Var}(X + Y) = \operatorname{Var}X + \operatorname{Var}Y$.
:::

:::example
For the 2-flip $X$ above: $\mu = 0(\tfrac14) + 1(\tfrac12) + 2(\tfrac14) = 1$.
---
$E[X^2] = 0 + \tfrac12 + 4\cdot\tfrac14 = 1.5$, so $\operatorname{Var} = 1.5 - 1 = 0.5$ and $\sigma \approx 0.71$.
:::

:::why Why square the deviations?
Deviations $x - \mu$ average to zero (positives cancel negatives). Squaring makes them all positive and penalizes big deviations more. The square root brings the units back.
:::

## Continuous random variables (preview)

Heights or waiting times take any value in an interval. Then probabilities are **areas** under a density curve $f(x)$: $P(a \le X \le b) = \int_a^b f(x)\,dx$, and $P(X = a) = 0$ for any single value. The normal distribution is the most important example.

## Common mistakes

:::mistake $E[X^2] = (E[X])^2$
Not in general: their difference is exactly the variance.
:::

:::mistake $\operatorname{Var}(X - Y) = \operatorname{Var}X - \operatorname{Var}Y$
For independent variables, variances **add** even for differences.
:::

## Try it yourself

:::try
$X$ takes values 1, 2, 3 with probabilities 0.2, 0.5, 0.3. Find $E[X]$ and $\operatorname{Var}(X)$.
---
$E = 0.2 + 1 + 0.9 = 2.1$. $E[X^2] = 0.2 + 2 + 2.7 = 4.9$. $\operatorname{Var} = 4.9 - 4.41 = 0.49$.
:::

:::try
If $E[X] = 4$ and $\operatorname{Var}(X) = 9$, find $E[3X - 2]$ and $\operatorname{SD}(3X - 2)$.
---
$E = 10$; $\operatorname{Var} = 81$, SD $= 9$.
:::

:::ds In data science
The expected loss is what a model minimizes; the sample mean and variance (`x.mean()`, `x.var(ddof=1)`) estimate $\mu$ and $\sigma^2$. Linearity of expectation is behind many simple, powerful calculations, like the expected revenue of a whole portfolio of customers.
:::

## Summary

- Distribution: values with probabilities summing to 1.
- $E[X] = \sum x p$, linear. $\operatorname{Var} = E[X^2] - \mu^2$, scales by $a^2$.
- For independent variables, variances add.
