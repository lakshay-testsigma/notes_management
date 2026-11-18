---
title: "mdn/browser-compat-data — pattern: Guarded release"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-17
sources: [mdn-browser-compat-data-repo]
---

# Pattern: Guarded release

## The problem

Shipping a package by hand from a laptop needs a long-lived token, skips checks, and gives reviewers no view of what users will actually receive.

## What they do

CI splits checks into three jobs: style and types, data rules, and unit tests. A fourth job builds both base and pull request and diffs the two outputs, so a reviewer sees how the published file changes. Releases are a draft pull request made by a script from PR labels; a human merges it. Publishing re-runs tests, builds, and publishes only `build/` with provenance and keyless login. Actions are pinned to commit SHAs with read-only permissions. This is [[Software supply chain]] care.

## Evidence

- `.github/workflows/test.yml:34-38 @ 8f942b4`, `.github/workflows/test.yml:60 @ 8f942b4`, `.github/workflows/test.yml:102 @ 8f942b4` — three gates
- `.github/workflows/test.yml:127-165 @ 8f942b4` — diff of the built output
- `scripts/release/index.js:113-121 @ 8f942b4` — bump chosen from labels
- `.github/workflows/release.yml:55-63 @ 8f942b4` — test, build, `npm publish build/ --provenance`
- `.github/workflows/release.yml:18 @ 8f942b4` — `id-token: write` for OIDC
- `.github/dependabot.yml:9-14 @ 8f942b4` — update cooldown

## When to use it, and when not to

Use SHA-pinned actions, read-only permissions and tests-before-publish on any package you ship. A release-label script and bot pull requests suit a repository with many contributors; for a one-person project a tag and a single workflow are enough.

## Related

- [[Software supply chain]] — the idea behind it
- [[GitHub Actions]] — the CI service
- [[npm]] — the registry
- [[browser-compat-data-findings|Findings]]
- [[browser-compat-data-module-build-and-infra|build-and-infra]]

## My insights
