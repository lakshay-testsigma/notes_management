# Visual candidates gap-01
- Critical rendering path order: request, DOM, CSSOM, render tree, layout, paint. Source mdn-same-origin-policy (MDN CRP page, "Understanding CRP"). CSSOM is not incremental and blocks render.
- DOMContentLoaded vs load order: parse ends, deferred/module scripts run, DOMContentLoaded, async scripts, load. Source mdn-same-origin-policy (MDN DOMContentLoaded page, "When DOMContentLoaded fires").
- Cross-origin isolation: COOP same-origin + COEP require-corp -> crossOriginIsolated true -> SharedArrayBuffer. Source mdn-same-origin-policy (MDN crossOriginIsolated, "Required headers").
- CORS simple vs preflight (OPTIONS first). Source mdn-same-origin-policy (MDN CORS, "Preflighted requests").
- Long task: tasks over 50 ms, blocking time = duration minus 50 ms. Source webdev-optimize-long-tasks, "What is a task?".
- Scanner to parser to AST. Source v8-ignition-turbofan (v8.dev/blog/scanner intro).
