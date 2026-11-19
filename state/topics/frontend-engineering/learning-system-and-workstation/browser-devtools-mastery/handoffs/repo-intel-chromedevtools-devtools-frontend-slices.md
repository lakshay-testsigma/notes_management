# Slice plan — ChromeDevTools/devtools-frontend

Repository: https://github.com/ChromeDevTools/devtools-frontend
Clone: .cache/repos/ChromeDevTools__devtools-frontend
Commit: 92a1ec4a49607d5892c64093cba46b30aa14377d (short: 92a1ec4)
License: BSD-3-Clause
Files tracked: about 8,970 (blobless shallow clone; git ls-files reported 0, count taken from the working tree)

## Chosen slices

Estimates are for the whole file list; the budget per worker is about 10,000 tokens, so read the big files by section with grep -n and line ranges.

| Unit id | Module name | What it holds | Est. tokens | Why chosen | File list |
|---------|-------------|---------------|-------------|------------|-----------|
| chromedevtools-devtools-frontend-module-protocol-client | protocol-client | core/protocol_client (InspectorBackend, CDPConnection), core/sdk SDKModel, Target, TargetManager | 17,800 | how DevTools sends CDP commands and routes events to per-target models | .cache/tmp/browser-devtools-mastery/chromedevtools-devtools-frontend-module-protocol-client.files.txt |
| chromedevtools-devtools-frontend-module-network-timing | network-timing | core/sdk NetworkManager, models/logs NetworkLog, models/network_time_calculator | 40,300 | Network panel: events become requests and timing bars | .cache/tmp/browser-devtools-mastery/chromedevtools-devtools-frontend-module-network-timing.files.txt |
| chromedevtools-devtools-frontend-module-source-maps | source-maps | core/sdk SourceMap, SourceMapManager and its test | 24,600 | how a script's source map URL is found, fetched and parsed | .cache/tmp/browser-devtools-mastery/chromedevtools-devtools-frontend-module-source-maps.files.txt |
| chromedevtools-devtools-frontend-module-trace-processing | trace-processing | models/trace Processor, ModelImpl, NetworkRequestsHandler, Processor test | 23,300 | Performance panel: raw trace events become a model through handlers | .cache/tmp/browser-devtools-mastery/chromedevtools-devtools-frontend-module-trace-processing.files.txt |

Reading hints. network-timing: NetworkManager.ts is 2,972 lines; grep for requestWillBeSent, responseReceived, loadingFinished (lines 398, 753, 910 mention them) and read those ranges; RequestTimeRanges.ts:51 has calculateRequestTimeRanges. source-maps: SourceMapManager.ts:102 attachSourceMap, then SourceMap.ts parsing. trace-processing: Processor.ts:154 parse; ModelImpl.ts for the public wrapper.

## Skipped slices

- build-and-infra (package.json, BUILD.gn, DEPS, .github/workflows): the brief asked for exactly four slices on protocol and panel data; only the manifest facts in the overview were read (package.json). A later unit may add it.
- front_end/panels/* UI views (NetworkLogView.ts 3,191 lines and others): view code; the data path is in the chosen models.
- front_end/models/heap_snapshot, models/cpu_profile (Memory panel data): a good future slice; skipped to keep four.
- front_end/models/trace/handlers other than NetworkRequestsHandler, insights, lantern: too large; one handler is enough to show the pattern.
- front_end/core/sdk DebuggerModel.ts (breakpoints): 1,697 lines; skipped for budget.
- front_end/third_party, generated, Images, ui components, i18n, test/ (e2e), docs, extension-api: vendored, generated, or unrelated.
- Existing stale files in .cache/tmp/browser-devtools-mastery (cdp-client, har, heap-snapshot, source-map file lists) came from an earlier run and are not part of this plan.

## Notes for module workers

- Topic keywords: Network.requestWillBeSent, Target, Session, sendRawMessage, source map, trace event, timing.
- Focus from the playbook: testing strategy (*.test.ts beside code), type safety at boundaries, performance techniques, error handling.
