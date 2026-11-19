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
path = ".storybook-static-build/main.ts"
source = open(path).read()
source = source.replace("            build: {", "            build: {\n                assetsInlineLimit: 10_000_000,\n                cssCodeSplit: false,", 1)
source = source.replace(
    "rolldownOptions: { checks: { moduleLevelDirective: false } }",
    'rolldownOptions: { checks: { moduleLevelDirective: false }, output: { inlineDynamicImports: true, entryFileNames: "assets/[name].js", chunkFileNames: "assets/[name].js", assetFileNames: "assets/[name][extname]" } }',
)
open(path, "w").write(source)
PY
pnpm exec storybook build -c .storybook-static-build -o "$OUT" --quiet
# The launcher page takes the place of Storybook's manager UI
rm -f "$OUT/index.html"
# The artifact upload refuses U+FFFD; in the JS strings, the escape stands for the same character
python3 - "$OUT" <<'PY'
import glob, sys
for path in glob.glob(sys.argv[1] + "/**/*.js", recursive=True):
    source = open(path, encoding="utf-8").read()
    if "�" in source:
        open(path, "w", encoding="utf-8").write(source.replace("�", "\\uFFFD"))
PY
echo "$(find "$OUT" -type f | wc -l) files in $OUT"
