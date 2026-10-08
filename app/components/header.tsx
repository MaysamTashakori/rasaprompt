import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { locales, type Locale } from "@/i18n/routing"
import { ThemeToggle } from "./theme-toggle"

const LABEL: Record<Locale, string> = { fa: "فا", en: "EN", ar: "ع" }

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations("")
  const nav = [
    ["library", `/${locale}/library`],
    ["chat", `/${locale}/chat`],
    ["bots", `/${locale}#bots`],
    ["pricing", `/${locale}#pricing`],
    ["saved", `/${locale}/saved`],
  ] as const
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-xl bg-fg text-[15px] font-bold text-bg">ر</span>
          <span>{t("brand")}</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {nav.map(([k, href]) => (
            <Link key={k} href={href} className="rounded-lg px-3 py-1.5 text-muted transition hover:bg-subtle hover:text-fg">{t(`nav.${k}`)}</Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-1 text-sm">
          <div className="flex rounded-xl bg-subtle p-0.5">
            {locales.map((l) => (
              <Link key={l} href={`/${l}`} hrefLang={l} aria-current={l === locale ? "true" : undefined}
                className={`rounded-lg px-2.5 py-1 text-xs transition ${l === locale ? "bg-card font-medium text-fg shadow-sm" : "text-muted hover:text-fg"}`}>{LABEL[l]}</Link>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2 text-sm md:hidden [scrollbar-width:none]">
        {nav.map(([k, href]) => <Link key={k} href={href} className="shrink-0 rounded-lg px-3 py-1.5 text-muted hover:bg-subtle hover:text-fg">{t(`nav.${k}`)}</Link>)}
      </nav>
    </header>
  )
}
