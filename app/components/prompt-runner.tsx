"use client"
// پر کردن متغیرها → پرامپت نهایی → کپی / باز کردن در ابزار
import { useMemo, useState } from "react"
import { Check, Copy, ArrowSquareOut, Play } from "@phosphor-icons/react"

export function PromptRunner({
  body, variables, labels, chatHref,
}: {
  body: string
  variables: string[]
  labels: { fill: string; final: string; copy: string; copied: string; openIn: string; run: string }
  chatHref: string
}) {
  const [vals, setVals] = useState<Record<string, string>>({})
  const [ok, setOk] = useState(false)
  const finalText = useMemo(
    () => body.replace(/\{\{\s*([^{}\n]{1,40}?)\s*\}\}|\[([^\[\]\n]{1,30})\]/g, (m, a: string, b: string) => vals[(a ?? b).trim()]?.trim() || m),
    [body, vals],
  )
  const copy = async () => {
    try { await navigator.clipboard.writeText(finalText); setOk(true); setTimeout(() => setOk(false), 1500) } catch {}
  }
  const q = encodeURIComponent(finalText.slice(0, 6000))
  return (
    <div className="space-y-4">
      {variables.length > 0 && (
        <div className="card space-y-3 p-4">
          <h2 className="text-sm font-semibold">{labels.fill}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {variables.map((v) => (
              <label key={v} className="flex flex-col gap-1 text-xs text-muted">
                <span dir="auto">{v.replace(/_/g, " ")}</span>
                <input dir="auto" value={vals[v] ?? ""} onChange={(e) => setVals({ ...vals, [v]: e.target.value })}
                  className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10" />
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border bg-subtle px-4 py-2 text-xs text-muted">
          <span>{labels.final}</span>
          <button type="button" onClick={copy} className="btn-primary ms-auto px-3 py-1.5 text-xs">
            {ok ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {ok ? labels.copied : labels.copy}
          </button>
        </div>
        <pre dir="auto" className="max-h-[32rem] overflow-auto whitespace-pre-wrap p-5 font-sans text-[15px] leading-8">
          {finalText.split(/(\{\{[^{}\n]{1,40}?\}\}|\[[^\[\]\n]{1,30}\])/g).map((part, i) =>
            i % 2 === 1 ? <mark key={i} className="rounded-md bg-accent-soft px-1 text-accent">{part}</mark> : part,
          )}
        </pre>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <a href={chatHref} onClick={() => { try { sessionStorage.setItem("rasa:run", finalText) } catch {} }} className="btn-accent me-2">
          <Play className="size-4" weight="fill" /> {labels.run}
        </a>
        <span>{labels.openIn}:</span>
        <a className="chip" target="_blank" rel="noopener noreferrer" href={`https://chatgpt.com/?q=${q}`}>ChatGPT <ArrowSquareOut className="size-3" /></a>
        <a className="chip" target="_blank" rel="noopener noreferrer" href={`https://claude.ai/new?q=${q}`}>Claude <ArrowSquareOut className="size-3" /></a>
      </div>
    </div>
  )
}
