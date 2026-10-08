// نقطه‌ی ورود مشترک وب‌هوک و polling: اول پنل ادمین، سپس ربات عمومی
import { handleUpdate, type Ctx, type Update } from "./core.ts"
import { handleAdmin } from "./admin.ts"
import { FsAdminService } from "./admin-service.ts"
import { broadcast, type BotApi } from "./api.ts"

export async function dispatch(api: BotApi, u: Update, ctx: Ctx) {
  const svc = new FsAdminService(() => ctx.store.users?.().length ?? 0)
  const admin = await handleAdmin(u, ctx, svc)
  if (admin) {
    await api.run(admin.actions)
    if (admin.files) {
      for (const f of admin.files.paths) {
        const [method, field] = f.endsWith(".png") ? (["sendPhoto", "photo"] as const) : (["sendVideo", "video"] as const)
        await api.sendFile(admin.files.chat, method, field, f).catch((e) => console.error("[bot] file", (e as Error).message))
      }
    }
    if (admin.broadcast) {
      const from = u.callback_query?.from.id
      void broadcast(api, ctx.store.users?.() ?? [], admin.broadcast.text, from)
    }
    return
  }
  await api.run(handleUpdate(u, ctx))
}
