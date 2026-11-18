# Proposal: docs-framework-perf

Sources added: react-devtools-docs (A), chrome-devtools-perf-overview-docs (A), redux-configure-store-docs (A).

## framework-devtools-extensions (parent)
- Child concepts: react-devtools-components-profiler, redux-devtools-time-travel, other-framework-devtools.
- Prerequisites: browser-extension (general), devtools-panels.
- What/why: react-devtools-docs section "Browser extension": extension adds Components and Profiler panels on React sites. Chrome, Firefox, Edge.
- Alternatives: section "Safari and other browsers": `npm install -g react-devtools`, run `react-devtools`, add `<script src="http://localhost:8097">` to head. Section "Mobile (React Native)": built-in React Native DevTools.
- Failure/limit: extension shows panels only on pages built with React (same section).

## react-devtools-components-profiler
- Source: react-devtools-docs, "Browser extension" and "Safari and other browsers". Panels are named Components and Profiler.
- Unverified: how the Profiler records commits and flame graph (open question; need react.dev blog/docs on profiling).
- Practical check: install extension, open a React site, confirm two new panels.

## redux-devtools-time-travel
- Source: redux-configure-store-docs, section on `devTools` option: enabled by default in configureStore; `false` disables; options object (name, trace, sanitizers). Manual setup uses `composeWithDevTools` from `@redux-devtools/extension`.
- Redux prior-art page (not added): time travel, record/replay work only if reducers do not mutate state.
- GitHub repo reduxjs/redux-devtools (read live, not added): MIT, 14.4k stars, last commit 2026-11-10; features "hot reloading, action replay, customizable UI"; extension, standalone app, React component. Repo adopters and archive state not verified, so rejected as source.
- Open: no read page names "time travel" jump/skip UI of the extension.
- Prerequisite: redux-store-reducers.

## other-framework-devtools
- Not covered by a verified source. Open: Vue, Angular, Svelte, Solid, Apollo, Preact, Module Federation devtools need official docs in a later unit.

## performance-extensions
- Source: chrome-devtools-perf-overview-docs. Sections "Observe Core Web Vitals live" (local LCP, CLS at once; INP after interaction; good/needs improvement/bad score), "Compare your experience to the experience of your users" (fetch CrUX field data), "Configure your environment to better match that of your users" (recommended screen size, throttling).
- Scope decision: the standalone Web Vitals extension is largely replaced by these Performance panel features (roadmap note). Verify the extension deprecation in a later unit; not verified here.
- Lighthouse: not covered here.

## react-scan-wasted-renders
- Read live (github.com/aidenybai/react-scan, not added): MIT, 21.9k stars; "automatically detecting and highlighting renders that cause performance issues"; no code changes needed (`npx -y react-scan@latest init`, npm or script tag); browser extension exists; README now recommends React Doctor. Recency not verified. Tier B repo not recorded.
- Open: how it detects renders; need README sections.

## crux-field-data-viewers
- Source read live (developer.chrome.com/docs/crux, not added): CrUX is Google's dataset of real Chrome user experience, covers Core Web Vitals; origins and pages need enough public visitors. 
- In chrome-devtools-perf-overview-docs: DevTools shows CrUX field data next to local metrics.
- Open: CrUX Vis, PageSpeed Insights, CrUX extensions; 75th percentile and 28-day window not found on read page.

## Rejected
- reduxjs/redux-devtools repo: CLI rejected (adopters unverified; gh API TLS failed).
- Chrome "performance" getting-started page: old content, no live metrics.
