---
title: "pmndrs/zustand — module persist-and-devtools"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [pmndrs-zustand-repo]
---

# pmndrs/zustand — module: persist-and-devtools

## Responsibility

These two middlewares take the store out of the JavaScript process. `persist` writes the
state to a key-value store and reads it back at start-up, with a version number so old
saved data can be migrated instead of crashing the app. `devtools` records every state
change as a named action and hands the history to the Redux DevTools browser extension,
so a developer can jump back to an earlier state. Neither one is in the textbook version
of a store; both are what a production app needs once the state has to survive a reload
and has to be debuggable.

## Key files

| File | Role |
|------|------|
| `src/middleware/persist.ts` | Storage adapter, rehydration, versioning and migration, the `api.persist` control surface |
| `src/middleware/devtools.ts` | Connection to the Redux DevTools extension, action recording, time travel, action-creator discovery |
| `tests/persistSync.test.tsx` | The promises a synchronous storage must keep (22 test cases) |
| `tests/persistPromiseLike.test.ts` | The thenable-but-not-Promise case, and the migration write ordering |
| `tests/persistAsync.test.tsx` | The truly asynchronous storage case, concurrent hydration and `clearStorage` |

The devtools test file `tests/devtools.test.tsx` (3,520 lines) was left out of this
slice on purpose, so the devtools behaviour below is read from the source, not from its
tests.

## How it works

### persist: writing

1. The middleware wraps the store's `set`, so every write is followed by a write to
   storage (`src/middleware/persist.ts:220-232`).
2. What gets written is `partialize(state)` next to the current `version`, so only the
   part of the state you care about is saved (`src/middleware/persist.ts:210-216`).
3. The storage itself is a three-method interface: `getItem`, `setItem`, `removeItem`
   (`src/middleware/persist.ts:7-11`). `createJSONStorage` wraps a plain browser storage
   such as `localStorage` and adds `JSON.parse` and `JSON.stringify` around it
   (`src/middleware/persist.ts:31-61`).
4. The default storage is `window.localStorage`, and the default merge is a shallow
   merge of the saved state over the current state (`src/middleware/persist.ts:178-187`).

### persist: reading

5. `createJSONStorage` calls the getter inside a `try` and returns nothing if it throws.
   The comment names the reason: a server-side render has no `window`
   (`src/middleware/persist.ts:36-41`).
6. When there is no storage at all, the middleware still builds a working store, but each
   write logs a warning that the storage is unavailable (`src/middleware/persist.ts:197-208`).
7. At start-up, `hydrate` reads the stored value and compares its `version` with the one
   in the options. A mismatch means the saved shape is old, so `migrate` is called with
   the old state and the old version number (`src/middleware/persist.ts:260-284`). When no
   `migrate` function was given, the middleware logs an error and drops the stored value
   instead of writing broken state back (`src/middleware/persist.ts:276-278`).
8. The result is merged into the store with `set(state, true)`. The `true` means
   "replace the whole state", so the store ends up exactly as the saved state plus the
   merge (`src/middleware/persist.ts:291-296`).
9. For a synchronous storage there is one more trick: the saved state is returned from
   the initializer itself, because otherwise `create` would overwrite it with the
   initial state. The comment in the source calls it a workaround
   (`src/middleware/persist.ts:236-239` and `src/middleware/persist.ts:373`).

### persist: the control surface

10. `api.persist` is the public handle: `setOptions`, `clearStorage`, `rehydrate`,
    `hasHydrated`, `onHydrate`, `onFinishHydration` and `getOptions`
    (`src/middleware/persist.ts:329-367`). Both `onHydrate` and `onFinishHydration`
    return an unsubscribe function (`src/middleware/persist.ts:353-366`).

### devtools: recording

11. The middleware only connects when the extension is installed and the build is not a
    production build (`src/middleware/devtools.ts:248-260`). If the extension is
    missing, the store is returned untouched (`src/middleware/devtools.ts:258-260`).
12. `api.setState` is replaced. Every write is applied to the store and then sent to the
    extension as an action, together with the new state
    (`src/middleware/devtools.ts:267-296`).
13. When you do not name the action, the middleware works out a name for you: the
    `anonymousActionType` option, or the name of the function that called `setState`,
    found by reading the JavaScript stack trace and matching the frame after
    `api.setState` (`src/middleware/devtools.ts:271-277` and
    `src/middleware/devtools.ts:223-235`). The stack formats are parsed for V8, Gecko
    and JavaScriptCore separately (`src/middleware/devtools.ts:218-221`).

### devtools: time travel

14. The middleware subscribes to the extension and switches on the message type
    (`src/middleware/devtools.ts:386-391`). `ACTION` runs a custom action;
    `DISPATCH` handles `RESET`, `COMMIT`, `ROLLBACK`, `JUMP_TO_STATE`, `JUMP_TO_ACTION`,
    `IMPORT_STATE` and `PAUSE_RECORDING` (`src/middleware/devtools.ts:494-555`).
15. `JUMP_TO_STATE` and `JUMP_TO_ACTION` put an earlier snapshot back into the store
    (`src/middleware/devtools.ts:521-534`). Those writes go through
    `setStateFromDevtools`, which turns recording off for the duration of the jump, so
    travelling backwards is not itself recorded as a new action
    (`src/middleware/devtools.ts:313-318`).

### devtools: the action dropdown

16. The extension can offer a list of actions the developer can trigger. The middleware
    finds the candidate functions by walking the state object for functions and building
    their dot-notation paths (`src/middleware/devtools.ts:600-622`).
17. The parameter names for that dropdown are read out of the function source with a
    small tokenizer that understands strings, comments and default values
    (`src/middleware/devtools.ts:631-661`).
18. Wildcards let the developer pick which actions appear: `*` matches one path level,
    `**` matches any depth, and a longer, more specific pattern wins over a shorter one
    (`src/middleware/devtools.ts:581-588` and `src/middleware/devtools.ts:674-695`).

## Beyond the textbook

### Saved data carries a version and a migration

This is [[Versioned persistence]] in practice.
- Textbook version: write the whole state to one key and read it back unchanged.
- What they do: the saved value is a small object with the state and a `version`
  number. A version that does not match the one in the options triggers a `migrate`
  function; if there is no `migrate` function, the middleware logs an error and throws
  the saved data away instead of merging a stale shape into the store.
- Why: the option's own comment says it is for adding a breaking change to the store
  (`src/middleware/persist.ts:93-105`), and the stored shape really does change when the
  state shape changes.
- Evidence: `src/middleware/persist.ts:262-284`, `tests/persistSync.test.tsx:136`,
  `tests/persistSync.test.tsx:173`, `tests/persistAsync.test.tsx:216`

### One code path for a synchronous store and a network store

- Textbook version: write two implementations, one for `localStorage` and one for
  anything that returns a promise.
- What they do: every read goes through a helper that turns any value into a thenable.
  A plain value becomes a fake thenable that calls the callback immediately, so the
  promise chain in `hydrate` works the same for both kinds of storage. A function that
  throws is turned into a rejected thenable instead of an exception.
- Why: the tests cover a storage that returns a real `Promise` and a storage that
  returns a `PromiseLike` object that is not a promise at all, and both must hydrate.
- Evidence: `src/middleware/persist.ts:148-174`, `src/middleware/persist.ts:259`,
  `tests/persistPromiseLike.test.ts:17`, `tests/persistPromiseLike.test.ts:47`

### Hydration is a versioned operation that can be cancelled

- Textbook version: read the saved state once and assign it.
- What they do: every hydration run gets a number. When a newer hydration starts, the
  older one notices its number is stale and stops without touching the store. Clearing
  the storage also bumps the number, so a slow read that was already in flight cannot
  bring the old value back.
- Why: with an asynchronous storage the read can finish after the user has already
  changed the state, or after the user signed out. The tests name the behaviour
  directly: "only last one wins".
- Evidence: `src/middleware/persist.ts:190-192`, `src/middleware/persist.ts:250-251`,
  `src/middleware/persist.ts:286-289`, `src/middleware/persist.ts:340-343`,
  `tests/persistAsync.test.tsx:935`, `tests/persistAsync.test.tsx:1082`

### The app can watch the hydration

- Textbook version: fire and forget; the app renders and hopes the state is there.
- What they do: three hooks. `onRehydrateStorage` returns a callback that runs after
  the rehydration or after a failure, `onHydrate` and `onFinishHydration` are
  listener sets, and `hasHydrated()` tells the app whether it should still show a
  loading screen.
- Why: the source comment on `onRehydrateStorage` says the returned function is called
  "after the state rehydration or when an error occurred", so a screen can move past
  the spinner even when the storage is broken.
- Evidence: `src/middleware/persist.ts:85-92`, `src/middleware/persist.ts:189-194`,
  `src/middleware/persist.ts:352-366`, `tests/persistSync.test.tsx:521`

### The devtools middleware names your actions for you

- Textbook version: every action needs a manual string name, and a typo silently
  produces an unreadable history.
- What they do: when you call `setState` without a name, the middleware reads the
  JavaScript stack trace, finds the frame just after `api.setState`, and uses that
  function's name as the action name. It understands the stack format of V8, Gecko and
  JavaScriptCore.
- Why: the name of the calling function is the most useful label for a history entry,
  and reading it costs one `new Error().stack` only when no name was given.
- Evidence: `src/middleware/devtools.ts:223-235`, `src/middleware/devtools.ts:271-277`,
  `src/middleware/devtools.ts:218-221`

### Time travel does not pollute the history

This is the second half of [[Time travel debugging]].
- Textbook version: restoring an old state is just another write, so the history fills
  up with "restore" entries.
- What they do: writes that come from the extension are applied with recording turned
  off, so jumping back and forth does not add new actions to the list.
- Why: the record of what the app did must stay the record of what the app did; the
  developer travelling through time is not an app action.
- Evidence: `src/middleware/devtools.ts:313-318`, `src/middleware/devtools.ts:521-534`

### Development tooling is off unless the build asks for it

- Textbook version: the developer tools are always on, and a bug report shows a
  developer-only behaviour.
- What they do: the extension is only picked up when the build mode is not
  `production`, and the store is returned completely untouched when there is no
  extension.
- Why: the check is right in the source, in the condition that reads the build mode.
- Evidence: `src/middleware/devtools.ts:250-256`, `src/middleware/devtools.ts:258-260`

## Tests and what they protect

The persist tests are split by the kind of storage, because that is the axis on which
the behaviour differs.

- The synchronous suite protects the contract of the basic flow: rehydrating reads the
  saved state (`tests/persistSync.test.tsx:41`), a failing `getItem` reaches
  `onRehydrateStorage` as an error instead of an exception
  (`tests/persistSync.test.tsx:77`), a write reaches the storage
  (`tests/persistSync.test.tsx:98`), a version mismatch runs the migration
  (`tests/persistSync.test.tsx:136`), a missing migration function is handled
  (`tests/persistSync.test.tsx:173`), the merge can be replaced
  (`tests/persistSync.test.tsx:295`), the saved value can be filtered
  (`tests/persistSync.test.tsx:359`), and the `api.persist` handle can change options,
  clear the storage, rehydrate by hand and report whether hydration happened
  (`tests/persistSync.test.tsx:441`, `tests/persistSync.test.tsx:478`,
  `tests/persistSync.test.tsx:498`, `tests/persistSync.test.tsx:521`).
- The promise-like suite protects the unusual middle ground: a storage that returns a
  thenable which is not a promise (`tests/persistPromiseLike.test.ts:47`,
  `tests/persistPromiseLike.test.ts:61`), a migration that is asynchronous and must
  finish before the migrated value is written back
  (`tests/persistPromiseLike.test.ts:75`), a rejected migration that must not write
  anything (`tests/persistPromiseLike.test.ts:97`), and a migration whose write must
  finish before hydration is reported as done
  (`tests/persistPromiseLike.test.ts:118`). One case runs the storage in a separate
  JavaScript realm with `runInNewContext`, so a promise from another realm still works
  (`tests/persistPromiseLike.test.ts:175`).
- The asynchronous suite adds the timing cases: three concurrent rehydrations where only
  the last one wins and only one completion signal is sent
  (`tests/persistAsync.test.tsx:935`), user changes made while the hydration is in
  flight are not overwritten (`tests/persistAsync.test.tsx:981`), an async migration is
  aborted when a newer hydration starts (`tests/persistAsync.test.tsx:1023`), and the
  clearing of the storage revokes the running hydration even when the removal itself
  throws (`tests/persistAsync.test.tsx:1137`).
- The fakes are small and local. The synchronous suite builds a fake storage with three
  `vi.fn()` spies (`tests/persistSync.test.tsx:8-33`), the asynchronous suite adds a
  `sleep` helper so reads can be made slow on purpose
  (`tests/test-utils.ts:35`), and the promise-like suite uses a `deferred` promise to
  control exactly when a read resolves (`tests/persistPromiseLike.test.ts:25`).
- Custom serialisation is tested through a `replacer` and `reviver` pair that turns a
  `Map` into plain JSON and back (`tests/test-utils.ts:6`,
  `tests/test-utils.ts:20`, `tests/persistSync.test.tsx:659`).

## Error handling, performance, and security

- A storage that cannot be reached does not stop the store. `createJSONStorage` swallows
  the getter error and returns nothing, and the middleware then warns on every write
  (`src/middleware/persist.ts:36-41`, `src/middleware/persist.ts:197-208`).
- A failing read is delivered to `onRehydrateStorage` as the error argument rather than
  thrown, because the promise chain ends with a rejection handler that hands the error
  to the callback (`src/middleware/persist.ts:317-326`). A failing migration reaches the
  same place (`src/middleware/persist.ts:166-173` turns a thrown error into a rejected
  thenable).
- A saved value that cannot be parsed is reported with examples of the expected format,
  not swallowed (`src/middleware/devtools.ts:421-441`). The same happens for a state
  payload that is not valid JSON (`src/middleware/devtools.ts:564-579`) and for the
  arguments typed into the action dropdown (`src/middleware/devtools.ts:722-739`).
- The action dropdown and the redux middleware cannot be used together, and the
  middleware says so instead of failing quietly (`src/middleware/devtools.ts:394-401`).
  The action type `__setState` is reserved for the extension and warns when a user
  action tries to use it (`src/middleware/devtools.ts:360-377`).
- Performance: every `set` writes to storage, so `partialize` is the way to keep the
  write small (`src/middleware/persist.ts:210-216`). The state walk that collects
  action creators remembers which objects it has already visited, so a circular
  structure does not loop forever (`src/middleware/devtools.ts:600-622`).
- Security: nothing here is secret-aware. The persisted value is plain JSON in
  `localStorage`, so anything sensitive has to be left out of the store or moved into a
  server-backed storage by the application. The one guard the library does provide is
  that the devtools bridge is only read in the browser and is skipped in production
  builds (`src/middleware/devtools.ts:250-256`).

## Technologies and services seen

- Redux DevTools browser extension — the extension object on `window` is the transport
  for the action history and the time-travel commands
  (`src/middleware/devtools.ts:153-155`, `src/middleware/devtools.ts:251-253`).
- `@redux-devtools/extension` — imported with `import type`, so it adds nothing at
  runtime; the extension's shape is read from the `Window` type instead
  (`src/middleware/devtools.ts:1`, `src/middleware/devtools.ts:8-12`).
- Web Storage API (`window.localStorage`) — the default place where the state is saved
  (`src/middleware/persist.ts:179`).
- JSON — the wire format for the saved value, with optional `reviver` and `replacer`
  hooks (`src/middleware/persist.ts:26-29`, `src/middleware/persist.ts:44-57`).
- Vitest — the test runner behind all three persist suites
  (`tests/persistSync.test.tsx:3`, `tests/persistPromiseLike.test.ts:2`,
  `tests/persistAsync.test.tsx:4`).
- React Testing Library (`act`, `render`, `screen`) — used by the asynchronous suite to
  drive the store from a React component (`tests/persistAsync.test.tsx:3`).
- React `StrictMode` — the asynchronous suite renders the store inside `StrictMode`, so
  the double render of development mode is exercised during hydration
  (`tests/persistAsync.test.tsx:3`, `tests/persistAsync.test.tsx:93`).
- Node `vm` (`runInNewContext`) — used by the promise-like suite to produce a promise
  from another JavaScript realm (`tests/persistPromiseLike.test.ts:1`).

## Worth exploring interactively

- The hydration life cycle, from `create` to `hasHydrated() === true` — the store is
  created, the middleware reads the saved value, the version is checked, the state is
  merged in, and the finish listeners run. The learner would see the store go from
  "empty" to "restored" while the listeners fire in order. Steps:
  `src/middleware/persist.ts:178` (defaults are set), `src/middleware/persist.ts:369`
  (hydration is kicked off unless it was skipped), `src/middleware/persist.ts:259` (the
  read), `src/middleware/persist.ts:262` (the version check), `src/middleware/persist.ts:291`
  (the merge), `src/middleware/persist.ts:314` (the finish listeners). Fits
  `FlowAnimation`, because the learner sees a value travel through the chain.
- The version-and-migration decision — a stored value arrives, its version is compared
  with the one in the options, and the outcome is one of three: use it as it is, run the
  migration, or drop it. Fits `StateMachine`, because the three branches and their
  outcomes are what the learner needs to see. Steps:
  `src/middleware/persist.ts:260` (the stored value arrives), `src/middleware/persist.ts:263`
  (the versions are compared), `src/middleware/persist.ts:266` (the migration runs),
  `src/middleware/persist.ts:276` (the stored data is dropped when there is no
  migration function), `src/middleware/persist.ts:297` (the migrated value is written
  back).

## Open questions

- The devtools behaviour in this note is read from `src/middleware/devtools.ts` only.
  The 3,520-line `tests/devtools.test.tsx` was out of scope for this slice, so what the
  team thinks is worth protecting there is still unknown.
- How the two middlewares behave when they are stacked on the same store (devtools
  outside persist, or the other way round) is not settled by anything read here.
- The `src/middleware.ts` entry point that re-exports both middlewares was not part of
  this slice.

## My insights
