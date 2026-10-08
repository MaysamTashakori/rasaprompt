import { ShieldCheck, FlaskConical } from "lucide-react"
import { getTranslations } from "next-intl/server"
import type { SeedPrompt } from "@/data/prompts"

export async function TestBadge({ tested, sample }: { tested: SeedPrompt["tested"]; sample?: boolean }) {
  const t = await getTranslations("")
  if (sample)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted">
        <FlaskConical className="size-3.5" aria-hidden />
        {t("sampleBadge")}
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-bg px-2.5 py-1 text-xs font-medium text-ok">
      <ShieldCheck className="size-3.5" aria-hidden />
      {t("tested", { model: tested.model, date: tested.date })} · {t("score", { score: tested.score })}
    </span>
  )
}
