# معماری فنی

## اصل: ساده، مدیریت‌شده، قابل اجرا لوکال
```
مرورگر ──> Next.js 16 (App Router, RSC, [locale]) ──> Postgres + pgvector
              │  FarsiUI (کد کپی‌شده)                  ├ prompts, versions, tests…
              │  next-intl (fa/en/ar)                  └ embeddings (جست‌وجوی معنایی)
              ├─ /api/*  (Route Handlers)              Object storage (فایل‌های تحویلی، S3-compatible)
              ├─ Payments: PaymentProvider{Zarinpal, MoR}
              └─ Jobs: GitHub Actions cron + اسکریپت‌های pipelines/ (idempotent)
```

## انتخاب‌ها (و دلیل)
| لایه | انتخاب | دلیل |
|---|---|---|
| UI | Next.js + FarsiUI (shadcn RTL-first، MIT) + Tailwind 4 | ~۹۰٪ UI از بلاک آماده؛ کد در مخزن ما، بدون وابستگی زمان‌اجرا |
| i18n | `next-intl`، مسیر `/fa` `/en` `/ar` | `dir`: fa/ar=rtl، en=ltr؛ `DirectionProvider` در `[locale]/layout` |
| DB | Postgres + pgvector (Supabase یا Neon در تولید؛ Docker لوکال) | یک پایگاه برای رابطه‌ای و برداری |
| ORM | Drizzle | تایپ‌امن، مهاجرت ساده |
| Auth | Auth.js (ایمیل magic-link + OTP پیامکی برای fa) | بدون ثبت‌نام اجباری قبل از دیدن محصول |
| پرداخت | `PaymentProvider` (زرین‌پال؛ Paddle/Lemon Squeezy) | تعویض‌پذیر (ADR-004) |
| جست‌وجو | ترکیب `pg_trgm`/FTS + embedding + فیلتر | نیاز به سرویس جدا ندارد |
| اتوماسیون | GitHub Actions + `pipelines/*.ts` + عامل‌های Claude | ثابت ماهانه‌ی ≈۰ |
| میزبانی | Vercel (یا VPS با Docker) | ⚠️ دسترسی ایران را برای نسخه‌ی fa بسنجید؛ مسیر B: CDN/VPS داخلی (ADR-005) |

## نکات i18n/RTL
- فقط ویژگی‌های CSS منطقی. فونت: fa=Vazirmatn، ar=Markazi/Noto Naskh، en=Geist.
- ارقام: fa فارسی، ar قابل انتخاب (پیش‌فرض لاتین)، en لاتین. تقویم شمسی فقط fa.
- نرمال‌سازی جست‌وجو: ي→ی، ك→ک، حذف اِعراب/کشیده، ارقام عربی/فارسی→لاتین.
- هر پرامپت یک `translation_group`؛ `hreflang` بین سه نسخه؛ slug محلی.

## امنیت
رازها در env؛ کلید BYOK هرگز در لاگ؛ webhook پرداخت با امضا؛ نرخ‌محدودسازی؛ تحویل فایل با لینک امضاشده؛ CSP؛ پشتیبان روزانه DB.

## اجرای لوکال
`docker compose up db` + `cd app && npm i && npm run dev` — بدون هیچ سرویس ابری (داده‌ی نمونه در `app/src/data/seed.ts`).
