import { test } from "node:test"
import assert from "node:assert/strict"
import { MockClient } from "./llm.ts"
import { render, ruleChecks, parseJudge, testPrompt, shouldMarkStale } from "./test-prompt.ts"

test("render fills variables and rejects missing ones", () => {
  assert.equal(render("Hi {{name}}", { name: "Ali" }), "Hi Ali")
  assert.throws(() => render("Hi {{name}}", {}))
})

test("ruleChecks flags wrong script and leftover placeholders", () => {
  assert.equal(ruleChecks("این یک پاسخ فارسی و کامل برای نمونه است.", "fa").failures.length, 0)
  assert.ok(ruleChecks("This is English only text for the test run.", "fa").failures.length > 0)
  assert.ok(ruleChecks("Hello {{name}}, this is a long enough sentence.", "en").failures.length > 0)
})

test("parseJudge extracts score and rejects garbage", () => {
  assert.equal(parseJudge('{"score": 88}'), 88)
  assert.equal(parseJudge("no json"), null)
  assert.equal(parseJudge('{"score": 500}'), null)
})

test("testPrompt passes on good output and fails on bad", async () => {
  const p = { body: "Write a greeting for {{name}}", variables: ["name"], sampleInputs: [{ name: "Sara" }], locale: "en" as const }
  const good = new MockClient((r) => (r.maxTokens === 100 ? '{"score": 90}' : "Hello Sara, welcome aboard to our service today!"))
  const ok = await testPrompt(good, p, ["m1"], "judge", 2)
  assert.equal(ok.pass, true)
  const bad = new MockClient((r) => (r.maxTokens === 100 ? '{"score": 30}' : "Hello Sara, welcome aboard to our service today!"))
  assert.equal((await testPrompt(bad, p, ["m1"], "judge", 2)).pass, false)
})

test("shouldMarkStale triggers on low score or large drop", () => {
  assert.equal(shouldMarkStale(90, 85), false)
  assert.equal(shouldMarkStale(95, 80), true)
  assert.equal(shouldMarkStale(null, 60), true)
})
