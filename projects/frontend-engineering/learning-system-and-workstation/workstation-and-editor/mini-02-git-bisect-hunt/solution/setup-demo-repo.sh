#!/usr/bin/env bash
# setup-demo-repo.sh — builds the demo repository the learner will bisect.
# It writes one commit per line of development; the truncate bug enters at commit 5.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
DEMO="$ROOT/demo"

rm -rf "$DEMO"
mkdir -p "$DEMO"
cd "$DEMO"

git init -q
git config user.name "Demo Developer"
git config user.email "demo@example.com"

snapshot() {
  git add src/truncate.js
  git commit -q -m "$1"
}

mkdir -p src

# 1. The correct starting point.
cat > src/truncate.js <<'EOF'
// truncate(text, length) shortens text longer than length and adds an ellipsis.
function truncate(text, length) {
  if (text.length <= length) {
    return text;
  }
  return text.slice(0, length) + "...";
}
module.exports = { truncate };
EOF
snapshot "Add truncate helper"

# 2. A default length; still correct.
cat > src/truncate.js <<'EOF'
function truncate(text, length) {
  if (length === undefined) {
    length = 80;
  }
  if (text.length <= length) {
    return text;
  }
  return text.slice(0, length) + "...";
}
module.exports = { truncate };
EOF
snapshot "Default length to 80"

# 3. Clamp negative lengths; still correct.
cat > src/truncate.js <<'EOF'
function truncate(text, length) {
  if (length === undefined) {
    length = 80;
  }
  if (length < 0) {
    length = 0;
  }
  if (text.length <= length) {
    return text;
  }
  return text.slice(0, length) + "...";
}
module.exports = { truncate };
EOF
snapshot "Clamp negative length to zero"

# 4. Coerce input; still correct.
cat > src/truncate.js <<'EOF'
function truncate(text, length) {
  text = String(text);
  if (length === undefined) {
    length = 80;
  }
  if (length < 0) {
    length = 0;
  }
  if (text.length <= length) {
    return text;
  }
  return text.slice(0, length) + "...";
}
module.exports = { truncate };
EOF
snapshot "Coerce input to string"

# 5. BUG: the boundary check flips from <= to <, so an exact-length string
#    now gains an ellipsis. The message says "fix", but it introduces the bug.
cat > src/truncate.js <<'EOF'
function truncate(text, length) {
  text = String(text);
  if (length === undefined) {
    length = 80;
  }
  if (length < 0) {
    length = 0;
  }
  if (text.length < length) {
    return text;
  }
  return text.slice(0, length) + "...";
}
module.exports = { truncate };
EOF
snapshot "Fix the truncate boundary"

# 6. Docs only; the bug stays.
cat > src/truncate.js <<'EOF'
// truncate(text, length): text at most length long; longer text gains "...".
function truncate(text, length) {
  text = String(text);
  if (length === undefined) {
    length = 80;
  }
  if (length < 0) {
    length = 0;
  }
  if (text.length < length) {
    return text;
  }
  return text.slice(0, length) + "...";
}
module.exports = { truncate };
EOF
snapshot "Document the return value"

# 7. Extract the ellipsis constant; the bug stays.
cat > src/truncate.js <<'EOF'
const ELLIPSIS = "...";

// truncate(text, length): text at most length long; longer text gains ELLIPSIS.
function truncate(text, length) {
  text = String(text);
  if (length === undefined) {
    length = 80;
  }
  if (length < 0) {
    length = 0;
  }
  if (text.length < length) {
    return text;
  }
  return text.slice(0, length) + ELLIPSIS;
}
module.exports = { truncate };
EOF
snapshot "Extract the ellipsis constant"

# 8. Add a changelog; the bug stays.
cat > CHANGELOG.md <<'EOF'
# Changelog

- 0.1.0: truncate helper.
EOF
git add CHANGELOG.md
git commit -q -m "Add CHANGELOG.md"

echo "Demo repository ready at $DEMO (8 commits)."
