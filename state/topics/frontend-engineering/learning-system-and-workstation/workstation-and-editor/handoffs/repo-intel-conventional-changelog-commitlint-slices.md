# Slice plan — conventional-changelog/commitlint

Repository: https://github.com/conventional-changelog/commitlint
Clone: .cache/repos/conventional-changelog__commitlint
Commit: d2be18a5198d3792fd6d1268e1fdca87f45e55ba (short: d2be18a)
License: MIT
Files tracked: 736

## Chosen slices

| Unit id | Module name | What it holds | Est. tokens | Why chosen | File list |
|---------|-------------|---------------|-------------|------------|-----------|
| conventional-changelog-commitlint-module-parser-and-lint | parser-and-lint | parse, message, to-lines, lint core (lint.ts + test), is-ignored, execute-rule, types, format | 10,500 | message parser and lint engine | .cache/tmp/workstation-and-editor/conventional-changelog-commitlint-module-parser-and-lint.files.txt |
| conventional-changelog-commitlint-module-rules | rules | all @commitlint/rules src, 5 sample tests, ensure helpers | 15,100 | rule implementations | .cache/tmp/workstation-and-editor/conventional-changelog-commitlint-module-rules.files.txt |
| conventional-changelog-commitlint-module-config-loading | config-loading | load, resolve-extends, config-validator, config-conventional | 9,500 | config resolution and shared config | .cache/tmp/workstation-and-editor/conventional-changelog-commitlint-module-config-loading.files.txt |
| conventional-changelog-commitlint-module-cli-and-hooks | cli-and-hooks | cli.ts, read.ts, cli-error, husky hooks, commitlint CI workflow | 5,500 | entry point, commit-msg hook and CI check | .cache/tmp/workstation-and-editor/conventional-changelog-commitlint-module-cli-and-hooks.files.txt |
| conventional-changelog-commitlint-module-build-and-infra | build-and-infra | package.json, pnpm, lerna, vitest config, Dockerfile.ci, workflows, CONTRIBUTING | 7,700 | technologies, CI, release | .cache/tmp/workstation-and-editor/conventional-changelog-commitlint-module-build-and-infra.files.txt |

## Skipped slices

- cli.test.ts, load.test.ts, resolve-extends tests (large, 20-36 KB each) — read by section with grep only if needed.
- docs/ website, skills/, @alias, @packages — docs and helpers.
- config-angular*, config-*-scopes, config-patternplate, cz-commitlint, prompt, prompt-cli, travis-cli, top-level — optional integrations.
- pnpm-lock.yaml — lock file.

## Notes for module workers

- Topic keywords: conventional commit, header, type, scope, subject, footer, commit-msg, --edit, extends, ignores.
- Focus: how a hook and CI both call the same linter; how rules are data (level, applicable, value); how messages are parsed.
- No repo-intel guidance for libraries in the playbook; the capstone is a Node CLI that lints commit messages and writes release notes.
