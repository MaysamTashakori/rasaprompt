"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useSaved } from "./save-button"

type Item = { slug: string; title: string; description: string }

export function SavedList({ locale, empty }: { locale: string; empty: string }) {
  const slugs = useSaved()
  const key = slugs.join(",")
  const [data, setData] = useState<{ key: string; items: Item[] } | null>(null)
  useEffect(() => {
    if (!key) return
    let alive = true
    fetch(`/api/prompts?locale=${locale}&slugs=${key.split(",").map(encodeURIComponent).join(",")}`)
      .then((r) => r.json())
      .then((j: { items: Item[] }) => alive && setData({ key, items: j.items }))
      .catch(() => alive && setData({ key, items: [] }))
    return () => { alive = false }
  }, [key, locale])
  if (!key) return <p className="card p-10 text-center text-muted">{empty}</p>
  if (!data || data.key !== key) return <div className="h-24 animate-pulse rounded-2xl bg-subtle" />
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.items.map((i) => (
        <Link key={i.slug} href={`/${locale}/p/${encodeURIComponent(i.slug)}`} className="card card-hover space-y-2 p-5">
          <h3 dir="auto" className="font-semibold">{i.title}</h3>
          <p dir="auto" className="line-clamp-2 text-sm text-muted">{i.description}</p>
        </Link>
      ))}
    </div>
  )
}
