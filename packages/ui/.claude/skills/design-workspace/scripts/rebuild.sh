#!/usr/bin/env bash
# Rebuilds the workspace into an existing build directory and prints the files that changed as a JSON map of published path to
# source path (null for a removed file), ready for the `files` input of an artifact publish with `root` set to the build directory
set -euo pipefail
OUT=$(realpath -m "${1:?Usage: rebuild.sh <build directory> <workspace branch> [base branch]}")
BRANCH=${2:?workspace branch}
BASE=${3:-next}
SCRIPTS=$(dirname "$(realpath "$0")")
checksums() { (cd "$OUT" 2>/dev/null && find . -type f -exec md5sum {} + | sort -k2) || true; }
BEFORE=$(checksums)
"$SCRIPTS/build-static.sh" "$OUT" >&2
"$SCRIPTS/write-status.sh" "$OUT" "$BRANCH" "$BASE" >/dev/null
AFTER=$(checksums)
python3 - "$BEFORE" "$AFTER" <<'PY'
import json, sys
def parse(listing):
    return {line.split()[1][2:]: line.split()[0] for line in listing.splitlines() if line}
before, after = parse(sys.argv[1]), parse(sys.argv[2])
changed = {path: path for path in after if before.get(path) != after[path]}
changed.update({path: None for path in before if path not in after})
print(json.dumps(changed))
PY
