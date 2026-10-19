## Do two variables move together?

Does study time relate to exam score? Advertising to sales? BMI to disease progression? **Correlation** measures the strength of a linear relationship, and **simple linear regression** draws the best straight line through the data to make predictions.

## Correlation

:::def Pearson correlation
$$r = \frac{1}{n - 1}\sum \left(\frac{x_i - \bar x}{s_x}\right)\left(\frac{y_i - \bar y}{s_y}\right).$$
$-1 \le r \le 1$. $r$ near $\pm1$: points close to a line; $r \approx 0$: no **linear** relation. $r$ has no units and doesn't change if you rescale $x$ or $y$.
:::

:::why The product of z-scores
When $x$ is above its mean and $y$ is above its mean too (both z-scores positive), the product is positive; same when both are below. If high $x$ goes with low $y$, products are negative. $r$ averages these products.
:::

:::tip Rough guide
$|r| < 0.3$ weak, $0.3$–$0.7$ moderate, $> 0.7$ strong — but always look at the scatter plot.
:::

## The least-squares line

:::def Regression line
The line $\hat y = b_0 + b_1x$ that minimizes $\sum (y_i - \hat y_i)^2$ has
$$b_1 = r\,\frac{s_y}{s_x},\qquad b_0 = \bar y - b_1\bar x.$$
It always passes through $(\bar x, \bar y)$.
:::

:::example
Study hours vs score: $\bar x = 5$, $s_x = 2$, $\bar y = 70$, $s_y = 10$, $r = 0.8$. Find the line and predict for 8 hours.
---
$b_1 = 0.8\cdot\tfrac{10}{2} = 4$, $b_0 = 70 - 20 = 50$. $\hat y = 50 + 4x$; for $x = 8$: 82.
:::

:::def Coefficient of determination
$R^2 = r^2$ (for simple regression) is the share of the variance in $y$ explained by the line. $r = 0.8$ gives $R^2 = 0.64$: 64% explained.
:::

:::graph Fit a line by eye
f: b*x + a
points: 1,2.1; 2,3.9; 3,6.2; 4,7.8; 5,10.1; 6,12.2
range: 0,7
params: a=0:-3:3; b=2:0:4
:::

## Residuals

A **residual** is $e_i = y_i - \hat y_i$. A residual plot (residuals vs $x$) should look like random noise; a curve means a straight line is the wrong model.

## Common mistakes

:::mistake Correlation is causation
Ice-cream sales and drownings are correlated — both rise in summer. A **confounder** can create correlation without causation.
:::

:::mistake $r = 0$ means unrelated
$y = x^2$ on $[-3, 3]$ has $r = 0$ but a perfect (non-linear) relation.
:::

:::mistake Extrapolating
A line fitted for 0–10 hours of study says nothing reliable about 40 hours.
:::

## Try it yourself

:::try
If $r = -0.9$, $s_x = 3$, $s_y = 6$, what is the slope?
---
$b_1 = -0.9\cdot2 = -1.8$.
:::

:::try
A line $\hat y = 12 + 0.5x$ predicts 17 for a point with actual $y = 15$. Residual?
---
$15 - 17 = -2$.
:::

:::ds In data science
`df.corr()` gives the correlation matrix; `np.polyfit(x, y, 1)` or scikit-learn's `LinearRegression` fits the line. The "gradient descent regression" Python project fits this exact line on real diabetes data — first by gradient descent, then by the closed form.
:::

## Summary

- $r$ measures linear association, from $-1$ to $1$.
- Least-squares line: slope $r\tfrac{s_y}{s_x}$, through $(\bar x, \bar y)$; $R^2 = r^2$.
- Correlation ≠ causation; check residuals and don't extrapolate.
