#!/usr/bin/env bash
# test.sh — the project's acceptance check.
# Recreates the demo repo, runs the hunt, and fails unless bisect lands on the
# commit that introduced the truncate bug.
set -euo pipefail
cd "$(dirname "$0")"

bash setup-demo-repo.sh >/dev/null
out="$(bash bisect.sh)"
echo "$out"

if echo "$out" | grep -q "Fix the truncate boundary"; then
  echo "PASS: bisect landed on the bug commit."
else
  echo "FAIL: bisect did not land on the bug commit." >&2
  exit 1
fi
