import { getTranslations, setRequestLocale } from "next-intl/server"
import fs from "node:fs"
import path from "node:path"
import type { Loc } from "@/lib/catalog"

export default async function Sources({ params }: { params: Promise<{ locale: Loc }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("")
  const sourcesFile = JSON.parse(fs.readFileSync(path.join(process.cwd(), "..", "content", "sources.json"), "utf8")) as { sources: { key: string; name: string; url: string; license_content: string; commit: string; commit_date: string }[] }
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">{t("sourcesTitle")}</h1>
      <p className="leading-8 text-muted">{t("sourcesIntro")}</p>
      <ul className="space-y-3">
        {sourcesFile.sources.map((s) => (
          <li key={s.key} className="card p-5">
            <a href={s.url} target="_blank" rel="noopener" className="font-semibold hover:text-accent" dir="ltr">{s.name}</a>
            <p className="mt-1 text-sm text-muted">{s.license_content} · commit <code dir="ltr">{s.commit.slice(0, 8)}</code> ({s.commit_date})</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
