import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { ChatApp, type ChatLabels } from "@/components/chat-app"
import { RedeemForm } from "@/components/redeem-form"
import { originals, pick, type Loc } from "@/lib/catalog"
import models from "@/config/models.json"

export const metadata: Metadata = { robots: { index: false } }

export default async function Chat({ params }: { params: Promise<{ locale: Loc }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("chat")
  const keys = ["placeholder", "send", "stop", "clear", "credits", "free", "paid", "perK", "paidOnly", "noCredits", "tooLong", "rate", "policy", "error", "notConfigured", "copy", "copied", "empty", "you", "ai"] as const
  const labels = Object.fromEntries(keys.map((k) => [k, t(k, { n: "{n}" })])) as ChatLabels
  const starters = originals().slice(0, 5).map((i) => ({ title: pick(i.title, locale), body: pick(i.body, locale) }))
  const nf = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US")
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-muted">{t("sub")}</p>
      </div>
      <ChatApp locale={locale} labels={labels} starters={starters} />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("packs")}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {models.credit_packs_irt.map((p) => (
            <div key={p.credits} className="card p-4">
              <p className="text-xl font-bold">{nf.format(p.credits)} <span className="text-sm font-normal text-muted">{t("credits")}</span></p>
              <p className="text-sm text-muted">{nf.format(p.price)} {locale === "fa" ? "تومان" : "IRT"}</p>
            </div>
          ))}
        </div>
        <RedeemForm labels={{ redeem: t("redeem"), redeemBtn: t("redeemBtn"), redeemOk: t("redeemOk", { n: "{n}" }), redeemBad: t("redeemBad") }} />
        <p className="text-xs text-muted">{t("buyVia")}</p>
      </section>
    </div>
  )
}
