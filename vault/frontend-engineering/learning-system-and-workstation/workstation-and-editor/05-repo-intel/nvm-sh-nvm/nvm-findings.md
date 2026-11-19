---
title: "nvm-sh/nvm — findings"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [nvm-sh-nvm-repo]
---

# nvm-sh/nvm — findings

What this production codebase does beyond the textbook version of "a script that installs
Node", ranked by how much you gain from knowing it.

## 1. Treat every downloaded string as hostile input

- Textbook version: `curl "$MIRROR/$version.tar"` and print whatever the mirror returns.
- What they do: nvm passes URLs as literal argv, never into a command string. It filters the
  mirror's `index.tab` through an awk allow-list before any row is used. It rejects a `.nvmrc`
  symlink and hides its content.
- Why: a version manager must fetch URLs and read files it did not write. The code comment
  names the exact attack: "command substitution / OS command injection".
- Evidence: `nvm.sh:158-160 @ ad42d90`, `nvm.sh:2952-2956 @ ad42d90`, `nvm.sh:1158-1166 @ ad42d90`.
- Borrow it when: your tool reads a config file or a remote list that will reach a shell or path.
- More: [[nvm-module-download-and-security|download-and-security]], [[nvm-module-tests-resolution-and-download|tests]], [[nvm-pattern-untrusted-input|treating untrusted input]]

## 2. Verify before you publish, then rename once

- Textbook version: download straight to the final path, then optionally check the hash.
- What they do: nvm downloads into a private `.unverified` directory and checksums it. Only then
  does it move the file into the cache. It extracts to a staging directory and renames the whole
  tree into place with one `mv`.
- Why: a half-written tree must never look installed. A downloader left running by another
  install must not rewrite an already-verified file.
- Evidence: `nvm.sh:4087-4158 @ ad42d90`, `nvm.sh:3847-3864 @ ad42d90`.
- Borrow it when: you write a file that other code reads as complete, like a cache entry.
- More: [[nvm-module-install-node|install-node]], [[nvm-module-install-script|install-script]], [[nvm-pattern-atomic-publish|atomic publish]]

## 3. A fixed exit-code contract per failure class

- Textbook version: every error returns a generic `1`.
- What they do: nvm gives each failure class its own code. Wrong usage returns 55, contradictory
  flags 6, an infinite alias loop 8, "not installed" 3, and a bad npm prefix 11.
- Why: `nvm-exec` and the shell-startup hook must tell "wrong usage" from "version not
  installed" so they can react differently.
- Evidence: `nvm.sh:7113-7116 @ ad42d90`, `nvm.sh:6403-6406 @ ad42d90`, `nvm.sh:6197-6202 @ ad42d90`.
- Borrow it when: a caller must branch on *why* something failed, not just that it did.
- More: [[nvm-module-cli-dispatch|cli-dispatch]], [[nvm-pattern-error-classification|distinct exit codes]]

## 4. Secrets never in argv, never echoed

- Textbook version: put the token in the URL or a `-H` argument, and print the bad input.
- What they do: curl reads credentials from a config piped on stdin. wget reads them from a
  private `mktemp`-created `wgetrc`. nvm reduces the auth header to a whitelist of token
  characters and hides a symlinked `.nvmrc`'s content.
- Why: every local user can read a process's command line with `ps` or `/proc/<pid>/cmdline`.
- Evidence: `nvm.sh:228-254 @ ad42d90`, `test/fast/Unit tests/nvm_sanitize_auth_header:38-50 @ ad42d90`.
- Borrow it when: your tool forwards a token, and the value is also attacker-influenced data.
- More: [[nvm-module-download-and-security|download-and-security]], [[nvm-pattern-untrusted-input|treating untrusted input]]

## 5. Do not fork a subprocess on the hot path

- Textbook version: call `awk` or `sort -V` for every version comparison.
- What they do: plain `x.y.z` pairs compare in pure shell arithmetic. An exact installed version
  short-circuits the list pipeline. `nvm_get_os` reads `/etc/os-release` instead of forking `uname`.
- Why: these run on every shell startup, so each avoided fork is one fewer subprocess.
- Evidence: `nvm.sh:1234-1256 @ ad42d90`, `nvm.sh:503-516 @ ad42d90`.
- Borrow it when: a helper runs in a loop or at startup, and a subprocess call is the cost.
- More: [[nvm-module-versions-and-nvmrc|versions-and-nvmrc]], [[nvm-pattern-shell-portability|portable shell]]

## 6. One brace block so a truncated download never runs

- Textbook version: `curl … | bash` runs each line as it arrives.
- What they do: `install.sh` and `nvm.sh` wrap their whole body in a single `{ … }` block. The
  comment says "this ensures the entire script is downloaded".
- Why: bash parses a complete brace group before running it. A dropped connection then fails as a
  syntax error, not a half-installed machine.
- Evidence: `install.sh:3 @ ad42d90`, `nvm.sh:11 @ ad42d90`.
- Borrow it when: you ship an installer that users pipe straight into a shell.
- More: [[nvm-module-install-script|install-script]], [[nvm-module-cli-dispatch|cli-dispatch]]

## 7. Idempotent, comment-aware profile editing

- Textbook version: `grep nvm.sh "$profile"` then append. A commented-out line makes the check
  pass while nvm is not actually loaded.
- What they do: nvm strips comment-only lines with `sed` before checking. It rewrites `NVM_DIR`
  under `$HOME` as a literal `$HOME` so the profile stays portable.
- Why: re-running the installer must converge to a correct state, not just "no duplicate text".
- Evidence: `install.sh:51-54 @ ad42d90`, `install.sh:505-512 @ ad42d90`.
- Borrow it when: your setup script appends lines to a dotfile and may run more than once.
- More: [[nvm-module-install-script|install-script]]

## 8. Test the trust boundary by attacking it

- Textbook version: tests assert the happy path and a couple of error returns.
- What they do: a fake `cat` swaps a `.nvmrc` for a symlink mid-read. A fake `curl` records its
  exact argv to prove a secret never appears there. A hostile git config sits in `$PWD` and has no
  effect.
- Why: defensive code only has value when a test pins the attack it prevents.
- Evidence: `test/fast/Unit tests/nvm_download no eval injection:35-44 @ ad42d90`,
  `test/install_script/install_nvm_from_git_ignores_cwd_repo:40-61 @ ad42d90`.
- Borrow it when: you write defensive code; add the attack as a test, not just the defence.
- More: [[nvm-module-tests-resolution-and-download|tests]], [[nvm-module-install-script|install-script]]

## 9. A test that asserts a bug is still broken

- Textbook version: CI checks that code works; a fix is always an improvement.
- What they do: `nvm-install-test.yml` re-installs every tag. For `v0.40.0` with a `.nvmrc`, it
  flips the logic so *success is failure* — the known bug is expected.
- Why: a silent accidental fix is untracked. The red job forces a human to notice and remove the
  guard.
- Evidence: `nvm-install-test.yml:83-127 @ ad42d90`.
- Borrow it when: you pin down a known limitation and want a refactor to surface it.
- More: [[nvm-module-build-and-infra|build-and-infra]]

## My insights
