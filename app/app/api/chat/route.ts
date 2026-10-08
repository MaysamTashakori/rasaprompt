// اجرای پرامپت در سایت با پخش زنده و کسر اعتبار بر اساس مصرف واقعی (یا تخمین)
import { creditStore, creditsFor, estimateTokens, tierOf, type TierId } from "@/lib/credits"
import { streamChat, type ChatMsg } from "@/lib/llm-stream"
import { getUid } from "@/lib/uid"
import models from "@/config/models.json"

const store = creditStore()
const hits = new Map<string, number[]>()
const SYSTEM = "You are Rasa Prompt's assistant. Follow the user's prompt carefully. Answer in the user's language (Persian by default). Refuse illegal, sexual, hateful or dangerous requests politely. Do not claim to be a specific vendor's product."
const BANNED = /\b(jailbreak|developer mode|ignore (?:all )?(?:previous )?instructions)\b/i

const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } })

export async function POST(req: Request) {
  const uid = await getUid()
  // نرخ‌محدودسازی ساده: حداکثر ۲۰ درخواست در دقیقه برای هر کاربر
  const now = Date.now()
  const h = (hits.get(uid) ?? []).filter((t) => now - t < 60_000)
  if (h.length >= 20) return json({ error: "rate" }, 429)
  hits.set(uid, [...h, now])

  const body = (await req.json().catch(() => null)) as { messages?: ChatMsg[]; tier?: TierId } | null
  const tier = tierOf(body?.tier ?? "economy")
  const msgs = (body?.messages ?? []).filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-12)
  if (!tier || !msgs.length) return json({ error: "bad_request" }, 400)
  const chars = msgs.reduce((n, m) => n + m.content.length, 0)
  if (chars > models.max_input_chars) return json({ error: "too_long" }, 413)
  if (BANNED.test(msgs.at(-1)!.content)) return json({ error: "policy" }, 400)
  const model = process.env[tier.env] ?? ""
  if (process.env.LLM_PROVIDER && process.env.LLM_PROVIDER !== "mock" && !model) return json({ error: "model_not_configured" }, 503)

  const acct = store.get(uid)
  const cap = acct.freeLeft + acct.paid
  // رده‌های غیررایگان فقط با اعتبار خریداری‌شده
  if (!tier.free && acct.paid <= 0) return json({ error: "paid_only" }, 402)
  const worst = creditsFor(tier.id, estimateTokens(chars) + tier.max_output)
  const maxOut = cap >= worst ? tier.max_output : Math.max(200, Math.floor(((cap / tier.credits_per_1k) * 1000 - estimateTokens(chars)) * 0.9))
  if (maxOut < 200 || cap < creditsFor(tier.id, estimateTokens(chars) + 200)) return json({ error: "no_credits" }, 402)

  const ac = new AbortController()
  req.signal.addEventListener("abort", () => ac.abort())
  const enc = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let out = ""
      try {
        const it = streamChat(model, [{ role: "system", content: SYSTEM }, ...msgs], maxOut, ac.signal)
        let r = await it.next()
        while (!r.done) { out += r.value; controller.enqueue(enc.encode(r.value)); r = await it.next() }
        const used = r.value.usageTokens ?? estimateTokens(chars + out.length)
        store.charge(uid, Math.min(creditsFor(tier.id, used), cap), `chat:${tier.id}:${used}t`)
      } catch (e) {
        if (out) store.charge(uid, Math.min(creditsFor(tier.id, estimateTokens(chars + out.length)), cap), `chat:${tier.id}:partial`)
        controller.enqueue(enc.encode(`\n\n⚠️ ${(e as Error).name === "AbortError" ? "stopped" : "error"}`))
      }
      controller.close()
    },
  })
  return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } })
}
