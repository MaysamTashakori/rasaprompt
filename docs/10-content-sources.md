# منابع محتوا (قابل دانلود، پایدار، با لایسنس تجاری روشن)

ثبت ماشین‌خوان: `content/sources.json` (commit قفل‌شده) · اجرای مجدد: `content/fetch-sources.sh` · اعلان‌ها: `content/THIRD_PARTY_NOTICES.md` · خروجی: `content/imported/*.jsonl`.

| # | منبع | لایسنس | واردشده | نقش در محصول |
|---|---|---|---|---|
| 1 | [f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts) (prompts.chat) | CC0-1.0 (محتوا) | ۲٬۱۶۹ | هسته‌ی کتابخانه‌ی رایگان؛ ایده‌ی نسخه‌های Pro |
| 2 | [rockbenben/ChatGPT-Shortcut](https://github.com/rockbenben/ChatGPT-Shortcut) | MIT | ۵۵۸ (ar+en) | بذر عربی + ۱۶ زبان دیگر |
| 3 | [danielmiessler/fabric](https://github.com/danielmiessler/fabric) | MIT | ۲۶۵ | پرامپت‌های سیستمی حرفه‌ای → Pro/Elite |
| 4 | [dair-ai/Prompt-Engineering-Guide](https://github.com/dair-ai/Prompt-Engineering-Guide) | MIT | مرجع | تکنیک‌ها برای زنجیره‌های Elite و آکادمی |
| 5 | [bigscience-workshop/promptsource](https://github.com/bigscience-workshop/promptsource) | Apache-2.0 | مرجع | الگوهای ارزیابی/رگرسیون |

**پایداری:** ۱–۳ فعال (commit مهر ۲۰۲۶)، ۴ اسفند ۲۰۲۵، ۵ آخرین commit مهر ۲۰۲۳ (پایدار ولی غیرفعال؛ دیتاست‌های زیرین لایسنس جدا دارند).
**صداقت:** منبع ۲ بیشتر از منبع ۱ مشتق شده (لینک‌ها به همان مخزن اشاره می‌کنند)؛ ترجمه‌ها نیازمند QA بومی‌اند. آمار «۲٬۹۹۲» رکورد خام است، نه محصول آماده‌ی فروش.

## ردشده‌ها (و دلیل)
`anthropics/courses` (CC BY-NC → تجاری ممنوع) · `anthropics/prompt-eng-interactive-tutorial` (بدون LICENSE) · `NirDiamant/Prompt_Engineering` (لایسنس سفارشی) · `0xeb/TheBigPromptLibrary` (پرامپت‌های سیستمی استخراج‌شده از محصولات دیگران) · دیتاست‌های Hugging Face (از محیط ساخت در دسترس نبود؛ پس از بررسی لایسنس هر دیتاست) · سایت‌های تجاری (فقط سیگنال ترند، نه کپی).

## قواعد استفاده
1. رکورد خام **فقط** در کتابخانه‌ی رایگان با انتساب (`source`, `license`, `sourceCommit` همراه رکورد).
2. نسخه‌ی فروخته‌شده = بازنویسی + متغیر + تست + نمونه‌ی خروجی (ارزش افزوده)؛ هرگز بازفروش خام.
3. گذر از `canIngest(license)` (`app/pipelines/trends.ts`) الزامی است؛ لایسنس نامشخص = رد.
4. محتوای خام `noindex` تا غنی‌سازی شود (سیاست محتوای انبوه).
5. به‌روزرسانی: عامل `Source-Curator` ماهانه commit جدید را بررسی و diff لایسنس را گزارش می‌دهد (تغییر لایسنس = توقف).
