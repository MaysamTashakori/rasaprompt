import { test } from "node:test"
import assert from "node:assert/strict"
import { importPromptsChat, importShortcut, importFabricPattern } from "./importers.ts"

test("promptschat csv with quotes and commas", () => {
  const csv = 'act,prompt,for_devs,type,contributor\nTranslator,"I want you to translate, politely.",FALSE,TEXT,bob\n,empty,FALSE,TEXT,x\n'
  const r = importPromptsChat(csv, "abc")
  assert.equal(r.length, 1)
  assert.equal(r[0].license, "CC0-1.0")
  assert.equal(r[0].body, "I want you to translate, politely.")
})

test("shortcut json object", () => {
  const json = JSON.stringify([{ ar: { title: "مترجم", prompt: "أريد منك أن تترجم", description: "x" }, tags: ["language"], id: "1" }])
  const r = importShortcut(json, "ar", "abc")
  assert.equal(r[0].title, "مترجم")
  assert.equal(r[0].body, "أريد منك أن تترجم")
  assert.deepEqual(r[0].tags, ["language"])
})

test("fabric pattern keeps provenance", () => {
  const p = importFabricPattern("extract_wisdom", "# IDENTITY\nYou are…", "abc")
  assert.equal(p.id, "fabric:extract_wisdom")
  assert.equal(p.sourceCommit, "abc")
})
