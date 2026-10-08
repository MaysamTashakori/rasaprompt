import { Search } from "lucide-react"

export function SearchBox({ locale, placeholder, button, defaultValue, big }: { locale: string; placeholder: string; button: string; defaultValue?: string; big?: boolean }) {
  return (
    <form action={`/${locale}/library`} role="search" className={`card flex items-center gap-2 p-1.5 ps-4 shadow-sm focus-within:border-accent ${big ? "text-base" : "text-sm"}`}>
      <Search className="size-5 shrink-0 text-muted" aria-hidden />
      <input name="q" defaultValue={defaultValue} placeholder={placeholder} aria-label={placeholder} className={`min-w-0 flex-1 bg-transparent outline-none ${big ? "py-3" : "py-2"}`} />
      <button className="btn-primary">{button}</button>
    </form>
  )
}
