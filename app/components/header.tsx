import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { locales, type Locale } from "@/i18n/routing"
import { ThemeToggle } from "./theme-toggle"

const LABEL: Record<Locale, string> = { fa: "فا", en: "EN", ar: "ع" }

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations("")
  const nav = [
    ["library", `/${locale}/library`],
    ["bots", `/${locale}#bots`],
    ["pricing", `/${locale}#pricing`],
    ["saved", `/${locale}/saved`],
  ] as const
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-bold">
          <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-sm text-white">ر</span>
          <span>{t("brand")}</span>
        </Link>
        <nav className="hidden gap-5 text-sm text-muted md:flex">
          {nav.map(([k, href]) => <Link key={k} href={href} className="transition hover:text-fg">{t(`nav.${k}`)}</Link>)}
        </nav>
        <div className="ms-auto flex items-center gap-1 text-sm">
          {locales.map((l) => (
            <Link key={l} href={`/${l}`} hrefLang={l} aria-current={l === locale ? "true" : undefined}
              className={`rounded-lg px-2 py-1 ${l === locale ? "bg-subtle text-fg" : "text-muted hover:text-fg"}`}>{LABEL[l]}</Link>
          ))}
          <ThemeToggle />
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-border/60 px-4 py-2 text-sm text-muted md:hidden">
        {nav.map(([k, href]) => <Link key={k} href={href} className="shrink-0 hover:text-fg">{t(`nav.${k}`)}</Link>)}
      </nav>
    </header>
  )
}
