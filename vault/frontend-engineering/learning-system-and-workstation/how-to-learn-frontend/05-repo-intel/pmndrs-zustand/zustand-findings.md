---
title: "pmndrs/zustand — findings"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [pmndrs-zustand-repo]
---

# pmndrs/zustand — findings

What this production codebase does beyond the textbook version of a React store, ranked
by how much you gain from knowing it. Commit analysed: `9fed2eb` (see
[[zustand-overview|the overview]]).

## 1. A write is a patch, not a replacement

- Textbook version: `setState` replaces the state object.
- What they do: an object patch is merged over the current state with `Object.assign`. A
  real replacement happens only when you pass `replace` as true, or when the new value
  is not an object.
- Why: a component usually owns one slice. Merging leaves the rest of the store alive,
  so the untouched branches keep their identity and nothing else has to re-render.
- Evidence: `src/vanilla.ts:75-78 @ 9fed2eb`, `tests/vanilla/basic.test.ts:109-120 @ 9fed2eb`.
- Borrow it when: your state has independent parts and one part changes at a time.
  That is the normal case for a form or a log.
- More: [[zustand-module-core-store|core-store]], [[zustand-pattern-write-as-patch|write as a patch]].

## 2. Saved data carries a version and a migration

- Textbook version: write the whole state to one key and read it back unchanged.
- What they do: the saved value is a small object with the state and a `version` number.
  A version that does not match the one in the options runs a `migrate` function. Without
  a `migrate` function, the middleware logs an error and throws the saved data away.
- Why: the option's own comment says the version is for a breaking change to the
  store. The stored shape really does change when the state shape changes.
- Evidence: `src/middleware/persist.ts:262-284 @ 9fed2eb`,
  `tests/persistSync.test.tsx:136 @ 9fed2eb`, `tests/persistSync.test.tsx:173 @ 9fed2eb`.
- Borrow it when: you save anything a user can still have in the browser when you change
  the shape of what you save.
- More: [[zustand-module-persist-and-devtools|persist-and-devtools]], [[zustand-pattern-versioned-persistence|versioned persistence]].

## 3. Hydration is a versioned operation that can be cancelled

- Textbook version: read the saved state once and assign it.
- What they do: every hydration run gets a number. When a newer hydration starts, the
  older one sees that its number is stale and stops without touching the store. Clearing
  the storage bumps the number too, so a slow read in flight cannot bring the old value
  back.
- Why: with an asynchronous storage the read can finish after the user has already
  changed the state or signed out. The tests name the rule directly: only the last one
  wins.
- Evidence: `src/middleware/persist.ts:190-192 @ 9fed2eb`,
  `src/middleware/persist.ts:286-289 @ 9fed2eb`, `tests/persistAsync.test.tsx:935 @ 9fed2eb`.
- Borrow it when: the saved data arrives late, from a network call or a file. The user
  can change the state while it is on its way.
- More: [[zustand-module-persist-and-devtools|persist-and-devtools]].

## 4. The store keeps its first state for the server

- Textbook version: one `getState` to read the state.
- What they do: `getInitialState` returns the value the initializer produced, and the
  React binding hands it to `useSyncExternalStore` as the server snapshot.
- Why: on the server there is no client-side change yet, so the first client render has
  to reproduce the server markup. The test renders on the server, hydrates on the client,
  and checks that no hydration error is logged.
- Evidence: `src/vanilla.ts:85-86 @ 9fed2eb`, `src/react.ts:33 @ 9fed2eb`,
  `tests/ssr.test.tsx:35-64 @ 9fed2eb`.
- Borrow it when: your app renders on a server, such as a Next.js page. The state must
  look the same on both sides.
- More: [[zustand-module-core-store|core-store]].

## 5. The middleware changes the store object, not only the functions inside it

- Textbook version: a middleware wraps `set` and `get` in new functions and passes the
  wrappers down to the creator.
- What they do: each middleware assigns a new method onto the live store API object. A
  call to `store.setState` from outside the creator gets the same behaviour.
- Why: the immer test calls `store.setState` on a vanilla store built with the
  middleware and still gets a draft. That only works because the API method itself was
  replaced.
- Evidence: `src/middleware/immer.ts:76-84 @ 9fed2eb`,
  `src/middleware/subscribeWithSelector.ts:50-51 @ 9fed2eb`,
  `tests/immer.test.tsx:64-73 @ 9fed2eb`.
- Borrow it when: you add a feature such as logging, undo or persistence. You want one
  behaviour for every writer. The writers inside the initializer are not the only ones.
- More: [[zustand-module-middleware|middleware]], [[zustand-pattern-middleware-as-decorator|middleware as a decorator]].

## 6. The type system keeps a registry that other packages can add to

- Textbook version: a plugin API uses a plain function type, and the library loses track
  of what a plugin adds.
- What they do: each middleware declares a `StoreMutators` entry through declaration
  merging and passes the names as type arguments. The names say which mutators are
  inside and which are outside.
- Why: the type test file writes its own middleware. It can widen the type of
  `getState` and leave the type of `setState` alone.
- Evidence: `src/middleware/immer.ts:14-19 @ 9fed2eb`, `src/middleware/redux.ts:28-32 @ 9fed2eb`,
  `tests/middlewareTypes.test.tsx:19-38 @ 9fed2eb`.
- Borrow it when: your own code has extensions that add methods, and you want the
  compiler to know which extension is in use.
- More: [[zustand-module-middleware|middleware]], [[zustand-pattern-type-level-contract|type-level contract tests]].

## 7. One code path for a synchronous store and a network store

- Textbook version: write two implementations, one for `localStorage` and one for
  anything that returns a promise.
- What they do: every read goes through a helper that turns any value into a thenable. A
  plain value becomes a fake thenable that calls the callback at once. The promise chain
  in `hydrate` then works for both kinds of storage. A function that throws
  becomes a rejected thenable instead of an exception.
- Why: the tests cover a storage that returns a real `Promise`. They also cover a
  storage that returns a `PromiseLike` object, which is not a promise at all. Both must
  hydrate.
- Evidence: `src/middleware/persist.ts:148-174 @ 9fed2eb`,
  `tests/persistPromiseLike.test.ts:47 @ 9fed2eb`,
  `tests/persistPromiseLike.test.ts:61 @ 9fed2eb`.
- Borrow it when: one feature must work with a fast local value and a slow remote one.
  You do not want two code paths to keep in step.
- More: [[zustand-module-persist-and-devtools|persist-and-devtools]].

## 8. The devtools middleware names your actions for you

- Textbook version: every action needs a manual string name, and a typo silently produces
  an unreadable history.
- What they do: when you call `setState` without a name, the middleware reads the
  JavaScript stack trace. It finds the frame just after `api.setState` and uses that
  function's name as the action name. It understands the stack format of V8, Gecko and
  JavaScriptCore.
- Why: the name of the calling function is the most useful label for a history entry.
  Reading the stack costs one `new Error().stack`, and only when no name was given.
- Evidence: `src/middleware/devtools.ts:223-235 @ 9fed2eb`,
  `src/middleware/devtools.ts:271-277 @ 9fed2eb`,
  `src/middleware/devtools.ts:218-221 @ 9fed2eb`.
- Borrow it when: you keep a history of what happened, such as an activity log. You do
  not want to invent a name at every call site.
- More: [[zustand-module-persist-and-devtools|persist-and-devtools]].

## 9. A change of identity is a change, and `NaN` is not one

- Textbook version: compare the old and the new value with `===`.
- What they do: the store compares with `Object.is`, so writing `NaN` over a store that
  already holds `NaN` wakes nobody.
- Why: `Object.is` treats `NaN` as equal to itself, so a no-op write cannot wake every
  subscriber of the store.
- Evidence: `src/vanilla.ts:73 @ 9fed2eb`, `tests/basic.test.tsx:459-468 @ 9fed2eb`.
- Borrow it when: your state can hold a number that came from a calculation, because
  `NaN` is a normal result there.
- More: [[zustand-module-core-store|core-store]].

## 10. The same test suite runs against the built bundles

- Textbook version: test the TypeScript source.
- What they do: the CI rewrites the test config with `sed`. The alias then points at
  `dist/*.js` for the CommonJS run and at `dist/esm/*.mjs` for the ESM run, and the same
  spec files run in both.
- Why: the bundler can break a build that the source-level tests pass.
- Evidence: `.github/workflows/test-multiple-builds.yml:41-56 @ 9fed2eb`,
  `.github/workflows/test.yml:28 @ 9fed2eb`.
- Borrow it when: you ship a package, not only an application. The artefact that users
  install is the thing that has to work.
- More: [[zustand-module-build-and-infra|build-and-infra]], [[zustand-pattern-test-the-built-artefact|test the built artefact]].

## My insights
