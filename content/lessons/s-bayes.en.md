## Beliefs that learn from data

Frequentist statistics treats parameters as fixed unknowns. **Bayesian** statistics treats them as uncertain quantities with probability distributions: you start with a **prior** belief, observe data, and use Bayes' rule to get a **posterior** belief. The posterior answers the question people actually ask: "given the data, how likely is each value of the parameter?"

:::def Bayes for parameters
$$\underbrace{p(\theta \mid \text{data})}_{\text{posterior}} \;\propto\; \underbrace{p(\text{data}\mid\theta)}_{\text{likelihood}}\;\times\;\underbrace{p(\theta)}_{\text{prior}}.$$
:::

## A discrete example

:::example Which coin?
A bag has a fair coin and a biased coin ($P(H) = 0.8$). You pick one at random and flip it 3 times: H, H, H. Probability it's the biased coin?
---
Prior 0.5 each. Likelihoods: fair $0.5^3 = 0.125$, biased $0.8^3 = 0.512$.
Posterior biased $= \dfrac{0.512(0.5)}{0.512(0.5) + 0.125(0.5)} = \dfrac{0.512}{0.637} \approx 0.80$.
Each new flip updates the belief again — yesterday's posterior is today's prior.
:::

## The Beta–Binomial model

For a probability $p$ (conversion rate, success rate), a convenient prior is the **Beta** distribution $\operatorname{Beta}(a, b)$, with density $\propto p^{a-1}(1-p)^{b-1}$ and mean $\tfrac{a}{a + b}$.

:::def Conjugate update
Prior $\operatorname{Beta}(a, b)$ + data with $k$ successes and $n - k$ failures → posterior
$$\operatorname{Beta}(a + k,\; b + n - k).$$
Think of $a$ and $b$ as "pseudo-counts" of prior successes and failures.
:::

:::example Conversion rate
Prior $\operatorname{Beta}(2, 18)$ (mean 10%). A new page gets 15 conversions from 100 visitors. Posterior?
---
$\operatorname{Beta}(17, 103)$, mean $\tfrac{17}{120} \approx 14.2\%$ — between the prior 10% and the data's 15%, closer to the data because 100 visitors outweigh 20 pseudo-counts.
:::

:::graph Posterior for the conversion rate (normal approximation of the Beta)
f: exp(-(x - a/(a+b))^2/(2*a*b/((a+b)^2*(a+b+1))))/sqrt(2*pi*a*b/((a+b)^2*(a+b+1)))
range: 0,0.5
params: a=17:1:60; b=103:10:300
:::

## Credible intervals

A 95% **credible interval** contains the parameter with 95% posterior probability — the interpretation people often (wrongly) give to confidence intervals. With lots of data and a weak prior, the two intervals are numerically close.

## Choosing priors

- **Weak / flat priors** ($\operatorname{Beta}(1,1)$ = uniform) let the data dominate.
- **Informative priors** encode real knowledge (previous experiments). They help a lot with small samples.
- With enough data, reasonable priors lead to similar posteriors.

## Common mistakes

:::mistake Prior = bias
A prior is an explicit, inspectable assumption; with enough data its influence fades. Report it.
:::

:::mistake Forgetting to normalize
Posterior ∝ likelihood × prior; divide by the total to get probabilities that sum to 1.
:::

## Try it yourself

:::try
Prior $\operatorname{Beta}(1, 1)$, then 8 successes in 10 trials. Posterior mean?
---
$\operatorname{Beta}(9, 3)$, mean $0.75$.
:::

:::try
In the coin example, a 4th flip is T. Update the probability of the biased coin.
---
Prior 0.80 (from before). Likelihoods: biased 0.2, fair 0.5. $\dfrac{0.2(0.80)}{0.2(0.80) + 0.5(0.20)} = \dfrac{0.16}{0.26} \approx 0.62$.
:::

:::ds In data science
Bayesian A/B testing reports "probability that B beats A" directly by sampling from the two Beta posteriors: `(rng.beta(17, 103, 100000) > rng.beta(11, 91, 100000)).mean()`. Regularization in machine learning (ridge, lasso) is equivalent to a prior on the weights.
:::

## Summary

- Posterior ∝ likelihood × prior; update repeatedly as data arrive.
- Beta prior + binomial data → Beta posterior (add successes and failures).
- Credible intervals give direct probability statements about parameters.
