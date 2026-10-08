# حافظه‌ی اقدامات (به‌ترتیب زمانی؛ یک خط برای هر اقدام)

- 2026-10-08 — Claude: ثبت اسناد فاز ۱ و پیشنهاد تکمیل‌شده (docs/phase1-research).
- 2026-10-08 — Claude: تحقیق تکمیلی (بازار عربی، اینماد، مراجع)؛ rasa-promt.ir قابل دسترسی نبود.
- 2026-10-08 — Claude: مدل کسب‌وکار/قیمت‌گذاری v1، مدل مالی، pricing.json، اسناد PRD/معماری/داده/پایپ‌لاین/عامل‌ها/نقشه‌ی راه/سئو/SOP.
- 2026-10-08 — Claude: اسکلت `app/` (Next 16 + next-intl + سه‌زبانه RTL/LTR + کتابخانه/جست‌وجو/صفحه‌ی پرامپت + قیمت‌ها از pricing.json)؛ build/lint/typecheck/test سبز.
- 2026-10-08 — Claude: farsiui.ir در دسترس نبود → کامپوننت‌ها دست‌نویس؛ همگام‌سازی FarsiUI روی سیستم مالک لازم است (LIMITATIONS).
- 2026-10-08 — Claude: اسکیما Drizzle + مهاجرت (با pgvector) و کلاینت DB دوحالته (PGlite/Postgres)؛ در PGlite تأیید شد.
- 2026-10-08 — Claude: pipelines/llm.ts و test-prompt.ts (چک قاعده‌ای، داور، stale) + ۵ تست سبز؛ با مدل واقعی آزمایش نشده.
