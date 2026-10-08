// اجرای ربات با long-polling (توسعه‌ی محلی یا سرور بدون دامنه‌ی HTTPS)
// TELEGRAM_BOT_TOKEN=… npx tsx scripts/bot-poll.ts telegram   |   BALE_BOT_TOKEN=… npx tsx scripts/bot-poll.ts bale
import { BotApi } from "../bots/api"
import type { Platform } from "../bots/core"
import { dispatch } from "../bots/dispatch"
import { FileStore } from "../bots/store"

const platform = (process.argv[2] ?? "telegram") as Platform
if (platform !== "telegram" && platform !== "bale") throw new Error("platform: telegram | bale")
const api = new BotApi(platform, (platform === "telegram" ? process.env.TELEGRAM_BOT_TOKEN : process.env.BALE_BOT_TOKEN) ?? "")
const store = new FileStore(process.env.BOT_STORE_FILE ?? `.bot-store-${platform}.json`)
const ctx = { platform, store, siteUrl: process.env.SITE_URL ?? "" }

if (platform === "telegram") await api.call("deleteWebhook").catch(() => {}) // polling و webhook هم‌زمان ممکن نیست
console.log(`[${platform}] polling…`)
let offset = 0
for (;;) {
  try {
    const updates = await api.getUpdates(offset)
    for (const u of updates) {
      offset = u.update_id + 1
      await dispatch(api, u, ctx)
    }
  } catch (e) {
    console.error(`[${platform}]`, (e as Error).message)
    await new Promise((r) => setTimeout(r, 3000))
  }
}
