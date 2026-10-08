// عامل Trend-Scout سیگنال‌ها را از وب جمع می‌کند (جست‌وجو/لیست‌های ترند)؛ این ماژول فقط امتیازدهی را انجام می‌دهد.
// قاعده: سیگنال = داده‌ی «موضوع»، نه متن پرامپت دیگران. متن را فقط Prompt-Author از صفر می‌نویسد.
export interface Signal {
  topic: string
  source: string          // دامنه یا نام منبع (برای تنوع)
  mentions: number        // حجم نسبی (تعداد نتیجه/ستاره/رأی)
  growth: number          // نسبت رشد دوره‌ی اخیر به قبلی (1 = ثابت)
  commercialIntent: number // 0..1 (کلمات خرید/ابزار/شغل)
  competitorCoverage: number // 0..1 (چند رقیب پوشش داده‌اند)
  locale: "fa" | "en" | "ar"
  seenAt: string
}
export interface TrendScore { topic: string; score: number; sources: number; action: "author" | "watch" | "skip" }

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))

export function scoreTrends(signals: Signal[], minSources = 2): TrendScore[] {
  const by = new Map<string, Signal[]>()
  for (const s of signals) by.set(s.topic.trim().toLowerCase(), [...(by.get(s.topic.trim().toLowerCase()) ?? []), s])
  const maxMentions = Math.max(1, ...signals.map((s) => s.mentions))
  const out: TrendScore[] = []
  for (const [topic, ss] of by) {
    const sources = new Set(ss.map((s) => s.source)).size
    const avg = (f: (s: Signal) => number) => ss.reduce((a, s) => a + f(s), 0) / ss.length
    const growth = clamp((avg((s) => s.growth) - 1) / 2)          // رشد ≥۳× = 1
    const volume = clamp(Math.log1p(avg((s) => s.mentions)) / Math.log1p(maxMentions))
    const intent = clamp(avg((s) => s.commercialIntent))
    const gap = 1 - clamp(avg((s) => s.competitorCoverage))
    const diversity = clamp((sources - 1) / 3)
    const score = Math.round(100 * (0.3 * growth + 0.2 * volume + 0.2 * intent + 0.15 * gap + 0.15 * diversity))
    const action = sources < minSources ? "watch" : score >= 55 ? "author" : score >= 35 ? "watch" : "skip"
    out.push({ topic, score, sources, action })
  }
  return out.sort((a, b) => b.score - a.score)
}

/** دروازه‌ی لایسنس برای واردکردن متن. */
const ALLOWED = new Set(["CC0-1.0", "MIT", "Apache-2.0", "BSD-3-Clause", "CC-BY-4.0", "proprietary-own"])
export const canIngest = (spdx: string) => ALLOWED.has(spdx)
