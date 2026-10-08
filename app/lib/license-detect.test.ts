import { test } from "node:test"
import assert from "node:assert/strict"
import { detectSpdx, parseGithubRepo } from "./license-detect.ts"

test("detects common licenses", () => {
  assert.equal(detectSpdx("MIT License\n\nPermission is hereby granted, free of charge"), "MIT")
  assert.equal(detectSpdx("Apache License\n                           Version 2.0, January 2004"), "Apache-2.0")
  assert.equal(detectSpdx("Creative Commons Legal Code\n\nCC0 1.0 Universal"), "CC0-1.0")
  assert.equal(detectSpdx("Attribution-NonCommercial 4.0 International"), "CC-BY-NC-4.0")
  assert.equal(detectSpdx("all rights reserved"), null)
})

test("parses GitHub URLs", () => {
  assert.deepEqual(parseGithubRepo("https://github.com/f/awesome-chatgpt-prompts"), { owner: "f", repo: "awesome-chatgpt-prompts" })
  assert.deepEqual(parseGithubRepo("github.com/a/b.git"), { owner: "a", repo: "b" })
  assert.equal(parseGithubRepo("https://example.com/a/b"), null)
})
