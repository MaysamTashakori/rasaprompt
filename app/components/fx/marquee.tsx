// نوار پیمایشی پرطرفدارها (تنها marquee صفحه). توقف با hover؛ با کاهش حرکت، اسکرول دستی.
import Link from "next/link"

export function Marquee({ items }: { items: { href: string; label: string }[] }) {
  const row = (aria?: boolean) => (
    <ul className="flex shrink-0 gap-4" aria-hidden={aria}>
      {items.map((i, n) => (
        <li key={n}><Link href={i.href} tabIndex={aria ? -1 : undefined} className="chip whitespace-nowrap">{i.label}</Link></li>
      ))}
    </ul>
  )
  return (
    <div dir="ltr" className="group relative flex overflow-x-auto [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] [scrollbar-width:none] motion-safe:overflow-hidden">
      <div className="flex gap-4 motion-safe:animate-[marquee_60s_linear_infinite] group-hover:[animation-play-state:paused]">
        {row()}
        {row(true)}
      </div>
    </div>
  )
}
