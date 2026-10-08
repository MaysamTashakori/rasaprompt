CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TABLE "agent_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent" text NOT NULL,
	"task" text NOT NULL,
	"status" text NOT NULL,
	"needs_human" boolean DEFAULT false NOT NULL,
	"cost_usd" real DEFAULT 0 NOT NULL,
	"at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"names" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "embedding" (
	"prompt_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"vector" vector(1536) NOT NULL,
	CONSTRAINT "embedding_prompt_id_locale_pk" PRIMARY KEY("prompt_id","locale")
);
--> statement-breakpoint
CREATE TABLE "entitlement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"sku" text NOT NULL,
	"valid_until" timestamp,
	"source_order_id" uuid
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model" (
	"id" text PRIMARY KEY NOT NULL,
	"vendor" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_ref" text,
	"currency" text NOT NULL,
	"amount" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"translation_group" uuid NOT NULL,
	"locale" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"tier" text NOT NULL,
	"category_id" text,
	"license" text DEFAULT 'proprietary' NOT NULL,
	"source" text DEFAULT 'internal' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"quality_score" real DEFAULT 0 NOT NULL,
	"current_version_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_test" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_id" uuid NOT NULL,
	"model_id" text NOT NULL,
	"run_at" timestamp DEFAULT now() NOT NULL,
	"score" real NOT NULL,
	"pass" boolean NOT NULL,
	"cost_usd" real DEFAULT 0 NOT NULL,
	"samples" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rubric_version" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt_id" uuid NOT NULL,
	"semver" text NOT NULL,
	"body" text NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sample_inputs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"changelog" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"phone" text,
	"locale" text DEFAULT 'en' NOT NULL,
	"country" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "embedding" ADD CONSTRAINT "embedding_prompt_id_prompt_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompt"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlement" ADD CONSTRAINT "entitlement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlement" ADD CONSTRAINT "entitlement_source_order_id_order_id_fk" FOREIGN KEY ("source_order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt" ADD CONSTRAINT "prompt_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_test" ADD CONSTRAINT "prompt_test_version_id_prompt_version_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."prompt_version"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_test" ADD CONSTRAINT "prompt_test_model_id_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."model"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_version" ADD CONSTRAINT "prompt_version_prompt_id_prompt_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompt"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "prompt_locale_slug" ON "prompt" USING btree ("locale","slug");