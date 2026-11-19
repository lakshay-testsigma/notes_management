# Slice plan — GoogleChrome/lighthouse

Repository: https://github.com/GoogleChrome/lighthouse
Clone: .cache/repos/GoogleChrome__lighthouse
Commit: 3b399f6ca81616eb9253f7c140563b5be7a8a73e (short: 3b399f6)
License: Apache-2.0
Files tracked: 1,515

## Chosen slices

| Unit id | Module name | What it holds | Est. tokens | Why chosen | File list |
|---------|-------------|---------------|-------------|------------|-----------|
| googlechrome-lighthouse-module-cdp-session-and-navigation | cdp-session-and-navigation | core/gather/session.js, driver.js, driver/*, navigation-runner.js, tests | 21,000 | how Lighthouse sends CDP commands, tracks targets and network, runs a navigation | .cache/tmp/browser-devtools-mastery/googlechrome-lighthouse-module-cdp-session-and-navigation.files.txt |
| googlechrome-lighthouse-module-gatherers-and-artifacts | gatherers-and-artifacts | base-gatherer, trace.js, devtools-log.js, network-recorder.js, tests | 9,000 | how traces and network records become artifacts | .cache/tmp/browser-devtools-mastery/googlechrome-lighthouse-module-gatherers-and-artifacts.files.txt |
| googlechrome-lighthouse-module-metrics-lcp-tbt-cls | metrics-lcp-tbt-cls | core/computed/metrics/{lcp,tbt,cls,metric,lantern-metric}, processed-trace, tests | 15,000 | how LCP, TBT, CLS are computed from a trace | .cache/tmp/browser-devtools-mastery/googlechrome-lighthouse-module-metrics-lcp-tbt-cls.files.txt |
| googlechrome-lighthouse-module-audit-scoring-and-runner | audit-scoring-and-runner | runner.js, scoring.js, audits/audit.js, metric audits, default-config.js | 23,500 | how audits run on artifacts and become scores | .cache/tmp/browser-devtools-mastery/googlechrome-lighthouse-module-audit-scoring-and-runner.files.txt |

## Skipped slices

- core/lib/lantern and core/lib/tracehouse (simulation and trace parsing internals): too deep for the topic; metrics slice cites them only at the call site.
- core/audits (other ~100 audits), core/gather/gatherers (other gatherers): same pattern, not repeated.
- build-and-infra (package.json, .github/workflows, build/): skipped by brief (exactly 4 slices); the scout read package.json and the workflow names for the overview only.
- report, flow-report, viewer, treemap, clients, cli, proto, docs, third-party, core/test/fixtures: UI, packaging, vendored or generated code.

## Notes for module workers

- Topic keywords: Session, CDP, Tracing, Network, trace, devtoolsLog, artifact, LCP, TBT, CLS, score, audit.
- Focus from the playbook: testing strategy, performance techniques, observability (web-vitals reporting), error handling, CI.
- Other stale *.files.txt files in the tmp folder are not part of this plan.
