import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr"

export function SearchBox({ locale, placeholder, button, defaultValue, big }: { locale: string; placeholder: string; button: string; defaultValue?: string; big?: boolean }) {
  return (
    <form action={`/${locale}/library`} role="search" className={`card flex items-center gap-2 p-1.5 ps-4 transition focus-within:border-accent/60 ${big ? "text-base" : "text-sm"}`}>
      <MagnifyingGlass className="size-5 shrink-0 text-muted" aria-hidden />
      <input name="q" defaultValue={defaultValue} placeholder={placeholder} aria-label={placeholder} className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted ${big ? "py-2.5" : "py-1.5"}`} />
      <button className="btn-primary">{button}</button>
    </form>
  )
}
