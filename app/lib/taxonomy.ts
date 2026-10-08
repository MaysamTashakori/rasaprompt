// طبقه‌بندی چندمحوره (docs/04): حوزه × نوع × سطح. قواعد قطعی و آفلاین؛ عامل‌ها بعداً با LLM دقیق‌ترش می‌کنند.
import type { Locale } from "@/i18n/routing"

export type Level = "beginner" | "pro"
export type Kind = "prompt" | "code" | "system" | "skill"

export interface Field { id: string; emoji: string; names: Record<Locale, string>; keywords: string[]; weight?: number }

export const FIELDS: Field[] = [
  { id: "coding", emoji: "💻", names: { fa: "برنامه‌نویسی", en: "Coding", ar: "البرمجة" },
    keywords: ["code", "coding", "developer", "programming", "python", "javascript", "sql", "regex", "api", "debug", "software", "react", "linux", "terminal", "git", "devops", "algorithm", "smart contract", "frontend", "backend", "excel formula", "web developer", "shell"] },
  { id: "data", emoji: "📊", names: { fa: "داده و تحلیل", en: "Data & analysis", ar: "البيانات والتحليل" },
    keywords: ["data", "analyst", "analysis", "analyze", "statistic", "chart", "dashboard", "spreadsheet", "forecast", "metrics", "kpi", "research"] },
  { id: "marketing", emoji: "📣", names: { fa: "بازاریابی و سئو", en: "Marketing & SEO", ar: "التسويق والسيو" },
    keywords: ["seo", "marketing", "advert", "ad copy", "slogan", "brand", "campaign", "social media", "instagram", "tweet", "youtube", "tiktok", "keyword", "influencer", "newsletter", "linkedin", "copywrit", "headline"] },
  { id: "business", emoji: "🏢", names: { fa: "کسب‌وکار و مدیریت", en: "Business & management", ar: "الأعمال والإدارة" },
    keywords: ["business", "startup", "ceo", "manager", "strategy", "consultant", "product manager", "entrepreneur", "swot", "okr", "meeting", "proposal", "negotiat", "sales", "customer", "ecommerce", "e-commerce", "pitch", "investor"] },
  { id: "career", emoji: "🎯", names: { fa: "شغل و رزومه", en: "Career & hiring", ar: "الوظائف والسيرة" },
    keywords: ["resume", "cv ", "cover letter", "interview", "recruit", "job", "career", "hiring", "linkedin profile", "salary"] },
  { id: "education", emoji: "🎓", names: { fa: "آموزش و دانشجو", en: "Education & study", ar: "التعليم والدراسة" },
    keywords: ["teacher", "tutor", "student", "learn", "lesson", "exam", "quiz", "study", "course", "essay", "thesis", "academic", "school", "math", "science", "explain", "pedagog", "ielts", "toefl"] },
  { id: "writing", emoji: "✍️", names: { fa: "نویسندگی و محتوا", en: "Writing & content", ar: "الكتابة والمحتوى" },
    keywords: ["write", "writer", "writing", "story", "novel", "poem", "poet", "article", "blog", "essay", "script", "screenplay", "storyteller", "editor", "proofread", "rewrite", "paraphras", "summar", "text", "lyric", "journalist", "grammar"], weight: 0.4 },
  { id: "design", emoji: "🎨", names: { fa: "طراحی و خلاقیت", en: "Design & creativity", ar: "التصميم والإبداع" },
    keywords: ["design", "designer", "ui", "ux", "logo", "image", "midjourney", "dall", "art", "draw", "creative", "color", "photo", "video", "animation", "3d", "music", "composer", "midi"] },
  { id: "health", emoji: "🩺", names: { fa: "سلامت و روان", en: "Health & wellbeing", ar: "الصحة والعافية" },
    keywords: ["doctor", "health", "therapist", "psycholog", "mental", "diet", "nutrition", "fitness", "workout", "medical", "dentist", "sleep", "meditation", "yoga", "coach"] },
  { id: "legal", emoji: "⚖️", names: { fa: "حقوقی و مالی", en: "Legal & finance", ar: "القانون والمال" },
    keywords: ["legal", "lawyer", "contract", "law ", "tax", "account", "financial", "finance", "invest", "stock", "crypto", "bank", "budget", "insurance", "real estate", "accountant"] },
  { id: "language", emoji: "🌐", names: { fa: "زبان و ترجمه", en: "Language & translation", ar: "اللغات والترجمة" },
    keywords: ["translat", "language", "english", "spoken", "grammar", "pronunciation", "dictionary", "vocabulary", "interpreter", "arabic", "persian", "french", "spanish", "german", "chinese"] },
  { id: "productivity", emoji: "⚡", names: { fa: "بهره‌وری و ابزار", en: "Productivity & tools", ar: "الإنتاجية والأدوات" },
    keywords: ["productiv", "plan", "schedule", "todo", "task", "organiz", "habit", "workflow", "automation", "notion", "checklist", "time management", "email", "prompt generator", "prompt engineer"], weight: 0.6 },
  { id: "security", emoji: "🛡️", names: { fa: "امنیت", en: "Security", ar: "الأمن" },
    keywords: ["security", "cyber", "malware", "threat", "pentest", "vulnerab", "phishing", "password", "incident", "forensic"] },
  { id: "fun", emoji: "🎭", names: { fa: "سرگرمی و بازی", en: "Fun & games", ar: "ترفيه وألعاب" },
    keywords: ["game", "joke", "comedian", "fun", "riddle", "role", "character", "trivia", "magician", "fortune", "movie", "film", "chef", "cook", "recipe", "travel", "tour guide", "dungeon"] },
  { id: "life", emoji: "🌿", names: { fa: "زندگی روزمره", en: "Everyday life", ar: "الحياة اليومية" },
    keywords: ["life", "relationship", "advice", "gift", "fashion", "home", "garden", "pet", "parent", "family", "wedding", "personal"] },
]

export const KIND_NAMES: Record<Kind, Record<Locale, string>> = {
  prompt: { fa: "پرامپت", en: "Prompt", ar: "برومبت" },
  code: { fa: "کدنویسی", en: "Coding prompt", ar: "برومبت برمجة" },
  system: { fa: "پرامپت سیستمی / عامل", en: "System prompt / agent", ar: "برومبت نظام / وكيل" },
  skill: { fa: "Skill", en: "Skill", ar: "Skill" },
}
export const LEVEL_NAMES: Record<Level, Record<Locale, string>> = {
  beginner: { fa: "مبتدی", en: "Beginner", ar: "مبتدئ" },
  pro: { fa: "حرفه‌ای", en: "Pro", ar: "محترف" },
}

const sc = (text: string, kws: string[]) => kws.reduce((n, k) => n + (text.includes(k) ? 1 : 0), 0)

/** حوزه با بیشترین تطابق (عنوان وزن ۳×)؛ بدون تطابق → productivity. */
export function classifyField(title: string, body: string, tags: string[] = []): string {
  const t = title.toLowerCase(), b = body.slice(0, 600).toLowerCase(), g = tags.join(" ").toLowerCase()
  let best = "productivity", top = 0
  for (const f of FIELDS) {
    // حوزه‌های عام (نوشتن/بهره‌وری) وزن کمتر دارند تا حوزه‌ی تخصصی برنده شود
    const s = (f.weight ?? 1) * (3 * sc(t, f.keywords) + 2 * sc(g, f.keywords) + sc(b, f.keywords))
    if (s > top) { top = s; best = f.id }
  }
  return best
}

export function classifyLevel(body: string): Level {
  const structured = /(^|\n)\s*(#{1,3}\s|\d+[.)]\s|[-*]\s)/.test(body) && body.length > 500
  return body.length > 900 || structured ? "pro" : "beginner"
}

export function classifyKind(source: string, field: string, forDevs: boolean, body: string): Kind {
  if (source === "fabric") return "system"
  if (forDevs || field === "coding") return "code"
  if (/^you are\b|^# ?identity/i.test(body.trim())) return "system"
  return "prompt"
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "prompt"
