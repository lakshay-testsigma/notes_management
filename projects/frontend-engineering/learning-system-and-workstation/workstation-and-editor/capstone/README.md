# devkit workstation CLI

## The problem

A frontend team hires often. Each new developer loses a day to the same causes: the wrong Node.js version, no Git identity, a tool missing from `PATH`, and commit messages that break the team's format. Without a standard format, nobody can write release notes from history.

## What it does

`devkit` is one Node.js command line tool with three commands:

- `devkit doctor` checks Node against `.nvmrc` and `engines.node`, the Git identity, the tools on `PATH`, and the `packageManager` field.
- `devkit lint` checks commit messages against the Conventional Commits format. It reads a hook file (`--edit`), the last commit (`--last`), or a range (`--from` and `--to`).
- `devkit notes` writes Markdown release notes from a commit range.

Exit codes: 0 means ok (warnings pass), 1 means a check failed, 9 means a bad command line or bad configuration.

## How to run

You need Node.js 22 or newer and Git. There is nothing to install.

```bash
cd projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/capstone
node src/main.js doctor                 # this folder pins Node 24 in .nvmrc
echo "feat: add login" > /tmp/msg && node src/main.js lint --edit /tmp/msg
node src/main.js lint --from HEAD~5 --to HEAD
node src/main.js notes --from HEAD~5 --to HEAD --version v1.1.0   # --from takes any commit or tag that exists, e.g. v1.0.0
```

If you run Node 26, the first command prints an error for `.nvmrc`. That is the tool working: run `nvm use` or change the file. To use the linter as a hook, copy `examples/commit-msg` to `.git/hooks/commit-msg`. For CI, see `examples/devkit-ci.yml`.

## How to test

```bash
npm test                  # all 45 tests, no network
npm run test:unit         # 36 unit tests with in-memory fakes
npm run test:integration  # 9 tests with real git repositories in temp folders
```

The integration tests run `git` and the real CLI process. They are skipped for the Git cases when `git` is missing.

## Configuration

All settings are environment variables. See `.env.example`. No file is read for settings.

| Variable | Meaning | Default |
|---|---|---|
| `DEVKIT_REQUIRED_TOOLS` | Tools that must be on `PATH` (error if missing) | `node,git,npm` |
| `DEVKIT_OPTIONAL_TOOLS` | Tools that should be on `PATH` (warning if missing) | `code,corepack` |
| `DEVKIT_MAX_HEADER` | Longest allowed commit header | `72` |
| `DEVKIT_WARN_RULES` | Commit rules reported as warnings | empty |
| `DEVKIT_LOG_LEVEL` | `debug`, `info`, `warn` or `error` | `warn` |

## Project layout

```
src/domain/          results, report, exit codes, version ranges, commit parser and rules, ports
src/application/     three use cases and the table of workstation checks
src/infrastructure/  config, JSON logger, real machine, real Git
src/interface/       argument parser, CLI, text reporter
src/main.js          composition root
tests/unit/          fast tests with fakes
tests/integration/   real git and real process tests
docs/adr/            two decision records
examples/            commit-msg hook and CI job
```

## Where to read next

Read `ARCHITECTURE.md`, then `src/domain/CommitRules.js`, then `src/application/WorkstationChecks.js`. Then read the two records in `docs/adr/`.
