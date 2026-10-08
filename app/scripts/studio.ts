// استودیوی محتوای اینستاگرام: کپشن + ۵ اسلاید کاروسل (PNG 1080×1350) + ریلز موشن‌گرافیک (MP4 1080×1920)
// اجرا: npx tsx scripts/studio.ts --daily | --slug <slug> | --top 3   [--no-video]
// پیش‌نیاز محلی: npx playwright install chromium ؛ ffmpeg برای MP4 (بدون آن WebM می‌ماند)
import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"
import { chromium } from "playwright"
import { getBySlug, loadCatalog, originals, pick, variablesOf } from "../lib/catalog"
import { FIELDS, LEVEL_NAMES } from "../lib/taxonomy"
import { buildCaption, imagePrompt } from "../studio/caption"
import { reel, slides, writeHtml } from "../studio/templates"
import type { CatalogItem } from "../lib/catalog-types"

const arg = (k: string) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : undefined }
const site = process.env.SITE_URL ?? "rasaprompt.ir"
const bot = process.env.TELEGRAM_BOT_HANDLE

function pickItems(): CatalogItem[] {
  if (arg("slug")) { const i = getBySlug(arg("slug")!); if (!i) throw new Error("slug پیدا نشد"); return [i] }
  const pool = loadCatalog().filter((i) => i.body.fa) // فقط متن کامل فارسی
  if (arg("top")) return pool.slice(0, Number(arg("top")))
  const day = Math.floor(Date.now() / 86_400_000)
  return [pool[day % pool.length] ?? originals()[0]]
}

// مقدار نمونه بر اساس نام متغیر (برای پر شدن نمایشی در ریلز)
const SAMPLE_BY_VAR: Record<string, string> = {
  "نام_محصول": "کیف چرمی دست‌دوز", "ویژگی‌ها": "چرم طبیعی، دوخت دستی", "مخاطب": "خانم‌های ۲۵ تا ۴۰ سال", "پیشنهاد": "ارسال رایگان",
  "متن": "متن خودتان", "لحن": "صمیمی", "موضوع": "قهوه‌ی تخصصی", "هدف": "فروش بیشتر", "کسب‌وکار": "کافه‌ی محله", "ماه": "مهر",
  "آگهی": "کارشناس فروش، تهران", "رزومه": "۳ سال سابقه‌ی فروش", "زبان": "TypeScript", "کد": "function pay()…", "ایده": "اپ رزرو نوبت",
  "آزمون": "کنکور ۱۴۰۶", "تاریخ": "تیر ۱۴۰۶", "ساعت": "۶ ساعت", "کلیدواژه": "قهوه‌ساز خانگی", "پیام": "سفارشم دیر رسید",
}
const sampleFor = (v: string) => SAMPLE_BY_VAR[v] ?? v.replace(/_/g, " ")

const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {})
for (const item of pickItems()) {
  const out = path.resolve("../out/studio", `${new Date().toISOString().slice(0, 10)}-${item.slug}`)
  fs.mkdirSync(out, { recursive: true })
  const body = pick(item.body, "fa")
  const data = {
    title: pick(item.title, "fa"), desc: pick(item.description, "fa"), body,
    field: FIELDS.find((f) => f.id === item.field)?.names.fa ?? "", level: LEVEL_NAMES[item.level].fa,
    vars: variablesOf(body), site, bot, index: 1, total: 5,
  }
  fs.writeFileSync(path.join(out, "caption.txt"), buildCaption(item, { site, bot }))
  fs.writeFileSync(path.join(out, "image-prompt.txt"), imagePrompt(item))

  // اسلایدها
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } })
  for (const [i, html] of slides(data).entries()) {
    writeHtml(out, `slide-${i + 1}.html`, html)
    await page.setContent(html, { waitUntil: "load" })
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: path.join(out, `slide-${i + 1}.png`) })
  }
  await page.close()

  // ریلز
  if (!process.argv.includes("--no-video")) {
    const sample = data.vars.slice(0, 3).map(sampleFor)
    const html = reel({ ...data, sampleValues: sample, output: (pick(item.description, "fa") || data.title).slice(0, 120) })
    writeHtml(out, "reel.html", html)
    const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, recordVideo: { dir: out, size: { width: 1080, height: 1920 } } })
    const p = await ctx.newPage()
    await p.setContent(html, { waitUntil: "load" })
    await p.waitForTimeout(9500)
    const video = p.video()
    await ctx.close()
    const webm = path.join(out, "reel.webm")
    fs.renameSync((await video!.path()), webm)
    try {
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "0.3", "-i", webm, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart", path.join(out, "reel.mp4")])
      fs.rmSync(webm)
    } catch { console.log("ffmpeg در دسترس نیست؛ reel.webm باقی ماند") }
  }
  console.log("✓", out)
}
await browser.close()
