# 0002. Zero dependencies and plain JavaScript

## Status

Accepted, 2026-11-19.

## Context

The domain pack suggests TypeScript with Vitest, and Puppeteer is the usual way to drive Chrome. This project teaches the protocol itself. Node 22 and later include `WebSocket`, `fetch`, `node:http` and `node:test`.

## Decision

Use plain ES modules, the built-in `node:test` runner, a small `CdpConnection` over the global `WebSocket`, and `child_process` to start Chrome. The project has no `dependencies`, so there is nothing to install and nothing to audit.

## Alternatives considered

- **Puppeteer.** It is mature and handles many browser edge cases. It would hide the command and event flow that the learner needs to see.
- **TypeScript with Vitest.** It matches the pack, but it needs a build or install step and gives little extra safety for a project this small. Classes keep JSDoc-style comments for shapes.

## Consequences

- `npm test` works on a fresh clone.
- We own the WebSocket code, so `CdpConnection` carries its own tests for replies, timeouts and closed sockets.
- A reader who wants types can move the files to TypeScript one by one.
