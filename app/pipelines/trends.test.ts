import { test } from "node:test"
import assert from "node:assert/strict"
import { scoreTrends, canIngest, type Signal } from "./trends.ts"

const sig = (topic: string, source: string, o: Partial<Signal> = {}): Signal => ({
  topic, source, mentions: 100, growth: 3, commercialIntent: 0.8, competitorCoverage: 0.1, locale: "en", seenAt: "2026-10-08", ...o,
})

test("multi-source growing topic is authored; single-source is only watched", () => {
  const r = scoreTrends([sig("3d website prompts", "a.com"), sig("3d website prompts", "b.com"), sig("3d website prompts", "c.com"), sig("niche", "a.com")])
  assert.equal(r[0].topic, "3d website prompts")
  assert.equal(r[0].action, "author")
  assert.equal(r.find((x) => x.topic === "niche")!.action, "watch")
})

test("saturated declining topic is skipped", () => {
  const r = scoreTrends([sig("old", "a.com", { growth: 0.8, commercialIntent: 0.1, competitorCoverage: 0.95, mentions: 1 }), sig("old", "b.com", { growth: 0.8, commercialIntent: 0.1, competitorCoverage: 0.95, mentions: 1 })])
  assert.equal(r[0].action, "skip")
})

test("license allowlist rejects non-commercial and unknown", () => {
  assert.equal(canIngest("CC0-1.0"), true)
  assert.equal(canIngest("CC-BY-NC-4.0"), false)
  assert.equal(canIngest(""), false)
})
