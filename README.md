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
| `docs/10…12` | **منابع محتوا، مدل درآمد v2 (تبلیغات+افیلیت+اسپانسری)، عمودی‌های 3D/AI Elements/Skills** |
| `agents/` | ۱۷ عامل با منابع و ممنوعیت‌ها |
| `content/` | منابع مجاز (`sources.json`)، واردشده‌ها (`imported/`)، اعلان‌های لایسنس |
| `docs/07…09` | نقشه‌ی راه، سئو، SOP و KPI |
| `docs/living/` | **اسناد زنده**: DECISIONS (ADR)، LIMITATIONS، MEMORY، DESIGN |

## وضعیت صادقانه
- ✅ اسکلت سه‌زبانه (RTL/LTR، فونت هر زبان، حالت تیره، جست‌وجو با نرمال‌سازی ی/ک، صفحه‌ی پرامپت، قیمت از `app/config/pricing.json`) ساخته و build/lint/typecheck/test شده.
- ⚠️ **FarsiUI:** رجیستری `farsiui.ir` از محیط ساخت در دسترس نبود، پس CLI اجرا نشد. کامپوننت‌های فعلی دست‌نویس و با کلاس‌های منطقی هستند. روی سیستم خودتان: `cd app && npx farsiui@latest init` سپس `npx farsiui@latest add <block>` و جایگزینی تدریجی (نگاشت بلاک‌ها: `docs/phase1-research/03-farsiui-assessment.md`).
- ✅ دیتابیس: اسکیما Drizzle + مهاجرت + pgvector؛ بدون `DATABASE_URL` روی PGlite لوکال اجرا می‌شود (`app/db/client.ts`).
- ✅ پایپ‌لاین تست: `app/pipelines/test-prompt.ts` (قواعد + داور LLM + stale)، با Mock تست شده؛ با `ANTHROPIC_API_KEY` به مدل واقعی وصل می‌شود (اجرای واقعی هنوز آزمایش نشده).
- ✅ ۲٬۹۹۲ پرامپت از ۳ منبع مجاز (CC0/MIT) در `content/imported/` با ردپای لایسنس؛ امتیازدهی ترند در `app/pipelines/trends.ts`.
- ⏳ هنوز ساخته نشده: نمایش محتوای واردشده در سایت، اتصال صفحات به DB، احراز هویت، پرداخت، بقیه‌ی پایپ‌لاین‌ها، API/MCP.
