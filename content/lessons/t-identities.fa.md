## معادله‌هایی که همیشه درست‌اند

**اتحاد** برای هر زاویه‌ای برقرار است، مثل $\sin^2\theta + \cos^2\theta = 1$. اتحادها اجازه می‌دهند عبارت‌های مثلثاتی را ساده‌تر بازنویسی کنیم، معادله‌های مثلثاتی را حل کنیم و — در حسابان و پردازش سیگنال — حاصل‌ضرب موج‌ها را به جمع تبدیل کنیم.

:::why همه‌چیز از دایرهٔ مثلثاتی می‌آید
نقطهٔ $(\cos\theta, \sin\theta)$ از مبدأ فاصلهٔ ۱ دارد، پس طبق فیثاغورس $\cos^2\theta + \sin^2\theta = 1$. چرخش به اندازهٔ $\alpha$ و بعد $\beta$ همان چرخش به اندازهٔ $\alpha + \beta$ است؛ نوشتن این با مختصات، فرمول‌های جمع را می‌دهد.
:::

## اتحادهای اصلی

:::def اتحادهای فیثاغورسی
$$\sin^2\theta + \cos^2\theta = 1,\qquad 1 + \tan^2\theta = \sec^2\theta,\qquad 1 + \cot^2\theta = \csc^2\theta.$$
:::

:::def تقارن
$\sin(-\theta) = -\sin\theta$ (فرد)، $\cos(-\theta) = \cos\theta$ (زوج)، $\sin\left(\tfrac\pi2 - \theta\right) = \cos\theta$.
:::

:::def فرمول‌های جمع و دو برابر زاویه
$$\sin(\alpha \pm \beta) = \sin\alpha\cos\beta \pm \cos\alpha\sin\beta,$$
$$\cos(\alpha \pm \beta) = \cos\alpha\cos\beta \mp \sin\alpha\sin\beta,$$
$$\sin2\theta = 2\sin\theta\cos\theta,\qquad \cos2\theta = \cos^2\theta - \sin^2\theta = 1 - 2\sin^2\theta = 2\cos^2\theta - 1.$$
:::

:::example یک مقدار دقیق
$\sin 75^\circ$ را پیدا کن.
---
$\sin(45^\circ + 30^\circ) = \tfrac{\sqrt2}2\cdot\tfrac{\sqrt3}2 + \tfrac{\sqrt2}2\cdot\tfrac12 = \dfrac{\sqrt6 + \sqrt2}{4} \approx 0.966$.
:::

:::example اثبات یک اتحاد
نشان بده $\dfrac{1 - \cos2\theta}{\sin2\theta} = \tan\theta$.
---
فقط روی طرف چپ کار کن: $\dfrac{1 - (1 - 2\sin^2\theta)}{2\sin\theta\cos\theta} = \dfrac{2\sin^2\theta}{2\sin\theta\cos\theta} = \dfrac{\sin\theta}{\cos\theta} = \tan\theta$.
:::

## حل معادلهٔ مثلثاتی

معادله‌های مثلثاتی معمولاً **بی‌نهایت** جواب دارند، چون تابع‌ها تکرار می‌شوند. جواب‌ها را در یک دوره پیدا کن و بعد مضرب‌های دوره را اضافه کن.

:::example
$2\sin x - 1 = 0$ را برای $0 \le x < 2\pi$ و سپس در حالت کلی حل کن.
---
$\sin x = \tfrac12$: $x = \tfrac\pi6$ یا $x = \tfrac{5\pi}6$. حالت کلی: $x = \tfrac\pi6 + 2k\pi$ یا $x = \tfrac{5\pi}6 + 2k\pi$.
:::

:::example با کمک یک اتحاد
$2\cos^2x - \cos x - 1 = 0$ را برای $0 \le x < 2\pi$ حل کن.
---
درجه دو بر حسب $\cos x$: $(2\cos x + 1)(\cos x - 1) = 0$. $\cos x = 1$ می‌دهد $x = 0$؛ $\cos x = -\tfrac12$ می‌دهد $x = \tfrac{2\pi}3, \tfrac{4\pi}3$.
:::

:::graph $\sin x$ کجا برابر $c$ می‌شود؟
f: sin(x)
g: c
range: -7,7
params: c=0.5:-1.2:1.2
:::

## اشتباه‌های رایج

:::mistake $\sin(a + b) = \sin a + \sin b$
امتحان کن: $\sin(30^\circ + 60^\circ) = 1$، اما $\tfrac12 + \tfrac{\sqrt3}2 \approx 1.37$.
:::

:::mistake تقسیم بر تابع مثلثاتی
از $\sin x\cos x = \sin x$ اگر بر $\sin x$ تقسیم کنی، جواب‌های $\sin x = 0$ گم می‌شوند. به‌جایش تجزیه کن: $\sin x(\cos x - 1) = 0$.
:::

:::mistake فقط یک جواب
$\sin x = \tfrac12$ در هر دوره دو جواب دارد.
:::

## خودت امتحان کن

:::try
ساده کن: $\dfrac{\sin^2x}{1 - \cos x}$.
---
$\dfrac{(1 - \cos x)(1 + \cos x)}{1 - \cos x} = 1 + \cos x$.
:::

:::try
اگر $\cos\theta = \tfrac35$ و $\theta$ حاده باشد، $\sin2\theta$ را پیدا کن.
---
$\sin\theta = \tfrac45$، پس $\sin2\theta = 2\cdot\tfrac45\cdot\tfrac35 = \tfrac{24}{25}$.
:::

:::try
$\tan x = -\sqrt3$ را برای $0 \le x < 2\pi$ حل کن.
---
$x = \tfrac{2\pi}3$ و $x = \tfrac{5\pi}3$ (دورهٔ $\tan$ برابر $\pi$ است).
:::

:::ds در علم داده
اتحادهای تبدیل ضرب به جمع دلیل کار کردن تبدیل فوریه‌اند: ضرب یک سیگنال در $\sin$ و $\cos$ با بسامدهای مختلف، هر بسامد را جدا می‌کند. فشرده‌سازی صدا، طیف‌نگاشت و تجزیهٔ فصلی سری‌های زمانی همه به آن متکی‌اند.
:::

## خلاصه

- $\sin^2 + \cos^2 = 1$؛ فرمول‌های جمع و دو برابر زاویه عبارت‌ها را بازنویسی می‌کنند.
- اتحاد را با تبدیل یک طرف اثبات کن.
- در یک دوره حل کن و مضرب‌های دوره را اضافه کن؛ تجزیه کن، تقسیم نکن.
