// وب‌هوک ربات‌ها: POST /api/bot/telegram یا /api/bot/bale
// امنیت: سربرگ X-Telegram-Bot-Api-Secret-Token (تلگرام) یا پارامتر ?s= (بله) باید با BOT_WEBHOOK_SECRET برابر باشد.
import { NextResponse } from "next/server"
import type { Platform, Update } from "@/bots/core"
import { dispatch } from "@/bots/dispatch"
import { BotApi } from "@/bots/api"
import { FileStore } from "@/bots/store"

const store = new FileStore(process.env.BOT_STORE_FILE || "/tmp/rasa-bot-store.json")
const apis: Partial<Record<Platform, BotApi>> = {}

export async function POST(req: Request, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params
  if (platform !== "telegram" && platform !== "bale") return NextResponse.json({ ok: false }, { status: 404 })
  const secret = process.env.BOT_WEBHOOK_SECRET
  const got = req.headers.get("x-telegram-bot-api-secret-token") ?? new URL(req.url).searchParams.get("s")
  if (!secret || got !== secret) return NextResponse.json({ ok: false }, { status: 401 })
  const token = platform === "telegram" ? process.env.TELEGRAM_BOT_TOKEN : process.env.BALE_BOT_TOKEN
  if (!token) return NextResponse.json({ ok: false, error: "no token" }, { status: 503 })
  apis[platform] ??= new BotApi(platform, token)
  const update = (await req.json()) as Update
  await dispatch(apis[platform]!, update, { platform, store, siteUrl: process.env.SITE_URL || "" })
  return NextResponse.json({ ok: true })
}
