#!/usr/bin/env bash
# bisect.sh — finds the commit that introduced the truncate bug, automatically.
set -euo pipefail

cd "$(dirname "$0")/demo"

first="$(git rev-list --max-parents=0 HEAD)"

git bisect start
git bisect bad HEAD
git bisect good "$first"
git bisect run node ../check.js

found="$(git log -1 --pretty=%s)"
git bisect reset >/dev/null
echo "first bad commit: $found"
