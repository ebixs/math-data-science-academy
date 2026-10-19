## Updating with new information

A test comes back positive. A user clicked an ad. It's cloudy this morning. New information changes probabilities. **Conditional probability** says how, and **Bayes' rule** turns "probability of evidence given cause" into "probability of cause given evidence" — the foundation of spam filters, medical diagnosis and Bayesian statistics.

:::why Shrinking the world
$P(A \mid B)$ means: "now that we know $B$ happened, restrict the world to $B$; what fraction of it is also $A$?" That is why we divide by $P(B)$.
:::

## Conditional probability

:::def Conditional probability
$$P(A \mid B) = \frac{P(A \cap B)}{P(B)},\qquad P(B) > 0.$$
Rearranged: $P(A\cap B) = P(A\mid B)\,P(B)$ (the **multiplication rule**).
:::

:::example A two-way table
| | likes tea | no tea | total |
|---|---|---|---|
| student | 30 | 20 | 50 |
| teacher | 15 | 35 | 50 |

$P(\text{tea} \mid \text{student})$ and $P(\text{student} \mid \text{tea})$?
---
$\tfrac{30}{50} = 0.6$ and $\tfrac{30}{45} \approx 0.667$. The order of conditioning matters!
:::

:::def Law of total probability
If $B_1, \dots, B_k$ split the sample space:
$$P(A) = \sum_i P(A \mid B_i)\,P(B_i).$$
:::

## Bayes' rule

:::def Bayes' rule
$$P(B \mid A) = \frac{P(A \mid B)\,P(B)}{P(A)} = \frac{P(A\mid B)P(B)}{P(A\mid B)P(B) + P(A\mid B^c)P(B^c)}.$$
$P(B)$ is the **prior**, $P(A\mid B)$ the **likelihood**, $P(B\mid A)$ the **posterior**.
:::

:::example A medical test
A disease affects 1% of people. A test detects it 95% of the time (sensitivity) and gives a false positive 5% of the time. You test positive. Probability you have the disease?
---
$P(+) = 0.95(0.01) + 0.05(0.99) = 0.0095 + 0.0495 = 0.059$.
$P(D \mid +) = \dfrac{0.0095}{0.059} \approx 0.161$. Only about **16%**!
:::

:::why Natural frequencies make it obvious
Imagine 10 000 people: 100 are sick and 95 of them test positive; 9900 are healthy and 495 of them test positive. Of the $95 + 495 = 590$ positives, only 95 are sick: $\tfrac{95}{590} \approx 16\%$. A rare condition means most positives are false alarms.
:::

## Independence revisited

$A$ and $B$ are independent exactly when $P(A \mid B) = P(A)$.

## Common mistakes

:::mistake Confusing $P(A\mid B)$ with $P(B\mid A)$
"Most smokers don't get lung cancer" and "most lung-cancer patients smoked" are both true. This "prosecutor's fallacy" causes real-world harm.
:::

:::mistake Ignoring the base rate
Test accuracy alone doesn't tell you $P(\text{disease}\mid +)$; the prior prevalence matters enormously.
:::

## Try it yourself

:::try
$P(A) = 0.5$, $P(B) = 0.4$, $P(A\cap B) = 0.1$. Find $P(A\mid B)$. Are $A, B$ independent?
---
$\tfrac{0.1}{0.4} = 0.25 \ne 0.5$: not independent.
:::

:::try
Two cards without replacement. $P(\text{both hearts})$?
---
$\tfrac{13}{52}\cdot\tfrac{12}{51} = \tfrac{1}{17}$.
:::

:::try
Spam is 20% of email. "Free" appears in 60% of spam and 5% of normal mail. $P(\text{spam}\mid\text{"free"})$?
---
$\dfrac{0.6(0.2)}{0.6(0.2) + 0.05(0.8)} = \dfrac{0.12}{0.16} = 0.75$.
:::

:::ds In data science
Naive Bayes classifiers apply Bayes' rule word by word. Precision is $P(\text{actually positive}\mid\text{predicted positive})$ and recall is $P(\text{predicted positive}\mid\text{actually positive})$ — two conditional probabilities in opposite directions.
:::

## Summary

- $P(A\mid B) = \tfrac{P(A\cap B)}{P(B)}$; order matters.
- Total probability: sum over cases. Bayes: posterior ∝ likelihood × prior.
- Rare events → most positives can be false positives.
