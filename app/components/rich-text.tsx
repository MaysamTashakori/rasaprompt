// نمایش امن خروجی مدل: بلوک‌های کد ``` و متن ساده (بدون HTML خام)
export function RichText({ text }: { text: string }) {
  const parts = text.split(/```[\w-]*\n?/)
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <pre key={i} dir="ltr" className="my-2 overflow-x-auto rounded-xl bg-fg/90 p-3 text-left text-xs leading-6 text-bg">{p.replace(/\n$/, "")}</pre>
        ) : (
          <span key={i} dir="auto" className="whitespace-pre-wrap">{p}</span>
        ),
      )}
    </>
  )
}
