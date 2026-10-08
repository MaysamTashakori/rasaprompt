// پرامپت روز در کانال. پیش‌فرض dry-run (چاپ متن)؛ ارسال واقعی فقط با --send (دروازه‌ی تأیید انسانی، AGENTS.md)
// TELEGRAM_BOT_TOKEN=… npx tsx scripts/bot-daily-post.ts telegram @channel [--send]
import { BotApi } from "../bots/api"
import { handleUpdate, MemoryStore, type Platform } from "../bots/core"

const [platform = "telegram", chat] = process.argv.slice(2) as [Platform, string]
const send = process.argv.includes("--send")
const ctx = { platform, store: new MemoryStore(), siteUrl: process.env.SITE_URL || "" }
const [a] = handleUpdate({ update_id: 0, message: { message_id: 0, chat: { id: 0 }, text: "/daily" } }, ctx)
if (a.type !== "send") throw new Error("unexpected")
if (!send || !chat) { console.log("[dry-run]\n" + a.text); process.exit(0) }
const api = new BotApi(platform, (platform === "telegram" ? process.env.TELEGRAM_BOT_TOKEN : process.env.BALE_BOT_TOKEN) ?? "")
const { inline } = a
await api.call("sendMessage", { chat_id: chat, text: a.text, ...(a.html ? { parse_mode: "HTML" } : {}), ...(inline ? { reply_markup: { inline_keyboard: inline.map((r) => r.filter((b) => b.url)).filter((r) => r.length) } } : {}) })
console.log("sent")
