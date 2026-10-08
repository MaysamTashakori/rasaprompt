#!/usr/bin/env bash
# نصب یک‌مرحله‌ای رسا پرامپت روی Ubuntu/Debian تازه (اجرا با root)
#   روش ۱ (زیپ): فایل rasaprompt-*.zip را در /root بگذارید، سپس:  bash install.sh
#   روش ۲ (گیت):  REPO_URL=https://<token>@github.com/maysamtashakori/rasaprompt.git BRANCH=claude/busy-gauss-to9yjn bash install.sh
# متغیرهای اختیاری: DOMAIN=rasaprompt.ir (HTTPS خودکار)، BOTS="telegram bale"
set -euo pipefail
DIR=/opt/rasaprompt
DOMAIN="${DOMAIN:-}"
BOTS="${BOTS:-}"

echo "==> بسته‌های پایه"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y && apt-get install -y curl git unzip ufw ca-certificates

if ! command -v docker >/dev/null; then
  echo "==> نصب Docker"
  curl -fsSL https://get.docker.com | sh
fi

echo "==> دریافت کد"
if [ -n "${REPO_URL:-}" ]; then
  if [ -d "$DIR/.git" ]; then git -C "$DIR" fetch -q origin "${BRANCH:-main}" && git -C "$DIR" checkout -q -B "${BRANCH:-main}" "origin/${BRANCH:-main}"
  else git clone -q --branch "${BRANCH:-main}" "$REPO_URL" "$DIR"; fi
else
  ZIP=$(ls -t /root/rasaprompt-*.zip 2>/dev/null | head -1 || true)
  # فایل‌هایی که پنل ادمین روی سرور تغییر می‌دهد نباید با نسخه‌ی مخزن بازنویسی شوند
  KEEP=$(mktemp -d); for f in content/sources.json content/agents-state.json content/agent-queue.json content/sources-pending.json; do [ -f "$DIR/$f" ] && mkdir -p "$KEEP/$(dirname $f)" && cp "$DIR/$f" "$KEEP/$f"; done
  [ -n "$ZIP" ] || { echo "زیپ پروژه در /root پیدا نشد و REPO_URL هم داده نشده"; exit 1; }
  TMP=$(mktemp -d) && unzip -q "$ZIP" -d "$TMP"
  mkdir -p "$DIR" && cp -a "$TMP"/rasaprompt/. "$DIR"/ && rm -rf "$TMP"
  cp -a "$KEEP"/. "$DIR"/ && rm -rf "$KEEP"
fi
cd "$DIR"

echo "==> تنظیمات"
if [ ! -f app/.env ]; then
  cp app/.env.example app/.env
  IP=$(curl -fsS https://api.ipify.org || hostname -I | awk '{print $1}')
  SITE="${DOMAIN:+https://$DOMAIN}"; SITE="${SITE:-http://$IP}"
  sed -i "s#^SITE_URL=.*#SITE_URL=$SITE#" app/.env
  sed -i "s#^BOT_WEBHOOK_SECRET=.*#BOT_WEBHOOK_SECRET=$(openssl rand -hex 16)#" app/.env
  echo "app/.env ساخته شد؛ کلیدها و توکن‌ها را بعداً در آن بگذارید."
fi
export SITE_ADDRESS="${DOMAIN:-:80}"
echo "SITE_ADDRESS=$SITE_ADDRESS" > .env

echo "==> دیوار آتش"
ufw allow 22/tcp >/dev/null; ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null; ufw --force enable >/dev/null

echo "==> ساخت و اجرا"
# ربات‌ها: اگر BOTS داده نشده، از روی توکن‌های موجود در app/.env تشخیص داده می‌شوند
if [ -z "$BOTS" ]; then
  grep -qE '^TELEGRAM_BOT_TOKEN=.+' app/.env && BOTS="$BOTS telegram"
  grep -qE '^BALE_BOT_TOKEN=.+' app/.env && BOTS="$BOTS bale"
fi
PROFILES=""; for b in $BOTS; do PROFILES="$PROFILES --profile $b"; done
docker compose -f docker-compose.prod.yml $PROFILES up -d --build
docker compose -f docker-compose.prod.yml ps
echo "✓ آماده: ${DOMAIN:+https://$DOMAIN}${DOMAIN:-http://$(hostname -I | awk '{print $1}')}/fa"
