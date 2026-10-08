// لایه‌ی انتزاعی مدل زبانی — تعویض‌پذیر و قابل Mock در تست
export interface LlmRequest { model: string; prompt: string; system?: string; maxTokens?: number }
export interface LlmResponse { text: string; costUsd: number }
export interface LlmClient { complete(req: LlmRequest): Promise<LlmResponse> }

/** نیازمند ANTHROPIC_API_KEY؛ هزینه با نرخ‌های env تخمین زده می‌شود (USD به‌ازای میلیون توکن). */
export class AnthropicClient implements LlmClient {
  private apiKey: string
  private rateIn: number
  private rateOut: number
  constructor(
    apiKey = process.env.ANTHROPIC_API_KEY ?? "",
    rateIn = Number(process.env.LLM_RATE_IN ?? 0),
    rateOut = Number(process.env.LLM_RATE_OUT ?? 0),
  ) {
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY تنظیم نشده است")
    this.apiKey = apiKey
    this.rateIn = rateIn
    this.rateOut = rateOut
  }
  async complete({ model, prompt, system, maxTokens = 1024 }: LlmRequest): Promise<LlmResponse> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": this.apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: "user", content: prompt }] }),
    })
    if (!res.ok) throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const j = (await res.json()) as { content: { type: string; text?: string }[]; usage: { input_tokens: number; output_tokens: number } }
    const text = j.content.filter((c) => c.type === "text").map((c) => c.text ?? "").join("")
    const costUsd = (j.usage.input_tokens * this.rateIn + j.usage.output_tokens * this.rateOut) / 1e6
    return { text, costUsd }
  }
}

/** برای تست و اجرای بدون کلید. */
export class MockClient implements LlmClient {
  calls: LlmRequest[] = []
  private fn: (r: LlmRequest) => string
  constructor(fn: (r: LlmRequest) => string = () => "mock") {
    this.fn = fn
  }
  async complete(r: LlmRequest) {
    this.calls.push(r)
    return { text: this.fn(r), costUsd: 0 }
  }
}
