# toolkit-profile CLI

## The problem

A frontend team shares one set of browser extensions: framework devtools, performance overlays, accessibility checkers. Nobody checks the list. One extension may ask to read every site, and nobody notices. Pages also ship with missing alt text, no canonical link or weak security headers, and each person checks them by hand.

## What it does

The CLI works in a fixed order.

1. It validates the extension profile against a JSON permission policy. A failing extension stops the run.
2. It prints a setup checklist for each phase.
3. It runs accessibility (axe-core in jsdom), SEO and security-header checks on a saved page and its saved response headers.

Every check has three outcomes: **pass**, **fail**, **needs review**. "Needs review" means the tool cannot decide, for example color contrast in jsdom, which has no layout. No real browser is needed.

## How to run

You need Node.js 22.18 or newer (the CLI runs TypeScript directly).

```bash
npm install
npm start    # validate, checklist, then page checks on sample/page.html
node src/main.ts validate  --profile sample/profile.json
node src/main.ts checklist --profile sample/profile.json
node src/main.ts audit --page sample/page.html --headers sample/headers.txt --url https://shop.example.com/
node src/main.ts run --profile sample/profile-risky.json --page sample/page.html   # stops: super-helper fails
```

With Docker:

```bash
docker build -t toolkit-profile .
docker run --rm toolkit-profile
```

Exit codes: 0 clean, 1 a check failed, 2 bad usage or unreadable input. Logs (JSON lines) go to stderr, the report to stdout. The Docker recipe was not run when this project was written, because the build sandbox had no Docker.

## How to test

```bash
npm test          # 51 tests: unit tests with fakes, integration tests with real jsdom and axe-core
npm run typecheck
```

## Configuration

Environment variables only. See `.env.example`.

| Variable | Default | Meaning |
|---|---|---|
| `TOOLKIT_POLICY` | `policy/permission-policy.json` | Path of the permission policy (`--policy` overrides it) |
| `TOOLKIT_LOG_LEVEL` | `info` | `debug`, `info`, `warn` or `error` |
| `TOOLKIT_STRICT` | `false` | `true` makes "needs review" fail the run |

## Project layout

```
src/domain/           Policy, Profile, Outcome, Summary, ResponseHeaders, ports, errors
src/application/      ProfileLoader, ManifestScorer, use cases, three checks, ChecklistBuilder
src/infrastructure/   NodeFileSource, JsdomPageParser, JsdomAxeRunner, JsonLogger, Config
src/interface/        Cli, TextRenderer
src/main.ts           composition root
policy/               the permission policy (data)
sample/               a profile, manifests, a page and headers to try
tests/                unit and integration tests, fixtures
docs/adr/             decision records
```

## Where to read next

- `ARCHITECTURE.md`: layers, classes, request flow, and the practices borrowed from axe-core.
- `docs/adr/0001-policy-as-validated-data.md` and `docs/adr/0002-three-outcomes-for-every-check.md`.
- The mini projects in the sibling folders: `mini-01-extension-permission-audit` and `mini-02-release-a11y-seo-check`.
