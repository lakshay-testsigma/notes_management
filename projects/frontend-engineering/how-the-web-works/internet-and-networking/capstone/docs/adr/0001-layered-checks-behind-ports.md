# 0001. Put each rule area in its own Check class behind a port

## Status

Accepted, 2026-11-18.

## Context

The report must cover six areas: DNS, HTTPS and HSTS, HTTP version, caching, compression and cookies. Teams will want to add more, and they will want to test each area alone. The data comes from files today. A later version might read live DNS or a live server.

## Decision

Each area is one class that implements the `Check` interface (`src/domain/ports.ts`). A check is a pure function of its input: it gets a `CheckContext` (site data, policy, time) and returns findings. Inputs reach the use case through ports (`SiteDataSource`, `PolicyRepository`, `Clock`), and `src/main.ts` is the only place that picks the real classes.

## Alternatives considered

- **One long function with six sections.** It is shorter at first. It grows hard to test, and one bug can hide all areas.
- **A plugin system that loads checks from a folder.** It lets users add checks without editing code. It adds loading rules and error cases that a learning project does not need.
- **Checks that read files themselves.** It saves the port. Then every check test needs real files, and live data would change every check.

## Consequences

- A new check is one class, one test and one line in `src/main.ts`.
- Unit tests need no files: they build a `CheckContext` in memory.
- There are more small files to read, and the learner must know the ports first.
