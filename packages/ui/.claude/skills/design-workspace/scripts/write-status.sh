#!/usr/bin/env bash
# Writes status.json into the build: how many commits the base branch is ahead of the branch the workspace was built from. The
# launcher page shows them in its banner.
set -euo pipefail
OUT=${1:?Usage: write-status.sh <build directory> <workspace branch> [base branch]}
BRANCH=${2:?workspace branch}
BASE=${3:-next}
cd "$(git rev-parse --show-toplevel)"
git fetch -q origin "$BASE" "$BRANCH"
RANGE="origin/$BRANCH..origin/$BASE"
python3 - "$OUT/status.json" "$RANGE" "origin/$BRANCH" "$BASE" <<'PY'
import datetime, json, subprocess, sys
path, commit_range, built_from, base = sys.argv[1:]
def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True, check=True).stdout.strip()
log = git("log", "--format=%h%x09%s", "-n", "10", commit_range).splitlines()
json.dump({
    "base": base,
    "checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="minutes"),
    "behind": int(git("rev-list", "--count", commit_range)),
    "commits": [dict(zip(("sha", "subject"), line.split("\t", 1))) for line in log],
    "builtFrom": git("rev-parse", "--short", built_from),
}, open(path, "w"), indent=1)
PY
cat "$OUT/status.json"
