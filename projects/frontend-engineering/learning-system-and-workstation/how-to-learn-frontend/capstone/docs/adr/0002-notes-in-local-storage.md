# 0002. Keep notes in browser local storage behind a port

## Status

Accepted, 2026-11-17.

## Context

The journal is for one learner on one machine. A server would need accounts, hosting, and secrets, none of which help the learner log a note.

## Decision

`NoteRepository` is a port in the domain. `LocalStorageNoteRepository` stores all notes as one JSON list under one key. Use cases only know the port, so tests use `InMemoryNoteRepository`.

## Alternatives considered

- **IndexedDB.** It scales further, but its API is asynchronous and verbose. A learner logs a few notes a day, so a list in local storage is enough.
- **A small backend with a database.** It allows sync between devices, but it adds a server, authentication, and deployment.

## Consequences

- Notes never leave the browser, and the app works offline.
- Clearing site data deletes the notes. The README says so.
- Local storage holds about 5 MB per origin. That is thousands of short notes.
- Moving to IndexedDB later means a new adapter and an asynchronous port (use cases would return promises).
