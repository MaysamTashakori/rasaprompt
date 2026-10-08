import type { Metadata } from "next"
import { Geist, Vazirmatn, Noto_Naskh_Arabic } from "next/font/google"
import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { dirOf, routing } from "@/i18n/routing"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import "../globals.css"

const latin = Geist({ subsets: ["latin"], variable: "--font-latin" })
const fa = Vazirmatn({ subsets: ["arabic", "latin"], variable: "--font-fa" })
const ar = Noto_Naskh_Arabic({ subsets: ["arabic"], variable: "--font-ar" })

export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }))

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "" })
  return {
    title: { default: t("brand"), template: `%s · ${t("brand")}` },
    description: t("subtitle"),
    alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])) },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("")
  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      suppressHydrationWarning
      className={`${latin.variable} ${fa.variable} ${ar.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <ThemeProvider>
          <NextIntlClientProvider>
            <Header locale={locale} />
            <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>
            <footer className="border-t border-border py-8 text-center text-sm text-muted">{t("footer")}</footer>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
