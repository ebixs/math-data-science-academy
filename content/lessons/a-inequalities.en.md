## From "equals" to "at least"

Real constraints are rarely exact: "the budget is **at most** 500", "you need **more than** 60 to pass", "the error must stay **below** 0.01". Inequalities describe these ranges. Their solutions are not single numbers but whole **intervals** of the number line.

:::why Same balance, with one twist
Solving an inequality works exactly like solving an equation — same operation on both sides — with one exception. Multiplying by a negative number reflects the number line: if $2 < 5$, then $-2 > -5$. So **multiplying or dividing by a negative flips the inequality sign**.
:::

## Notation

:::def Inequality symbols and intervals
| inequality | interval | on the line |
|---|---|---|
| $x < 3$ | $(-\infty, 3)$ | open circle at 3, shade left |
| $x \le 3$ | $(-\infty, 3]$ | filled circle at 3, shade left |
| $-1 < x \le 4$ | $(-1, 4]$ | between, open at $-1$, closed at 4 |
| $x \ge 2$ | $[2, \infty)$ | filled circle at 2, shade right |

Round brackets mean the endpoint is **excluded**, square brackets mean **included**. $\infty$ always gets a round bracket.
:::

## Solving

:::example A basic inequality
Solve $3x - 4 < 11$.
---
$3x < 15$, so $x < 5$. Interval: $(-\infty, 5)$.
:::

:::example Dividing by a negative
Solve $5 - 2x \ge 13$.
---
$-2x \ge 8$. Divide by $-2$ **and flip**: $x \le -4$. Check $x = -5$: $5 + 10 = 15 \ge 13$ ✓. Check $x = 0$: $5 \ge 13$ ✗ — good, 0 should not be a solution.
:::

:::example A double inequality
Solve $-3 \le 2x + 1 < 7$.
---
Subtract 1 from all three parts: $-4 \le 2x < 6$. Divide by 2: $-2 \le x < 3$, i.e. $[-2, 3)$.
:::

:::tip Always test a point
After solving, pick one number inside your answer and one outside, and plug them into the **original** inequality. It catches a forgotten sign flip immediately.
:::

### Absolute-value inequalities

Since $|x - a|$ is the distance from $x$ to $a$:
- $|x - a| < r$ means "within $r$ of $a$": $a - r < x < a + r$.
- $|x - a| > r$ means "farther than $r$ from $a$": $x < a - r$ or $x > a + r$.

:::example Tolerance
A part must be $50$ mm long with tolerance $0.2$ mm: $|L - 50| \le 0.2$. What lengths are accepted?
---
$49.8 \le L \le 50.2$.
:::

## Seeing it on a graph

$ax + b > c$ holds where the line $y = ax + b$ lies **above** $y = c$. Try a negative slope and see why the direction of the answer flips.

:::graph Above or below?
f: a*x + b
g: c
range: -8,8
params: a=-2:-4:4; b=1:-5:5; c=3:-6:6
:::

## Common mistakes

:::mistake Forgetting to flip
$-x > 4$ means $x < -4$, not $x > -4$.
:::

:::mistake Writing impossible chains
$5 < x < 2$ describes no numbers. Write $x < 2$ or $x > 5$ separately.
:::

:::mistake Wrong bracket at infinity
$[3, \infty]$ is incorrect; infinity is not a number you can reach: $[3, \infty)$.
:::

## Try it yourself

:::try
Solve $4(x - 2) > 6x + 2$.
---
$4x - 8 > 6x + 2 \Rightarrow -2x > 10 \Rightarrow x < -5$.
:::

:::try
Solve $1 < \dfrac{3 - x}{2} \le 4$.
---
$2 < 3 - x \le 8 \Rightarrow -1 < -x \le 5 \Rightarrow -5 \le x < 1$.
:::

:::try
Solve $|2x - 3| \ge 5$.
---
$2x - 3 \le -5$ or $2x - 3 \ge 5$, so $x \le -1$ or $x \ge 4$.
:::

:::ds In data science
Filters are inequalities: `df[(df.age >= 18) & (df.age < 65)]` keeps rows with $18 \le \text{age} < 65$. Confidence intervals and decision thresholds ("predict 1 if $p > 0.5$") are inequalities too.
:::

## Summary

- Solve like an equation, but flip the sign when multiplying or dividing by a negative.
- Answers are intervals: round bracket = excluded, square = included.
- $|x - a| < r$ is "within $r$ of $a$"; test a point to check.
