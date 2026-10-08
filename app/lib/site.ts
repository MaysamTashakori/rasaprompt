import type { Locale } from "@/i18n/routing"

export const BOT_LINKS = {
  telegram: process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "",
  bale: process.env.NEXT_PUBLIC_BALE_BOT_URL || "",
}

export const POPULAR_SEARCHES: Record<Locale, string[]> = {
  fa: ["اینستاگرام", "رزومه", "ترجمه", "کد", "سئو", "مقاله"],
  en: ["instagram", "resume", "translate", "code review", "seo", "essay"],
  ar: ["ترجمة", "سيرة", "تسويق", "كود", "مقال", "تعليم"],
}

/** حوزه‌هایی که پاسخ آن‌ها نیازمند هشدار «جایگزین متخصص نیست» است */
export const CAREFUL_FIELDS = new Set(["health", "legal"])
