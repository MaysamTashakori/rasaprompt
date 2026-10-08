// داده‌ی نمونه‌ی seed — نمره/مدل/تاریخ تست در این فایل ساختگی و فقط برای نمایش UI است، نه نتیجه‌ی واقعی — در تولید از پایگاه‌داده می‌آید (docs/04-data-model.md). متن‌ها نمونه‌اند، نه محصول نهایی.
import type { Locale } from "@/i18n/routing"

export type Tier = "lite" | "pro" | "elite"
export type L10n = Record<Locale, string>

export interface SeedPrompt {
  slug: string
  tier: Tier
  category: "clinic" | "realestate" | "hr" | "marketing" | "code"
  tested: { model: string; date: string; score: number }
  title: L10n
  summary: L10n
  sampleOutput: L10n
  variables: string[]
  /** داده‌ی نمونه: «تست‌شده» فقط نمایشی است و تست واقعی انجام نشده */
  sample: true
}

export const prompts: SeedPrompt[] = [
  {
    slug: "patient-followup-message",
    tier: "pro",
    category: "clinic",
    tested: { model: "Claude Sonnet", date: "2026-10-01", score: 92 },
    title: { fa: "پیام پیگیری بیمار پس از ویزیت", en: "Post-visit patient follow-up message", ar: "رسالة متابعة المريض بعد الزيارة" },
    summary: {
      fa: "پیام مودبانه و شخصی‌سازی‌شده برای پیگیری وضعیت بیمار و یادآوری نوبت بعدی.",
      en: "A polite, personalised message to check on a patient and remind them of the next appointment.",
      ar: "رسالة مهذبة ومخصصة للاطمئنان على المريض وتذكيره بالموعد القادم.",
    },
    sampleOutput: {
      fa: "سلام خانم احمدی، امیدواریم بعد از ویزیت دیروز حالتان بهتر باشد. نوبت بعدی شما …",
      en: "Hello Ms. Ahmadi, we hope you are feeling better after yesterday's visit. Your next appointment is …",
      ar: "مرحباً السيدة أحمدي، نأمل أن تكوني بخير بعد زيارة الأمس. موعدك القادم …",
    },
    sample: true,
    variables: ["patient_name", "visit_type", "next_date"],
  },
  {
    slug: "property-listing-description",
    tier: "pro",
    category: "realestate",
    tested: { model: "GPT", date: "2026-10-01", score: 90 },
    title: { fa: "توضیح آگهی ملک جذاب", en: "Compelling property listing description", ar: "وصف إعلان عقاري جذاب" },
    summary: {
      fa: "از مشخصات ملک یک متن آگهی دقیق و جذاب بسازید.",
      en: "Turn raw property details into an accurate, engaging listing.",
      ar: "حوّل تفاصيل العقار إلى إعلان دقيق وجذاب.",
    },
    sampleOutput: {
      fa: "آپارتمان ۱۲۰ متری نورگیر با پارکینگ و انباری، قدم تا مترو …",
      en: "Bright 120 sqm apartment with parking and storage, steps from the metro …",
      ar: "شقة مشمسة ١٢٠ م² مع موقف ومخزن، على بعد خطوات من المترو …",
    },
    sample: true,
    variables: ["area", "rooms", "neighbourhood", "price"],
  },
  {
    slug: "job-post-builder",
    tier: "lite",
    category: "hr",
    tested: { model: "Claude Sonnet", date: "2026-09-28", score: 88 },
    title: { fa: "ساخت آگهی استخدام", en: "Job post builder", ar: "منشئ إعلان التوظيف" },
    summary: {
      fa: "آگهی استخدام شفاف و بدون سوگیری از چند ورودی ساده.",
      en: "Clear, bias-aware job posts from a few simple inputs.",
      ar: "إعلانات توظيف واضحة وخالية من التحيز من مدخلات بسيطة.",
    },
    sampleOutput: {
      fa: "مهندس نرم‌افزار ارشد — دورکار …",
      en: "Senior Software Engineer — remote …",
      ar: "مهندس برمجيات أول — عن بُعد …",
    },
    sample: true,
    variables: ["role", "seniority", "salary_range"],
  },
  {
    slug: "seo-brief-writer",
    tier: "elite",
    category: "marketing",
    tested: { model: "Claude Opus", date: "2026-10-03", score: 95 },
    title: { fa: "بریف سئوی کامل مقاله", en: "Full SEO article brief", ar: "ملخص سيو كامل للمقال" },
    summary: {
      fa: "زنجیره‌ی چندمرحله‌ای: هدف جست‌وجو، ساختار سرتیتر، سؤالات متداول و لینک‌سازی داخلی.",
      en: "Multi-step chain: search intent, heading structure, FAQs and internal linking.",
      ar: "سلسلة متعددة الخطوات: نية البحث، هيكل العناوين، الأسئلة الشائعة والربط الداخلي.",
    },
    sampleOutput: {
      fa: "هدف جست‌وجو: اطلاعاتی-تجاری. H1: …",
      en: "Search intent: informational-commercial. H1: …",
      ar: "نية البحث: معلوماتية-تجارية. H1: …",
    },
    sample: true,
    variables: ["keyword", "audience", "locale"],
  },
  {
    slug: "code-review-checklist",
    tier: "pro",
    category: "code",
    tested: { model: "Claude Sonnet", date: "2026-10-05", score: 91 },
    title: { fa: "بازبینی کد با چک‌لیست", en: "Code review with a checklist", ar: "مراجعة الكود بقائمة تحقق" },
    summary: {
      fa: "بازبینی ساختاریافته برای باگ، امنیت و خوانایی با خروجی قابل‌اجرا.",
      en: "Structured review for bugs, security and readability with actionable output.",
      ar: "مراجعة منظمة للأخطاء والأمان وقابلية القراءة بمخرجات قابلة للتنفيذ.",
    },
    sampleOutput: {
      fa: "۱. خطر تزریق SQL در خط ۴۲ …",
      en: "1. SQL injection risk at line 42 …",
      ar: "١. خطر حقن SQL في السطر 42 …",
    },
    sample: true,
    variables: ["language", "diff"],
  },
  {
    slug: "clinic-reminder-sms",
    tier: "lite",
    category: "clinic",
    tested: { model: "GPT", date: "2026-09-30", score: 86 },
    title: { fa: "پیامک یادآوری نوبت", en: "Appointment reminder SMS", ar: "رسالة تذكير بالموعد" },
    summary: {
      fa: "پیامک کوتاه و محترمانه برای کاهش غیبت بیماران.",
      en: "A short, courteous SMS to cut no-shows.",
      ar: "رسالة قصيرة ومهذبة لتقليل التغيب عن المواعيد.",
    },
    sampleOutput: {
      fa: "یادآوری: نوبت شما فردا ساعت ۱۰ است.",
      en: "Reminder: your appointment is tomorrow at 10:00.",
      ar: "تذكير: موعدك غداً الساعة 10:00.",
    },
    sample: true,
    variables: ["time"],
  },
]

export const getPrompt = (slug: string) => prompts.find((p) => p.slug === slug)
