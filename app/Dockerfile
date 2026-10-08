# ساخت تولیدی رسا (سایت + ربات‌ها + استودیو). کانتکست: ریشه‌ی مخزن
FROM node:22-bookworm-slim AS deps
WORKDIR /repo/app
COPY app/package.json app/package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /repo
COPY --from=deps /repo/app/node_modules app/node_modules
COPY app app
COPY content content
COPY agents agents
COPY docs docs
WORKDIR /repo/app
RUN npx tsx scripts/build-catalog.ts && npm run build

FROM node:22-bookworm-slim
ARG WITH_STUDIO=1
ENV NODE_ENV=production
# استودیوی اینستاگرام: Chromium و ffmpeg (با WITH_STUDIO=0 حذف می‌شود)
RUN if [ "$WITH_STUDIO" = "1" ]; then apt-get update && apt-get install -y --no-install-recommends ffmpeg ca-certificates && rm -rf /var/lib/apt/lists/*; fi
WORKDIR /repo
COPY --from=build /repo /repo
WORKDIR /repo/app
RUN if [ "$WITH_STUDIO" = "1" ]; then npx playwright install --with-deps chromium; fi
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
