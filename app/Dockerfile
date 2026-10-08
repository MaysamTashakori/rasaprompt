# ساخت تولیدی سایت رسا (Next.js). کانتکست: ریشه‌ی مخزن
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
WORKDIR /repo/app
RUN npx tsx scripts/build-catalog.ts && npm run build

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo /repo
WORKDIR /repo/app
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
