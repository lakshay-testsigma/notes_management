# Research gap-01 proposal

## Added source
- chrome-declarativenetrequest-docs (tier A, official-docs, use_for lesson). Read at the live page on 2026-11-18.
- Sections read: Permissions, Rules and rulesets, Rule evaluation, Rule limits, Header modification.

## Concept: request-modification-and-mocking (parent: api-data-extensions)
Prerequisites: http-headers, extension-manifest.
- Action types (RuleActionType): block, redirect, allow, upgradeScheme, modifyHeaders, allowAllRequests.
- modifyHeaders operations: set replaces same-name headers; append adds an entry (request append only for a fixed allowlist such as cookie, user-agent, accept-language); remove deletes all entries of the header.
- Permissions: declarativeNetRequest (install-time warning; allows allow/allowAllRequests/block); declarativeNetRequestWithHostAccess (no warning, needs host permissions); declarativeNetRequestFeedback (getMatchedRules, onRuleMatchedDebug, unpacked extensions only).
- Limits: 100 static rulesets (50 enabled); at least 30,000 guaranteed static rules; 5,000 session rules; 30,000 dynamic safe rules, 5,000 unsafe; 1,000 regex rules per type, each under 2 KB.
- Scope decision: teach ModHeader/Requestly as examples of this declarative mechanism. The page does not name those tools, so do not claim they use it from this source. Unresolved: no verified source for JSON viewers or GraphQL inspectors; teach them as tools to try, not as sourced claims.

## Concept: design-css-helper-extensions
- ProjectVisBug (https://github.com/GoogleChromeLabs/ProjectVisBug), read via github.com page (the gh API failed with a TLS error): owner GoogleChromeLabs, ARCHIVED by owner on Sep 15, 2026 (read-only), license Apache-2.0, 5.8k stars, last commit date not shown.
- Decision: not added (source cap reached, and archived, so it fails repo-intel). Mention only as a historical tool with an archived warning. CSS Peeper, WhatFont, ColorZilla, Pesticide, PerfectPixel, Responsive Viewer: unverified, no claims.

## SEO redirects and status codes
google-js-seo-basics-docs covers them. Sections: "Use meaningful HTTP status codes" ("Googlebot uses HTTP status codes to find out if something went wrong"; status codes can tell Googlebot a page moved) and "Avoid soft 404 errors in single-page apps" (use a JavaScript redirect to a URL where the server answers 404). The page has no dedicated redirect section. Full headings: How Google processes JavaScript; unique titles and snippets; canonical URL; compatible code; status codes; History API vs fragments; rel=canonical injection; robots meta; long-lived caching; structured data; web components; images and lazy loading.
