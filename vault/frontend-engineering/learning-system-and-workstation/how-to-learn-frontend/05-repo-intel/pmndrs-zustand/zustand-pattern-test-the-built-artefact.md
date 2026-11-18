---
title: "pmndrs/zustand — pattern: Test the built artefact"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [pmndrs-zustand-repo]
---

# Pattern: Test the built artefact

## The problem

The test suite runs against the source files, so it proves the source works. The user
installs the built bundle, and the bundle is produced by a different tool chain. A
missing export, a broken alias or a wrong file extension can pass every source-level
test and still break the install.

## What they do

The same spec files run a second and third time against the built files. The CI
rewrites the test config so the alias map points at the CommonJS output and then at the
ESM output. The environment is a dimension too: test names tagged for one build mode
are switched on and off.

## Evidence

- `.github/workflows/test-multiple-builds.yml:41-56 @ 9fed2eb` — the config is rewritten
  with `sed` and the same specs run against `dist` and `dist/esm`.
- `.github/workflows/test-multiple-builds.yml:31-40 @ 9fed2eb` — the development and
  production test names are switched on and off.
- `.github/workflows/test.yml:28 @ 9fed2eb` — the plain source run, next to the others.
- `vitest.config.mts:5-10 @ 9fed2eb` — the alias map that the rewrite targets.

## When to use it, and when not to

Use it when you publish a package that other people install, because the install is
where the failure appears. Do not use it for an application that runs from source in
development and in a build you already test end to end.

## Related

- [[Artefact testing]] — the idea behind the pattern.
- [[zustand-findings|Findings]]
- [[zustand-module-build-and-infra|build-and-infra]]

## My insights
