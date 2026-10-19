## Why averages are so reliable

One die roll is unpredictable. The average of 1000 rolls is almost exactly 3.5. Two theorems explain this: the **law of large numbers** (averages settle down to the true mean) and the **central limit theorem** (the error of an average is approximately normal, whatever the original distribution). Together they are why polls, A/B tests and most of statistics work.

## The law of large numbers

:::def Law of large numbers
If $X_1, X_2, \dots$ are independent with mean $\mu$, the sample mean
$$\bar X_n = \frac{X_1 + \dots + X_n}{n}$$
gets closer and closer to $\mu$ as $n$ grows.
:::

It's **not** that results "balance out" (the gambler's fallacy); early deviations are simply diluted by many new observations.

## The sampling distribution of the mean

:::def Mean and standard error
$$E[\bar X_n] = \mu,\qquad \operatorname{SD}(\bar X_n) = \frac{\sigma}{\sqrt n}.$$
$\tfrac{\sigma}{\sqrt n}$ is the **standard error**.
:::

:::why Why $\sqrt n$?
Variances of independent variables add: $\operatorname{Var}(X_1 + \dots + X_n) = n\sigma^2$. Dividing the sum by $n$ divides the variance by $n^2$: $\tfrac{\sigma^2}{n}$. Taking the square root gives $\tfrac{\sigma}{\sqrt n}$. Four times more data → half the error.
:::

## The central limit theorem

:::def Central limit theorem
For independent observations with mean $\mu$ and SD $\sigma$, when $n$ is large (often $n \ge 30$ is enough),
$$\bar X_n \approx N\!\left(\mu, \frac{\sigma^2}{n}\right),\qquad\text{i.e.}\quad \frac{\bar X_n - \mu}{\sigma/\sqrt n} \approx N(0, 1).$$
This holds even if the individual $X_i$ are **not** normal.
:::

:::graph Distribution of the mean: narrower as n grows
f: exp(-(x)^2/(2/n))/sqrt(2*pi/n)
range: -3,3
params: n=4:1:100
:::

:::example Delivery times
Delivery times are skewed with $\mu = 30$ min and $\sigma = 12$ min. For 36 random deliveries, $P(\bar X > 33)$?
---
SE $= \tfrac{12}{6} = 2$. $z = \tfrac{33 - 30}{2} = 1.5$. $P(Z > 1.5) \approx 0.067$.
:::

:::example Sample size for a poll
How many people must you ask so that the standard error of a proportion near 0.5 is at most 1.5%?
---
$\sqrt{\tfrac{0.5\cdot0.5}{n}} \le 0.015 \Rightarrow n \ge \tfrac{0.25}{0.000225} \approx 1112$.
:::

## Common mistakes

:::mistake "Large sample makes the data normal"
The CLT is about the **mean**, not the individual values. A large sample of incomes is still skewed.
:::

:::mistake Ignoring independence
Clustered or time-dependent data (e.g. daily stock returns) can break the $\tfrac{\sigma}{\sqrt n}$ rule.
:::

## Try it yourself

:::try
$\sigma = 20$. What $n$ makes the standard error 2?
---
$\tfrac{20}{\sqrt n} = 2 \Rightarrow n = 100$.
:::

:::try
Exam scores have $\mu = 65$, $\sigma = 15$. For a class of 25, within what range does the class mean fall about 95% of the time?
---
SE $= 3$; $65 \pm 1.96(3) \approx [59.1, 70.9]$.
:::

:::ds In data science
The CLT justifies confidence intervals $\bar x \pm 1.96\tfrac{s}{\sqrt n}$ and the z/t-tests used in A/B testing. You can **see** it in the Monte Carlo project of the Python notebook: averages of very skewed exponential samples form a bell curve.
:::

## Summary

- LLN: $\bar X_n \to \mu$.
- Standard error $\tfrac{\sigma}{\sqrt n}$: 4× data → ½ error.
- CLT: $\bar X_n$ is approximately $N(\mu, \sigma^2/n)$ for large $n$.
