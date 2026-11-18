# Visual candidates (merged from research units)

## from visual-candidates-docs-a11y-seo.md
- sequence | crawl -> render -> index (Google processes JavaScript) | google-js-seo-basics-docs "How Google processes JavaScript" | candidate for Video
- comparison | permanent redirect shows target; temporary redirect shows source page in results | google-redirects-docs "Overview of redirect types" | candidate for CompareView
- decision | server-side redirect vs meta refresh vs JavaScript redirect (preference order) | google-redirects-docs "Server-side redirects", "meta refresh", "JavaScript location redirects" | branch for a deck
- parameter | meta refresh delay 0 s = permanent, delayed = temporary | google-redirects-docs "meta refresh" | experiment for an interactive experience
- number | normal text 4.5:1, large text 3:1 (18pt or 14pt bold), AA | w3c-wcag22-understanding-contrast-minimum "Success Criterion" | candidate for contrast slider
- parameter | foreground/background colours change the ratio; 4.499:1 fails, no rounding | w3c-wcag22-understanding-contrast-minimum "Notes on formula" | experiment for an interactive experience
- comparison | automated checks vs manual evaluation coverage | w3c-wai-selecting-evaluation-tools "What Evaluation Tools Can Do and Can Not Do" | candidate for CompareView

## from visual-candidates-docs-framework-perf.md
- comparison | local live metrics vs CrUX field data for LCP, CLS, INP | chrome-devtools-perf-overview-docs "Compare your experience to the experience of your users" | candidate for CompareView
- sequence | install react-devtools standalone, run it, add script to head, reload page | react-devtools-docs "Safari and other browsers" | candidate for Video
- decision | extension vs standalone react-devtools vs React Native DevTools by environment | react-devtools-docs sections "Browser extension", "Safari and other browsers", "Mobile (React Native)" | branch for a deck
- parameter | devTools option true/false/object changes store connection to the extension | redux-configure-store-docs devTools option | experiment for an interactive experience
- state change | INP appears only after a user interaction | chrome-devtools-perf-overview-docs "Observe Core Web Vitals live" | candidate for Video

## from visual-candidates-docs-security-helpers.md
- comparison | static declaration vs dynamic registerContentScripts vs programmatic executeScript (host permission or activeTab needed) | chrome-extensions-content-scripts-docs §Inject scripts | candidate for CompareView
- parameter | run_at: document_start, document_end, document_idle (default) | chrome-extensions-content-scripts-docs §Run time | experiment for an interactive experience
- dependency | page and content script share only the DOM, talk via window.postMessage; other APIs via messaging | chrome-extensions-content-scripts-docs §Communication with the embedding page | candidate for Diagram
- architecture | manifest.json, background scripts, content scripts, popups, sidebars, options pages | mdn-webextensions-anatomy-docs §manifest.json to Web accessible resources | candidate for Diagram
- comparison | CSP via HTTP header vs meta element (meta lacks some features; report-only cannot use meta) | mdn-csp-docs §CSP overview | candidate for CompareView
- decision | nonce/hash strict CSP vs allowlist | mdn-csp-docs §Strict CSP | branch for a deck

## from visual-candidates-gap-01.md
- comparison | six rule actions: block, redirect, allow, upgradeScheme, modifyHeaders, allowAllRequests | chrome-declarativenetrequest-docs, RuleActionType | candidate for CompareView
- comparison | modifyHeaders ops: set replaces, append adds (allowlisted request headers), remove deletes all | chrome-declarativenetrequest-docs, Header modification | candidate for CompareView
- number | 5,000 session rules; 30,000 dynamic safe rules; 50 enabled static rulesets | chrome-declarativenetrequest-docs, Rule limits | candidate for a key-number card
- decision | declarativeNetRequest (install warning) vs declarativeNetRequestWithHostAccess (host permission needed) | chrome-declarativenetrequest-docs, Permissions | branch for a deck
- decision | soft 404 in SPA: JavaScript redirect to a URL that returns 404 | google-js-seo-basics-docs, "Avoid soft 404 errors in single-page apps" | branch for a deck

## from visual-candidates-repos.md
- architecture | axe-core lib split: core, checks, rules, commons, standards, gather-internals, misc | dequelabs-axe-core-repo, lib/ directory listing | candidate for Diagram
- dependency | page under test and each iframe must include axe; results flow between frames by window.postMessage | dequelabs-axe-core-repo, doc/API.md (iframe section) | candidate for Diagram
- parameter | allowedOrigins decides whether cross-origin frames share results (default same-origin only) | dequelabs-axe-core-repo, doc/API.md | experiment for interactive
- number | frameWaitTime default 60000 ms | dequelabs-axe-core-repo, doc/API.md | key number
- comparison | rule results: violations vs incomplete (needs manual review) | dequelabs-axe-core-repo, doc/API.md results | candidate for CompareView
