# راه‌اندازی محلی و استقرار

## پیش‌نیاز
Node.js ۲۲ یا بالاتر، npm، Python 3 (مدل مالی)، Git. اختیاری: Docker، ffmpeg، Chromium برای استودیو.

## اجرای محلی (۵ دقیقه)
```bash
git clone <مخزن> rasaprompt && cd rasaprompt/app
npm install
cp .env.example .env          # بدون تغییر هم کار می‌کند (حالت mock)
npm run catalog               # ساخت content/catalog.json از منابع
npm run dev                   # http://localhost:3000/fa
```
آزمون‌ها و کیفیت: `npm test && npm run typecheck && npm run lint && npm run build`.

## فرمان‌های مهم
| کار | فرمان |
|---|---|
| ربات تلگرام / بله (polling) | `npm run bot:telegram` / `npm run bot:bale` |
| پرامپت روز کانال | `npm run bot:daily -- telegram @channel [--send]` |
| بسته‌ی اینستاگرام | `npm run studio -- --daily` |
| بومی‌سازی دسته‌ای فارسی | `npm run localize -- --limit 30 --max-usd 2` |
| دانلود دوباره‌ی منابع | `bash ../content/fetch-sources.sh` |
| مدل مالی | `python3 ../finance/model_ir.py` |
| همگام‌سازی FarsiUI | `npx farsiui@latest init` سپس `npx farsiui@latest add <block>` |

## استقرار روی سرور
راهنمای گام‌به‌گام: [`deploy/README.md`](../deploy/README.md). خلاصه: زیپ را به `/root` سرور بفرستید و `deploy/install.sh` را اجرا کنید؛ Docker، دیوار آتش، Caddy (HTTPS خودکار با دامنه) و سرویس‌ها خودکار راه می‌افتند. ربات‌ها با `BOTS="telegram bale"`.

## ساختار مخزن
```
app/        سایت Next.js + API + ربات‌ها + پایپ‌لاین‌ها + استودیو
content/    منابع، کاتالوگ، تألیفی‌ها، ترجمه‌ها، صف عامل‌ها
agents/     تعریف ۲۰ عامل
docs/       اسناد (این پوشه) و docs/living (اسناد زنده)
finance/    مدل‌های مالی
```
