---
title: "mdn/browser-compat-data — technologies and services"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-17
sources: [mdn-browser-compat-data-repo]
---

# mdn/browser-compat-data — technologies and services

Coverage: first-party code and config at commit 8f942b4 from the five analyzed slices, plus direct dependencies named in `package.json`. Vendor and transitive packages, and the data folders, are not covered.

## Languages and runtimes

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| JavaScript (ES modules) on Node 24+ | All scripts and the package are ES modules; Node 24 or later is required | `package.json:6 @ 8f942b4`, `package.json:29-31 @ 8f942b4` |
| [[TypeScript]] | `tsc` checks the `.js` files (`allowJs`, `checkJs`, `noEmit`) and the generated types | `tsconfig.json:8-10 @ 8f942b4`, `package.json:108 @ 8f942b4` |
| [[JSON Schema]] (draft-07) | The rules for every data file and browser file | `schemas/compat-data.schema.json:2 @ 8f942b4` |

## Libraries and frameworks

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Ajv]] (with ajv-formats, ajv-errors, better-ajv-errors) | One shared validator, all errors collected, readable messages | `scripts/lib/ajv.js:1-20 @ 8f942b4`, `lint/linter/test-schema.js:4 @ 8f942b4` |
| [[json-schema-to-typescript]] | Makes `.d.ts` from the schemas | `scripts/generate-types.js:11 @ 8f942b4` |
| compare-versions | Orders version strings such as `3.6` | `lint/linter/test-versions.js:6 @ 8f942b4`, `scripts/build/mirror.js:4 @ 8f942b4` |
| marked | Converts Markdown notes to HTML in the build | `scripts/build/index.js:12 @ 8f942b4` |
| fast-json-stable-stringify | Same key order on every build | `scripts/build/index.js:10 @ 8f942b4` |
| fdir | Finds every `.json` data file fast | `index.js:10 @ 8f942b4` |
| yargs and es-main | Command line options; run a script only when called directly | `lint/lint.js:9-11 @ 8f942b4`, `scripts/build/index.js:439-441 @ 8f942b4` |
| [[web-features]] | Supplies feature ids for the `web-features:<id>` tags | `package.json:98 @ 8f942b4`, `scripts/tag-web-features.js:10 @ 8f942b4` |

## Data stores, queues, and external services

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[npm]] registry | Where `@mdn/browser-compat-data` is published, with provenance | `.github/workflows/release.yml:63 @ 8f942b4` |
| `mdn/bcd-utils` repository dispatch | A `bcd_release` event tells another MDN repository about a release | `.github/workflows/release.yml:76-81 @ 8f942b4` |
| Browser bug trackers (Chromium, Mozilla, WebKit) | Allowed hosts for `impl_url` links | `schemas/compat-data.schema.json:189 @ 8f942b4` |
| MDN Web Docs | Target of the URL check; `mdn_url` must start with the MDN docs address | `lint/linter/test-mdn-urls.js:59 @ 8f942b4`, `schemas/compat-data.schema.json:202-203 @ 8f942b4` |
| @webref/xref and @ddbeck/mdn-content-inventory | Spec and MDN content data used by checks | `package.json:58 @ 8f942b4`, `package.json:66 @ 8f942b4` |

None of these is a database. The repository is itself the data store: JSON files in git.

## Build, test, and delivery

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[GitHub Actions]] | CI, release and bot automation | `.github/workflows/test.yml:1 @ 8f942b4` |
| GitHub CLI (`gh`) | Creates releases and draft release pull requests | `.github/workflows/release.yml:37 @ 8f942b4`, `scripts/release/index.js:73 @ 8f942b4` |
| peter-evans/create-pull-request | Bot pull requests for browser releases and tags | `.github/workflows/update-browser-releases.yml:41 @ 8f942b4` |
| [[Node.js test runner]] with c8 | Unit tests and coverage | `package.json:106 @ 8f942b4` |
| [[ESLint]] and [[Prettier]] | Lint and format, chained with `tsc` in `npm run format` | `package.json:108 @ 8f942b4` |
| lefthook | Git hooks | `package.json:88 @ 8f942b4` |
| [[Dependabot]] | Dependency updates with a 3-day cooldown | `.github/dependabot.yml:9-14 @ 8f942b4` |

## Observability and security tooling

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| npm provenance and OIDC | Consumers can verify which workflow built the package; no stored npm token | `.github/workflows/release.yml:18 @ 8f942b4`, `.github/workflows/release.yml:63 @ 8f942b4` |
| Actions pinned to commit SHAs, read-only permissions | Lowers the risk from a changed third-party action; see [[Software supply chain]] | `.github/workflows/test.yml:9-10 @ 8f942b4`, `.github/workflows/test.yml:21-23 @ 8f942b4` |
| CODEOWNERS | Workflows need the engineering team to review | `.github/CODEOWNERS:9 @ 8f942b4` |

## My insights
