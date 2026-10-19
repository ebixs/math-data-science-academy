## Collections and their overlaps

A **set** is a collection of distinct objects. Sets are the language of probability (events are sets of outcomes), databases (SQL joins are set operations) and data filtering ("users who bought A **and** B"). Venn diagrams make the logic visible.

## Basics

:::def Set notation
- $A = \{1, 2, 3\}$ lists elements; $x \in A$ means "$x$ is in $A$".
- Order and repetition don't matter: $\{1, 2, 2\} = \{2, 1\}$.
- $\varnothing$ is the empty set; $|A|$ is the number of elements.
- $A \subseteq B$: every element of $A$ is in $B$.
- Set-builder: $\{x \in \mathbb Z : 0 < x < 5\} = \{1, 2, 3, 4\}$.
:::

:::def Operations
- **Union** $A \cup B$: in $A$ **or** $B$ (or both).
- **Intersection** $A \cap B$: in **both**.
- **Difference** $A \setminus B$: in $A$ but not in $B$.
- **Complement** $A^c$: everything in the universe $U$ not in $A$.
:::

:::example
$U = \{1, \dots, 10\}$, $A = \{2, 4, 6, 8, 10\}$, $B = \{1, 2, 3, 4, 5\}$.
---
$A \cup B = \{1, 2, 3, 4, 5, 6, 8, 10\}$, $A \cap B = \{2, 4\}$, $A \setminus B = \{6, 8, 10\}$, $B^c = \{6, 7, 8, 9, 10\}$.
:::

## Counting with Venn diagrams

:::def Inclusion–exclusion
$$|A \cup B| = |A| + |B| - |A \cap B|.$$
For three sets: $|A\cup B\cup C| = |A| + |B| + |C| - |A\cap B| - |A\cap C| - |B\cap C| + |A\cap B\cap C|$.
:::

:::why Why subtract?
Adding $|A|$ and $|B|$ counts the overlap twice; subtracting it once fixes the double count.
:::

:::example A survey
Of 100 students, 60 study math, 45 study physics, and 25 study both. How many study neither?
---
$|M \cup P| = 60 + 45 - 25 = 80$, so $100 - 80 = 20$ study neither. Fill the Venn diagram from the middle out: both 25, math only 35, physics only 20, neither 20.
:::

:::def De Morgan's laws
$$(A \cup B)^c = A^c \cap B^c,\qquad (A \cap B)^c = A^c \cup B^c.$$
"Not (A or B)" = "not A and not B".
:::

## Common mistakes

:::mistake Double counting
$|A \cup B| \ne |A| + |B|$ unless the sets are disjoint.
:::

:::mistake $\in$ vs $\subseteq$
$2 \in \{1, 2\}$ but $\{2\} \subseteq \{1, 2\}$. An element is not a subset.
:::

## Try it yourself

:::try
$|A| = 12$, $|B| = 9$, $|A \cup B| = 17$. Find $|A \cap B|$.
---
$17 = 12 + 9 - x$, so $x = 4$.
:::

:::try
How many subsets does $\{a, b, c\}$ have?
---
Each element is in or out: $2^3 = 8$ (including $\varnothing$ and the set itself).
:::

:::ds In data science
Pandas and SQL filters are set operations: `df[(df.a) & (df.b)]` is an intersection, `|` a union, `~` a complement. Inner joins keep the intersection of keys, outer joins the union. The Jaccard similarity $\tfrac{|A\cap B|}{|A\cup B|}$ compares sets such as baskets of products.
:::

## Summary

- Union = or, intersection = and, complement = not.
- $|A\cup B| = |A| + |B| - |A\cap B|$.
- De Morgan: the complement of a union is the intersection of complements.
