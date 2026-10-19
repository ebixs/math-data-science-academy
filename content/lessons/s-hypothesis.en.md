## Is the difference real or just noise?

A new website design gets a 5.4% conversion rate versus 5.0% for the old one. A new drug lowers blood pressure by 3 mmHg in a trial. Is this a real effect or random luck? **Hypothesis testing** gives a disciplined way to answer, and it's the engine of A/B testing.

:::why Proof by "that would be surprising"
Assume nothing is going on (the null hypothesis). Compute how surprising the observed data would be under that assumption. If it would be very surprising, we doubt the assumption. It's like a courtroom: innocent until proven guilty beyond reasonable doubt.
:::

## The steps

:::def Hypothesis test
1. **Hypotheses**: $H_0$ (no effect, e.g. $\mu = \mu_0$) and $H_1$ (the effect, e.g. $\mu \ne \mu_0$).
2. **Significance level** $\alpha$ (often 0.05), chosen in advance.
3. **Test statistic**: how many standard errors the estimate is from $H_0$, e.g. $z = \dfrac{\bar x - \mu_0}{s/\sqrt n}$.
4. **p-value**: the probability, **if $H_0$ were true**, of a result at least as extreme as the one observed.
5. **Decision**: if $p \le \alpha$, reject $H_0$; otherwise, fail to reject.
:::

:::example A one-sample test
A machine should fill 500 g. A sample of 49 bags has $\bar x = 497$ g, $s = 7$ g. Is it under-filling? ($\alpha = 0.05$)
---
$H_0: \mu = 500$, $H_1: \mu < 500$. $z = \dfrac{497 - 500}{7/7} = -3$. $p = P(Z < -3) \approx 0.0013 < 0.05$: reject $H_0$; the machine under-fills.
:::

:::example An A/B test
Old page: 500 conversions of 10 000. New page: 580 of 10 000. Significant at 5%?
---
$\hat p_A = 0.050$, $\hat p_B = 0.058$, pooled $\hat p = 0.054$. SE $= \sqrt{0.054\cdot0.946\,(\tfrac{2}{10\,000})} \approx 0.0032$. $z = \tfrac{0.008}{0.0032} \approx 2.5$, two-sided $p \approx 0.012$. Significant.
:::

## Errors

| | $H_0$ true | $H_0$ false |
|---|---|---|
| reject $H_0$ | **Type I error** (prob. $\alpha$) | correct (power) |
| fail to reject | correct | **Type II error** ($\beta$) |

**Power** $= 1 - \beta$ grows with sample size and effect size.

## Interpreting p-values correctly

:::mistake "p is the probability that $H_0$ is true"
No. $p$ is computed **assuming** $H_0$ is true. It measures how surprising the data are, not how likely the hypothesis is.
:::

:::mistake Significant = important
With a huge sample, a 0.01% difference can be significant but useless. Always report the **effect size** and a confidence interval.
:::

:::mistake Peeking and multiple testing
Checking an A/B test every day and stopping when $p < 0.05$, or testing 20 metrics, inflates false positives. Decide the sample size in advance and correct for multiple comparisons.
:::

## Try it yourself

:::try
$z = 1.7$ in a two-sided test at $\alpha = 0.05$. Reject?
---
Two-sided $p \approx 0.089 > 0.05$: do not reject. (Critical value is 1.96.)
:::

:::try
What does $\alpha = 0.05$ mean?
---
If $H_0$ is true, we will wrongly reject it 5% of the time.
:::

:::ds In data science
`scipy.stats.ttest_ind(a, b)` compares two means; `statsmodels.stats.proportion.proportions_ztest` compares two rates. A 95% confidence interval that excludes 0 corresponds to rejecting $H_0$: "no difference" at $\alpha = 0.05$.
:::

## Summary

- Assume $H_0$, compute how extreme the data are (p-value), reject if $p \le \alpha$.
- Type I (false alarm) and Type II (miss) errors trade off; power needs enough data.
- p-value ≠ probability $H_0$ is true; report effect sizes.
