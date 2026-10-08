import { test } from "node:test"
import assert from "node:assert/strict"
import { MockClient } from "./llm.ts"
import { localizePrompt, parseLocalized } from "./localize.ts"

test("parseLocalized extracts JSON and rejects junk", () => {
  assert.deepEqual(parseLocalized('x {"title":"a","body":"b"} y'), { title: "a", body: "b" })
  assert.equal(parseLocalized("nope"), null)
})

test("localize keeps placeholders and flags losses", async () => {
  const input = { title: "Translator", body: "Translate {{text}} politely and carefully for the reader.", target: "fa" as const }
  const good = new MockClient(() => JSON.stringify({ title: "مترجم", body: "متن {{text}} را مودبانه و با دقت برای خواننده ترجمه کن." }))
  assert.equal((await localizePrompt(good, "m", input)).warnings.length, 0)
  const bad = new MockClient(() => JSON.stringify({ title: "مترجم", body: "متن را مودبانه و با دقت برای خواننده ترجمه کن." }))
  assert.ok((await localizePrompt(bad, "m", input)).warnings.some((w) => w.includes("متغیر")))
})
