import Link from "next/link"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { prompts } from "@/data/prompts"
import { PromptCard } from "@/components/prompt-card"
import { formatPrice } from "@/lib/format"
import pricing from "@/config/pricing.json"
import type { Locale } from "@/i18n/routing"

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("")
  const fa = locale === "fa"
  const m = (fa ? pricing.markets.fa : pricing.markets.en).prices as Record<string, number | number[]>
  const cur = fa ? "IRT" : "USD"
  const f = (n: number) => formatPrice(locale, n, cur)
  const features = t.raw("features.items") as { t: string; d: string }[]
  const plans = [
    { k: "lite", price: t("free"), desc: t("pricing.liteDesc") },
    { k: "pro", price: `${t("pricing.proDesc")} ${f((m.prompt_pro as number[])[0])}`, desc: "" },
    { k: "plus", price: `${f(m.plus_monthly as number)}${t("pricing.monthly")}`, desc: t("pricing.plusDesc"), hl: true },
    { k: "lifetime", price: `${f(m.lifetime_founder as number)} ${t("pricing.once")}`, desc: t("pricing.lifetimeDesc", { cap: pricing.lifetime_founder_cap }) },
  ]
  return (
    <div className="space-y-20">
      <section className="space-y-5 py-10 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">{t("tagline")}</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted">{t("subtitle")}</p>
        <div className="flex justify-center gap-3">
          <Link href={`/${locale}/library`} className="rounded-lg bg-accent px-5 py-2.5 font-medium text-accent-fg">{t("ctaLibrary")}</Link>
          <Link href="#pricing" className="rounded-lg border border-border px-5 py-2.5 hover:border-accent">{t("ctaPricing")}</Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((x) => (
          <div key={x.t} className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-2 font-semibold">{x.t}</h3>
            <p className="text-sm text-muted">{x.d}</p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">{t("nav.library")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.slice(0, 3).map((p) => <PromptCard key={p.slug} p={p} locale={locale} />)}
        </div>
      </section>

      <section id="pricing" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{t("pricing.title")}</h2>
          <p className="text-sm text-muted">{t("pricing.note")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <div key={p.k} className={`rounded-xl border bg-card p-5 ${p.hl ? "border-accent" : "border-border"}`}>
              <h3 className="font-semibold">{t(`pricing.plans.${p.k}`)}</h3>
              <p className="my-3 text-xl font-bold">{p.price}</p>
              <p className="text-sm text-muted">{p.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted">{t("guarantee")}</p>
      </section>
    </div>
  )
}
