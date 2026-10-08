import { test } from "node:test"
import assert from "node:assert/strict"
import path from "node:path"
process.env.CATALOG_PATH = path.resolve("../content/catalog.json")
const { handleAdmin } = await import("./admin.ts")
const { MemoryStore } = await import("./core.ts")
import type { AdminService } from "./admin-service.ts"

const calls: string[] = []
const svc: AdminService = {
  stats: () => ({ catalog: 10, fa: 5, originals: 2, users: 3, vouchers: { total: 0, used: 0, creditsSold: 0 } }),
  sources: () => ({ approved: [{ key: "x", name: "X", license: "MIT" }], pending: [{ key: "a/b", url: "u", license: "MIT", allowed: true, at: "" }] }),
  addSource: async (u) => (calls.push(`add:${u}`), { key: "a/b", url: u, license: "MIT", allowed: true, at: "" }),
  decideSource: (k, ok) => (calls.push(`decide:${k}:${ok}`), true),
  rebuildCatalog: async () => ({ ok: true, out: "ok" }),
  agents: () => [{ key: "trend-scout", name: "Trend-Scout", enabled: true, mission: "m" }],
  agentSpec: () => "# Trend-Scout",
  setAgent: (k, e) => (calls.push(`set:${k}:${e}`), true),
  noteAgent: (k, n) => (calls.push(`note:${k}:${n}`), true),
  enqueue: (a, t) => (calls.push(`run:${a}:${t}`), { id: "1", agent: a, task: t, at: "", status: "queued" }),
  queue: () => [],
  createVouchers: (c, n) => Array.from({ length: n }, (_, i) => `RASA-${c}-${i}`),
  studio: async () => ({ ok: true, dir: "/x", files: ["/x/slide-1.png", "/x/reel.mp4"], caption: "cap", out: "" }),
}
const ctx = { platform: "telegram" as const, store: new MemoryStore(), siteUrl: "" }
const admins = new Set([42])
const msg = (text: string, id = 42) => ({ update_id: 1, message: { message_id: 1, chat: { id }, from: { id }, text } })
const cb = (data: string, id = 42) => ({ update_id: 2, callback_query: { id: "q", from: { id }, data, message: { message_id: 3, chat: { id } } } })

test("non-admins are ignored entirely", async () => {
  assert.equal(await handleAdmin(msg("/admin", 7), ctx, svc, admins), null)
  assert.equal(await handleAdmin(cb("a:stats", 7), ctx, svc, admins), null)
})

test("admin panel, stats and source workflow", async () => {
  const p = await handleAdmin(msg("/admin"), ctx, svc, admins)
  assert.ok(p && p.actions[0].type === "send" && p.actions[0].inline)
  const s = await handleAdmin(cb("a:stats"), ctx, svc, admins)
  assert.ok(s!.actions.some((a) => a.type === "send" && a.text.includes("کاتالوگ: 10")))
  await handleAdmin(msg("/addsource https://github.com/a/b"), ctx, svc, admins)
  await handleAdmin(cb("a:ap:a/b"), ctx, svc, admins)
  assert.ok(calls.includes("add:https://github.com/a/b") && calls.includes("decide:a/b:true"))
})

test("agent management, queue and vouchers", async () => {
  await handleAdmin(msg("/agent_note trend-scout تمرکز روی اینستاگرام"), ctx, svc, admins)
  await handleAdmin(msg("/run trend-scout ترندهای هفته"), ctx, svc, admins)
  await handleAdmin(cb("a:off:trend-scout"), ctx, svc, admins)
  assert.ok(calls.includes("note:trend-scout:تمرکز روی اینستاگرام") && calls.includes("run:trend-scout:ترندهای هفته") && calls.includes("set:trend-scout:false"))
  const v = await handleAdmin(msg("/voucher 600 3"), ctx, svc, admins)
  assert.ok(v!.actions[0].type === "send" && v!.actions[0].text.includes("RASA-600-2"))
})

test("broadcast requires confirmation", async () => {
  const r = await handleAdmin(msg("/broadcast سلام همه"), ctx, svc, admins)
  assert.ok(!r!.broadcast)
  const id = r!.actions[0].type === "send" ? r!.actions[0].inline![0][0].callback_data!.split(":")[2] : ""
  const c = await handleAdmin(cb(`a:bc:${id}`), ctx, svc, admins)
  assert.equal(c!.broadcast?.text, "سلام همه")
  const again = await handleAdmin(cb(`a:bc:${id}`), ctx, svc, admins)
  assert.ok(!again!.broadcast)
})

test("studio returns files for admin review", async () => {
  const r = await handleAdmin(cb("a:studio"), ctx, svc, admins)
  assert.deepEqual(r!.files?.paths, ["/x/slide-1.png", "/x/reel.mp4"])
})
