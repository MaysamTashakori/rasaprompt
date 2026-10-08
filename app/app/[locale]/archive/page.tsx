import type { Metadata } from "next"
import Link from "next/link"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { searchArchive, sources } from "@/lib/archive"
import { CopyButton } from "@/components/copy-button"
import type { Locale } from "@/i18n/routing"

export const metadata: Metadata = { robots: { index: false, follow: true } }
export const dynamic = "force-dynamic"

export default async function Archive({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ q?: string; source?: string; page?: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const t = await getTranslations("")
  const { items, total, pages } = searchArchive({ q: sp.q, source: sp.source, page })
  const qs = (o: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams()
    for (const [k, v] of Object.entries({ q: sp.q, source: sp.source, ...o })) if (v) u.set(k, String(v))
    return `?${u}`
  }
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("archive")}</h1>
      <p className="text-sm text-muted">{t("archiveNote")}</p>
      <form className="flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q} placeholder={t("search")} className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 outline-none focus:border-accent" />
        <select name="source" defaultValue={sp.source ?? ""} className="rounded-lg border border-border bg-card px-3 py-2">
          <option value="">{t("all")}</option>
          {sources().map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="rounded-lg bg-accent px-4 py-2 text-accent-fg">{t("search").replace("…", "")}</button>
      </form>
      <p className="text-sm text-muted">{total} {t("results")}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((i) => (
          <article key={i.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <h2 className="font-semibold">{i.title}</h2>
            <p dir="auto" className="line-clamp-6 whitespace-pre-wrap text-sm text-muted">{i.body}</p>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs text-muted">
              <CopyButton text={i.body} label={t("copy")} done={t("copied")} />
              <a href={i.sourceUrl} rel="noopener nofollow" className="underline">{t("source")}: {i.source}</a>
              <span>{t("license")}: {i.license}</span>
            </div>
          </article>
        ))}
      </div>
      <nav className="flex items-center justify-center gap-4 text-sm">
        {page > 1 && <Link href={qs({ page: page - 1 })}>{t("prev")}</Link>}
        <span>{t("page")} {page} / {pages}</span>
        {page < pages && <Link href={qs({ page: page + 1 })}>{t("next")}</Link>}
      </nav>
    </div>
  )
}
