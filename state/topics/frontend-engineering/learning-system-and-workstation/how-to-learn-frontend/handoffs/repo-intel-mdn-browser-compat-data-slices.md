# Slice plan — mdn/browser-compat-data

Repository: https://github.com/mdn/browser-compat-data
Clone: .cache/repos/mdn__browser-compat-data
Commit: 8f942b4c263286b32f9c2372801d33dd459dbde8 (short: 8f942b4)
License: CC0-1.0
Files tracked: 3,337 (almost all data JSON; the code is about 100 files)

The repo is data-heavy, so slices were hand-built from the code folders, not by `tutor slice`.

## Chosen slices

| Unit id | Module name | What it holds | Est. tokens | Why chosen | File list |
|---------|-------------|---------------|-------------|------------|-----------|
| mdn-browser-compat-data-module-schema-and-types | schema-and-types | schemas/*.json, schema doc, types, generate-types.js, one feature file (api/AbortController.json), browsers/chrome.json | 23,000 | the data format and one real feature entry | .cache/tmp/how-to-learn-frontend/mdn-browser-compat-data-module-schema-and-types.files.txt |
| mdn-browser-compat-data-module-data-linter | data-linter | lint/lint.js, lint/linter/* checks and tests, lint/fix.js, ajv setup, docs/testing.md | 18,000 | validation and tests of the data | .cache/tmp/how-to-learn-frontend/mdn-browser-compat-data-module-data-linter.files.txt |
| mdn-browser-compat-data-module-build-pipeline | build-pipeline | scripts/build/*, ordering and folder helpers | 12,000 | turns the JSON folders into one published file; browser mirroring | .cache/tmp/how-to-learn-frontend/mdn-browser-compat-data-module-build-pipeline.files.txt |
| mdn-browser-compat-data-module-consumer-api | consumer-api | index.js, utils/*, traverse.js and tests | 5,000 | what an app imports and how it walks the data | .cache/tmp/how-to-learn-frontend/mdn-browser-compat-data-module-consumer-api.files.txt |
| mdn-browser-compat-data-module-build-and-infra | build-and-infra | package.json, tsconfig, workflows, release script, web-features tagging, publishing doc | 8,000 | npm release pipeline, CI, bots, services | .cache/tmp/how-to-learn-frontend/mdn-browser-compat-data-module-build-and-infra.files.txt |

## Skipped slices

- api/, css/, html/, javascript/, http/, svg/, mathml/, webassembly/, webdriver/, webextensions/, mediatypes/ (except the one sample file) — about 3,200 data files, same shape as the sample.
- scripts/migrations/, scripts/bulk-editor/, scripts/update-browser-releases/ — maintenance tools, not the core path.
- release_notes/, RELEASE_NOTES.md, docs/ (except testing.md and publishing.md) — prose and generated notes.
- GOVERNANCE.md, CODE_OF_CONDUCT.md, issue templates — community files.

## Notes for module workers

- Topic keywords to search for: version_added, version_removed, support, status, baseline, mirror, preview, flags, partial_implementation.
- Focus from the playbook: CI and release (`.github/workflows/*`), testing strategy (`*.test.*`), type safety practice (schema validation at boundaries).
- Tie findings to the lesson: how a "supported since version N" claim is stored, checked and shipped.
- Read big JSON files by range only (`browsers/chrome.json` is about 10,000 tokens).
