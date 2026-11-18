# TIL learning journal

## The problem

A developer works through a long roadmap. Each item teaches something, and a week later it is gone. The developer needs one place to write a today-I-learned note per item, keep the primary sources next to it, see whether the web features it names are safe to use, and be told which notes to review again.

## What it does

- Saves a note per roadmap item with a title, text, and one or more primary source links.
- Shows a Baseline status badge (Widely, Newly, Limited, or Unknown) for each feature key written in backticks, such as `css.properties.gap`. The badge also shows "deprecated" and "experimental" flags and "about" when the date is an upper bound.
- Lists notes due for review. A review pushes the next date out: 1, 3, 7, 14, then 30 days.
- Works from the keyboard: a skip link, labelled fields, visible focus, a `role="alert"` error list that receives focus, and a `role="status"` line for results.
- Keeps everything in the browser. No server, no account, no secret.

**Note.** `npm audit --omit=dev --audit-level=high` passes. A full `npm audit` still reports a high advisory for `picomatch` with no fixed release. It is reachable only through development tooling, never through code that ships in the build. The check in `verification.json` uses `--omit=dev` for that reason. Do not run `npm audit fix --force`; it downgrades the pinned Vitest. A low, dev-only esbuild advisory (GHSA-g7r4-m6w7-qqqr) was fixed with a non-force `npm audit fix`.

## How to run

You need Node.js 22.12 or newer (Vitest 5 and Vite 8 require it).

```bash
npm install
cp .env.example .env     # optional: both settings have defaults
npm run dev              # open the address it prints
```

Build static files with `npm run build`. The output goes to `dist/` and works on any static host. Clearing site data in the browser deletes your notes.

To add a feature to the Baseline badges, add its key to `scripts/feature-keys.ts` and run `npm run data`.

## How to test

```bash
npm test          # 40 tests: unit, plus integration through the real adapter classes with an in-memory storage, rendered to a string
npm run typecheck
npm run build
```

## Configuration

| Variable | Meaning | Default |
|----------|---------|---------|
| `VITE_STORAGE_KEY` | Local storage key that holds the notes | `til-journal.notes.v1` |
| `VITE_LOG_LEVEL` | `info` or `error` | `info` |

Every `VITE_` variable is public in the bundle. Never put a secret in one.

## Project layout

```
src/domain/          rules, ports, errors (no browser, no React)
src/application/     one class per use case
src/infrastructure/  local storage, snapshot, clock, logger, config
src/interface/       React components
src/main.tsx         composition root
scripts/             builds the Baseline snapshot from @mdn/browser-compat-data
tests/               unit and integration tests
docs/adr/            decision records
```

## Where to read next

- `ARCHITECTURE.md` for the layers, the request flow, and the borrowed practices.
- `docs/adr/0001-local-snapshot-of-compat-data.md` and `docs/adr/0002-notes-in-local-storage.md` for the two main decisions.
- Mini project 1, `mini-01-baseline-checker`, for the status rule in isolation.
