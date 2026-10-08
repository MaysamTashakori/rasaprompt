import Link from "next/link"
import { Fire, Sparkle } from "@phosphor-icons/react/dist/ssr"
import type { CatalogItem } from "@/lib/catalog-types"
import { pick, type Loc } from "@/lib/catalog"
import { FIELDS, KIND_NAMES, LEVEL_NAMES } from "@/lib/taxonomy"
import { FieldIcon } from "@/lib/icons"
import { Spotlight } from "./fx/spotlight"

export function PromptCard({ item, locale, labels, compact }: { item: CatalogItem; locale: Loc; labels: { original: string }; compact?: boolean }) {
  const field = FIELDS.find((f) => f.id === item.field)
  const desc = pick(item.description, locale) || pick(item.body, locale).slice(0, 160)
  const nf = (n: number) => n.toLocaleString(locale === "fa" ? "fa-IR" : "en-US")
  return (
    <Spotlight className="card card-hover h-full rounded-2xl">
      <Link href={`/${locale}/p/${encodeURIComponent(item.slug)}`} className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><FieldIcon id={item.field} className="size-4 text-accent" />{field?.names[locale]}</span>
          <span className="ms-auto">{KIND_NAMES[item.kind][locale]}</span>
        </div>
        <h3 dir="auto" className="text-[15px] font-semibold leading-7">{pick(item.title, locale)}</h3>
        {!compact && <p dir="auto" className="line-clamp-2 text-sm leading-7 text-muted">{desc}</p>}
        <div className="mt-auto flex items-center gap-3 pt-1 text-xs text-muted">
          <span>{LEVEL_NAMES[item.level][locale]}</span>
          {item.original && <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent"><Sparkle className="size-3" weight="fill" />{labels.original}</span>}
          {item.popularity !== null && <span className="ms-auto inline-flex items-center gap-1 text-warn"><Fire className="size-3.5" weight="fill" />{nf(item.popularity)}</span>}
        </div>
      </Link>
    </Spotlight>
  )
}
