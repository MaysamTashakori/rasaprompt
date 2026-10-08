// سرویس I/O پنل مدیریت (فایل‌ها، GitHub، بازسازی کاتالوگ). جدا از منطق ربات تا قابل تست باشد.
import fs from "node:fs"
import path from "node:path"
import { execFile } from "node:child_process"
import { loadCatalog, originals, reloadCatalog } from "../lib/catalog.ts"
import { canIngest } from "../pipelines/trends.ts"
import { fetchRepoLicense, parseGithubRepo } from "../lib/license-detect.ts"
import { VoucherStore } from "../lib/vouchers.ts"

export interface AgentInfo { key: string; name: string; enabled: boolean; mission: string }
export interface QueueItem { id: string; agent: string; task: string; at: string; status: "queued" | "done" | "failed" }
export interface PendingSource { key: string; url: string; license: string | null; allowed: boolean; at: string }

export interface AdminService {
  stats(): { catalog: number; fa: number; originals: number; users: number; vouchers: { total: number; used: number; creditsSold: number } }
  sources(): { approved: { key: string; name: string; license: string }[]; pending: PendingSource[] }
  addSource(url: string): Promise<PendingSource | { error: string }>
  decideSource(key: string, approve: boolean): boolean
  rebuildCatalog(): Promise<{ ok: boolean; out: string }>
  agents(): AgentInfo[]
  agentSpec(key: string): string | null
  setAgent(key: string, enabled: boolean): boolean
  noteAgent(key: string, note: string): boolean
  enqueue(agent: string, task: string): QueueItem | null
  queue(): QueueItem[]
  createVouchers(credits: number, count: number): string[]
  studio(): Promise<{ ok: boolean; dir?: string; files: string[]; caption?: string; out: string }>
}

const root = () => (fs.existsSync(path.join(process.cwd(), "content")) ? process.cwd() : path.resolve(process.cwd(), ".."))
const readJson = <T,>(p: string, d: T): T => { try { return JSON.parse(fs.readFileSync(p, "utf8")) as T } catch { return d } }
const writeJson = (p: string, v: unknown) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2)) }

export class FsAdminService implements AdminService {
  private usersCount: () => number
  constructor(usersCount: () => number = () => 0) { this.usersCount = usersCount }
  private p = (...x: string[]) => path.join(root(), ...x)

  stats() {
    const c = loadCatalog()
    return { catalog: c.length, fa: c.filter((i) => i.title.fa).length, originals: originals().length, users: this.usersCount(), vouchers: new VoucherStore().summary() }
  }
  sources() {
    const s = readJson<{ sources: { key: string; name: string; license_content: string }[] }>(this.p("content", "sources.json"), { sources: [] })
    return { approved: s.sources.map((x) => ({ key: x.key, name: x.name, license: x.license_content })), pending: readJson<PendingSource[]>(this.p("content", "sources-pending.json"), []) }
  }
  async addSource(url: string) {
    const gh = parseGithubRepo(url)
    if (!gh) return { error: "فقط آدرس مخزن GitHub پذیرفته می‌شود (https://github.com/owner/repo)" }
    const lic = await fetchRepoLicense(gh.owner, gh.repo)
    const spdx = lic?.spdx ?? null
    const item: PendingSource = { key: `${gh.owner}/${gh.repo}`, url: `https://github.com/${gh.owner}/${gh.repo}`, license: spdx, allowed: !!spdx && canIngest(spdx), at: new Date().toISOString() }
    const pending = readJson<PendingSource[]>(this.p("content", "sources-pending.json"), []).filter((x) => x.key !== item.key)
    writeJson(this.p("content", "sources-pending.json"), [...pending, item])
    return item
  }
  decideSource(key: string, approve: boolean) {
    const file = this.p("content", "sources-pending.json")
    const pending = readJson<PendingSource[]>(file, [])
    const item = pending.find((x) => x.key === key)
    if (!item || (approve && !item.allowed)) return false
    writeJson(file, pending.filter((x) => x.key !== key))
    if (approve) {
      // منبع تأییدشده به sources.json اضافه می‌شود؛ واردکننده‌ی اختصاصی را عامل Engineer می‌سازد (صف)
      const sf = this.p("content", "sources.json")
      const s = readJson<{ sources: Record<string, unknown>[] }>(sf, { sources: [] })
      s.sources.push({ key: key.replace("/", "_"), name: key, url: item.url, license_content: item.license, commit: "TBD", commit_date: "", files: "TBD", imported: 0, role: "در انتظار واردکننده", commercial_ok: true, note: `تأیید ادمین ${item.at}` })
      writeJson(sf, s)
      this.enqueue("source-curator", `واردکننده برای منبع جدید ${item.url} (${item.license}) بساز، commit را قفل کن و content/fetch-sources.sh را اجرا کن`)
    }
    return true
  }
  rebuildCatalog() {
    return new Promise<{ ok: boolean; out: string }>((resolve) => {
      execFile("npx", ["tsx", "scripts/build-catalog.ts"], { cwd: path.join(root(), "app"), timeout: 120_000 }, (err, stdout, stderr) => {
        reloadCatalog()
        resolve({ ok: !err, out: (stdout || stderr || String(err ?? "")).slice(0, 800) })
      })
    })
  }
  private state() { return readJson<Record<string, { enabled: boolean }>>(this.p("content", "agents-state.json"), {}) }
  agents() {
    const dir = this.p("agents")
    const st = this.state()
    return fs.readdirSync(dir).filter((f) => f.endsWith(".md") && f !== "README.md").sort().map((f) => {
      const key = f.replace(/\.md$/, "")
      const txt = fs.readFileSync(path.join(dir, f), "utf8")
      return { key, name: txt.match(/^#\s+(.+)$/m)?.[1] ?? key, enabled: st[key]?.enabled ?? true, mission: txt.match(/\*\*مأموریت:\*\*\s*(.+)/)?.[1] ?? "" }
    })
  }
  agentSpec(key: string) {
    const f = this.p("agents", `${path.basename(key)}.md`)
    return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null
  }
  setAgent(key: string, enabled: boolean) {
    if (!this.agentSpec(key)) return false
    const st = this.state()
    st[key] = { enabled }
    writeJson(this.p("content", "agents-state.json"), st)
    return true
  }
  noteAgent(key: string, note: string) {
    const f = this.p("agents", `${path.basename(key)}.md`)
    if (!fs.existsSync(f)) return false
    let txt = fs.readFileSync(f, "utf8")
    if (!txt.includes("## یادداشت‌های مالک")) txt += "\n## یادداشت‌های مالک\n"
    fs.writeFileSync(f, `${txt.trimEnd()}\n- ${new Date().toISOString().slice(0, 10)}: ${note.replace(/\n/g, " ")}\n`)
    return true
  }
  enqueue(agent: string, task: string) {
    if (!this.agentSpec(agent)) return null
    const file = this.p("content", "agent-queue.json")
    const q = readJson<QueueItem[]>(file, [])
    const item: QueueItem = { id: Math.random().toString(36).slice(2, 8), agent, task, at: new Date().toISOString(), status: "queued" }
    writeJson(file, [...q, item].slice(-500))
    return item
  }
  queue() { return readJson<QueueItem[]>(this.p("content", "agent-queue.json"), []) }
  createVouchers(credits: number, count: number) { return new VoucherStore().create(credits, count) }
  studio() {
    return new Promise<{ ok: boolean; dir?: string; files: string[]; caption?: string; out: string }>((resolve) => {
      execFile("npx", ["tsx", "scripts/studio.ts", "--daily"], { cwd: path.join(root(), "app"), timeout: 300_000 }, (err, stdout, stderr) => {
        const dir = stdout.match(/✓ (.+)/)?.[1]?.trim()
        if (err || !dir) return resolve({ ok: false, files: [], out: (stderr || String(err ?? "")).slice(0, 600) })
        const files = fs.readdirSync(dir).filter((f) => /\.(png|mp4|webm)$/.test(f)).sort().map((f) => path.join(dir, f))
        resolve({ ok: true, dir, files, caption: fs.readFileSync(path.join(dir, "caption.txt"), "utf8"), out: stdout.slice(0, 400) })
      })
    })
  }
}
