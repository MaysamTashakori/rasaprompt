import { test } from "node:test"
import assert from "node:assert/strict"
import path from "node:path"
process.env.CATALOG_PATH = path.resolve("../content/catalog.json")
const { query, getBySlug, variablesOf, trending, originals, pick } = await import("./catalog.ts")

test("catalog loads, queries and paginates", () => {
  const r = query({ size: 10 })
  assert.ok(r.total > 2000)
  assert.equal(r.items.length, 10)
  assert.ok(query({ field: "coding" }).items.every((i) => i.field === "coding"))
})

test("search works across Persian titles with Arabic letters", () => {
  const r = query({ q: "ويراستار" }) // ي عربی
  assert.ok(r.items.some((i) => i.id === "rasa:fa-editor"))
})

test("originals first, trending sorted, slug lookup", () => {
  assert.ok(originals().length >= 10)
  const t = trending(5)
  assert.ok(t[0].popularity! >= t[4].popularity!)
  const o = originals()[0]
  assert.equal(getBySlug(o.slug)?.id, o.id)
  assert.equal(pick({ en: "x" }, "fa"), "x")
})

test("variablesOf finds both placeholder styles", () => {
  assert.deepEqual(variablesOf("Hi {{نام}} about [TOPIC] and [1] and {{نام}}"), ["نام", "TOPIC"])
})
