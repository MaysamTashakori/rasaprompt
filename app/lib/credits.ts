// دفتر اعتبار مصرفی چت. پیاده‌سازی فایل‌محور برای اجرای تک‌نمونه؛ در تولید → جدول credit_ledger در Postgres (docs/04).
import fs from "node:fs"
import path from "node:path"
import models from "../config/models.json" with { type: "json" }

export type TierId = "economy" | "standard" | "premium"
export const TIERS = models.tiers as { id: TierId; env: string; credits_per_1k: number; max_output: number; free: boolean; names: Record<string, string>; desc: Record<string, string> }[]
export const tierOf = (id: string) => TIERS.find((t) => t.id === id)

/** اعتبار مصرفی بر اساس توکن؛ حداقل ۱ */
export const creditsFor = (tier: TierId, tokens: number) => Math.max(1, Math.ceil((tokens / 1000) * (tierOf(tier)?.credits_per_1k ?? 1)))
/** تخمین توکن از نویسه (فارسی/انگلیسی، محافظه‌کارانه) */
export const estimateTokens = (chars: number) => Math.ceil(chars / 3)

interface Account { paid: number; freeLeft: number; freeDay: string; history: { at: string; delta: number; reason: string }[] }

export interface CreditStore {
  get(uid: string, today?: string): Account
  charge(uid: string, n: number, reason: string, today?: string): boolean
  grant(uid: string, n: number, reason: string): void
}

const day = (d = new Date()) => d.toISOString().slice(0, 10)

export class FileCreditStore implements CreditStore {
  private file: string
  private data: Record<string, Account>
  constructor(file = process.env.CREDITS_FILE ?? path.join(process.cwd(), ".data", "credits.json")) {
    this.file = file
    try { this.data = JSON.parse(fs.readFileSync(file, "utf8")) } catch { this.data = {} }
  }
  private save() {
    try { fs.mkdirSync(path.dirname(this.file), { recursive: true }); fs.writeFileSync(this.file, JSON.stringify(this.data)) } catch (e) { console.error("[credits]", (e as Error).message) }
  }
  get(uid: string, today = day()): Account {
    const a = (this.data[uid] ??= { paid: 0, freeLeft: models.free_daily_credits, freeDay: today, history: [] })
    if (a.freeDay !== today) { a.freeLeft = models.free_daily_credits; a.freeDay = today }
    return a
  }
  /** اول از سهمیه‌ی رایگان روزانه، بعد از اعتبار خریداری‌شده */
  charge(uid: string, n: number, reason: string, today = day()) {
    const a = this.get(uid, today)
    if (a.freeLeft + a.paid < n) return false
    const fromFree = Math.min(a.freeLeft, n)
    a.freeLeft -= fromFree
    a.paid -= n - fromFree
    a.history.push({ at: new Date().toISOString(), delta: -n, reason })
    a.history = a.history.slice(-200)
    this.save()
    return true
  }
  grant(uid: string, n: number, reason: string) {
    const a = this.get(uid)
    a.paid += n
    a.history.push({ at: new Date().toISOString(), delta: n, reason })
    this.save()
  }
}

// یک نمونه‌ی مشترک برای همه‌ی مسیرها (داده‌ی حافظه هم‌خوان بماند)
const g = globalThis as unknown as { __rasaCredits?: FileCreditStore }
export const creditStore = () => (g.__rasaCredits ??= new FileCreditStore())
