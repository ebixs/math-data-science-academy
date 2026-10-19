## Why this matters

Recipes, maps, currency exchange, speed, fuel use, dosage, pixel aspect ratios, "3 out of 4 users" — ratios compare quantities, and rates compare quantities with different units. Most "word problems" you will ever meet are ratio problems in disguise. In statistics, odds and rates per 1000 are ratios; in geometry, similar triangles and trigonometry are built on them.

:::why A ratio is a recipe
A drink is made with juice and water in the ratio $2 : 3$. That doesn't say how much you have — it says how the ingredients **scale together**. Double the batch: $4 : 6$. Ten times: $20 : 30$. All of these are the same recipe because the *relationship* stays the same.
:::

## Ratios

:::def Ratio
The ratio $a : b$ compares $a$ to $b$; it is the same as the fraction $\dfrac{a}{b}$. Ratios can be simplified like fractions: $12 : 18 = 2 : 3$.
:::

:::tip Parts of a whole
If juice : water $= 2 : 3$, there are $2 + 3 = 5$ parts in total. Juice is $\tfrac{2}{5}$ of the drink and water is $\tfrac{3}{5}$. To share 40 litres in this ratio: one part is $40 \div 5 = 8$ L, so 16 L juice and 24 L water.
:::

## Proportions

:::def Proportion
A proportion states that two ratios are equal:
$$\frac{a}{b} = \frac{c}{d}\quad\Longleftrightarrow\quad ad = bc.$$
The second form (cross-multiplication) lets you find a missing value.
:::

:::example Scaling a recipe
A recipe for 4 people uses 300 g of rice. How much for 7 people?
---
$\dfrac{300}{4} = \dfrac{x}{7}$, so $4x = 2100$ and $x = 525$ g. Or think "per person": $300 \div 4 = 75$ g each, times 7.
:::

:::example Map scale
On a map with scale $1 : 50\,000$, two towns are 7.4 cm apart. How far apart are they really?
---
$7.4 \times 50\,000 = 370\,000$ cm $= 3.7$ km.
:::

### Direct and inverse proportion

- **Direct**: $y = kx$. Double $x$, double $y$. (Cost of apples vs. kilograms.)
- **Inverse**: $y = \dfrac{k}{x}$. Double $x$, halve $y$. (Workers vs. time to finish a job.)

:::example Inverse proportion
6 workers finish a wall in 10 days. How long for 4 workers at the same pace?
---
Total work $= 6 \times 10 = 60$ worker-days. With 4 workers: $60 \div 4 = 15$ days. More workers → fewer days, so the answer had to be larger than 10.
:::

:::graph Direct vs inverse proportion
f: k*x
g: k/x
range: 0,8
params: k=2:0.5:5
:::

## Rates and unit rates

:::def Rate
A **rate** is a ratio of quantities with different units: km per hour, toman per kilogram, clicks per 1000 views. A **unit rate** has 1 in the denominator.
:::

:::example Which is the better deal?
1.5 kg of rice for 210, or 2 kg for 270?
---
Unit prices: $210 \div 1.5 = 140$ per kg and $270 \div 2 = 135$ per kg. The 2 kg bag is cheaper per kilogram.
:::

:::example Converting units
Convert 72 km/h to m/s.
---
$72\ \dfrac{\text{km}}{\text{h}} \times \dfrac{1000\ \text{m}}{1\ \text{km}} \times \dfrac{1\ \text{h}}{3600\ \text{s}} = 20\ \text{m/s}$. Multiplying by fractions equal to 1 changes the units, not the quantity.
:::

:::example Average speed
You drive 60 km at 30 km/h and then 60 km at 60 km/h. What is your average speed?
---
Time: $2 + 1 = 3$ h for $120$ km, so $40$ km/h — **not** $45$. Average speed is total distance over total time.
:::

## Common mistakes

:::mistake Treating inverse proportion as direct
"If 6 workers need 10 days, 4 workers need $\tfrac{4}{6}\times 10$ days" is wrong — fewer workers need **more** time.
:::

:::mistake Mixing the order in a ratio
$2 : 3$ (juice : water) is not $3 : 2$. Write the labels next to the numbers.
:::

:::mistake Averaging rates directly
Averages of speeds, prices per unit or percentages must be weighted by how much of each you have.
:::

## Try it yourself

:::try
Share 84 in the ratio $3 : 4$.
---
7 parts, so one part is 12: $36$ and $48$.
:::

:::try
If 5 notebooks cost 175, how much do 8 cost?
---
Unit price $175 \div 5 = 35$, so $8 \times 35 = 280$.
:::

:::try
A tap fills a tank in 6 hours and a second tap fills it in 3 hours. How long with both?
---
Rates: $\tfrac{1}{6}$ and $\tfrac{1}{3}$ tank per hour, total $\tfrac{1}{2}$. So 2 hours.
:::

:::ds In data science
Rates per unit make groups comparable: "incidents per 100 000 people" rather than raw counts, "revenue per user" rather than total revenue. Comparing raw counts between groups of different sizes is one of the most common analysis mistakes.
:::

## Summary

- A ratio $a:b$ is the fraction $\tfrac{a}{b}$; total parts give shares of a whole.
- Proportion: $\tfrac{a}{b} = \tfrac{c}{d} \iff ad = bc$.
- Direct: $y = kx$; inverse: $y = \tfrac{k}{x}$.
- Rates compare different units; convert with factors equal to 1.
