import Link from "next/link"
import { Flame, Sparkles } from "lucide-react"
import type { CatalogItem } from "@/lib/catalog-types"
import { pick, type Loc } from "@/lib/catalog"
import { FIELDS, KIND_NAMES, LEVEL_NAMES } from "@/lib/taxonomy"

export function PromptCard({ item, locale, labels }: { item: CatalogItem; locale: Loc; labels: { original: string } }) {
  const field = FIELDS.find((f) => f.id === item.field)
  const desc = pick(item.description, locale) || pick(item.body, locale).slice(0, 160)
  return (
    <Link href={`/${locale}/p/${encodeURIComponent(item.slug)}`} className="card card-hover group flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2 text-xs text-muted">
        <span>{field?.emoji} {field?.names[locale]}</span>
        <span className="ms-auto rounded-full bg-subtle px-2 py-0.5">{KIND_NAMES[item.kind][locale]}</span>
        <span className="rounded-full bg-subtle px-2 py-0.5">{LEVEL_NAMES[item.level][locale]}</span>
      </div>
      <h3 dir="auto" className="font-semibold leading-snug group-hover:text-accent">{pick(item.title, locale)}</h3>
      <p dir="auto" className="line-clamp-2 text-sm leading-relaxed text-muted">{desc}</p>
      <div className="mt-auto flex items-center gap-3 pt-1 text-xs">
        {item.original && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 font-medium text-accent">
            <Sparkles className="size-3" aria-hidden /> {labels.original}
          </span>
        )}
        {item.popularity !== null && (
          <span className="inline-flex items-center gap-1 text-warn" title="popularity">
            <Flame className="size-3.5" aria-hidden /> {item.popularity.toLocaleString(locale === "fa" ? "fa-IR" : "en-US")}
          </span>
        )}
      </div>
    </Link>
  )
}
