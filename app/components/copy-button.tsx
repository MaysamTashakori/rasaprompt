"use client"
import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
  const [ok, setOk] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setOk(true)
          setTimeout(() => setOk(false), 1500)
        } catch {}
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:border-accent"
    >
      {ok ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {ok ? done : label}
    </button>
  )
}
