// مرحله‌ی ۴ پایپ‌لاین: بومی‌سازی فارسی (و عربی). مدل از env می‌آید؛ هیچ مدل ثابتی فرض نشده است
// (دسترسی به مدل‌ها بسته به موقعیت مالک متفاوت است — docs/13-iran-first-strategy.md).
import type { LlmClient } from "./llm"
import { ruleChecks, type Locale } from "./test-prompt.ts"

export interface LocalizeInput { title: string; body: string; target: Exclude<Locale, "en">; glossary?: Record<string, string> }
export interface LocalizeResult { title: string; body: string; warnings: string[]; costUsd: number }

const PLACEHOLDER = /\{\{\s*\w+\s*\}\}|\[[^\]\n]{1,40}\]/g

export function buildLocalizePrompt({ title, body, target, glossary = {} }: LocalizeInput) {
  const lang = target === "fa" ? "Persian (Farsi, Iranian conventions: ی/ک, half-space ‌, Persian digits in prose only)" : "Modern Standard Arabic"
  const gl = Object.entries(glossary).map(([k, v]) => `${k} => ${v}`).join("\n")
  return `Localize (do not translate literally) this AI prompt into ${lang}. Keep every placeholder like {{name}} or [topic] EXACTLY unchanged. Keep the instructions to the AI model clear and imperative. If the original asks the model to answer in English, change it to answer in the target language.
${gl ? `Glossary:\n${gl}\n` : ""}Reply ONLY with JSON: {"title": "...", "body": "..."}

TITLE: ${title}

BODY:
${body}`
}

export function parseLocalized(raw: string): { title: string; body: string } | null {
  const m = raw.match(/\{[\s\S]*\}/)
  if (!m) return null
  try {
    const j = JSON.parse(m[0]) as { title?: unknown; body?: unknown }
    return typeof j.title === "string" && typeof j.body === "string" ? { title: j.title, body: j.body } : null
  } catch {
    return null
  }
}

export async function localizePrompt(llm: LlmClient, model: string, input: LocalizeInput): Promise<LocalizeResult> {
  const { text, costUsd } = await llm.complete({ model, prompt: buildLocalizePrompt(input), maxTokens: 2000 })
  const out = parseLocalized(text)
  if (!out) throw new Error("خروجی بومی‌سازی قابل‌تجزیه نبود")
  const warnings: string[] = []
  const a = [...input.body.matchAll(PLACEHOLDER)].map((m) => m[0]).sort()
  const b = [...out.body.matchAll(PLACEHOLDER)].map((m) => m[0]).sort()
  if (a.join("|") !== b.join("|")) warnings.push("متغیرها/جایگزین‌ها حفظ نشده‌اند")
  // ruleChecks برای خروجی مدل است؛ اینجا جایگزین باقی‌مانده در بدنه‌ی پرامپت طبیعی است
  warnings.push(...ruleChecks(out.body, input.target).failures.filter((f) => !f.includes("جایگزین‌نشده")))
  return { ...out, warnings, costUsd }
}
