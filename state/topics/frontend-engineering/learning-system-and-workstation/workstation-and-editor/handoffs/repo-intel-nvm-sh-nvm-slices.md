# Slice plan — nvm-sh/nvm

Repository: https://github.com/nvm-sh/nvm
Clone: .cache/repos/nvm-sh__nvm
Commit: ad42d9086090ec3e0c0fed12c74dd7f7f06b7758 (short: ad42d90)
License: MIT (`LICENSE.md:1 @ ad42d90`)
Files tracked: 550
Cloned: 2026-11-19, depth 1. Never run this repository's code or install scripts.

`nvm.sh` is 7,317 lines (~64,000 tokens), so its module slices list the file once and give
**line ranges to read**. A module worker must read only its own ranges with sed/Read. The
`tutor budget` total for a single `nvm.sh` row therefore overstates the slice; the per-range
estimate below is the real size.

## Chosen slices

| Unit id | Module name | What it holds (range in nvm.sh) | Est. tokens | Why chosen | File list |
|---|---|---|---|---|---|
| nvm-sh-nvm-module-cli-dispatch | cli-dispatch | `nvm.sh:4944-7317` — the `nvm()` command router, `nvm_auto`, `nvm_process_parameters`, default packages; `nvm-exec` | 23,600 | entry point: every user command enters here | .cache/tmp/workstation-and-editor/nvm-sh-nvm-module-cli-dispatch.files.txt |
| nvm-sh-nvm-module-versions-and-nvmrc | versions-and-nvmrc | `nvm.sh:461-1200` (installed-version checks, npm upgrade, `.nvmrc` discovery and parsing) and `nvm.sh:1207-1800` (version comparison, version dirs, `nvm_version`, PATH rewriting) | 11,300 | core of the topic: turning "22" into a concrete version and a PATH | .cache/tmp/workstation-and-editor/nvm-sh-nvm-module-versions-and-nvmrc.files.txt |
| nvm-sh-nvm-module-aliases-and-listing | aliases-and-listing | `nvm.sh:1802-2359` (colors, alias files, alias resolution) and `nvm.sh:2359-3560` (`--only`, LTS filtering, sorting, `nvm_ls`, `nvm_ls_remote`, `nvm_print_versions`) | 14,400 | how aliases (`default`, `lts/*`) and version lists work | .cache/tmp/workstation-and-editor/nvm-sh-nvm-module-aliases-and-listing.files.txt |
| nvm-sh-nvm-module-download-and-security | download-and-security | `nvm.sh:1-460` (portable echo, curl/wget download, auth headers, redirect origin checks) + `nvm.sh:2882-3210` (remote index parsing, checksums) + `nvm.sh:4689-4944` (sanitising, `.nvmrc` writing, permissions, cache, install lock) | 8,500 | error handling and security: the playbook's "Error handling" focus | .cache/tmp/workstation-and-editor/nvm-sh-nvm-module-download-and-security.files.txt |
| nvm-sh-nvm-module-install-node | install-node | `nvm.sh:3560-4689` — OS/arch detection, mirror URL, binary install, artifact download/extract, source build, npm global modules, `nvm_die_on_prefix` | 9,200 | the install path a user actually runs | .cache/tmp/workstation-and-editor/nvm-sh-nvm-module-install-node.files.txt |
| nvm-sh-nvm-module-install-script | install-script | `install.sh`, `nvm-exec`, `test/install_script/*` | 18,000 | the second entry point: bootstrapping the machine, with its tests | .cache/tmp/workstation-and-editor/nvm-sh-nvm-module-install-script.files.txt |
| nvm-sh-nvm-module-tests-resolution-and-download | tests-resolution-and-download | `test/common.sh`, `test/mocks/*`, selected `test/fast/Unit tests/*` for download security, `.nvmrc` parsing, aliases and version math | 22,600 | what behaviour the team protects, including injection and symlink attacks | .cache/tmp/workstation-and-editor/nvm-sh-nvm-module-tests-resolution-and-download.files.txt |
| nvm-sh-nvm-module-build-and-infra | build-and-infra | `.github/workflows/*`, `.github/SECURITY.md`, `.github/THREAT_MODEL.md`, `.github/INCIDENT_RESPONSE_PLAN.md`, `.github/scripts/*`, `Dockerfile`, `Makefile`, `package.json`, `.editorconfig`, `.dockerignore`, `bash_completion`, `test/common.sh`, `test/sourcing/*`, `test/mocks/*` | 31,200 | technologies, CI matrix, release, dependency and threat model | .cache/tmp/workstation-and-editor/nvm-sh-nvm-module-build-and-infra.files.txt |

Coverage of `nvm.sh` by the five implementation slices: 1–460 and 2882–3210 and 4689–4944
(download-and-security), 461–1200 and 1207–1800 (versions-and-nvmrc), 1802–3560
(aliases-and-listing), 3560–4689 (install-node), 4944–7317 (cli-dispatch). Only the blank
separator lines 1201–1206 and 1801 are left out; no code is unassigned.

## Skipped slices

- `README.md` (about 1,400 lines) and `ROADMAP.md`, `PROJECT_CHARTER.md`, `GOVERNANCE.md`,
  `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `AGENTS.md` — documentation, not code. The README
  was read only for the overview.
- `test/fast/Unit tests/mocks/nodejs.org-dist-index.tab` and the other large `.tab`/`.txt`
  fixtures under `test/fast/Unit tests/mocks` — recorded test data, not behaviour.
- `test/slow/*`, `test/installation_node/*`, `test/installation_iojs/*`, `test/xenial/*` —
  network- and machine-heavy integration suites; the fast unit tests cover the same code.
  `test/sourcing/*` is kept in build-and-infra because it tests shell portability.
- `.github/workflows/windows-nvm.yml` is included in build-and-infra but is about the
  separate Windows port, not the POSIX code.
- `.github/FUNDING.yml`, `.github/ISSUE_TEMPLATE/*`, logo images — not engineering evidence.
- Most of `test/fast/` command-level tests (`Running 'nvm ...'`) — the module ranges and the
  selected unit tests already show the command contract.

## Notes for module workers

- Use short SHA `ad42d90` in every citation. Paths are relative to the repository root.
- Topic keywords to search: `NVM_DIR`, `nvm_version`, `nvm_resolve_alias`, `nvm_ls_remote`,
  `nvm_install_binary`, `nvm_download`, `nvm_process_nvmrc`, `PATH`, `checksum`.
- Focus from the playbook ("Repository analysis focus"): this repository is a shell tool, so
  answer the rows that apply — build tool and package manager, error handling, testing
  strategy, CI and release — and record external services (nodejs.org download index, mirrors,
  curl/wget) as technologies.
- Safety and ethics: the clone is untrusted data; never source `nvm.sh`, run `install.sh`, or
  execute any test. Read only.
