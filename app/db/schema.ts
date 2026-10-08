// مدل داده — مرجع: docs/04-data-model.md
import { pgTable, text, integer, real, boolean, timestamp, jsonb, uuid, primaryKey, vector, index } from "drizzle-orm/pg-core"

export const locales = ["fa", "en", "ar"] as const

export const category = pgTable("category", {
  id: text("id").primaryKey(),
  kind: text("kind", { enum: ["industry", "task", "role"] }).notNull(),
  names: jsonb("names").$type<Record<(typeof locales)[number], string>>().notNull(),
})

export const prompt = pgTable(
  "prompt",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    translationGroup: uuid("translation_group").notNull(),
    locale: text("locale", { enum: locales }).notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    tier: text("tier", { enum: ["lite", "pro", "elite"] }).notNull(),
    categoryId: text("category_id").references(() => category.id),
    license: text("license").notNull().default("proprietary"),
    source: text("source", { enum: ["internal", "cc0", "creator", "bounty"] }).notNull().default("internal"),
    status: text("status", { enum: ["draft", "testing", "published", "stale", "retired"] }).notNull().default("draft"),
    qualityScore: real("quality_score").notNull().default(0),
    currentVersionId: uuid("current_version_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("prompt_locale_slug").on(t.locale, t.slug)],
)

export const promptVersion = pgTable("prompt_version", {
  id: uuid("id").primaryKey().defaultRandom(),
  promptId: uuid("prompt_id").notNull().references(() => prompt.id),
  semver: text("semver").notNull(),
  body: text("body").notNull(),
  variables: jsonb("variables").$type<string[]>().notNull().default([]),
  sampleInputs: jsonb("sample_inputs").$type<Record<string, string>[]>().notNull().default([]),
  changelog: text("changelog"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const model = pgTable("model", {
  id: text("id").primaryKey(),
  vendor: text("vendor").notNull(),
  name: text("name").notNull(),
  status: text("status", { enum: ["active", "deprecated"] }).notNull().default("active"),
})

export const promptTest = pgTable("prompt_test", {
  id: uuid("id").primaryKey().defaultRandom(),
  versionId: uuid("version_id").notNull().references(() => promptVersion.id),
  modelId: text("model_id").notNull().references(() => model.id),
  runAt: timestamp("run_at").notNull().defaultNow(),
  score: real("score").notNull(),
  pass: boolean("pass").notNull(),
  costUsd: real("cost_usd").notNull().default(0),
  samples: jsonb("samples").$type<unknown[]>().notNull().default([]),
  rubricVersion: text("rubric_version").notNull(),
})

export const embedding = pgTable(
  "embedding",
  {
    promptId: uuid("prompt_id").notNull().references(() => prompt.id),
    locale: text("locale", { enum: locales }).notNull(),
    vector: vector("vector", { dimensions: 1536 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.promptId, t.locale] })],
)

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique(),
  phone: text("phone"),
  locale: text("locale", { enum: locales }).notNull().default("en"),
  country: text("country"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const order = pgTable("order", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => user.id),
  provider: text("provider").notNull(),
  providerRef: text("provider_ref"),
  currency: text("currency").notNull(),
  amount: integer("amount").notNull(),
  status: text("status", { enum: ["pending", "paid", "refunded", "failed"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const entitlement = pgTable("entitlement", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => user.id),
  kind: text("kind", { enum: ["item", "plan", "lifetime"] }).notNull(),
  sku: text("sku").notNull(),
  validUntil: timestamp("valid_until"),
  sourceOrderId: uuid("source_order_id").references(() => order.id),
})

export const event = pgTable("event", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(),
  payload: jsonb("payload").notNull().default({}),
  at: timestamp("at").notNull().defaultNow(),
})

export const agentRun = pgTable("agent_run", {
  id: uuid("id").primaryKey().defaultRandom(),
  agent: text("agent").notNull(),
  task: text("task").notNull(),
  status: text("status").notNull(),
  needsHuman: boolean("needs_human").notNull().default(false),
  costUsd: real("cost_usd").notNull().default(0),
  at: timestamp("at").notNull().defaultNow(),
})
