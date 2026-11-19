#!/usr/bin/env bash
# bisect.sh — finds the commit that introduced the truncate bug, automatically.
set -euo pipefail

cd "$(dirname "$0")/demo"

# TODO(3): Start the search with the ends of the range marked.
#   Mark HEAD as bad and the first commit as good.
#   Get the first commit with: git rev-list --max-parents=0 HEAD

# TODO(4): Let git drive the search with `git bisect run node ../check.js`,
#   then print the commit git lands on.

echo "TODO(3)(4): bisect.sh does not run the bisect yet" >&2
exit 1
