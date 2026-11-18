---
title: "mdn/browser-compat-data — module consumer-api"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-17
sources: [mdn-browser-compat-data-repo]
---

# mdn/browser-compat-data — module: consumer-api

## Responsibility

This slice is the door into the data. In the source repo, `index.js` reads every JSON file and builds one big object. Small helpers then let code find a feature by dotted name, walk all features, and read one browser's support as an array. Mini project 1 (baseline-checker) and the capstone will use the published package, so this note records how a consumer imports and queries it.

## Key files

| File | Role |
|------|------|
| `index.js` | Loads all data folders into one default export `bcd` |
| `utils/query.js` | `query("css.properties.background")` returns a subtree |
| `utils/walk.js` | Generator that yields every feature that has a `__compat` block |
| `utils/walkingUtils.js` | Helpers that decide what is a feature, a browser, or skipped metadata |
| `utils/iter-support.js` | Gives one browser's support as an array, always |
| `scripts/traverse.js` | Command line tool that filters features by browser, version, status, tag |

## How it works

How a consumer imports it (the published package, not the source files):

1. The package name is `@mdn/browser-compat-data` and it is an ES module package (`package.json:2 @ 8f942b4`, `package.json:6 @ 8f942b4`).
2. The `exports` map sends both `import` and `require` of the package root to one built file, `./build/data.json` (`package.json:7-17 @ 8f942b4`). So `import bcd from '@mdn/browser-compat-data'` gives you the whole data object. It is plain JSON, with no functions on it.
3. A second entry, `./forLegacyNode`, points at `./build/legacynode.mjs` (`package.json:18-21 @ 8f942b4`). A third, `./types`, gives TypeScript types (`package.json:22-25 @ 8f942b4`).
4. Node 24 or newer is required to work in the repo itself (`package.json:29-31 @ 8f942b4`).
5. The helpers (`query`, `walk`, `iterSupport`) are in `utils/`. They are not in the `exports` map, so a package consumer does not get them. A consumer writes their own lookup (see "Worth exploring").

How the data is built inside the source repo (`index.js`):

1. `load` finds every `.json` file under each data folder with `fdir` (`index.js:28-35 @ 8f942b4`).
2. Each file is parsed and every feature gets a `source_file` field with its relative path (`index.js:41-50 @ 8f942b4`).
3. `extend` merges the file into one result object (`index.js:52 @ 8f942b4`). A broken JSON file is skipped, and tests flag it elsewhere (`index.js:54-56 @ 8f942b4`).
4. The folders are `api, css, html, http, javascript, manifests, mathml, mediatypes, svg, webassembly, webdriver, webextensions` and `browsers` (`scripts/lib/data-folders.js:6-24 @ 8f942b4`). The top-level keys of `bcd` are exactly these (`index.test.js:12-14 @ 8f942b4`).

How a query works (`utils/query.js`):

1. Split the dotted path on `.` (`utils/query.js:16 @ 8f942b4`).
2. Step into the object one name at a time (`utils/query.js:18-20 @ 8f942b4`).
3. If a name is missing, throw `ReferenceError` that names the failing part (`utils/query.js:21-25 @ 8f942b4`).

So a feature is at `bcd.css.properties.background`, and its support is at `.__compat.support.<browser>`. Each support value is one statement or an array of statements, and it can be the string `"mirror"` (`utils/iter-support.js:15-17 @ 8f942b4`, `scripts/traverse.js:93-102 @ 8f942b4`). In the source tree `"mirror"` means "copy from the upstream browser". Treat it as unresolved there. `iterSupport` treats unresolved `mirror` and a missing browser as `{ version_added: false }` (`utils/iter-support.js:7-9 @ 8f942b4`, `utils/iter-support.js:20 @ 8f942b4`).

How a walk works (`utils/walk.js`):

1. `walk` with no entry points starts at the root (`utils/walk.js:105-107 @ 8f942b4`). With entry points, it first calls `query` for each (`utils/walk.js:108-113 @ 8f942b4`).
2. `lowLevelWalk` is recursive. It yields the current node, then recurses into each child key (`utils/walk.js:67-91 @ 8f942b4`).
3. A node is a feature if it has `__compat` (`utils/walkingUtils.js:18 @ 8f942b4`). `walk` yields only nodes that carry a compat statement (`utils/walk.js:116-121 @ 8f942b4`).
4. A browser node has `name` and `releases` (`utils/walkingUtils.js:25 @ 8f942b4`). Its releases are yielded and it has no children (`utils/walk.js:75-78 @ 8f942b4`, `utils/walkingUtils.js:42-45 @ 8f942b4`).

## Beyond the textbook

### Data is a tree with one reserved key, not a table

- Textbook version: caniuse-style tables, one row per feature and one column per browser.
- What they do: a nested tree where a node is a feature if it holds `__compat`, and keys starting with `__` are not children.
- Why: a feature such as `api.Thing` can have sub-features (`api.Thing.child`) in the same tree. The query test checks that a feature can also hold children.
- Evidence: `utils/walkingUtils.js:18 @ 8f942b4`, `utils/walkingUtils.js:38-40 @ 8f942b4`, `utils/query.test.js:63-68 @ 8f942b4`

### Support is "one or many" and can be a string

- Textbook version: one version number per browser.
- What they do: the value is a single statement or an array. An array lists several (for example a prefixed name that came first, then the unprefixed one). `iterSupport` always returns an array, so consumers loop with no special cases.
- Why: browsers change over time, and they ship under prefixes or alternative names. The traverse tool prints the prefix and alternative name.
- Evidence: `utils/iter-support.js:17 @ 8f942b4`, `utils/iter-support.test.js:30-41 @ 8f942b4`, `scripts/traverse.js:124-129 @ 8f942b4`

### Missing data is treated as "not supported", on purpose

- Textbook version: `undefined` crashes or is ignored.
- What they do: a browser with no entry gives `[{ version_added: false }]`. `version_added` can also start with `≤`, meaning "at most that version, exact version unknown".
- Why: a consumer asking "is it supported?" always gets a usable answer. The `≤` rule is handled in the traverse tool.
- Evidence: `utils/iter-support.js:20 @ 8f942b4`, `utils/iter-support.test.js:12-17 @ 8f942b4`, `scripts/traverse.js:111-117 @ 8f942b4`

### Status flags are separate from support

- Textbook version: "supported" or "not supported" only.
- What they do: each feature has `status` with `deprecated`, `standard_track`, `experimental`. The traverse tool filters on all three.
- Why: a feature can work in every browser and still be deprecated. A baseline checker should read both.
- Evidence: `scripts/traverse.js:47-61 @ 8f942b4`

### Fail loudly on a bad path, quietly on a bad file

- Textbook version: one error style.
- What they do: `query` throws a named `ReferenceError` for a typo in a query. The loader skips bad JSON and relies on tests to catch it.
- Why: a bad query is a bug in the caller. A bad data file is caught in CI by the linter, so the build keeps going.
- Evidence: `utils/query.js:21-25 @ 8f942b4`, `index.js:54-56 @ 8f942b4`

## Tests and what they protect

- `index.test.js` checks that the top-level keys equal the data folder list, so a new folder cannot be added without being exported (`index.test.js:12-14 @ 8f942b4`).
- `query.test.js` uses a small made-up tree, not the real data. It checks throws for missing names, including a trailing dot, and returns for a namespace, a feature, and a feature with children (`utils/query.test.js:37-68 @ 8f942b4`).
- `iter-support.test.js` covers a missing browser, a single statement, and an array (`utils/iter-support.test.js:12-42 @ 8f942b4`).
- `walk.test.js` covers depth one, the whole tree, a browser and its releases, skipping `__meta`, and one or many entry points (`utils/walk.test.js:41-129 @ 8f942b4`).
- `walkingUtils.test.js` covers path joining that drops undefined parts, `isBrowser`, `isFeature`, and `descendantKeys` on invalid data (`utils/walkingUtils.test.js:15-46 @ 8f942b4`).
- `normalize-path.test.js` checks that Windows backslashes become `/` (`utils/normalize-path.test.js:18-24 @ 8f942b4`).
- Tests use Node's built-in `node:test` and `assert/strict`, with no extra test library (`index.test.js:4-5 @ 8f942b4`).

## Error handling, performance, and security

- Bad query path: `ReferenceError` (`utils/query.js:22-24 @ 8f942b4`).
- Bad JSON in a data file: skipped, excluded from coverage with `c8 ignore` (`index.js:53-58 @ 8f942b4`).
- Performance: the source index loads all files with top-level `await` at import time, so import is slow and eager (`index.js:66 @ 8f942b4`). The published package avoids this by shipping one prebuilt `data.json` (`package.json:9-16 @ 8f942b4`).
- Security: Windows paths are normalized so `source_file` values are the same on every OS (`utils/normalize-path.js:12-17 @ 8f942b4`). Not otherwise present in this slice.

## Technologies and services seen

- fdir — fast folder crawler used to find `.json` files (`index.js:10 @ 8f942b4`, `index.js:30-34 @ 8f942b4`)
- Node `node:test` and `node:assert/strict` — test runner and assertions (`index.test.js:4-5 @ 8f942b4`)
- yargs and es-main — command line parsing and "run only when called directly" for the traverse tool (`scripts/traverse.js:4-6 @ 8f942b4`)
- JSDoc type imports from `types/index.js` — type checking without TypeScript source (`index.js:4 @ 8f942b4`)

## Worth exploring interactively

- Consumer lookup of "is this feature supported?" — 1. import `bcd` from the package (`package.json:13-16 @ 8f942b4`); 2. split the dotted path and step down the tree (`utils/query.js:16-20 @ 8f942b4`); 3. throw if a step is missing (`utils/query.js:21-25 @ 8f942b4`); 4. read `__compat.support[browser]` (`utils/iter-support.js:15 @ 8f942b4`); 5. turn it into an array, or `version_added: false` if missing (`utils/iter-support.js:16-20 @ 8f942b4`) — fits FlowAnimation because the learner sees a path string become a subtree, then a support array.
- Tree walk — 1. start at the root (`utils/walk.js:105-107 @ 8f942b4`); 2. yield node, then recurse into keys (`utils/walk.js:83-91 @ 8f942b4`); 3. skip `__meta` and `__` keys (`utils/walkingUtils.js:38-47 @ 8f942b4`); 4. emit only nodes with `__compat` (`utils/walk.js:118-120 @ 8f942b4`) — fits AlgorithmStepper because the learner sees the tree visited in order, with features highlighted.

## Open questions

- `build/data.json` and `legacynode.mjs` are made by the build pipeline, so what is inside them (are `mirror` values resolved?) is for the build-pipeline note.
- Whether the published data keeps `source_file` was not checked in this slice.
- No helper for Baseline is in this slice. The `status` block here has no `baseline` field in the code I read.

## My insights
