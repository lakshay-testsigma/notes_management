# Storyboard: Test the feature, then pick a code path

**Purpose.** See how a feature test picks the enhanced or the fallback code path in each browser.

**Why a video.** The test runs first and its yes or no answer decides which code runs next, so the learner must see the cause before the effect.

**Length.** 81.4 s, 7 scenes.

## 1. Test the feature, not the browser (0.0–8.0 s)

**On screen.** Title card with "Enhanced code or fallback code".

**Narration and caption.** Your code asks one question: can this browser do it? The answer picks the enhanced code or the fallback code.

**Sources.** mdn-feature-detection-guide

## 2. Three ways to ask (8.0–20.5 s)

**On screen.** Numbered steps appear one at a time: @supports: a CSS rule, no JavaScript → CSS.supports(): the CSS test in JavaScript → "geolocation" in navigator: a JS member check.

**Narration and caption.** The screen shows three feature tests. The @supports rule tests CSS inside CSS. CSS.supports runs the same test in JavaScript. The in operator checks an object member.

**Sources.** mdn-feature-detection-guide

## 3. One test, two layouts (20.5–32.8 s)

**On screen.** Two columns, "Subgrid supported" and "Subgrid missing", fill in pairs; verdict: Same page, two code paths..

**Narration and caption.** CSS.supports asks the browser about grid-template-columns subgrid. True: the page links subgrid-layout.css. False: the link does not change, and the default layout stays.

**Sources.** mdn-feature-detection-guide

## 4. Check that the member exists (32.8–44.8 s)

**On screen.** The expression if ("geolocation" in navigator) … else … with ""geolocation"", "navigator", "else" highlighted in turn and explained.

**Narration and caption.** The in operator asks if navigator has a geolocation member. If yes, the page uses the Geolocation API. If no, the else branch offers static maps.

**Sources.** mdn-feature-detection-guide

## 5. Polyfills run on your page (44.8–59.4 s)

**On screen.** A timeline reveals Feb 2024 → Script changed → 100K+ sites → Response.

**Narration and caption.** Some features cannot be tested, so you may load a polyfill. Its code runs on your page. In 2024, the polyfill.io domain was sold, and its script was changed to inject malware into more than 100,000 sites.

**Sources.** mdn-feature-detection-guide, sansec-polyfill-io-blog

## 6. Experimental features expire (59.4–73.4 s)

**On screen.** A timeline reveals Register → Get a token → Add the token → Trial expires.

**Narration and caption.** An origin trial lets your site use an experimental feature. You register, get a token, and add the token to your page. When the trial expires, the feature is gone, so keep the fallback.

**Sources.** chrome-origin-trials-docs

## 7. Detect, then branch (73.4–81.4 s)

**On screen.** Numbered steps appear one at a time: Test the feature → True: enhanced code → False: fallback code.

**Narration and caption.** Test the feature, run the enhanced path when it exists, and keep a working fallback when it does not.

**Sources.** mdn-feature-detection-guide
