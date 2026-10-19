## Why this matters

Fractions are where many people's math confidence breaks — and where algebra, probability and statistics begin. A probability is a fraction. A slope is a fraction. Every formula with a division bar is a fraction. If fractions feel natural, half of algebra will feel natural too.

:::why A fraction is a division and a point on the line
$\dfrac{3}{4}$ means three things at once:
1. **Parts of a whole**: cut a pizza into 4 equal slices and take 3.
2. **A division**: $3 \div 4 = 0.75$.
3. **A number on the number line**: three quarters of the way from 0 to 1.

The third view is the most powerful: fractions are just numbers, and every rule below keeps the *point on the line* the same while changing how we write it.
:::

## Equivalent fractions

:::def Equivalent fractions
Multiplying or dividing the numerator and the denominator by the **same** non-zero number gives the same value:
$$\frac{a}{b} = \frac{a \times k}{b \times k}.$$
So $\dfrac{2}{3} = \dfrac{4}{6} = \dfrac{10}{15}$.
:::

To **simplify** a fraction, divide the top and bottom by their GCD: $\dfrac{42}{56} = \dfrac{42 \div 14}{56 \div 14} = \dfrac{3}{4}$. A fraction is in **lowest terms** when the GCD of top and bottom is 1.

:::tip Comparing fractions
To compare $\dfrac{5}{8}$ and $\dfrac{3}{5}$, cross-multiply: $5 \times 5 = 25$ and $3 \times 8 = 24$. Since $25 > 24$, $\dfrac{5}{8} > \dfrac{3}{5}$. (This is the same as rewriting both over the denominator 40.)
:::

## Adding and subtracting

You can only add pieces of the **same size**. Rewrite both fractions with a common denominator — ideally the LCM of the denominators — then add the numerators.

$$\frac{a}{b} + \frac{c}{d} = \frac{ad + bc}{bd}\quad\text{(always works, may need simplifying)}$$

:::example $\dfrac{5}{6} + \dfrac{3}{8}$
---
$\operatorname{lcm}(6, 8) = 24$. $\dfrac{5}{6} = \dfrac{20}{24}$ and $\dfrac{3}{8} = \dfrac{9}{24}$. Sum: $\dfrac{29}{24} = 1\tfrac{5}{24}$.
:::

:::example Mixed numbers: $3\tfrac{1}{4} - 1\tfrac{2}{3}$
---
Convert to improper fractions: $\dfrac{13}{4} - \dfrac{5}{3} = \dfrac{39}{12} - \dfrac{20}{12} = \dfrac{19}{12} = 1\tfrac{7}{12}$.
:::

## Multiplying and dividing

:::def Multiplication
Multiply tops and multiply bottoms:
$$\frac{a}{b} \times \frac{c}{d} = \frac{ac}{bd}.$$
"$\tfrac{2}{3}$ of $\tfrac{3}{4}$" means $\tfrac{2}{3}\times\tfrac{3}{4} = \tfrac{6}{12} = \tfrac{1}{2}$.
:::

:::tip Cancel before you multiply
$\dfrac{14}{15} \times \dfrac{25}{21}$: cancel 7 between 14 and 21, and 5 between 15 and 25, giving $\dfrac{2}{3} \times \dfrac{5}{3} = \dfrac{10}{9}$. Smaller numbers, fewer mistakes.
:::

:::def Division
Dividing by a fraction is multiplying by its **reciprocal**:
$$\frac{a}{b} \div \frac{c}{d} = \frac{a}{b} \times \frac{d}{c}.$$
:::

:::why Why "flip and multiply"?
$2 \div \tfrac{1}{4}$ asks "how many quarters fit into 2?" The answer is 8 — and $2 \times 4 = 8$. Dividing by a small piece gives a big count. In general, $\tfrac{c}{d}\times\tfrac{d}{c} = 1$, so multiplying by $\tfrac{d}{c}$ undoes multiplying by $\tfrac{c}{d}$ — that is exactly what division means.
:::

:::example $\dfrac{9}{10} \div \dfrac{3}{4}$
---
$\dfrac{9}{10} \times \dfrac{4}{3} = \dfrac{36}{30} = \dfrac{6}{5}$.
:::

## Fractions on a graph

The graph below shows $y = \dfrac{a}{x}$: as $x$ grows, the value of the fraction shrinks toward 0, and it is undefined at $x = 0$ — you can never divide by zero.

:::graph Dividing by bigger and bigger numbers
f: a/x
range: -6,6
params: a=2:1:6
:::

## Common mistakes

:::mistake Adding tops and bottoms
$\dfrac{1}{2} + \dfrac{1}{3} \ne \dfrac{2}{5}$. Half a pizza plus a third of a pizza is more than half a pizza, but $\tfrac{2}{5}$ is less than half! The correct sum is $\dfrac{5}{6}$.
:::

:::mistake Cancelling terms instead of factors
$\dfrac{3 + 5}{3} \ne 5$. You may only cancel common **factors** of the whole numerator and denominator: $\dfrac{3+5}{3} = \dfrac{8}{3}$.
:::

:::mistake Flipping the wrong fraction
In $\dfrac{a}{b} \div \dfrac{c}{d}$ only the **second** fraction (the divisor) is flipped.
:::

## Try it yourself

:::try
Simplify $\dfrac{90}{126}$.
---
$\gcd(90, 126) = 18$, so $\dfrac{90}{126} = \dfrac{5}{7}$.
:::

:::try
Compute $\dfrac{2}{3} - \dfrac{1}{4} \times \dfrac{8}{9}$.
---
Multiply first: $\dfrac{1}{4}\times\dfrac{8}{9} = \dfrac{2}{9}$. Then $\dfrac{2}{3} - \dfrac{2}{9} = \dfrac{6}{9} - \dfrac{2}{9} = \dfrac{4}{9}$.
:::

:::try
A recipe needs $\tfrac{3}{4}$ cup of sugar per batch. How many full batches can you make with $5\tfrac{1}{2}$ cups?
---
$\dfrac{11}{2} \div \dfrac{3}{4} = \dfrac{11}{2}\times\dfrac{4}{3} = \dfrac{44}{6} = 7\tfrac{1}{3}$. So 7 full batches.
:::

:::ds In data science
Probabilities, proportions ("$\tfrac{37}{120}$ of users clicked") and rates are fractions. Python's `fractions.Fraction(5, 6) + Fraction(3, 8)` gives the exact answer `29/24`, avoiding rounding errors of decimals.
:::

## Summary

- A fraction is a division and a point on the number line.
- Same value: multiply or divide top and bottom by the same number.
- Add/subtract with a common denominator; multiply straight across; divide by multiplying by the reciprocal.
- Cancel only common factors, never terms.
