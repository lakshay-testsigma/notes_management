# Research proposal: repos unit

## Chosen repository
dequelabs/axe-core (id dequelabs-axe-core-repo), tier A, use_for repo-intel + lesson.
Verified 2026-11-18 via api.github.com: not archived, MPL-2.0, pushed 2026-11-17, 7849 stars, default branch develop.
Adopters read at doc/projects.md (develop): Deque axe DevTools and axe Chrome/Firefox extensions; community Lighthouse, Accessibility Insights for Web, Webhint, Cypress-axe, Storybook a11y, Jest-axe.

## Suggested four slices for repo-intel (from lib/ listing)
1. lib/core: run entry, context, frame messaging (axe.run, iframes via postMessage).
2. lib/rules: rule JSON, which checks each rule combines.
3. lib/checks and lib/commons: check functions and shared helpers.
4. doc/API.md plus doc/projects.md: public API, configure, adopters.
Line numbers and short SHA are for repo-intel to pin.

## Concept support
- automated-a11y-rule-limits: doc/API.md says axe does not test hidden regions; some results are "incomplete" and need manual review. Claim "automated finds only a share" is NOT stated in API.md; unresolved, needs a docs source.
- extension-architecture-and-permissions / content-scripts-and-devtools-pages: axe must be injected in the page and each iframe; axe.configure does not reach iframes; default frame communication is window.postMessage (doc/API.md). This is a content-script-style injection fact; axe-core itself is an engine, not an extension. The extension source itself is not verified here.
- framework-devtools-extensions, team-extension-profile: not supported by this repo. Gap for another unit (react-devtools or an engineering blog).

## Dropped / not done
- Optional engineering blog: not added (budget; none verified).
- gh CLI failed with a TLS error in the sandbox; API data read through WebFetch of api.github.com instead.
- Not opened: facebook/react devtools, redux-devtools, web-vitals-extension.
