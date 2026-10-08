import Link from "next/link"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { ArrowLeft, Code, Briefcase, Users, TreeStructure, Fire, Sparkle, TelegramLogo, ChatCircleDots, Plus, Play } from "@phosphor-icons/react/dist/ssr"
import { originals, pick, stats, trending, type Loc } from "@/lib/catalog"
import { FIELDS } from "@/lib/taxonomy"
import { FieldIcon } from "@/lib/icons"
import { PromptCard } from "@/components/prompt-card"
import { SearchBox } from "@/components/search-box"
import { HeroDemo } from "@/components/hero-demo"
import { Reveal } from "@/components/fx/reveal"
import { Marquee } from "@/components/fx/marquee"
import { BOT_LINKS, POPULAR_SEARCHES } from "@/lib/site"
import { formatPrice } from "@/lib/format"
import pricing from "@/config/pricing.json"

function Arrow({ className = "" }: { className?: string }) {
  return <ArrowLeft className={`size-4 ltr:rotate-180 ${className}`} aria-hidden />
}

export default async function Home({ params }: { params: Promise<{ locale: Loc }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("")
  const s = stats()
  const nf = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-u-nu-latn" : "en-US")
  const lib = `/${locale}/library`
  const cardLabels = { original: t("p.original") }
  const fa = locale === "fa"
  const m = (fa ? pricing.markets.fa : pricing.markets.en).prices as Record<string, number | number[]>
  const f = (n: number) => formatPrice(locale, n, fa ? "IRT" : "USD")
  const faq = t.raw("faq.items") as { q: string; a: string }[]
  const top = trending(8, locale)
  const hot = trending(24, locale).map((i) => ({ href: `/${locale}/p/${encodeURIComponent(i.slug)}`, label: pick(i.title, locale) }))
  const demo = t.raw("hero") as { demoTitle: string; demoRun: string; demoOut: string; demoV: string[]; demoVals: string[][]; demoOuts: string[] }

  return (
    <div className="space-y-28 sm:space-y-36">
      {/* ۱. هیرو: متن + پیش‌نمایش زنده‌ی واقعی (چیدمان نامتقارن) */}
      <section className="relative -mx-4 -mt-12 overflow-hidden px-4 pt-12 sm:pt-20">
        <div className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_60%_at_70%_30%,#000,transparent)]" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <Reveal className="space-y-7">
            <h1 className="text-balance text-4xl font-extrabold leading-[1.25] tracking-tight sm:text-5xl lg:text-[3.4rem]">{t("tagline")}</h1>
            <p className="max-w-[46ch] text-lg leading-8 text-muted">{t("subtitle")}</p>
            <div className="max-w-xl space-y-3">
              <SearchBox locale={locale} placeholder={t("search")} button={t("searchBtn")} big />
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {POPULAR_SEARCHES[locale].slice(0, 5).map((q) => <Link key={q} href={`${lib}?q=${encodeURIComponent(q)}`} className="chip">{q}</Link>)}
              </div>
            </div>
            <Link href={`/${locale}/chat`} className="btn-ghost"><Play className="size-4 text-accent" weight="fill" />{t("hero.cta")}</Link>
          </Reveal>
          <Reveal delay={0.15} className="lg:ps-6">
            <HeroDemo title={demo.demoTitle} run={demo.demoRun} outLabel={demo.demoOut} vars={demo.demoV} vals={demo.demoVals} outs={demo.demoOuts} />
          </Reveal>
        </div>
      </section>

      {/* ۲. نوار پرطرفدارها (تنها marquee) + آمار */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
          <h2 className="text-sm font-medium text-muted">{t("marquee")}</h2>
          <dl className="ms-auto flex gap-8 text-sm">
            {[[s.total, "prompts"], [FIELDS.length, "fields"], [3, "langs"]].map(([n, k]) => (
              <div key={k as string} className="flex items-baseline gap-1.5"><dt className="text-xl font-bold text-fg">{nf.format(n as number)}</dt><dd className="text-muted">{t(`stat.${k}`)}</dd></div>
            ))}
          </dl>
        </div>
        <Marquee items={hot} />
      </section>

      {/* ۳. بنتو مخاطبان: چهار خانه با ترکیب و پس‌زمینه‌ی متفاوت */}
      <section className="space-y-8">
        <Reveal><h2 className="text-3xl font-bold tracking-tight">{t("aud.title")}</h2></Reveal>
        <div className="grid gap-4 md:grid-cols-10 md:grid-rows-2">
          <Reveal className="md:col-span-6 md:row-span-2">
            <Link href={`${lib}?field=coding`} className="card card-hover group relative flex h-full min-h-80 flex-col overflow-hidden bg-fg p-7 text-bg">
              <Code className="size-7" weight="duotone" />
              <h3 className="mt-4 text-2xl font-bold">{t("aud.coders")}</h3>
              <p className="mt-2 max-w-[40ch] leading-7 opacity-70">{t("aud.codersD")}</p>
              <pre dir="ltr" className="mt-auto overflow-hidden rounded-xl border border-bg/10 bg-bg/5 p-4 text-left font-mono text-xs leading-6 opacity-90">{`> Review this code for bugs, security
  and performance. Group by severity.
  Give a fixed version of the main function.

✓ 3 bugs · 1 security issue · 2 perf notes`}</pre>
              <Arrow className="absolute end-7 top-7 opacity-50 transition group-hover:opacity-100" />
            </Link>
          </Reveal>
          <Reveal delay={0.05} className="md:col-span-4">
            <Link href={`${lib}?level=beginner`} className="card card-hover group flex h-full flex-col gap-2 bg-accent-soft p-6">
              <Users className="size-6 text-accent" weight="duotone" />
              <h3 className="font-semibold">{t("aud.users")}</h3>
              <p className="text-sm leading-7 text-muted">{t("aud.usersD")}</p>
            </Link>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-2">
            <Link href={`${lib}?level=pro`} className="card card-hover dot-grid flex h-full flex-col gap-2 p-6">
              <Briefcase className="size-6 text-accent" weight="duotone" />
              <h3 className="font-semibold">{t("aud.pros")}</h3>
              <p className="text-sm leading-7 text-muted">{t("aud.prosD")}</p>
            </Link>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-2">
            <Link href={`${lib}?kind=system`} className="card card-hover flex h-full flex-col gap-2 p-6">
              <TreeStructure className="size-6 text-accent" weight="duotone" />
              <h3 className="font-semibold">{t("aud.skills")}</h3>
              <p className="text-sm leading-7 text-muted">{t("aud.skillsD")}</p>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ۴. تألیفی‌ها: ریل افقی با اسنپ */}
      <section className="space-y-8">
        <Reveal>
          <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight"><Sparkle className="size-6 text-accent" weight="fill" />{t("originals")}</h2>
          <p className="mt-2 max-w-[60ch] text-muted">{t("originalsNote")}</p>
        </Reveal>
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:thin]">
          {originals().map((i) => (
            <div key={i.id} className="w-[19rem] shrink-0 snap-start sm:w-[22rem]"><PromptCard item={i} locale={locale} labels={cardLabels} /></div>
          ))}
        </div>
      </section>

      {/* ۵. پرطرفدارها: فهرست رتبه‌دار دو‌ستونه */}
      <section className="space-y-8">
        <Reveal className="flex items-end gap-4">
          <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight"><Fire className="size-6 text-warn" weight="fill" />{t("trending")}</h2>
          <Link href={`${lib}?sort=trending`} className="ms-auto inline-flex items-center gap-1 text-sm text-muted hover:text-fg">{t("viewAll")} <Arrow /></Link>
        </Reveal>
        <ol className="grid gap-x-10 md:grid-cols-2">
          {top.map((i, n) => (
            <li key={i.id}>
              <Link href={`/${locale}/p/${encodeURIComponent(i.slug)}`} className="group flex items-center gap-5 border-b border-border py-4">
                <span className="w-8 font-mono text-2xl font-light text-muted/60 tabular-nums">{nf.format(n + 1)}</span>
                <span className="min-w-0 flex-1">
                  <span dir="auto" className="block truncate font-medium group-hover:text-accent">{pick(i.title, locale)}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted"><FieldIcon id={i.field} className="size-3.5" />{FIELDS.find((x) => x.id === i.field)?.names[locale]}</span>
                </span>
                <Arrow className="text-muted opacity-0 transition group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted">{t("trendingNote")}</p>
      </section>

      {/* ۶. حوزه‌ها: ابر آیکن‌دار */}
      <section className="space-y-8">
        <Reveal><h2 className="text-3xl font-bold tracking-tight">{t("fieldsTitle")}</h2></Reveal>
        <Reveal className="flex flex-wrap gap-3">
          {FIELDS.map((fd) => (
            <Link key={fd.id} href={`${lib}?field=${fd.id}`} className="group inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition hover:border-accent/50 active:scale-[0.98]">
              <span className="grid size-9 place-items-center rounded-xl bg-subtle text-accent transition group-hover:bg-accent group-hover:text-accent-fg"><FieldIcon id={fd.id} className="size-5" /></span>
              <span className="text-sm font-medium">{fd.names[locale]}</span>
              <span className="font-mono text-xs text-muted tabular-nums">{nf.format(s.fieldCounts[fd.id] ?? 0)}</span>
            </Link>
          ))}
        </Reveal>
      </section>

      {/* ۷. ربات‌ها: پنل تمام‌عرض */}
      <section id="bots" className="scroll-mt-24">
        <Reveal>
          <div className="card relative overflow-hidden p-8 sm:p-12">
            <div className="dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_left,#000,transparent_70%)]" aria-hidden />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
              <div className="space-y-4">
                <span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-fg"><ChatCircleDots className="size-6" weight="fill" /></span>
                <h2 className="text-3xl font-bold tracking-tight">{t("bots.title")}</h2>
                <p className="max-w-[48ch] leading-8 text-muted">{t("bots.desc")}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {(["telegram", "bale"] as const).map((b) =>
                    BOT_LINKS[b] ? (
                      <a key={b} href={BOT_LINKS[b]} target="_blank" rel="noopener noreferrer" className="btn-primary"><TelegramLogo className="size-4" weight="fill" />{t(`bots.${b}`)}</a>
                    ) : (
                      <span key={b} className="btn-ghost cursor-default text-muted"><TelegramLogo className="size-4" />{t(`bots.${b}`)} <span className="rounded-full bg-subtle px-2 text-xs">{t("bots.soon")}</span></span>
                    ),
                  )}
                </div>
              </div>
              <ul dir="ltr" className="space-y-2 font-mono text-sm">
                {["/trending", "/daily", "/fields", "/random", "instagram caption"].map((c, n) => (
                  <li key={c} className={`w-fit rounded-xl px-3 py-2 ${n % 2 ? "ms-auto bg-subtle" : "bg-accent-soft text-accent"}`}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ۸. قیمت‌گذاری */}
      <section id="pricing" className="scroll-mt-24 space-y-8">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight">{t("pricing.title")}</h2>
          <p className="mt-2 text-muted">{t("pricing.note")}</p>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { k: "lite", price: t("pricing.plans.lite"), desc: t("pricing.liteDesc") },
            { k: "plus", price: `${f(m.plus_monthly as number)}`, unit: t("pricing.monthly"), desc: t("pricing.plusDesc"), hl: true },
            { k: "lifetime", price: f(m.lifetime_founder as number), desc: t("pricing.lifetimeDesc", { cap: nf.format(pricing.lifetime_founder_cap) }) },
          ].map((p, n) => (
            <Reveal key={p.k} delay={n * 0.06}>
              <div className={`card flex h-full flex-col gap-4 p-7 ${p.hl ? "border-transparent bg-fg text-bg" : ""}`}>
                <h3 className={`text-sm ${p.hl ? "opacity-70" : "text-muted"}`}>{t(`pricing.plans.${p.k}`)}</h3>
                <p className="text-3xl font-bold tracking-tight">{p.price}<span className="text-base font-normal opacity-60">{p.unit}</span></p>
                <p className={`text-sm leading-7 ${p.hl ? "opacity-70" : "text-muted"}`}>{p.desc}</p>
                <Link href={p.hl ? `/${locale}/chat` : lib} className={`mt-auto ${p.hl ? "btn-accent" : "btn-ghost"}`}>{p.hl ? t("hero.cta") : t("lib.title")}</Link>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="text-sm text-muted">{t("guarantee")}</p>
      </section>

      {/* ۹. پرسش‌ها: آکاردئون */}
      <section className="mx-auto max-w-3xl space-y-6">
        <Reveal><h2 className="text-3xl font-bold tracking-tight">{t("faq.title")}</h2></Reveal>
        <div className="divide-y divide-border border-y border-border">
          {faq.map((x) => (
            <details key={x.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center gap-4 font-medium [&::-webkit-details-marker]:hidden">
                {x.q}
                <Plus className="ms-auto size-4 shrink-0 text-muted transition group-open:rotate-45" />
              </summary>
              <p className="mt-3 max-w-[65ch] leading-8 text-muted">{x.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
