import { notFound } from "next/navigation"
import Link from "next/link"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getPrompt, prompts } from "@/data/prompts"
import { routing, type Locale } from "@/i18n/routing"
import { TestBadge } from "@/components/test-badge"
import pricing from "@/config/pricing.json"
import { formatPrice } from "@/lib/format"

export const generateStaticParams = () =>
  routing.locales.flatMap((locale) => prompts.map((p) => ({ locale, slug: p.slug })))

export default async function PromptPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const p = getPrompt(slug)
  if (!p) notFound()
  const t = await getTranslations("")
  const market = locale === "fa" ? pricing.markets.fa : pricing.markets.en
  const idx = p.tier === "elite" ? 2 : p.tier === "pro" ? 1 : 0
  const proPrice = (market.prices as { prompt_pro: number[] }).prompt_pro[idx]
  const currency = locale === "fa" ? "IRT" : "USD"
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link href={`/${locale}/library`} className="text-sm text-muted hover:text-fg">← {t("back")}</Link>
      <h1 className="text-3xl font-bold leading-tight">{p.title[locale]}</h1>
      <p className="text-muted">{p.summary[locale]}</p>
      <TestBadge tested={p.tested} />
      <section className="space-y-2">
        <h2 className="font-semibold">{t("sample")}</h2>
        <pre className="whitespace-pre-wrap rounded-xl border border-border bg-card p-4 text-sm leading-relaxed">{p.sampleOutput[locale]}</pre>
      </section>
      <section className="space-y-2">
        <h2 className="font-semibold">{t("variables")}</h2>
        <div className="flex flex-wrap gap-2" dir="ltr">
          {p.variables.map((v) => <code key={v} className="rounded-md border border-border bg-card px-2 py-1 text-xs">{`{{${v}}}`}</code>)}
        </div>
      </section>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
        <button className="rounded-lg border border-border px-4 py-2 text-sm hover:border-accent">{t("getLite")} · {t("free")}</button>
        {p.tier !== "lite" && (
          <button className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg">{t("buy")} · {formatPrice(locale, proPrice, currency)}</button>
        )}
        <p className="w-full text-xs text-muted">{t("guarantee")}</p>
      </div>
    </article>
  )
}
