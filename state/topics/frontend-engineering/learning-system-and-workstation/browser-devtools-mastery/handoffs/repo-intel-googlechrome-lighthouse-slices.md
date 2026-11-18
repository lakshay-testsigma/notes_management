# Slice plan — GoogleChrome/lighthouse

Repository: https://github.com/GoogleChrome/lighthouse
Clone: .cache/repos/GoogleChrome__lighthouse
Commit: 3b399f6ca81616eb9253f7c140563b5be7a8a73e (short: 3b399f6)
License: Apache-2.0
Files tracked: 1,515

## Chosen slices

| Unit id | Module name | What it holds | Est. tokens | Why chosen | File list |
|---------|-------------|---------------|-------------|------------|-----------|
| googlechrome-lighthouse-module-gather-pipeline | gather-pipeline | navigation runner, driver, session, trace and devtools-log gatherers, network recorder, trace gatherer test | 13,400 | how a page load becomes a trace and network log (Performance and Network panel data) | .cache/tmp/browser-devtools-mastery/googlechrome-lighthouse-module-gather-pipeline.files.txt |
| googlechrome-lighthouse-module-metrics-and-trace | metrics-and-trace | computed artifacts, LCP/TBT metrics, lantern entry, metric audits, LCP test | ~9,000 | how audits compute Core Web Vitals from traces and network records | .cache/tmp/browser-devtools-mastery/googlechrome-lighthouse-module-metrics-and-trace.files.txt |
| googlechrome-lighthouse-module-audits-and-scoring | audits-and-scoring | runner, scoring, audit base class, network-requests and byte-efficiency audits, scoring test | 15,700 | how artifacts become audit results and category scores | .cache/tmp/browser-devtools-mastery/googlechrome-lighthouse-module-audits-and-scoring.files.txt |
| googlechrome-lighthouse-module-build-and-infra | build-and-infra | package.json, tsconfig, CI workflows, bundle build | ~12,000 | technologies, CI, DevTools integration | .cache/tmp/browser-devtools-mastery/googlechrome-lighthouse-module-build-and-infra.files.txt |

## Skipped slices

- report/ and flow-report/ — report renderer UI, not the trace/network analysis path.
- cli/, clients/, viewer/, treemap/ — entry points and web clients.
- other core/audits and core/gather/gatherers, core/config — many similar files; the chosen ones show the pattern.
- core/lib/tracehouse and core/lib/lantern — large trace processor, reached only via computed artifacts.
- core/lib/i18n, core/lib/cdt, third-party/, proto/, docs/, assets/ — translations, vendored or generated code, docs.

## Notes for module workers

- Topic keywords to search for: trace, devtoolsLog, networkRecords, LCP, TBT, lantern, simulate, throttling.
- Focus from the playbook: performance techniques, testing strategy, CI and release, observability.
- DevTools tie-in: the devtools log is the Network panel's CDP event stream; the trace is the Performance panel's recording.
