---
title: "conventional-changelog/commitlint — takeaways"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, workstation, repo-intel, conventional-commits]
created: 2026-11-18
sources: [conventional-changelog-commitlint-repo]
---

# conventional-changelog/commitlint — takeaways for the capstone

The capstone is the "devkit workstation CLI": a Node.js CLI that checks the workstation (Node version against `.nvmrc` and `engines`, git identity, tools on PATH), lints commit messages, and writes release notes from conventional commits. These are the things worth borrowing.

1. **Make each check a small function with one shape.** Give every workstation check and every commit rule the same signature and a `[passed, message]` result, then list them in one table. From [[commitlint-pattern-rules-as-data|the pattern]] and [[commitlint-findings|finding 1]].
2. **Use levels, and let warnings pass.** Report a missing optional tool as a warning and a wrong Node major as an error; only errors set a failing exit code. From [[commitlint-findings|finding 3]].
3. **Define exit codes once, in one list.** Use 0 for ok, 1 for a failed check, 9 for bad arguments, so your hook and CI can tell them apart. From [[commitlint-findings|finding 3]].
4. **Fail loud on an empty or broken check list.** If the config names a check that does not exist, or lists none, stop with a clear message instead of a green result. From [[commitlint-findings|finding 2]].
5. **Read the commit message like Git does.** Drop comment lines and the scissors section, skip merge and revert commits, and only then parse `type(scope)!: subject`. From [[commitlint-findings|finding 5]].
6. **Support three message sources.** `--edit <file>` for the hook, `--last`, and `--from X --to Y` for CI; stop on a shallow clone before walking a range. The same sources feed the release-notes writer. From [[commitlint-pattern-one-checker-two-gates]] and [[commitlint-findings|finding 4]].
7. **Check Node and the package manager from the same files your project pins.** Compare `node --version` with `engines.node` and `.nvmrc`, and compare the package manager with `packageManager`. Report that Corepack may be missing. From [[commitlint-pattern-layered-version-pinning]] and [[commitlint-findings|findings 6 and 7]].
8. **Pick one module style and say why.** commitlint ships a config loader that has to cope with ESM, CJS and TypeScript; your CLI can choose ESM only and document it, which avoids that work. From [[commitlint-findings|finding 8]].

## What not to copy

- The five-way config search, global folder lookup and legacy-name fallback: they serve a large plugin ecosystem. A learning CLI needs one config file.
- The full supply-chain setup, Docker image tests and eight-job CI matrix: keep a single CI job with a frozen install.
- Hand-written Corepack replacement: only needed because of their Node and pnpm versions; start with the `packageManager` field and check it.

## My insights
