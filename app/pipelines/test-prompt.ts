// مرحله‌ی ۳ پایپ‌لاین: تست چندمدلی (docs/05-automation-pipelines.md)
import type { LlmClient } from "./llm"

export type Locale = "fa" | "en" | "ar"
export interface PromptUnderTest { body: string; variables: string[]; sampleInputs: Record<string, string>[]; locale: Locale }
export interface ModelResult { model: string; score: number; pass: boolean; costUsd: number; failures: string[] }
export interface TestReport { rubricVersion: string; results: ModelResult[]; pass: boolean; score: number }

export const RUBRIC_VERSION = "r1"
export const PASS_SCORE = 75
const ARABIC_SCRIPT = /[؀-ۿ]/g

export function render(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => {
    if (!(k in vars)) throw new Error(`متغیر ${k} مقدار ندارد`)
    return vars[k]
  })
}

/** چک‌های قاعده‌ای (۰–۱۰۰)؛ خروجی: امتیاز + دلایل شکست. */
export function ruleChecks(output: string, locale: Locale): { score: number; failures: string[] } {
  const failures: string[] = []
  const text = output.trim()
  if (text.length < 20) failures.push("خروجی بسیار کوتاه")
  if (/\{\{.*?\}\}/.test(text)) failures.push("متغیر جایگزین‌نشده در خروجی")
  const letters = (text.match(/\p{L}/gu) ?? []).length || 1
  const arabicRatio = (text.match(ARABIC_SCRIPT) ?? []).length / letters
  if (locale === "en" && arabicRatio > 0.2) failures.push("خروجی انگلیسی باید لاتین باشد")
  if (locale !== "en" && arabicRatio < 0.5) failures.push("خروجی باید عمدتاً به خط فارسی/عربی باشد")
  return { score: Math.max(0, 100 - failures.length * 40), failures }
}

export function parseJudge(raw: string): number | null {
  const m = raw.match(/\{[^{}]*"score"\s*:\s*(\d{1,3})[^{}]*\}/)
  if (!m) return null
  const n = Number(m[1])
  return n >= 0 && n <= 100 ? n : null
}

export async function testPrompt(
  llm: LlmClient,
  p: PromptUnderTest,
  models: string[],
  judgeModel: string,
  runs = 3,
): Promise<TestReport> {
  const results: ModelResult[] = []
  for (const model of models) {
    let total = 0, n = 0, cost = 0
    const failures: string[] = []
    for (let i = 0; i < runs; i++) {
      const vars = p.sampleInputs[i % p.sampleInputs.length]
      const out = await llm.complete({ model, prompt: render(p.body, vars) })
      cost += out.costUsd
      const rules = ruleChecks(out.text, p.locale)
      failures.push(...rules.failures)
      const j = await llm.complete({
        model: judgeModel,
        maxTokens: 100,
        prompt: `Rate the response for relevance, accuracy, tone and usefulness from 0 to 100. Reply only with JSON {"score": N}.\n\nTask:\n${render(p.body, vars)}\n\nResponse:\n${out.text}`,
      })
      cost += j.costUsd
      const judged = parseJudge(j.text)
      if (judged === null) failures.push("پاسخ داور قابل‌تجزیه نبود")
      total += 0.4 * rules.score + 0.6 * (judged ?? 0)
      n++
    }
    const score = Math.round(total / n)
    results.push({ model, score, pass: score >= PASS_SCORE && failures.length === 0, costUsd: cost, failures: [...new Set(failures)] })
  }
  const score = Math.round(results.reduce((a, r) => a + r.score, 0) / results.length)
  return { rubricVersion: RUBRIC_VERSION, results, score, pass: results.every((r) => r.pass) }
}

/** مرحله‌ی ۹: تصمیم stale بودن بر اساس تست جدید در برابر قبلی. */
export function shouldMarkStale(prev: number | null, next: number, maxDrop = 10) {
  return next < PASS_SCORE || (prev !== null && prev - next > maxDrop)
}
