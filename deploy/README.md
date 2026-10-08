# استقرار روی سرور (Ubuntu/Debian)

## ۱. امنیت سرور (اول از همه)
رمز root در گفت‌وگو ارسال شده است. پس از ورود:
```bash
passwd                      # رمز تازه
# بهتر: ورود با کلید SSH و غیرفعال کردن ورود با رمز
```

## ۲. نصب (از کامپیوتر خودتان)
```bash
scp rasaprompt-v0.3.zip root@<IP>:/root/
ssh root@<IP>
unzip -o /root/rasaprompt-v0.3.zip 'rasaprompt/deploy/*' -d /tmp && bash /tmp/rasaprompt/deploy/install.sh
```
بعد از چند دقیقه سایت روی `http://<IP>/fa` بالا می‌آید.

با دامنه (HTTPS خودکار): ابتدا رکورد A دامنه را به IP سرور بدهید، سپس:
```bash
DOMAIN=rasaprompt.ir bash /tmp/rasaprompt/deploy/install.sh
```

## ۳. تنظیمات
`nano /opt/rasaprompt/app/.env` و مقداردهی:
- مدل زبانی: `LLM_PROVIDER=openai-compat`، `LLM_BASE_URL`، `LLM_API_KEY`، `LLM_MODEL_ECONOMY/STANDARD/PREMIUM`
- ربات‌ها: `TELEGRAM_BOT_TOKEN`، `BALE_BOT_TOKEN`، `TELEGRAM_ADMIN_IDS`، `BALE_ADMIN_IDS`، `NEXT_PUBLIC_TELEGRAM_BOT_URL`، `NEXT_PUBLIC_BALE_BOT_URL`

سپس اجرای دوباره با ربات‌ها:
```bash
cd /opt/rasaprompt && BOTS="telegram bale" bash deploy/update.sh
```
(متغیرهای `NEXT_PUBLIC_*` هنگام build خوانده می‌شوند؛ بعد از تغییرشان update را اجرا کنید.)

## ۴. نگهداری
| کار | فرمان |
|---|---|
| وضعیت | `docker compose -f docker-compose.prod.yml ps` |
| لاگ | `docker compose -f docker-compose.prod.yml logs -f web` |
| به‌روزرسانی با زیپ جدید | زیپ را در `/root` بگذارید و `bash /opt/rasaprompt/deploy/install.sh` |
| پشتیبان روزانه | `crontab -e` ← `0 3 * * * bash /opt/rasaprompt/deploy/backup.sh` |

داده‌ها (اعتبارها، کدهای اعتبار، کاربران ربات) در volume `rasaprompt_data` می‌مانند و با به‌روزرسانی پاک نمی‌شوند.
