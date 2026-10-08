# ارزیابی FarsiUI برای پروژه

> منبع: کلون مستقیم مخزن [MiladJoodi/FarsiUI](https://github.com/MiladJoodi/FarsiUI) (آخرین کامیت: ۸ اکتبر ۲۰۲۶). اعداد زیر از خود کد شمرده شده‌اند.

## مشخصات تأییدشده

| مورد | مقدار |
|---|---|
| ماهیت | فورک RTL-first از shadcn/ui؛ کد کامپوننت‌ها با CLI داخل پروژه‌ی شما کپی می‌شود (مالکیت کامل کد) |
| لایسنس | MIT — استفاده‌ی تجاری آزاد |
| پشته | Next.js 16.3 · React 19.2 · Tailwind CSS 4.3 · Base UI / Radix |
| نصب | `npx farsiui@latest init` و `npx farsiui@latest add <component>` |
| کامپوننت‌های پایه | **۶۴** (در استایل base-nova)، شامل `day-picker-persian` (تقویم شمسی)، `persian-digits`، `direction` (DirectionProvider) |
| بلاک‌ها | **۴۸۰** (۹۶ خانواده × ۵ نسخه) |
| فونت‌ها | Vazirmatn، Estedad، IRANSans (اعداد فارسی)، Lalezar، **Markazi (عربی)**، Noto، Geist |
| استایل‌ها | ۱۳ تم پایه (nova، luma، glass، rose، …) |
| تمپلیت‌ها | next-app، next-monorepo، vite، astro، react-router، start |
| ابزار AI | پوشه‌ی `skills/` و فایل‌های `CLAUDE.md`/`AGENTS.md` برای کار با عامل‌های هوش مصنوعی |

## نگاشت بلاک‌های FarsiUI به صفحات سایت پرامپت

| صفحه‌ی سایت ما | بلاک‌های آماده‌ی FarsiUI |
|---|---|
| خانه / لندینگ | `hero` · `features` · `bento` · `stats` · `testimonials` · `logo-cloud` · `cta` · `faq` · `newsletter` |
| کتابخانه / فهرست پرامپت | `product-grid` · `media-grid` · `advanced-filters` · `filters` · `sort-filter` · `search` · `search-results` · `empty-search` |
| صفحه‌ی پرامپت | `product-details` · `image-gallery` · `comments` · `preview` · `comparison` |
| قیمت‌گذاری و اشتراک | `pricing` · `plan-selection` · `subscription` · `comparison` |
| سبد و پرداخت | `shopping-cart` · `checkout` · `order-summary` · `payment` · `payment-methods` · `success-state` · `invoice` |
| حساب کاربری | `login` · `signup` · `otp` · `forgot-password` · `profile` · `order-history` · `wishlist` · `account-billing` · `account-notifications` · `security-settings` · `sessions` |
| داشبورد سازنده / ادمین | `dashboard` · `dashboard-stats` · `analytics` · `data-table-block` · `user-management` · `file-upload` · `activity` |
| اجرای پرامپت در سایت | `chat` · `conversation` · `message-list` + کامپوننت‌های `message`، `bubble`، `attachment` |
| وبلاگ / آکادمی | `blog-grid` · `article` · `steps` |
| احراز هویت فروشنده (فاز ۲) | `identity-verification` · `national-id` · `document-verification` |
| صفحات سیستمی | `not-found-block` · `error-state` · `maintenance` · `coming-soon` · `loading-state` |

عملاً **تقریباً ۹۰٪ رابط کاربری از بلاک آماده** ساخته می‌شود؛ کار اصلی ما منطق، داده و اتوماسیون است.

## نکات فنی که باید رعایت شود

1. **سه جهت/زبان:** پیش‌فرض `rtl: false` است. باید برای `/fa` و `/ar` جهت `rtl` و برای `/en` جهت `ltr` را در لایه‌ی `[locale]/layout.tsx` با `DirectionProvider` و `dir` روی `<html>` تنظیم کنیم. چون کامپوننت‌ها از کلاس‌های منطقی (start/end) استفاده می‌کنند، یک کد برای هر سه زبان کافی است.
2. **فونت به ازای زبان:** فارسی Vazirmatn/Estedad، عربی Markazi یا Noto Naskh/Kufi، انگلیسی Geist.
3. **اعداد:** `persian-digits` فقط برای fa؛ عربی معمولاً ارقام هندی-عربی یا لاتین (قابل انتخاب)، انگلیسی لاتین.
4. **تقویم:** شمسی برای fa، میلادی (و در صورت نیاز هجری قمری) برای ar/en.
5. **ریسک وابستگی:** پروژه‌ی تک‌نگهدارنده با ~۱۲۰ ستاره است. چون مدل shadcn کد را به پروژه کپی می‌کند، وابستگی زمان اجرا ندارد؛ نسخه‌ای که استفاده می‌کنیم را قفل و در مخزن خودمان نگه می‌داریم.
