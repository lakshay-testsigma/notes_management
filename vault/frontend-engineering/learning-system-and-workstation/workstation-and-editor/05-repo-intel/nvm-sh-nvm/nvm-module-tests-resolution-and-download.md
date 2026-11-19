---
title: "nvm-sh/nvm — module tests-resolution-and-download"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [nvm-sh-nvm-repo]
---

# nvm-sh/nvm — module: tests-resolution-and-download

## Responsibility

This slice is the test suite that pins down two things: how a version string is resolved
(aliases, `.nvmrc`, version comparison, sorting) and how downloads stay safe (command
injection, credential leakage, redirects, checksums). It proves the defensive code the
download-and-security slice implements, by attacking it — a fake `cat` swaps a `.nvmrc` for a
symlink mid-read, a fake `curl` logs its exact arguments, and a mirror that redirects
cross-origin is made to fail.

## Key files

| File | Role |
|------|------|
| `test/common.sh` | Shared harness: `try`/`try_err`, `assert_ok`/`assert_not_ok`, `make_fake_curl`/`make_fake_node`, a hand-rolled JSON parser |
| `test/fast/Unit tests/nvm_download no eval injection` | Proves a mirror-supplied URL cannot run `$(...)` shell |
| `test/fast/Unit tests/nvm_download_artifact only caches verified archives` | Proves a tarball is cached only after checksum verification, incl. a time-of-check/time-of-use race |
| `test/fast/Unit tests/nvm_wget_same_origin` | Proves redirects are followed one hop at a time and never cross origin |
| `test/fast/Unit tests/nvm_process_nvmrc does not trust an .nvmrc replaced while being read` | Proves a `.nvmrc` swapped between check and use is rejected |
| `test/fast/Unit tests/nvm_alias path traversal` | Proves alias resolution never reaches outside `$NVM_DIR` |
| `test/fast/Unit tests/nvm_version` · `nvm_version_greater` · `nvm_sort_versions` · `nvm_is_version_installed` | Version math and the "exact installed version" fast paths |

## How it works

1. Every test is a standalone POSIX `sh` script (`#!/bin/sh`) that sources `../../../nvm.sh`
   and `../../common.sh`, defines a `die()` and `cleanup()`, then asserts one behaviour
   (`test/fast/Unit tests/nvm_alias:1-14 @ ad42d90`).
2. External commands are faked as executables on a rewritten `PATH`, not as shell functions,
   because `nvm.sh` uses `command curl` / `command wget` which bypass functions
   (`test/common.sh:53-57 @ ad42d90`).
3. A fake downloader records its arguments verbatim to a log, so a test can assert the *exact*
   argument vector — proving a secret never appears there (`test/fast/Unit tests/nvm_download no eval injection:22-29 @ ad42d90`).
4. Assertions reuse `try`/`try_err`, which capture stdout/stderr and the exit code in one
   subshell (`test/common.sh:10-25 @ ad42d90`).

## Beyond the textbook

### Time-of-check/time-of-use defence for `.nvmrc`

- Textbook version: read a file with `cat`, trust it, and write back to the same path.
- What they do: reject a `.nvmrc` that is a symlink or hard link, refuse a file that was
  swapped for a symlink between the check and the read, and write a new value by replacing the
  file (write a temp file, then `mv`) rather than writing through it.
- Why: another user who can write the project directory could point `.nvmrc` at a secret
  (`.npmrc`, `.git-credentials`) and have nvm echo it, or could swap the target mid-write.
  The comment in the write test names the attacker: "as another user who can write the
  directory could" (`test/fast/Unit tests/nvm_write_nvmrc replaces .nvmrc instead of writing through it:25-33 @ ad42d90`).
- Evidence: `test/fast/Unit tests/nvm_process_nvmrc does not trust an .nvmrc replaced while being read:20-37 @ ad42d90`

### A download is cached only after its checksum verifies

- Textbook version: download to the cache path, then verify — an interrupted or failed download
  is simply left in place.
- What they do: the tarball is written to an *unverified* name and moved to the final cache
  name only after `nvm_compare_checksum` passes; an empty, unverifiable, or mismatching
  checksum removes the cache directory and exits 6.
- Why: an archive left in the cache under its final name would be served by `--offline` as if it
  were trusted. The last block simulates a downloader left running by an earlier install that
  opens its output *after* a later install verified its own copy — the tampered write must not
  win (`test/fast/Unit tests/nvm_download_artifact only caches verified archives:105-134 @ ad42d90`).
- Evidence: `test/fast/Unit tests/nvm_download_artifact only caches verified archives:50-82 @ ad42d90`

### Redirects are re-implemented so the auth header never crosses origins

- Textbook version: pass `Authorization` to `curl -L` or wget and let the downloader follow
  redirects.
- What they do: run wget with `--max-redirect=0`, read the `Location` header with a separate
  `-S` probe to `/dev/null`, and follow only same-origin targets. Cross-origin targets (other
  host, other port, an `https→http` downgrade, a lookalike host `mirror.example.elsewhere`,
  a userinfo trick `mirror.example@elsewhere`) are refused with an error that says why.
- Why: GNU wget forwards a custom header to every redirect target, so a compromised mirror
  could redirect the request elsewhere and receive the credential (`test/fast/Unit tests/nvm_wget_same_origin:171-187 @ ad42d90`).
- Evidence: `test/fast/Unit tests/nvm_wget_same_origin:112-132 @ ad42d90`

### Secrets are treated as "never in `argv`, never echoed"

- Textbook version: print the offending input in the error, or hand it to a tool as an
  argument.
- What they do: a URL carrying `user:pass@` is piped to curl via `--config -` on stdin (wget
  via `--input-file=-`) so the password is not a process argument; a symlinked `.nvmrc`'s
  content is *not* shown in its error, and is never passed to `grep`/`sed`/`awk`/`tr` as an
  argument, because every local user can read another process's arguments
  (`test/fast/Unit tests/nvm_download keeps mirror URL credentials out of downloader arguments:55-71 @ ad42d90`,
  `test/fast/Unit tests/nvm_process_nvmrc does not show a symlinked .nvmrc's content:38-64 @ ad42d90`).
- Evidence: `test/fast/Unit tests/nvm_wget_with_auth_header:73-81 @ ad42d90`

### Version comparison avoids forking a process

- Textbook version: compare `x.y.z` strings with `awk` or `sort -V` each time.
- What they do: a plain `x.y.z` pair is compared with pure shell string operations; the test
  mocks `awk` to *fail* and asserts the comparison still returns the right answer, proving no
  fork happens. An exact installed version also resolves without calling `nvm_ls`.
- Why: version comparison runs many times during listing and sorting, so one `awk` fork per
  comparison adds up (`test/fast/Unit tests/nvm_version_greater:36-53 @ ad42d90`).
- Evidence: `test/fast/Unit tests/nvm_version:52-79 @ ad42d90`

### Auth header is reduced to a whitelist of standard token characters

- Textbook version: pass the configured header through unchanged.
- What they do: `nvm_sanitize_auth_header` keeps exactly the characters of RFC 4648 base64 and
  base64url, RFC 7235 `token68`, and RFC 6750 `b64token` (including `~`, which base64 never
  emits but opaque tokens may), strips shell metacharacters and CR/LF, and rejoins a base64
  credential wrapped at 76 columns.
- Why: the header value is attacker-influenced input that will be placed in a command line or a
  config file, so it must be constrained to a set that cannot escape that context
  (`test/fast/Unit tests/nvm_sanitize_auth_header:29-59 @ ad42d90`).
- Evidence: `test/fast/Unit tests/nvm_sanitize_auth_header:38-50 @ ad42d90`

## Tests and what they protect

The suite protects the *trust boundary*, not just happy paths. Command injection is tested by
putting `$(touch proof)` in a URL and asserting the file never appears
(`test/fast/Unit tests/nvm_download no eval injection:35-44 @ ad42d90`). Credential handling is
tested against line-break injection (`nvm_download keeps mirror URL credentials out of
downloader arguments:89-91 @ ad42d90`), against the header being forwarded to the wrong mirror
(`test/fast/Unit tests/nvm_auth_header_applies_to:53-86 @ ad42d90`), and against the temporary
`wgetrc` surviving a signal — the config is removed and the signal's exit code returned for
HUP/INT/TERM (`test/fast/Unit tests/nvm_wget_with_auth_header:175-185 @ ad42d90`). Resolution
edge cases cover prerelease ordering (`alpha.0 < alpha.1.2.0 < alpha.1.10.2 < release`),
`.iojs`/`.node` suffixes, and collapsing same-release nightlies
(`test/fast/Unit tests/nvm_sort_versions:8-47 @ ad42d90`). Failures are simulated by mocking the
external command (`awk`, `cat`, `tee`, `mv`, `curl`, `wget`) rather than by calling real
services, so the tests run offline and fast.

## Error handling, performance, and security

- Error handling: every test asserts an exit code, and the codes are meaningful — alias name
  invalid is 3, alias missing is 2, checksum failure is 6, `--offline` with no cached archive is
  4 (`test/fast/Unit tests/nvm_alias:14-24 @ ad42d90`,
  `test/fast/Unit tests/nvm_download_artifact only caches verified archives:54-57 @ ad42d90`).
  One test proves that exit codes from inner checks propagate to the caller
  (`test/fast/Unit tests/failed checks propagate their exit codes:25-35 @ ad42d90`).
- Performance: the two "must not fork" tests assert `awk` and `nvm_get_os` are *not* called on
  the fast paths, protecting the performance of version resolution
  (`test/fast/Unit tests/nvm_version_greater:36-53 @ ad42d90`,
  `test/fast/Unit tests/nvm_is_version_installed:75-92 @ ad42d90`).
- Security: the slice is dominated by it — path traversal out of `$NVM_DIR` is rejected with
  exit 3 and the disclosure is explicitly checked (`test/fast/Unit tests/nvm_alias path traversal:31-49 @ ad42d90`);
  control characters in a `.nvmrc` are rejected and echoed as `?` so they cannot inject terminal
  escape sequences (`test/fast/Unit tests/nvm_process_nvmrc_content rejects control characters:20-33 @ ad42d90`).

## Technologies and services seen

- **curl** — the primary downloader; tested for `--config -` stdin, `--fail`, `-q`-first, and
  same-origin redirect behaviour (`test/fast/Unit tests/nvm_download keeps mirror URL credentials out of downloader arguments:62-70 @ ad42d90`)
- **wget** (GNU and BusyBox) — the fallback; tested for `--max-redirect=0`, `--input-file=-`,
  and the private `wgetrc` file (`test/fast/Unit tests/nvm_wget_same_origin:84-88 @ ad42d90`)
- **awk / sed / grep / tr / find / ls / cat / tee / mv / mktemp** — the POSIX toolchain nvm
  shells out to; tests mock them to simulate failure and to prove certain paths never fork them
  (`test/fast/Unit tests/nvm_process_nvmrc does not show a symlinked .nvmrc's content:41-49 @ ad42d90`)
- **nodejs.org / iojs.org** — the external services (and their mirror overrides) whose URLs the
  auth header is scoped to (`test/fast/Unit tests/nvm_auth_header_applies_to:32-44 @ ad42d90`)
- **RFC 4648 (base64/base64url), RFC 7235 §2.1 (token68), RFC 6750 §2.1 (b64token)** — the
  standards the auth-header whitelist is built from
  (`test/fast/Unit tests/nvm_sanitize_auth_header:9-50 @ ad42d90`)
- **SIGINT/SIGTERM/SIGHUP** — interruption signals the download wrapper must survive and clean
  up after (`test/fast/Unit tests/nvm_wget_with_auth_header:175-185 @ ad42d90`)

## Worth exploring interactively

- **`nvm_download_artifact` verification gate** — (1) download to an unverified name
  (`test/fast/Unit tests/nvm_download_artifact only caches verified archives:53 @ ad42d90`),
  (2) compute and compare the checksum, (3) on mismatch remove the cache dir and exit 6
  (`:77-82 @ ad42d90`), (4) only on success move the file into the cache (`:90-95 @ ad42d90`).
  Fits **FlowAnimation** because the learner watches a tarball either get promoted into the
  cache or deleted, depending on one checksum comparison.
- **`nvm_wget_same_origin` redirect loop** — (1) wget runs with `--max-redirect=0`
  (`test/fast/Unit tests/nvm_wget_same_origin:84-88 @ ad42d90`), (2) a `-S` probe to
  `/dev/null` reads the `Location`, (3) same origin → re-run with the new URL; other origin →
  stop and error (`:112-132 @ ad42d90`, `:171-187 @ ad42d90`). Fits **StateMachine** because the
  download moves between *requested*, *probing*, *following*, and *refused* states per hop.

## Open questions

- This slice proves the assertions but does not show the `nvm.sh` implementation lines each test
  pins; the download-and-security and versions-and-nvmrc module notes hold the code side.
- The exact test *runner* (urchin vs. a plain loop) is not visible in these files, which are
  standalone `sh` scripts; build-and-infra owns `package.json` and the CI matrix.

## My insights
