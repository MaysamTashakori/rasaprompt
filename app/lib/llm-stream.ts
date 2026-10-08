// پخش زنده‌ی پاسخ مدل (SSE سازگار با OpenAI) + حالت mock برای توسعه‌ی محلی بدون کلید
export interface ChatMsg { role: "system" | "user" | "assistant"; content: string }
export interface StreamResult { usageTokens: number | null }

/** تجزیه‌ی خطوط SSE: «data: {...}» → متن delta و usage */
export function parseSseLines(buffer: string): { events: { delta?: string; usage?: number }[]; rest: string } {
  const lines = buffer.split("\n")
  const rest = lines.pop() ?? ""
  const events: { delta?: string; usage?: number }[] = []
  for (const l of lines) {
    const t = l.trim()
    if (!t.startsWith("data:")) continue
    const d = t.slice(5).trim()
    if (d === "[DONE]") continue
    try {
      const j = JSON.parse(d) as { choices?: { delta?: { content?: string } }[]; usage?: { total_tokens?: number } }
      const delta = j.choices?.[0]?.delta?.content
      events.push({ ...(delta ? { delta } : {}), ...(j.usage?.total_tokens ? { usage: j.usage.total_tokens } : {}) })
    } catch { /* خط ناقص/نامعتبر */ }
  }
  return { events, rest }
}

export async function* streamChat(model: string, messages: ChatMsg[], maxTokens: number, signal?: AbortSignal): AsyncGenerator<string, StreamResult> {
  if ((process.env.LLM_PROVIDER ?? "mock") === "mock") {
    const last = messages.filter((m) => m.role === "user").at(-1)?.content ?? ""
    const demo = `🧪 حالت نمایشی (LLM_PROVIDER=mock): هنوز به مدل واقعی وصل نیستم.\n\nپرامپت شما ${last.length} نویسه داشت. برای پاسخ واقعی، در فایل .env مقدارهای LLM_PROVIDER=openai-compat و LLM_BASE_URL و LLM_API_KEY و شناسه‌ی مدل هر رده را تنظیم کنید.\n\nنمونه‌ی خروجی:\n- نکته‌ی اول\n- نکته‌ی دوم\n\n\`\`\`\nconsole.log("سلام")\n\`\`\``
    for (const w of demo.split(/(\s+)/)) { if (signal?.aborted) break; yield w; await new Promise((r) => setTimeout(r, 12)) }
    return { usageTokens: null }
  }
  const base = (process.env.LLM_BASE_URL ?? "").replace(/\/+$/, "")
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST", signal,
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.LLM_API_KEY ?? ""}` },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, stream: true, stream_options: { include_usage: true } }),
  })
  if (!res.ok || !res.body) throw new Error(`LLM ${res.status}`)
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = "", usage: number | null = null
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    const { events, rest } = parseSseLines(buf + dec.decode(value, { stream: true }))
    buf = rest
    for (const e of events) { if (e.delta) yield e.delta; if (e.usage) usage = e.usage }
  }
  return { usageTokens: usage }
}
