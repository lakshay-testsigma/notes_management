# 0001. Describe rules and checks as small functions in a table

## Status

Accepted, 2026-11-18.

## Context

The tool has two lists of checks that will grow: commit rules and workstation checks. Teams want to turn single rules on or off, and to make some of them warnings. A new developer must be able to find any check quickly.

## Decision

Each rule and each check is a small function with one shape. Commit rules are `(commit, when, value) -> [passed, message]`. Workstation checks are `(context) -> CheckResult`. They are listed in one table (`RULES`, `WORKSTATION_CHECKS`). The commit rule config is plain data: `[level, when, value]`. This follows the commitlint design described in `commitlint-takeaways.md`.

## Alternatives considered

- **One class per rule.** More ceremony for a function of three lines, and a bigger class tree for a beginner to learn.
- **One long function with an `if` chain.** It stops at the first problem, and a team cannot tune single rules.

## Consequences

- Each rule is tested alone with one commit.
- Config can name rules and levels, so `DEVKIT_WARN_RULES` works without code changes.
- The table must be validated: `CommitRules` throws when the config names a rule that does not exist.
