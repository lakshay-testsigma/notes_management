# 0002. Use ES modules only and no npm dependencies

## Status

Accepted, 2026-11-18.

## Context

The CLI must install in seconds on a new laptop, and its tests must run without a network. commitlint needs a loader that handles ES modules, CommonJS and TypeScript config files, because it serves a large plugin ecosystem. This tool has one config source: environment variables.

## Decision

The package sets `"type": "module"` and uses `import` everywhere. It uses only Node.js built-ins: `node:test`, `node:util` (`parseArgs`), `node:child_process`, `node:fs`. Node 22 or newer is required, written in `engines` and `.nvmrc`.

## Alternatives considered

- **CommonJS.** Works on every Node version, but mixing it with modern packages later needs interop code.
- **yargs and Vitest.** Better messages and a nicer test runner, but they add an install step and an audit surface for a tool that is mostly file and process work.

## Consequences

- `npm install` is not needed. There is no lockfile and no dependency audit.
- The tool cannot load config files in other module formats. That is acceptable, and it avoids the whole class of loader bugs.
- The argument parser is basic. Help text is a fixed string in `CliArgs.js`.
