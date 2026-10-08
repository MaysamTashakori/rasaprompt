import Link from "next/link"
import { getTranslations } from "next-intl/server"
import type { SeedPrompt } from "@/data/prompts"
import type { Locale } from "@/i18n/routing"
import { TestBadge } from "./test-badge"

export async function PromptCard({ p, locale }: { p: SeedPrompt; locale: Locale }) {
  const t = await getTranslations("")
  return (
    <Link
      href={`/${locale}/prompts/${p.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition hover:border-accent"
    >
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{t(`cat.${p.category}`)}</span>
        <span className="rounded-md border border-border px-2 py-0.5">{t(`tiers.${p.tier}`)}</span>
      </div>
      <h3 className="font-semibold leading-snug group-hover:text-accent">{p.title[locale]}</h3>
      <p className="line-clamp-2 text-sm text-muted">{p.summary[locale]}</p>
      <div className="mt-auto"><TestBadge tested={p.tested} /></div>
    </Link>
  )
}
