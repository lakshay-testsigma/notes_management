---
title: "conventional-changelog/commitlint — pattern: Rules as data"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, workstation, repo-intel, conventional-commits]
created: 2026-11-18
sources: [conventional-changelog-commitlint-repo]
---

# Pattern: Rules as data

## The problem

A linter written as one block of `if` statements cannot be tuned. Every team must fork it to turn off one check, and one test must cover everything. A typo in a setting can also silently turn a check off.

## What they do

Each rule is a function with the same three inputs, the parsed commit, a word `always` or `never`, and a value, and the same result, `[passed, message]` (`@commitlint/types/src/rules.ts:18-28 @ d2be18a`). A registry object maps names to functions (`@commitlint/rules/src/index.ts:41-81 @ d2be18a`). Config is a table of `[level, when, value]` (`@commitlint/config-conventional/src/index.ts:5-44 @ d2be18a`). The engine looks the name up, throws if it is unknown, runs the rule and applies the level (`@commitlint/lint/src/lint.ts:65-78 @ d2be18a`, `@commitlint/lint/src/lint.ts:143-178 @ d2be18a`). Plugins add names to the registry (`@commitlint/lint/src/lint.ts:53-63 @ d2be18a`).

## Evidence

- `@commitlint/rules/src/type-enum.ts:5-18 @ d2be18a` — one rule serves `always` and `never` through a flag.
- `@commitlint/rules/src/header-max-length.test.ts:5-8 @ d2be18a` — a rule is tested alone, at its boundary.
- `@commitlint/lint/src/lint.test.ts:178 @ d2be18a` — a test checks that an invalid rule name throws.

## When to use it, and when not to

Use it when users must pick which checks run, or when checks come from a shared package. Skip it for two fixed checks: a plain function is easier to read.

## Related

- [[Rules as data]] — the idea behind it
- [[Conventional Commits]] — the format these rules check
- [[commitlint-findings|Findings]]

## My insights
