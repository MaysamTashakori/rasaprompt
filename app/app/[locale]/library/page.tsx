import { getTranslations, setRequestLocale } from "next-intl/server"
import { prompts } from "@/data/prompts"
import { LibraryBrowser } from "@/components/library-browser"
import type { Locale } from "@/i18n/routing"

export default async function LibraryPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("")
  const items = prompts.map((p) => ({
    slug: p.slug,
    title: p.title[locale],
    summary: p.summary[locale],
    category: p.category,
    categoryLabel: t(`cat.${p.category}`),
    tierLabel: t(`tiers.${p.tier}`),
    badge: t("tested", { model: p.tested.model, date: p.tested.date }),
  }))
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("nav.library")}</h1>
      <LibraryBrowser items={items} locale={locale} labels={{ search: t("search"), all: t("all"), results: t("results"), empty: t("prompts404") }} />
    </div>
  )
}
