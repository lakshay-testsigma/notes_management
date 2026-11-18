---
title: "conventional-changelog/commitlint — module build-and-infra"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, workstation, repo-intel]
created: 2026-11-18
sources: [conventional-changelog-commitlint-repo]
---

# conventional-changelog/commitlint — module: build-and-infra

Coverage: selected first-party files only: root `package.json`, `pnpm-workspace.yaml`, `lerna.json`, `vitest.config.ts`, `Dockerfile.ci`, four workflows, `CONTRIBUTING.md`, `AGENTS.md`, `.husky/*`, `.mise.toml`, one script, and two package manifests. This is not a whole-repository inventory. The lock file and transitive dependencies are excluded.

## Responsibility

This slice shows how the project pins its tools (Node and pnpm), builds a many-package repository, tests it, checks every change in CI, and publishes it. It also shows the git hooks the project runs on its own commits.

## Key files

| File | Role |
|------|------|
| `package.json` | Root scripts, dev tools, `engines`, `packageManager`, commit lint config, Renovate config |
| `pnpm-workspace.yaml` | Workspace folders and supply-chain settings |
| `lerna.json` | Version and publish tool settings |
| `vitest.config.ts` | Test runner settings |
| `.github/workflows/CI.yml` | Build, test, quality and apt-Node jobs |
| `Dockerfile.ci` | Builds the published container image |
| `.husky/commit-msg`, `.husky/pre-commit` | Local git hooks |
| `.mise.toml` | Tool versions for a local setup |

## How it works

1. A contributor installs the pinned pnpm version, named by `packageManager` (`package.json:89 @ d2be18a`). The guide says to use mise or a direct install (`.github/CONTRIBUTING.md:81-86 @ d2be18a`).
2. `pnpm install` links the packages in the folders `@commitlint/*`, `@packages/*` and `@alias/*` (`pnpm-workspace.yaml:1-4 @ d2be18a`).
3. `pnpm build` runs `tsc -b`, the TypeScript project build (`package.json:29 @ d2be18a`).
4. `pnpm test` runs `vitest run --coverage` (`package.json:46 @ d2be18a`). The config sets a 15-second timeout, type checking, a fixed `HOME` and `LANG`, and `NO_COLOR` (`vitest.config.ts:5-12 @ d2be18a`).
5. On `git commit`, husky runs `pnpm lint-staged` and then `pnpm build` (`.husky/pre-commit:1-5 @ d2be18a`). It then lints the message with the repository's own built CLI: `node @commitlint/cli/lib/cli.js --edit $1` (`.husky/commit-msg:1 @ d2be18a`). `prepare` runs `husky` after install, so hooks arrive with `pnpm install` (`package.json:47 @ d2be18a`).
6. On push or pull request, GitHub Actions installs with `--frozen-lockfile`, builds and tests (`.github/workflows/CI.yml:53-60 @ d2be18a`).
7. A maintainer publishes with `pnpm run publish`, which runs `npm whoami && lerna publish --conventional-commits` (`package.json:43 @ d2be18a`; `.github/CONTRIBUTING.md:160 @ d2be18a`).

## Beyond the textbook

### Three layers of Node and pnpm pinning

- Textbook version: write one `.nvmrc` file, or nothing.
- What they do: `engines.node` is `>=22.12.0` and `engines.pnpm` is `>=11` (`package.json:85-88 @ d2be18a`). `packageManager` pins an exact pnpm version plus a sha512 hash of its tarball (`package.json:89 @ d2be18a`). `.mise.toml` pins the tools for a local shell as Node `22` and pnpm `12` (`.mise.toml:1-3 @ d2be18a`). Each published package repeats `engines.node >=22.12.0` (`@commitlint/cli/package.json:57-58 @ d2be18a`, `@commitlint/load/package.json:54-55 @ d2be18a`). No `.nvmrc` or `.node-version` file was found in the clone root listing.
- Why: `engines` is the floor users need; `packageManager` is the exact version contributors and CI use. CI reads that one field and does not repeat the number: "pnpm version is sourced from package.json `packageManager` field" (`.github/workflows/CI.yml:44-46 @ d2be18a`).
- Evidence: the lines above. Note `engineStrict` is off on purpose because dependency engines resolve above the project floor (`pnpm-workspace.yaml:30-32 @ d2be18a`).

### Corepack replaced by a hash-verified install

- Textbook version: run `corepack enable` and let it fetch the pinned package manager.
- What they do: `Dockerfile.ci` reads the version and hash from `packageManager`, runs `npm pack`, checks the sha512 and installs the tarball globally (`Dockerfile.ci:9-13 @ d2be18a`). The comment says corepack was removed from Node 25+ and cannot install pnpm 12 or later (`Dockerfile.ci:6-8 @ d2be18a`). A CI job also avoids corepack because the one shipped with stock Ubuntu Node fails on pnpm 11 (`.github/workflows/CI.yml:136-142 @ d2be18a`).
- Why: corepack support is not guaranteed across Node versions, so the pin is read with `node -p` and verified by hand.
- Evidence: `Dockerfile.ci:6-15 @ d2be18a`.

### Supply-chain settings in the workspace file

- Textbook version: `pnpm install` and trust whatever the registry returns.
- What they do: install scripts are denied unless listed in `allowBuilds` (`pnpm-workspace.yaml:8-11 @ d2be18a`). `strictDepBuilds: true` fails the install on an unlisted build script, `verifyDepsBeforeRun: error` refuses stale `node_modules`, and `minimumReleaseAge: 2880` (minutes, two days) blocks freshly published versions (`pnpm-workspace.yaml:33-35 @ d2be18a`). Renovate waits three days (`package.json:93 @ d2be18a`), and the comment says pnpm's wait must stay shorter (`pnpm-workspace.yaml:16-19 @ d2be18a`).
- Why: a compromised release should not reach the lock file. The file also records a rejected setting, `resolutionMode: time-based`, because it caused a mass downgrade (`pnpm-workspace.yaml:24-28 @ d2be18a`).
- Evidence: `pnpm-workspace.yaml:13-35 @ d2be18a`.

### CI matrix, plus a job with no setup-node

- Textbook version: one job on one Node version.
- What they do: the `build` job runs on four operating systems (two Ubuntu, two Windows) and Node 22 and 24, so eight combinations (`.github/workflows/CI.yml:35-39 @ d2be18a`). A separate job installs Node from stock Ubuntu apt packages inside an `ubuntu:26.04` container and warns not to replace this with `setup-node`, because that would make the job pointless (`.github/workflows/CI.yml:113-134 @ d2be18a`). It has a 15-minute timeout against apt mirror hangs (`.github/workflows/CI.yml:114-115 @ d2be18a`).
- Why: it checks the package works with the Node a Linux user gets from the distribution.
- Evidence: `.github/workflows/CI.yml:102-152 @ d2be18a`.

### Which events run CI on pull requests

- Textbook version: `on: [push, pull_request]`.
- What they do: CI triggers on push to every branch except merge-queue branches, on `pull_request` (opened, synchronize), on `merge_group`, by hand, and daily by cron (`.github/workflows/CI.yml:3-22 @ d2be18a`). The jobs skip a pull request whose head is in the same repository, so a branch is built once by the push event and only fork pull requests run through the PR event (`.github/workflows/CI.yml:26-30 @ d2be18a`). The schedule runs only in the upstream organization (`.github/workflows/CI.yml:31-34 @ d2be18a`). The merge queue check tests the exact merge result, so a stale branch cannot break master (`.github/workflows/CI.yml:13-16 @ d2be18a`).
- Why: avoid double runs and protect the main branch.
- Evidence: lines above. Another workflow runs on pull requests only when `Dockerfile.ci` changes (`.github/workflows/container-build.yml:8-10 @ d2be18a`).

### Commitlint lints its own commits, with rules from itself

- Textbook version: add a commit-msg hook with a shared config.
- What they do: the root `commitlint` key extends two workspace packages (`package.json:79-84 @ d2be18a`), and the commit-msg hook runs the freshly built CLI from the same repository (`.husky/commit-msg:1 @ d2be18a`). That is why pre-commit rebuilds first, "to build with up to date source" (`.husky/pre-commit:3-5 @ d2be18a`). `AGENTS.md` says the history is held to the standard and defines the type for each kind of change (`AGENTS.md:7-13 @ d2be18a`). The merge queue squashes, so the pull request title becomes the commit on master (`AGENTS.md:17 @ d2be18a`).
- Why: it tests the tool on real use, and the version numbers are computed from commit types by `lerna publish --conventional-commits` (`package.json:43 @ d2be18a`).
- Evidence: lines above.

### A guard script for a lint rule that does not exist

- Textbook version: rely on the linter.
- What they do: after moving from eslint to oxlint, a script scans tracked `*.test.*` files for `it.only`, `describe.only` and similar forms, and exits 1 if found (`scripts/check-no-focused-tests.js:26-27 @ d2be18a`, `scripts/check-no-focused-tests.js:60-62 @ d2be18a`). It runs in CI (`.github/workflows/CI.yml:95-100 @ d2be18a`) and in lint-staged (`package.json:70-74 @ d2be18a`). Its comment says a stray `.only` would silently disable the rest of a test file.
- Evidence: `scripts/check-no-focused-tests.js:1-9 @ d2be18a`.

### Container image tested at build time

- What they do: `Dockerfile.ci` builds two stages. The last stage installs the packed packages, then lints a message with a TypeScript config that sets `header-max-length` to 50. The build must accept one message and reject a longer one (`Dockerfile.ci:49-63 @ d2be18a`). The workflow pushes multi-platform images (amd64 and arm64) (`.github/workflows/container-build.yml:45 @ d2be18a`).
- Why: the image build fails if config loading or a rule override stops working.
- Evidence: `Dockerfile.ci:47-66 @ d2be18a`.

## Tests and what they protect

The test runner is Vitest with a custom environment named `commitlint` (`vitest.config.ts:15 @ d2be18a`) and the istanbul coverage provider, limited to package source files (`vitest.config.ts:16-19 @ d2be18a`). `HOME` is set to the working directory so tests do not read the real home folder (`vitest.config.ts:9-13 @ d2be18a`). Test files already built into `lib` are excluded (`vitest.config.ts:14 @ d2be18a`). The apt-Node job explains that tests create throwaway repositories with `git init`, so `git` must be installed (`.github/workflows/CI.yml:128-134 @ d2be18a`). The contributing guide asks for a failing-test commit first, then the fix (`.github/CONTRIBUTING.md:105-110 @ d2be18a`).

## Error handling, performance, and security

- Frozen installs: CI uses `--frozen-lockfile` (`.github/workflows/CI.yml:54 @ d2be18a`).
- Weekly audit: `pnpm audit --audit-level=high`, with `continue-on-error` because findings are usually in upstream tools (`.github/workflows/audit.yml:17-20 @ d2be18a`, `.github/workflows/audit.yml:35-36 @ d2be18a`). It has read-only `contents` permission (`.github/workflows/audit.yml:9-10 @ d2be18a`).
- Third-party actions in the container workflow are pinned to commit hashes with version comments (`.github/workflows/container-build.yml:19-23 @ d2be18a`). Other workflows use version tags such as `actions/checkout@v7` (`.github/workflows/CI.yml:42 @ d2be18a`).
- Docs deploy limits permissions to read contents, write pages and id-token (`.github/workflows/docs-deploy.yml:9-12 @ d2be18a`), and `cancel-in-progress: false` lets a running deploy finish (`.github/workflows/docs-deploy.yml:14-16 @ d2be18a`).
- Repository guards: container, audit and docs jobs run only for `conventional-changelog/commitlint`, not for forks (`.github/workflows/audit.yml:15 @ d2be18a`, `.github/workflows/container-build.yml:13 @ d2be18a`).

## Release and publish

Versions are fixed to one number for all packages (`lerna.json:3 @ d2be18a`, `@commitlint/cli/package.json:3 @ d2be18a`), and Lerna uses pnpm as client (`lerna.json:2 @ d2be18a`). The steps are: login to npm, `mise install`, clean, install, build, test, then publish with a one-time password (`.github/CONTRIBUTING.md:149-160 @ d2be18a`). If a new package was missed, `lerna publish from-package` publishes what is unpublished (`.github/CONTRIBUTING.md:164 @ d2be18a`). Then a GitHub release is created by hand and announced in Slack (`.github/CONTRIBUTING.md:167-171 @ d2be18a`). A pre-release or patch uses `--dist-tag` (`.github/CONTRIBUTING.md:173-185 @ d2be18a`). Publishing is manual, from a maintainer machine; no publish workflow is in this slice. Pushing a tag triggers the container build (`.github/workflows/container-build.yml:3-5 @ d2be18a`).

## Technologies and services seen

- pnpm workspaces — package manager and monorepo links (`pnpm-workspace.yaml:1-4 @ d2be18a`)
- Lerna — version and publish (`lerna.json:1-3 @ d2be18a`, `package.json:56 @ d2be18a`)
- TypeScript (`tsc -b`) — build (`package.json:29 @ d2be18a`)
- Vitest with istanbul coverage — tests (`vitest.config.ts:1-19 @ d2be18a`)
- oxlint and oxfmt — lint and format (`package.json:38 @ d2be18a`, `package.json:41 @ d2be18a`)
- husky and lint-staged — git hooks (`package.json:47 @ d2be18a`, `package.json:69-78 @ d2be18a`)
- mise — local tool versions (`.mise.toml:1-3 @ d2be18a`)
- Renovate — dependency updates (`package.json:90-93 @ d2be18a`)
- VitePress — docs site (`package.json:35 @ d2be18a`)
- GitHub Actions, `pnpm/action-setup`, `actions/setup-node` — CI (`.github/workflows/CI.yml:45-51 @ d2be18a`)
- GitHub Pages — docs hosting (`.github/workflows/docs-deploy.yml:64-66 @ d2be18a`)
- Docker Hub image `commitlint/commitlint`, QEMU, Buildx — image publishing (`.github/workflows/container-build.yml:18-32 @ d2be18a`); secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` (`.github/workflows/container-build.yml:25-26 @ d2be18a`)
- npm registry — package publishing (`package.json:43 @ d2be18a`)
- Alpine Node 22 base image (`Dockerfile.ci:2 @ d2be18a`)
- Slack — release announcement (`.github/CONTRIBUTING.md:170 @ d2be18a`)

## Worth exploring interactively

- Commit to CI check — ordered steps: `git commit` runs `pnpm lint-staged` (`.husky/pre-commit:1 @ d2be18a`), then `pnpm build` (`.husky/pre-commit:5 @ d2be18a`), then the commit-msg hook lints the message (`.husky/commit-msg:1 @ d2be18a`), then push triggers CI (`.github/workflows/CI.yml:4-6 @ d2be18a`), which builds and tests on the matrix (`.github/workflows/CI.yml:35-60 @ d2be18a`), then `codeQuality` runs after `build` (`.github/workflows/CI.yml:73 @ d2be18a`) — fits FlowAnimation because the learner sees one change pass each gate in order.
- Pinning layers — `engines` (`package.json:85-88 @ d2be18a`), `packageManager` (`package.json:89 @ d2be18a`), mise (`.mise.toml:1-3 @ d2be18a`), and CI reading the pin (`.github/workflows/CI.yml:44-46 @ d2be18a`) — fits SystemDiagram because it shows which file each tool reads.

## Open questions

- Which workflow, if any, checks pull request titles, since `AGENTS.md:17 @ d2be18a` says the title becomes the commit? Not in this slice.
- The `.vscode` and `.oxlintrc.json` files were not read.

## My insights
