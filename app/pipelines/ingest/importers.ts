// واردکردن منابع مجاز → قالب یکسان با ردپای منبع/لایسنس (docs/10-content-sources.md)
import { parse } from "csv-parse/sync"
import type { SourcedPrompt } from "./types"

const slug = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 80)

/** f/awesome-chatgpt-prompts — prompts.csv (CC0-1.0) */
export function importPromptsChat(csv: string, commit: string): SourcedPrompt[] {
  const rows = parse(csv, { columns: true, skip_empty_lines: true, relax_quotes: true }) as Record<string, string>[]
  return rows
    .filter((r) => r.act?.trim() && r.prompt?.trim())
    .map((r, i) => ({
      id: `promptschat:${i + 1}:${slug(r.act)}`,
      source: "promptschat",
      license: "CC0-1.0",
      sourceUrl: "https://github.com/f/awesome-chatgpt-prompts",
      sourceCommit: commit,
      locale: "en",
      title: r.act.trim(),
      body: r.prompt.trim(),
      tags: [r.type, r.for_devs === "TRUE" ? "dev" : ""].filter(Boolean),
      contributor: r.contributor || undefined,
    }))
}

/** rockbenben/ChatGPT-Shortcut — prompt_<lang>.json (MIT). هر رکورد: {<lang>: {title,prompt,description,remark}, tags, id} */
export function importShortcut(json: string, lang: "ar" | "en", commit: string): SourcedPrompt[] {
  type Row = Record<string, unknown> & { id?: string; tags?: string[] | string; weight?: string | number; website?: string }
  const rows = JSON.parse(json) as Row[]
  const out: SourcedPrompt[] = []
  for (const r of rows) {
    const v = r[lang] as { title?: string; prompt?: string; description?: string; remark?: string } | undefined
    if (!v?.title || !v?.prompt) continue
    const tags = Array.isArray(r.tags) ? r.tags : [...String(r.tags ?? "").matchAll(/'([^']+)'/g)].map((m) => m[1])
    out.push({
      id: `shortcut-${lang}:${r.id}`,
      source: "shortcut",
      license: "MIT",
      sourceUrl: "https://github.com/rockbenben/ChatGPT-Shortcut",
      sourceCommit: commit,
      locale: lang,
      title: v.title,
      body: v.prompt,
      description: v.description,
      tags,
      popularity: Number(r.weight) || 0,
      sameAs: typeof r.website === "string" ? r.website : undefined,
    })
  }
  return out
}

/** danielmiessler/fabric — data/patterns/<name>/system.md (MIT) */
export function importFabricPattern(name: string, system: string, commit: string): SourcedPrompt {
  return {
    id: `fabric:${name}`,
    source: "fabric",
    license: "MIT",
    sourceUrl: `https://github.com/danielmiessler/fabric/tree/main/data/patterns/${name}`,
    sourceCommit: commit,
    locale: "en",
    title: name.replace(/_/g, " "),
    body: system.trim(),
    tags: ["pattern"],
  }
}
