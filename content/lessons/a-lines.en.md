## Constant rate of change

A taxi that charges 12 per km, a plant that grows 2 cm a week, a salary that rises by the same amount each year: when something changes at a **constant rate**, its graph is a straight line. Linear functions are the simplest models in science and the starting point of linear regression.

:::why Slope = "how much $y$ changes when $x$ goes up by 1"
If a line has slope 3, every step of 1 to the right takes you 3 up. Slope $-\tfrac12$: every step right takes you half a unit down. Slope 0: flat. The slope is the *rate*, and the intercept is the *starting value*.
:::

## Slope

:::def Slope between two points
For points $(x_1, y_1)$ and $(x_2, y_2)$ with $x_1 \ne x_2$:
$$m = \frac{\text{rise}}{\text{run}} = \frac{y_2 - y_1}{x_2 - x_1}.$$
:::

:::example
Find the slope through $(1, 4)$ and $(5, -2)$.
---
$m = \dfrac{-2 - 4}{5 - 1} = \dfrac{-6}{4} = -\dfrac{3}{2}$. The line falls 3 units for every 2 to the right.
:::

## Equations of a line

:::def Three standard forms
- **Slope–intercept**: $y = mx + b$ ($b$ = value at $x = 0$).
- **Point–slope**: $y - y_1 = m(x - x_1)$ (through $(x_1, y_1)$).
- **Standard**: $Ax + By = C$.

Vertical lines $x = c$ have undefined slope; horizontal lines $y = c$ have slope 0.
:::

:::example Line through two points
Find the line through $(2, 1)$ and $(6, 9)$.
---
$m = \dfrac{9 - 1}{6 - 2} = 2$. Point–slope: $y - 1 = 2(x - 2)$, so $y = 2x - 3$. Check $(6, 9)$: $12 - 3 = 9$ ✓.
:::

:::graph Slope and intercept
f: m*x + b
range: -8,8
params: m=1:-3:3; b=0:-5:5
:::

## Parallel and perpendicular lines

- **Parallel** lines have equal slopes: $m_1 = m_2$.
- **Perpendicular** lines have slopes with product $-1$: $m_1 m_2 = -1$, i.e. $m_2 = -\dfrac{1}{m_1}$.

:::example
Find the line through $(3, -1)$ perpendicular to $y = \tfrac{3}{4}x + 2$.
---
Perpendicular slope $-\tfrac43$. $y + 1 = -\tfrac43(x - 3)$, so $y = -\tfrac43 x + 3$.
:::

## Modelling with lines

:::example Linear model from data
A plumber charges 150 for a 1-hour job and 330 for a 3-hour job. Assuming a linear price, what is the call-out fee and the hourly rate?
---
Slope $= \dfrac{330 - 150}{3 - 1} = 90$ per hour. $150 = 90(1) + b \Rightarrow b = 60$. Price $= 60 + 90h$.
:::

## Common mistakes

:::mistake Mixing the order in the slope formula
$\dfrac{y_2 - y_1}{x_2 - x_1}$ — subtract in the **same order** top and bottom. $\dfrac{y_2 - y_1}{x_1 - x_2}$ flips the sign.
:::

:::mistake Reading $b$ as the $x$-intercept
In $y = mx + b$, $b$ is where the line crosses the **$y$-axis**. The $x$-intercept is $-\tfrac{b}{m}$.
:::

:::mistake Perpendicular = negative slope
The perpendicular to slope 2 is $-\tfrac12$, not $-2$.
:::

## Try it yourself

:::try
Write $3x - 2y = 8$ in slope–intercept form and give the slope.
---
$-2y = -3x + 8 \Rightarrow y = \tfrac32 x - 4$. Slope $\tfrac32$, intercept $-4$.
:::

:::try
Find the line parallel to $y = -2x + 5$ through $(-1, 4)$.
---
$y - 4 = -2(x + 1) \Rightarrow y = -2x + 2$.
:::

:::try
Where does $y = 4x - 6$ cross the $x$-axis?
---
$0 = 4x - 6 \Rightarrow x = 1.5$.
:::

:::ds In data science
Simple linear regression fits $\hat y = b_0 + b_1 x$ to data. The slope $b_1$ is read as "on average, $y$ changes by $b_1$ when $x$ increases by 1". `numpy.polyfit(x, y, 1)` returns $[b_1, b_0]$.
:::

## Summary

- Slope $m = \tfrac{\Delta y}{\Delta x}$ is the constant rate of change.
- $y = mx + b$, $y - y_1 = m(x - x_1)$, $Ax + By = C$.
- Parallel: equal slopes. Perpendicular: $m_1m_2 = -1$.
