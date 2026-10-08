"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { normalize } from "@/lib/format"

export interface Item { slug: string; title: string; summary: string; category: string; categoryLabel: string; tierLabel: string; badge: string }

export function LibraryBrowser({ items, locale, labels }: { items: Item[]; locale: string; labels: { search: string; all: string; results: string; empty: string } }) {
  const [q, setQ] = useState("")
  const [cat, setCat] = useState("all")
  const cats = useMemo(() => [...new Map(items.map((i) => [i.category, i.categoryLabel]))], [items])
  const shown = useMemo(() => {
    const nq = normalize(q)
    return items.filter((i) => (cat === "all" || i.category === cat) && (!nq || normalize(`${i.title} ${i.summary}`).includes(nq)))
  }, [items, q, cat])
  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={labels.search}
          className="w-full rounded-lg border border-border bg-card py-2.5 ps-9 pe-3 outline-none focus:border-accent"
        />
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        {[["all", labels.all], ...cats].map(([k, v]) => (
          <button key={k} onClick={() => setCat(k)} className={`rounded-full border px-3 py-1 ${cat === k ? "border-accent bg-accent text-accent-fg" : "border-border text-muted hover:text-fg"}`}>{v}</button>
        ))}
        <span className="ms-auto text-muted">{shown.length} {labels.results}</span>
      </div>
      {shown.length === 0 ? (
        <p className="py-10 text-center text-muted">{labels.empty}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((i) => (
            <Link key={i.slug} href={`/${locale}/prompts/${i.slug}`} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition hover:border-accent">
              <div className="flex items-center justify-between text-xs text-muted"><span>{i.categoryLabel}</span><span className="rounded-md border border-border px-2 py-0.5">{i.tierLabel}</span></div>
              <h3 className="font-semibold leading-snug">{i.title}</h3>
              <p className="line-clamp-2 text-sm text-muted">{i.summary}</p>
              <span className="mt-auto w-fit rounded-full bg-ok-bg px-2.5 py-1 text-xs font-medium text-ok">{i.badge}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
