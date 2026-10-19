## Two conditions at once

"Tickets cost 3 for children and 5 for adults; 40 tickets brought in 164 — how many of each?" Two unknowns need two pieces of information. A **system** of equations asks for values that satisfy all the equations at the same time.

:::why Where two lines cross
Each linear equation in $x$ and $y$ is a line. A solution of the system is a point on **both** lines — their intersection. Two lines can cross once (one solution), be parallel (no solution) or be the same line (infinitely many).
:::

## Substitution

Solve one equation for one variable and substitute into the other.

:::example
Solve $\begin{cases} y = 2x - 1 \\ 3x + 2y = 12 \end{cases}$
---
Substitute: $3x + 2(2x - 1) = 12 \Rightarrow 7x - 2 = 12 \Rightarrow x = 2$. Then $y = 2(2) - 1 = 3$. Solution $(2, 3)$.
Check in both equations: $3 = 4 - 1$ ✓ and $6 + 6 = 12$ ✓.
:::

## Elimination

Add or subtract multiples of the equations so that one variable disappears.

:::example
Solve $\begin{cases} 3x + 4y = 10 \\ 5x - 2y = 8 \end{cases}$
---
Double the second: $10x - 4y = 16$. Add to the first: $13x = 26 \Rightarrow x = 2$. Then $3(2) + 4y = 10 \Rightarrow y = 1$.
:::

:::example The ticket problem
---
Let $c$ = children, $a$ = adults. $c + a = 40$ and $3c + 5a = 164$. From the first, $c = 40 - a$: $3(40 - a) + 5a = 164 \Rightarrow 120 + 2a = 164 \Rightarrow a = 22$, $c = 18$.
:::

## How many solutions?

:::def Classifying a $2\times 2$ system
For $a_1x + b_1y = c_1$ and $a_2x + b_2y = c_2$:
- different slopes → **exactly one** solution;
- same slope, different intercepts → **none** (parallel lines);
- same line → **infinitely many**.

Algebraically, elimination ends in $0 = k$ with $k \ne 0$ (none) or $0 = 0$ (infinitely many).
:::

:::graph Two lines
f: a*x + 1
g: -x + b
range: -8,8
params: a=2:-3:3; b=4:-5:5
:::

Set $a = -1$ in the graph: the lines become parallel and the intersection disappears.

## Common mistakes

:::mistake Multiplying only one side
When scaling an equation for elimination, multiply **both** sides: $2(5x - 2y) = 2(8)$.
:::

:::mistake Stopping after one variable
A solution is a **pair** $(x, y)$. Substitute back to find the other value.
:::

:::mistake Not checking
Always check the pair in **both** original equations.
:::

## Try it yourself

:::try
Solve $\begin{cases} x + y = 7 \\ x - y = 1 \end{cases}$
---
Add: $2x = 8$, $x = 4$, $y = 3$.
:::

:::try
Solve $\begin{cases} 2x - 3y = 5 \\ 4x - 6y = 7 \end{cases}$
---
Doubling the first gives $4x - 6y = 10$, which contradicts $= 7$. No solution (parallel lines).
:::

:::try
A coffee shop sells small cups for 4 and large for 6. 30 cups brought in 144. How many large cups?
---
$s + l = 30$, $4s + 6l = 144 \Rightarrow 4(30 - l) + 6l = 144 \Rightarrow 2l = 24 \Rightarrow l = 12$.
:::

:::ds In data science
Large systems $A\mathbf{x} = \mathbf{b}$ (hundreds of unknowns) appear in least-squares regression and are solved with matrices — exactly the elimination you did by hand, done systematically by `numpy.linalg.solve`.
:::

## Summary

- A system's solution satisfies every equation; geometrically, it's where the lines meet.
- Use substitution or elimination; check in both equations.
- One, none or infinitely many solutions.
