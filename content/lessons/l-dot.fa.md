## سنجیدن هم‌جهتی

دو سند چقدر شبیه‌اند؟ نیرویی در جهت حرکت هُل می‌دهد یا خلاف آن؟ چه مقدار از یک بردار در امتداد بردار دیگر است؟ **ضرب داخلی** به همهٔ این‌ها با یک عدد جواب می‌دهد — و رایج‌ترین عمل در یادگیری ماشین است (هر نورون یکی از آن را حساب می‌کند).

## تعریف

:::def ضرب داخلی
$$\mathbf u\cdot\mathbf v = u_1v_1 + u_2v_2 + \dots + u_nv_n.$$
از نظر هندسی:
$$\mathbf u\cdot\mathbf v = \lVert\mathbf u\rVert\,\lVert\mathbf v\rVert\cos\theta,$$
که $\theta$ زاویهٔ بین آن‌هاست.
:::

:::why چرا دو فرمول یکی‌اند؟
طبق قانون کسینوس‌ها، $\lVert\mathbf u - \mathbf v\rVert^2 = \lVert\mathbf u\rVert^2 + \lVert\mathbf v\rVert^2 - 2\lVert\mathbf u\rVert\lVert\mathbf v\rVert\cos\theta$. باز کردن طرف چپ مؤلفه به مؤلفه می‌دهد $\lVert\mathbf u\rVert^2 + \lVert\mathbf v\rVert^2 - 2(u_1v_1 + \dots + u_nv_n)$. دو را مقایسه کن.
:::

:::def خواندن علامت
- $\mathbf u\cdot\mathbf v > 0$: زاویه کمتر از ۹۰°، تقریباً هم‌جهت‌اند.
- $\mathbf u\cdot\mathbf v = 0$: **متعامد** (عمود بر هم).
- $\mathbf u\cdot\mathbf v < 0$: زاویه بیشتر از ۹۰°.

همچنین $\mathbf v\cdot\mathbf v = \lVert\mathbf v\rVert^2$.
:::

:::example زاویهٔ بین دو بردار
$\mathbf u = (1, 2, 2)$ و $\mathbf v = (2, 0, 1)$. زاویه؟
---
$\mathbf u\cdot\mathbf v = 2 + 0 + 2 = 4$، $\lVert\mathbf u\rVert = 3$ و $\lVert\mathbf v\rVert = \sqrt5$. $\cos\theta = \tfrac{4}{3\sqrt5} \approx 0.596$ و $\theta \approx 53.4^\circ$.
:::

:::example متعامد؟
$k$ را طوری پیدا کن که $(3, k)$ بر $(2, -6)$ عمود باشد.
---
$6 - 6k = 0 \Rightarrow k = 1$.
:::

## تصویر

:::def تصویر عددی و برداری
مؤلفهٔ $\mathbf u$ در امتداد $\mathbf v$ برابر $\dfrac{\mathbf u\cdot\mathbf v}{\lVert\mathbf v\rVert}$ است و بردار تصویر:
$$\operatorname{proj}_{\mathbf v}\mathbf u = \frac{\mathbf u\cdot\mathbf v}{\mathbf v\cdot\mathbf v}\,\mathbf v.$$
:::

:::example
$(4, 3)$ را روی $(1, 0)$ و روی $(1, 1)$ تصویر کن.
---
روی $(1, 0)$: $(4, 0)$. روی $(1, 1)$: $\tfrac{7}{2}(1, 1) = (3.5, 3.5)$.
:::

## شباهت کسینوسی

:::def شباهت کسینوسی
$$\cos\theta = \frac{\mathbf u\cdot\mathbf v}{\lVert\mathbf u\rVert\,\lVert\mathbf v\rVert}\in[-1, 1].$$
فقط **جهت** را مقایسه می‌کند و طول را نادیده می‌گیرد.
:::

:::example سند به‌عنوان شمارش کلمه‌ها
سند A شمارش‌های (داده: ۳، مدل: ۲، گربه: ۰)، سند B (۶، ۴، ۰) و سند C (۰، ۱، ۵) دارد. کدام شبیه‌ترین به A است؟
---
B دقیقاً $2\times$A است، پس $\cos = 1$. با C: $\tfrac{2}{\sqrt{13}\sqrt{26}} \approx 0.11$. B تقریباً تکراری است، هرچند دو برابر بلندتر است.
:::

## اشتباه‌های رایج

:::mistake ضرب داخلی یک بردار است
یک **عدد** (اسکالر) است.
:::

:::mistake متعامد یعنی «بی‌ارتباط» از هر نظر
در آمار، متغیرهای مرکزشدهٔ ناهمبسته بردارهای متعامدند — اما ممکن است هنوز به شکلی غیرخطی وابسته باشند.
:::

## خودت امتحان کن

:::try
$(2, -1)\cdot(3, 4)$؟
---
$6 - 4 = 2$.
:::

:::try
بردارهای یکهٔ $\mathbf a, \mathbf b$ داریم که $\mathbf a\cdot\mathbf b = -1$. زاویه؟
---
$\cos\theta = -1$: $180^\circ$، خلاف جهت هم.
:::

:::ds در علم داده
مدل خطی $\mathbf w\cdot\mathbf x + b$ را حساب می‌کند؛ نورون تابعی را روی آن اعمال می‌کند. سامانه‌های پیشنهاددهنده و موتورهای جست‌وجو موارد را با شباهت کسینوسی بردارهای تعبیه رتبه‌بندی می‌کنند: `np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v))`.
:::

## خلاصه

- $\mathbf u\cdot\mathbf v = \sum u_iv_i = \lVert\mathbf u\rVert\lVert\mathbf v\rVert\cos\theta$.
- ضرب داخلی صفر ⇔ عمود.
- تصویر $\tfrac{\mathbf u\cdot\mathbf v}{\mathbf v\cdot\mathbf v}\mathbf v$؛ شباهت کسینوسی جهت‌ها را مقایسه می‌کند.
