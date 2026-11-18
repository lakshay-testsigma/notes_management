# Visual candidates — how-to-learn-frontend

Merged from research units. Only lines with a source id and section. Drawn relationships must come from here, digests, or repo-intel evidence.

## From discovery-01-browser-support
- sequence | Limited availability -> Newly available (all core browsers support) -> Widely available (30 months later) | web-dev-baseline-docs, Baseline status section | candidate for Video
- number | 30 months from newly interoperable date to Widely available | web-dev-baseline-docs, Widely available definition | experiment for an interactive timeline
- dependency | core browsers set: Chrome desktop+Android, Edge, Firefox desktop+Android, Safari macOS+iOS | web-dev-baseline-docs, core browsers | candidate for a diagram
- decision | feature detected in browser? run enhanced code, else run fallback code | mdn-feature-detection-guide, "The concept of feature detection" (geolocation example) | branch for a deck
- comparison | @supports (CSS) vs CSS.supports() (JS) vs "x in object" (JS member check) | mdn-feature-detection-guide, "Writing your own feature detection tests" | candidate for CompareView
- parameter | @supports not/and/or condition changes whether rule applies | mdn-feature-detection-guide, "@supports" | experiment for an interactive
- sequence | register for trial -> get token -> add token via meta/header/JS -> trial expires -> feedback to renew | chrome-origin-trials-docs, How it works | candidate for Video
- sequence | polyfill.io domain sold Feb 2024 -> malware injected -> 100K+ sites affected -> Cloudflare rewrite, Namecheap hold | sansec-polyfill-io-blog, article and updates | candidate for Video

## From discovery-01-code-and-repos
- dependency | web-features Baseline status computed from @mdn/browser-compat-data support data | web-features docs/baseline.md (Baseline criteria, "as reported by ... @mdn/browser-compat-data") | candidate for Diagram
- architecture | BCD feeding MDN, caniuse, caniuse-lite, WebStorm, JSR, eslint-plugin-compat | mdn-browser-compat-data-repo README "Projects using the data" | candidate for Diagram
- sequence | BCD test script: format then lint then unittest | mdn-browser-compat-data-repo package.json scripts.test | candidate for Diagram
- number | Preact adopters list and 39009 stars, 3 kB claim not recorded | preactjs-preact-repo preactjs.com/about/we-are-using | none

## From discovery-01-learning-habits
- sequence | Stage 0 Strawperson → 1 Proposal → 2 Draft → 3 Candidate → 4 Finished | tc39-process-document stage table | candidate for Video or OrderSteps
- number | Stage 4 needs 2 compatible implementations passing Test262 | tc39-process-document Stage 4 criteria | key number for the stage diagram
- comparison | Limited availability vs Newly available vs Widely available | web-dev-baseline-docs Baseline definitions | candidate for CompareView
- number | Widely available = 30 months after Newly available | web-dev-baseline-docs | parameter (time since all browsers support) for an interactive
- decision | ship now / use fallback depending on Baseline status | web-dev-baseline-docs (status meanings only; the decision itself is the plan's) | branch for a deck
- number | 13,002 responses, Sept 24 to Nov 10 2025 | stateofjs-2025-survey About page | key number for survey-bias lesson

## From discovery-02-habits-and-code

## From discovery-02-support-tooling
- comparison | caniuse legend: green supported / red not supported / greenish yellow partial / gray unknown | caniuse-docs, About "Legend" | candidate for a legend diagram
- dependency | Browserslist config shared by Autoprefixer, Babel preset-env, postcss-preset-env, eslint-plugin-compat | browserslist-browserslist-repo, README "Tools" | candidate for architecture diagram
- comparison | progressive enhancement (baseline for all, best for modern) vs graceful degradation (modern first, fall back) | MDN Glossary Progressive enhancement and Graceful degradation | candidate for CompareView
- sequence | TC39 stage 2 -> 2.7 (validation) -> 3 | tc39-process-document, stage table | candidate for a stage ladder
- parameter | Browserslist query changes the target browser list | browserslist-browserslist-repo, README default query | experiment for an interactive
