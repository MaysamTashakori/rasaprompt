import type { MetadataRoute } from "next"
import { loadCatalog } from "@/lib/catalog"
import { routing } from "@/i18n/routing"

// فقط صفحات ارزشمند: خانه، کتابخانه، و پرامپت‌هایی که در همان زبان متن کامل دارند (سیاست محتوای انبوه)
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL || "http://localhost:3000"
  const pages: MetadataRoute.Sitemap = routing.locales.flatMap((l) => [
    { url: `${base}/${l}`, changeFrequency: "daily" as const, priority: 1 },
    { url: `${base}/${l}/library`, changeFrequency: "daily" as const, priority: 0.8 },
  ])
  for (const i of loadCatalog())
    for (const l of routing.locales)
      if (i.original || i.body[l]) pages.push({ url: `${base}/${l}/p/${encodeURIComponent(i.slug)}`, changeFrequency: "weekly", priority: i.original ? 0.9 : 0.6 })
  return pages
}
