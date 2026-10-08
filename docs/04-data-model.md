# مدل داده

```
prompt            id, translation_group, locale(fa|en|ar), slug, title, summary, tier(lite|pro|elite),
                  category_id, output_type, license, status(draft|testing|published|stale|retired),
                  quality_score, current_version_id, source(internal|cc0|creator|bounty), creator_id?
prompt_version    id, prompt_id, semver, body, variables(jsonb schema), changelog, created_at
prompt_test       id, version_id, model, model_version, run_at, score, pass, cost_usd, samples(jsonb), rubric_version
model             id, vendor, name, released_at, status(active|deprecated)
category          id, parent_id, kind(industry|task|role), names(jsonb fa/en/ar)
tag               id, names(jsonb) ; prompt_tag(prompt_id, tag_id)
bundle            id, locale, slug, title, price_tier ; bundle_item(bundle_id, prompt_id)
price             id, sku, market(fa|en|ar), currency, amount, active_from — (مرجع: app/config/pricing.json)
user              id, email, phone?, locale, country
order             id, user_id, provider, provider_ref, currency, amount, status, created_at
order_item        order_id, sku, prompt_id?|bundle_id?
entitlement       id, user_id, sku|plan, kind(item|plan|lifetime), valid_until?, source_order_id
subscription      id, user_id, plan(plus|team|business), interval, status, seats, renews_at
credit_ledger     id, user_id, delta, reason, order_id? (فاز ۵)
review            id, user_id, prompt_id, rating, body, verified_purchase
embedding         prompt_id, locale, vector(1536) — pgvector
event             id, type, payload(jsonb), at — لاگ حسابرسی و KPI
agent_run         id, agent, task, status, needs_human, output_ref, cost_usd, at
creator           id, user_id, share_pct, status (فاز ۸)
```

**قواعد:** هر ردیف `prompt` در سه زبان به‌هم با `translation_group` وصل است؛ انتشار فقط وقتی `status=published` که حداقل یک `prompt_test` با `pass=true` در ۹۰ روز اخیر وجود داشته باشد؛ `quality_score` از (نمره‌ی تست، نرخ تبدیل، امتیاز کاربر، تازگی تست، بازگشت وجه) محاسبه می‌شود؛ وزن‌ها در `config/quality.json` (به‌زودی).
