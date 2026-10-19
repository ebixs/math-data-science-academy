## Which parameter best explains the data?

You flip a coin 10 times and see 7 heads. What's your best guess for $p$? Intuition says 0.7 — and **maximum likelihood estimation** (MLE) turns that intuition into a general method: choose the parameter value under which the observed data would have been **most probable**. Almost every model in machine learning — from linear and logistic regression to neural networks — is trained this way.

## Likelihood

:::def Likelihood
For data $x_1, \dots, x_n$ and a model with parameter $\theta$, the **likelihood** is the probability (or density) of the data as a function of $\theta$:
$$L(\theta) = \prod_{i=1}^n f(x_i \mid \theta).$$
The **MLE** $\hat\theta$ maximizes $L(\theta)$.
:::

:::tip Use the log-likelihood
Products are awkward; logs turn them into sums and don't move the maximum (log is increasing):
$$\ell(\theta) = \ln L(\theta) = \sum_i \ln f(x_i \mid \theta).$$
Set $\ell'(\theta) = 0$ and solve.
:::

## The coin

:::example Bernoulli / binomial
$k$ successes in $n$ trials. MLE of $p$?
---
$L(p) = p^k(1 - p)^{n - k}$ (the $\binom nk$ doesn't depend on $p$). $\ell(p) = k\ln p + (n - k)\ln(1 - p)$.
$\ell'(p) = \dfrac{k}{p} - \dfrac{n - k}{1 - p} = 0 \Rightarrow k(1 - p) = (n - k)p \Rightarrow \hat p = \dfrac{k}{n}$.
For 7 heads in 10: $\hat p = 0.7$.
:::

:::graph Log-likelihood of p for k successes in 10 trials
f: k*ln(x) + (10 - k)*ln(1 - x)
range: 0.02,0.98
params: k=7:1:9
:::

Move $k$: the peak of the curve sits exactly at $k/10$.

## The normal distribution

:::example MLE for $\mu$ and $\sigma^2$
---
$\ell(\mu, \sigma^2) = -\dfrac n2\ln(2\pi\sigma^2) - \dfrac{1}{2\sigma^2}\sum (x_i - \mu)^2$.
Maximizing over $\mu$ means minimizing $\sum (x_i - \mu)^2$: $\hat\mu = \bar x$.
Then $\hat\sigma^2 = \dfrac1n\sum (x_i - \bar x)^2$ (note $n$, not $n-1$: the MLE is slightly biased).
:::

:::why MLE = least squares
For a regression with normal errors, maximizing the likelihood is exactly minimizing the sum of squared residuals. That is why least squares is "the" method for linear regression.
:::

## The exponential distribution

:::example
Waiting times 2, 5, 3, 6 minutes, modelled as exponential with rate $\lambda$ ($f(x) = \lambda e^{-\lambda x}$). MLE of $\lambda$?
---
$\ell(\lambda) = n\ln\lambda - \lambda\sum x_i$, $\ell' = \tfrac n\lambda - \sum x_i = 0 \Rightarrow \hat\lambda = \tfrac{1}{\bar x} = \tfrac{1}{4}$ per minute.
:::

## Common mistakes

:::mistake Likelihood is not a probability of $\theta$
$L(\theta)$ is a function of $\theta$ but it doesn't integrate to 1 over $\theta$; it's the probability of the **data**.
:::

:::mistake Forgetting to check it's a maximum
Check $\ell''(\hat\theta) < 0$ or that the endpoints are worse.
:::

## Try it yourself

:::try
A die shows 6 in 12 of 50 rolls. MLE of $P(6)$?
---
$\tfrac{12}{50} = 0.24$.
:::

:::try
Counts 3, 1, 4, 2 from a Poisson model ($P(k) = e^{-\lambda}\lambda^k/k!$). MLE of $\lambda$?
---
$\ell = -n\lambda + \sum k_i\ln\lambda + \text{const}$, so $\hat\lambda = \bar k = 2.5$.
:::

:::ds In data science
Logistic regression maximizes the Bernoulli log-likelihood; its negative is the **log-loss** (cross-entropy) minimized by `sklearn` and neural networks. "Training a model" usually means "finding the MLE by gradient descent".
:::

## Summary

- Likelihood: probability of the data as a function of the parameter.
- Maximize the log-likelihood: set the derivative to zero.
- Binomial $\hat p = k/n$; normal $\hat\mu = \bar x$; least squares = MLE with normal errors.
