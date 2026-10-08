import type { Locale } from "@/i18n/routing"

const NUM: Record<Locale, string> = { fa: "fa-IR", en: "en-US", ar: "ar-u-nu-latn" }

export function formatPrice(locale: Locale, amount: number, currency: "USD" | "IRT") {
  const n = new Intl.NumberFormat(NUM[locale], { maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount)
  if (currency === "IRT") return locale === "fa" ? `${n} تومان` : `${n} Toman`
  return locale === "en" ? `$${n}` : locale === "ar" ? `${n} $` : `${n} دلار`
}

/** نرمال‌سازی جست‌وجو: ي→ی، ك→ک، حذف اِعراب/کشیده، ارقام فارسی/عربی→لاتین */
export function normalize(s: string) {
  return s
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .toLowerCase()
    .trim()
}
