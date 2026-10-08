import { test } from "node:test"
import assert from "node:assert/strict"
import { classifyField, classifyLevel, classifyKind, slugify } from "./taxonomy.ts"

test("classifyField prefers title signals", () => {
  assert.equal(classifyField("Python Interpreter", "Run code", []), "coding")
  assert.equal(classifyField("Resume Writer", "Write a resume and cover letter", []), "career")
  assert.equal(classifyField("SEO Keyword Planner", "marketing", []), "marketing")
  assert.equal(classifyField("Xyzzy", "nothing here", []), "productivity")
  assert.equal(classifyField("Kanban Board", "Build a kanban app with HTML, CSS and JavaScript", []), "coding")
  assert.equal(classifyField("Article Continued", "Continue the article", []), "writing")
})

test("classifyLevel by length/structure", () => {
  assert.equal(classifyLevel("Act as a poet."), "beginner")
  assert.equal(classifyLevel("# IDENTITY\n" + "x".repeat(600) + "\n- step"), "pro")
})

test("classifyKind", () => {
  assert.equal(classifyKind("fabric", "data", false, "x"), "system")
  assert.equal(classifyKind("promptschat", "writing", true, "x"), "code")
  assert.equal(classifyKind("promptschat", "writing", false, "You are a poet"), "system")
})

test("slugify keeps unicode letters", () => {
  assert.equal(slugify("English Translator & Improver!"), "english-translator-improver")
  assert.equal(slugify("مترجم انگلیسی"), "مترجم-انگلیسی")
})
