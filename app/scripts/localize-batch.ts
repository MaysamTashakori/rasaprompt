// بومی‌سازی دسته‌ای پرامپت‌های پرطرفدار به فارسی با مدل در دسترس شما (OpenAI-compatible).
// اجرا (روی سیستم خودتان): LLM_BASE_URL=… LLM_API_KEY=… LOCALIZE_MODEL=… npx tsx scripts/localize-batch.ts --limit 30 [--dry]
// خروجی: content/i18n/fa-bodies.json (ادغام در کاتالوگ با build-catalog). سقف هزینه: --max-usd (پیش‌فرض ۲).
import fs from "node:fs"
import path from "node:path"
import { clientFromEnv } from "../pipelines/llm"
import { localizePrompt } from "../pipelines/localize"
import type { CatalogItem } from "../lib/catalog-types"

const arg = (k: string, d?: string) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d }
const limit = Number(arg("limit", "30")), maxUsd = Number(arg("max-usd", "2")), dry = process.argv.includes("--dry")
const model = process.env.LOCALIZE_MODEL
if (!model && !dry) throw new Error("LOCALIZE_MODEL تنظیم نشده است")

const content = path.resolve("../content")
const catalog = JSON.parse(fs.readFileSync(path.join(content, "catalog.json"), "utf8")) as CatalogItem[]
const outFile = path.join(content, "i18n", "fa-bodies.json")
const done = fs.existsSync(outFile) ? (JSON.parse(fs.readFileSync(outFile, "utf8")) as Record<string, { title: string; body: string }>) : {}

const todo = catalog.filter((i) => !i.original && !i.body.fa && !done[i.id] && i.body.en).slice(0, limit)
console.log(`در صف: ${todo.length}${dry ? " (dry-run)" : ""}`)
if (dry) { for (const i of todo) console.log("-", i.id, i.title.en); process.exit(0) }

const llm = clientFromEnv()
let spent = 0, ok = 0
for (const i of todo) {
  if (spent >= maxUsd) { console.log(`سقف هزینه (${maxUsd}$) رسید؛ توقف.`); break }
  try {
    const r = await localizePrompt(llm, model!, { title: i.title.fa ?? i.title.en!, body: i.body.en!, target: "fa" })
    spent += r.costUsd
    if (r.warnings.length) { console.log("⚠️", i.id, r.warnings.join(" | ")); continue }
    done[i.id] = { title: i.title.fa ?? r.title, body: r.body }
    ok++
    fs.writeFileSync(outFile, JSON.stringify(done, null, 1)) // ذخیره‌ی تدریجی (قابل ادامه)
  } catch (e) {
    console.log("✗", i.id, (e as Error).message)
  }
}
console.log(`انجام شد: ${ok}/${todo.length} · هزینه‌ی تخمینی: ${spent.toFixed(3)}$ (نیازمند LLM_RATE_IN/OUT). بعد: npx tsx scripts/build-catalog.ts`)
