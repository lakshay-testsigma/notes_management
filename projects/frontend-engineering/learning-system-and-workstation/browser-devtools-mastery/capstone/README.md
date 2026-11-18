# Perf-triage: one report from a HAR, a trace and a Lighthouse file

## The problem

A bug report says "checkout is slow". It comes with three files. A HAR file lists every network request. A Performance trace records what the main thread did. A Lighthouse report scores the page. Reading all three by hand takes an hour, and each person checks different numbers.

## What it does

Perf-triage reads the files you give it and checks them against budgets. A budget is a limit the team agreed on, such as "a server reply under 800 ms". It prints one ranked list: budget failures first, then the biggest estimated time savings. If one file is broken, it still checks the others and lists the broken one as skipped.

It uses these ideas: HAR export, waterfall timing phases, long tasks, Core Web Vitals and Lighthouse audits. In a HAR phase, `-1` means "did not happen".

## How to run

You need Node.js 22.18 or newer. You do not need a build step.

```bash
npm install
npm start
```

That runs the CLI on the sample files. To use your own files:

```bash
node src/main.ts --har my.har --trace my-trace.json --lighthouse report.json
node src/main.ts --har my.har --json          # JSON instead of Markdown
```

Exit codes: 0 clean, 1 a budget failed, 2 bad usage or no readable input. Add `--exit-zero` if you always want 0 when something was read. You can also build a Docker image with `docker build -t perf-triage .`. I did not run that step. I did run the plain Node recipe.

## How to test

```bash
npm test
npm run typecheck
```

There are 28 tests: 23 unit tests and 5 integration tests. One integration test compares the output with a golden report in `tests/fixtures/expected-report.md`.

## Configuration

Environment variables only. See `.env.example`.

| Variable | Meaning | Default |
|---|---|---|
| `PERF_TRIAGE_BUDGETS` | Path to a JSON file that overrides budgets, for example `{"maxCls": 0.25}` | built-in budgets |
| `PERF_TRIAGE_LOG_LEVEL` | `debug`, `info`, `error` or `silent` | `info` |

Default budgets: server wait 800 ms, request total 3000 ms and page weight 1.5 MB. Long task 200 ms and blocking time 300 ms. Layout shift 0.1, LCP 2500 ms, FCP 1800 ms and Lighthouse score 0.9. We wrote the sample files for this project. They hold no third-party assets. The report never prints URL query strings, because they often hold tokens.

## Project layout

```
src/domain/          Budgets, model types, errors, ports
src/application/     gatherers, audits, Artifacts, Ranker, TriageUseCase
src/infrastructure/  NodeFileSource, JsonLogger, Config
src/interface/       Cli, MarkdownRenderer
src/main.ts          composition root
tests/unit, tests/integration, tests/fixtures
samples/             a HAR, a trace and a Lighthouse report
docs/adr/            decision records
```

## Where to read next

- `ARCHITECTURE.md` for the layers, the diagrams and the practices borrowed from Lighthouse and DevTools frontend.
- `docs/adr/0001-separate-gathering-from-auditing.md` for the main design choice.
