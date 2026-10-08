"use client"
import { useTheme } from "next-themes"
import { Moon, Sun } from "@phosphor-icons/react"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <button type="button" aria-label="Toggle theme" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="grid size-9 place-items-center rounded-xl text-muted transition hover:bg-subtle hover:text-fg">
      <Sun className="hidden size-[18px] dark:block" />
      <Moon className="size-[18px] dark:hidden" />
    </button>
  )
}
