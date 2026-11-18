---
title: "conventional-changelog/commitlint — technologies and services"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, workstation, repo-intel, conventional-commits]
created: 2026-11-18
sources: [conventional-changelog-commitlint-repo]
---

# conventional-changelog/commitlint — technologies and services

Coverage: first-party packages in five slices only (parser-and-lint, rules, config-loading, cli-and-hooks, build-and-infra). This list is not repository-wide; skipped packages are in [[commitlint-architecture|the architecture note]].

## Languages and runtimes

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[TypeScript]] | Typed rule and option contracts; built with `tsc -b` | `@commitlint/types/src/rules.ts:1-144 @ d2be18a`, `package.json:29 @ d2be18a` |
| [[Node.js]] | Runtime; `engines.node` is `>=22.12.0`; `util.parseArgs` and `child_process` are used | `package.json:85-88 @ d2be18a`, `@commitlint/read/src/read.ts:1 @ d2be18a`, `@commitlint/rules/src/trailer-exists.ts:1 @ d2be18a` |
| [[Git]] | The tool reads messages from `git log` and `git describe`, and one rule runs `git interpret-trailers` | `@commitlint/read/src/read.ts:83-97 @ d2be18a`, `@commitlint/rules/src/trailer-exists.ts:7-9 @ d2be18a` |

## Libraries and frameworks

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[conventional-commits-parser]] | Splits a message into header, body, footer and notes | `@commitlint/parse/src/index.ts:3 @ d2be18a` |
| [[yargs]] | Declares flags, help text, strict mode | `@commitlint/cli/src/cli.ts:20 @ d2be18a`, `@commitlint/cli/src/cli.ts:155 @ d2be18a` |
| [[cosmiconfig]] | Finds the config in 17 places and formats | `@commitlint/load/src/utils/load-config.ts:35-58 @ d2be18a` |
| [[jiti]] | Loads TypeScript config files with no build step | `@commitlint/load/src/utils/load-config.ts:4 @ d2be18a` |
| [[Ajv]] with [[JSON Schema]] | Checks the config shape and gives readable errors | `@commitlint/config-validator/src/validate.ts:4 @ d2be18a`, `@commitlint/config-validator/src/validate.ts:10 @ d2be18a` |
| tinyexec | Runs `git` with an argument list, no shell | `@commitlint/read/src/read.ts:6 @ d2be18a` |
| picocolors | Terminal colours in the formatter | `@commitlint/format/src/format.ts:1 @ d2be18a` |
| semver | Detects version-only commit messages | `@commitlint/is-ignored/src/defaults.ts:1 @ d2be18a` |
| es-toolkit (`mergeWith`) | Deep merge with a custom array rule | `@commitlint/load/src/load.ts:19 @ d2be18a` |
| resolve-from, global-directory | Find shared configs locally and in global folders | `@commitlint/resolve-extends/src/index.ts:7 @ d2be18a`, `@commitlint/resolve-extends/src/index.ts:9 @ d2be18a` |
| conventional-changelog-angular, conventional-changelog-conventionalcommits | Parser option presets | `@commitlint/parse/src/index.ts:4 @ d2be18a`, `@commitlint/config-conventional/src/index.ts:4 @ d2be18a` |

## Data stores, queues, and external services

None: commitlint has no database or network service at run time. It reads local files, Git and the npm cache folder (`@commitlint/resolve-extends/src/index.ts:344-352 @ d2be18a`). Optional lookups use Yarn Plug'n'Play through `pnpapi` (`@commitlint/resolve-extends/src/index.ts:106-108 @ d2be18a`).

## Build, test, and delivery

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[pnpm]] | Workspace package manager, version pinned by `packageManager` | `pnpm-workspace.yaml:1-4 @ d2be18a`, `package.json:89 @ d2be18a` |
| [[Lerna]] | One shared version; `lerna publish --conventional-commits` | `lerna.json:3 @ d2be18a`, `package.json:43 @ d2be18a` |
| [[Vitest]] | Test runner with istanbul coverage | `vitest.config.ts:1-19 @ d2be18a` |
| [[oxlint]] and oxfmt | Lint and format | `package.json:38 @ d2be18a`, `package.json:41 @ d2be18a` |
| [[Husky]] and lint-staged | Local hooks on commit | `.husky/pre-commit:1-5 @ d2be18a`, `package.json:69-78 @ d2be18a` |
| [[mise]] | Local tool versions (Node 22, pnpm 12) | `.mise.toml:1-3 @ d2be18a` |
| [[GitHub Actions]] | CI matrix, audit, commitlint, container and docs jobs | `.github/workflows/CI.yml:35-39 @ d2be18a`, `.github/workflows/commitlint.yml:1 @ d2be18a` |
| [[Docker]] | `Dockerfile.ci` builds the published image and tests it at build time | `Dockerfile.ci:49-63 @ d2be18a` |
| [[Renovate]] | Dependency update pull requests, three-day wait | `package.json:90-93 @ d2be18a` |
| [[npm]] | Registry for publishing; `npm pack` in the Dockerfile | `package.json:43 @ d2be18a`, `Dockerfile.ci:9-13 @ d2be18a` |
| Docker Hub, QEMU, Buildx | Multi-platform image publishing with two secrets | `.github/workflows/container-build.yml:18-32 @ d2be18a`, `.github/workflows/container-build.yml:25-26 @ d2be18a` |
| VitePress, GitHub Pages | Docs site and its hosting | `package.json:35 @ d2be18a`, `.github/workflows/docs-deploy.yml:64-66 @ d2be18a` |
| Slack | Release announcement by hand | `.github/CONTRIBUTING.md:170 @ d2be18a` |

## Observability and security tooling

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| `pnpm audit` in a weekly workflow | Finds high-severity advisories; does not fail the run | `.github/workflows/audit.yml:17-20 @ d2be18a`, `.github/workflows/audit.yml:35-36 @ d2be18a` |
| pnpm supply-chain settings | Deny install scripts, wait two days for new releases | `pnpm-workspace.yaml:8-11 @ d2be18a`, `pnpm-workspace.yaml:33-35 @ d2be18a` |
| `scripts/check-no-focused-tests.js` | Fails on `.only` in tests | `scripts/check-no-focused-tests.js:26-27 @ d2be18a` |

Corepack is not used: the Dockerfile and one CI job install the package manager by hand (`Dockerfile.ci:6-13 @ d2be18a`, `.github/workflows/CI.yml:136-142 @ d2be18a`). See [[Corepack]] for what it is.

## My insights
