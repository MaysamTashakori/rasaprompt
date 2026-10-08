#!/usr/bin/env bash
# به‌روزرسانی: کد تازه (گیت یا زیپ جدید در /root) سپس ساخت دوباره؛ داده‌ها در volume می‌مانند
set -euo pipefail
cd /opt/rasaprompt
if [ -d .git ]; then git pull -q; else bash deploy/install.sh; exit 0; fi
PROFILES=""; for b in ${BOTS:-}; do PROFILES="$PROFILES --profile $b"; done
docker compose -f docker-compose.prod.yml $PROFILES up -d --build
docker image prune -f >/dev/null
