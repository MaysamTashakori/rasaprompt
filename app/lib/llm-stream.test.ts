import { test } from "node:test"
import assert from "node:assert/strict"
import { parseSseLines } from "./llm-stream.ts"

test("parses SSE deltas, usage, keeps partial line", () => {
  const buf = 'data: {"choices":[{"delta":{"content":"سلام"}}]}\n\ndata: {"choices":[],"usage":{"total_tokens":42}}\ndata: [DONE]\ndata: {"choi'
  const { events, rest } = parseSseLines(buf)
  assert.deepEqual(events, [{ delta: "سلام" }, { usage: 42 }])
  assert.equal(rest, 'data: {"choi')
})
