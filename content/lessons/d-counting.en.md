## Counting without listing

How many passwords of 8 characters? How many ways to choose a committee? How many possible poker hands? Listing is hopeless; counting principles give the answer in one line — and they are the foundation of probability, where "probability = favourable ÷ possible".

## The multiplication principle

:::def Multiplication principle
If a task has $k$ stages with $n_1, n_2, \dots, n_k$ choices (independent of each other), the total number of ways is $n_1 \times n_2 \times \dots \times n_k$.
:::

:::example
A license plate has 2 letters (26 options) then 3 digits. How many plates?
---
$26 \times 26 \times 10 \times 10 \times 10 = 676\,000$.
:::

## Permutations: order matters

:::def Factorial and permutations
$n! = n(n-1)\cdots 2\cdot 1$ (with $0! = 1$) is the number of ways to **arrange** $n$ objects.
Arranging $r$ out of $n$:
$$P(n, r) = \frac{n!}{(n - r)!} = n(n-1)\cdots(n - r + 1).$$
:::

:::example Podium
8 runners: how many ways to award gold, silver, bronze?
---
$P(8, 3) = 8 \cdot 7 \cdot 6 = 336$.
:::

## Combinations: order doesn't matter

:::def Combinations
The number of ways to **choose** $r$ objects from $n$ is
$$\binom{n}{r} = \frac{n!}{r!\,(n - r)!}.$$
:::

:::why Why divide by $r!$?
Each unordered group of $r$ can be arranged in $r!$ orders. Permutations count every group $r!$ times, so $\binom nr = \tfrac{P(n,r)}{r!}$.
:::

:::example Committee
Choose a committee of 3 from 10 people. Then: committee of 3 with at least one of the 4 women.
---
$\binom{10}{3} = 120$. Committees with no women: $\binom63 = 20$. So at least one woman: $120 - 20 = 100$.
:::

:::tip Which one?
Ask: "if I swap two of the chosen items, is it a different outcome?" Yes → permutation. No → combination.
:::

:::example Arrangements with repeated letters
How many arrangements of the letters of BANANA?
---
$\dfrac{6!}{3!\,2!\,1!} = 60$ (divide by the orders of the identical A's and N's).
:::

## Pascal's triangle

$\binom{n}{r} = \binom{n-1}{r-1} + \binom{n-1}{r}$, and the numbers $\binom nr$ are the coefficients of $(a + b)^n$ (binomial theorem): $(a+b)^4 = a^4 + 4a^3b + 6a^2b^2 + 4ab^3 + b^4$.

## Common mistakes

:::mistake Using permutations for groups
A team of 3 is a combination; a ranking of 3 is a permutation.
:::

:::mistake Adding instead of multiplying
"2 shirts **and** 3 trousers" gives $2 \times 3$ outfits; "2 shirts **or** 3 hats" gives $2 + 3$ choices.
:::

## Try it yourself

:::try
How many 4-digit PINs have no repeated digit?
---
$10 \cdot 9 \cdot 8 \cdot 7 = 5040$.
:::

:::try
How many ways to choose 5 cards from 52?
---
$\binom{52}{5} = 2\,598\,960$.
:::

:::try
In how many ways can 6 people sit in a row if two friends must sit together?
---
Treat the pair as one block: $5!$ arrangements × $2$ orders inside the block $= 240$.
:::

:::ds In data science
Combinatorics tells you how big a search is: trying every subset of 30 features means $2^{30} \approx 10^9$ models — infeasible, which is why feature selection uses greedy or regularized methods. In Python, `math.comb(10, 3)` and `math.perm(8, 3)` compute these numbers.
:::

## Summary

- Multiply choices across stages.
- Ordered: $P(n,r) = \tfrac{n!}{(n-r)!}$. Unordered: $\binom nr = \tfrac{n!}{r!(n-r)!}$.
- Use complements ("at least one") and divide for repeats.
