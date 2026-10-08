"use client"
import { useSyncExternalStore } from "react"
import { BookmarkSimple } from "@phosphor-icons/react"

// ذخیره‌ها فقط در مرورگر کاربر (localStorage)؛ بدون حساب کاربری
const KEY = "rasa:saved"
const listeners = new Set<() => void>()
let snapshot = "[]"

function read(): string {
  try { return localStorage.getItem(KEY) ?? "[]" } catch { return "[]" }
}
function subscribe(cb: () => void) {
  listeners.add(cb)
  const onStorage = (e: StorageEvent) => e.key === KEY && cb()
  window.addEventListener("storage", onStorage)
  return () => { listeners.delete(cb); window.removeEventListener("storage", onStorage) }
}
function getSnapshot() {
  const v = read()
  if (v !== snapshot) snapshot = v
  return snapshot
}
const getServerSnapshot = () => "[]"

export function useSaved(): string[] {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  try { return JSON.parse(raw) as string[] } catch { return [] }
}

function toggleSaved(slug: string) {
  const s = new Set<string>(JSON.parse(read()) as string[])
  if (s.has(slug)) s.delete(slug); else s.add(slug)
  try { localStorage.setItem(KEY, JSON.stringify([...s])) } catch {}
  listeners.forEach((l) => l())
}

export function SaveButton({ slug, label, done }: { slug: string; label: string; done: string }) {
  const on = useSaved().includes(slug)
  return (
    <button type="button" onClick={() => toggleSaved(slug)} aria-pressed={on} className="btn-ghost">
      <BookmarkSimple className={`size-4 ${on ? "text-accent" : ""}`} weight={on ? "fill" : "regular"} />
      {on ? done : label}
    </button>
  )
}
