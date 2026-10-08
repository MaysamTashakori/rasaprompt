// ذخیره‌ی ترجیحات کاربر (فقط زبان). فایل JSON برای اجرای تک‌نمونه؛ در تولید → جدول user در DB.
import fs from "node:fs"
import type { Loc } from "../lib/catalog.ts"
import type { Store } from "./core.ts"

export class FileStore implements Store {
  private file: string
  private data: Record<string, Loc>
  constructor(file: string) {
    this.file = file
    try { this.data = JSON.parse(fs.readFileSync(file, "utf8")) } catch { this.data = {} }
  }
  getLocale(u: number) { return this.data[u] }
  setLocale(u: number, l: Loc) {
    this.data[u] = l
    try { fs.writeFileSync(this.file, JSON.stringify(this.data)) } catch (e) { console.error("[store]", (e as Error).message) }
  }
}
