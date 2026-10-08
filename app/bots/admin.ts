// پنل سوپرادمین داخل ربات (فقط شناسه‌های ADMIN). منابع، کاتالوگ، عامل‌ها، کد اعتبار، ارسال همگانی.
import type { Action, Ctx, Keyboard, Update } from "./core.ts"
import type { AdminService } from "./admin-service.ts"

export const adminIds = (platform: string) =>
  new Set((process.env[platform === "bale" ? "BALE_ADMIN_IDS" : "TELEGRAM_ADMIN_IDS"] ?? "").split(",").map((x) => Number(x.trim())).filter(Boolean))

const pendingBroadcast = new Map<string, string>()

const panel: Keyboard = [
  [{ text: "📊 آمار", callback_data: "a:stats" }, { text: "📚 منابع", callback_data: "a:sources" }],
  [{ text: "🤖 عامل‌ها", callback_data: "a:agents" }, { text: "🗂 صف کارها", callback_data: "a:queue" }],
  [{ text: "🔄 بازسازی کاتالوگ", callback_data: "a:rebuild" }, { text: "🎬 پست اینستاگرام روز", callback_data: "a:studio" }],
]

const HELP = `پنل مدیریت رسا
دستورها:
/addsource <آدرس GitHub>  افزودن منبع (بررسی خودکار لایسنس)
/approve <owner/repo>  ·  /reject <owner/repo>
/agent <نام>  مشخصات و کنترل عامل
/agent_note <نام> <متن>  توسعه‌ی دستورالعمل عامل
/run <نام عامل> <شرح کار>  افزودن کار به صف
/voucher <اعتبار> [تعداد]  ساخت کد اعتبار برای فروش دستی
/broadcast <متن>  ارسال همگانی (با تأیید)`

export interface AdminResult { actions: Action[]; broadcast?: { text: string }; files?: { chat: number; paths: string[]; caption?: string } }

export async function handleAdmin(u: Update, ctx: Ctx, svc: AdminService, admins = adminIds(ctx.platform)): Promise<AdminResult | null> {
  const from = u.message?.from?.id ?? u.callback_query?.from.id
  if (!from || !admins.has(from)) return null
  const chat = u.message?.chat.id ?? u.callback_query?.message?.chat.id ?? from
  const say = (text: string, inline?: Keyboard): Action => ({ type: "send", chat_id: chat, text, html: false, inline })

  if (u.callback_query) {
    const data = u.callback_query.data ?? ""
    if (!data.startsWith("a:")) return null
    const ack: Action = { type: "answer", callback_query_id: u.callback_query.id }
    const [, cmd, arg] = data.split(":")
    switch (cmd) {
      case "stats": {
        const s = svc.stats()
        return { actions: [ack, say(`📊 آمار\nکاتالوگ: ${s.catalog}\nبا عنوان فارسی: ${s.fa}\nتألیفی: ${s.originals}\nکاربران ربات: ${s.users}\nکد اعتبار: ${s.vouchers.total} (مصرف‌شده ${s.vouchers.used}، اعتبار فروخته‌شده ${s.vouchers.creditsSold})`)] }
      }
      case "sources": {
        const s = svc.sources()
        const ap = s.approved.map((x) => `✅ ${x.name} (${x.license})`).join("\n")
        const pe = s.pending.map((x) => `⏳ ${x.key} · ${x.license ?? "نامشخص"} · ${x.allowed ? "مجاز" : "غیرمجاز"}`).join("\n") || "—"
        const kb: Keyboard = s.pending.filter((x) => x.allowed).map((x) => [{ text: `✅ تأیید ${x.key}`.slice(0, 60), callback_data: `a:ap:${x.key}`.slice(0, 64) }, { text: "❌", callback_data: `a:rj:${x.key}`.slice(0, 64) }])
        return { actions: [ack, say(`📚 منابع تأییدشده\n${ap}\n\nدر انتظار بررسی\n${pe}\n\nافزودن: /addsource <آدرس GitHub>`, kb.length ? kb : undefined)] }
      }
      case "ap": case "rj": {
        const ok = svc.decideSource(arg ?? "", cmd === "ap")
        return { actions: [ack, say(ok ? (cmd === "ap" ? `✅ ${arg} تأیید شد و ساخت واردکننده به صف Source-Curator رفت.` : `❌ ${arg} رد شد.`) : "انجام نشد (منبع پیدا نشد یا لایسنس مجاز نیست).")] }
      }
      case "rebuild": {
        const r = await svc.rebuildCatalog()
        return { actions: [ack, say(`${r.ok ? "✅ کاتالوگ بازسازی شد" : "⚠️ خطا در بازسازی"}\n${r.out}`)] }
      }
      case "agents": {
        const list = svc.agents()
        const kb: Keyboard = []
        for (let i = 0; i < list.length; i += 2) kb.push(list.slice(i, i + 2).map((a) => ({ text: `${a.enabled ? "🟢" : "⚪️"} ${a.name}`, callback_data: `a:ag:${a.key}` })))
        return { actions: [ack, say(`🤖 عامل‌ها (${list.length})\nبرای مدیریت هر عامل روی آن بزنید.`, kb)] }
      }
      case "ag": case "on": case "off": {
        if (cmd !== "ag") svc.setAgent(arg ?? "", cmd === "on")
        const a = svc.agents().find((x) => x.key === arg)
        if (!a) return { actions: [ack, say("عامل پیدا نشد.")] }
        const q = svc.queue().filter((x) => x.agent === a.key && x.status === "queued").length
        return { actions: [ack, say(`🤖 ${a.name}\nوضعیت: ${a.enabled ? "فعال" : "غیرفعال"}\nمأموریت: ${a.mission}\nکارهای در صف: ${q}\n\nتوسعه: /agent_note ${a.key} <دستور جدید>\nکار جدید: /run ${a.key} <شرح>`,
          [[{ text: a.enabled ? "⏸ غیرفعال" : "▶️ فعال", callback_data: `a:${a.enabled ? "off" : "on"}:${a.key}` }, { text: "📄 مشخصات", callback_data: `a:spec:${a.key}` }]])] }
      }
      case "spec": {
        const spec = svc.agentSpec(arg ?? "")
        return { actions: [ack, say(spec ? spec.slice(0, 3500) : "پیدا نشد.")] }
      }
      case "queue": {
        const q = svc.queue().slice(-15).reverse()
        return { actions: [ack, say(q.length ? `🗂 آخرین کارها\n${q.map((x) => `${x.status === "queued" ? "⏳" : x.status === "done" ? "✅" : "⚠️"} [${x.agent}] ${x.task.slice(0, 80)}`).join("\n")}` : "صف خالی است.")] }
      }
      case "studio": {
        const r = await svc.studio()
        if (!r.ok) return { actions: [ack, say(`⚠️ ساخت محتوا ناموفق بود\n${r.out}`)] }
        return { actions: [ack, say(`🎬 بسته‌ی اینستاگرام آماده شد (${r.files.length} فایل). کپشن:\n\n${r.caption ?? ""}\n\nبعد از بازبینی، دستی منتشر کنید.`)], files: { chat, paths: r.files, caption: undefined } }
      }
      case "bc": {
        const text = pendingBroadcast.get(arg ?? "")
        pendingBroadcast.delete(arg ?? "")
        return text ? { actions: [ack, say("📣 ارسال همگانی شروع شد.")], broadcast: { text } } : { actions: [ack, say("منقضی شده؛ دوباره /broadcast بزنید.")] }
      }
    }
    return { actions: [ack] }
  }

  const text = u.message?.text?.trim() ?? ""
  if (!text.startsWith("/")) return null
  const [cmdRaw, ...rest] = text.split(/\s+/)
  const cmd = cmdRaw.slice(1).split("@")[0].toLowerCase()
  const argText = text.slice(cmdRaw.length).trim()
  switch (cmd) {
    case "admin": return { actions: [say(HELP, panel)] }
    case "addsource": {
      if (!argText) return { actions: [say("مثال: /addsource https://github.com/owner/repo")] }
      const r = await svc.addSource(argText)
      if ("error" in r) return { actions: [say(r.error)] }
      return { actions: [say(`🔎 ${r.key}\nلایسنس: ${r.license ?? "پیدا نشد"}\nنتیجه: ${r.allowed ? "مجاز برای استفاده‌ی تجاری؛ برای تأیید از 📚 منابع استفاده کنید." : "غیرمجاز یا نامشخص؛ اضافه نمی‌شود."}`, r.allowed ? [[{ text: "✅ تأیید", callback_data: `a:ap:${r.key}`.slice(0, 64) }, { text: "❌ رد", callback_data: `a:rj:${r.key}`.slice(0, 64) }]] : undefined)] }
    }
    case "approve": case "reject": {
      const ok = svc.decideSource(rest[0] ?? "", cmd === "approve")
      return { actions: [say(ok ? "انجام شد." : "انجام نشد.")] }
    }
    case "agent": {
      const a = svc.agents().find((x) => x.key === rest[0])
      return { actions: [say(a ? `🤖 ${a.name}: ${a.enabled ? "فعال" : "غیرفعال"}\n${a.mission}` : `عامل‌ها: ${svc.agents().map((x) => x.key).join("، ")}`, a ? [[{ text: "مدیریت", callback_data: `a:ag:${a.key}` }]] : undefined)] }
    }
    case "agent_note": {
      const ok = rest.length > 1 && svc.noteAgent(rest[0], rest.slice(1).join(" "))
      return { actions: [say(ok ? "✅ به دستورالعمل عامل اضافه شد." : "مثال: /agent_note trend-scout روی ترندهای کسب‌وکار اینستاگرامی تمرکز کن")] }
    }
    case "run": {
      const item = rest.length > 1 ? svc.enqueue(rest[0], rest.slice(1).join(" ")) : null
      return { actions: [say(item ? `✅ به صف ${item.agent} اضافه شد (${item.id}).` : "مثال: /run trend-scout ترندهای هفته‌ی پرامپت تصویر")] }
    }
    case "voucher": {
      const credits = Number(rest[0]), count = Math.min(50, Number(rest[1] ?? 1) || 1)
      if (!(credits > 0 && credits <= 100_000)) return { actions: [say("مثال: /voucher 600 5")] }
      const codes = svc.createVouchers(credits, count)
      return { actions: [say(`🎟 ${count} کد ${credits} اعتباری:\n${codes.join("\n")}\n\nمشتری در صفحه‌ی «اجرا» کد را وارد می‌کند.`)] }
    }
    case "broadcast": {
      if (!argText) return { actions: [say("مثال: /broadcast متن پیام")] }
      const id = Math.random().toString(36).slice(2, 8)
      pendingBroadcast.set(id, argText)
      return { actions: [say(`پیش‌نمایش ارسال همگانی:\n\n${argText}`, [[{ text: "✅ ارسال به همه", callback_data: `a:bc:${id}` }]])] }
    }
  }
  return null
}
