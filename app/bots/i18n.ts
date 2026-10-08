import type { Loc } from "../lib/catalog.ts"

export const S = {
  fa: {
    welcome: "سلام! 👋 به ربات رسا پرامپت خوش آمدید.\nبیش از {n} پرامپت در {f} حوزه — برای کاربران، کدنویس‌ها و حرفه‌ای‌ها.\n\nهر کلمه‌ای بنویسید تا جست‌وجو کنم، یا از دکمه‌ها استفاده کنید.",
    trending: "🔥 پرطرفدارها", originals: "✨ تألیفی رسا", fields: "🗂 حوزه‌ها", search: "🔎 جست‌وجو", random: "🎲 تصادفی", daily: "📅 پرامپت روز", lang: "🌐 زبان", help: "ℹ️ راهنما",
    askSearch: "عبارت جست‌وجو را بنویسید (مثلاً: اینستاگرام، رزومه، کد).",
    pickField: "یک حوزه انتخاب کنید:", results: "نتیجه برای «{q}»: {n}", noResults: "چیزی پیدا نشد. کلمه‌ی دیگری امتحان کنید.",
    page: "صفحه {p} از {t}", prev: "◀️ قبلی", next: "بعدی ▶️", back: "↩️ بازگشت", more: "🎲 یکی دیگر", site: "🌐 مشاهده در سایت",
    source: "منبع", license: "لایسنس", original: "✨ تألیفی رسا", truncated: "… (متن کامل در سایت)",
    langSet: "زبان روی فارسی تنظیم شد.", pickLang: "زبان را انتخاب کنید:",
    helpText: "راهنما:\n• هر کلمه‌ای بنویسید = جست‌وجو\n• /trending پرطرفدارها\n• /fields حوزه‌ها\n• /daily پرامپت روز\n• /random پرامپت تصادفی\n• /lang تغییر زبان\n\nپرامپت را کپی کنید و در هوش مصنوعی دلخواهتان استفاده کنید. بخش‌هایی مثل {{موضوع}} را با اطلاعات خودتان جایگزین کنید.",
    careful: "⚠️ جایگزین مشاوره‌ی تخصصی نیست.",
  },
  en: {
    welcome: "Hi! 👋 Welcome to Rasa Prompt.\n{n}+ prompts across {f} fields — for everyday users, coders and pros.\n\nType any word to search, or use the buttons.",
    trending: "🔥 Trending", originals: "✨ Originals", fields: "🗂 Fields", search: "🔎 Search", random: "🎲 Random", daily: "📅 Prompt of the day", lang: "🌐 Language", help: "ℹ️ Help",
    askSearch: "Type what you're looking for (e.g. instagram, resume, code).",
    pickField: "Pick a field:", results: "Results for “{q}”: {n}", noResults: "Nothing found. Try another word.",
    page: "Page {p} of {t}", prev: "◀️ Prev", next: "Next ▶️", back: "↩️ Back", more: "🎲 Another", site: "🌐 Open on site",
    source: "Source", license: "License", original: "✨ Rasa original", truncated: "… (full text on the site)",
    langSet: "Language set to English.", pickLang: "Choose a language:",
    helpText: "Help:\n• Type anything = search\n• /trending\n• /fields\n• /daily\n• /random\n• /lang\n\nCopy a prompt into your AI tool and replace parts like {{topic}} with your own details.",
    careful: "⚠️ Not a substitute for professional advice.",
  },
  ar: {
    welcome: "مرحباً! 👋 أهلاً بك في رسا برومبت.\nأكثر من {n} برومبت في {f} مجالاً — للمستخدمين والمبرمجين والمحترفين.\n\nاكتب أي كلمة للبحث أو استخدم الأزرار.",
    trending: "🔥 الأكثر رواجاً", originals: "✨ من تأليف رسا", fields: "🗂 المجالات", search: "🔎 بحث", random: "🎲 عشوائي", daily: "📅 برومبت اليوم", lang: "🌐 اللغة", help: "ℹ️ مساعدة",
    askSearch: "اكتب ما تبحث عنه (مثلاً: تسويق، سيرة، كود).",
    pickField: "اختر مجالاً:", results: "نتائج «{q}»: {n}", noResults: "لا نتائج. جرّب كلمة أخرى.",
    page: "صفحة {p} من {t}", prev: "◀️ السابق", next: "التالي ▶️", back: "↩️ رجوع", more: "🎲 واحد آخر", site: "🌐 عرض في الموقع",
    source: "المصدر", license: "الترخيص", original: "✨ من تأليف رسا", truncated: "… (النص الكامل في الموقع)",
    langSet: "تم ضبط اللغة على العربية.", pickLang: "اختر اللغة:",
    helpText: "مساعدة:\n• اكتب أي شيء = بحث\n• /trending\n• /fields\n• /daily\n• /random\n• /lang\n\nانسخ البرومبت إلى أداة الذكاء الاصطناعي واستبدل أجزاء مثل {{الموضوع}} بمعلوماتك.",
    careful: "⚠️ لا يغني عن الاستشارة المتخصصة.",
  },
} satisfies Record<Loc, Record<string, string>>

export type Key = keyof (typeof S)["fa"]
export const tr = (loc: Loc, k: Key, vars: Record<string, string | number> = {}) =>
  S[loc][k].replace(/\{(\w+)\}/g, (m, v: string) => (v in vars ? String(vars[v]) : m))
