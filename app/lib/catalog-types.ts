import type { Kind, Level } from "./taxonomy"

export type L = Partial<Record<"fa" | "en" | "ar", string>>

export interface CatalogItem {
  id: string
  slug: string
  source: string
  license: string
  sourceUrl: string
  field: string
  kind: Kind
  level: Level
  tags: string[]
  /** ۰–۱۰۰ از سیگنال واقعی منبع؛ null یعنی داده‌ی محبوبیت نداریم */
  popularity: number | null
  title: L
  body: L
  description: L
  /** محتوای تألیفی خود ما (نه منبع آزاد) */
  original?: boolean
}
