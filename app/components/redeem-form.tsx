"use client"
import { useState } from "react"
import { Ticket } from "@phosphor-icons/react"

export function RedeemForm({ labels }: { labels: { redeem: string; redeemBtn: string; redeemOk: string; redeemBad: string } }) {
  const [code, setCode] = useState("")
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const r = await fetch("/api/redeem", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) })
    const j = (await r.json().catch(() => ({}))) as { credits?: number }
    setMsg(r.ok && j.credits ? { ok: true, text: labels.redeemOk.replace("{n}", String(j.credits)) } : { ok: false, text: labels.redeemBad })
    if (r.ok) { setCode(""); window.dispatchEvent(new Event("rasa:credits")) }
  }
  return (
    <form onSubmit={submit} className="card flex flex-wrap items-center gap-3 p-4">
      <Ticket className="size-5 text-accent" weight="duotone" />
      <label htmlFor="voucher" className="text-sm font-medium">{labels.redeem}</label>
      <input id="voucher" dir="ltr" value={code} onChange={(e) => setCode(e.target.value)} placeholder="RASA-XXXXXXXX"
        className="min-w-0 flex-1 rounded-xl border border-border bg-bg px-3 py-2 font-mono text-sm outline-none focus:border-accent" />
      <button className="btn-primary" disabled={!code.trim()}>{labels.redeemBtn}</button>
      {msg && <p className={`w-full text-sm ${msg.ok ? "text-accent" : "text-warn"}`}>{msg.text}</p>}
    </form>
  )
}
