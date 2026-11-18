# Proposal: docs-inspect-debug (sources: chrome-devtools-docs, ecma-426-source-map)

Digest flag: ecma-426-source-map (full text free at https://tc39.es/ecma426/; sections 6 base64 VLQ, 9 Source map format, 10 Index source map, 11 Retrieving source maps).

## Concept to section map
Page 1
- elements-styles-panel: chrome-devtools-docs; https://developer.chrome.com/docs/devtools/css/reference sections "Select an element" (#select), "View CSS", "Change CSS", "Add a declaration" (#add-declaration-to-rule). Also https://developer.chrome.com/docs/devtools/css (View an element's CSS).
- box-model-and-computed-styles: https://developer.chrome.com/docs/devtools/css/reference "View only the CSS that's actually applied to an element" (#computed), "View an element's box model".
- flex-grid-overlays: https://developer.chrome.com/docs/devtools/css/flexbox (flex badge, click badge for overlay, Layout pane) and https://developer.chrome.com/docs/devtools/css/grid ("Discover CSS grids", "Grid viewing options"). Not on the reference page.
- force-element-state: https://developer.chrome.com/docs/devtools/css/reference "Toggle a pseudo-class" (contains "Force specific element state"); https://developer.chrome.com/docs/devtools/css "Add a pseudostate to a class" (:hov button).
Page 2
- console-power-use: https://developer.chrome.com/docs/devtools/console/reference (#persist, #xhr, #eagereval, #history, #context).
- console-utilities: https://developer.chrome.com/docs/devtools/console/utilities ($0-$4, $$(), copy(), monitorEvents(), table(), dir(), getEventListeners(), queryObjects(), debug()).
- live-expressions: https://developer.chrome.com/docs/devtools/console/live-expressions (pin an expression to the top of the Console; result refreshes almost continuously).
Page 3
- sources-panel-debugging: https://developer.chrome.com/docs/devtools/javascript/reference "View the current call stack", "View and edit local, closure, and global properties" (scope), "Watch the values of custom JavaScript expressions".
- breakpoint-types: https://developer.chrome.com/docs/devtools/javascript/breakpoints: #loc, #conditional-loc, #log-loc (logpoints), #dom, #xhr, #event-listeners, #exceptions, #function, #trusted-type.
- async-call-stack: https://developer.chrome.com/docs/devtools/javascript/reference "View async frames" (under the call stack section). Breakpoints page notes async exception pausing looks for promise rejection handlers.
- source-maps: https://developer.chrome.com/docs/devtools/javascript/source-maps (enable in Settings > Preferences > Sources; Authored section; //# sourceMappingURL; //# sourceURL for eval) plus ecma-426-source-map sections 9 and 11.
- local-overrides: https://developer.chrome.com/docs/devtools/overrides (#set-up, #override-xhr-fetch, #override-headers, #limitations).

## Proposed child concepts
- cascade-layers-view | View cascade layers | parent elements-styles-panel | https://developer.chrome.com/docs/devtools/css/reference "View cascade layers" | prereq: elements-styles-panel
- css-at-rules-view | View @property, @supports, @scope at-rules | parent elements-styles-panel | https://developer.chrome.com/docs/devtools/css/reference "View CSS at-rules" | prereq: elements-styles-panel
- logpoints | Logpoints | parent breakpoint-types | https://developer.chrome.com/docs/devtools/javascript/breakpoints #log-loc | prereq: breakpoint-types
- ignore-listing-frames | Ignore-listed frames in the call stack | parent sources-panel-debugging | https://developer.chrome.com/docs/devtools/javascript/reference "Show ignore-listed frames" | prereq: sources-panel-debugging
- source-map-vlq-mappings | How a source map encodes positions (base64 VLQ) | parent source-maps | ecma-426-source-map section 6 and 9 | prereq: source-maps
- override-xhr-fetch | Override an XHR or fetch response | parent local-overrides | https://developer.chrome.com/docs/devtools/overrides #override-xhr-fetch | prereq: local-overrides

## Scope decisions and gaps
- Container query badges: no matching heading on https://developer.chrome.com/docs/devtools/css/reference. Unsupported by a read section; leave out or find another source.
- Workspaces and Snippets: not fetched (fetch budget). Open question for another unit.
- Stepping controls: breakpoints page has no stepping section; the reference page was not read for step into/over.
- Local overrides limits: source-mapped files cannot be overridden (#limitations). Useful failure mode for page 3.
- Pages show no last-updated date; year 2026 is the live-read year.
