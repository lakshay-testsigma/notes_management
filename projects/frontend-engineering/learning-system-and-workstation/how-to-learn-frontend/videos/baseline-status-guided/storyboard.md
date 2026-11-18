# Storyboard: How a feature moves from Limited to Widely available

**Purpose.** See which two inputs set a feature's Baseline label: support in every core browser, and the months since that day.

**Why a video.** The label changes in a fixed order over time: the last core browser ships, a date is set, and 30 months later the label changes again.

**Length.** 69.0 s, 7 scenes.

## 1. Can I ship this feature? (0.0–5.0 s)

**On screen.** Title card with "Limited, Newly, Widely available".

**Narration and caption.** Can you use a web feature today? Baseline answers with one label.

**Sources.** web-dev-baseline-docs

## 2. Seven core browsers (5.0–17.0 s)

**On screen.** Numbered steps appear one at a time: Chrome: desktop and Android → Edge → Firefox: desktop and Android → Safari: macOS and iOS.

**Narration and caption.** Baseline checks seven core browsers: Chrome on desktop and Android, Edge, Firefox on desktop and Android, and Safari on macOS and iOS.

**Sources.** web-dev-baseline-docs

## 3. Three labels in a fixed order (17.0–28.0 s)

**On screen.** Nodes Limited, Newly available, Widely available. A packet moves limited→newly (last core browser ships it), newly→widely (30 months pass); each node lights up when the packet arrives.

**Narration and caption.** A feature starts as Limited availability. When the last core browser ships it, the feature is Newly available. Thirty months later, it is Widely available.

**Sources.** web-dev-baseline-docs

## 4. One missing browser stops the clock (28.0–38.0 s)

**On screen.** Two columns, "6 of 7 core browsers" and "7 of 7 core browsers", fill in pairs; verdict: Only the last core browser starts the clock..

**Narration and caption.** The thirty month clock starts only when the last core browser ships. Before that day, the feature stays Limited, however old it is.

**Sources.** web-dev-baseline-docs

## 5. The :has() selector, month by month (38.0–49.0 s)

**On screen.** A timeline reveals Dec 2023 → Dec 2024 → May 2026 → Jun 2026.

**Narration and caption.** The has selector became Newly available in December 2023. Add thirty months, and it is Widely available in June 2026.

**Sources.** web-dev-baseline-docs

## 6. Reading a Can I use table (49.0–59.0 s)

**On screen.** Numbered steps appear one at a time: Green: supported → Red: not supported → Greenish yellow: partial support → Gray: support unknown.

**Narration and caption.** Can I use shows support for each browser. Green means supported, red means not supported, greenish yellow means partial, and gray means unknown.

**Sources.** caniuse-docs, mdn-browser-compat-data-repo

## 7. What Widely available does not promise (59.0–69.0 s)

**On screen.** Two columns, "Baseline tells you" and "Still check", fill in pairs; verdict: Use the label to plan, then check your own users..

**Narration and caption.** Widely available means the feature works for most sites, not all. If your users run older browsers, check their support yourself.

**Sources.** web-dev-baseline-docs
