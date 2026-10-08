// ثبت وب‌هوک: SITE_URL=https://… BOT_WEBHOOK_SECRET=… TELEGRAM_BOT_TOKEN=… npx tsx scripts/bot-set-webhook.ts telegram
import { BotApi } from "../bots/api"
import type { Platform } from "../bots/core"

const platform = (process.argv[2] ?? "telegram") as Platform
const site = process.env.SITE_URL, secret = process.env.BOT_WEBHOOK_SECRET
if (!site?.startsWith("https://") || !secret) throw new Error("SITE_URL (https) و BOT_WEBHOOK_SECRET لازم است")
const api = new BotApi(platform, (platform === "telegram" ? process.env.TELEGRAM_BOT_TOKEN : process.env.BALE_BOT_TOKEN) ?? "")
const url = `${site}/api/bot/${platform}${platform === "bale" ? `?s=${encodeURIComponent(secret)}` : ""}`
console.log(await api.call("setWebhook", platform === "telegram" ? { url, secret_token: secret, allowed_updates: ["message", "callback_query"] } : { url }))
