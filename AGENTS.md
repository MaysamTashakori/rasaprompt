# AGENTS.md — راهنمای عامل‌ها و مشارکت‌کنندگان

این مخزن یک **شرکت یک‌نفره** است: انسان تصمیم می‌گیرد، عامل‌ها اجرا می‌کنند. قبل از هر کاری این‌ها را بخوانید:

1. `docs/00-principles.md` — اصول غیرقابل‌مذاکره
2. `docs/living/LIMITATIONS.md` — آنچه نباید انجام دهید / نمی‌دانیم
3. `docs/living/DECISIONS.md` — تصمیم‌های قبلی (ADR)؛ بدون ADR جدید، تصمیم‌ها را عوض نکنید
4. `docs/living/MEMORY.md` — آخرین اقدامات؛ **بعد از هر کار یک خط اضافه کنید**

## قواعد سخت
- هیچ انتشار عمومی، تغییر قیمت، پرداخت، حذف داده یا ارسال ایمیل انبوه بدون تأیید انسان (برچسب `needs-human`).
- هیچ عددی را جعل نکنید؛ هر ادعا یا ⚠️ دارد یا منبع.
- متن UI و محتوا همیشه در سه زبان `fa` `en` `ar`؛ کلید ترجمه در `messages/`، هرگز متن ثابت در کامپوننت.
- فقط کلاس‌های منطقی Tailwind (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`)، نه `ml-/mr-/left-/right-`، تا RTL/LTR کار کند.
- قیمت‌ها فقط از `app/config/pricing.json` و `app/config/models.json` خوانده شوند.
- طراحی: فقط آیکن Phosphor، بدون em-dash و ایموجی در UI سایت، یک رنگ تأکیدی (ADR-024).
- رازها فقط در `.env` (در `.gitignore`)؛ هرگز commit نشود.

## عامل‌ها
تعریف نقش‌ها، ورودی/خروجی و مرزهای هر عامل: `docs/06-agents.md`.

## فرمان‌ها
```bash
cd app && npm install && npm run catalog && npm run dev   # توسعه‌ی محلی
npm run lint && npm run typecheck && npm test && npm run build
npm run bot:telegram | bot:bale | studio | localize      # ربات، استودیو، بومی‌سازی
python3 ../finance/model_ir.py                           # مدل مالی ایران
```
