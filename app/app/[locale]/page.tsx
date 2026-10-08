import Link from "next/link"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { ArrowLeft, Bot, Code2, Briefcase, Users, Workflow, Flame, Sparkles } from "lucide-react"
import { originals, stats, trending, type Loc } from "@/lib/catalog"
import { FIELDS } from "@/lib/taxonomy"
import { PromptCard } from "@/components/prompt-card"
import { SearchBox } from "@/components/search-box"
import { BOT_LINKS, POPULAR_SEARCHES } from "@/lib/site"
import { formatPrice } from "@/lib/format"
import pricing from "@/config/pricing.json"

function Arrow() {
  return <ArrowLeft className="size-4 ltr:rotate-180" aria-hidden />
}

export default async function Home({ params }: { params: Promise<{ locale: Loc }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("")
  const s = stats()
  const nf = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-u-nu-latn" : "en-US")
  const lib = `/${locale}/library`
  const cardLabels = { original: t("p.original") }
  const audiences = [
    { k: "users", icon: Users, href: `${lib}?level=beginner` },
    { k: "coders", icon: Code2, href: `${lib}?field=coding` },
    { k: "pros", icon: Briefcase, href: `${lib}?level=pro` },
    { k: "skills", icon: Workflow, href: `${lib}?kind=system` },
  ]
  const fa = locale === "fa"
  const m = (fa ? pricing.markets.fa : pricing.markets.en).prices as Record<string, number | number[]>
  const f = (n: number) => formatPrice(locale, n, fa ? "IRT" : "USD")
  const plans = [
    { k: "lite", price: t("pricing.plans.lite"), desc: t("pricing.liteDesc") },
    { k: "pro", price: `${t("pricing.proDesc")} ${f((m.prompt_pro as number[])[0])}`, desc: "" },
    { k: "plus", price: `${f(m.plus_monthly as number)}${t("pricing.monthly")}`, desc: t("pricing.plusDesc"), hl: true },
    { k: "lifetime", price: f(m.lifetime_founder as number), desc: t("pricing.lifetimeDesc", { cap: nf.format(pricing.lifetime_founder_cap) }) },
  ]
  const faq = t.raw("faq.items") as { q: string; a: string }[]

  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="hero-glow -mx-4 -mt-12 px-4 pb-6 pt-16 text-center sm:pt-24">
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.25] tracking-tight sm:text-6xl">
          <span className="text-gradient">{t("tagline")}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">{t("subtitle")}</p>
        <div className="mx-auto mt-8 max-w-2xl">
          <SearchBox locale={locale} placeholder={t("search")} button={t("searchBtn")} big />
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-muted">
            <span>{t("popular")}</span>
            {POPULAR_SEARCHES[locale].map((q) => <Link key={q} href={`${lib}?q=${encodeURIComponent(q)}`} className="chip">{q}</Link>)}
          </div>
        </div>
        <dl className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-4">
          {[[s.total, "prompts"], [FIELDS.length, "fields"], [3, "langs"]].map(([n, k]) => (
            <div key={k as string}><dt className="text-2xl font-bold sm:text-3xl">{nf.format(n as number)}</dt><dd className="text-sm text-muted">{t(`stat.${k}`)}</dd></div>
          ))}
        </dl>
      </section>

      {/* Audiences */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">{t("aud.title")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map(({ k, icon: Icon, href }) => (
            <Link key={k} href={href} className="card card-hover group flex flex-col gap-3 p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-accent/10 text-accent"><Icon className="size-5" /></span>
              <h3 className="font-semibold">{t(`aud.${k}`)}</h3>
              <p className="text-sm leading-7 text-muted">{t(`aud.${k}D`)}</p>
              <span className="mt-auto text-accent opacity-0 transition group-hover:opacity-100"><Arrow /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* Originals */}
      <section className="space-y-6">
        <div className="flex items-end gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold"><Sparkles className="size-5 text-accent" />{t("originals")}</h2>
            <p className="mt-1 text-sm text-muted">{t("originalsNote")}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {originals().slice(0, 6).map((i) => <PromptCard key={i.id} item={i} locale={locale} labels={cardLabels} />)}
        </div>
      </section>

      {/* Trending */}
      <section className="space-y-6">
        <div className="flex items-end gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold"><Flame className="size-5 text-warn" />{t("trending")}</h2>
            <p className="mt-1 text-sm text-muted">{t("trendingNote")}</p>
          </div>
          <Link href={`${lib}?sort=trending`} className="ms-auto flex items-center gap-1 text-sm text-accent">{t("viewAll")} <Arrow /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trending(8, locale).map((i) => <PromptCard key={i.id} item={i} locale={locale} labels={cardLabels} />)}
        </div>
      </section>

      {/* Fields */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">{t("fieldsTitle")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {FIELDS.map((fd) => (
            <Link key={fd.id} href={`${lib}?field=${fd.id}`} className="card card-hover flex items-center gap-3 p-4">
              <span className="text-2xl" aria-hidden>{fd.emoji}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{fd.names[locale]}</span>
                <span className="text-xs text-muted">{nf.format(s.fieldCounts[fd.id] ?? 0)}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bots */}
      <section id="bots" className="card relative overflow-hidden p-8 sm:p-10">
        <div className="hero-glow absolute inset-0 opacity-60" aria-hidden />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent text-accent-fg"><Bot className="size-7" /></span>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{t("bots.title")}</h2>
            <p className="text-muted">{t("bots.desc")}</p>
          </div>
          <div className="flex gap-3 sm:ms-auto">
            {(["telegram", "bale"] as const).map((b) =>
              BOT_LINKS[b] ? (
                <a key={b} href={BOT_LINKS[b]} target="_blank" rel="noopener noreferrer" className="btn-primary">{t(`bots.${b}`)}</a>
              ) : (
                <span key={b} className="btn-ghost cursor-default opacity-70">{t(`bots.${b}`)} · {t("bots.soon")}</span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{t("pricing.title")}</h2>
          <p className="mt-1 text-sm text-muted">{t("pricing.note")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <div key={p.k} className={`card p-6 ${p.hl ? "border-accent ring-1 ring-accent/30" : ""}`}>
              <h3 className="text-sm font-medium text-muted">{t(`pricing.plans.${p.k}`)}</h3>
              <p className="my-3 text-xl font-bold">{p.price}</p>
              <p className="text-sm leading-7 text-muted">{p.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted">{t("guarantee")}</p>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">{t("faq.title")}</h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {faq.map((x) => (
            <details key={x.q} className="group p-5">
              <summary className="cursor-pointer list-none font-medium marker:hidden">{x.q}</summary>
              <p className="mt-2 text-sm leading-7 text-muted">{x.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
