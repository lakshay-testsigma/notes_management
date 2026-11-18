# Slice plan — dequelabs/axe-core

Repository: https://github.com/dequelabs/axe-core
Clone: .cache/repos/dequelabs__axe-core
Commit: e80f6b797b32b5f9d60ddaa0a7afad6ed864f121 (short: e80f6b7)
License: MPL-2.0
Files tracked: 2,069
Note: the clone was made in $TMPDIR and moved into .cache/repos, because git could not create .git inside .cache in the sandbox. The .git folder is intact.

## Chosen slices

| Unit id | Module name | What it holds | Est. tokens | Why chosen | File list |
|---------|-------------|---------------|-------------|------------|-----------|
| dequelabs-axe-core-module-engine-run | engine-run | public/run.js, run-rules.js, base/rule.js, base/check.js, queue, aggregate, finalize-result | 9,400 | how axe.run() turns rules into results, incomplete vs violations | .cache/tmp/browser-extension-toolkit/dequelabs-axe-core-module-engine-run.files.txt |
| dequelabs-axe-core-module-frame-messaging | frame-messaging | frame messenger, respondable, run-partial, collect-results-from-frames, doc/frame-messenger.md | 8,200 | how one scan crosses iframes | .cache/tmp/browser-extension-toolkit/dequelabs-axe-core-module-frame-messaging.files.txt |
| dequelabs-axe-core-module-headings-landmarks-rules | headings-landmarks-rules | heading-order, empty-heading, landmark and region rules and checks, plus heading-order test | 9,700 | topic: headings-and-landmarks | .cache/tmp/browser-extension-toolkit/dequelabs-axe-core-module-headings-landmarks-rules.files.txt |
| dequelabs-axe-core-module-color-contrast | color-contrast | color-contrast rule, check, lib/commons/color | 8,300 | topic: contrast-and-vision-checks, "incomplete" data | .cache/tmp/browser-extension-toolkit/dequelabs-axe-core-module-color-contrast.files.txt |
| dequelabs-axe-core-module-a11y-tests | a11y-tests | test/core/public/run.js, test/checks/navigation/region.js | 8,100 | what behaviour the team protects; automated-a11y-rule-limits | .cache/tmp/browser-extension-toolkit/dequelabs-axe-core-module-a11y-tests.files.txt |
| dequelabs-axe-core-module-build-and-infra | build-and-infra | package.json, pnpm-workspace.yaml, .nvmrc, test and release workflows, esbuild build scripts, wtr config | 8,200 | technologies, CI, release | .cache/tmp/browser-extension-toolkit/dequelabs-axe-core-module-build-and-infra.files.txt |

## Skipped slices

- lib/commons (except color), lib/checks and lib/rules beyond headings, landmarks and contrast — about 90 more rules, not the topic.
- lib/core/utils/get-selector, css-parser, preload — selector generation and stylesheet loading; useful but secondary.
- lib/standards (ARIA tables), locales/ (translations), typings, axe.d.ts.
- test/integration (616 files), test/act-rules, test/aria-practices — large test fixtures.
- doc/ beyond frame-messenger.md and run-partial.md — docs; API.md and rule-descriptions.md are read as reference only.
- perf/, patches/, release and deploy workflows — only test.yml and release.yml are read.

## Notes for module workers

- Each file list is sized to the 10,107-token default allowance; tests listed in a11y-tests may be read by section.
- Topic keywords: violations, incomplete, passes, inapplicable, heading-order, region, landmark, color-contrast, needsReview.
- Focus from the playbook: accessibility practice (axe tests, lint rules), testing strategy, CI and release, error handling.
- Learner goal: a mini project that runs accessibility and SEO checks on release pages; note what automation cannot decide.
