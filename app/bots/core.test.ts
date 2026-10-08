import { test } from "node:test"
import assert from "node:assert/strict"
import path from "node:path"
process.env.CATALOG_PATH = path.resolve("../content/catalog.json")
const { handleUpdate, MemoryStore, promptView } = await import("./core.ts")
const { originals, loadCatalog } = await import("../lib/catalog.ts")

const ctx = (platform: "telegram" | "bale" = "telegram") => ({ platform, store: new MemoryStore(), siteUrl: "https://example.ir", today: new Date("2026-10-08") })
const msg = (text: string, lang = "fa") => ({ update_id: 1, message: { message_id: 1, chat: { id: 7 }, from: { id: 7, language_code: lang }, text } })
const cb = (data: string) => ({ update_id: 2, callback_query: { id: "q", from: { id: 7 }, data, message: { message_id: 5, chat: { id: 7 } } } })
const bytes = (s: string) => Buffer.byteLength(s, "utf8")

test("/start greets with main menu in user's language", () => {
  const [a] = handleUpdate(msg("/start"), ctx())
  assert.equal(a.type, "send")
  assert.ok(a.type === "send" && a.text.includes("رسا") && a.reply && a.reply.length === 4)
  const [e] = handleUpdate(msg("/start", "en"), ctx())
  assert.ok(e.type === "send" && e.text.startsWith("Hi"))
})

test("free text searches; all callback_data fit 64 bytes", () => {
  const [a] = handleUpdate(msg("اینستاگرام"), ctx())
  assert.ok(a.type === "send" && a.inline && a.inline.length > 0)
  for (const row of a.type === "send" ? a.inline! : []) for (const b of row) if (b.callback_data) assert.ok(bytes(b.callback_data) <= 64, b.callback_data)
  const [n] = handleUpdate(msg("zzzzqqqxx"), ctx())
  assert.ok(n.type === "send" && !n.inline)
})

test("menu buttons work across languages; fields paginate via edit", () => {
  const [f] = handleUpdate(msg("🗂 حوزه‌ها"), ctx())
  assert.ok(f.type === "send" && f.inline!.flat().some((b) => b.callback_data === "f:coding:1"))
  const acts = handleUpdate(cb("f:coding:2"), ctx())
  assert.equal(acts[0].type, "answer")
  assert.ok(acts[1].type === "edit" && acts[1].text.includes("2"))
})

test("prompt view: telegram HTML escaped in <pre>, bale plain, length capped", () => {
  const item = originals()[0]
  const t = promptView(ctx("telegram"), "fa", item)
  assert.ok(t.html && t.text.includes("<pre>") && t.text.length <= 4096)
  const b = promptView(ctx("bale"), "fa", item)
  assert.ok(!b.html && !b.text.includes("<pre>"))
  const long = loadCatalog().reduce((x, y) => ((y.body.en?.length ?? 0) > (x.body.en?.length ?? 0) ? y : x))
  assert.ok(promptView(ctx(), "en", long).text.length <= 4096)
})

test("language switch persists and daily prompt is deterministic", () => {
  const c = ctx()
  handleUpdate(cb("l:ar"), c)
  const [a] = handleUpdate(msg("/help"), c)
  assert.ok(a.type === "send" && a.text.startsWith("مساعدة"))
  const d1 = handleUpdate(msg("/daily"), ctx())[0], d2 = handleUpdate(msg("/daily"), ctx())[0]
  assert.deepEqual(d1, d2)
})
