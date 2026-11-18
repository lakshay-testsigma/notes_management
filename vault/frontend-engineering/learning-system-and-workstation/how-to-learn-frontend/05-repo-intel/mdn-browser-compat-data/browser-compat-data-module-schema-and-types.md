---
title: "mdn/browser-compat-data — module schema-and-types"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-17
sources: [mdn-browser-compat-data-repo]
---

# mdn/browser-compat-data — module: schema-and-types

## Responsibility

This slice defines what one "supported since version N" claim looks like. The rules live in JSON Schema files. A script turns those schemas into TypeScript types, so the rules are written once. One real feature file (`api/AbortController.json`) and one browser file (`browsers/chrome.json`) show the data in use. The code is read at commit 8f942b4 (CC0-1.0 license), so short snippets are allowed.

## Key files

| File | Role |
|------|------|
| `schemas/compat-data.schema.json` | Shape of a feature file: support, status, links |
| `schemas/browsers.schema.json` | Shape of a browser file: releases, engine, channel |
| `schemas/compat-data-schema.md` | Human guide to the same rules, with examples |
| `scripts/generate-types.js` | Builds `types/*.d.ts` from the schemas |
| `types/index.d.ts` | Hand-written entry that joins public and internal types |
| `api/AbortController.json` | A real feature entry |
| `browsers/chrome.json` | A real browser entry with release list |

## How it works

In plain words: every feature is a tree of names. A node can hold a `__compat` block. That block lists, per browser, the version where support began, plus a status block. The schema rejects anything outside that shape.

1. A feature file has exactly one top-level key, such as `api` (`schemas/compat-data.schema.json:300-301 @ 8f942b4`). Names below it may only use letters, digits and `_-$@` (`schemas/compat-data.schema.json:252-259 @ 8f942b4`).
2. A `__compat` block must have `support` (`schemas/compat-data.schema.json:236 @ 8f942b4`). Inside a feature node it must also have `status` (`schemas/compat-data.schema.json:246 @ 8f942b4`).
3. `support` allows only 17 known browser ids, such as `chrome`, `safari_ios`, `nodejs`, `deno` (`schemas/compat-data.schema.json:153-173 @ 8f942b4`). Each value is a statement, a list of statements, or the string `"mirror"` (`schemas/compat-data.schema.json:117-129 @ 8f942b4`).
4. A simple statement requires `version_added` (`schemas/compat-data.schema.json:84 @ 8f942b4`). It is a version string or `false` (`schemas/compat-data.schema.json:8-20 @ 8f942b4`). The pattern also allows `≤N` (ranged) and `preview` (`schemas/compat-data.schema.json:13 @ 8f942b4`).
5. The status block needs `experimental`, `standard_track` and `deprecated` (`schemas/compat-data.schema.json:131-148 @ 8f942b4`).
6. In the real file, Chrome added `AbortController` in version 66 (`api/AbortController.json:14-16 @ 8f942b4`), Firefox in 57 (`api/AbortController.json:24-26 @ 8f942b4`), and a tag links it to the `web-features` group `aborting` (`api/AbortController.json:7-9 @ 8f942b4`).
7. `npm run gentypes` runs `compileInternalTypes` and `compilePublicTypes`, then type-checks the result (`scripts/generate-types.js:159-167 @ 8f942b4`).

## Beyond the textbook

### "mirror" instead of copying numbers

- Textbook version: write a version number for every browser.
- What they do: a derived browser can say `"mirror"`. The build copies the number from its upstream browser. `chrome_android`, `opera_android`, `safari_ios` and others use it in the sample file (`api/AbortController.json:17 @ 8f942b4`, `api/AbortController.json:45-48 @ 8f942b4`). The upstream is declared in each browser file, such as `"upstream": "chrome"` in `browsers/edge.json:6 @ 8f942b4`.
- Why: the guide says a derivative browser often matches upstream, and a slower release schedule is fixed "automatically" when a matching release appears (`schemas/compat-data-schema.md:252-265 @ 8f942b4`).
- Evidence: `schemas/compat-data.schema.json:127 @ 8f942b4`

### Version numbers that admit uncertainty

- Textbook version: a version is a plain number.
- What they do: `≤79` means "confirmed in 79, maybe earlier". `preview` means "only in the latest beta". `false` means not supported (`schemas/compat-data-schema.md:271-306 @ 8f942b4`).
- Why: the guide says it is "sometimes impractical" to find the earliest version of an old browser (`schemas/compat-data-schema.md:324 @ 8f942b4`). The data stays honest about what is known.
- Evidence: `schemas/compat-data.schema.json:13 @ 8f942b4`

### A support history is a list, not one number

- Textbook version: one "added in" field.
- What they do: a browser can hold an array of statements. Safari lists `12.1` as supported, then an older row `11.1` to `12.1` marked `partial_implementation` with a note that `fetch` was not really aborted (`api/AbortController.json:34-44 @ 8f942b4`).
- Why: the schema says partial support is for behaviour that is inconsistent or hurts developers, and it forces a `notes` field when set (`schemas/compat-data.schema.json:63-66 @ 8f942b4`, `schemas/compat-data.schema.json:85-91 @ 8f942b4`). So a "yes" is never silently half true.
- Evidence: `schemas/compat-data.schema.json:117-126 @ 8f942b4`

### Error messages written into the schema

- Textbook version: a schema fails with a generic message.
- What they do: `errorMessage` keys give contributors a fix hint. A bad `impl_url` tells them to shorten the host and to run `npm run fix` (`schemas/compat-data.schema.json:59-61 @ 8f942b4`). Allowed `impl_url` hosts are a fixed list, such as `crbug.com` and `bugzil.la` (`schemas/compat-data.schema.json:189 @ 8f942b4`).
- Why: thousands of drive-by contributors edit the data, so the schema teaches them.
- Evidence: `schemas/compat-data.schema.json:257-259 @ 8f942b4`

### Types generated from the schema, with custom hints

- Textbook version: write TypeScript types by hand and keep the JSON rules in sync yourself.
- What they do: the schema is the single source. A `tsType` key overrides the generated type, for example `"string | false"` for `version_added` (`schemas/compat-data.schema.json:19 @ 8f942b4`). The script inlines `examples` into descriptions because the generator ignores them (`scripts/generate-types.js:41-70 @ 8f942b4`). It stamps a "DO NOT MODIFY BY HAND" banner (`scripts/generate-types.js:19-21 @ 8f942b4`) and type-checks the output (`scripts/generate-types.js:114-121 @ 8f942b4`).
- Why: one source of truth cannot drift.
- Evidence: `scripts/generate-types.js:139-145 @ 8f942b4`

### Two schemas: internal and public

- Textbook version: one data format.
- What they do: the repo keeps an internal form (with `mirror`, and `experimental` still required) and a public form made at build time. Types are made for both (`scripts/generate-types.js:129-145 @ 8f942b4`). The internal schema notes `experimental` is "deprecated in the public facing schema" but still set internally (`schemas/compat-data.schema.json:136 @ 8f942b4`). `types/index.d.ts` joins both sets (`types/index.d.ts:4-17 @ 8f942b4`).
- Why: contributors want short input, consumers want resolved data. The build step that converts one to the other is in another module.
- Evidence: `types/index.d.ts:28-42 @ 8f942b4`

## Tests and what they protect

No tests are in this slice. The schema itself is the guard: `additionalProperties: false` on nearly every object rejects typos (`schemas/compat-data.schema.json:93 @ 8f942b4`, `schemas/browsers.schema.json:128 @ 8f942b4`). `generate-types.js` is excluded from coverage by `c8 ignore` (`scripts/generate-types.js:4 @ 8f942b4`). The data linter slice shows how schemas are run.

## Error handling, performance, and security

- A browser file may describe only one browser, with messages for zero or many (`schemas/browsers.schema.json:66-71 @ 8f942b4`).
- A release with an `engine` must also give `engine_version` (`schemas/browsers.schema.json:155-157 @ 8f942b4`).
- URLs are restricted by pattern: `mdn_url` must start with `https://developer.mozilla.org/docs/` (`schemas/compat-data.schema.json:202-203 @ 8f942b4`), and spec URLs need a `#fragment` (`schemas/compat-data.schema.json:183 @ 8f942b4`). This blocks links to odd hosts.
- `cleanupObsolete` ignores a missing old file on purpose (`scripts/generate-types.js:150-157 @ 8f942b4`).

## Technologies and services seen

- JSON Schema draft-07 — rules for data files (`schemas/compat-data.schema.json:2 @ 8f942b4`)
- json-schema-to-typescript — makes `.d.ts` from schemas (`scripts/generate-types.js:11 @ 8f942b4`)
- TypeScript compiler `tsc` — type-checks generated types (`scripts/generate-types.js:117 @ 8f942b4`)
- es-main — runs the script only when called directly (`scripts/generate-types.js:10 @ 8f942b4`, `scripts/generate-types.js:159 @ 8f942b4`)
- c8 — coverage tool, skipped here (`scripts/generate-types.js:4 @ 8f942b4`)
- web-features tag — links a feature to the WebDX group (`api/AbortController.json:7-9 @ 8f942b4`)
- Browser data sources: Chromium, Mozilla and WebKit bug trackers, via `impl_url` (`schemas/compat-data.schema.json:189 @ 8f942b4`)

## Worth exploring interactively

- Resolving a support cell — steps: read `chrome_android: "mirror"` (`api/AbortController.json:17 @ 8f942b4`); find `upstream` in the browser file (`browsers/chrome_android.json:6 @ 8f942b4`); take Chrome's `66` (`api/AbortController.json:14-16 @ 8f942b4`); the guide's example shows the result (`schemas/compat-data-schema.md:261 @ 8f942b4`) — fits FlowAnimation because the learner sees "mirror" replaced by a version along the upstream chain.
- Schema check of one feature node — steps: one top-level key (`schemas/compat-data.schema.json:300-301 @ 8f942b4`); `__compat` has `support` and `status` (`schemas/compat-data.schema.json:236 @ 8f942b4`, `schemas/compat-data.schema.json:246 @ 8f942b4`); browser id is in the allowed list (`schemas/compat-data.schema.json:153-173 @ 8f942b4`); `version_added` matches pattern or `false` (`schemas/compat-data.schema.json:8-20 @ 8f942b4`) — fits SystemDiagram because the learner sees which rule guards which part of the JSON.

## Open questions

- Where `mirror` is resolved, and how the public schema is produced, are in the build-pipeline slice.
- `types/public.d.ts` and `internal.d.ts` are generated and were not in this slice.
- How the linter runs these schemas is in the data-linter slice.

## My insights
