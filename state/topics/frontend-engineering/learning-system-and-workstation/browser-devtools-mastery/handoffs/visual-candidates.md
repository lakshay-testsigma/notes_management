# Visual candidates (merged from research units)

## from visual-candidates-docs-inspect-debug.md
- comparison | line vs conditional vs logpoint vs DOM vs XHR/fetch vs event listener vs exception vs function vs Trusted Type breakpoints | chrome-devtools-docs, https://developer.chrome.com/docs/devtools/javascript/breakpoints overview | branch for a deck / debugger-lab choice
- decision | pick a breakpoint type for a given bug | chrome-devtools-docs, https://developer.chrome.com/docs/devtools/javascript/breakpoints | branch for a deck
- state change | deployed minified file shown as authored original in Sources; Call Stack and Console show original names | chrome-devtools-docs, https://developer.chrome.com/docs/devtools/javascript/source-maps "Debugging with source maps" | candidate for Diagram
- sequence | enable JavaScript source maps in Settings, open Authored file, set breakpoint | chrome-devtools-docs, https://developer.chrome.com/docs/devtools/javascript/source-maps | candidate for Video
- comparison | Styles pane (all rules, overridden) vs Computed pane (only applied values) | chrome-devtools-docs, https://developer.chrome.com/docs/devtools/css/reference #computed | candidate for Diagram
- parameter | Grid viewing options (line labels, track sizes, area names, extend lines) change the overlay | chrome-devtools-docs, https://developer.chrome.com/docs/devtools/css/grid "Grid viewing options" | experiment for an interactive experience
- state change | Toggle :hov pseudo-class forces the hover state on an element | chrome-devtools-docs, https://developer.chrome.com/docs/devtools/css "Add a pseudostate to a class" | candidate for PredictReveal
- sequence | local overrides: choose folder, edit content, reload serves saved copy | chrome-devtools-docs, https://developer.chrome.com/docs/devtools/overrides "Set up local overrides" | candidate for Video
- comparison | what overrides do not save (DOM edits, CSS from HTML, source-mapped files) | chrome-devtools-docs, https://developer.chrome.com/docs/devtools/overrides #limitations | candidate for CompareView
- dependency | utility to page state: $0 selected element, $$() element list, getEventListeners(), copy() to clipboard | chrome-devtools-docs, https://developer.chrome.com/docs/devtools/console/utilities | candidate for Diagram

## from visual-candidates-docs-cross-browser.md
- sequence | enable USB debugging on Android > open chrome://inspect#devices > tick Discover USB devices > connect cable > accept prompt > device name listed > Inspect tab | chrome-devtools-remote-debugging-docs, remote-debugging page steps | candidate for Video
- sequence | iOS: Settings > Safari > Advanced > Web Inspector on; Mac: Safari Settings > Advanced > Show features for web developers; cable; Develop > device | webkit-web-inspector-docs, Enabling Web Inspector | candidate for Video
- sequence | Firefox: Enable USB Devices in about:debugging > Remote Debugging via USB on phone > connect > Inspect | firefox-devtools-user-docs, about_colon_debugging | candidate for Video
- comparison | strongest tool per browser: Firefox grid/flexbox/fonts/accessibility; Safari required for iOS inspection; Chrome chrome://inspect for Android | firefox-devtools-user-docs page_inspector how-tos; webkit-web-inspector-docs; chrome remote-debugging | candidate for CompareView
- parameter | grid overlay settings (line numbers, area names, extend lines) | firefox-devtools-user-docs examine_grid_layouts | experiment for interactive
- parameter | variable font axes sliders with live preview | firefox-devtools-user-docs edit_fonts | experiment for interactive

## from research-docs-measure-proposal
## Visual candidates
- sequence | Queueing, Stalled, DNS Lookup, Initial connection, Proxy negotiation, Request sent, ServiceWorker Preparation, Request to ServiceWorker, Waiting (TTFB), Content Download | N "Timing breakdown phases explained" https://developer.chrome.com/docs/devtools/network/reference | Video
- number | long task = over 50 ms | W https://web.dev/articles/optimize-long-tasks | interactive timeline
- number | good LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 | W https://web.dev/articles/vitals | CompareView
- parameter | CPU throttling and network throttling change recorded timings | X "Throttle the CPU while recording"; N "Emulate slow network connections" | hybrid experiment
- dependency | retainer path: selected object <- objects pointing to it (Retainers section) | M heap-snapshots "The Retainers section" | diagram
- state change | DOM node removed but JS still references it = detached | M memory-problems "Discover detached DOM tree memory leaks" | diagram
- comparison | storage areas: cookies, IndexedDB, Cache storage | X application page "Storage" | CompareView
- sequence | bfcache test: open page, Application > Back/forward cache, Run Test | W bfcache "Test to ensure your pages are cacheable" | Video

## from research-repos-proposal
## Visual candidates
- architecture | trace events to handlers to insights in the DevTools trace model | front_end/models/trace/handlers (directory listing only; sequence not read) | needs scout confirmation
- architecture | Lighthouse gather, audit, score stages | core/gather, core/audits, core/scoring.js, core/runner.js (directory names only) | needs scout confirmation
