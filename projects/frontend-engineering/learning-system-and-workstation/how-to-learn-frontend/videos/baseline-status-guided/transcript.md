# How a feature moves from Limited to Widely available

Baseline gives each web feature one label. It checks seven core browsers: Chrome on desktop and Android, Edge, Firefox on desktop and Android, and Safari on macOS and iOS. While any one of them lacks the feature, the label is Limited availability. When the last one ships it, the feature is Newly available. Thirty months later it is Widely available, as the :has() selector shows: Newly available in December 2023, Widely available in June 2026. Can I use shows the support of each browser with four colors. Widely available means most sites, not all.

**00:00 Can I ship this feature?.** Can you use a web feature today? Baseline answers with one label.

**00:05 Seven core browsers.** Baseline checks seven core browsers: Chrome on desktop and Android, Edge, Firefox on desktop and Android, and Safari on macOS and iOS.

**00:17 Three labels in a fixed order.** A feature starts as Limited availability. When the last core browser ships it, the feature is Newly available. Thirty months later, it is Widely available.

**00:28 One missing browser stops the clock.** The thirty month clock starts only when the last core browser ships. Before that day, the feature stays Limited, however old it is.

**00:38 The :has() selector, month by month.** The has selector became Newly available in December 2023. Add thirty months, and it is Widely available in June 2026.

**00:49 Reading a Can I use table.** Can I use shows support for each browser. Green means supported, red means not supported, greenish yellow means partial, and gray means unknown.

**00:59 What Widely available does not promise.** Widely available means the feature works for most sites, not all. If your users run older browsers, check their support yourself.

Sources:

- Baseline: web platform feature availability — https://web.dev/baseline
- Can I use: About and support legend — https://caniuse.com/
- mdn/browser-compat-data — https://github.com/mdn/browser-compat-data
