# 0002. Write every change as a patch instead of replacing the log

## Status

Accepted, 2026-11-19.

## Context

The log holds many notes, and one of them changes at a time. The store has to
save the log after every change. If every save replaced the whole log object,
two things go wrong: every note would look new to the dashboard, so the whole
list would redraw, and a mistake in one note would be easy to spread over all
the others.

## Decision

A change is a patch. `applyPatch` in `src/domain/TrackerState.ts` merges the
patch over the current state and returns a new state. The notes the patch does
not touch keep their identity, so the dashboard can tell that they did not
change. The store in `src/application/TrackerStore.ts` is the only place that
applies a patch, so every writer behaves the same way.

## Alternatives considered

- **Replace the whole state on every change.** Simple to write. Every note
  looks new, and a change to one note touches all of them.
- **Let each component change the state itself.** The parts of the app would
  not need a store, but then every writer would have to remember to save the
  log. One writer that forgets is one lost change.
- **Keep the state in one big object and use a reducer.** A reducer gives one
  place for the rules, but the rules of a note live in `LearningNote`, and the
  reducer would have to reach inside the notes.

## Consequences

- The dashboard only redraws the notes that really changed.
- A patch that names a note that is not in the log is refused, so a typo fails
  loudly instead of creating a broken note.
- The application layer has to build a patch for every change. The four use
  cases in `src/application/` each build one.
