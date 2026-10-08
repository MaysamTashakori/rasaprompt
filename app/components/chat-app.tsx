"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowUp, Check, Copy, Coins, ArrowCounterClockwise, Stop } from "@phosphor-icons/react"
import { RichText } from "./rich-text"

type Msg = { role: "user" | "assistant"; content: string }
type Tier = { id: string; credits_per_1k: number; free: boolean; names: Record<string, string>; desc: Record<string, string> }
export type ChatLabels = Record<"placeholder" | "send" | "stop" | "clear" | "credits" | "free" | "paid" | "perK" | "paidOnly" | "noCredits" | "tooLong" | "rate" | "policy" | "error" | "notConfigured" | "copy" | "copied" | "empty" | "you" | "ai", string>

const ERR: Record<string, keyof ChatLabels> = { paid_only: "paidOnly", no_credits: "noCredits", too_long: "tooLong", rate: "rate", policy: "policy", model_not_configured: "notConfigured" }
export const RUN_KEY = "rasa:run"

function CopyBtn({ text, l }: { text: string; l: ChatLabels }) {
  const [ok, setOk] = useState(false)
  return (
    <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1200) } catch {} }}
      className="inline-flex items-center gap-1 text-xs text-muted hover:text-fg">
      {ok ? <Check className="size-3" /> : <Copy className="size-3" />}{ok ? l.copied : l.copy}
    </button>
  )
}

export function ChatApp({ locale, labels: l, starters }: { locale: string; labels: ChatLabels; starters: { title: string; body: string }[] }) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [tier, setTier] = useState("economy")
  const [tiers, setTiers] = useState<Tier[]>([])
  const [bal, setBal] = useState<{ free: number; paid: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const ac = useRef<AbortController | null>(null)
  const end = useRef<HTMLDivElement>(null)
  const nf = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US")

  const refresh = useCallback(() => {
    fetch("/api/credits").then((r) => r.json()).then((j: { free: number; paid: number; tiers: Tier[] }) => { setBal({ free: j.free, paid: j.paid }); setTiers(j.tiers) }).catch(() => {})
  }, [])

  useEffect(() => {
    refresh()
    // پرامپت ارسالی از صفحه‌ی پرامپت (sessionStorage، برای متن‌های طولانی)
    try {
      const pre = sessionStorage.getItem(RUN_KEY)
      if (pre) { sessionStorage.removeItem(RUN_KEY); queueMicrotask(() => setInput(pre)) }
    } catch {}
  }, [refresh])
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }) }, [msgs])

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    setErr("")
    const next: Msg[] = [...msgs, { role: "user", content: text }]
    setMsgs([...next, { role: "assistant", content: "" }])
    setInput("")
    setBusy(true)
    ac.current = new AbortController()
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next, tier }), signal: ac.current.signal })
      if (!res.ok || !res.body) {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        setErr(l[ERR[j.error ?? ""] ?? "error"])
        setMsgs(next.slice(0, -1)); setInput(text)
        return
      }
      const reader = res.body.getReader(), dec = new TextDecoder()
      let acc = ""
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        acc += dec.decode(value, { stream: true })
        setMsgs([...next, { role: "assistant", content: acc }])
      }
    } catch {
      /* توقف کاربر */
    } finally {
      setBusy(false); ac.current = null; refresh()
    }
  }

  return (
    <div className="card flex h-[calc(100dvh-14rem)] min-h-[32rem] flex-col overflow-hidden">
      {/* نوار بالا: رده‌ی مدل و اعتبار */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <div className="flex rounded-xl bg-subtle p-1 text-sm" role="radiogroup">
          {tiers.map((t) => (
            <button key={t.id} type="button" role="radio" aria-checked={tier === t.id} onClick={() => setTier(t.id)} title={t.desc[locale]}
              className={`rounded-lg px-3 py-1.5 transition ${tier === t.id ? "bg-card font-medium text-fg shadow-sm" : "text-muted hover:text-fg"}`}>
              {t.names[locale]} <span className="text-xs text-muted">· {l.perK.replace("{n}", nf.format(t.credits_per_1k))}</span>
            </button>
          ))}
        </div>
        {bal && (
          <span className="ms-auto inline-flex items-center gap-1.5 rounded-full bg-subtle px-3 py-1 text-xs text-muted">
            <Coins className="size-3.5 text-warn" weight="fill" /> {l.free}: {nf.format(bal.free)} · {l.paid}: {nf.format(bal.paid)}
          </span>
        )}
        <button type="button" onClick={() => { ac.current?.abort(); setMsgs([]); setErr("") }} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted hover:text-fg">
          <ArrowCounterClockwise className="size-3.5" /> {l.clear}
        </button>
      </div>

      {/* پیام‌ها */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {msgs.length === 0 && (
          <div className="mx-auto max-w-xl space-y-3 py-6 text-center">
            <p className="text-sm text-muted">{l.empty}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {starters.map((s) => <button key={s.title} type="button" onClick={() => setInput(s.body)} className="chip">{s.title}</button>)}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[85%] space-y-1 rounded-2xl px-4 py-3 text-sm leading-7 ${m.role === "user" ? "bg-accent text-accent-fg" : "border border-border bg-bg"}`}>
              {m.role === "assistant" && !m.content ? <span className="inline-flex gap-1"><span className="size-1.5 animate-bounce rounded-full bg-muted" /><span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:120ms]" /><span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:240ms]" /></span> : <RichText text={m.content} />}
              {m.role === "assistant" && m.content && !busy && <div className="pt-1"><CopyBtn text={m.content} l={l} /></div>}
            </div>
          </div>
        ))}
        <div ref={end} />
      </div>

      {err && <p className="mx-3 mb-2 rounded-lg bg-warn-bg px-3 py-2 text-sm text-warn">{err}</p>}

      {/* ورودی */}
      <form onSubmit={(e) => { e.preventDefault(); void send() }} className="flex items-end gap-2 border-t border-border p-3">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={Math.min(8, Math.max(1, input.split("\n").length))} dir="auto"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send() } }}
          placeholder={l.placeholder} className="max-h-60 min-h-11 flex-1 resize-none rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent" />
        {busy ? (
          <button type="button" onClick={() => ac.current?.abort()} className="btn-ghost size-11 p-0" aria-label={l.stop}><Stop className="size-4" weight="fill" /></button>
        ) : (
          <button type="submit" disabled={!input.trim()} className="btn-primary size-11 p-0 disabled:opacity-40" aria-label={l.send}><ArrowUp className="size-5" weight="bold" /></button>
        )}
      </form>
    </div>
  )
}
