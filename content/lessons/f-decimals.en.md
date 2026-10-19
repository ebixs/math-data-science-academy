## Why this matters

Prices, measurements, interest rates, test scores, model accuracy, "sales grew 12%": daily life and data are full of decimals and percentages. Percent is also the place where everyday intuition fails most often — "up 50% then down 50%" is **not** back to where you started.

:::why Place value is the whole story
In $347.25$ each step to the right divides by 10: $3$ hundreds, $4$ tens, $7$ ones, $2$ tenths, $5$ hundredths. A decimal is just a fraction whose denominator is a power of ten: $0.25 = \tfrac{25}{100}$. And **percent** literally means "per hundred": $25\% = \tfrac{25}{100} = 0.25$.
:::

## Decimals and fractions

:::def Converting
- **Decimal → fraction**: write the digits over the right power of ten and simplify. $0.375 = \dfrac{375}{1000} = \dfrac{3}{8}$.
- **Fraction → decimal**: divide. $\dfrac{5}{8} = 5 \div 8 = 0.625$.
:::

Some fractions give **repeating** decimals: $\dfrac{1}{3} = 0.333\ldots = 0.\overline{3}$ and $\dfrac{2}{11} = 0.\overline{18}$. A fraction in lowest terms gives a terminating decimal exactly when its denominator has no prime factors other than 2 and 5.

:::tip Operations with decimals
- **Add/subtract**: line up the decimal points.
- **Multiply**: multiply as whole numbers, then count the total decimal places. $0.3 \times 0.02$: $3 \times 2 = 6$, with $1 + 2 = 3$ places, so $0.006$.
- **Divide**: shift both decimal points until the divisor is whole. $1.2 \div 0.04 = 120 \div 4 = 30$.
:::

## Percent

:::def The three percent questions
Every percent problem is $\text{part} = \text{rate} \times \text{whole}$, with one of the three unknown:
1. What is $15\%$ of $80$? $\;0.15 \times 80 = 12$.
2. $12$ is what percent of $80$? $\;12 \div 80 = 0.15 = 15\%$.
3. $12$ is $15\%$ of what? $\;12 \div 0.15 = 80$.
:::

:::def Percent change
$$\text{percent change} = \frac{\text{new} - \text{old}}{\text{old}} \times 100\%.$$
:::

:::example A price rise
A phone's price went from 400 to 460. What is the percent increase?
---
$\dfrac{460 - 400}{400} = \dfrac{60}{400} = 0.15 = 15\%$.
:::

### Multipliers

The cleanest way to handle increases and decreases is with **multipliers**:
- increase by $p\%$ → multiply by $1 + \tfrac{p}{100}$ (e.g. $+8\% \to \times 1.08$);
- decrease by $p\%$ → multiply by $1 - \tfrac{p}{100}$ (e.g. $-25\% \to \times 0.75$).

Successive changes **multiply**:

:::example Up 50%, then down 50%
---
$1.5 \times 0.5 = 0.75$. You end at $75\%$ of the start: a $25\%$ loss overall, not $0\%$.
:::

:::example Undoing a discount
After a $20\%$ discount a jacket costs 64. What was the original price?
---
$\text{original} \times 0.8 = 64$, so $\text{original} = 64 \div 0.8 = 80$. (Not $64 \times 1.2 = 76.8$!)
:::

:::example Compound growth
A savings account grows $5\%$ per year. What is 1000 worth after 3 years?
---
$1000 \times 1.05^3 = 1000 \times 1.157625 \approx 1157.63$. The interest earns interest — this is exponential growth, which you'll meet again with exponents and logarithms.
:::

## Percentage points vs percent

If an interest rate goes from $4\%$ to $5\%$, it rose by **1 percentage point** but by **25 percent** (because $\tfrac{5-4}{4} = 0.25$). News reports confuse these all the time.

## Common mistakes

:::mistake Adding successive percentages
$+10\%$ then $+10\%$ is $\times 1.1 \times 1.1 = \times 1.21$, i.e. $+21\%$, not $+20\%$.
:::

:::mistake Using the new value as the base
Percent change always divides by the **old** value.
:::

:::mistake Misplacing the decimal point
$0.5\%$ is $0.005$, not $0.5$. Move the point two places left when dropping the percent sign.
:::

## Try it yourself

:::try
Write $0.45$ and $\tfrac{7}{20}$ as percentages.
---
$0.45 = 45\%$; $\tfrac{7}{20} = 0.35 = 35\%$.
:::

:::try
A town's population fell from 25 000 to 23 500. Percent change?
---
$\dfrac{23\,500 - 25\,000}{25\,000} = -0.06$, a $6\%$ decrease.
:::

:::try
A price including $9\%$ tax is 218. What is the price before tax?
---
$218 \div 1.09 = 200$.
:::

:::ds In data science
Accuracy, conversion rates, growth rates and error rates are all percentages. In pandas, `df['sales'].pct_change()` computes $\tfrac{\text{new}-\text{old}}{\text{old}}$ row by row, and multiplying `(1 + r).prod()` gives the total growth over many periods.
:::

## Summary

- Decimals and percents are fractions with denominators 10, 100, 1000, …
- $\text{part} = \text{rate}\times\text{whole}$ solves all basic percent problems.
- Percent change $= \tfrac{\text{new}-\text{old}}{\text{old}}$; use multipliers, and multiply them for successive changes.
