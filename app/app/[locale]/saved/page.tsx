import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { SavedList } from "@/components/saved-list"
import type { Loc } from "@/lib/catalog"

export const metadata: Metadata = { robots: { index: false } }

export default async function Saved({ params }: { params: Promise<{ locale: Loc }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("")
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("savedTitle")}</h1>
      <SavedList locale={locale} empty={t("savedEmpty")} />
    </div>
  )
}
