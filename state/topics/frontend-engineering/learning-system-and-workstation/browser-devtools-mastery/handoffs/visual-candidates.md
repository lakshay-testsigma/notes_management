# Visual candidates — browser-devtools-mastery

## From unit docs
- sequence | Network request phases: Queueing, Stalled, DNS Lookup, Initial connection, Proxy negotiation, Request sent, ServiceWorker Preparation, Request to ServiceWorker, Waiting (TTFB), Content Download | chrome-devtools-network-reference, "Analyze requests" (Timing tab) | candidate for Video
- parameter | Throttling preset (fast 4G, slow 4G, 3G, custom) changes waterfall timing | chrome-devtools-network-reference, "Change loading behavior" | experiment for interactive
- comparison | Disable cache on (first-time visitor) vs off (repeat visit served from cache) | chrome-devtools-network-reference, "Change loading behavior" | candidate for CompareView
- parameter | CPU throttling slowdown factor (2x) changes task duration | chrome-devtools-performance-reference, "Record performance" (capture settings) | experiment for interactive
- dependency | Flame chart: x-axis time, y-axis call stack; upper events cause lower events; long tasks over 50 ms shaded red | chrome-devtools-performance-reference, "Analyze a performance recording" (Flame chart, Main) | candidate for Diagram
- sequence | Load recording: navigate to about:blank, reload, stop a couple of seconds after load | chrome-devtools-performance-reference, "Record performance" | candidate for Video
- number | Long task threshold 50 ms | chrome-devtools-performance-reference, "Analyze a performance recording" | candidate for intro
- state change | Detached DOM node: removed from the DOM tree but still referenced by JavaScript, so memory is not freed | chrome-devtools-memory-docs, "Discover detached DOM tree memory leaks with Heap Snapshots" | candidate for Diagram
- sequence | Memory leak workflow: Task Manager, Performance recording, Heap snapshot, Allocation timeline, Allocation sampling | chrome-devtools-memory-docs, section headings in order | decision path for a deck
- structure | Source map document structure: base64 VLQ, source map format, index source map, retrieving source maps | ecma-426-source-map, sections 6, 9, 10, 11 | candidate for Diagram

## From unit repos
- architecture | DevTools frontend (TypeScript/CSS web app) mirrored from chromium.googlesource.com, published to npm as chrome-devtools-frontend | chromedevtools-devtools-frontend-repo README | candidate for Diagram
- architecture | Puppeteer drives Chrome or Firefox over DevTools Protocol or WebDriver BiDi | puppeteer-puppeteer-repo README | candidate for Diagram
- comparison | Lighthouse run inside DevTools vs standalone/CI (lighthouse-ci) | googlechrome-lighthouse-repo README Related projects | candidate for CompareView

## From unit discovery-01-runtime
1. Sequence: request timing phases Queueing > Stalled > DNS Lookup > Initial connection (TCP+SSL) > Request sent > Waiting (TTFB) > Content Download. Source chrome-devtools-network-reference, "Timing".
2. Parameter: network throttling preset (Fast 4G / Slow 4G / 3G) vs phase widths. Source network reference, "Emulate slow network connections".
3. Parameter: CPU throttling 1x / 2x slowdown vs task length and the red long-task triangle. Source chrome-devtools-performance-reference, "CPU throttling" under Record performance.
4. State change: long task 400 ms with last 350 ms shaded red (threshold 50 ms). Source performance reference "Read the flame chart"; webdev-optimize-long-tasks.
5. Structure: flame chart axes x time, y call stack (click > anonymous fn > onEndpointClick_ > handleClick_). Source performance reference "Read the flame chart".
6. Decomposition: INP = input delay + processing duration + presentation delay. Source https://web.dev/articles/inp, "What's in an interaction?".
7. Numbers: CWV thresholds LCP 2.5 s, INP 200 ms, CLS 0.1 (poor >4 s / >500 ms / >0.25). Sources web.dev lcp, inp, cls pages.
8. Formula: CLS = impact fraction x distance fraction; session window <1 s gaps, <=5 s. Source web.dev/articles/cls.
9. Graph: retaining path window > ... > detached DOM node; retainers pane lists referrers; shallow vs retained size. Source chrome-devtools-memory-docs, heap-snapshots "The Retainers section" and memory-101 "Object sizes".
10. Sequence: three-snapshot/Comparison technique (snapshot 1, action and reverse, snapshot 2, compare). Source heap-snapshots "Comparison view".
11. Decision: three memory symptoms (progressive slowdown, constant bad, frequent pauses) to leak / bloat / GC churn. Source memory-problems "The three memory problem symptoms".
12. Comparison: breakpoint type vs when to use (table). Source breakpoints page "Overview of when to use each breakpoint type".
13. Mapping: generated line/column to original via sourceMappingURL and VLQ mappings. Source ecma-426-source-map sections 7, 10, 12; DevTools source-maps page.
14. Sequence: stepping over/into/out on a call stack. Source javascript reference "Step through code".

## From unit discovery-01-inspect
- sequence | Android remote debugging: enable USB debugging > chrome://inspect#devices > Discover USB devices > cable > accept prompt > model name shown > Inspect | chrome-devtools-remote-debugging-docs, Step 1 and Step 2 | candidate for Video
- sequence | iOS from Mac: iOS Settings > Safari > Advanced > Web Inspector; Mac Safari Settings > Advanced > Show features for web developers; cable; Develop menu > device | webkit-web-inspector-docs, Enabling Web Inspector | candidate for Video
- sequence | Firefox Android: Enable USB Devices > developer options > USB debugging > Remote Debugging via USB > cable > Connect > Inspect | firefox-devtools-user-docs, about:debugging steps 1-7 | candidate for Video
- sequence | Coverage: Show Coverage > pick Per function or Per block > Reload > interact > stop > read gray/green bars | chrome-devtools-docs, coverage page "Record coverage" | candidate for Video
- sequence | Lighthouse run: choose mode > device and categories > settings > run > read report | chrome-devtools-docs, lighthouse page steps 1-6 | candidate for Video
- parameter | Lighthouse mode (Navigation, Timespan, Snapshot) changes what is audited | chrome-devtools-docs, lighthouse step 2 | experiment for interactive
- parameter | Throttle preset: mid-tier Fast 3G + 4x CPU vs low-end Slow 3G + 6x CPU | chrome-devtools-docs, device-mode "Throttling" | experiment for interactive
- parameter | Grid overlay settings: line numbers, area names, extend lines | firefox-devtools-user-docs, examine_grid_layouts "Display settings" | experiment for interactive
- parameter | Service worker toggles: Update on reload, Bypass for network, Offline, start/stop | chrome-devtools-docs, progressive-web-apps "Service Workers Tab" | experiment for interactive
- number | opaque cross-origin cache response counts about 7 MB toward quota | chrome-devtools-docs, progressive-web-apps "Cache Storage Inspection" | candidate for intro number
- number | Console utilities $0 to $4 hold the last five selected elements | chrome-devtools-docs, console/utilities table | candidate for diagram
- comparison | Chrome chrome://inspect vs Firefox about:debugging vs Safari Develop menu for devices | chrome-devtools-remote-debugging-docs; firefox-devtools-user-docs about:debugging; webkit-web-inspector-docs | candidate for CompareView
- comparison | Device mode (first-order approximation on desktop CPU) vs real device remote debugging | chrome-devtools-docs, device-mode "What it doesn't simulate" | candidate for CompareView
- comparison | Lighthouse vs Performance panel: Performance preferred for perf detail, Lighthouse for a11y, best practices, SEO | chrome-devtools-docs, lighthouse "Performance panel vs. Lighthouse" | branch for a deck
- decision | Unused code found: Coverage shows it, refactoring is a separate hard step | chrome-devtools-docs, coverage "Caveats" | branch for a deck
