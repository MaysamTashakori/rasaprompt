// ساخت کاتالوگ سایت/ربات از content/imported: سیاست محتوا + منشأ → ادغام تکراری‌ها → طبقه‌بندی → محبوبیت → عناوین محلی
// اجرا: npx tsx scripts/build-catalog.ts
import fs from "node:fs"
import path from "node:path"
import type { SourcedPrompt } from "../pipelines/ingest/types"
import { classifyField, classifyKind, classifyLevel, slugify } from "../lib/taxonomy"
import type { CatalogItem } from "../lib/catalog-types"

const dir = path.resolve("../content")
const read = (f: string): SourcedPrompt[] =>
  fs.readFileSync(path.join(dir, "imported", f), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))

// سیاست محتوا: jailbreak/بزرگسال/دور زدن محدودیت ممنوع (docs/01-PRD)
const BANNED = /\b(jailbreak|dan\b|developer mode|code anything now|uncensored|unfiltered|unrestricted|no (?:ethical )?(?:restrictions|limitations)|without (?:any )?(?:restrictions|limitations|filters)|ignore (?:all |any )?(?:previous |prior )?(?:instructions|rules|guidelines)|nsfw|sexual|porn|erotic|lewd|seduc|succubus|gaslight|incubus|flirt|girlfriend|boyfriend|opposite-sex|mistress|bypass (?:openai|the) (?:policy|policies|filters))/i
// منشأ مجاز برای رکوردهای Shortcut: خودِ مخزن یا prompts.chat (CC0). بقیه منشأ شخص ثالث دارند → حذف
const okOrigin = (p: SourcedPrompt) => !p.sameAs || /github\.com\/(f\/awesome-chatgpt-prompts|rockbenben\/ChatGPT-Shortcut)/.test(p.sameAs)

const stats = { banned: 0, foreignOrigin: 0, merged: 0 }
const keep = (p: SourcedPrompt) => {
  if (BANNED.test(`${p.title}\n${p.body}`)) return (stats.banned++, false)
  if (p.source === "shortcut" && !okOrigin(p)) return (stats.foreignOrigin++, false)
  return true
}

const pc = read("promptschat.en.jsonl").filter(keep)
const scEn = read("shortcut.en.jsonl").filter(keep)
const scAr = new Map(read("shortcut.ar.jsonl").filter(keep).map((p) => [p.id.split(":")[1], p]))
const fab = read("fabric.en.jsonl").filter(keep)

const key = (s: string) => slugify(s).replace(/^act-as-/, "").replace(/^(an|a|the)-/, "")
const byAnchor = new Map(pc.map((p) => [key(p.title), p]))

const maxPop = Math.max(...scEn.map((p) => p.popularity ?? 0), 1)
const pop = (w?: number) => (w ? Math.round((100 * Math.log1p(w)) / Math.log1p(maxPop)) : null)

const items = new Map<string, CatalogItem>()
const used = new Set<string>()
const add = (it: CatalogItem) => {
  let slug = it.slug, n = 2
  while (used.has(slug)) slug = `${it.slug}-${n++}`
  used.add(slug)
  items.set(it.id, { ...it, slug })
}
const make = (p: SourcedPrompt): CatalogItem => {
  const field = classifyField(p.title, p.body, p.tags)
  return {
    id: p.id, slug: slugify(p.title), source: p.source, license: p.license, sourceUrl: p.sourceUrl,
    field, kind: classifyKind(p.source, field, p.tags.includes("dev"), p.body), level: classifyLevel(p.body),
    tags: p.tags.filter((t) => t !== "contribute"), popularity: null,
    title: { en: p.title }, body: { en: p.body }, description: {},
  }
}

for (const p of pc) add(make(p))
for (const p of scEn) {
  const target = p.sameAs ? byAnchor.get(key(decodeURIComponent(p.sameAs.split("#")[1] ?? ""))) : undefined
  const ar = scAr.get(p.id.split(":")[1])
  const base = target ? items.get(target.id)! : make(p)
  if (target) stats.merged++
  base.popularity = Math.max(base.popularity ?? 0, pop(p.popularity) ?? 0) || null
  if (p.description) base.description.en = p.description
  if (ar) {
    base.title.ar = ar.title
    base.body.ar = ar.body
    if (ar.description) base.description.ar = ar.description
  }
  if (!target) add(base)
}
for (const p of fab) add(make(p))

// عناوین/توضیحات فارسی تألیفی (content/i18n/fa-titles.json) — در صورت وجود
const faFile = path.join(dir, "i18n", "fa-titles.json")
if (fs.existsSync(faFile)) {
  const fa = JSON.parse(fs.readFileSync(faFile, "utf8")) as Record<string, { title: string; description?: string; body?: string }>
  for (const [id, v] of Object.entries(fa)) {
    const it = items.get(id)
    if (!it) continue
    it.title.fa = v.title
    if (v.description) it.description.fa = v.description
    if (v.body) it.body.fa = v.body
  }
}

// محتوای تألیفی فارسی (content/originals/fa.json) — مالکیت خودمان
const origFile = path.join(dir, "originals", "fa.json")
if (fs.existsSync(origFile)) {
  type Orig = Pick<CatalogItem, "id" | "field" | "kind" | "level" | "title" | "description" | "body">
  for (const o of JSON.parse(fs.readFileSync(origFile, "utf8")) as Orig[])
    add({ ...o, slug: slugify(o.title.fa ?? o.id), source: "rasaprompt", license: "proprietary-own", sourceUrl: "", tags: ["original"], popularity: null, original: true })
}

// بدنه‌های فارسی بومی‌سازی‌شده (scripts/localize-batch.ts)
const faBodies = path.join(dir, "i18n", "fa-bodies.json")
if (fs.existsSync(faBodies)) {
  for (const [id, v] of Object.entries(JSON.parse(fs.readFileSync(faBodies, "utf8")) as Record<string, { title: string; body: string }>)) {
    const it = items.get(id)
    if (it) { it.title.fa ??= v.title; it.body.fa = v.body }
  }
}

const out = [...items.values()].sort((a, b) => Number(!!b.original) - Number(!!a.original) || (b.popularity ?? -1) - (a.popularity ?? -1))
fs.writeFileSync(path.join(dir, "catalog.json"), JSON.stringify(out))
const by = (k: keyof CatalogItem) => out.reduce<Record<string, number>>((m, i) => ((m[String(i[k])] = (m[String(i[k])] ?? 0) + 1), m), {})
console.log(JSON.stringify({ total: out.length, ...stats, fa: out.filter((i) => i.title.fa).length, ar: out.filter((i) => i.title.ar).length, field: by("field"), kind: by("kind"), level: by("level") }, null, 1))
