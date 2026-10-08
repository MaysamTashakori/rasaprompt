// انتقال: Bot API تلگرام و بله (بله سازگار با الگوی تلگرام؛ پایه tapi.bale.ai ⚠️ از SDKهای شخص ثالث)
import type { Action, Platform, Update } from "./core.ts"

export const API_BASE: Record<Platform, string> = {
  telegram: process.env.TELEGRAM_API_BASE ?? "https://api.telegram.org",
  bale: process.env.BALE_API_BASE ?? "https://tapi.bale.ai",
}

export class BotApi {
  readonly platform: Platform
  private base: string
  constructor(platform: Platform, token: string) {
    if (!token) throw new Error(`توکن ربات ${platform} تنظیم نشده است`)
    this.platform = platform
    this.base = `${API_BASE[platform]}/bot${token}`
  }

  async call<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    const res = await fetch(`${this.base}/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(params) })
    const j = (await res.json().catch(() => ({}))) as { ok?: boolean; result?: T; description?: string }
    if (!j.ok) throw new Error(`${this.platform}.${method}: ${j.description ?? res.status}`)
    return j.result as T
  }

  /** ارسال فایل (عکس/ویدیو/سند) با multipart */
  async sendFile(chat: number, method: "sendPhoto" | "sendVideo" | "sendDocument", field: "photo" | "video" | "document", file: string, caption?: string) {
    const { readFile } = await import("node:fs/promises")
    const form = new FormData()
    form.set("chat_id", String(chat))
    if (caption) form.set("caption", caption.slice(0, 1000))
    form.set(field, new Blob([await readFile(file)]), file.split("/").pop())
    const res = await fetch(`${this.base}/${method}`, { method: "POST", body: form })
    const j = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string }
    if (!j.ok) throw new Error(`${this.platform}.${method}: ${j.description ?? res.status}`)
  }

  getUpdates(offset: number, timeout = 25) {
    return this.call<Update[]>("getUpdates", { offset, timeout, allowed_updates: ["message", "callback_query"] })
  }

  /** اجرای اکشن‌های هسته؛ خطای یک اکشن بقیه را متوقف نمی‌کند */
  async run(actions: Action[]) {
    for (const a of actions) {
      try {
        if (a.type === "answer") await this.call("answerCallbackQuery", { callback_query_id: a.callback_query_id, text: a.text })
        else {
          const markup = a.inline
            ? { reply_markup: { inline_keyboard: a.inline } }
            : a.type === "send" && a.reply
              ? { reply_markup: { keyboard: a.reply.map((r) => r.map((text) => ({ text }))), resize_keyboard: true } }
              : {}
          const base = { chat_id: a.chat_id, text: a.text, ...(a.html ? { parse_mode: "HTML" } : {}), ...markup }
          if (a.type === "send") await this.call("sendMessage", { ...base, disable_web_page_preview: true })
          else await this.call("editMessageText", { ...base, message_id: a.message_id })
        }
      } catch (e) {
        console.error("[bot]", (e as Error).message)
      }
    }
  }
}

/** ارسال همگانی با سقف نرخ (~۲۰ پیام در ثانیه) */
export async function broadcast(api: BotApi, users: number[], text: string, reportTo?: number) {
  let ok = 0, fail = 0
  for (const u of users) {
    try { await api.call("sendMessage", { chat_id: u, text }); ok++ } catch { fail++ }
    await new Promise((r) => setTimeout(r, 50))
  }
  if (reportTo) await api.call("sendMessage", { chat_id: reportTo, text: `📣 ارسال همگانی تمام شد: ${ok} موفق، ${fail} ناموفق` }).catch(() => {})
}
