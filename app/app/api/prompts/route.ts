// API عمومی سبک: جست‌وجو یا دریافت بر اساس slug (برای صفحه‌ی ذخیره‌ها، افزونه و ربات‌ها)
import { NextResponse } from "next/server"
import { getBySlug, pick, query, type Loc } from "@/lib/catalog"

const light = (loc: Loc) => (i: NonNullable<ReturnType<typeof getBySlug>>) => ({
  slug: i.slug, title: pick(i.title, loc), description: pick(i.description, loc), field: i.field, kind: i.kind, level: i.level,
  popularity: i.popularity, original: !!i.original, source: i.source, license: i.license,
})

export function GET(req: Request) {
  const u = new URL(req.url)
  const loc = (["fa", "en", "ar"].includes(u.searchParams.get("locale") ?? "") ? u.searchParams.get("locale") : "fa") as Loc
  const slugs = u.searchParams.get("slugs")
  if (slugs) {
    const items = slugs.split(",").slice(0, 100).map((s) => getBySlug(s)).filter((x) => x !== undefined)
    return NextResponse.json({ items: items.map(light(loc)) })
  }
  const r = query({ q: u.searchParams.get("q") ?? undefined, field: u.searchParams.get("field") ?? undefined, page: Number(u.searchParams.get("page")) || 1, size: 20 })
  return NextResponse.json({ ...r, items: r.items.map(light(loc)) })
}
