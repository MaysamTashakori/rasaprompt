// تشخیص لایسنس مخزن GitHub از روی فایل LICENSE (برای افزودن منبع جدید از پنل مدیریت)
export function detectSpdx(text: string): string | null {
  const t = text.slice(0, 3000)
  if (/Attribution-NonCommercial|CC BY-NC/i.test(t)) return "CC-BY-NC-4.0"
  if (/CC0 1\.0|Creative Commons Zero|No Copyright/i.test(t)) return "CC0-1.0"
  if (/Attribution 4\.0 International/i.test(t)) return "CC-BY-4.0"
  if (/Apache License\s*Version 2\.0/i.test(t)) return "Apache-2.0"
  if (/^\s*MIT License|Permission is hereby granted, free of charge/im.test(t)) return "MIT"
  if (/Redistribution and use in source and binary forms/i.test(t) && /Neither the name/i.test(t)) return "BSD-3-Clause"
  if (/GNU GENERAL PUBLIC LICENSE/i.test(t)) return "GPL"
  return null
}

export function parseGithubRepo(url: string): { owner: string; repo: string } | null {
  const m = url.trim().match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i)
  return m ? { owner: m[1], repo: m[2] } : null
}

export async function fetchRepoLicense(owner: string, repo: string): Promise<{ spdx: string | null; branch: string; file: string } | null> {
  for (const branch of ["main", "master"])
    for (const file of ["LICENSE", "LICENSE.md", "LICENSE.txt", "LICENSE-CC0", "COPYING"]) {
      const r = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file}`).catch(() => null)
      if (r?.ok) return { spdx: detectSpdx(await r.text()), branch, file }
    }
  return null
}
