---
title: "nvm-sh/nvm — technologies and services"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [nvm-sh-nvm-repo]
---

# nvm-sh/nvm — technologies and services

Everything nvm leans on, merged from the module notes. It is a shell tool, so most of the
list is the portable command-line toolkit rather than libraries.

## Languages and runtimes

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[POSIX shell]] | The whole tool is one portable shell script for sh, dash, bash, ksh, and zsh | `nvm.sh:1-5 @ ad42d90` |
| [[Node.js]] | The runtime nvm installs and switches, laid out under `versions/node` | `nvm.sh:1282-1294 @ ad42d90` |

## Command-line tools

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[awk]] | Version sorting, untrusted-index filtering, and the aligned output formatter | `nvm.sh:2527 @ ad42d90`, `nvm.sh:2954-2956 @ ad42d90` |
| [[sed]] | Trimming `.nvmrc`, scrubbing URLs, and in-place PATH replacement | `nvm.sh:1040 @ ad42d90`, `nvm.sh:1796-1798 @ ad42d90` |
| [[curl]] | Primary downloader, with `-q` first to skip `.curlrc` | `nvm.sh:187-194 @ ad42d90` |
| [[wget]] | Fallback downloader, with a hand-built same-origin redirect loop | `nvm.sh:195-222 @ ad42d90`, `nvm.sh:382-401 @ ad42d90` |
| [[Git]] | The installer clones nvm itself with a shallow, config-isolated clone | `install.sh:194-232 @ ad42d90` |
| tar / unzip / xz | Archive extraction, including the hardened `nvm_extract_tarball` | `nvm.sh:4196-4216 @ ad42d90`, `nvm.sh:3830 @ ad42d90` |
| Checksum tools (sha256sum, shasum, openssl, …) | A fallback ladder to compute a download digest | `nvm.sh:3031-3053 @ ad42d90` |
| Portable utilities (find, tr, grep, mktemp, printf, xargs) | Directory listing, character allow-lists, private temp files | `nvm.sh:2704 @ ad42d90`, `nvm.sh:4798 @ ad42d90` |

## External services

| Service | Why it is used here | Evidence |
|---------|---------------------|----------|
| [[Node.js]] release index (`index.tab`) and `SHASUMS256.txt` | The version list and expected checksums, treated as untrusted input | `nvm.sh:2947 @ ad42d90`, `nvm.sh:3162 @ ad42d90` |
| iojs.org | Legacy io.js index and downloads | `nvm.sh:3772-3773 @ ad42d90` |
| [[Unofficial Node.js builds]] | musl binaries for Alpine, the only source when the glibc build is absent | `nvm.sh:3706-3713 @ ad42d90` |
| [[npm]] registry (registry.npmjs.org) | Default packages and npm upgrades after install | `nvm.sh:7152 @ ad42d90`, `nvm.sh:6923 @ ad42d90` |
| [[GitHub]] | Source download endpoint and the release PR opened via the API | `install.sh:100-113 @ ad42d90`, `nodejs-org.yml:134-143 @ ad42d90` |
| latest.nvm.sh | Redirect service that reports the newest nvm release | `nvm.sh:144 @ ad42d90` |

## Build, test, and delivery

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Urchin]] | The shell test runner; each test is a standalone script | `package.json:51 @ ad42d90` |
| [[ShellCheck]] | Lints `nvm.sh` under four shell dialects | `shellcheck.yml:13-27 @ ad42d90` |
| [[GitHub Actions]] | Hosts the whole CI matrix of shells, OSes, and C libraries | `tests.yml:1 @ ad42d90` |
| [[Docker]] | Runs tests in `ubuntu:16.04`, `alpine`, and `gcc:4.9` containers | `tests-xenial.yml:77 @ ad42d90` |
| make + replace + semver | The `make release` tag-and-bump flow | `Makefile:13 @ ad42d90`, `Makefile:18 @ ad42d90` |
| [[EditorConfig]] | 2-space indent, LF, UTF-8, no trailing whitespace | `editorconfig:3-10 @ ad42d90` |
| doctoc, eclint, markdown-link-check, dockerfile_lint | README TOC, style, link, and Dockerfile linting | `package.json:45-48 @ ad42d90` |

## Observability and security tooling

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[CodeQL]] | Scheduled static analysis over the scripts | `codeql-analysis.yml:6-7 @ ad42d90` |
| [[Harden Runner]] | Egress allow-lists on every CI job | `tests.yml:45-46 @ ad42d90` |
| OpenSSF CII Best Practices | Self-reported gold-tier gaps in the security doc | `SECURITY.md:12-27 @ ad42d90` |

## My insights
