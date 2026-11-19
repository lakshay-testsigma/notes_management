---
title: "nvm-sh/nvm — module aliases-and-listing"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [nvm-sh-nvm-repo]
---

# nvm-sh/nvm — module: aliases-and-listing

## Responsibility

This slice turns a user's shorthand (`default`, `lts/*`, `node`, `22`) into a concrete
version, and prints the lists of installed and available versions. It owns the alias
files, the alias resolver, the LTS-status cache, the `--only` category filter, the
version sorter, and the two listing commands `nvm ls` and `nvm ls-remote`.

## Key files

| File | Role |
|------|------|
| `nvm.sh:1802-2359` | Colors, alias files, alias creation, listing, and resolution |
| `nvm.sh:2359-3560` | `--only` filtering, version sorting, `nvm_ls`, `nvm_ls_remote`, the version formatter |

## How it works

An alias is a plain text file under `$NVM_DIR/alias/` whose name is the alias and whose
content is the target version (`nvm.sh:2063 @ ad42d90`). `lts/*` aliases are not typed by
hand: `nvm ls-remote` regenerates them from the downloaded `index.tab` (`nvm.sh:2959-2982
@ ad42d90`).

1. `nvm_resolve_alias` reads an alias file, strips flags like `--lts`, and loops while the
   target is itself an alias, recording each seen name (`nvm.sh:2224-2258 @ ad42d90`).
2. On a cycle it stops and returns the sentinel `∞` instead of recursing forever
   (`nvm.sh:2246-2258 @ ad42d90`).
3. `nvm_ls` matches a pattern against the installed directories under
   `versions/node/` and `versions/iojs/` with a `find`/`sed` pipeline, then sorts them
   (`nvm.sh:2704-2718 @ ad42d90`).
4. `nvm_ls_remote` downloads `index.tab`, filters it, records LTS status, and prints
   matching rows through `nvm_sort_versions` (`nvm.sh:2805 @ ad42d90`,
   `nvm.sh:2947-3029 @ ad42d90`).

## Beyond the textbook

### Alias cycles resolve to `∞`, not a hang

- Textbook version: follow the alias chain recursively until the chain ends or overflows.
- What they do: `nvm_resolve_alias` keeps a newline-delimited `SEEN_ALIASES` string and,
  when a target appears twice, breaks the loop and returns `∞` (the "infinite" marker).
- Why: an alias like `default -> foo -> default` must not recurse forever; `∞` also makes
  the broken alias visible in listings as "not installed".
- Evidence: `nvm.sh:2246-2258 @ ad42d90`

### Alias names can contain slashes, but never `..`

- Textbook version: write the target to a file named after the alias without checking it.
- What they do: both `nvm_make_alias` (write) and `nvm_alias` (read) reject any alias whose
  path contains a `..` component, before the name touches the filesystem.
- Why: `lts/iron` is a legal name with a slash, but a `..` would escape the alias directory
  and read or write outside it.
- Evidence: `nvm.sh:2056-2062 @ ad42d90`, `nvm.sh:2156-2163 @ ad42d90`

### An unreadable alias file succeeds with empty output

- Textbook version: any failure to read the alias file returns a nonzero status.
- What they do: if the file exists but is unreadable, `nvm_alias` prints nothing and
  returns 0, while a missing file returns 2.
- Why: a nonzero status would make `nvm_ensure_default_set` overwrite an existing default
  alias it merely could not read.
- Evidence: `nvm.sh:2172-2178 @ ad42d90`

### Semver ordering in pure `awk`, without GNU `sort -V`

- Textbook version: sort version strings lexicographically, or depend on GNU `sort -V`.
- What they do: `nvm_sort_versions` parses each version in `awk`, pads numeric prerelease
  identifiers to 20 digits, and sorts so prereleases precede their release and
  `v24.0.0-rc.2` sorts before `v24.0.0-rc.10`.
- Why: the script must run on macOS and BSD where `sort -V` does not exist, and lexicographic
  sort is wrong for numeric prerelease components.
- Evidence: `nvm.sh:2521-2557 @ ad42d90`

### The downloaded `index.tab` is treated as untrusted input

- Textbook version: print whatever the mirror returns.
- What they do: before printing, storing an LTS alias, or matching a pattern, `nvm_ls_remote_index_tab`
  keeps only rows whose version and LTS codename match strict regular expressions.
- Why: the mirror response is untrusted; a malformed or hostile row must not become an
  alias or corrupt the LTS record.
- Evidence: `nvm.sh:2952-2956 @ ad42d90`

### LTS status is recorded atomically, only when a full index arrives

- Textbook version: write the LTS map straight to the final file.
- What they do: `nvm_record_lts_status` writes to a `mktemp` file and `mv -f`s it into place,
  and refuses to start a record unless at least one row has an LTS name, so an error page or
  partial download cannot wipe the existing map.
- Why: a crash mid-write or a truncated index must not leave a half-written status cache.
- Evidence: `nvm.sh:2821-2849 @ ad42d90`

## Tests and what they protect

This slice has no test files; the tests for alias resolution, `.nvmrc` parsing, and version
math live in the `tests-resolution-and-download` slice. The code itself documents the cases
worth protecting: the `..` path guard (`nvm.sh:2056-2062 @ ad42d90`), the partial-prerelease
boundary so `v24.0.0-rc.1` does not match `v24.0.0-rc.10` (`nvm.sh:2692-2697 @ ad42d90`,
`nvm.sh:2719-2726 @ ad42d90`), and the `--only` value validation (`nvm.sh:2383-2388 @ ad42d90`).

## Error handling, performance, and security

- Invalid input is rejected with distinct exit codes and a named source: `nvm_normalize_only`
  returns 55 for a bad `--only` list (`nvm.sh:2384-2386 @ ad42d90`), and `nvm_resolve_only`
  returns 55 when `--only` is given twice or conflicts with `--lts` (`nvm.sh:2398-2401 @
  ad42d90`, `nvm.sh:2412-2422 @ ad42d90`).
- Security is concentrated in path and input guards: the `..` rejections, the untrusted
  `index.tab` filter, and control-character filtering in `nvm_get_remote_aliases`
  (`nvm.sh:3193-3203 @ ad42d90`).
- Performance: listing aliases launches each print in a background subshell and `wait`s,
  then pipes to `command sort`; the comment notes bash 3.2 otherwise drops output from
  nested `command` calls in them (`nvm.sh:2088-2122 @ ad42d90`). LTS status is fetched once
  and cached, and refused offline (`nvm.sh:2851-2860 @ ad42d90`).

## Technologies and services seen

- **POSIX shell** (bash/sh/dash/zsh/ksh) — the whole file is a shell library; zsh options are
  scoped with `setopt local_options` and the shell is detected with `nvm_is_zsh`
  (`nvm.sh:2087 @ ad42d90`, `nvm.sh:2129 @ ad42d90`).
- **awk** — does all version sorting, category filtering, and the aligned output formatter
  (`nvm.sh:2527 @ ad42d90`, `nvm.sh:2479 @ ad42d90`, `nvm.sh:3285 @ ad42d90`).
- **sed** — escapes pattern metacharacters and rewrites directory paths back into version
  strings (`nvm.sh:2705-2716 @ ad42d90`).
- **find** — lists installed version directories in `nvm_ls` (`nvm.sh:2704 @ ad42d90`).
- **nodejs.org / iojs.org `index.tab`** — the external download index that `nvm ls-remote`
  fetches through the mirror (`nvm.sh:2947 @ ad42d90`).
- **`nvm_get_mirror`** — resolves the mirror URL for a flavor and type, including user
  mirrors (`nvm.sh:2897 @ ad42d90`).
- **checksum tools** (`sha256sum`, `shasum`, `sha256`, `gsha256sum`, `openssl`, `bssl`,
  `sha1sum`, `sha1`) — a fallback chain that picks the available verifier without relying on
  a shell alias (`nvm.sh:3031-3053 @ ad42d90`).

## Worth exploring interactively

- **Alias resolution with cycle detection** — start with `default -> foo`, `foo -> default`.
  Steps: read the alias (`nvm.sh:2225 @ ad42d90`), strip `--lts` flags
  (`nvm.sh:2229-2237 @ ad42d90`), check `SEEN_ALIASES` and set `∞` on a repeat
  (`nvm.sh:2246-2252 @ ad42d90`), emit the final version (`nvm.sh:2260-2277 @ ad42d90`).
  Fits **AlgorithmStepper** because the learner watches the seen-set grow and the sentinel
  appear when the chain closes.
- **A pattern string moving through `nvm_ls`** — follow `nvm ls 22` from the pattern
  rewrite (`nvm.sh:2640-2646 @ ad42d90`), through the `find`/`sed` directory match
  (`nvm.sh:2704-2718 @ ad42d90`), into `nvm_sort_versions` (`nvm.sh:2526-2556 @ ad42d90`).
  Fits **FlowAnimation** because a version string visibly transforms at each filter.

## Open questions

- `nvm_print_implicit_alias` continues past this slice's end at line 3560; the
  stable/unstable classification it finishes belongs to the `install-node` slice.
- `nvm_download` and `nvm_get_mirror` are defined in the `download-and-security` slice, so
  the exact transport behaviour (curl vs wget, redirect checks) is not visible here.

## My insights
