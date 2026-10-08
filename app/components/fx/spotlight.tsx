"use client"
// نورافکن زیر نشانگر: --x/--y مستقیماً روی DOM (بدون state و بدون رندر مجدد)
import { useRef } from "react"

export function Spotlight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div ref={ref} className={`spotlight ${className}`}
      onPointerMove={(e) => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        el.style.setProperty("--x", `${e.clientX - r.left}px`)
        el.style.setProperty("--y", `${e.clientY - r.top}px`)
      }}>
      {children}
    </div>
  )
}
