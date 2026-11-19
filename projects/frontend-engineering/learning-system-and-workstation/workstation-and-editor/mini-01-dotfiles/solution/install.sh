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

log() {
  printf '[dotfiles] %s\n' "$1"
}

is_symlink_to() {
  local target="$1" source="$2"
  [[ -L "$target" ]] && [[ "$(readlink "$target")" == "$source" ]]
}

backup_existing() {
  local target="$1"
  if [[ -e "$target" && ! -L "$target" ]]; then
    mv "$target" "$target.backup"
    log "backed up: $target -> $target.backup"
  fi
}

link_file() {
  local source="$1" target="$2"
  if is_symlink_to "$target" "$source"; then
    log "already linked: $target"
    return 0
  fi
  backup_existing "$target"
  ln -s "$source" "$target"
  log "linked: $target -> $source"
}

for name in "${DOTFILES[@]}"; do
  link_file "$DOTFILES_DIR/config/$name" "$TARGET/.$name"
done
