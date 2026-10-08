#!/usr/bin/env bash
# پشتیبان روزانه از داده‌ها (اعتبار، کدها، وضعیت ربات) و content؛ در cron: 0 3 * * * bash /opt/rasaprompt/deploy/backup.sh
set -euo pipefail
cd /opt/rasaprompt && mkdir -p /root/backups
TS=$(date +%F)
docker run --rm -v rasaprompt_data:/data -v /root/backups:/b alpine tar czf /b/data-$TS.tgz -C /data .
tar czf /root/backups/content-$TS.tgz content agents app/.env
find /root/backups -mtime +14 -delete
