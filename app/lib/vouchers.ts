// کد اعتبار: فروش دستی (مثلاً از طریق تلگرام) پیش از اتصال درگاه پرداخت. ساخت توسط ادمین، مصرف در صفحه‌ی اجرا.
import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

interface Voucher { credits: number; createdAt: string; usedBy?: string; usedAt?: string }

export class VoucherStore {
  private file: string
  private data: Record<string, Voucher>
  constructor(file = process.env.VOUCHERS_FILE ?? path.join(process.cwd(), ".data", "vouchers.json")) {
    this.file = file
    try { this.data = JSON.parse(fs.readFileSync(file, "utf8")) } catch { this.data = {} }
  }
  private save() { fs.mkdirSync(path.dirname(this.file), { recursive: true }); fs.writeFileSync(this.file, JSON.stringify(this.data, null, 1)) }
  private reload() { try { this.data = JSON.parse(fs.readFileSync(this.file, "utf8")) } catch { /* بدون فایل */ } }

  create(credits: number, count = 1): string[] {
    this.reload()
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      const code = `RASA-${crypto.randomBytes(4).toString("hex").toUpperCase()}`
      this.data[code] = { credits, createdAt: new Date().toISOString() }
      codes.push(code)
    }
    this.save()
    return codes
  }
  /** مصرف یک‌باره؛ خروجی = اعتبار یا null */
  redeem(code: string, uid: string): number | null {
    this.reload()
    const v = this.data[code.trim().toUpperCase()]
    if (!v || v.usedBy) return null
    v.usedBy = uid
    v.usedAt = new Date().toISOString()
    this.save()
    return v.credits
  }
  summary() {
    this.reload()
    const all = Object.values(this.data)
    return { total: all.length, used: all.filter((v) => v.usedBy).length, creditsSold: all.filter((v) => v.usedBy).reduce((n, v) => n + v.credits, 0) }
  }
}
