---
title: "pmndrs/zustand — module build-and-infra"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [pmndrs-zustand-repo]
---

# pmndrs/zustand — module: build-and-infra

## Responsibility

This slice is the delivery machinery. It holds the manifest that says what the package
is, the bundler that turns the TypeScript sources into published shapes, the strict
type-safety settings, the lint rules, and eight GitHub Actions workflows. Those
workflows decide whether a change may merge and how a release reaches npm.

## Key files

| File | Role |
|------|------|
| `package.json` | Package identity, `exports` map, build and test scripts, peer dependencies |
| `rollup.config.mjs` | One bundle per entry point, in CommonJS and ESM, plus type declarations |
| `tsconfig.json` | Strict TypeScript settings for the whole repo |
| `vitest.config.mts` | Test runner: jsdom, alias map, coverage |
| `eslint.config.mjs` | Lint rules for source and for test files |
| `pnpm-workspace.yaml` | Which packages may run install scripts |
| `.github/workflows/*.yml` | Eight workflows: tests, matrices, size, publish, docs |
| `CONTRIBUTING.md` | Commit format and the contributor loop |

## How it works

1. `pnpm run build` wipes `dist`, then runs every script whose name starts with `build:`
   through a pnpm regex match, then runs `postbuild` (`package.json:63-75 @ 9fed2eb`).
2. Each `build:*` script calls Rollup with a `--config-<name>` flag. The Rollup default
   export reads that flag, turns `_` into `/`, and returns up to three configs: a type
   declaration config for the main entry, a CommonJS config, and an ESM config
   (`rollup.config.mjs:93-104 @ 9fed2eb`).
3. An alias plugin rewrites internal imports to the public names `zustand/vanilla` and
   `zustand/react`, so the shipped code imports itself the way consumers do
   (`rollup.config.mjs:11-16 @ 9fed2eb`).
4. The `replace` plugin rewrites `import.meta.env?.MODE` to `process.env.NODE_ENV` in the
   CommonJS build only (`rollup.config.mjs:83-87 @ 9fed2eb`).
5. `postbuild` repairs the output. It rewrites relative `.ts` import specifiers in the
   emitted `.d.ts` files. It moves `dist/src/*` up into `dist` and `dist/esm`. It strips
   `private`, `devDependencies` and `scripts` from the copied manifest, creates a stub
   declaration file for old TypeScript, and renames ESM declarations to `.d.mts`
   (`package.json:84-87 @ 9fed2eb`).
6. A published GitHub release triggers `pnpm publish --no-git-checks` from inside `dist`
   (`.github/workflows/publish.yml:26-29 @ 9fed2eb`).

## Beyond the textbook

### One source tree, four published shapes

- Textbook version: one `tsc` build, one output file, one import style.
- What they do: for the entry point named on the command line, Rollup returns a
  CommonJS config and an ESM config. For the main entry it adds a third config that
  emits type declarations only (`rollup.config.mjs:100-104 @ 9fed2eb`). The `copy` step
  then places those declarations next to both formats. The ESM ones are renamed to
  `.d.mts`, so the two type worlds cannot collide (`package.json:85-87 @ 9fed2eb`).
- Why: the package is consumed by bundlers, by Node directly, and by React Native, and
  each wants a different module shape.
- Evidence: `package.json:27-57 @ 9fed2eb` gives every shape its own `types` entry.

### The published tarball is edited after the build

- Textbook version: publish the build folder as it is.
- What they do: the `copy` script rewrites the manifest inside `dist`, setting
  `private=false` and deleting `devDependencies`, `optionalDependencies` and `scripts`
  (`package.json:85 @ 9fed2eb`).
- Why: a published package must not look like the working repository.
- Evidence: `package.json:58-60 @ 9fed2eb` ships `files: ["**"]`, so anything left in
  `dist` becomes public.

### The same test suite runs against the built bundles, not only the source

- Textbook version: test the TypeScript source.
- What they do: the CI rewrites `vitest.config.mts` with `sed`. The alias then points
  at `dist/*.js` for the CommonJS run and at `dist/esm/*.mjs` for the ESM run. The same
  spec files run in both (`test-multiple-builds.yml:41-56 @ 9fed2eb`).
- Why: the bundler can break a build that the source-level tests pass.
- Evidence: `test-multiple-builds.yml:44 @ 9fed2eb` and
  `test-multiple-builds.yml:48 @ 9fed2eb`, against the plain source run in
  `.github/workflows/test.yml:28 @ 9fed2eb`.

### The environment is a test dimension, not a constant

- Textbook version: one test run, one `NODE_ENV`.
- What they do: test names tagged `[DEV-ONLY]` and `[PRD-ONLY]` are switched on and off by
  `sed` depending on `NODE_ENV`, so the same file holds both expectations
  (`test-multiple-builds.yml:31-40 @ 9fed2eb`).
- Why: the library behaves differently in development and production builds.
- Evidence: `test-multiple-builds.yml:19 @ 9fed2eb` keeps the production half commented
  out in the matrix.

### Old compiler versions are a tested matrix, not a hope

- Textbook version: state a minimum TypeScript version and move on.
- What they do: fifteen TypeScript versions from 4.5.5 to 5.9.3 run in CI. The
  `tsconfig.json` is patched per version, so options the old compiler cannot parse are
  removed (`test-old-typescript.yml:17-33 @ 9fed2eb`,
  `test-old-typescript.yml:45-59 @ 9fed2eb`).
- Why: consumers on older compilers must still get working types.
- Evidence: `package.json:9-26 @ 9fed2eb` points pre-4.5 compilers at a stub file.

### Every action is pinned, and permissions are minimal

- Textbook version: `uses: actions/checkout@v4`.
- What they do: each action is pinned to a full commit SHA, with the version kept in a
  comment. The checkout step drops its credentials. The workflow sets `contents: read`,
  and only the publish job adds `id-token: write`
  (`test.yml:16-20 @ 9fed2eb`, `publish.yml:7-15 @ 9fed2eb`).
- Why: a tag can be moved to point at malicious code; an OIDC token proves the publish
  came from this workflow without a stored secret.
- Evidence: `publish.yml:15 @ 9fed2eb` grants the publish job `id-token: write`.

## Tests and what they protect

The suite runs in jsdom with globals enabled, so React Testing Library cleans up after
each test (`vitest.config.mts:12-16 @ 9fed2eb`). Tests import the library under its
public name `zustand`, and the alias map sends that name to `src/`. The alias map is
therefore part of the contract under test (`vitest.config.mts:5-10 @ 9fed2eb`). Coverage
is measured with the v8 provider over `src/` only (`vitest.config.mts:22-27 @ 9fed2eb`).
CI runs formatting, type checking, linting, the specs and the build as five separate
steps. The comment on the build step says why: no other workflow builds the package
(`.github/workflows/test.yml:25-29 @ 9fed2eb`).

## Error handling, performance, and security

Runtime error handling is not in this slice, because there is no runtime code here.
Performance is a gate instead. Every pull request is measured by a compressed-size
action over the built bundles (`.github/workflows/compressed-size.yml:25-27 @ 9fed2eb`).
The manifest declares `sideEffects: false`, so bundlers can drop unused code
(`package.json:61 @ 9fed2eb`), and esbuild targets ES2018
(`rollup.config.mjs:24 @ 9fed2eb`). On the security side, pnpm is told not to run
install scripts for `esbuild` and `unrs-resolver` (`pnpm-workspace.yaml:1-3 @ 9fed2eb`).
Dependabot checks npm daily and actions weekly, but it ignores patch and minor bumps
so that only meaningful updates arrive (`dependabot.yml:3-21 @ 9fed2eb`). The release
uses a short-lived OIDC identity instead of a stored npm token
(`.github/workflows/publish.yml:13-15 @ 9fed2eb`).

## Technologies and services seen

- [[Rollup]] — bundles each entry point into a CommonJS file and an ESM file, and emits
  the type declarations for the main entry (`rollup.config.mjs:93-104 @ 9fed2eb`).
- [[Vitest]] — runs the spec files in a jsdom environment with the alias map
  (`vitest.config.mts:11-21 @ 9fed2eb`).
- [[GitHub Actions]] — eight workflows gate merges and publish the release
  (`.github/workflows/test.yml:1 @ 9fed2eb`).
- [[pnpm]] — installs, runs the build scripts and publishes; the version is pinned by
  hash in the manifest (`package.json:179 @ 9fed2eb`).
- TypeScript — compiles and type-checks. The strict settings are `strict`,
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` and
  `isolatedDeclarations` (`tsconfig.json:4-15 @ 9fed2eb`).
- esbuild — the fast transpiler Rollup uses (`rollup.config.mjs:22-28 @ 9fed2eb`).
- ESLint with typescript-eslint and plugins for react, react-hooks, import,
  testing-library, jest-dom and vitest. The rules are type-aware for source files, and
  test-only rules apply to `tests/**` (`eslint.config.mjs:13-18 @ 9fed2eb`,
  `eslint.config.mjs:79-91 @ 9fed2eb`).
- Prettier — formatting, checked as its own CI step (`package.json:80 @ 9fed2eb`).
- shelljs and shx — the Node and shell helpers that patch and copy the build output
  (`package.json:151-152 @ 9fed2eb`).
- npm registry — the destination of the release (`publish.yml:24 @ 9fed2eb`).
- pkg-pr.new — publishes a preview package per pull request so a change can be tried in
  a real app (`preview-release.yml:29 @ 9fed2eb`).
- pmndrs/docs — a reusable workflow that builds the documentation site, deployed to
  GitHub Pages (`.github/workflows/docs.yml:18 @ 9fed2eb`,
  `.github/workflows/docs.yml:42-43 @ 9fed2eb`).
- Dependabot — scheduled dependency updates (`dependabot.yml:1 @ 9fed2eb`).

## Worth exploring interactively

- The build and publish pipeline — `pnpm run build` → the nine `build:*` Rollup runs →
  `postbuild` repair → `pnpm publish` from `dist`
  (`package.json:63-87 @ 9fed2eb`, `publish.yml:26-29 @ 9fed2eb`) — fits
  **FlowAnimation** because the learner sees one source file become four published
  artefacts.
- The test matrix over module systems and `NODE_ENV` — source, CommonJS bundle, ESM
  bundle, development and production (`test-multiple-builds.yml:15-19 @ 9fed2eb`,
  `test-multiple-builds.yml:31-51 @ 9fed2eb`) — fits **SystemDiagram** because the
  learner sees which part of the setup changes for each run.

## Open questions

- The pre-4.5 TypeScript stub file is created only during the build, so its exact error
  message cannot be read from the clone (`package.json:86 @ 9fed2eb`).
- The `matrix.devtools-skip` variable in the multiple-versions workflow is never defined
  in its matrix, so it expands to an empty string (`test-multiple-versions.yml:38 @ 9fed2eb`).

## My insights
