---
title: "GoogleChrome/lighthouse — module build-and-infra"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [googlechrome-lighthouse-repo]
---

# GoogleChrome/lighthouse — module: build-and-infra

## Responsibility

This slice holds the files that build, test, and ship Lighthouse: the package manifest, the TypeScript config, five CI workflows, and the script that bundles Lighthouse so it can run inside the browser. The bundle is how the same audit code reaches the DevTools Lighthouse panel, so this slice shows how one codebase serves a command line tool, an npm library, and a DevTools panel. Coverage: only these seven files at commit 3b399f6; the many other scripts in `build/` and `core/scripts/` are not read.

## Key files

| File | Role |
|------|------|
| `package.json` | Runtime and dev dependencies, and about 90 named scripts for build, test, and release |
| `tsconfig.json` | Type-checks plain JavaScript files through JSDoc types, with an explicit list of excluded tests |
| `build/build-bundle.js` | Uses esbuild to turn an entry file into one browser-ready script, with shims per target |
| `.github/workflows/ci.yml` | Type check, full build, many checks, and a "no files changed" gate |
| `.github/workflows/unit.yml` | Unit tests on Node 22.19, 24 and 26, plus a Windows job |
| `.github/workflows/smoke.yml` | End-to-end runs against real Chrome (stable and ToT), in shards |
| `.github/workflows/devtools.yml` | Builds a real DevTools frontend with this Lighthouse inside it, then runs e2e and smoke tests |
| `.github/workflows/publish.yml` | Nightly and tagged npm publish with provenance |

## How it works

In plain words: a developer runs `yarn build-all`, which makes the report, the DevTools bundle, the browser extension, and more. Each CI workflow then installs the same lockfile, builds, runs one family of tests, and fails if the build changed any tracked file.

1. The package is an ES module, with the entry `core/index.js` and the CLI at `cli/index.js` (`package.json:3-8 @ 3b399f6`). It needs Node 22.19 or newer (`package.json:12-14 @ 3b399f6`).
2. `build-devtools` links the package, then bundles `clients/devtools/devtools-entry.js` into `dist/devtools/lighthouse-dt-bundle.js` (`package.json:26 @ 3b399f6`). A separate `build-devtools-mcp` script bundles a second entry for a DevTools MCP client (`package.json:28 @ 3b399f6`).
3. In `buildBundle`, the list of every gatherer and every audit is read from the `Runner` and turned into `import()` entries. Those entries replace a marker comment in the source (`build/build-bundle.js:81-84 @ 3b399f6`, `build/build-bundle.js:94-97 @ 3b399f6`, `build/build-bundle.js:181-182 @ 3b399f6`). The reason: audits are loaded by name at run time, and a bundler cannot see a name built from a string.
3. esbuild writes one `iife` script, minified, with a linked source map (`build/build-bundle.js:138-154 @ 3b399f6`).
4. For DevTools and Lightrider targets, the report HTML assets and the translated locale files are replaced by empty objects (`build/build-bundle.js:114-124 @ 3b399f6`).
5. For DevTools only, `third-party-web` is also emptied, because DevTools ships its own copy (`build/build-bundle.js:126-129 @ 3b399f6`).
6. `puppeteer-core` and the Sentry reporter are replaced by empty stubs, since the bundle receives its debugger connection from the host (`build/build-bundle.js:104-112 @ 3b399f6`, `build/build-bundle.js:131-133 @ 3b399f6`).
7. In CI, the DevTools workflow clones depot tools and the DevTools frontend, rolls this Lighthouse into it, builds it, and caches the build (`.github/workflows/devtools.yml:79-85 @ 3b399f6`). Then `e2e` and three smoke shards load that cache (`.github/workflows/devtools.yml:118-127 @ 3b399f6`, `.github/workflows/devtools.yml:154-160 @ 3b399f6`).

## Beyond the textbook

### One audit engine, many delivery targets

- Textbook version: a tool has one build that produces one artifact.
- What they do: the same source is bundled per target, and each target removes what the host already has (locales, report assets, a third-party database, Puppeteer). The decision is made from the entry file name.
- Why: comments say DevTools "provides its own copy" and the saving is "40+ KB"; Lightrider cannot make HTML so report assets are not needed.
- Evidence: `build/build-bundle.js:41-44 @ 3b399f6`, `build/build-bundle.js:114-129 @ 3b399f6`

### Plugin modules listed by hand for the bundle

- Textbook version: install a plugin and let the loader find it.
- What they do: the build script says "HACK: manually include plugin audits" and adds the soft-navigation plugin and its audit paths to the bundle list, for DevTools and Lightrider only.
- Why: dynamic loading by name does not work inside a bundle, so every module that might be loaded must be named up front.
- Evidence: `build/build-bundle.js:35-38 @ 3b399f6`, `build/build-bundle.js:86-92 @ 3b399f6`

### Bundle tuned for the browser engine

- Textbook version: minify and ship.
- What they do: non-ASCII characters are escaped "so Blink/V8 keeps the bundle in a 1-byte string buffer"; function names are kept "because of page-functions" (functions that Lighthouse serialises and runs inside the page); lines are limited to 1000 characters.
- Why: the comments name each reason. Keeping names matters because those functions are turned into text and sent to the page.
- Evidence: `build/build-bundle.js:148-149 @ 3b399f6`, `build/build-bundle.js:156-158 @ 3b399f6`

### CI proves the generated files are committed

- Textbook version: run the tests; pass or fail.
- What they do: after building, `git add -A && git diff --cached --exit-code` fails the job if any source or generated file changed. The same gate appears in the unit and Windows jobs, and smoke uses `git diff --exit-code`. A golden-output diff (`diff:sample-json`) fails if the sample report changes without a deliberate update.
- Why: comment says "Fail if any changes were written to any source files or generated untracked files". It stops a stale generated file from merging.
- Evidence: `.github/workflows/ci.yml:83-84 @ 3b399f6`, `.github/workflows/ci.yml:67-68 @ 3b399f6`, `.github/workflows/unit.yml:85 @ 3b399f6`, `.github/workflows/unit.yml:115-118 @ 3b399f6`, `.github/workflows/smoke.yml:80-81 @ 3b399f6`, `package.json:88 @ 3b399f6`

### Test against the real DevTools frontend, with a smart cache

- Textbook version: test the library on its own.
- What they do: a whole job downloads DevTools, rolls in the new Lighthouse, builds it, and runs end-to-end tests. The cache key changes each week, and on any DevTools commit that touches Lighthouse files, so the newest dependencies are tested at least weekly.
- Why: comment in the workflow states the cache invalidation rules (week number, DevTools changes, Lighthouse test-file changes).
- Evidence: `.github/workflows/devtools.yml:41-64 @ 3b399f6`

### Chrome stable and Chrome ToT matrix, with shards and retries

- Textbook version: test in one browser.
- What they do: smoke tests run against Chrome stable and tip-of-tree, split in three shards, with `fail-fast: false` so one failing shard does not hide the rest; each run uses `--retries=2`. Failure output is uploaded as an artifact.
- Why: browser behaviour changes between releases, and the tests depend on real traces. Comments explain the 6-job layout and sharding.
- Evidence: `.github/workflows/smoke.yml:19-28 @ 3b399f6`, `.github/workflows/smoke.yml:68-70 @ 3b399f6`, `.github/workflows/smoke.yml:83-88 @ 3b399f6`

### Two Lantern code paths tested during a migration

- Textbook version: one implementation, one test run.
- What they do: a `unit-lantern-trace` script re-runs metric and audit tests with `INTERNAL_LANTERN_USE_TRACE=1`, and the smoke workflow has an extra lantern run with the same variable. A TODO says to remove it when traces are used by default.
- Why: the TODO names the plan (move to the trace-based path, drop the old graph code), so both paths stay covered until then.
- Evidence: `package.json:57 @ 3b399f6`, `.github/workflows/smoke.yml:72-78 @ 3b399f6`

### Supply-chain care in CI and release

- Textbook version: `uses: actions/checkout@v4`, publish with a token.
- What they do: each action is pinned to a full commit hash with the version as a comment; the default permission is `contents: read`; checkout sets `persist-credentials: false`; a `zizmor` script lints the workflows; npm publish uses `--provenance` with an OIDC `id-token` (Trusted Publishing, no stored npm token); the nightly job runs only if a commit landed in the last day and only on the upstream repo.
- Why: reduces what a hijacked action or a leaked token can do; the publish file even annotates a cache-poisoning exception.
- Evidence: `.github/workflows/ci.yml:8-9 @ 3b399f6`, `.github/workflows/ci.yml:31-34 @ 3b399f6`, `package.json:41 @ 3b399f6`, `.github/workflows/publish.yml:31-40 @ 3b399f6`, `.github/workflows/publish.yml:49 @ 3b399f6`, `.github/workflows/publish.yml:53-55 @ 3b399f6`, `.github/workflows/publish.yml:64-71 @ 3b399f6`, `.github/workflows/publish.yml:61 @ 3b399f6`

### Type checking JavaScript with an opt-in list

- Textbook version: convert to TypeScript, or skip types.
- What they do: the code stays JavaScript and is checked by `tsc` through JSDoc types. Some test files are excluded with a comment that they "require further changes", and a short `files` list opts specific tests back in. `type-check` runs in CI before the build.
- Why: gradual adoption without a rewrite; the exclusion list is the debt record.
- Evidence: `tsconfig.json:13-22 @ 3b399f6`, `tsconfig.json:43-61 @ 3b399f6`, `tsconfig.json:62-69 @ 3b399f6`, `package.json:76 @ 3b399f6`, `.github/workflows/ci.yml:49 @ 3b399f6`

## Tests and what they protect

This slice has no test code, but it shows the test layers. Unit tests (`yarn unit`) run flow report tests, mocha, and a Lantern-with-trace pass (`package.json:62 @ 3b399f6`). Smoke tests ("smokehouse") run the CLI on fixture pages (`package.json:42 @ 3b399f6`), and can also run against the bundle (`package.json:47 @ 3b399f6`) or inside DevTools (`.github/workflows/devtools.yml:185-186 @ 3b399f6`). Unit tests run on three Node versions plus Windows for platform-specific code (`.github/workflows/unit.yml:23 @ 3b399f6`, `.github/workflows/unit.yml:94-95 @ 3b399f6`). A protobuf round trip checks that the result JSON still converts (`package.json:54 @ 3b399f6`, `.github/workflows/unit.yml:75 @ 3b399f6`). CI also fails if the changelog still says "Chrome XXX" (`.github/workflows/ci.yml:72-77 @ 3b399f6`) and if translated strings are not collected (`package.json:77 @ 3b399f6`).

## Error handling, performance, and security

- Performance of CI: `concurrency` with `cancel-in-progress` stops old runs of the same PR (`.github/workflows/ci.yml:11-13 @ 3b399f6`); `node_modules` and DevTools builds are cached (`.github/workflows/devtools.yml:70-74 @ 3b399f6`); unit runs get an 8 GB Node heap (`package.json:63 @ 3b399f6`).
- Build safety: `replaceModules` is told `disableUnusedError: true` because one function serves many targets (`build/build-bundle.js:166-170 @ 3b399f6`). The comment on the inline-fs plugin admits known safe warnings that remain (`build/build-bundle.js:172-175 @ 3b399f6`).
- Security: see "Supply-chain care". The Sentry reporter is stubbed out of every bundle (`build/build-bundle.js:110 @ 3b399f6`). Runtime dependencies are pinned to exact versions for the core data libraries (`axe-core`, `devtools-protocol`, trace engine) (`package.json:155-161 @ 3b399f6`).

## Technologies and services seen

- esbuild — bundles Lighthouse for the browser (`package.json:127 @ 3b399f6`, `build/build-bundle.js:16 @ 3b399f6`)
- TypeScript (checking JSDoc types) — `tsc --build` (`package.json:76 @ 3b399f6`, `package.json:149 @ 3b399f6`)
- Puppeteer and puppeteer-core — drives Chrome; `puppeteer-core` is stubbed out of bundles (`package.json:144 @ 3b399f6`, `package.json:167 @ 3b399f6`, `build/build-bundle.js:105 @ 3b399f6`)
- chrome-launcher and devtools-protocol — start Chrome and type the DevTools protocol (`package.json:157 @ 3b399f6`, `package.json:161 @ 3b399f6`)
- `@paulirish/trace_engine` — trace analysis used for insights (`package.json:155 @ 3b399f6`)
- `chrome-devtools-frontend` — dev dependency, DevTools code reused in build (`package.json:123 @ 3b399f6`)
- axe-core — accessibility audits (`package.json:156 @ 3b399f6`)
- Other runtime libraries: `third-party-web` (script ownership data), `speedline-core`, `lighthouse-stack-packs`, `robots-parser`, `csp_evaluator`, `intl-messageformat` (`package.json:158-170 @ 3b399f6`)
- Mocha, testdouble, jsdom, preact testing library — test tooling (`package.json:108 @ 3b399f6`, `package.json:137 @ 3b399f6`, `package.json:141 @ 3b399f6`, `package.json:146 @ 3b399f6`)
- ESLint and zizmor — lint code and workflows (`package.json:40-41 @ 3b399f6`)
- Yarn, Node 22.19/24/26 — package manager and runtimes (`.github/workflows/unit.yml:23 @ 3b399f6`)
- GitHub Actions, GitHub Releases, npm registry — CI and delivery (`.github/workflows/publish.yml:68-71 @ 3b399f6`, `.github/workflows/publish.yml:118 @ 3b399f6`)
- depot_tools and Chrome ToT download — fetch DevTools and test browsers (`.github/workflows/devtools.yml:79-82 @ 3b399f6`, `.github/workflows/ci.yml:57-58 @ 3b399f6`)
- protobuf 3.20 and Python — result schema round trip (`.github/workflows/unit.yml:47-60 @ 3b399f6`)
- Firebase libraries and idb-keyval — dev dependencies, likely for the web viewer (`package.json:104-105 @ 3b399f6`, `package.json:134 @ 3b399f6`); not confirmed here.
- Codecov — only referenced in a comment about coverage diffs (`.github/workflows/unit.yml:35 @ 3b399f6`)

## Worth exploring interactively

- From `yarn build-devtools` to a DevTools panel bundle — steps: script runs the bundler (`package.json:26 @ 3b399f6`); audit and gatherer lists are read from `Runner` (`build/build-bundle.js:81-84 @ 3b399f6`); they become `import()` entries (`build/build-bundle.js:94-97 @ 3b399f6`); DevTools-only shims empty locales, report assets and third-party-web (`build/build-bundle.js:116-129 @ 3b399f6`); esbuild writes the minified `iife` (`build/build-bundle.js:138-154 @ 3b399f6`) — fits FlowAnimation because the learner sees the same source shrink as each target removes pieces.
- A pull request through the CI gates — steps: type check and build (`.github/workflows/ci.yml:49-50 @ 3b399f6`); real Chrome tests (`.github/workflows/ci.yml:57-65 @ 3b399f6`); golden diff and lint (`.github/workflows/ci.yml:67-70 @ 3b399f6`); "no changed files" gate (`.github/workflows/ci.yml:84 @ 3b399f6`); DevTools build then e2e and smoke shards (`.github/workflows/devtools.yml:84-127 @ 3b399f6`) — fits SystemDiagram because each workflow checks a different part and the learner can toggle which one fails.

## Open questions

- What `roll-to-devtools.sh` and `esbuild-plugins.js` do exactly was not in this slice (`package.json:68 @ 3b399f6` only names the script).
- The wiring of `clients/devtools/devtools-entry.js` into the panel lives outside this slice.

## My insights
