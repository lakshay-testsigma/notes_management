---
title: "pmndrs/zustand — takeaways"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [pmndrs-zustand-repo]
---

# pmndrs/zustand — takeaways for the capstone

The capstone is "Learning tracker". A developer tracks their frontend learning: each
roadmap item is a note with read, build, measure, and explain, and a dashboard shows
progress and gaps. These are the things worth borrowing.

1. **Write a roadmap item as a patch, not as a replacement.** The tracker holds many
   notes, and marking one as "build done" should leave the other notes exactly as they
   were. From [[zustand-findings|finding 1]], [[zustand-pattern-write-as-patch|write as a patch]].
2. **Save the log with a version number and a migration.** You will change the shape of
   a note later, and the saved log in a browser will still have the old shape. From
   [[zustand-findings|finding 2]], [[zustand-pattern-versioned-persistence|versioned persistence]].
3. **Give the load a number so a late answer cannot overwrite newer work.** When the
   tracker fetches the log from a server, a slow answer must not wipe a change the
   developer just made. From [[zustand-findings|finding 3]].
4. **Keep the first state for the server.** The dashboard can be rendered on a server,
   and the first client render has to match the server markup. From
   [[zustand-findings|finding 4]].
5. **Add a feature by replacing a method on the store object.** An "export my log"
   button and a "reset the tracker" button should behave the same wherever they write
   from. From [[zustand-findings|finding 5]], [[zustand-pattern-middleware-as-decorator|middleware as a decorator]].
6. **Let the type checker hold the contract, and test the types.** The four steps of
   the learning loop are a shape, and the compiler should refuse a note with a wrong
   step. From [[zustand-findings|finding 6]], [[zustand-pattern-type-level-contract|type-level contract tests]].
7. **Name every action from the function that caused it.** The history of a learning
   session reads like "read the article", not like "set state". From
   [[zustand-findings|finding 8]].
8. **Run the tests against the built artefact, not only against the source.** The
   dashboard is what people open, so the built bundle is what has to work. From
   [[zustand-findings|finding 10]], [[zustand-pattern-test-the-built-artefact|test the built artefact]].

## What not to copy

- The Redux DevTools bridge and the time-travel commands. They are worth the effort for
  a library that many teams depend on, and they are too much for one learning tracker.
- The mutator registry that other packages can add to. One app with one store does not
  need a public extension contract.
- Two React bindings and the `use-sync-external-store` shim. The modern React hook is
  enough for a dashboard that ships with React 18 or newer.
- Reading the JavaScript stack trace to name an action. A plain name at the call site
  is easier to read and easier to search.

## My insights
