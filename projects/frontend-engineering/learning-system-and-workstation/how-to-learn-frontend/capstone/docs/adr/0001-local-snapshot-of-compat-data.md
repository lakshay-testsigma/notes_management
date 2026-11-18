# 0001. Serve Baseline data from a small snapshot built at development time

## Status

Accepted, 2026-11-17.

## Context

The journal must show a Baseline status for web features a note mentions. The data comes from the `@mdn/browser-compat-data` package. The full package is several megabytes. The app has no server, so the browser would have to download all of it.

## Decision

A script (`scripts/build-snapshot.ts`) reads the package for a list of feature keys (`scripts/feature-keys.ts`) and writes `src/infrastructure/data/feature-snapshot.json`. It keeps only the seven core browsers. `SnapshotFeatureCatalog` serves that file. The package stays a development dependency, so it is not in the production audit. A key outside the list shows "not in the local data" instead of a guess.

## Alternatives considered

- **Import the whole package in the browser.** It always has an answer, but it adds megabytes to every page load.
- **Call a hosted API at runtime.** It needs a server or a third party, breaks offline use, and sends the learner's feature names away.

## Consequences

- The bundle stays small (about 80 kB gzipped).
- Data goes stale until someone runs `npm run data` after updating the package. The snapshot records its source version.
- The learner must add a key to `feature-keys.ts` for a new feature.
