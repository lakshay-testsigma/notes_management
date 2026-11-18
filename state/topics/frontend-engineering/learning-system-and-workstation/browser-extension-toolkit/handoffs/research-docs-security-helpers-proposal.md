# Proposal: docs-security-helpers

## Sources and concept support
- extension-architecture-and-permissions: mdn-webextensions-anatomy-docs (sections: manifest.json, Background scripts, Sidebars/popups/options pages, Content scripts, Web accessible resources). Flagged brief + digest. Chrome permission warnings page was read (best practices, View warnings, Update permissions: an update that adds a warning permission disables the extension until accepted; activeTab gives temporary host access with no warning) but is not recorded as a source (quota).
- content-scripts-and-devtools-pages: chrome-extensions-content-scripts-docs (Isolated worlds, Inject scripts, Run time, Stay secure, Limits). Prerequisites: extension-architecture-and-permissions. Devtools pages are not covered by MDN anatomy; open question.
- headers-cookies-and-csp: mdn-csp-docs (Controlling resource loading, Clickjacking protection, Requiring trusted types, Testing your policy). Prerequisite: none. Set-Cookie not verified: open question.
- vulnerable-library-detection: retirejs-repo (README: CLI, Chrome/Firefox extension, Burp, ZAP). Prerequisites: security-privacy-extensions. Note: the Chrome extension is not in the Web Store.
- request-modification-and-mocking: https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest was read (block, redirect, modifyHeaders with append/set/remove; permissions declarativeNetRequest, ...WithHostAccess) but not recorded (quota). Recommend a follow-up unit to add it. Requestly/ModHeader not verified.
- extension-risk-and-vetting: supported by permission-warning facts above; OWASP guidance not verified.

## Open questions
- Design/CSS helpers (VisBug, CSS Peeper, WhatFont, ColorZilla, Pesticide, PerfectPixel, Responsive Viewer), api-data-extensions, ad-block-and-proxy-testing (uBlock Origin, FoxyProxy, Privacy Badger), team-extension-profile: no source verified here.
- Chrome architecture-overview and extension-overview URLs returned 404; devtools-extend page not read.

## Scope decision
Keep to 4 sources; add declarativeNetRequest and an official tool page in a later unit.
