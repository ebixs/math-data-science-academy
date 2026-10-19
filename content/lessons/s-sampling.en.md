## From a sample to the population

We almost never measure everyone. Polls ask 1000 people about millions; quality control tests a few items from a production line; an A/B test sees a few weeks of users. **Inferential statistics** answers: what can a sample tell us about the whole population — and how sure can we be?

## Good samples

:::def Population, parameter, sample, statistic
The **population** is everyone of interest; a **parameter** (like $\mu$ or $p$) describes it. A **sample** is the part we observe; a **statistic** (like $\bar x$ or $\hat p$) is computed from it and used to **estimate** the parameter.
:::

:::mistake Biased samples
An online poll of a news site's readers, or surveying only people who answer the phone at noon, gives **biased** results no matter how large the sample. Random sampling is what makes the math below valid.
:::

## Sampling variability

Different random samples give different $\bar x$. By the central limit theorem, $\bar x$ is approximately normal with mean $\mu$ and standard error $\tfrac{\sigma}{\sqrt n}$; a sample proportion $\hat p$ has standard error $\sqrt{\tfrac{p(1-p)}{n}}$.

## Confidence intervals

:::def Confidence interval
$$\text{estimate} \pm (\text{critical value}) \times (\text{standard error}).$$
For a mean (large $n$): $\bar x \pm 1.96\,\dfrac{s}{\sqrt n}$ (95%). For a proportion: $\hat p \pm 1.96\sqrt{\dfrac{\hat p(1 - \hat p)}{n}}$.
For small samples from a roughly normal population, replace 1.96 by the $t$ critical value with $n - 1$ degrees of freedom.
:::

:::example Average delivery time
$n = 64$ deliveries, $\bar x = 32$ min, $s = 8$ min. 95% CI for $\mu$?
---
SE $= \tfrac{8}{8} = 1$. $32 \pm 1.96 = [30.04, 33.96]$ minutes.
:::

:::example A poll
420 of 1200 people support a policy. 95% CI for the support rate?
---
$\hat p = 0.35$, SE $= \sqrt{\tfrac{0.35\cdot0.65}{1200}} \approx 0.0138$. $0.35 \pm 0.027$: from 32.3% to 37.7%.
:::

:::why What "95% confidence" means
If we repeated the sampling many times and built an interval each time, about 95% of those intervals would contain the true $\mu$. It does **not** mean "$\mu$ is in this particular interval with probability 0.95" — $\mu$ is fixed; the interval is what's random.
:::

:::tip Width of the interval
Width $\propto \tfrac{1}{\sqrt n}$: to halve the margin of error you need 4 times the sample. Higher confidence (99%) means a wider interval.
:::

## Common mistakes

:::mistake Bigger population needs bigger sample
For a random sample, the precision depends on $n$, not on the population size (as long as the population is much bigger than the sample).
:::

:::mistake Using $n$ instead of $\sqrt n$
The standard error is $\tfrac{s}{\sqrt n}$, not $\tfrac{s}{n}$.
:::

## Try it yourself

:::try
$\bar x = 50$, $s = 12$, $n = 36$. 95% CI?
---
SE $= 2$; $50 \pm 3.92 = [46.08, 53.92]$.
:::

:::try
What sample size gives a 95% margin of error of 3 percentage points for $p \approx 0.5$?
---
$1.96\sqrt{0.25/n} = 0.03 \Rightarrow n \approx 1068$.
:::

:::ds In data science
The **bootstrap** builds confidence intervals by resampling the data with replacement thousands of times — no formula needed. In Python: `np.percentile([rng.choice(x, len(x)).mean() for _ in range(5000)], [2.5, 97.5])`.
:::

## Summary

- Random samples avoid bias; statistics estimate parameters.
- CI: estimate ± critical value × SE; SE shrinks like $1/\sqrt n$.
- 95% describes the method's long-run success rate.
