# rasaprompt — بازار پرامپت تست‌شده (FA / EN / AR)

پرامپت‌های حرفه‌ای با نمونه‌ی خروجی، نشان «تست‌شده روی مدل X»، به‌روزرسانی مادام‌العمر؛ سه‌زبانه؛ طراحی‌شده برای یک شرکت یک‌نفره با اتوماسیون.

## اجرا روی سیستم خودتان
```bash
cd app
npm install
npm run dev          # http://localhost:3000  → /fa  /en  /ar
npm run build && npm start
npm run lint && npm run typecheck && npm test
python3 ../finance/model.py     # مدل مالی (همه‌ی ورودی‌ها فرض هستند)
```
پایگاه‌داده هنوز متصل نیست؛ سایت با داده‌ی نمونه‌ی `app/data/prompts.ts` کار می‌کند. برای مرحله‌ی بعد: `docker compose up -d db` و `app/.env.example`.

## نقشه‌ی اسناد
| سند | موضوع |
|---|---|
| `AGENTS.md` / `CLAUDE.md` | قواعد برای عامل‌ها و مشارکت‌کنندگان |
| `docs/README.md` | فهرست اسناد تحقیق (فاز ۱) |
| `docs/00-principles.md` | اصول شرکت یک‌نفره |
| `docs/01-PRD.md` | محصول و اولویت‌ها |
| `docs/02-business-model-and-pricing.md` | **مدل درآمد و قیمت‌گذاری** + `finance/` |
| `docs/03…05` | معماری، مدل داده، پایپ‌لاین‌های خودکار |
| `docs/06-agents.md` | مجموعه‌ی عامل‌ها |
| `docs/07…09` | نقشه‌ی راه، سئو، SOP و KPI |
| `docs/living/` | **اسناد زنده**: DECISIONS (ADR)، LIMITATIONS، MEMORY، DESIGN |

## وضعیت صادقانه
- ✅ اسکلت سه‌زبانه (RTL/LTR، فونت هر زبان، حالت تیره، جست‌وجو با نرمال‌سازی ی/ک، صفحه‌ی پرامپت، قیمت از `app/config/pricing.json`) ساخته و build/lint/typecheck/test شده.
- ⚠️ **FarsiUI:** رجیستری `farsiui.ir` از محیط ساخت در دسترس نبود، پس CLI اجرا نشد. کامپوننت‌های فعلی دست‌نویس و با کلاس‌های منطقی هستند. روی سیستم خودتان: `cd app && npx farsiui@latest init` سپس `npx farsiui@latest add <block>` و جایگزینی تدریجی (نگاشت بلاک‌ها: `docs/phase1-research/03-farsiui-assessment.md`).
- ⏳ هنوز ساخته نشده: دیتابیس، احراز هویت، پرداخت، پایپ‌لاین‌ها (`pipelines/`)، API/MCP.
