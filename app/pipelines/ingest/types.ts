export interface SourcedPrompt {
  id: string                 // <source>:<native-id>
  source: string             // کلید در content/sources.json
  license: string            // SPDX
  sourceUrl: string
  sourceCommit: string
  locale: "en" | "ar" | "fa"
  title: string
  body: string
  description?: string       // توضیح منبع (در صورت وجود)
  tags: string[]
  contributor?: string
}
