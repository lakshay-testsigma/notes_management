# Site network report

## The problem

Before a launch, a team wants to know if the site's network setup is right. DNS records, the TLS certificate, HSTS, the HTTP version, cache headers, compression and cookies each have rules, and they live in different tools. People check them by hand and miss things.

## What it does

The tool reads four saved files from one folder: DNS answers (`dns.json`), certificate facts (`tls.json`), HTTP responses (`site.har`, a HAR export from browser developer tools) and a policy (`policy.json`). It runs six checks and prints a report. The exit code is 0 when the report passes, 1 when findings reach the `FAIL_ON` level, and 2 when an input or setting is wrong.

Each finding has a severity (`error` or `warning`) and a verdict. The verdict `unknown` means the data could not be read, so the tool could not judge it. It is never counted as a pass.

It builds on the three mini projects: the DNS inspector (record and TTL rules), the cache header auditor (hashed assets and revalidation) and the cookie linter (attributes and prefixes). Here the rules sit behind one `Check` interface and share one report.

## How to run

You need Node.js 22.18+, 24 or 26 (`node --version`); vitest 5 does not support Node 25. Node runs the `.ts` files directly, so there is no build step. Written with Node 26.

```bash
cd projects/frontend-engineering/how-the-web-works/internet-and-networking/capstone
npm install
npm start               # good sample: prints "No problems found." and exits 0
npm run start:bad       # bad sample: lists problems and exits 1 on purpose
```

`npm run start:bad` exits with code 1 on purpose (check with `echo $?`); some npm versions also print an npm error line. That exit code is what a CI job would see.

The sample uses `REPORT_NOW` so the certificate dates give the same result on any day. Set `REPORT_NOW=2026-11-18T00:00:00Z` for the samples (`.env.example` has it). Other examples:

```bash
REPORT_NOW=2026-11-18T00:00:00Z REPORT_FORMAT=json node src/main.ts fixtures/bad
FAIL_ON=never node src/main.ts fixtures/bad     # print, but always exit 0
docker build -t site-network-report . && docker run --rm site-network-report
```

To check your own site, export a HAR file from the browser Network panel, save the DNS answers and certificate facts in the same JSON shape as `fixtures/good`, add a `policy.json`, and pass the folder.

## How to test

```bash
npm test                # 52 tests: unit tests and the integration tests that start the CLI
npm run typecheck       # tsc --noEmit
npm audit --omit=dev --audit-level=high
```

## Configuration

All settings are environment variables and all are optional. A wrong value stops the run with exit code 2.

| Variable | Values | Default |
|---|---|---|
| `REPORT_FORMAT` | `text`, `json` | `text` |
| `FAIL_ON` | `error`, `warning`, `never` | `error` |
| `LOG_LEVEL` | `silent`, `warn`, `info` | `warn` |
| `REPORT_NOW` | ISO date | the real time |
| `POLICY_FILE` | path | `<folder>/policy.json` |

## Project layout

```text
src/domain/            checks, parsers, Report, ports, errors
src/application/       RunReport (the use case)
src/infrastructure/    file readers, HAR reader, policy, logger, clocks, config
src/interface/         Cli and renderers
src/main.ts            composition root
tests/unit/            tests with in-memory data and fakes
tests/integration/     tests with real files and the real process
fixtures/good, bad     sample inputs
docs/adr/              decision records
```

## What it does not check

These are written down on purpose, so nobody reads a clean report as more than it is.

- No live DNS lookups, no live TLS handshake and no HTTP/3 (QUIC) probing. It only reads saved data.
- No certificate chain validation, revocation or CT logs. `tls.json` carries only the protocol, dates and names.
- No `Vary` correctness beyond `*` and `Accept-Encoding`, and no `Cache-Control` request directives.
- HAR files from a client that does not offer HTTP/3 never show HTTP/3. The report names the client for this reason.
- The Dockerfile was written but not built here, because the authoring sandbox had no Docker access. Run the `docker build` line yourself to verify it.
- Dev dependencies (vitest) currently have npm advisories; see the audit note below.

Audit note: `npm audit --omit=dev` reports no vulnerabilities, because the tool has no runtime dependencies. `npm audit` with dev dependencies reports 5 high advisories in the `vitest` chain (`vite`, `picomatch`, `tinyglobby`). They affect the test runner only, not the shipped tool.

## Where to read next

- `ARCHITECTURE.md` for layers, classes and diagrams.
- `docs/adr/` for three design decisions.
- The vault note `06-capstone-internet-and-networking.md`.
