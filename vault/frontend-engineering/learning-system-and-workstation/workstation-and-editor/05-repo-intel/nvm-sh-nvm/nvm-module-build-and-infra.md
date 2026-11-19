---
title: "nvm-sh/nvm — module build-and-infra"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [nvm-sh-nvm-repo]
---

# nvm-sh/nvm — module: build-and-infra

## Responsibility

This slice is everything that is not the POSIX shell tool itself: the CI matrix, the release
machinery, the dev container, and the security paperwork. Its job is to prove that a single
~7,000-line shell script keeps working across four shells (`sh`, `bash`, `dash`, `zsh`), three
operating systems, two C libraries (glibc and musl), two architectures, and a long tail of old
Node.js versions — and to release it without a human making a mistake. It also holds the one
document in the repo that states what the tool trusts and what it does not.

## Key files

| File | Role |
|------|------|
| `.github/workflows/tests.yml` | Core urchin matrix: shell × test suite, with a 3-attempt timeout retry loop |
| `.github/workflows/tests-fast.yml` | Fast suite on Linux, macOS, and WSL, plus an awk-variant matrix (gawk/mawk) |
| `.github/workflows/tests-alpine.yml` | musl coverage on Alpine containers, incl. a "same-era diagonal" musl-binary regression lock |
| `.github/workflows/tests-installation-node.yml`, `tests-installation-iojs.yml`, `tests-xenial.yml` | Full install tests inside `ubuntu:16.04` and `gcc:4.9` containers |
| `.github/workflows/shellcheck.yml` | Lints `nvm.sh` as `bash`/`sh`/`dash`/`ksh`; `install.sh`, `bash_completion`, `nvm-exec` as bash |
| `.github/workflows/lint.yml` | EditorConfig, Dockerfile, README TOC, test-file naming, and exec-bit checks |
| `.github/workflows/release.yml` | Dry-runs the `make release` tag-and-bump flow against a fake `99.99.99` |
| `.github/workflows/nodejs-org.yml` | Opens a PR on `nodejs/nodejs.org` to bump the install snippet after a release |
| `.github/workflows/nvm-install-test.yml` | Re-installs every recent tag from scratch, incl. an expected-failure check |
| `.github/scripts/docker-image.sh` | Caches container images keyed by registry digests, verified on every load |
| `.github/scripts/apt-install.sh` | `apt-get` with exponential backoff to ride out mirror outages |
| `Makefile`, `package.json`, `Dockerfile`, `.editorconfig`, `.dockerignore` | Build, test tooling, dev container, and file-style rules |
| `.github/SECURITY.md`, `THREAT_MODEL.md`, `INCIDENT_RESPONSE_PLAN.md` | Vulnerability reporting, the written trust model, and the response timeline |
| `bash_completion` | Tab completion that deliberately avoids `compgen -W` |
| `test/common.sh`, `test/sourcing/*`, `test/mocks/*` | Shared test helpers, shell-portability sourcing tests, and OS-detection mocks |

## How it works

The release and verification loop runs like this:

1. Every push and pull request runs the fast suite on Linux (shell × awk), macOS, and WSL
   (`.github/workflows/tests-fast.yml:9-190 @ ad42d90`), plus the slow/install suites in
   containers pinned to old distributions (`tests-xenial.yml:78-116 @ ad42d90`,
   `tests-installation-node.yml:81-126 @ ad42d90`).
2. Every job first hardens the runner with `step-security/harden-runner` and an explicit
   allow-list of network endpoints the step may contact (`tests.yml:45-55 @ ad42d90`).
3. The fast suite hides the system `node` before running so an active version cannot skew the
   output, then restores it in an `if: always()` step (`tests-fast.yml:83-101 @ ad42d90`).
4. On a release, `nodejs-org.yml` extracts the tag, forks `nodejs/nodejs.org`, edits the one
   install snippet file through the GitHub API, and opens a PR — all without `git push` scope
   (`nodejs-org.yml:89-168 @ ad42d90`). A separate workflow dry-runs the `make release` tag
   flow against a throwaway version (`release.yml:34-40 @ ad42d90`).
5. `tests-alpine.yml` separately proves a musl binary can be installed with the source fallback
   forbidden, using the unofficial-builds mirror (`tests-alpine.yml:180-210 @ ad42d90`).

## Beyond the textbook

### A written trust boundary between payloads and metadata

- Textbook version: a downloader checks a SHA-256 and moves on; "integrity" is treated as one
  thing.
- What they do: the threat model draws an explicit line between *payloads* (Node binaries and
  source tarballs, which execute arbitrary code by design the moment you install them) and
  *metadata* (the `index.tab` version list, LTS codenames, `SHASUMS` files), which is "hostile
  input" even when no mirror is misconfigured (`THREAT_MODEL.md:111-138 @ ad42d90`).
- Why: checksums come from the same origin as the payload, so they prove integrity but not
  authenticity against a malicious mirror. That makes metadata parsing the only place a
  code-execution bug is a *defect* rather than the user's explicit choice — so the invariant is
  that mirror metadata never reaches a shell/`awk`/`sed` evaluator (`THREAT_MODEL.md:134-138 @ ad42d90`).
- Evidence: `THREAT_MODEL.md:111-141 @ ad42d90`

### Supply-chain hardening of the CI runner itself

- Textbook version: a workflow runs `actions/checkout` and the test command.
- What they do: every job begins with `step-security/harden-runner` and a hand-written
  `allowed-endpoints` list of the exact hosts and ports the step may contact — for example the
  fast suite allows `nodejs.org`, `iojs.org`, `registry.npmjs.org`, and the Docker Hub CDN, and
  nothing else (`tests-fast.yml:33-48 @ ad42d90`).
- Why: if a dependency is compromised, a step with open egress can exfiltrate tokens or data.
  Pinning egress to the known mirrors makes an unexpected network call fail loudly.
- Evidence: `tests-fast.yml:33-48 @ ad42d90`, `tests.yml:45-55 @ ad42d90`

### Docker image cache verified against live registry digests

- Textbook version: cache a container image tarball keyed by a tag name.
- What they do: `docker-image.sh` looks up the image's index, manifest, and config digests from
  the registry *now*, caches keyed on the config digest, and on load only uses the tarball if
  its image ID matches one of those digests (`docker-image.sh:3-4 @ ad42d90`,
  `docker-image.sh:78-84 @ ad42d90`).
- Why: a tag can move, so a cache keyed by tag could serve a stale or poisoned image; "a cached
  image is only used if it is exactly what the registry serves now" (`docker-image.sh:3 @ ad42d90`).
- Evidence: `docker-image.sh:41-104 @ ad42d90`

### A test that asserts a bug is *still broken*

- Textbook version: CI checks that code works; a fix is always an improvement.
- What they do: `nvm-install-test.yml` re-installs every tag from the last four years, and for
  `v0.40.0` with a `.nvmrc` present it flips the job logic so that *success is treated as
  failure* — the known bug is expected, and a silent fix turns the job red
  (`nvm-install-test.yml:114-127 @ ad42d90`).
- Why: this is a regression lock on an accident: if a refactor makes `v0.40.0` start working,
  the "fix" is untracked and the workflow forces someone to notice and remove the guard.
- Evidence: `nvm-install-test.yml:83-127 @ ad42d90`

### Same-era "diagonal" matrix for the musl binary

- Textbook version: test "latest on latest".
- What they do: the musl-binary job pairs each old Node line with the Alpine release of its own
  era (`x64/alpine 3.10` with `v8.17.0` through `x64/alpine 3` with `v22.12.0`), because a
  modern musl node needs a newer `libstdc++` than old Alpine ships (`tests-alpine.yml:124-146 @ ad42d90`).
- Why: testing only the newest Alpine would miss the glibc/musl-ABI mismatches that real users
  on old distros hit.
- Evidence: `tests-alpine.yml:127-146 @ ad42d90`

### Cross-repo release via the GitHub API instead of `git push`

- Textbook version: a release workflow pushes a commit to another repo with a deploy key.
- What they do: the workflow forks `nodejs/nodejs.org`, writes the bumped file directly with
  `gh api ... -X PUT`, then opens a PR — explicitly "avoids git push workflow scope requirement"
  (`nodejs-org.yml:134-143 @ ad42d90`), and is gated to run only on the upstream repo by the
  maintainer (`nodejs-org.yml:19 @ ad42d90`).
- Why: content-only writes need no `contents: write` scope, shrinking the blast radius of a
  leaked token to the one file it edits.
- Evidence: `nodejs-org.yml:19 @ ad42d90`, `nodejs-org.yml:134-143 @ ad42d90`

## Tests and what they protect

The CI matrix is the test of record. The fast suite runs `sh`, `bash`, `dash`, and `zsh` (ksh is
commented out, see `Makefile:20 @ ad42d90`) on Linux, macOS, and WSL, and additionally crosses
shell with awk variant (`gawk` and `mawk`) because version math depends on awk behaviour
(`tests-fast.yml:20-30 @ ad42d90`). macOS runs bash 3.2 rather than the Linux 5.x, which is why
it has its own job (`tests-fast.yml:108 @ ad42d90`).

The sourcing tests in `test/sourcing/*` each source `nvm.sh` in a clean shell and assert the
startup default-selection contract: sourcing keeps an already-active version
(`test/sourcing/Sourcing nvm.sh should keep version if one is active:14-20 @ ad42d90`), installs
the default with `--install` (`test/sourcing/Sourcing nvm.sh with --install should install the default:21-30 @ ad42d90`),
and — in zsh — leaves the user's `extendedglob` option on rather than clobbering it
(`test/sourcing/Sourcing nvm.sh with zsh extendedglob should use the default:21-25 @ ad42d90`).
One test reproduces the oh-my-zsh/yadr global-alias collision (`test/sourcing/Sourcing nvm.sh global alias bug:5-16 @ ad42d90`).

The test harness itself is worth noting: `try` and `try_err` capture stdout/stderr and the exit
code into variables for later `die` assertions (`test/common.sh:10-25 @ ad42d90`), and
`make_fake_curl` installs a real executable named `curl` on the `PATH` — necessary because
`nvm_download` deliberately uses `command curl`, which bypasses shell functions and aliases
(`test/common.sh:53-84 @ ad42d90`). Mocks for `uname`, `isainfo`, and `pkg_info` stand in for
Solaris/SmartOS platform detection (`test/mocks/isainfo_amd64:1-5 @ ad42d90`,
`test/mocks/pkg_info_amd64:1-4 @ ad42d90`).

## Error handling, performance, and security

**Error handling.** Network flakiness is treated as normal, not exceptional. `apt-install.sh`
retries update+install with exponential backoff capped at 120 s over eight attempts
(`apt-install.sh:33-51 @ ad42d90`); `docker-image.sh` retries `docker pull` five times
(`docker-image.sh:88-97 @ ad42d90`); the core test runner wraps `make` in three attempts and only
re-runs on a *timeout* exit code 124, not on a genuine test failure (`tests.yml:74-84 @ ad42d90`).

**Security.** The egress allow-lists under `harden-runner` appear in every workflow. The
`release.yml` dry-run and the nodejs.org PR workflow use the least-privilege `contents: read`
permission at the workflow level and only add `contents: write` where a commit is actually made
(`toc.yml:5-11 @ ad42d90`). The `bash_completion` avoids `compgen -W` because "it expands every
word (including command substitution)" — completion words include alias and directory names
that must never be re-evaluated as code (`bash_completion:14-16 @ ad42d90`). Security reporting
escalates to the OpenJS Foundation CNA if unacknowledged in six days (`SECURITY.md:5-9 @ ad42d90`).

**Performance.** The only "performance" concern here is CI wall-clock and disk: images are
pulled through Google's Docker Hub mirror `mirror.gcr.io` because it is "not subject to Docker
Hub's anonymous pull rate limits" (`tests-alpine.yml:72-74 @ ad42d90`), and images are cached
with `actions/cache` keyed on the resolved digest (`tests-alpine.yml:78-85 @ ad42d90`).

## Technologies and services seen

- **GitHub Actions** — the CI host; every workflow is `.github/workflows/*.yml` (e.g. `tests.yml:1 @ ad42d90`).
- **step-security/harden-runner** — blocks unexpected network egress per step (`tests.yml:45-46 @ ad42d90`).
- **urchin** — the shell test runner (`package.json:51 @ ad42d90`; invoked as `URCHIN="$(npx which urchin)"` in `tests.yml:76 @ ad42d90`).
- **shellcheck** — lints `nvm.sh` under four shell dialects (`shellcheck.yml:13-27 @ ad42d90`); installed via Homebrew (`shellcheck.yml:42 @ ad42d90`) and in the Dockerfile (`Dockerfile:63-67 @ ad42d90`).
- **semver** — validates and increments version numbers in `make release` (`Makefile:13 @ ad42d90`, `package.json:50 @ ad42d90`).
- **replace** — bumps the version string across `nvm.sh install.sh README.md package.json` (`Makefile:18 @ ad42d90`, `Makefile:106 @ ad42d90`).
- **dockerfile_lint** — lints the Dockerfile (`package.json:45 @ ad42d90`; `lint.yml:26-43 @ ad42d90`).
- **doctoc** — regenerates the README table of contents (`package.json:46 @ ad42d90`; `lint.yml:45-60 @ ad42d90`).
- **eclint** — checks EditorConfig compliance across the tree (`package.json:47 @ ad42d90`).
- **markdown-link-check** — validates every `.md` link (`package.json:48 @ ad42d90`).
- **CodeQL** — scheduled static analysis (`codeql-analysis.yml:6-7 @ ad42d90`, `codeql-analysis.yml:29-52 @ ad42d90`).
- **ljharb/actions** — reusable node install/matrix, rebase, and require-allow-edits actions (`latest-npm.yml:21 @ ad42d90`, `rebase.yml:11 @ ad42d90`, `require-allow-edits.yml:18 @ ad42d90`).
- **Vampire/setup-wsl** — provisions WSL distros on Windows runners (`tests-fast.yml:194 @ ad42d90`).
- **Docker + `mirror.gcr.io`** — runs tests in `ubuntu:16.04`, `alpine`, and `gcc:4.9` containers, pulled via Google's Docker Hub mirror (`tests-xenial.yml:77 @ ad42d90`, `tests-installation-iojs.yml:129 @ ad42d90`).
- **actions/cache** — caches the resolved container-image tarball (`tests-alpine.yml:78-85 @ ad42d90`).
- **EditorConfig** — 2-space indent, LF, UTF-8, trailing-whitespace trim (`editorconfig:3-10 @ ad42d90`).
- **External services**: `nodejs.org`, `iojs.org`, `unofficial-builds.nodejs.org` (musl builds), `registry.npmjs.org`, `raw.githubusercontent.com`, `api.github.com`, `dl-cdn.alpinelinux.org`, and Ubuntu/Debian/Cygwin mirrors — each listed in an `allowed-endpoints` block (e.g. `tests-alpine.yml:40-53 @ ad42d90`).
- **OpenSSF CII Best Practices** — the project self-reports gold-tier gaps in `SECURITY.md` (`SECURITY.md:12-27 @ ad42d90`).

## Worth exploring interactively

- **The musl-binary install path** — step through `tests-alpine.yml:180-210 @ ad42d90`: set
  `NVM_NODEJS_ORG_MIRROR` to `unofficial-builds.nodejs.org`, source `nvm.sh --no-use`, then
  `nvm install -b --skip-default-packages` (the `-b` forbids the source fallback), `nvm use`,
  and finally `ldd "$(command -v node)" | grep -qi musl` to prove the binary really is musl.
  Fits **FlowAnimation** because the learner sees the download, checksum, use, and verify steps
  move a version from a mirror string to a running binary.

- **`docker-image.sh resolve → ensure`** — step through `docker-image.sh:29-104 @ ad42d90`:
  `resolve` fetches the manifest list, picks the manifest for the runner's OS/arch, and prints
  the config digest as the cache key; `ensure` loads the tarball only if its image ID is in
  those digests, else pulls and re-verifies. Fits **AlgorithmStepper** because the learner
  watches a cached artifact either pass or fail a digest check and get replaced.

## Open questions

- The `.dockerignore` lists `v*` and `alias` (`.dockerignore:3-4 @ ad42d90`) — build-local
  artifacts excluded from the dev image, but this slice does not show where they are produced.
- `windows-nvm.yml` includes a `cygwin_matrix` and `msys_matrix` with `continue-on-error: true`
  (`windows-nvm.yml:52-54 @ ad42d90`) — these are the separate Windows port's environment, and
  their pass/fail threshold is not visible here.
- The `nodejs-org.yml` workflow gated on `github.actor == 'ljharb'` (`nodejs-org.yml:19 @ ad42d90`)
  means the release automation has a single-human bus factor; the synthesis may weigh this
  against the maintainer-gap the security doc itself admits (`SECURITY.md:26 @ ad42d90`).

## My insights
