// دسترسی سمت سرور به کاتالوگ (content/catalog.json) — مشترک بین سایت، API و ربات‌ها
import fs from "node:fs"
import path from "node:path"
import type { CatalogItem, L } from "./catalog-types"
import { normalize } from "./format.ts"
import { FIELDS, type Kind, type Level } from "./taxonomy.ts"

export type Loc = "fa" | "en" | "ar"
export type Sort = "trending" | "original" | "az"

let cache: CatalogItem[] | null = null
let bySlug: Map<string, CatalogItem> | null = null
let searchIndex: Map<string, string> | null = null

const catalogPath = () =>
  process.env.CATALOG_PATH ?? path.join(process.cwd(), fs.existsSync(path.join(process.cwd(), "content")) ? "content" : "../content", "catalog.json")

/** پاک‌کردن کش پس از بازسازی کاتالوگ (پنل مدیریت) */
export function reloadCatalog() { cache = null; bySlug = null; searchIndex = null }

export function loadCatalog(): CatalogItem[] {
  if (cache) return cache
  const p = catalogPath()
  cache = fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, "utf8")) as CatalogItem[]) : []
  bySlug = new Map(cache.map((i) => [i.slug, i]))
  searchIndex = new Map(
    cache.map((i) => [i.id, normalize([i.title.fa, i.title.en, i.title.ar, i.description.fa, i.description.en, i.tags.join(" "), i.body.en?.slice(0, 400), i.body.fa?.slice(0, 400)].filter(Boolean).join(" "))]),
  )
  return cache
}

/** متن در زبان خواسته‌شده، با بازگشت به فارسی → انگلیسی → عربی */
export const pick = (v: L, loc: Loc) => v[loc] ?? v.fa ?? v.en ?? v.ar ?? ""
export const hasLocale = (i: CatalogItem, loc: Loc) => Boolean(i.title[loc])

export interface Query { q?: string; field?: string; kind?: Kind; level?: Level; sort?: Sort; page?: number; size?: number; onlyLocalized?: Loc }

export function query(o: Query = {}) {
  const all = loadCatalog()
  const nq = o.q ? normalize(o.q) : ""
  const terms = nq.split(/\s+/).filter(Boolean)
  let list = all.filter(
    (i) =>
      (!o.field || i.field === o.field) && (!o.kind || i.kind === o.kind) && (!o.level || i.level === o.level) &&
      (!o.onlyLocalized || hasLocale(i, o.onlyLocalized)) &&
      (!terms.length || terms.every((t) => searchIndex!.get(i.id)!.includes(t))),
  )
  if (o.sort === "az") list = [...list].sort((a, b) => pick(a.title, "en").localeCompare(pick(b.title, "en")))
  else if (o.sort === "trending") list = [...list].sort((a, b) => (b.popularity ?? -1) - (a.popularity ?? -1))
  // پیش‌فرض/original: ترتیب کاتالوگ (تألیفی‌ها، سپس محبوبیت)
  const size = o.size ?? 24
  const pages = Math.max(1, Math.ceil(list.length / size))
  const page = Math.min(Math.max(1, o.page ?? 1), pages)
  return { total: list.length, page, pages, items: list.slice((page - 1) * size, page * size) }
}

export const getBySlug = (slug: string) => (loadCatalog(), bySlug!.get(slug))
export const getById = (id: string) => loadCatalog().find((i) => i.id === id)

export function related(item: CatalogItem, n = 6) {
  return loadCatalog().filter((i) => i.id !== item.id && i.field === item.field).slice(0, n)
}

/** پرطرفدارها؛ با locale، مواردی که عنوان همان زبان را دارند جلوتر می‌آیند */
export const trending = (n = 8, loc?: Loc) =>
  loadCatalog()
    .filter((i) => i.popularity !== null)
    .sort((a, b) => (loc ? Number(hasLocale(b, loc)) - Number(hasLocale(a, loc)) : 0) || b.popularity! - a.popularity!)
    .slice(0, n)
export const originals = () => loadCatalog().filter((i) => i.original)

export function stats() {
  const all = loadCatalog()
  const fieldCounts = Object.fromEntries(FIELDS.map((f) => [f.id, all.filter((i) => i.field === f.id).length]))
  return { total: all.length, fieldCounts, fa: all.filter((i) => i.title.fa).length, ar: all.filter((i) => i.title.ar).length }
}

/** متغیرهای پرامپت: {{نام}} و [نام] */
export function variablesOf(body: string): string[] {
  const out = new Set<string>()
  for (const m of body.matchAll(/\{\{\s*([^{}\n]{1,40}?)\s*\}\}|\[([^\[\]\n]{1,30})\]/g)) {
    const v = (m[1] ?? m[2]).trim()
    if (v && !/^\d+$/.test(v) && v !== "?") out.add(v)
  }
  return [...out]
}
