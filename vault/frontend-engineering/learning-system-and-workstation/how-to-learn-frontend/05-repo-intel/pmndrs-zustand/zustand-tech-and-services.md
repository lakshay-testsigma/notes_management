---
title: "pmndrs/zustand — technologies and services"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [pmndrs-zustand-repo]
---

# pmndrs/zustand — technologies and services

Every tool and service the four analysed modules use, merged into one list. The evidence
column points at the line in the clone at commit `9fed2eb`.

## Languages and runtimes

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[TypeScript]] | The whole library is written in strict TypeScript, with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` on | `tsconfig.json:4-15 @ 9fed2eb` |
| [[React]] | The React binding reads the store through `useSyncExternalStore`, and `useCallback` keeps the snapshot stable | `src/react.ts:30-35 @ 9fed2eb` |
| [[React DOM]] | The server-side rendering test renders with `renderToString` and hydrates with `hydrateRoot` | `tests/ssr.test.tsx:3 @ 9fed2eb`, `tests/ssr.test.tsx:36-39 @ 9fed2eb` |
| [[Node.js]] | The build scripts run on Node, and one test uses the `vm` module to create a promise in another JavaScript realm | `tests/persistPromiseLike.test.ts:1 @ 9fed2eb` |

## Libraries and frameworks

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[use-sync-external-store]] | The second React binding uses the shim, which also accepts a custom equality function | `src/traditional.ts:2 @ 9fed2eb`, `src/traditional.ts:36-42 @ 9fed2eb` |
| [[immer]] | The optional immer middleware runs a function updater through `produce`, so a draft update is safe | `src/middleware/immer.ts:1-2 @ 9fed2eb` |
| [[Redux DevTools]] | The devtools middleware sends every action to the extension and receives time-travel commands back | `src/middleware/devtools.ts:153-155 @ 9fed2eb`, `src/middleware/devtools.ts:251-253 @ 9fed2eb` |
| [[Web Storage API]] | `window.localStorage` is the default place where the state is saved | `src/middleware/persist.ts:179 @ 9fed2eb` |

## Data stores, queues, and external services

None: this repository is a state library, and it talks to no database, queue or API. The
only outside place it writes to is the browser's own storage
(`src/middleware/persist.ts:7-11 @ 9fed2eb`), and it talks to the Redux DevTools
extension only when that extension is installed (`src/middleware/devtools.ts:258-260 @ 9fed2eb`).

## Build, test, and delivery

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Rollup]] | One bundle per entry point, in CommonJS and ESM, plus the type declarations | `rollup.config.mjs:93-104 @ 9fed2eb` |
| [[esbuild]] | The fast transpiler that Rollup uses to transform each source file | `rollup.config.mjs:22-28 @ 9fed2eb` |
| [[Vitest]] | Runs the spec files in a jsdom environment, with the alias map that points `zustand` at `src/` | `vitest.config.mts:5-21 @ 9fed2eb` |
| [[React Testing Library]] | Renders components and wraps state changes in `act`, so the test can count re-renders | `tests/basic.test.tsx:9 @ 9fed2eb` |
| [[jest-dom]] | The DOM matchers loaded for the whole suite | `tests/setup.ts:1 @ 9fed2eb` |
| [[pnpm]] | Installs, runs the build scripts and publishes; the version is pinned by hash | `package.json:179 @ 9fed2eb` |
| [[shelljs]] | The Node and shell helpers that repair and copy the build output after Rollup wrote it | `package.json:151-152 @ 9fed2eb` |
| [[npm]] | The registry the release is published to, from inside the built `dist` folder | `.github/workflows/publish.yml:26-29 @ 9fed2eb` |
| [[pkg-pr.new]] | Publishes a preview package per pull request, so a change can be tried in a real app | `.github/workflows/preview-release.yml:29 @ 9fed2eb` |
| [[GitHub Actions]] | Eight workflows gate the merge and publish the release | `.github/workflows/test.yml:1 @ 9fed2eb` |
| [[pmndrs docs]] | A reusable workflow that builds the documentation site and deploys it to GitHub Pages | `.github/workflows/docs.yml:18 @ 9fed2eb` |

## Observability and security tooling

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[ESLint]] | Type-aware rules for the source, and test-only rules for `tests/**` | `eslint.config.mjs:13-18 @ 9fed2eb`, `eslint.config.mjs:79-91 @ 9fed2eb` |
| [[Prettier]] | Formatting, checked as its own CI step so reviews stay about behaviour | `package.json:80 @ 9fed2eb` |
| [[Dependabot]] | Daily npm updates and weekly action updates, and it ignores patch and minor bumps | `.github/dependabot.yml:3-21 @ 9fed2eb` |

Two more gates act as performance and security checks rather than tools. Every pull
request is measured by a compressed-size action over the built bundles
(`.github/workflows/compressed-size.yml:25-27 @ 9fed2eb`), and pnpm is told not to run
install scripts for `esbuild` and `unrs-resolver`
(`pnpm-workspace.yaml:1-3 @ 9fed2eb`).

## My insights
