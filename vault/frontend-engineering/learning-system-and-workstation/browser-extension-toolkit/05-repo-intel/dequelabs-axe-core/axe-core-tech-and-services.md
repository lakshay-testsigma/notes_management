---
title: "dequelabs/axe-core — technologies"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [dequelabs-axe-core-repo]
---

# dequelabs/axe-core — technologies and services

Coverage: selected first-party paths only (six slices, see [[axe-core-architecture]]). The direct runtime dependency seen is colorjs.io. Build, test and CI tooling comes from the manifest, the workspace file, and the workflows. Transitive dependencies and vendored code were not inventoried.

## Languages and runtimes

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Node.js]] | Dev and CI runtime pinned to Node 24; the built file is also tested on Node 6 to 24 | `.nvmrc:1 @ e80f6b7`, `.github/workflows/test.yml:245-264 @ e80f6b7` |
| [[TypeScript]] | Type check only, through `tsc` | `package.json:84 @ e80f6b7`, `package.json:179 @ e80f6b7` |
| Browser JavaScript (ES modules) | The engine runs inside the tested page, with no framework | `lib/core/public/run.js:1-5 @ e80f6b7` |
| Chrome and Firefox (headless) | Real browsers run the tests because checks need layout and styles | `.github/workflows/test.yml:80-89 @ e80f6b7`, `.github/workflows/test.yml:106-116 @ e80f6b7` |

## Libraries and frameworks

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[colorjs.io]] | Colour parsing and maths for contrast; patched in the workspace | `package.json:143 @ e80f6b7`, `pnpm-workspace.yaml:11-12 @ e80f6b7` |
| [[window.postMessage]] | Default channel between the parent axe and axe inside iframes | `lib/core/utils/frame-messenger/post-message.js:42 @ e80f6b7` |
| [[WCAG]] | The standard the rules map to, for example tag `wcag143` | `lib/rules/color-contrast.json:7-9 @ e80f6b7` |
| [[axe-core]] | The engine itself, wrapped by the browser extensions of this topic | `README.md:11 @ e80f6b7` |

## Data stores, queues, and external services

None: this repository is a library that runs in the page. It has no database or server. It reads the page's own DOM and computed styles (`lib/checks/color/color-contrast-evaluate.js:44 @ e80f6b7`). Sauce Labs appears only in a comment about launcher compatibility (`test/wtr.config.mjs:56 @ e80f6b7`). The external test corpora are w3c/aria-practices and w3c/wcag-act-rules, pinned to commit hashes (`package.json:135 @ e80f6b7`, `package.json:181 @ e80f6b7`).

## Build, test, and delivery

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[pnpm]] | Package manager, with per-package install-script allowlist | `package.json:6 @ e80f6b7`, `pnpm-workspace.yaml:3-12 @ e80f6b7` |
| [[esbuild]] | Bundles the engine and the small gather-internals script | `build/run-build/esbuild-core.mjs:4 @ e80f6b7` |
| [[Babel]] | Rewrites the bundle for older browsers | `build/run-build/full-build.mjs:53 @ e80f6b7` |
| [[UglifyJS]] | Makes the minified copy | `package.json:180 @ e80f6b7` |
| [[web-test-runner]] | Runs unit tests in real browsers | `package.json:134 @ e80f6b7`, `test/wtr.config.mjs:5 @ e80f6b7` |
| [[Selenium WebDriver]] | Drives Chrome and Firefox through a custom launcher | `test/wtr.config.mjs:6-14 @ e80f6b7` |
| [[Mocha]] and [[Chai]] | Test structure and assertions | `package.json:167 @ e80f6b7`, `test/core/public/run.js:1-5 @ e80f6b7` |
| [[Sinon]] | Stubs the logger in tests | `test/core/public/run.js:179-180 @ e80f6b7` |
| [[jsdom]] | A separate, smaller non-browser test job | `package.json:164 @ e80f6b7` |
| [[GitHub Actions]] | CI and the release pull-request workflow | `.github/workflows/test.yml:26 @ e80f6b7`, `.github/workflows/release.yml:3 @ e80f6b7` |
| [[commit-and-tag-version]] | Version bump and changelog | `package.json:144 @ e80f6b7` |
| [[ESLint]] and [[Prettier]] | Lint and format | `package.json:82 @ e80f6b7`, `package.json:184-192 @ e80f6b7` |
| [[Husky]] | Pre-commit hooks (with lint-staged) | `package.json:116-119 @ e80f6b7` |

## Observability and security tooling

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Subresource Integrity]] | Release hash history, built with sri-toolbox and validated on master and release branches | `package.json:176 @ e80f6b7`, `.github/workflows/test.yml:227-238 @ e80f6b7` |
| Pinned actions and empty `permissions` | Supply-chain guard in CI | `.github/workflows/test.yml:19 @ e80f6b7`, `.github/workflows/test.yml:29-33 @ e80f6b7` |
| Optional `performanceTimer` | Phase timing of a scan | `lib/core/public/run.js:36-38 @ e80f6b7` |

## My insights
