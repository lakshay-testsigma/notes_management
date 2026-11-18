# Test the feature, then pick a code path

A page tests a feature before it uses it. The @supports rule tests CSS in CSS, CSS.supports runs the same test in JavaScript, and the in operator checks that an object such as navigator has a member such as geolocation. A true answer runs the enhanced code, a false answer runs the fallback code. Some features cannot be tested, so pages load polyfills, and the polyfill.io takeover in 2024 shows that third-party polyfill code runs with your page. Origin trials turn an experimental feature on with a token until the trial expires, so the fallback must stay.

**00:00 Test the feature, not the browser.** Your code asks one question: can this browser do it? The answer picks the enhanced code or the fallback code.

**00:08 Three ways to ask.** The screen shows three feature tests. The @supports rule tests CSS inside CSS. CSS.supports runs the same test in JavaScript. The in operator checks an object member.

**00:20 One test, two layouts.** CSS.supports asks the browser about grid-template-columns subgrid. True: the page links subgrid-layout.css. False: the link does not change, and the default layout stays.

**00:32 Check that the member exists.** The in operator asks if navigator has a geolocation member. If yes, the page uses the Geolocation API. If no, the else branch offers static maps.

**00:44 Polyfills run on your page.** Some features cannot be tested, so you may load a polyfill. Its code runs on your page. In 2024, the polyfill.io domain was sold, and its script was changed to inject malware into more than 100,000 sites.

**00:59 Experimental features expire.** An origin trial lets your site use an experimental feature. You register, get a token, and add the token to your page. When the trial expires, the feature is gone, so keep the fallback.

**01:13 Detect, then branch.** Test the feature, run the enhanced path when it exists, and keep a working fallback when it does not.

Sources:

- Implementing feature detection (MDN) — https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing/Feature_detection
- Polyfill supply chain attack hits 100K+ sites — https://sansec.io/research/polyfill-supply-chain-attack
- Origin trials (Chrome for Developers) — https://developer.chrome.com/docs/web-platform/origin-trials
