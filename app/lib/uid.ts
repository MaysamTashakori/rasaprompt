import { cookies } from "next/headers"

/** شناسه‌ی ناشناس پایدار (کوکی httpOnly) تا زمان راه‌اندازی حساب کاربری */
export async function getUid(): Promise<string> {
  const jar = await cookies()
  let uid = jar.get("rasa_uid")?.value
  if (!uid || !/^[a-f0-9-]{36}$/.test(uid)) {
    uid = crypto.randomUUID()
    jar.set("rasa_uid", uid, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" })
  }
  return uid
}
