## Summarizing data with a few numbers

A dataset of 10 000 salaries is impossible to read. Descriptive statistics compress it into a handful of numbers — where the data is **centred** and how much it **spreads** — that you can compare, report and reason with. Every data analysis starts here.

## Centre

:::def Mean, median, mode
- **Mean** $\bar x = \dfrac{1}{n}\sum x_i$ — the balance point.
- **Median** — the middle value of the sorted data (average of the two middle values if $n$ is even).
- **Mode** — the most frequent value.
:::

:::why Mean vs median
Ten people earn 3, 3, 4, 4, 4, 5, 5, 6, 6 and 60 (thousand). The mean is 10 — more than nine of the ten earn! The median is 4.5, which describes a "typical" person much better. The mean is pulled by outliers; the median is **robust**.
:::

## Spread

:::def Range, IQR, variance, standard deviation
- **Range** $= \max - \min$ (sensitive to outliers).
- **Quartiles** $Q_1, Q_3$ cut off the lowest and highest 25%; **IQR** $= Q_3 - Q_1$ is the spread of the middle half.
- **Sample variance** $s^2 = \dfrac{1}{n - 1}\sum (x_i - \bar x)^2$, **standard deviation** $s = \sqrt{s^2}$ — typical distance from the mean, in the data's units.
:::

:::example
Data: 4, 8, 6, 5, 7. Find mean, median, $s$.
---
Sorted: 4, 5, 6, 7, 8. Mean 6, median 6. Deviations $-2, -1, 0, 1, 2$; squares sum to 10; $s^2 = \tfrac{10}{4} = 2.5$, $s \approx 1.58$.
:::

:::why Why divide by $n - 1$?
Deviations are measured from $\bar x$, which was computed from the same data and sits closer to the data than the true mean $\mu$ does. Dividing by $n$ would systematically underestimate the variance; $n - 1$ corrects this (**Bessel's correction**).
:::

## Outliers and the five-number summary

The **five-number summary** min, $Q_1$, median, $Q_3$, max is drawn as a **box plot**. A common rule flags values below $Q_1 - 1.5\,\text{IQR}$ or above $Q_3 + 1.5\,\text{IQR}$ as outliers.

:::example
$Q_1 = 20$, $Q_3 = 32$. Is 52 an outlier?
---
IQR $= 12$, upper fence $32 + 18 = 50$. 52 > 50: yes.
:::

## How transformations change summaries

Adding a constant $c$ to every value shifts mean and median by $c$ but leaves $s$ and IQR unchanged. Multiplying by $a$ multiplies mean, median, $s$ and IQR by $|a|$ (sign aside).

## Common mistakes

:::mistake Reporting the mean of skewed data
For incomes, house prices or response times, report the median (and maybe the mean too).
:::

:::mistake Standard deviation as "average deviation"
$s$ is the square root of the average squared deviation; it weights big deviations more.
:::

## Try it yourself

:::try
Median of 3, 9, 1, 7, 5, 11?
---
Sorted 1, 3, 5, 7, 9, 11: $\tfrac{5 + 7}{2} = 6$.
:::

:::try
Temperatures have mean 20°C and SD 5°C. In Fahrenheit ($F = 1.8C + 32$)?
---
Mean $68$°F, SD $9$°F.
:::

:::ds In data science
`df.describe()` in pandas prints count, mean, std, min, quartiles and max for every column — the first command of almost every analysis. Try it on real data in the "Descriptive statistics on diabetes data" project.
:::

## Summary

- Centre: mean (sensitive) vs median (robust).
- Spread: SD with $n - 1$, IQR for the middle half.
- Box plots and the 1.5·IQR rule flag outliers.
