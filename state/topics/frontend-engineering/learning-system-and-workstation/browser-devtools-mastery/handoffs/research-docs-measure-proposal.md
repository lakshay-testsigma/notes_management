# Proposal: docs-measure (verified 2026-11-18)
Ids: N=chrome-devtools-network-docs, M=chrome-devtools-memory-docs, X=chrome-devtools-measure-docs, W=web-dev-vitals-docs. Digest: N, M.

## Concepts
- network-panel, waterfall-timing-phases, network-throttling-and-blocking, har-export, initiator-and-priority: N. https://developer.chrome.com/docs/devtools/network/reference sections "Timing breakdown phases explained", "Emulate slow network connections", "Export requests data", "View initiators and dependencies". Request blocking and priority have no dedicated section (drawer tab, column, filter only).
- performance-panel, flame-chart-and-long-tasks, cpu-throttling: X https://developer.chrome.com/docs/devtools/performance/reference ("Record performance", "Analyze a performance recording", "Throttle the CPU while recording", "View layout shifts", "Get actionable insights"); W https://web.dev/articles/optimize-long-tasks (long task > 50 ms).
- core-web-vitals-live: X "Live metrics screen" (CrUX field data optional); W https://web.dev/articles/vitals.
- memory-panel, heap-snapshots, retainers-and-detached-dom, allocation-timeline: M https://developer.chrome.com/docs/devtools/memory-problems (sections "Discover detached DOM tree memory leaks with Heap Snapshots", "Identify JS heap memory leaks with Allocation Timelines", "Identify objects retained by JS reference"); https://developer.chrome.com/docs/devtools/memory-problems/heap-snapshots ("The Retainers section", "Comparison view", "Summary view", "Uncover DOM leaks").
- application-panel, storage-inspection, service-worker-and-cache-storage: X https://developer.chrome.com/docs/devtools/application (Storage: cookies, IndexedDB, Cache storage; Service workers; Manifest; Background services).
- bfcache-test: X Application > Back/forward cache tab; W https://web.dev/articles/bfcache "Test to ensure your pages are cacheable" (Run Test; failures marked Actionable).
- coverage-panel: X https://developer.chrome.com/docs/devtools/coverage (used vs unused CSS/JS bytes; "Record code coverage", "Analyze code coverage").
- rendering-emulation: X https://developer.chrome.com/docs/devtools/rendering/emulate-css (prefers-color-scheme, prefers-reduced-motion, forced-colors, prefers-contrast). Vision deficiencies NOT on that page; unverified.
- recorder-and-issues: X https://developer.chrome.com/docs/devtools/recorder (record, replay, measure, edit steps). Issues panel not verified.
- lighthouse-panel-other-panels, lighthouse-audits: no source verified here; needs another unit (developer.chrome.com/docs/lighthouse).

## Proposed child concepts
None required. Optional: speculative-loads (Application > Background services, X application page; prerequisite application-panel); layout-shifts-track (X "View layout shifts"; prerequisite performance-panel). Long Animation Frames was not on the Performance reference page: unverified, out of scope for now.

## Out of scope / gaps
Lighthouse, Security/Privacy, Animations, Layers, CSS Overview, Issues, vision-deficiency emulation, storage quota (only a mention). Poor-threshold values for Web Vitals not readable as text.

## Visual candidates
- sequence | Queueing, Stalled, DNS Lookup, Initial connection, Proxy negotiation, Request sent, ServiceWorker Preparation, Request to ServiceWorker, Waiting (TTFB), Content Download | N "Timing breakdown phases explained" https://developer.chrome.com/docs/devtools/network/reference | Video
- number | long task = over 50 ms | W https://web.dev/articles/optimize-long-tasks | interactive timeline
- number | good LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 | W https://web.dev/articles/vitals | CompareView
- parameter | CPU throttling and network throttling change recorded timings | X "Throttle the CPU while recording"; N "Emulate slow network connections" | hybrid experiment
- dependency | retainer path: selected object <- objects pointing to it (Retainers section) | M heap-snapshots "The Retainers section" | diagram
- state change | DOM node removed but JS still references it = detached | M memory-problems "Discover detached DOM tree memory leaks" | diagram
- comparison | storage areas: cookies, IndexedDB, Cache storage | X application page "Storage" | CompareView
- sequence | bfcache test: open page, Application > Back/forward cache, Run Test | W bfcache "Test to ensure your pages are cacheable" | Video
