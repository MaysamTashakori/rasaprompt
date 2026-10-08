// خواندن آرشیو منابع آزاد (content/imported/*.jsonl) در سمت سرور. فقط برای نمایش با انتساب.
import fs from "node:fs"
import path from "node:path"
import { normalize } from "./format"

export interface ArchiveItem {
  id: string; source: string; license: string; sourceUrl: string; locale: string
  title: string; body: string; description?: string; tags: string[]
}

let cache: ArchiveItem[] | null = null

export function loadArchive(): ArchiveItem[] {
  if (cache) return cache
  const dir = path.join(process.cwd(), "..", "content", "imported")
  if (!fs.existsSync(dir)) return (cache = [])
  cache = fs.readdirSync(dir).filter((f) => f.endsWith(".jsonl")).sort().flatMap((f) =>
    fs.readFileSync(path.join(dir, f), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as ArchiveItem),
  )
  return cache
}

export function searchArchive(opts: { q?: string; source?: string; locale?: string; page?: number; size?: number }) {
  const { q = "", source, locale, page = 1, size = 24 } = opts
  const nq = normalize(q)
  const all = loadArchive().filter(
    (i) => (!source || i.source === source) && (!locale || i.locale === locale) && (!nq || normalize(`${i.title} ${i.body}`).includes(nq)),
  )
  return { total: all.length, items: all.slice((page - 1) * size, page * size), pages: Math.max(1, Math.ceil(all.length / size)) }
}

export const sources = () => [...new Set(loadArchive().map((i) => i.source))]
