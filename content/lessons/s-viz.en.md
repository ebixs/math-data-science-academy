## Look before you calculate

Four datasets can share the same mean, variance and correlation and look completely different (Anscombe's quartet). A picture reveals shape, clusters, gaps and outliers that summaries hide. Choosing the right chart is a core data-science skill.

## Shapes of distributions

:::def Shape vocabulary
- **Symmetric**: left and right halves mirror each other (mean ≈ median).
- **Right-skewed**: a long tail to the right (mean > median) — incomes, prices, waiting times.
- **Left-skewed**: long tail to the left (mean < median) — exam scores near a ceiling.
- **Unimodal / bimodal**: one or two peaks. Two peaks often mean two groups mixed together.
:::

:::graph Skewness: a lognormal-like shape vs a bell
f: exp(-(ln(x) - m)^2/(2*0.25))/(x*sqrt(2*pi*0.25))
g: exp(-(x - 2)^2/2)/sqrt(2*pi)
range: 0.05,6
params: m=0.5:0:1.2
:::

## Choosing a chart

| question | chart |
|---|---|
| distribution of one numeric variable | histogram, box plot, density |
| compare a number across categories | bar chart |
| relation between two numeric variables | scatter plot |
| change over time | line chart |
| parts of a whole (few parts) | stacked bar (pie only with very few parts) |

:::def Histogram
Splits the range into bins and draws bars whose **area** is proportional to the number of values in each bin. The bin width changes the picture: too wide hides detail, too narrow shows noise.
:::

:::def Box plot
Shows the five-number summary and outliers. Great for comparing many groups side by side.
:::

:::example Reading a box plot
Box plot A: median 50, IQR 10. Box plot B: median 55, IQR 30. What can you say?
---
B is typically higher but far more variable; many values of A and B overlap. A difference in medians of 5 is small compared with B's spread.
:::

## Honest charts

:::mistake Truncated axes
A bar chart starting at 95 instead of 0 makes 96 vs 98 look like a huge difference. Bars encode length, so they must start at zero.
:::

:::mistake Too many categories or 3D effects
3D pies and dozens of slices distort comparisons. Sort bars and keep it simple.
:::

:::mistake Correlation from a time chart
Two lines rising together over time doesn't mean one causes the other — both may just follow time.
:::

## Try it yourself

:::try
A histogram of house prices has a long right tail. Which is larger, mean or median?
---
The mean (pulled toward the tail).
:::

:::try
Which chart for "monthly sales of 3 products over 2 years"?
---
A line chart with one line per product.
:::

:::ds In data science
`df['col'].hist(bins=30)`, `df.boxplot(by='group')` and `plt.scatter(x, y)` are the first plots of exploratory data analysis. Always plot the data before fitting a model.
:::

## Summary

- Describe shape: symmetric / skewed, number of peaks, outliers.
- Histogram/box plot for one variable, scatter for two, line for time.
- Honest charts: bars from zero, few categories, no 3D.
