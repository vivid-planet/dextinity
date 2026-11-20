#!/usr/bin/env bash
# Builds the Storybook of @dextinity/ui into $1 as few files with stable names, so a static host with a file limit can serve it and a
# rebuild changes only the files whose content changed
set -euo pipefail
OUT=$(realpath -m "${1:?Usage: build-static.sh <output directory>}")
UI=$(git rev-parse --show-toplevel)/packages/ui
cd "$UI"
rm -rf .storybook-static-build "$OUT"
cp -r .storybook .storybook-static-build
trap 'rm -rf "$UI/.storybook-static-build"' EXIT
python3 - <<'PY'
import sys
path = ".storybook-static-build/main.ts"
source = open(path).read()
# Each option goes next to a line of the Storybook's Vite config; if that line changed, the build would quietly lose the option
def replace_once(old, new):
    global source
    if source.count(old) != 1:
        sys.exit(f"build-static.sh: expected exactly one {old!r} in .storybook/main.ts, adjust the script to the changed config")
    source = source.replace(old, new)
replace_once("            build: {", "            build: {\n                assetsInlineLimit: 10_000_000,\n                cssCodeSplit: false,")
replace_once(
    "rolldownOptions: { checks: { moduleLevelDirective: false } }",
    'rolldownOptions: { checks: { moduleLevelDirective: false }, output: { inlineDynamicImports: true, entryFileNames: "assets/[name].js", chunkFileNames: "assets/[name].js", assetFileNames: "assets/[name][extname]" } }',
)
open(path, "w").write(source)
PY
pnpm exec storybook build -c .storybook-static-build -o "$OUT" --quiet
# The launcher page is the link's start page, so Storybook's own UI moves aside; the workspace embeds it from there
mv "$OUT/index.html" "$OUT/storybook.html"
# The artifact upload refuses U+FFFD; in the JS strings, the escape stands for the same character
python3 - "$OUT" <<'PY'
import glob, sys
for path in glob.glob(sys.argv[1] + "/**/*.js", recursive=True):
    source = open(path, encoding="utf-8").read()
    if "�" in source:
        open(path, "w", encoding="utf-8").write(source.replace("�", "\\uFFFD"))
PY
echo "$(find "$OUT" -type f | wc -l) files in $OUT"
