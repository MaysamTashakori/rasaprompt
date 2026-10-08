"use client"
// پر کردن متغیرها → پرامپت نهایی → کپی / باز کردن در ابزار
import { useMemo, useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"

export function PromptRunner({
  body, variables, labels,
}: {
  body: string
  variables: string[]
  labels: { fill: string; final: string; copy: string; copied: string; openIn: string }
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
                  className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-accent" />
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border bg-subtle px-4 py-2 text-xs text-muted">
          <span>{labels.final}</span>
          <button type="button" onClick={copy} className="ms-auto inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 font-medium text-accent-fg">
            {ok ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {ok ? labels.copied : labels.copy}
          </button>
        </div>
        <pre dir="auto" className="max-h-[28rem] overflow-auto whitespace-pre-wrap p-4 font-sans text-sm leading-7">{finalText}</pre>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span>{labels.openIn}:</span>
        <a className="chip" target="_blank" rel="noopener noreferrer" href={`https://chatgpt.com/?q=${q}`}>ChatGPT <ExternalLink className="size-3" /></a>
        <a className="chip" target="_blank" rel="noopener noreferrer" href={`https://claude.ai/new?q=${q}`}>Claude <ExternalLink className="size-3" /></a>
      </div>
    </div>
  )
}
