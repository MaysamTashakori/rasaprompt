import { test } from "node:test"
import assert from "node:assert/strict"
import os from "node:os"
import path from "node:path"
import { FileCreditStore, creditsFor, estimateTokens } from "./credits.ts"

test("credits math", () => {
  assert.equal(creditsFor("economy", 10), 1)
  assert.equal(creditsFor("standard", 2500), 10)
  assert.equal(creditsFor("premium", 1000), 15)
  assert.equal(estimateTokens(300), 100)
})

test("free quota first, then paid; daily reset; no overdraft", () => {
  const s = new FileCreditStore(path.join(os.tmpdir(), `cr-${Date.now()}.json`))
  assert.equal(s.get("u", "2026-10-08").freeLeft, 30)
  assert.ok(s.charge("u", 25, "t", "2026-10-08"))
  assert.equal(s.charge("u", 10, "t", "2026-10-08"), false)
  s.grant("u", 100, "buy")
  assert.ok(s.charge("u", 10, "t", "2026-10-08"))
  const a = s.get("u", "2026-10-08")
  assert.equal(a.freeLeft, 0)
  assert.equal(a.paid, 95)
  assert.equal(s.get("u", "2026-10-09").freeLeft, 30)
})

test("paid-only tiers never touch free quota", () => {
  const s = new FileCreditStore(path.join(os.tmpdir(), `cr2-${Date.now()}.json`))
  assert.equal(s.charge("u", 5, "p", "2026-10-08", true), false)
  s.grant("u", 10, "buy")
  assert.ok(s.charge("u", 5, "p", "2026-10-08", true))
  assert.equal(s.get("u", "2026-10-08").freeLeft, 30)
  assert.equal(s.get("u", "2026-10-08").paid, 5)
})
