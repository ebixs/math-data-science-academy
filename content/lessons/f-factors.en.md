## Why this matters

Fractions, simplifying expressions, finding common denominators, scheduling events that repeat, even encryption on the internet — all rely on how whole numbers break into pieces. Primes are the "atoms" of multiplication, and GCD and LCM are the two tools you will use most.

:::why Building blocks
Just as every molecule is made of atoms, every whole number greater than 1 is made by multiplying primes: $60 = 2 \times 2 \times 3 \times 5$. Once you know the "atoms" of two numbers, questions like "what do they have in common?" become easy.
:::

## Divisibility

:::def Divisor and multiple
$a$ **divides** $b$ (written $a \mid b$) if $b = a \times k$ for some whole number $k$. Then $a$ is a **divisor** (factor) of $b$, and $b$ is a **multiple** of $a$. Example: $6 \mid 42$ because $42 = 6 \times 7$.
:::

Quick divisibility tests save a lot of time:

| divisor | test | example |
|---|---|---|
| 2 | last digit even | 538 ✓ |
| 3 | digit sum divisible by 3 | 471: $4+7+1 = 12$ ✓ |
| 4 | last two digits divisible by 4 | 1316: $16$ ✓ |
| 5 | last digit 0 or 5 | 2345 ✓ |
| 9 | digit sum divisible by 9 | 7362: $18$ ✓ |
| 10 | last digit 0 | 4210 ✓ |

## Prime numbers

:::def Prime and composite
A **prime** is a whole number greater than 1 whose only divisors are 1 and itself: $2, 3, 5, 7, 11, 13, 17, 19, 23, \dots$. A number greater than 1 that is not prime is **composite**. The number 1 is neither.
:::

:::tip Testing whether $n$ is prime
You only need to try primes up to $\sqrt n$. If $n = a \times b$ with both factors bigger than $\sqrt n$, their product would exceed $n$. To test 97: $\sqrt{97} < 10$, so try 2, 3, 5, 7. None divides 97, so 97 is prime.
:::

:::def Prime factorization
Every whole number greater than 1 can be written as a product of primes in exactly **one** way (apart from order). This is the **fundamental theorem of arithmetic**.
$$360 = 2^3 \times 3^2 \times 5.$$
:::

:::example A factor tree
Factor $252$.
---
$252 = 2 \times 126 = 2 \times 2 \times 63 = 2 \times 2 \times 3 \times 21 = 2 \times 2 \times 3 \times 3 \times 7$.
So $252 = 2^2 \times 3^2 \times 7$. Divide by the smallest prime that works, repeat, and stop when what is left is prime.
:::

## GCD and LCM

:::def Greatest common divisor
$\gcd(a, b)$ is the largest number that divides both $a$ and $b$.
:::

:::def Least common multiple
$\operatorname{lcm}(a, b)$ is the smallest positive number that is a multiple of both $a$ and $b$.
:::

With prime factorizations:
- **GCD**: take each common prime with the **smaller** exponent.
- **LCM**: take every prime that appears with the **larger** exponent.

:::example GCD and LCM of 84 and 90
---
$84 = 2^2 \times 3 \times 7$ and $90 = 2 \times 3^2 \times 5$.

$\gcd = 2^1 \times 3^1 = 6$. $\operatorname{lcm} = 2^2 \times 3^2 \times 5 \times 7 = 1260$.

Check: $\gcd \times \operatorname{lcm} = 6 \times 1260 = 7560 = 84 \times 90$. This identity, $\gcd(a,b)\cdot\operatorname{lcm}(a,b) = ab$, always holds for positive integers.
:::

### Euclid's algorithm

For big numbers factoring is slow. Euclid noticed that $\gcd(a, b) = \gcd(b, r)$, where $r$ is the remainder of $a \div b$. Repeat until the remainder is 0.

:::example $\gcd(1071, 462)$
---
$1071 = 2 \times 462 + 147$, so $\gcd(1071, 462) = \gcd(462, 147)$.
$462 = 3 \times 147 + 21$, so it equals $\gcd(147, 21)$.
$147 = 7 \times 21 + 0$, so the answer is $21$.
:::

:::why Why Euclid's trick works
Any number that divides both $a$ and $b$ also divides $a - 2b$, $a - 3b$, … and in particular the remainder $r$. And anything that divides $b$ and $r$ divides $a = qb + r$. So the pairs $(a, b)$ and $(b, r)$ have exactly the same common divisors.
:::

## Where you use them

- **GCD** simplifies fractions: $\dfrac{84}{90} = \dfrac{84 \div 6}{90 \div 6} = \dfrac{14}{15}$.
- **LCM** gives common denominators and answers "when do two cycles line up?" A bus every 12 minutes and a train every 18 minutes leave together again after $\operatorname{lcm}(12, 18) = 36$ minutes.

## Common mistakes

:::mistake Calling 1 a prime
1 has only one divisor, so it is not prime. Otherwise factorization would not be unique ($6 = 2\times3 = 1\times2\times3 = \dots$).
:::

:::mistake Mixing up GCD and LCM
The GCD is at most the smaller number; the LCM is at least the larger number. If your "GCD" of 8 and 12 is 24, you computed the LCM.
:::

:::mistake Assuming odd means prime
$9, 15, 21, 27, 51, 91$ are odd but composite ($91 = 7 \times 13$).
:::

## Try it yourself

:::try
Is $221$ prime?
---
$\sqrt{221} < 15$; try 2, 3, 5, 7, 11, 13. $221 = 13 \times 17$, so it is composite.
:::

:::try
Find $\gcd(48, 180)$ and $\operatorname{lcm}(48, 180)$.
---
$48 = 2^4 \times 3$, $180 = 2^2 \times 3^2 \times 5$. $\gcd = 2^2 \times 3 = 12$, $\operatorname{lcm} = 2^4 \times 3^2 \times 5 = 720$. Check: $12 \times 720 = 8640 = 48 \times 180$.
:::

:::try
You have 84 red and 120 blue marbles and want identical bags with no marbles left over. What is the largest number of bags?
---
Each bag gets the same number of each color, so the number of bags divides both: $\gcd(84, 120) = 12$ bags, each with 7 red and 10 blue.
:::

:::ds In data science
Hashing, random-number generators and cryptography are built on prime numbers and modular arithmetic. In Python, `math.gcd(84, 90)` and `math.lcm(84, 90)` compute these directly.
:::

## Summary

- Primes are the building blocks; every number factors into primes in one way.
- GCD: common primes, smaller exponents. LCM: all primes, larger exponents.
- $\gcd(a,b)\cdot\operatorname{lcm}(a,b) = ab$; Euclid's algorithm finds the GCD fast.
