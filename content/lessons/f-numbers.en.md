## Why this matters

Every later topic — algebra, statistics, machine learning — is built on one simple object: the **number line**. Temperatures below zero, bank balances in debt, a model's error that can be too high or too low: all of these need numbers with a *direction*, not just a size. That is exactly what integers give us.

:::why Think of a thermometer lying on its side
Put a thermometer horizontally. Zero is in the middle, warmer temperatures go right, colder ones go left. "−5 °C" is not "nothing"; it is 5 steps to the **left** of zero. Adding means walking right, subtracting means walking left. Almost every rule in this lesson is just a statement about walking on this line.
:::

## The number line and integers

:::def Integers
The **integers** are the whole numbers and their opposites:
$$\dots,\ -3,\ -2,\ -1,\ 0,\ 1,\ 2,\ 3,\ \dots$$
Numbers to the right of zero are **positive**, to the left are **negative**. Zero is neither.
:::

:::def Opposite and absolute value
The **opposite** of $a$ is $-a$: the same distance from zero, on the other side. So the opposite of $4$ is $-4$ and the opposite of $-7$ is $7$.

The **absolute value** $|a|$ is the distance from $a$ to $0$. A distance is never negative:
$$|5| = 5,\qquad |-5| = 5,\qquad |0| = 0.$$
:::

**Order.** On the number line, the number further to the right is larger. That is why $-2 > -9$: $-2$ is to the right of $-9$, even though $9$ "looks bigger". Being far to the left means being *very* small.

:::tip Distance between two numbers
The distance between $a$ and $b$ is $|a - b|$. For example, the distance between $-3$ and $5$ is $|-3 - 5| = |-8| = 8$. Count the steps on the line to check: from $-3$ to $0$ is 3 steps, from $0$ to $5$ is 5 steps, total 8.
:::

## Adding and subtracting

Picture yourself standing on the line.

- **Adding a positive number**: walk right.
- **Adding a negative number**: walk left. So $7 + (-3) = 4$.
- **Subtracting** a number means adding its opposite: $a - b = a + (-b)$.

That last rule is the key. It turns every subtraction into an addition, and it explains the famous "two minuses make a plus":
$$5 - (-2) = 5 + 2 = 7.$$
Taking away a debt of 2 leaves you 2 richer.

:::def Quick rules for adding
- Same signs: add the absolute values, keep the sign. $(-4) + (-6) = -10$.
- Different signs: subtract the smaller absolute value from the larger, and keep the sign of the one with the larger absolute value. $(-9) + 4 = -5$, because $9 - 4 = 5$ and $-9$ "wins".
:::

:::example Temperature change
At 6 a.m. it is $-4$ °C. By noon it has warmed by $11$ degrees, and by midnight it has dropped $9$ degrees from noon. What is the midnight temperature?
---
Noon: $-4 + 11 = 7$ °C. Midnight: $7 - 9 = -2$ °C.

Check with distances: from $-4$ walk 11 steps right to $7$, then 9 steps left to $-2$.
:::

## Multiplying and dividing

Multiplication is repeated addition: $3 \times (-4) = (-4) + (-4) + (-4) = -12$. For signs, one rule covers everything:

| signs | result | example |
|---|---|---|
| $+ \times +$ | $+$ | $3 \times 4 = 12$ |
| $+ \times -$ | $-$ | $3 \times (-4) = -12$ |
| $- \times +$ | $-$ | $(-3) \times 4 = -12$ |
| $- \times -$ | $+$ | $(-3) \times (-4) = 12$ |

Division follows the same sign rules: $(-20) \div 5 = -4$ and $(-20) \div (-5) = 4$.

:::why Why is negative times negative positive?
Look at the pattern: $(-3)\times 2 = -6$, $(-3)\times 1 = -3$, $(-3)\times 0 = 0$. Each time the second factor drops by 1, the answer goes **up** by 3. Continue the pattern one more step: $(-3)\times(-1) = 3$. Any other answer would break the distributive law that all of algebra depends on.
:::

:::tip Counting minus signs
In a product, count the negative factors. An **even** number of them gives a positive result; an **odd** number gives a negative one. $(-1)(-2)(-3) = -6$ (three negatives), $(-1)(-2)(-3)(-4) = 24$ (four).
:::

:::example A product with several signs
Compute $\dfrac{(-6)\times 5}{-3} - (-4)$.
---
Numerator: $(-6)\times 5 = -30$. Divide: $-30 \div (-3) = 10$. Then $10 - (-4) = 10 + 4 = 14$.
:::

## Common mistakes

:::mistake Confusing $-3^2$ with $(-3)^2$
$-3^2$ means $-(3^2) = -9$, because the exponent applies only to $3$. But $(-3)^2 = (-3)(-3) = 9$. Brackets change the meaning.
:::

:::mistake "Bigger digits mean bigger number"
$-15 < -2$, not the other way round. On the negative side, the larger the absolute value, the **smaller** the number.
:::

:::mistake Dropping the sign when subtracting a negative
$8 - (-3)$ is $11$, not $5$. Rewrite it as $8 + 3$ before you compute.
:::

## Seeing it on a graph

The graph of $y = |x|$ shows that absolute value is always zero or positive, and that $|x|$ is the distance to $0$. Move the slider to see $y = |x - a|$, the distance to $a$.

:::graph Distance to a point
f: abs(x - a)
range: -8,8
params: a=2:-5:5
:::

## Try it yourself

:::try
Order from smallest to largest: $3,\ -7,\ 0,\ -1,\ |-5|$.
---
$|-5| = 5$, so the list is $-7 < -1 < 0 < 3 < 5$.
:::

:::try
Compute $(-2)\times(-3)\times(-5) + 12 \div (-4)$.
---
$(-2)(-3)(-5) = -30$ (three negatives). $12 \div (-4) = -3$. Total: $-30 + (-3) = -33$.
:::

:::try
A submarine is at $-120$ m. It rises $45$ m and then dives $30$ m. Where is it, and how far is it from a buoy at $-50$ m?
---
$-120 + 45 - 30 = -105$ m. Distance to the buoy: $|-105 - (-50)| = |-55| = 55$ m.
:::

:::ds In data science
Errors (residuals) are signed numbers: $\text{prediction} - \text{actual}$ can be positive or negative. Statistics like the **mean absolute error** use $|\,\cdot\,|$ so that positive and negative errors don't cancel out.
:::

## Summary

- Integers sit on a line; right is bigger.
- $|a|$ is the distance from $a$ to $0$; $|a-b|$ is the distance between $a$ and $b$.
- Subtracting = adding the opposite: $a - b = a + (-b)$.
- In products and quotients, an even number of negative signs gives a positive result.
