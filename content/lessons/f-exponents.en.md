## Why this matters

Exponents describe repeated multiplication — and repeated multiplication is everywhere: compound interest, population growth, computer memory ($2^{10} = 1024$), the size of atoms and galaxies, and the learning rates and regularization strengths in machine learning ($10^{-3}$, $10^{-4}$). Roots undo exponents, and scientific notation lets us write very big and very small numbers without drowning in zeros.

:::why Exponents count multiplications
$2^5$ means "multiply five 2s": $2\times2\times2\times2\times2 = 32$. Every exponent rule below is just counting: if you multiply three 2s by four more 2s, you have seven 2s.
:::

## Exponent rules

:::def Powers
For a whole number $n \ge 1$, $a^n = \underbrace{a \times a \times \cdots \times a}_{n\text{ times}}$. Here $a$ is the **base** and $n$ the **exponent**.
:::

| rule | why | example |
|---|---|---|
| $a^m \cdot a^n = a^{m+n}$ | $m$ factors then $n$ more | $2^3\cdot 2^4 = 2^7$ |
| $\dfrac{a^m}{a^n} = a^{m-n}$ | $n$ factors cancel | $\dfrac{5^6}{5^2} = 5^4$ |
| $(a^m)^n = a^{mn}$ | $n$ groups of $m$ | $(3^2)^3 = 3^6$ |
| $(ab)^n = a^n b^n$ | rearrange factors | $(2x)^3 = 8x^3$ |
| $\left(\dfrac{a}{b}\right)^n = \dfrac{a^n}{b^n}$ | same idea | $\left(\tfrac{2}{3}\right)^2 = \tfrac{4}{9}$ |

### Zero and negative exponents

The quotient rule forces the meaning of $a^0$ and $a^{-n}$:
$$\frac{a^3}{a^3} = 1 \text{ and } a^{3-3} = a^0, \text{ so } a^0 = 1\ (a \ne 0).$$
$$\frac{a^2}{a^5} = \frac{1}{a^3} \text{ and } a^{2-5} = a^{-3}, \text{ so } a^{-n} = \frac{1}{a^n}.$$

:::tip A negative exponent is not a negative number
$2^{-3} = \dfrac{1}{8}$, which is positive and small. A negative exponent means "reciprocal", not "negative".
:::

:::example Simplify $\dfrac{(2x^3)^2 \cdot x^{-1}}{4x^2}$
---
$(2x^3)^2 = 4x^6$. Then $4x^6 \cdot x^{-1} = 4x^5$. Divide: $\dfrac{4x^5}{4x^2} = x^3$.
:::

## Roots

:::def Square root and $n$-th root
$\sqrt{a}$ is the **non-negative** number whose square is $a$: $\sqrt{49} = 7$. More generally $\sqrt[n]{a}$ is the number whose $n$-th power is $a$: $\sqrt[3]{-27} = -3$.
:::

Roots are fractional exponents: $\sqrt{a} = a^{1/2}$ and $\sqrt[n]{a} = a^{1/n}$, because $(a^{1/2})^2 = a^{1} = a$. Then $a^{m/n} = (\sqrt[n]{a})^m$, e.g. $8^{2/3} = (\sqrt[3]{8})^2 = 4$.

:::tip Simplifying square roots
Pull out perfect squares: $\sqrt{72} = \sqrt{36 \cdot 2} = 6\sqrt{2}$. And $\sqrt{ab} = \sqrt a\sqrt b$ for $a, b \ge 0$ — but $\sqrt{a + b} \ne \sqrt a + \sqrt b$.
:::

## Scientific notation

:::def Scientific notation
A number in scientific notation has the form $m \times 10^k$ with $1 \le |m| < 10$ and $k$ an integer.
$$384\,400\,000 = 3.844 \times 10^8,\qquad 0.000\,0052 = 5.2 \times 10^{-6}.$$
:::

:::example Multiply and divide
Compute $(3 \times 10^5)(4 \times 10^{-2})$ and $\dfrac{6 \times 10^{3}}{1.5 \times 10^{-4}}$.
---
$12 \times 10^{3} = 1.2 \times 10^4$. And $\dfrac{6}{1.5} \times 10^{3-(-4)} = 4 \times 10^7$.
:::

:::example How long does light take from the Sun?
Distance $1.5 \times 10^{11}$ m, speed $3 \times 10^8$ m/s.
---
$\dfrac{1.5 \times 10^{11}}{3 \times 10^8} = 0.5 \times 10^3 = 500$ s, a bit over 8 minutes.
:::

## Seeing exponential growth

Compare $y = x^2$ (a power of $x$) with $y = b^x$ (an exponential). Move the slider: for $b > 1$ the exponential eventually beats any power.

:::graph Power vs exponential
f: x^2
g: b^x
range: -3,6
params: b=2:0.5:3
:::

## Common mistakes

:::mistake Multiplying the base
$2^3 \cdot 2^4 = 2^7$, not $4^7$. The base stays; exponents add.
:::

:::mistake Distributing over a sum
$(a + b)^2 \ne a^2 + b^2$. For example $(3+4)^2 = 49$ but $9 + 16 = 25$.
:::

:::mistake Sign and brackets
$-2^4 = -16$ while $(-2)^4 = 16$.
:::

:::mistake Two square roots
$x^2 = 9$ has two solutions, $x = \pm 3$, but $\sqrt{9}$ means only $3$.
:::

## Try it yourself

:::try
Simplify $\dfrac{a^5 b^{-2}}{a^2 b^3}$.
---
$a^{5-2} b^{-2-3} = a^3 b^{-5} = \dfrac{a^3}{b^5}$.
:::

:::try
Evaluate $27^{2/3}$ and $16^{-3/4}$.
---
$27^{2/3} = 3^2 = 9$. $16^{-3/4} = \dfrac{1}{(\sqrt[4]{16})^3} = \dfrac{1}{8}$.
:::

:::try
Write $0.000\,73 \times 2\,000\,000$ in scientific notation.
---
$(7.3 \times 10^{-4})(2 \times 10^{6}) = 14.6 \times 10^{2} = 1.46 \times 10^3$.
:::

:::ds In data science
Computers store numbers in floating point, which is scientific notation in base 2. Python prints `1e-3` for $10^{-3}$. Hyperparameters like a learning rate are often searched on a log scale: $10^{-1}, 10^{-2}, 10^{-3}, \dots$
:::

## Summary

- $a^m a^n = a^{m+n}$, $\tfrac{a^m}{a^n} = a^{m-n}$, $(a^m)^n = a^{mn}$, $a^0 = 1$, $a^{-n} = \tfrac{1}{a^n}$.
- Roots are fractional exponents: $\sqrt[n]{a} = a^{1/n}$.
- Scientific notation: $m \times 10^k$ with $1 \le |m| < 10$.
