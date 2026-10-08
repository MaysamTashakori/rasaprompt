// مصرف کد اعتبار (فروش دستی از طریق ربات/پیام‌رسان پیش از درگاه پرداخت)
import { NextResponse } from "next/server"
import { creditStore } from "@/lib/credits"
import { VoucherStore } from "@/lib/vouchers"
import { getUid } from "@/lib/uid"

const tries = new Map<string, number[]>()

export async function POST(req: Request) {
  const uid = await getUid()
  const now = Date.now()
  const t = (tries.get(uid) ?? []).filter((x) => now - x < 600_000)
  if (t.length >= 10) return NextResponse.json({ error: "rate" }, { status: 429 }) // جلوگیری از حدس زدن کد
  tries.set(uid, [...t, now])
  const { code } = (await req.json().catch(() => ({}))) as { code?: string }
  if (!code || !/^RASA-[0-9A-F]{8}$/i.test(code.trim())) return NextResponse.json({ error: "invalid" }, { status: 400 })
  const credits = new VoucherStore().redeem(code, uid)
  if (credits === null) return NextResponse.json({ error: "invalid" }, { status: 400 })
  creditStore().grant(uid, credits, `voucher:${code.trim().toUpperCase()}`)
  return NextResponse.json({ ok: true, credits })
}
