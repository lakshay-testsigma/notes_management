---
title: "How to learn frontend (and keep improving) — resources"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: resources
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-17
---

# How to learn frontend (and keep improving) — resources

Every source below was checked against a live page before it was recommended.

<!-- tutor:generated:start -->
**12 vetted sources.** Tier A is canonical (official docs, the defining paper, the standard book, the reference implementation). Tier B is strong and widely used.

## Official documentation

- **[Baseline: web platform feature availability](https://web.dev/baseline)** — Chrome team and external experts (web.dev); WebDX Community Group, 2026 · tier A
  - Why it is trusted: The web.dev page defining Baseline (Newly available when all core browsers support a feature, Widely available 30 months later), a status set by the WebDX Community Group.
  - Used for: digest, brief, lesson
  - Verified: 2026-11-17
  - Digest: [[web-dev-baseline-docs-how-to-learn-frontend|read the digest]]
- **[Can I use: About and support legend](https://caniuse.com/)** — Fyrd (Alexis Deveria), design by Lensco, 2026 · tier A
  - Why it is trusted: The project's own site for the caniuse browser support tables. Its About page (read live in a browser on 2026-11-17 and 2026-11-18; it answers HTTP 406 to command-line fetches) gives the legend: green supported, red not supported, greenish yellow partial, gray unknown; support data comes from the Fyrd/caniuse GitHub repository (verified via its API) and usage share from StatCounter GlobalStats.
  - Used for: lesson
  - Verified: 2026-11-17
- **[How to Contribute to Open Source (Open Source Guides)](https://opensource.guide/how-to-contribute/)** — GitHub (Open Source Guides), 2026 · tier A
  - Why it is trusted: GitHub's own Open Source Guides; its section 'Why contribute to open source?' says public contributions build a reputation and that teaching and learning go together; source repo github/opensource.guide has 15805 stars, last push 2026-11-16.
  - Used for: brief, lesson
  - Verified: 2026-11-17
- **[Implementing feature detection (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing/Feature_detection)** — Mozilla contributors, 2025 · tier A
  - Why it is trusted: MDN Web Docs, the cross-browser reference maintained by Mozilla and partners; this guide covers @supports, CSS.supports(), the in operator and undetectable features.
  - Used for: digest, brief, lesson
  - Verified: 2026-11-17
  - Digest: [[mdn-feature-detection-guide-how-to-learn-frontend|read the digest]]
- **[MDN Curriculum: front-end developer skills](https://developer.mozilla.org/en-US/curriculum/)** — Mozilla (MDN Web Docs), 2026 · tier A
  - Why it is trusted: Mozilla's own free, self-paced curriculum on developer.mozilla.org that lists the essential front-end skills, refined with input from educators and the web community.
  - Used for: brief, lesson
  - Verified: 2026-11-17
- **[Origin trials (Chrome for Developers)](https://developer.chrome.com/docs/web-platform/origin-trials)** — Google Chrome team, 2026 · tier A
  - Why it is trusted: The Chrome team's own documentation of the origin trial program, including registration, tokens and expiry.
  - Used for: lesson
  - Verified: 2026-11-17
- **[State of JavaScript 2025 survey results](https://2025.stateofjs.com/en-US/)** — Devographics, 2026 · tier B
  - Why it is trusted: Annual open survey run by Devographics (13,002 responses, Sept 24 to Nov 10 2025, published Feb 3 2026); its About page states it is a snapshot of a self-selected subset, so use it for trends, not as proof of usage.
  - Used for: brief, lesson
  - Verified: 2026-11-17

## Repositories

- **[browserslist/browserslist](https://github.com/browserslist/browserslist)** — Browserslist organization, 2026 · tier A
  - Why it is trusted: The project itself: the shared config of target browsers that front-end tools read; MIT, 13.6k stars, pushed 2026-11-16, and its README names Autoprefixer, Babel preset-env, postcss-preset-env and eslint-plugin-compat as users.
  - Used for: lesson
  - Verified: 2026-11-17
- **[mdn/browser-compat-data](https://github.com/mdn/browser-compat-data)** — MDN (Mozilla and the MDN community), 2026 · tier A
  - Why it is trusted: The machine-readable browser compatibility dataset behind MDN browser-support tables, which the Baseline data in web-platform-dx/web-features is computed from; CC0-1.0 data; stars 5794 in the specialised niche of web-platform compatibility data (tier A niche bar is 2000). Used by MDN, caniuse, WebStorm per its README.
  - Used for: repo-intel, lesson
  - Verified: 2026-11-17
- **[preactjs/preact](https://github.com/preactjs/preact)** — Preact team, 2026 · tier A
  - Why it is trusted: The project itself: the Preact UI library, a React-compatible library with a compact source; MIT license; 39009 stars; the official We-are-using page names production adopters.
  - Used for: lesson
  - Verified: 2026-11-17

## Engineering blogs

- **[Polyfill supply chain attack hits 100K+ sites](https://sansec.io/research/polyfill-supply-chain-attack)** — Sansec Forensics Team, 2024 · tier B
  - Why it is trusted: Sansec is the security firm that published the first forensic analysis of the 2024 polyfill.io supply-chain attack, with dated updates; it is used here only as evidence of that failure, not as a production-practice source.
  - Used for: lesson
  - Verified: 2026-11-17

## Standards

- **[The TC39 Process](https://tc39.es/process-document/)** — TC39 (Ecma International), 2026 · tier A
  - Why it is trusted: Published by TC39 on its own domain; it defines Stages 0 to 4 that every JavaScript proposal passes, and Stage 4 requires two compatible implementations passing Test262.
  - Used for: lesson
  - Verified: 2026-11-17
<!-- tutor:generated:end -->

## My insights
