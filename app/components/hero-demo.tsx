"use client"
// پیش‌نمایش زنده‌ی واقعی: پر شدن متغیرها و اجرای پرامپت (چرخه‌ی خودکار با سه مثال)
import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Play, Sparkle } from "@phosphor-icons/react"

export function HeroDemo({ title, run, outLabel, vars, vals, outs }: { title: string; run: string; outLabel: string; vars: string[]; vals: string[][]; outs: string[] }) {
  const reduce = useReducedMotion()
  const [{ ex, tick }, setState] = useState({ ex: 0, tick: reduce ? 999 : 0 })

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setState((s) => (s.tick > 150 ? { ex: (s.ex + 1) % vals.length, tick: 0 } : { ex: s.ex, tick: s.tick + 1 })), 45)
    return () => clearInterval(id)
  }, [reduce, vals.length])

  // زمان‌بندی: تایپ متغیرها ← دکمه ← خروجی
  const typed = (i: number) => {
    const v = vals[ex][i]
    const start = i * 18
    return v.slice(0, Math.max(0, Math.min(v.length, tick - start)))
  }
  const running = tick > 60 && tick < 75
  const outN = Math.max(0, tick - 75) * 2
  const out = outs[ex].slice(0, reduce ? undefined : outN)

  return (
    <div className="card relative overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Sparkle className="size-4 text-accent" weight="fill" />
        <span className="text-sm font-medium">{title}</span>
        <span className="ms-auto flex gap-1.5" aria-hidden><i className="size-2.5 rounded-full bg-border" /><i className="size-2.5 rounded-full bg-border" /><i className="size-2.5 rounded-full bg-border" /></span>
      </div>
      <div className="space-y-3 p-4">
        {vars.map((v, i) => (
          <label key={v} className="block space-y-1">
            <span className="text-xs text-muted">{v}</span>
            <div className="flex h-10 items-center rounded-lg border border-border bg-bg px-3 text-sm">
              <span>{typed(i)}</span>
              {!reduce && tick >= i * 18 && tick < i * 18 + 20 && <span className="ms-0.5 h-4 w-px animate-[caret_1s_steps(1)_infinite] bg-fg" />}
            </div>
          </label>
        ))}
        <motion.div animate={running ? { scale: [1, 0.97, 1] } : {}} transition={{ duration: 0.4 }}
          className={`btn-accent w-full ${running ? "opacity-80" : ""}`}>
          <Play className="size-4" weight="fill" /> {run}
        </motion.div>
        <div className="min-h-24 rounded-xl bg-subtle p-3 text-sm leading-7">
          <span className="mb-1 block text-xs text-muted">{outLabel}</span>
          <AnimatePresence mode="wait">
            <motion.p key={ex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{out}</motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
