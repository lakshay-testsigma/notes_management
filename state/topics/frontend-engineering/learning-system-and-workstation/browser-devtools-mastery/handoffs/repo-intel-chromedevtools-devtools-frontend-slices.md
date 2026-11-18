# Slice plan — ChromeDevTools/devtools-frontend

Repository: https://github.com/ChromeDevTools/devtools-frontend
Clone: .cache/repos/ChromeDevTools__devtools-frontend (extracted from the GitHub tarball of the pinned commit, because the sandbox blocks writing `.git/`; no git history)
Commit: 572bfc046bf9e5b65113fc420b68e89741d1510d (short: 572bfc0)
License: BSD-3-Clause (`package.json:13`, `LICENSE`)
Files tracked: 8,974 (extracted files)

## Chosen slices

| Unit id | Module name | What it holds | Est. tokens | Why chosen | File list |
|---------|-------------|---------------|-------------|------------|-----------|
| chromedevtools-devtools-frontend-module-source-map | source-map | core/sdk SourceMap.ts, SourceMapManager.ts, SourceMapCache.ts, SourceMap.test.ts | 33,000 | source maps and VLQ mapping parser | .cache/tmp/browser-devtools-mastery/chromedevtools-devtools-frontend-module-source-map.files.txt |
| chromedevtools-devtools-frontend-module-har | har | models/har Importer, Log, Writer, HARFormat and their tests | 22,500 | HAR export and import for the Network panel | .cache/tmp/browser-devtools-mastery/chromedevtools-devtools-frontend-module-har.files.txt |
| chromedevtools-devtools-frontend-module-heap-snapshot | heap-snapshot | heap_snapshot_worker HeapSnapshot.ts, Loader, Dispatcher; models/heap_snapshot; HeapProfilerModel | 57,000 | heap snapshot graph model in a worker | .cache/tmp/browser-devtools-mastery/chromedevtools-devtools-frontend-module-heap-snapshot.files.txt |
| chromedevtools-devtools-frontend-module-cdp-client | cdp-client | core/protocol_client, sdk Connections.ts and Target.ts | 21,000 | how the UI talks to the browser over CDP | .cache/tmp/browser-devtools-mastery/chromedevtools-devtools-frontend-module-cdp-client.files.txt |

## Skipped slices

- front_end/panels/ (Elements, Network, Console UI) — large UI code; not read, only the models.
- front_end/models/trace, ai_assistance, lighthouse — unrelated to the assigned concepts.
- front_end/third_party, generated, Images, i18n locales — vendored, generated, or translations.
- build-and-infra — dropped by the brief (spawn budget); manifests were read by the scout only (package.json, DEPS, .github/workflows).
- core/sdk/NetworkManager.ts (29k tokens) — too large for the budget; read only by section if a module needs it.

## Notes for module workers

- Allowance by CLI is about 10k input tokens at the default window; files are bigger. Use `grep -n` and read ranges. Large files: HeapSnapshot.ts (46k), SourceMap.test.ts (19k), SourceMap.ts (10k).
- Topic keywords: sourceMappingURL, nextVLQ, HAR, entries, heap snapshot, retained size, dominator, Connection, sendRawMessage.
- Focus from the playbook: testing strategy (tests beside code), performance techniques (worker), error handling, CI and release.
- Use the short SHA 572bfc0 in citations; line numbers refer to this extracted tree.
