import type { Metadata } from "next"
import Link from "next/link"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { query, type Loc, type Sort } from "@/lib/catalog"
import { FIELDS, KIND_NAMES, LEVEL_NAMES, type Kind, type Level } from "@/lib/taxonomy"
import { PromptCard } from "@/components/prompt-card"
import { SearchBox } from "@/components/search-box"

function Chip({ on, to, children }: { on: boolean; to: string; children: React.ReactNode }) {
  return <Link href={to} className={`chip shrink-0 ${on ? "chip-on" : ""}`}>{children}</Link>
}

type SP = { q?: string; field?: string; kind?: Kind; level?: Level; sort?: Sort; page?: string }

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams
  // صفحات جست‌وجو/فیلتر ایندکس نشوند (محتوای تکراری)
  return { robots: { index: !sp.q && !sp.page, follow: true } }
}

export default async function Library({ params, searchParams }: { params: Promise<{ locale: Loc }>; searchParams: Promise<SP> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const sp = await searchParams
  const t = await getTranslations("")
  const r = query({ q: sp.q, field: sp.field, kind: sp.kind, level: sp.level, sort: sp.sort, page: Number(sp.page) || 1 })
  const nf = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US")
  const href = (o: Partial<SP>) => {
    const u = new URLSearchParams()
    for (const [k, v] of Object.entries({ ...sp, page: undefined, ...o })) if (v) u.set(k, String(v))
    const s = u.toString()
    return `/${locale}/library${s ? `?${s}` : ""}`
  }
  const field = FIELDS.find((f) => f.id === sp.field)
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{field ? `${field.emoji} ${field.names[locale]}` : t("lib.title")}</h1>
        <SearchBox locale={locale} placeholder={t("search")} button={t("searchBtn")} defaultValue={sp.q} />
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip on={!sp.field} to={href({ field: undefined })}>{t("all")}</Chip>
          {FIELDS.map((f) => <Chip key={f.id} on={sp.field === f.id} to={href({ field: f.id })}>{f.emoji} {f.names[locale]}</Chip>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(KIND_NAMES) as Kind[]).map((k) => <Chip key={k} on={sp.kind === k} to={href({ kind: sp.kind === k ? undefined : k })}>{KIND_NAMES[k][locale]}</Chip>)}
          <span className="mx-1 h-5 w-px bg-border" />
          {(Object.keys(LEVEL_NAMES) as Level[]).map((l) => <Chip key={l} on={sp.level === l} to={href({ level: sp.level === l ? undefined : l })}>{LEVEL_NAMES[l][locale]}</Chip>)}
          <span className="mx-1 h-5 w-px bg-border" />
          {([["", "sortFeatured"], ["trending", "sortTrending"], ["az", "sortAz"]] as const).map(([v, k]) => (
            <Chip key={k} on={(sp.sort ?? "") === v} to={href({ sort: (v || undefined) as Sort | undefined })}>{t(`lib.${k}`)}</Chip>
          ))}
          {(sp.q || sp.field || sp.kind || sp.level || sp.sort) && <Link href={`/${locale}/library`} className="ms-auto text-accent">{t("lib.clear")}</Link>}
        </div>
        <p className="text-muted">{nf.format(r.total)} {t("results")}</p>
      </div>

      {r.items.length === 0 ? (
        <p className="card p-10 text-center text-muted">{t("empty")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {r.items.map((i) => <PromptCard key={i.id} item={i} locale={locale} labels={{ original: t("p.original") }} />)}
        </div>
      )}

      {r.pages > 1 && (
        <nav className="flex items-center justify-center gap-3 text-sm" aria-label="pagination">
          {r.page > 1 && <Link className="btn-ghost" href={href({ page: String(r.page - 1) })}>{t("prev")}</Link>}
          <span className="text-muted">{t("page")} {nf.format(r.page)} / {nf.format(r.pages)}</span>
          {r.page < r.pages && <Link className="btn-ghost" href={href({ page: String(r.page + 1) })}>{t("next")}</Link>}
        </nav>
      )}
    </div>
  )
}
