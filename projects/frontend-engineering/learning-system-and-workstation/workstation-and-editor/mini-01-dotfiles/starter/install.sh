#!/usr/bin/env bash
# install.sh — link this repo's config files into $HOME as dotfiles.
# Safe to run twice: an existing link is skipped, a real file is backed up first.
set -euo pipefail

# The directory this script lives in. This is the dotfiles repository.
DOTFILES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Where the dotfiles are linked to. The tests point HOME at a temp directory.
TARGET="${HOME:?HOME is not set}"

# Each name is a file in config/, linked as a hidden dotfile: config/zshrc -> ~/.zshrc.
DOTFILES=(gitconfig zshrc vimrc)

# TODO(1): Print a message prefixed with [dotfiles].
#   1. Use printf with a format string of '[dotfiles] %s\n'.
#   2. Pass "$1" as the only value.
log() {
  echo "TODO(1): log is not implemented yet" >&2
  return 1
}

# TODO(2): Return 0 when TARGET is already a symlink that points at SOURCE.
#   Return 1 otherwise. Do not treat a real file as a symlink.
#   1. Test for a symlink with [[ -L "$TARGET" ]].
#   2. Compare its destination with [[ "$(readlink "$TARGET")" == "$SOURCE" ]].
is_symlink_to() {
  local target="$1" source="$2"
  echo "TODO(2): is_symlink_to is not implemented yet" >&2
  return 1
}

# TODO(3): Move TARGET aside when it is a real file, so linking never clobbers it.
#   1. Test for a real file with [[ -e "$TARGET" && ! -L "$TARGET" ]].
#   2. Move it with mv "$TARGET" "$TARGET.backup".
#   3. Log what you moved.
backup_existing() {
  local target="$1"
  echo "TODO(3): backup_existing is not implemented yet" >&2
  return 1
}

# TODO(4): Link one config file into $HOME.
#   1. If is_symlink_to "$TARGET" "$SOURCE" is true, log "already linked" and return 0.
#   2. Otherwise call backup_existing "$TARGET".
#   3. Create the symlink with ln -s "$SOURCE" "$TARGET".
#   4. Log what you linked.
link_file() {
  local source="$1" target="$2"
  echo "TODO(4): link_file is not implemented yet" >&2
  return 1
}

for name in "${DOTFILES[@]}"; do
  link_file "$DOTFILES_DIR/config/$name" "$TARGET/.$name"
done
