import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Flame, Info, Sparkles } from "lucide-react"
import { getBySlug, hasLocale, pick, related, variablesOf, type Loc } from "@/lib/catalog"
import { FIELDS, KIND_NAMES, LEVEL_NAMES } from "@/lib/taxonomy"
import { PromptCard } from "@/components/prompt-card"
import { PromptRunner } from "@/components/prompt-runner"
import { SaveButton } from "@/components/save-button"
import { CAREFUL_FIELDS } from "@/lib/site"

type P = { params: Promise<{ locale: Loc; slug: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params
  const item = getBySlug(decodeURIComponent(slug))
  if (!item) return {}
  return {
    title: pick(item.title, locale),
    description: pick(item.description, locale) || pick(item.body, locale).slice(0, 155),
    // فقط محتوای تألیفی یا بومی‌شده در همین زبان ایندکس شود (سیاست محتوای انبوه)
    robots: { index: Boolean(item.original || (hasLocale(item, locale) && item.body[locale])), follow: true },
  }
}

export default async function PromptPage({ params }: P) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const item = getBySlug(decodeURIComponent(slug))
  if (!item) notFound()
  const t = await getTranslations("")
  const field = FIELDS.find((f) => f.id === item.field)
  const body = pick(item.body, locale)
  const bodyLocalized = Boolean(item.body[locale])
  const desc = pick(item.description, locale)
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
      <article className="min-w-0 space-y-6">
        <nav className="flex flex-wrap gap-2 text-sm text-muted">
          <Link href={`/${locale}/library`} className="hover:text-fg">{t("lib.title")}</Link>
          <span>/</span>
          <Link href={`/${locale}/library?field=${item.field}`} className="hover:text-fg">{field?.emoji} {field?.names[locale]}</Link>
        </nav>
        <header className="space-y-3">
          <h1 dir="auto" className="text-3xl font-extrabold leading-tight sm:text-4xl">{pick(item.title, locale)}</h1>
          {desc && <p dir="auto" className="text-lg leading-8 text-muted">{desc}</p>}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {item.original && <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 font-medium text-accent"><Sparkles className="size-3" />{t("p.original")}</span>}
            <span className="rounded-full bg-subtle px-2.5 py-1">{KIND_NAMES[item.kind][locale]}</span>
            <span className="rounded-full bg-subtle px-2.5 py-1">{LEVEL_NAMES[item.level][locale]}</span>
            {item.popularity !== null && <span className="inline-flex items-center gap-1 rounded-full bg-warn-bg px-2.5 py-1 text-warn"><Flame className="size-3" />{t("p.popularity")} {item.popularity}</span>}
            <span className="rounded-full border border-border px-2.5 py-1 text-muted">{t("p.untested")}</span>
          </div>
        </header>

        {!bodyLocalized && <p className="flex gap-2 rounded-xl bg-subtle p-3 text-sm text-muted"><Info className="mt-0.5 size-4 shrink-0" />{t("p.enOnly")}</p>}
        {CAREFUL_FIELDS.has(item.field) && <p className="flex gap-2 rounded-xl bg-warn-bg p-3 text-sm text-warn"><Info className="mt-0.5 size-4 shrink-0" />{t("p.careful")}</p>}

        <PromptRunner body={body} variables={variablesOf(body)}
          labels={{ fill: t("p.fill"), final: t("p.final"), copy: t("p.copy"), copied: t("p.copied"), openIn: t("p.openIn") }} />

        <div className="flex flex-wrap items-center gap-3">
          <SaveButton slug={item.slug} label={t("p.save")} done={t("p.saved")} />
          <span className="text-xs text-muted">
            {t("p.source")}: {item.sourceUrl ? <a href={item.sourceUrl} rel="noopener nofollow" target="_blank" className="underline">{item.source}</a> : t("brand")}
            {" · "}{t("p.license")}: {item.license === "proprietary-own" ? "©" : item.license}
          </span>
        </div>
      </article>

      <aside className="space-y-4">
        <h2 className="text-sm font-semibold text-muted">{t("p.related")}</h2>
        <div className="grid gap-3">
          {related(item, 5).map((i) => <PromptCard key={i.id} item={i} locale={locale} labels={{ original: t("p.original") }} />)}
        </div>
      </aside>
    </div>
  )
}
