## Growth that multiplies

Linear growth adds the same amount each step. **Exponential** growth multiplies by the same factor: money with compound interest, a virus spreading, radioactive decay, a model's error shrinking by 10% per epoch. Logarithms are the inverse — they answer "how many times do I multiply?" — and they are everywhere in data science: log-scales, log-loss, log-likelihood.

:::why Logs count multiplications
$2^{10} = 1024$, so $\log_2 1024 = 10$: you must double 10 times to get from 1 to 1024. A logarithm turns multiplication into addition, which is why it tames huge numbers and products of probabilities.
:::

## Exponential functions

:::def Exponential function
$f(x) = a\cdot b^x$ with $b > 0$, $b \ne 1$. $a$ is the starting value ($f(0) = a$) and $b$ the growth factor per step: $b > 1$ growth, $0 < b < 1$ decay.
:::

Growth by $r$ per period: $b = 1 + r$. Decay by $r$: $b = 1 - r$. The special base $e \approx 2.71828$ gives continuous growth $A = A_0e^{kt}$.

:::graph Growth and decay
f: a*b^x
range: -4,6
params: a=1:0.5:3; b=2:0.3:3
:::

## Logarithms

:::def Logarithm
$\log_b y = x$ means exactly $b^x = y$ (for $b > 0$, $b \ne 1$, $y > 0$). Special notations: $\ln y = \log_e y$, and $\log y$ often means $\log_{10} y$.
:::

:::def Laws of logarithms
$$\log_b(MN) = \log_b M + \log_b N,\quad \log_b\frac MN = \log_b M - \log_b N,\quad \log_b(M^k) = k\log_b M.$$
Change of base: $\log_b x = \dfrac{\ln x}{\ln b}$.
:::

Each law is an exponent law in disguise: $b^m b^n = b^{m+n}$ becomes "log of a product is the sum of logs".

## Solving exponential equations

Take logs of both sides to bring the exponent down.

:::example Doubling time
At 7% interest per year, how long until money doubles?
---
$1.07^t = 2 \Rightarrow t\ln 1.07 = \ln 2 \Rightarrow t = \dfrac{\ln2}{\ln1.07} \approx 10.2$ years. (The "rule of 70": $70/7 = 10$.)
:::

:::example Half-life
A substance decays by 12% per hour. When is 25% left?
---
$0.88^t = 0.25 \Rightarrow t = \dfrac{\ln 0.25}{\ln 0.88} \approx 10.8$ hours.
:::

:::example Logarithmic equation
Solve $\log_2(x + 3) + \log_2(x - 3) = 4$.
---
$\log_2\big((x+3)(x-3)\big) = 4 \Rightarrow x^2 - 9 = 16 \Rightarrow x = \pm5$. Logs need positive arguments, so only $x = 5$.
:::

## Common mistakes

:::mistake $\log(a + b) = \log a + \log b$
No: the sum rule is for **products**. $\log(a + b)$ has no simple expansion.
:::

:::mistake Confusing $b^x$ with $x^b$
$2^x$ (exponential) grows far faster than $x^2$ (power) for large $x$.
:::

:::mistake Logs of non-positive numbers
$\log 0$ and $\log(-2)$ are undefined; check solutions.
:::

## Try it yourself

:::try
Evaluate $\log_3 81$ and $\log_{10} 0.001$.
---
$3^4 = 81$ so 4; $10^{-3} = 0.001$ so $-3$.
:::

:::try
Expand $\ln\dfrac{x^3\sqrt y}{z}$.
---
$3\ln x + \tfrac12\ln y - \ln z$.
:::

:::try
Solve $5\cdot 2^{x} = 80$.
---
$2^x = 16$, $x = 4$.
:::

:::ds In data science
Skewed data (incomes, prices, populations) is often log-transformed so that multiplicative differences become additive. Logistic regression uses the log-odds $\ln\tfrac{p}{1-p}$, and models are trained by maximizing a **log**-likelihood because sums are easier than products.
:::

## Summary

- $a\cdot b^x$: multiply by $b$ each step; $e^{kt}$ for continuous change.
- $\log_b y = x \iff b^x = y$; logs turn products into sums.
- Solve exponential equations by taking logs; check log arguments are positive.
