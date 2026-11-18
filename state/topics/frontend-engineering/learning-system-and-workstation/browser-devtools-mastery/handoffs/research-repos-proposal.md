# Repos proposal (browser-devtools-mastery)

Verified 2026-11-18 via api.github.com (not archived, license present, pushed today). Lighthouse HEAD 3b399f6ca, devtools-frontend HEAD cd9bf3784.

## googlechrome-lighthouse-repo (31153 stars, Apache-2.0)
Why: reads Chrome traces and network logs, scores audits, writes a JSON report. Same pipeline as the capstone CLI.
Directories for repo-intel (all seen in the live tree):
- core/lib/tracehouse: trace-processor.js, main-thread-tasks.js, task-groups.js, task-summary.js, cpu-profile-model.js (trace event to long-task finder)
- core/computed: processed-trace.js, main-thread-tasks.js, network-records.js, network-analysis.js, tbt-impact-tasks.js, js-bundles.js (derived artifacts; js-bundles relates to source maps)
- core/audits (50 entries at top level; budget-style audits such as performance-budget, resource-summary), core/scoring.js, core/runner.js, core/gather
Size hint: large; slice per directory above, skip core/test and core/config.
Supports: perf-triage CLI (Lighthouse JSON, budgets), trace long-task finder, source-map resolver (js-bundles).

## chromedevtools-devtools-frontend-repo (4103 stars, BSD-3-Clause)
Note: GitHub copy mirrors chromium.googlesource.com (README); source of truth is Gerrit.
Narrow subtree only:
- front_end/models/trace (22 entries; handlers/ has 67 files: one handler per trace concern)
- front_end/models/har (10 entries: HAR import/export and log model)
- front_end/panels/network (82 entries; start with request timing, waterfall code) and front_end/models/network_time_calculator
- front_end/models/source_map_scopes, front_end/models/trace_source_maps_resolver, front_end/core/sdk (SourceMap code; 167 entries, read only source-map files)
Size hint: whole repo too large; slice the four subtrees separately.
Supports: network waterfall page, performance/long-task page, source-map debugging page, HAR report mini project.

## Dropped
- mozilla/source-map: 3725 stars, license reported as NOASSERTION by the API; library only, not a DevTools practice repo. Not verified further.
- Chrome Trace Event Format doc: not searched (docs unit covers it).

## Visual candidates
- architecture | trace events to handlers to insights in the DevTools trace model | front_end/models/trace/handlers (directory listing only; sequence not read) | needs scout confirmation
- architecture | Lighthouse gather, audit, score stages | core/gather, core/audits, core/scoring.js, core/runner.js (directory names only) | needs scout confirmation
