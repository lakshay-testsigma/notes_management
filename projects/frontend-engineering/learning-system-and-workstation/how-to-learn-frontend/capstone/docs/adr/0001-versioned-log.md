# 0001. Save the learning log under a version number and migrate it

## Status

Accepted, 2026-11-19.

## Context

The log lives in the browser, so the developer keeps it between visits. The
shape of a note will change: the first version kept the steps as a list of the
ones that were done, and the current version keeps a record for every step with
its own text. A log that was written by the first version is still in the
browser when the app is updated.

Reading such a log without a version number means guessing. A log written by a
newer build is even worse: the app cannot know what it holds.

## Decision

The saved value is an object with a `version` number and the notes. The
repository in `src/infrastructure/LocalStorageTrackerRepository.ts` compares the
saved version with the version the build expects.

- An older version is migrated. The migration from version 1 to version 2 turns
  the list of done steps into a record for every step. The migrated log is
  written back under the current version.
- A newer version is not guessed at. The log is put aside, the app starts with
  an empty log, and the logger writes an error.
- A value that is not valid JSON is put aside in the same way.

## Alternatives considered

- **Keep the shape forever and never migrate.** The log stays simple, but the
  first change of the shape throws away the work of every developer who used
  the app.
- **Throw every old log away.** Simple, and it costs the developer the whole
  log the first time the shape changes.
- **Read the old shape without recording a version.** The app cannot tell an
  old log from a broken one, so it has to try both shapes and hope.

## Consequences

- The developer keeps the log when the shape changes.
- The repository owns one migration function per old version. A new version
  adds one more.
- A log from a newer build is lost, on purpose, and the error in the log says
  so.
- The version number is part of the saved data, so it has to be read on every
  load.
