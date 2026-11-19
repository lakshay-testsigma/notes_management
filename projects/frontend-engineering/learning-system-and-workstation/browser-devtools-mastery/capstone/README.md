# Page health inspector

## The problem

A page feels slow, or it throws errors, and the team does not know where to look. Opening DevTools by hand each time is slow and cannot be shared. The team needs one place to paste a URL and see the evidence.

## What it does

A Node service loads the page in headless Chrome through the Chrome DevTools Protocol. It then shows a report page with four sections:

- **Network timing:** DNS, connect, TLS, wait (time to first byte) and download for each request, plus failed and incomplete requests and redirects.
- **Core Web Vitals:** Largest Contentful Paint, Cumulative Layout Shift, and total blocking time from long tasks, each with a good, needs-work or poor label.
- **Console errors:** uncaught exceptions, `console.error` calls and browser log errors, grouped by message.
- **Heap growth:** used JavaScript heap after load and after a short wait, both after garbage collection.

If one section cannot be measured, the report says so and keeps the other three. The raw events are saved as a JSON file, so you can rebuild a report later without Chrome.

The project has no npm dependencies and uses no images, fonts or icons, so there is no asset license to record.

## How to run

You need Node.js 22 or later and Google Chrome. Chrome is started by the service, so it must be installed on the machine.

```bash
cp .env.example .env      # optional: set CHROME_PATH if Chrome is not in the default place
npm start
```

Then open `http://localhost:3000`, paste a public URL such as `https://example.com`, and press Inspect. A run takes a few seconds, and up to `NAV_TIMEOUT_MS` for slow pages.

Rebuild a report from a saved capture, with no Chrome:

```bash
CAPTURE_DIR=tests/fixtures npm run analyze -- capture-sample.json
```

Live runs were not executed in the build environment, because Chrome could not start there. The driver is tested with a scripted fake connection, and the HTTP server is tested with a fake driver. Run one live inspection yourself to confirm your Chrome path.

## How to test

```bash
npm test
```

This runs 50 tests with `node --test`. They need no browser and no network. They use one recorded event log, `tests/fixtures/capture-sample.json`, with hand-made edge cases: a reused connection with `-1` timings, a redirect, a failed request, and a response with no request.

## Configuration

All settings are environment variables. No secret is needed.

| Variable | Meaning | Default |
|----------|---------|---------|
| `PORT` | HTTP port of the dashboard | `3000` |
| `CHROME_PATH` | Chrome executable | default path for your system |
| `NAV_TIMEOUT_MS` | Longest wait for the page to settle | `30000` |
| `HEAP_WAIT_MS` | Pause between the two heap samples | `2000` |
| `CAPTURE_DIR` | Folder for raw capture files | `captures` |
| `ALLOW_PRIVATE_HOSTS` | `true` to allow localhost and private addresses | `false` |

Keep `ALLOW_PRIVATE_HOSTS` off on any shared server. Otherwise anyone who can reach the dashboard can make it open internal addresses.

## Project layout

```
src/domain/           Result, UrlPolicy, Rating, errors, port shapes
src/analysis/         pure analyzers: timing, vitals, console, heap
src/application/      InspectPageUseCase, AnalyzeSavedCaptureUseCase, ReportBuilder
src/infrastructure/   ChromeCdpDriver, CdpConnection, ChromeLauncher, LoadSettler, CaptureStore, Config, Logger
src/interface/        DashboardServer and the public/ dashboard page
src/main.js           composition root
tests/unit/           analyzers, policy, connection, store
tests/integration/    HTTP server with a fake driver, driver with a fake connection
tests/fixtures/       recorded capture
docs/adr/             decision records
```

## Where to read next

Read `ARCHITECTURE.md`, then `src/analysis/RequestTimingAnalyzer.js`, then `src/infrastructure/CdpConnection.js`. The decision records are in `docs/adr/`.
