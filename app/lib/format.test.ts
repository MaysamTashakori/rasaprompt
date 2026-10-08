import { test } from "node:test"
import assert from "node:assert/strict"
import { normalize } from "./format.ts"

test("normalize unifies Arabic/Persian letters and digits", () => {
  assert.equal(normalize("كتاب ي ١٢٣ ۴۵۶"), "کتاب ی 123 456")
  assert.equal(normalize("مَدْرَسَة"), "مدرسة")
})
