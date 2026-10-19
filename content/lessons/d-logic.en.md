## Why logic?

Mathematics is the art of being **certain**. A proof is a chain of statements where each one follows from the previous ones by rules of logic. The same rules drive every `if` in a program, every database query, and every argument about data ("if the p-value is small, then…").

## Statements and connectives

:::def Statements and connectives
A **statement** is either true (T) or false (F). From statements $p, q$ we build:
- $\neg p$ (not $p$), $p \wedge q$ ($p$ and $q$), $p \vee q$ ($p$ or $q$, inclusive),
- $p \to q$ (if $p$ then $q$), $p \leftrightarrow q$ ($p$ if and only if $q$).
:::

| $p$ | $q$ | $p\wedge q$ | $p \vee q$ | $p \to q$ |
|---|---|---|---|---|
| T | T | T | T | T |
| T | F | F | T | F |
| F | T | F | T | T |
| F | F | F | F | T |

:::why Why is "false implies anything" true?
"If it rains, the street gets wet" is only broken when it rains **and** the street stays dry. On a dry day, the promise isn't broken, whatever the street does. So $p \to q$ is false only in the row $p = $ T, $q = $ F.
:::

:::def Converse, contrapositive, negation
For $p \to q$:
- **contrapositive** $\neg q \to \neg p$ — always equivalent to the original;
- **converse** $q \to p$ — **not** equivalent in general;
- negation: $\neg(p \to q) \equiv p \wedge \neg q$.
:::

:::example
"If $n$ is divisible by 4, then $n$ is even." Converse and contrapositive?
---
Converse: "if $n$ is even, then $n$ is divisible by 4" — false ($n = 6$). Contrapositive: "if $n$ is odd, then $n$ is not divisible by 4" — true, like the original.
:::

## Quantifiers

- $\forall x\ P(x)$: "for all $x$". To disprove it, one **counterexample** is enough.
- $\exists x\ P(x)$: "there exists $x$". Negations swap them: $\neg\forall x\,P(x) \equiv \exists x\,\neg P(x)$.

## Proof techniques

:::example Direct proof
Prove: the sum of two odd numbers is even.
---
Let the numbers be $2a + 1$ and $2b + 1$. Their sum is $2a + 2b + 2 = 2(a + b + 1)$, which is even. ∎
:::

:::example Proof by contrapositive
Prove: if $n^2$ is even, then $n$ is even.
---
Contrapositive: if $n$ is odd, $n^2$ is odd. $n = 2k + 1 \Rightarrow n^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1$, odd. ∎
:::

:::example Proof by contradiction
Prove $\sqrt2$ is irrational.
---
Suppose $\sqrt2 = \tfrac ab$ in lowest terms. Then $a^2 = 2b^2$, so $a^2$ is even and (previous proof) $a$ is even: $a = 2c$. Then $4c^2 = 2b^2$, so $b^2 = 2c^2$ and $b$ is even too — contradicting "lowest terms". ∎
:::

## Common mistakes

:::mistake Assuming the converse
"All squares are rectangles" does not mean "all rectangles are squares".
:::

:::mistake Proof by example
Checking a few cases never proves a "for all" statement; one counterexample disproves it.
:::

## Try it yourself

:::try
Negate: "every student passed some exam".
---
"Some student failed every exam" ($\exists s\ \forall e$: $s$ did not pass $e$).
:::

:::try
Is $(p \to q) \equiv (\neg p \vee q)$? Check with a truth table.
---
Both are F only when $p = $ T and $q = $ F: equivalent.
:::

:::ds In data science
Boolean masks combine conditions with and/or/not exactly like truth tables. Logic also guards against bad reasoning: "if the model is good, accuracy is high" does not mean "high accuracy implies a good model" (think of imbalanced data).
:::

## Summary

- $p \to q$ is false only when $p$ is true and $q$ false; it equals its contrapositive.
- Negating swaps $\forall$ and $\exists$.
- Direct proof, contrapositive and contradiction are the three basic tools.
