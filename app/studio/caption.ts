// کپشن اینستاگرام از روی یک پرامپت (قطعی و بدون LLM؛ عامل Content-Studio می‌تواند با مدل بهبودش دهد)
import type { CatalogItem } from "../lib/catalog-types.ts"
import { pick, variablesOf } from "../lib/catalog.ts"
import { FIELDS } from "../lib/taxonomy.ts"

const HASHTAGS: Record<string, string[]> = {
  marketing: ["#بازاریابی_دیجیتال", "#اینستاگرام_مارکتینگ", "#تولید_محتوا"],
  writing: ["#نویسندگی", "#تولید_محتوا", "#کپی_رایتینگ"],
  coding: ["#برنامه_نویسی", "#برنامه_نویس", "#توسعه_وب"],
  career: ["#رزومه", "#استخدام", "#کاریابی"],
  education: ["#آموزش", "#دانشجو", "#یادگیری"],
  business: ["#کسب_و_کار", "#کارآفرینی", "#مدیریت"],
  language: ["#ترجمه", "#زبان_انگلیسی"],
  design: ["#طراحی", "#هوش_مصنوعی_تصویر"],
}
const BASE = ["#هوش_مصنوعی", "#پرامپت", "#چت_جی_پی_تی", "#رسا_پرامپت"]

export function buildCaption(item: CatalogItem, opts: { site: string; bot?: string }) {
  const title = pick(item.title, "fa")
  const desc = pick(item.description, "fa")
  const vars = variablesOf(pick(item.body, "fa")).slice(0, 4)
  const field = FIELDS.find((f) => f.id === item.field)?.names.fa ?? ""
  const tags = [...(HASHTAGS[item.field] ?? []), ...BASE].slice(0, 10).join(" ")
  return [
    `${title} ✨`,
    "",
    desc,
    "",
    vars.length ? `فقط این‌ها را جایگزین کن: ${vars.map((v) => `«${v.replace(/_/g, " ")}»`).join("، ")}` : "",
    "متن کامل پرامپت در اسلاید سوم. ذخیره کن تا گمش نکنی 📌",
    "",
    `🔗 متن کامل و اجرای مستقیم: ${opts.site}`,
    opts.bot ? `🤖 ربات: ${opts.bot}` : "",
    "",
    `#${field.replace(/\s+/g, "_")} ${tags}`,
  ].filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n").trim()
}

/** پرامپت تصویر پس‌زمینه برای مدل تصویری (اختیاری، برای عامل Image-Smith) */
export function imagePrompt(item: CatalogItem) {
  const field = FIELDS.find((f) => f.id === item.field)?.names.en ?? "productivity"
  return `Minimal abstract editorial background for an Instagram post about "${pick(item.title, "en")}" (${field}). Dark charcoal (#0b0b0d) base, subtle emerald (#34d399) light accents, soft grain, lots of negative space for text on the right side, no text, no logos, no people faces, 4:5 aspect ratio.`
}
