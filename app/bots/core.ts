// هسته‌ی مشترک ربات تلگرام و بله: ورودی = Update، خروجی = فهرست «اکشن» (بدون I/O → قابل تست)
import { loadCatalog, pick, query, trending, originals, hasLocale, stats, type Loc } from "../lib/catalog.ts"
import type { CatalogItem } from "../lib/catalog-types.ts"
import { FIELDS, LEVEL_NAMES } from "../lib/taxonomy.ts"
import { tr, type Key, S } from "./i18n.ts"

export type Platform = "telegram" | "bale"
export interface Button { text: string; callback_data?: string; url?: string }
export type Keyboard = Button[][]
export type Action =
  | { type: "send"; chat_id: number; text: string; html: boolean; inline?: Keyboard; reply?: string[][] }
  | { type: "edit"; chat_id: number; message_id: number; text: string; html: boolean; inline?: Keyboard }
  | { type: "answer"; callback_query_id: string; text?: string }

export interface Update {
  update_id: number
  message?: { message_id: number; chat: { id: number; type?: string }; from?: { id: number; language_code?: string }; text?: string }
  callback_query?: { id: string; from: { id: number }; data?: string; message?: { message_id: number; chat: { id: number } } }
}

export interface Store { getLocale(user: number): Loc | undefined; setLocale(user: number, l: Loc): void }
export class MemoryStore implements Store {
  private m = new Map<number, Loc>()
  getLocale(u: number) { return this.m.get(u) }
  setLocale(u: number, l: Loc) { this.m.set(u, l) }
}

export interface Ctx { platform: Platform; store: Store; siteUrl: string; today?: Date }

const PAGE = 8
const MAX_TEXT = 3800 // زیر سقف ۴۰۹۶ نویسه‌ی پیام
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

// شناسه‌ی عددی کوتاه برای callback_data (سقف ۶۴ بایت)
let idxOf: Map<string, number> | null = null
const indexOf = (i: CatalogItem) => {
  if (!idxOf) idxOf = new Map(loadCatalog().map((x, n) => [x.id, n]))
  return idxOf.get(i.id)!
}
const byIndex = (n: number) => loadCatalog()[n]

const mainMenu = (loc: Loc): string[][] => {
  const k = (x: Key) => tr(loc, x)
  return [[k("trending"), k("originals")], [k("fields"), k("search")], [k("random"), k("daily")], [k("lang"), k("help")]]
}

function localeFor(ctx: Ctx, user: number, hint?: string): Loc {
  const saved = ctx.store.getLocale(user)
  if (saved) return saved
  if (hint?.startsWith("ar")) return "ar"
  if (hint?.startsWith("en")) return "en"
  return "fa"
}

/** فهرست نتایج به‌صورت دکمه‌های inline + صفحه‌بندی */
function listView(loc: Loc, title: string, items: CatalogItem[], page: number, pages: number, cbPrefix: string): { text: string; inline: Keyboard } {
  const inline: Keyboard = items.map((i) => [{ text: `${i.original ? "✨ " : ""}${pick(i.title, loc)}`.slice(0, 60), callback_data: `p:${indexOf(i)}` }])
  const nav: Button[] = []
  if (page > 1) nav.push({ text: tr(loc, "prev"), callback_data: `${cbPrefix}:${page - 1}` })
  if (page < pages) nav.push({ text: tr(loc, "next"), callback_data: `${cbPrefix}:${page + 1}` })
  if (nav.length) inline.push(nav)
  return { text: pages > 1 ? `${title}\n${tr(loc, "page", { p: page, t: pages })}` : title, inline }
}

function paginate(list: CatalogItem[], page: number) {
  const pages = Math.max(1, Math.ceil(list.length / PAGE))
  const p = Math.min(Math.max(1, page), pages)
  return { items: list.slice((p - 1) * PAGE, p * PAGE), page: p, pages }
}

/** نمای کامل یک پرامپت؛ HTML برای تلگرام (بلوک pre = کپی با یک لمس)، متن ساده برای بله */
export function promptView(ctx: Ctx, loc: Loc, item: CatalogItem): { text: string; html: boolean; inline: Keyboard } {
  const html = ctx.platform === "telegram"
  const field = FIELDS.find((f) => f.id === item.field)
  const title = pick(item.title, loc)
  const desc = pick(item.description, loc)
  let body = pick(item.body, loc)
  const url = `${ctx.siteUrl}/${loc}/p/${encodeURIComponent(item.slug)}`
  const meta = `${field?.emoji ?? ""} ${field?.names[loc] ?? ""} · ${LEVEL_NAMES[item.level][loc]}${item.original ? ` · ${tr(loc, "original")}` : ""}`
  const foot = `${tr(loc, "source")}: ${item.source} · ${tr(loc, "license")}: ${item.license === "proprietary-own" ? "©" : item.license}`
  const careful = item.field === "health" || item.field === "legal" ? `\n${tr(loc, "careful")}` : ""
  const budget = MAX_TEXT - title.length - desc.length - meta.length - foot.length - 120
  if (body.length > budget) body = body.slice(0, budget) + "\n" + tr(loc, "truncated")
  const text = html
    ? `<b>${esc(title)}</b>\n${desc ? `<i>${esc(desc)}</i>\n` : ""}${esc(meta)}\n\n<pre>${esc(body)}</pre>${esc(careful)}\n\n<code>${esc(foot)}</code>`
    : `${title}\n${desc ? `${desc}\n` : ""}${meta}\n\n${body}${careful}\n\n${foot}`
  const site = ctx.siteUrl.startsWith("https://") ? [{ text: tr(loc, "site"), url }] : []
  return { text, html, inline: [[...site, { text: tr(loc, "more"), callback_data: `r:${item.field}` }]] }
}

function dailyItem(ctx: Ctx, loc: Loc): CatalogItem {
  // فقط مواردی که متن کامل به همین زبان دارند (کیفیت پست روز)
  const full = loadCatalog().filter((i) => i.body[loc])
  const pool = full.length ? full : loadCatalog().filter((i) => i.original || hasLocale(i, loc))
  const d = ctx.today ?? new Date()
  const day = Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86_400_000)
  return pool[day % pool.length]
}

function randomItem(loc: Loc, field?: string): CatalogItem {
  const pool = loadCatalog().filter((i) => (!field || i.field === field) && (i.original || hasLocale(i, loc)))
  const list = pool.length ? pool : loadCatalog()
  return list[Math.floor(Math.random() * list.length)]
}

const fieldsKeyboard = (loc: Loc): Keyboard => {
  const rows: Keyboard = []
  for (let i = 0; i < FIELDS.length; i += 2)
    rows.push(FIELDS.slice(i, i + 2).map((f) => ({ text: `${f.emoji} ${f.names[loc]}`, callback_data: `f:${f.id}:1` })))
  return rows
}

/** تطبیق متن دکمه‌ی منوی اصلی در هر سه زبان */
function menuKey(text: string): Key | null {
  for (const loc of Object.keys(S) as Loc[])
    for (const k of ["trending", "originals", "fields", "search", "random", "daily", "lang", "help"] as Key[])
      if (S[loc][k] === text) return k
  return null
}

export function handleUpdate(u: Update, ctx: Ctx): Action[] {
  if (u.callback_query) {
    const q = u.callback_query
    const loc = localeFor(ctx, q.from.id)
    const chat = q.message?.chat.id ?? q.from.id
    const mid = q.message?.message_id
    const data = q.data ?? ""
    const out: Action[] = [{ type: "answer", callback_query_id: q.id }]
    const show = (text: string, inline: Keyboard, asHtml = false): Action =>
      mid ? { type: "edit", chat_id: chat, message_id: mid, text, html: asHtml, inline } : { type: "send", chat_id: chat, text, html: asHtml, inline }
    const [kind, a, b] = data.split(":")
    if (kind === "p") {
      const item = byIndex(Number(a))
      if (item) { const v = promptView(ctx, loc, item); out.push({ type: "send", chat_id: chat, ...v }) }
    } else if (kind === "f") {
      const f = FIELDS.find((x) => x.id === a)
      const r = paginate(loadCatalog().filter((i) => i.field === a), Number(b) || 1)
      const v = listView(loc, `${f?.emoji ?? ""} ${f?.names[loc] ?? ""}`, r.items, r.page, r.pages, `f:${a}`)
      out.push(show(v.text, v.inline))
    } else if (kind === "t") {
      const r = paginate(trending(200, loc), Number(a) || 1)
      const v = listView(loc, tr(loc, "trending"), r.items, r.page, r.pages, "t")
      out.push(show(v.text, v.inline))
    } else if (kind === "o") {
      const r = paginate(originals(), Number(a) || 1)
      const v = listView(loc, tr(loc, "originals"), r.items, r.page, r.pages, "o")
      out.push(show(v.text, v.inline))
    } else if (kind === "s") {
      const term = decodeURIComponent(b ?? "")
      const all = query({ q: term, size: 10_000 }).items
      const r = paginate(all, Number(a) || 1)
      const v = listView(loc, tr(loc, "results", { q: term, n: all.length }), r.items, r.page, r.pages, `s`)
      // صفحه‌بندی جست‌وجو: عبارت در انتهای callback (در صورت جا شدن در ۶۴ بایت)
      v.inline = v.inline.map((row) => row.map((btn) => btn.callback_data?.startsWith("s:") ? { ...btn, callback_data: fit(`${btn.callback_data}:${encodeURIComponent(term)}`) } : btn))
      out.push(show(v.text, v.inline))
    } else if (kind === "r") {
      const v = promptView(ctx, loc, randomItem(loc, a))
      out.push({ type: "send", chat_id: chat, ...v })
    } else if (kind === "l" && (a === "fa" || a === "en" || a === "ar")) {
      ctx.store.setLocale(q.from.id, a)
      out.push({ type: "send", chat_id: chat, text: tr(a, "langSet"), html: false, reply: mainMenu(a) })
    }
    return out
  }

  const m = u.message
  if (!m?.text) return []
  const chat = m.chat.id
  const user = m.from?.id ?? chat
  const loc = localeFor(ctx, user, m.from?.language_code)
  const text = m.text.trim()
  const cmd = text.startsWith("/") ? text.slice(1).split(/[\s@]/)[0].toLowerCase() : null
  const key: Key | null = cmd ? (({ start: "help", trending: "trending", originals: "originals", fields: "fields", daily: "daily", random: "random", lang: "lang", help: "help", search: "search" }) as Record<string, Key>)[cmd] ?? null : menuKey(text)
  const send = (t: string, extra: Partial<Extract<Action, { type: "send" }>> = {}): Action => ({ type: "send", chat_id: chat, text: t, html: false, ...extra })

  if (cmd === "start") {
    const s = stats()
    return [send(tr(loc, "welcome", { n: s.total.toLocaleString(loc === "fa" ? "fa-IR" : "en-US"), f: FIELDS.length }), { reply: mainMenu(loc) })]
  }
  switch (key) {
    case "trending": { const r = paginate(trending(200, loc), 1); const v = listView(loc, tr(loc, "trending"), r.items, r.page, r.pages, "t"); return [send(v.text, { inline: v.inline })] }
    case "originals": { const r = paginate(originals(), 1); const v = listView(loc, tr(loc, "originals"), r.items, r.page, r.pages, "o"); return [send(v.text, { inline: v.inline })] }
    case "fields": return [send(tr(loc, "pickField"), { inline: fieldsKeyboard(loc) })]
    case "search": return [send(tr(loc, "askSearch"))]
    case "random": { const v = promptView(ctx, loc, randomItem(loc)); return [send(v.text, { html: v.html, inline: v.inline })] }
    case "daily": { const v = promptView(ctx, loc, dailyItem(ctx, loc)); return [send(`${tr(loc, "daily")}\n\n${v.text}`, { html: v.html, inline: v.inline })] }
    case "lang": return [send(tr(loc, "pickLang"), { inline: [[{ text: "فارسی", callback_data: "l:fa" }, { text: "English", callback_data: "l:en" }, { text: "العربية", callback_data: "l:ar" }]] })]
    case "help": return [send(tr(loc, "helpText"), { reply: mainMenu(loc) })]
  }
  if (cmd) return [send(tr(loc, "helpText"), { reply: mainMenu(loc) })]

  // متن آزاد = جست‌وجو
  const term = text.slice(0, 40)
  const all = query({ q: term, size: 10_000 }).items
  if (!all.length) return [send(tr(loc, "noResults"))]
  const r = paginate(all, 1)
  const v = listView(loc, tr(loc, "results", { q: term, n: all.length }), r.items, r.page, r.pages, "s")
  v.inline = v.inline.map((row) => row.map((b) => b.callback_data?.startsWith("s:") ? { ...b, callback_data: fit(`${b.callback_data}:${encodeURIComponent(term)}`) } : b))
  return [send(v.text, { inline: v.inline })]
}

/** callback_data حداکثر ۶۴ بایت؛ در غیر این صورت عبارت کوتاه می‌شود */
function fit(data: string): string {
  while (Buffer.byteLength(data, "utf8") > 64) {
    const i = data.lastIndexOf("%")
    data = i > 0 ? data.slice(0, i) : data.slice(0, -1)
  }
  return data
}
