// اجرا: npx tsx scripts/import-sources.ts <دایرکتوری-کلون‌ها>   (کلون‌ها با content/fetch-sources.sh ساخته می‌شوند)
import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"
import { importPromptsChat, importShortcut, importFabricPattern } from "../pipelines/ingest/importers"
import type { SourcedPrompt } from "../pipelines/ingest/types"

const root = process.argv[2]
if (!root) throw new Error("usage: import-sources.ts <clones-dir>")
const out = path.resolve("../content/imported")
fs.mkdirSync(out, { recursive: true })
const commit = (d: string) => execFileSync("git", ["-C", d, "rev-parse", "HEAD"]).toString().trim()
const write = (name: string, rows: SourcedPrompt[]) => {
  fs.writeFileSync(path.join(out, name), rows.map((r) => JSON.stringify(r)).join("\n") + "\n")
  console.log(name, rows.length)
}

const pc = path.join(root, "f_awesome-chatgpt-prompts")
write("promptschat.en.jsonl", importPromptsChat(fs.readFileSync(path.join(pc, "prompts.csv"), "utf8"), commit(pc)))

const sc = path.join(root, "rockbenben_ChatGPT-Shortcut")
for (const l of ["ar", "en"] as const)
  write(`shortcut.${l}.jsonl`, importShortcut(fs.readFileSync(path.join(sc, `src/data/prompt_${l}.json`), "utf8"), l, commit(sc)))

const fb = path.join(root, "danielmiessler_fabric")
const pdir = path.join(fb, "data/patterns")
const fabric = fs.readdirSync(pdir)
  .filter((n) => fs.existsSync(path.join(pdir, n, "system.md")))
  .map((n) => importFabricPattern(n, fs.readFileSync(path.join(pdir, n, "system.md"), "utf8"), commit(fb)))
write("fabric.en.jsonl", fabric)
