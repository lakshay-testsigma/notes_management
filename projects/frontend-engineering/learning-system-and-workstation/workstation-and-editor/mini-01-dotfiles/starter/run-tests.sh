#!/usr/bin/env bash
# run-tests.sh — verify install.sh links dotfiles, is idempotent, and backs up.
# No dependencies. Run with: ./run-tests.sh
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL="$HERE/install.sh"
PASS=0
FAIL=0

tmp_home() {
  mktemp -d "${TMPDIR:-/tmp}/dotfiles-test.XXXXXX"
}

# Run install.sh with a fake HOME; returns install's exit status.
run_install() {
  HOME="$1" bash "$INSTALL"
}

pass() {
  PASS=$((PASS + 1))
  printf '  ok   %s\n' "$1"
}

fail() {
  FAIL=$((FAIL + 1))
  printf '  FAIL %s\n' "$1"
}

assert_link_points_to() {
  local link="$1" want="$2" label="$3"
  if [[ -L "$link" ]] && [[ "$(readlink "$link")" == "$want" ]]; then
    pass "$label"
  else
    fail "$label (want $link -> $want)"
  fi
}

test_links_all_dotfiles() {
  local home code err
  home="$(tmp_home)"
  err="$(run_install "$home" 2>&1 >/dev/null)"
  code=$?
  if [[ "$code" -ne 0 ]]; then
    fail "install.sh exited $code: $(head -n1 <<< "$err")"
    rm -rf "$home"
    return
  fi
  assert_link_points_to "$home/.gitconfig" "$HERE/config/gitconfig" "links gitconfig"
  assert_link_points_to "$home/.zshrc" "$HERE/config/zshrc" "links zshrc"
  assert_link_points_to "$home/.vimrc" "$HERE/config/vimrc" "links vimrc"
  rm -rf "$home"
}

test_is_idempotent() {
  local home code err
  home="$(tmp_home)"
  run_install "$home" >/dev/null 2>&1
  err="$(run_install "$home" 2>&1 >/dev/null)"
  code=$?
  if [[ "$code" -ne 0 ]]; then
    fail "second install exited $code: $(head -n1 <<< "$err")"
    rm -rf "$home"
    return
  fi
  pass "second install exits 0"
  if [[ -e "$home/.zshrc.backup" ]]; then
    fail "second install created .zshrc.backup"
  else
    pass "second install creates no backup"
  fi
  rm -rf "$home"
}

test_backs_up_existing() {
  local home code err
  home="$(tmp_home)"
  printf 'existing config\n' > "$home/.zshrc"
  err="$(run_install "$home" 2>&1 >/dev/null)"
  code=$?
  if [[ "$code" -ne 0 ]]; then
    fail "install.sh exited $code: $(head -n1 <<< "$err")"
    rm -rf "$home"
    return
  fi
  if [[ -f "$home/.zshrc.backup" ]]; then
    pass "backs up an existing real .zshrc"
  else
    fail "missing .zshrc.backup"
  fi
  assert_link_points_to "$home/.zshrc" "$HERE/config/zshrc" "replaces .zshrc with a link"
  rm -rf "$home"
}

test_logs_progress() {
  local home out code
  home="$(tmp_home)"
  out="$(run_install "$home" 2>&1)"
  code=$?
  if [[ "$code" -ne 0 ]]; then
    fail "install.sh exited $code: $(head -n1 <<< "$out")"
    rm -rf "$home"
    return
  fi
  if grep -q '^\[dotfiles\]' <<< "$out"; then
    pass "logs each action with [dotfiles]"
  else
    fail "no [dotfiles] output"
  fi
  rm -rf "$home"
}

test_links_all_dotfiles
test_is_idempotent
test_backs_up_existing
test_logs_progress

printf '\n%d passed, %d failed\n' "$PASS" "$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
