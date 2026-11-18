---
title: "mdn/browser-compat-data — pattern: Schema first"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-17
sources: [mdn-browser-compat-data-repo]
---

# Pattern: Schema first

## The problem

Thousands of people edit data by hand. One typo in a version number publishes a false claim, and a generic "invalid" message teaches nothing.

## What they do

The rules live in a JSON Schema. It rejects unknown keys, limits names, URLs and browser ids, and carries `errorMessage` hints that tell the contributor what to do. One Ajv setup is shared. TypeScript types are generated from the same schema, so the types cannot drift. On top of the schema, the linter adds checks a schema cannot express, such as "removed must be after added" or "this release must exist". See [[Schema validation]] and [[JSON Schema]].

## Evidence

- `schemas/compat-data.schema.json:93 @ 8f942b4` — `additionalProperties: false` rejects typos
- `schemas/compat-data.schema.json:59-61 @ 8f942b4` — error text that names the fix
- `scripts/lib/ajv.js:10-20 @ 8f942b4` — one shared validator that collects all errors
- `scripts/generate-types.js:139-145 @ 8f942b4` — types made from the schema
- `lint/linter/test-versions.js:35-46 @ 8f942b4` — release must exist for that browser
- `scripts/build/index.js:284-290 @ 8f942b4` — the output is validated again against the public schema

## When to use it, and when not to

Use it whenever data enters from outside your code: user input, files, API replies. Validate at the boundary once, then trust the shape. For a small learning project, a short schema for one note is enough; generated types are optional.

## Related

- [[Schema validation]] — the idea behind it
- [[Ajv]] — the validator used here
- [[browser-compat-data-findings|Findings]]
- [[browser-compat-data-module-schema-and-types|schema-and-types]]
- [[browser-compat-data-module-data-linter|data-linter]]

## My insights
