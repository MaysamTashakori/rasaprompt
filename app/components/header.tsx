import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { locales, type Locale } from "@/i18n/routing"
import { ThemeToggle } from "./theme-toggle"

const LABEL: Record<Locale, string> = { fa: "فارسی", en: "English", ar: "العربية" }

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations("")
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href={`/${locale}`} className="font-semibold">{t("brand")}</Link>
        <nav className="flex gap-4 text-sm text-muted">
          <Link href={`/${locale}/library`} className="hover:text-fg">{t("nav.library")}</Link>
          <Link href={`/${locale}/archive`} className="hover:text-fg">{t("archive")}</Link>
          <Link href={`/${locale}#pricing`} className="hover:text-fg">{t("nav.pricing")}</Link>
        </nav>
        <div className="ms-auto flex items-center gap-2 text-sm">
          {locales.filter((l) => l !== locale).map((l) => (
            <Link key={l} href={`/${l}`} hrefLang={l} className="rounded-md px-2 py-1 text-muted hover:bg-card hover:text-fg">{LABEL[l]}</Link>
          ))}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
