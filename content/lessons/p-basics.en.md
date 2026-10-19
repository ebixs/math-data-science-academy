## Measuring uncertainty

Will it rain? Will a customer churn? Is this email spam? Probability puts a number between 0 and 1 on uncertainty, so we can reason with it, compare options and make decisions. It is the language of statistics and machine learning.

:::why Two ways to think about probability
**Long-run frequency**: if you flip a fair coin many times, about half the flips are heads, so $P(\text{heads}) = 0.5$. **Degree of belief**: "70% chance of rain tomorrow" for an event that happens only once. The rules below work for both.
:::

## The basic setup

:::def Sample space and events
The **sample space** $S$ is the set of all possible outcomes. An **event** is a subset of $S$. For a die, $S = \{1, \dots, 6\}$ and "even" is $E = \{2, 4, 6\}$.
:::

:::def Equally likely outcomes
If all outcomes are equally likely:
$$P(E) = \frac{|E|}{|S|} = \frac{\text{favourable outcomes}}{\text{possible outcomes}}.$$
:::

:::def Axioms and rules
- $0 \le P(E) \le 1$, $P(S) = 1$.
- **Complement**: $P(E^c) = 1 - P(E)$.
- **Addition**: $P(A \cup B) = P(A) + P(B) - P(A \cap B)$; if $A, B$ are mutually exclusive, $P(A\cup B) = P(A) + P(B)$.
:::

:::example Two dice
Roll two dice. $P(\text{sum} = 8)$? $P(\text{at least one 6})$?
---
36 equally likely pairs. Sum 8: $(2,6),(3,5),(4,4),(5,3),(6,2)$, so $\tfrac{5}{36}$.
At least one 6: complement "no 6" has $5\times5 = 25$ outcomes, so $1 - \tfrac{25}{36} = \tfrac{11}{36}$.
:::

## Independence

:::def Independent events
$A$ and $B$ are **independent** if knowing one happened doesn't change the probability of the other; then
$$P(A \cap B) = P(A)\,P(B).$$
:::

:::example
A machine fails on a given day with probability 0.02, independently each day. Probability of no failure in 30 days?
---
$0.98^{30} \approx 0.545$. So the chance of at least one failure is about 45% — small daily risks add up.
:::

## Counting and probability

:::example A lottery
Choose 6 numbers from 1–49. Probability of matching all six?
---
$\dfrac{1}{\binom{49}{6}} = \dfrac{1}{13\,983\,816} \approx 7 \times 10^{-8}$.
:::

## Common mistakes

:::mistake The gambler's fallacy
After 5 heads in a row, a fair coin is still 50/50. Independent trials have no memory.
:::

:::mistake Adding overlapping events
$P(\text{king or heart}) = \tfrac4{52} + \tfrac{13}{52} - \tfrac1{52} = \tfrac{16}{52}$, not $\tfrac{17}{52}$.
:::

:::mistake Treating outcomes as equally likely when they aren't
Sums of two dice from 2 to 12 are **not** equally likely: 7 is six times as likely as 2.
:::

## Try it yourself

:::try
A bag has 5 red, 3 blue and 2 green balls. $P(\text{not red})$?
---
$1 - \tfrac{5}{10} = \tfrac12$.
:::

:::try
Two cards are drawn with replacement. $P(\text{both aces})$?
---
$\tfrac{4}{52}\cdot\tfrac{4}{52} = \tfrac{1}{169}$.
:::

:::try
Flip 3 coins. $P(\text{exactly 2 heads})$?
---
$\binom32 = 3$ outcomes out of 8: $\tfrac38$.
:::

:::ds In data science
A classifier outputs probabilities, e.g. `model.predict_proba(X)`. Simulating random events with `numpy.random` (Monte Carlo) estimates probabilities that are hard to compute by hand — try the Monte Carlo project in the Python notebook.
:::

## Summary

- $P(E) = \tfrac{|E|}{|S|}$ for equally likely outcomes; $P(E^c) = 1 - P(E)$.
- $P(A\cup B) = P(A) + P(B) - P(A\cap B)$.
- Independent: $P(A\cap B) = P(A)P(B)$; "at least one" via the complement.
