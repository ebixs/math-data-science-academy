# فصل ۰۷ — SQL برای تحلیل داده
## کتابچهٔ آموزشی مستقل آکادمی ریاضی تا علم داده

پیش‌نیاز: جدول، ردیف، ستون و منطق شرطی. هدف، پرس‌وجو از داده‌های رابطه‌ای و ساخت خلاصه‌های قابل اعتماد است.

## ۱. پایگاه دادهٔ رابطه‌ای

پایگاه داده اطلاعات را در جدول‌ها نگه می‌دارد. هر ردیف یک رکورد و هر ستون ویژگی آن رکورد است. کلید اصلی یک رکورد را یکتا می‌کند؛ کلید خارجی رابطهٔ بین جدول‌ها را نشان می‌دهد. پیش از تحلیل باید grain یا سطح هر ردیف را بشناسی: یک ردیف ممکن است یک سفارش، یک قلم سفارش یا یک مشتری باشد.

## ۲. SELECT و FROM

```sql
SELECT customer_id, amount
FROM orders;
```

این پرس‌وجو فقط دو ستون را از جدول orders برمی‌گرداند. از `SELECT *` برای بررسی اولیه می‌توان استفاده کرد، اما در گزارش‌های پایدار بهتر است ستون‌های موردنیاز را صریح بنویسی.

**تمرین:** از جدول customers فقط ستون‌های id و city را انتخاب کن.
**پاسخ:** `SELECT id, city FROM customers;`

## ۳. فیلتر با WHERE

```sql
SELECT order_id, amount
FROM orders
WHERE status = 'completed'
  AND amount > 100;
```

WHERE ردیف‌ها را بر اساس شرط انتخاب می‌کند. رشته‌ها معمولاً داخل کوتیشن تک قرار می‌گیرند. برای بررسی NULL باید از `IS NULL` یا `IS NOT NULL` استفاده کرد؛ مقایسه با `= NULL` درست نیست.

**تمرین:** سفارش‌هایی را پیدا کن که status آن‌ها pending است.
**پاسخ:** `SELECT * FROM orders WHERE status = 'pending';`

## ۴. مرتب‌سازی و محدود کردن خروجی

```sql
SELECT order_id, amount
FROM orders
ORDER BY amount DESC
LIMIT 10;
```

ORDER BY خروجی را مرتب می‌کند و DESC ترتیب نزولی می‌دهد. بدون ORDER BY، ترتیب خروجی تضمین‌شده نیست. LIMIT تعداد ردیف‌های خروجی را محدود می‌کند.

**تمرین:** پنج سفارش با کمترین مبلغ را پیدا کن.
**پاسخ:** `SELECT order_id, amount FROM orders ORDER BY amount ASC LIMIT 5;`

## ۵. تجمیع و GROUP BY

COUNT، SUM، AVG، MIN و MAX توابع تجمیعی‌اند. GROUP BY محاسبات را به تفکیک گروه انجام می‌دهد.

```sql
SELECT status, COUNT(*) AS order_count,
       SUM(amount) AS total_amount
FROM orders
GROUP BY status;
```

COUNT(*) ردیف‌ها را می‌شمارد؛ COUNT(column) مقدارهای غیر NULL آن ستون را. میانگین باید همراه واحد و تعریف مقدارهای حذف‌شده تفسیر شود.

**تمرین:** مجموع مبلغ سفارش‌ها را به تفکیک شهر محاسبه کن.
**پاسخ:** `SELECT city, SUM(amount) AS total_amount FROM orders GROUP BY city;`

## ۶. HAVING در برابر WHERE

WHERE قبل از گروه‌بندی ردیف‌ها را فیلتر می‌کند؛ HAVING پس از تجمیع، گروه‌ها را فیلتر می‌کند.

```sql
SELECT customer_id, COUNT(*) AS n
FROM orders
WHERE status = 'completed'
GROUP BY customer_id
HAVING COUNT(*) >= 3;
```

این پرس‌وجو مشتریانی را برمی‌گرداند که دست‌کم سه سفارش تکمیل‌شده دارند.

**تمرین:** شهرهایی را نمایش بده که مجموع مبلغشان بیش از 10000 است.
**پاسخ:** `SELECT city, SUM(amount) AS total FROM orders GROUP BY city HAVING SUM(amount) > 10000;`

## ۷. JOIN

JOIN جدول‌های مرتبط را با کلید مشترک ترکیب می‌کند.

```sql
SELECT o.order_id, c.city
FROM orders AS o
JOIN customers AS c
  ON o.customer_id = c.id;
```

INNER JOIN فقط رکوردهای دارای تطابق را نگه می‌دارد. LEFT JOIN همهٔ ردیف‌های سمت چپ را نگه می‌دارد و برای نبود تطابق در سمت راست NULL می‌گذارد. اتصال روی کلید غیر یکتا ممکن است تعداد ردیف‌ها را ناخواسته زیاد کند؛ شمارش قبل و بعد از JOIN را بررسی کن.

**تمرین:** همهٔ مشتریان را حتی اگر سفارشی نداشته‌اند نگه دار.
**پاسخ:** از `customers LEFT JOIN orders ON customers.id = orders.customer_id` استفاده کن.

## ۸. NULL، CASE و کیفیت داده

NULL به معنی مقدار ناموجود یا ناشناخته است و با صفر برابر نیست. CASE برای دسته‌بندی شرطی مفید است.

```sql
SELECT order_id,
       CASE WHEN amount >= 500 THEN 'large'
            WHEN amount IS NULL THEN 'unknown'
            ELSE 'regular' END AS amount_group
FROM orders;
```

ترتیب WHEN مهم است: شرط‌های قبلی اول بررسی می‌شوند. برای فهم NULL و مقادیر نامعتبر باید قواعد کسب‌وکار را مشخص کنی؛ حذف خودکار ممکن است دادهٔ واقعی را از بین ببرد.

## ۹. زیرپرس‌وجو و CTE

CTE با WITH یک پرس‌وجو را به بخش‌های نام‌گذاری‌شده تقسیم می‌کند.

```sql
WITH monthly AS (
  SELECT month, SUM(amount) AS revenue
  FROM orders
  WHERE status = 'completed'
  GROUP BY month
)
SELECT month, revenue
FROM monthly
ORDER BY month;
```

در پروژه‌های واقعی، تعریف ماه، منطقهٔ زمانی، وضعیت سفارش و شیوهٔ برخورد با بازپرداخت باید مستند باشد.

## ۱۰. پروژهٔ پایانی

با دو جدول فرضی orders و customers، گزارش ماهانه بساز:
1. فقط سفارش‌های تکمیل‌شده را نگه دار.
2. سفارش‌ها را به مشتریان متصل کن.
3. تعداد سفارش و مجموع مبلغ را به تفکیک ماه و شهر محاسبه کن.
4. یک پرس‌وجوی کیفیت برای NULLها و کلیدهای بدون تطابق بنویس.
5. نتیجه را با یک محاسبهٔ مستقل یا نمونهٔ دستی بررسی کن.
6. تعریف شاخص، محدودهٔ زمانی، محدودیت‌ها و پرس‌وجو را مستند کن.

معیار ارزیابی از 20: تعریف شاخص 3، صحت فیلتر 3، JOIN 4، تجمیع 4، کنترل کیفیت 3، مستندسازی 3.

## آزمون پایان فصل

1. تفاوت WHERE و HAVING چیست؟
2. چرا `= NULL` مناسب نیست؟
3. کدام تابع تعداد ردیف‌ها را می‌شمارد؟
4. چه تفاوتی بین INNER JOIN و LEFT JOIN وجود دارد؟
5. چرا JOIN روی کلید تکراری ممکن است خروجی را چندبرابر کند؟
6. چگونه مجموع مبلغ را به تفکیک status حساب می‌کنی؟
7. آیا خروجی بدون ORDER BY ترتیب تضمین‌شده دارد؟
8. چرا تعریف سطح هر ردیف پیش از محاسبه مهم است؟
9. برای مشتریان بدون سفارش کدام JOIN مناسب است؟
10. چرا باید شاخص تجاری و قواعد حذف را مستند کرد؟

### پاسخ‌نامه
1. WHERE ردیف‌ها را پیش از تجمیع فیلتر می‌کند؛ HAVING گروه‌ها را پس از تجمیع.
2. برای NULL باید IS NULL استفاده شود.
3. COUNT(*).
4. INNER فقط تطابق‌ها را نگه می‌دارد؛ LEFT همهٔ سمت چپ را نگه می‌دارد.
5. یک ردیف ممکن است با چند ردیف طرف دیگر تطبیق کند.
6. `SELECT status, SUM(amount) FROM orders GROUP BY status;`
7. خیر.
8. چون شمارش، جمع و میانگین به این بستگی دارند که هر ردیف چه چیزی را نشان می‌دهد.
9. LEFT JOIN از customers به orders.
10. تا نتیجه قابل تفسیر، ممیزی و بازتولید باشد.

## منابع رسمی برای مطالعهٔ بیشتر
- [PostgreSQL — Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [SQLite — SELECT](https://www.sqlite.org/lang_select.html)
- [IBM — SQL learning](https://www.ibm.com/think/topics/sql)
