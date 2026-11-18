---
title: "conventional-changelog/commitlint — findings"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, workstation, repo-intel, conventional-commits]
created: 2026-11-18
sources: [conventional-changelog-commitlint-repo]
---

# conventional-changelog/commitlint — findings

What this production codebase does beyond the textbook version of a commit-message linter, ranked by how much a beginner gains from knowing it.

## 1. Rules are named functions, and config is only data

- Textbook version: one function with an `if` chain that fails on the first problem.
- What they do: about 40 functions share one signature `rule(parsed, when, value)` and return `[passed, message]`. Config says which are on, at what level, `always` or `never`, and with which value. A shared preset is plain data.
- Why: every rule is testable alone, users switch rules by name, and a preset can be shared as an npm package.
- Evidence: `@commitlint/types/src/rules.ts:18-28 @ d2be18a`, `@commitlint/rules/src/index.ts:41-81 @ d2be18a`, `@commitlint/config-conventional/src/index.ts:5-44 @ d2be18a`
- Borrow it when: you lint more than two or three things and want teams to tune them.
- More: [[commitlint-module-rules|rules]], [[commitlint-module-parser-and-lint|parser-and-lint]], [[commitlint-pattern-rules-as-data]]

## 2. Bad config fails loud, and so does an empty rule set

- Textbook version: ignore unknown keys; no rules means nothing to check.
- What they do: unknown rule names throw `RangeError`, bad rule tuples throw with all problems listed, the config is checked against a JSON Schema, and zero rules gives exit code 9 with help text.
- Why: a typo or a misplaced file would otherwise make every commit pass.
- Evidence: `@commitlint/lint/src/lint.ts:65-78 @ d2be18a`, `@commitlint/lint/src/lint.ts:80-140 @ d2be18a`, `@commitlint/config-validator/src/validate.ts:38-41 @ d2be18a`, `@commitlint/cli/src/cli.ts:327-355 @ d2be18a`
- Borrow it when: any tool reads a user-written config; a silent pass is worse than a loud stop.
- More: [[commitlint-module-parser-and-lint|parser-and-lint]], [[commitlint-module-config-loading|config-loading]], [[commitlint-module-cli-and-hooks|cli-and-hooks]]

## 3. Exit codes are a contract

- Textbook version: exit 1 on any failure.
- What they do: 0 success, 1 failure, 2 warning in strict mode, 3 error in strict mode, 9 bad arguments. Warnings (level 1) never fail the run without `--strict`.
- Why: a script can tell "bad message" from "bad command line", and teams can add a rule as a warning first.
- Evidence: `@commitlint/cli/src/cli-error.ts:1-7 @ d2be18a`, `@commitlint/cli/src/cli.ts:392-405 @ d2be18a`, `@commitlint/lint/src/lint.ts:171-178 @ d2be18a`
- Borrow it when: another program, such as a hook or CI, runs your CLI.
- More: [[commitlint-module-cli-and-hooks|cli-and-hooks]], [[commitlint-pattern-one-checker-two-gates]]

## 4. The same checker runs in the hook and in CI, with different inputs

- Textbook version: a commit-msg hook only.
- What they do: the hook lints one file with `--edit $1`. CI lints the last commit on push and a base-to-head range on a pull request. Before a range walk, `git merge-base` is run to detect a shallow clone, and CI checks out with `fetch-depth: 0`.
- Why: a hook can be skipped with `--no-verify`; CI cannot. A shallow clone would silently return fewer commits.
- Evidence: `.husky/commit-msg:1 @ d2be18a`, `.github/workflows/commitlint.yml:46-52 @ d2be18a`, `@commitlint/read/src/read.ts:62-81 @ d2be18a`, `.github/workflows/commitlint.yml:18-21 @ d2be18a`
- Borrow it when: you want a convention to hold even if one developer skips local checks.
- More: [[commitlint-module-cli-and-hooks|cli-and-hooks]], [[commitlint-pattern-one-checker-two-gates]]

## 5. The linter copies Git's own behaviour

- Textbook version: lint the string as given.
- What they do: they ask Git for `core.commentChar`. They drop comment lines and everything after the scissors line. They keep CRLF. They skip merge, revert and `fixup!` messages. They read only the last paragraph for `Signed-off-by`.
- Why: code comments say these match what Git does when it commits, so users are not blamed for text Git would remove.
- Evidence: `@commitlint/cli/src/cli.ts:437-460 @ d2be18a`, `@commitlint/lint/src/lint.ts:180-191 @ d2be18a`, `@commitlint/is-ignored/src/defaults.ts:21-32 @ d2be18a`, `@commitlint/rules/src/signed-off-by.ts:5-28 @ d2be18a`
- Borrow it when: your tool reads files that another tool writes.
- More: [[commitlint-module-parser-and-lint|parser-and-lint]], [[commitlint-module-rules|rules]]

## 6. Node and pnpm are pinned in three layers

- Textbook version: one `.nvmrc`, or nothing.
- What they do: `engines.node >=22.12.0` is the floor for users; `packageManager` holds an exact pnpm version with a sha512 hash; `.mise.toml` sets the local shell; CI reads the `packageManager` field instead of repeating the number. No `.nvmrc` was found at the clone root.
- Why: `engines` says what users need, `packageManager` says what contributors and CI use.
- Evidence: `package.json:85-89 @ d2be18a`, `.mise.toml:1-3 @ d2be18a`, `.github/workflows/CI.yml:44-46 @ d2be18a`
- Borrow it when: more than one machine, or CI, must use the same tool versions.
- More: [[commitlint-module-build-and-infra|build-and-infra]], [[commitlint-pattern-layered-version-pinning]]

## 7. Corepack is replaced by a hash-checked install

- Textbook version: run `corepack enable`.
- What they do: `Dockerfile.ci` reads the version and hash from `packageManager`. It runs `npm pack`, checks the sha512 and installs the tarball. A CI job avoids corepack, because the one in stock Ubuntu Node fails on pnpm 11.
- Why: the code comment says corepack was removed from Node 25+ and cannot install pnpm 12 or later.
- Evidence: `Dockerfile.ci:6-15 @ d2be18a`, `.github/workflows/CI.yml:136-142 @ d2be18a`
- Borrow it when: you pin a package manager; know the Corepack caveat and make sure your docs name a fallback.
- More: [[commitlint-module-build-and-infra|build-and-infra]], [[commitlint-pattern-layered-version-pinning]]

## 8. One loader for ESM, CJS and TypeScript configs

- Textbook version: `require` one JSON or `.js` file.
- What they do: cosmiconfig handles JSON, YAML, `.js` and `.cjs`. A jiti loader handles every TypeScript extension. Presets use `import()` except for JSON. A fallback walks `node_modules` and the `exports` map, because pure-ESM presets declare only the `import` condition.
- Why: users write config in the module style of their own project; `require.resolve` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED` on pure-ESM packages.
- Evidence: `@commitlint/load/src/utils/load-config.ts:20-31 @ d2be18a`, `@commitlint/resolve-extends/src/index.ts:15-22 @ d2be18a`, `@commitlint/resolve-extends/src/index.ts:86-92 @ d2be18a`
- Borrow it when: your tool loads user config from many projects.
- More: [[commitlint-module-config-loading|config-loading]]

## 9. Config layers merge with explicit array rules

- Textbook version: one deep merge.
- What they do: `extends` is followed recursively, parents come first, the user config last. Plugin arrays are joined, other arrays are replaced. Legacy preset names fall back with a warning.
- Why: a default merge would mix `type-enum` lists by index.
- Evidence: `@commitlint/resolve-extends/src/index.ts:220-240 @ d2be18a`, `@commitlint/resolve-extends/src/index.ts:305-309 @ d2be18a`
- Borrow it when: you ship a default config that users override.
- More: [[commitlint-module-config-loading|config-loading]]

## 10. Supply-chain and CI hygiene

- Textbook version: `npm install` and one CI job.
- What they do: install scripts are denied unless listed. New releases wait two days. The lockfile is frozen. CI runs 8 combinations and a Node-from-apt job. A script blocks `.only` in tests. The image build lints a sample message.
- Why: a compromised release should not reach the lock file; a stray `.only` disables the rest of a test file.
- Evidence: `pnpm-workspace.yaml:8-11 @ d2be18a`, `pnpm-workspace.yaml:33-35 @ d2be18a`, `.github/workflows/CI.yml:35-39 @ d2be18a`, `scripts/check-no-focused-tests.js:26-27 @ d2be18a`, `Dockerfile.ci:49-63 @ d2be18a`
- Borrow it when: your package has users beyond your own machine.
- More: [[commitlint-module-build-and-infra|build-and-infra]]

## My insights
