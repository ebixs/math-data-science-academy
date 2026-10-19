## The bell curve

Heights, measurement errors, test scores, and — most importantly — averages of many random quantities all follow (approximately) the **normal distribution**. It is described by just two numbers, its mean and standard deviation, and it is the default model behind confidence intervals, hypothesis tests and linear regression.

:::def Normal distribution
$X \sim N(\mu, \sigma^2)$ has the density
$$f(x) = \frac{1}{\sigma\sqrt{2\pi}}\,e^{-\frac{(x - \mu)^2}{2\sigma^2}}.$$
It is symmetric around $\mu$; $\sigma$ controls the width. Probabilities are areas under the curve; the total area is 1.
:::

:::graph Change the mean and the spread
f: exp(-(x - m)^2/(2*s^2))/(s*sqrt(2*pi))
range: -6,6
params: m=0:-3:3; s=1:0.5:2.5
:::

## The 68–95–99.7 rule

:::def Empirical rule
For any normal distribution, about
- 68% of values lie within $\mu \pm \sigma$,
- 95% within $\mu \pm 2\sigma$,
- 99.7% within $\mu \pm 3\sigma$.
:::

:::example Heights
Adult heights: $\mu = 170$ cm, $\sigma = 8$ cm. What share is taller than 186 cm?
---
$186 = \mu + 2\sigma$. 95% lie within 2σ, so 5% outside, half of it above: about **2.5%**.
:::

## Standardizing: z-scores

:::def z-score
$$z = \frac{x - \mu}{\sigma}.$$
If $X \sim N(\mu, \sigma^2)$, then $Z \sim N(0, 1)$, the **standard normal**. A z-score says how many standard deviations $x$ is from the mean.
:::

:::example Comparing scores
Ali scored 82 on a test with mean 70 and SD 8. Sara scored 75 on a test with mean 60 and SD 10. Who did relatively better?
---
Ali: $z = 1.5$. Sara: $z = 1.5$. Equally good relative to their groups.
:::

:::example Using the table
$X \sim N(50, 10^2)$. Find $P(X < 63)$ given $\Phi(1.3) \approx 0.9032$.
---
$z = 1.3$, so $P \approx 0.903$. And $P(X > 63) \approx 0.097$.
:::

:::tip Key quantiles
$P(-1.96 < Z < 1.96) = 0.95$; $P(Z < 1.645) = 0.95$. These numbers appear in every confidence interval.
:::

## Common mistakes

:::mistake Reading the density as probability
$f(x)$ is a height, not a probability; for continuous $X$, $P(X = x) = 0$.
:::

:::mistake Assuming everything is normal
Incomes, waiting times and counts are often skewed. Look at a histogram before assuming normality.
:::

:::mistake Using variance instead of SD
In $N(\mu, \sigma^2)$ the second number is the **variance**; $N(0, 4)$ has $\sigma = 2$.
:::

## Try it yourself

:::try
IQ: $\mu = 100$, $\sigma = 15$. Share between 70 and 130?
---
$\pm2\sigma$: about 95%.
:::

:::try
A battery life is $N(500, 40^2)$ hours. What life is exceeded by only 5% of batteries?
---
$500 + 1.645(40) \approx 566$ hours.
:::

:::ds In data science
Standardizing features (`(x - x.mean()) / x.std()`, or scikit-learn's `StandardScaler`) puts them on the z-scale. Values with $|z| > 3$ are common outlier flags. `scipy.stats.norm.cdf(z)` gives $\Phi(z)$.
:::

## Summary

- Normal: symmetric bell, parameters $\mu$ and $\sigma$.
- 68–95–99.7 within 1, 2, 3 SDs.
- $z = \tfrac{x - \mu}{\sigma}$ converts to the standard normal.
