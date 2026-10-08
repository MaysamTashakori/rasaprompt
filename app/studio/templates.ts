// قالب‌های HTML اسلاید (1080×1350) و ریلز (1080×1920) با هویت بصری سایت. فونت محلی Vazirmatn.
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const font = (w: number) => {
  const p = require.resolve(`@fontsource/vazirmatn/files/vazirmatn-arabic-${w}-normal.woff2`)
  return `@font-face{font-family:V;font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(p).toString("base64")}) format("woff2")}`
}
const latin = (w: number) => {
  const p = require.resolve(`@fontsource/vazirmatn/files/vazirmatn-latin-${w}-normal.woff2`)
  return `@font-face{font-family:V;font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(p).toString("base64")}) format("woff2");unicode-range:U+0000-00FF}`
}
let fontsCss: string | null = null
const fonts = () => (fontsCss ??= [400, 700, 900].map((w) => font(w) + latin(w)).join(""))

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const hl = (s: string) => esc(s).replace(/(\{\{[^{}\n]{1,40}?\}\}|\[[^\[\]\n]{1,30}\])/g, '<mark>$1</mark>')

const base = (w: number, h: number, body: string, extra = "") => `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><style>
${fonts()}
*{box-sizing:border-box;margin:0}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{font-family:V,sans-serif;background:#0b0b0d;color:#f4f4f5;position:relative}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.09) 1.4px,transparent 1.4px);background-size:28px 28px;-webkit-mask-image:radial-gradient(70% 60% at 30% 20%,#000,transparent)}
.glow{position:absolute;width:900px;height:900px;border-radius:50%;background:radial-gradient(closest-side,rgba(52,211,153,.18),transparent);filter:blur(10px)}
.brand{display:flex;align-items:center;gap:18px;font-weight:700;font-size:34px}
.logo{width:64px;height:64px;border-radius:18px;background:#f4f4f5;color:#0b0b0d;display:grid;place-items:center;font-weight:900;font-size:36px}
.pill{display:inline-block;padding:12px 26px;border-radius:999px;background:#0f2a21;color:#34d399;font-size:30px;font-weight:700}
.muted{color:#a1a1aa}
mark{background:#0f2a21;color:#34d399;border-radius:10px;padding:0 8px}
.card{background:#131316;border:2px solid #26262b;border-radius:36px}
${extra}
</style></head><body><div class="dots"></div>${body}</body></html>`

export interface SlideData { title: string; desc: string; field: string; level: string; body: string; vars: string[]; site: string; bot?: string; index: number; total: number }

const frame = (d: SlideData, inner: string) => base(1080, 1350, `
<div class="glow" style="top:-300px;left:-300px"></div>
<div style="position:absolute;inset:80px;display:flex;flex-direction:column">
  <div style="display:flex;align-items:center;justify-content:space-between">
    <div class="brand"><div class="logo">ر</div>رسا پرامپت</div>
    <div class="muted" style="font-size:28px;direction:ltr">${d.index}/${d.total}</div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center">${inner}</div>
  <div class="muted" style="font-size:28px;display:flex;justify-content:space-between"><span>${esc(d.field)} · ${esc(d.level)}</span><span style="direction:ltr">${esc(d.site.replace(/^https?:\/\//, ""))}</span></div>
</div>`)

export function slides(d: SlideData): string[] {
  const total = 5
  const D = (i: number) => ({ ...d, index: i, total })
  const excerpt = d.body.length > 520 ? d.body.slice(0, 520) + "…" : d.body
  return [
    frame(D(1), `<span class="pill" style="align-self:flex-start">پرامپت آماده</span>
      <h1 style="font-size:104px;line-height:1.25;font-weight:900;margin-top:40px">${esc(d.title)}</h1>
      <p class="muted" style="font-size:40px;line-height:1.7;margin-top:36px">${esc(d.desc)}</p>
      <p style="font-size:34px;margin-top:60px;color:#34d399">ورق بزن ←</p>`),
    frame(D(2), `<h2 style="font-size:64px;font-weight:900">چه کاری برایت می‌کند؟</h2>
      <p style="font-size:44px;line-height:1.8;margin-top:40px">${esc(d.desc)}</p>
      ${d.vars.length ? `<p class="muted" style="font-size:34px;margin-top:50px">فقط این‌ها را پر کن:</p><div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:20px">${d.vars.map((v) => `<span class="pill">${esc(v.replace(/_/g, " "))}</span>`).join("")}</div>` : ""}`),
    frame(D(3), `<h2 style="font-size:52px;font-weight:900;margin-bottom:30px">متن پرامپت</h2>
      <div class="card" style="padding:44px;font-size:30px;line-height:1.85;white-space:pre-wrap;max-height:820px;overflow:hidden">${hl(excerpt)}</div>`),
    frame(D(4), `<h2 style="font-size:64px;font-weight:900">چطور استفاده کنم؟</h2>
      ${["پرامپت را کپی کن (متن کامل در سایت).", "بخش‌های سبز را با اطلاعات خودت عوض کن.", "در هوش مصنوعی دلخواهت اجرا کن یا مستقیم در سایت رسا."].map((s, i) => `
      <div style="display:flex;gap:32px;align-items:center;margin-top:44px"><div class="logo" style="background:#34d399;color:#06261b;flex:none">${"۱۲۳"[i]}</div><p style="font-size:42px;line-height:1.6">${s}</p></div>`).join("")}`),
    frame(D(5), `<div class="card" style="padding:70px;text-align:center">
      <p style="font-size:42px" class="muted">متن کامل، اجرای مستقیم و هزاران پرامپت دیگر</p>
      <p style="font-size:84px;font-weight:900;margin-top:30px;direction:ltr">${esc(d.site.replace(/^https?:\/\//, ""))}</p>
      ${d.bot ? `<p style="font-size:44px;margin-top:40px;color:#34d399;direction:ltr">${esc(d.bot)}</p>` : ""}
      <p style="font-size:36px;margin-top:50px">ذخیره کن 📌 و برای دوستت بفرست</p></div>`),
  ]
}

/** ریلز ۹ ثانیه‌ای: موشن‌گرافیک CSS (ورود برند → تیتر کلمه‌به‌کلمه → پر شدن متغیرها → خروجی → فراخوان) */
export function reel(d: SlideData & { sampleValues: string[]; output: string }): string {
  const words = d.title.split(/\s+/)
  const varsHtml = d.vars.slice(0, 3).map((v, i) => `
    <div class="v" style="animation-delay:${3.2 + i * 0.5}s"><span class="muted">${esc(v.replace(/_/g, " "))}</span>
      <div class="in"><span class="type" style="animation-delay:${3.4 + i * 0.5}s">${esc(d.sampleValues[i] ?? "")}</span></div></div>`).join("")
  return base(1080, 1920, `
<div class="glow" style="top:-200px;right:-400px;animation:pulse 4s ease-in-out infinite"></div>
<div style="position:absolute;inset:110px 90px;display:flex;flex-direction:column;gap:56px">
  <div class="brand a" style="animation-delay:.2s"><div class="logo">ر</div>رسا پرامپت</div>
  <span class="pill a" style="align-self:flex-start;animation-delay:.6s">پرامپت روز</span>
  <h1 style="font-size:110px;line-height:1.25;font-weight:900">${words.map((w, i) => `<span class="w" style="animation-delay:${1 + i * 0.18}s">${esc(w)}</span>`).join(" ")}</h1>
  <div class="card a" style="padding:48px;display:flex;flex-direction:column;gap:30px;animation-delay:2.9s">${varsHtml}
    <div class="run" style="animation-delay:5.4s">▶ اجرا</div>
  </div>
  <div class="card out" style="padding:44px;font-size:40px;line-height:1.8;animation-delay:6s"><span class="muted" style="font-size:30px">خروجی</span><br>${esc(d.output)}</div>
</div>
<div class="cta"><p style="font-size:44px" class="muted">متن کامل و اجرای مستقیم</p><p style="font-size:96px;font-weight:900;direction:ltr">${esc(d.site.replace(/^https?:\/\//, ""))}</p></div>`,
  `.a,.w,.v,.out{opacity:0;animation:up .8s cubic-bezier(.16,1,.3,1) forwards}
   .w{display:inline-block}
   @keyframes up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
   @keyframes pulse{50%{transform:scale(1.15)}}
   .in{margin-top:12px;height:96px;border:2px solid #26262b;border-radius:24px;background:#0b0b0d;display:flex;align-items:center;padding:0 30px;font-size:40px}
   .type{display:inline-block;white-space:nowrap;clip-path:inset(0 0 0 100%);animation:type .9s linear forwards}
   @keyframes type{to{clip-path:inset(0 0 0 0)}}
   .run{opacity:0;animation:up .5s forwards,press .4s 5.9s;background:#34d399;color:#06261b;border-radius:24px;text-align:center;font-weight:900;font-size:44px;padding:26px}
   @keyframes press{50%{transform:scale(.96)}}
   .cta{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:#0b0b0d;opacity:0;animation:fade .7s 7.8s forwards}
   @keyframes fade{to{opacity:1}}`)
}

export const writeHtml = (dir: string, name: string, html: string) => fs.writeFileSync(path.join(dir, name), html)
