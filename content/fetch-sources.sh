#!/usr/bin/env bash
# دانلود منابع مجاز با commit قفل‌شده در content/sources.json، سپس واردسازی به content/imported/
set -euo pipefail
DEST="${1:-.cache/sources}"; mkdir -p "$DEST"
python3 - "$DEST" <<'PY'
import json, subprocess, sys, os
dest = sys.argv[1]
for s in json.load(open("content/sources.json"))["sources"]:
    d = os.path.join(dest, s["url"].replace("https://github.com/", "").replace("/", "_"))
    if not os.path.isdir(d):
        subprocess.run(["git", "clone", "-q", "--filter=blob:none", "--no-checkout", s["url"] + ".git", d], check=True)
    subprocess.run(["git", "-C", d, "fetch", "-q", "--depth", "1", "origin", s["commit"]], check=True)
    subprocess.run(["git", "-C", d, "checkout", "-q", s["commit"]], check=True)
    print("ok", s["key"], s["commit"][:8])
PY
(cd app && npx tsx scripts/import-sources.ts "../$DEST")
