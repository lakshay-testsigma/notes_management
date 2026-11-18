---
title: "Choose the check for each security symptom"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [retirejs-repo, mdn-csp-docs, chrome-extensions-content-scripts-docs]
---
# Choose the check for each security symptom

**Interactive experiences** · teaches Security and privacy extensions, Vulnerable library detection, Security headers and CSP inspection

**Why this visual.** Pick the tool that can see each security symptom of a page and order a quick security pass.

**Branching presentation (Mode C)** · level intermediate · modes Deep dive, Practice.

Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/06-security-privacy-extensions/`. Run `npm run site:dev` first.

## Parts

- Branching deep dives: [[visual-security-pass-slides-browser-extension-toolkit|security-pass-slides]]
- Static fallback: [[visual-how-it-works-browser-extension-toolkit|how-it-works]]

Lesson definition: `projects/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/experiences/security-pass-deck/experience.json` (rebuild with `tutor experience frontend-engineering/learning-system-and-workstation/browser-extension-toolkit build security-pass-deck`).

## Checkpoints

- **verify.** The page loads jQuery from an old file. Which check tells you whether that version has known vulnerabilities? Answer: Scan the page with Retire.js. Retire.js detects the library and its version and compares it with a list of versions that have known vulnerabilities. The Elements panel shows the tag but has no vulnerability data.
- **verify.** A helper extension asks for access to all sites. What can its content scripts do? Answer: Read and change the DOM of every page you open. Match patterns in the manifest choose the pages a content script runs in. A content script reads and changes the DOM of each matching page, so access to all sites means every page.

Needs first: Extension risk and vetting.

## What it shows

Choose a path through the deck and open the deep dives. Pick the tool that can see each security symptom of a page and order a quick security pass.

Text alternative: A branching deck shows three security symptoms of one page: an old library version, a missing Content-Security-Policy header, and a helper extension that asks for access to all sites. Each deep dive shows what a weak check misses and what the right check shows: Retire.js, the response headers, or the extension manifest. The deck ends with one order for a quick pass.

## Check yourself

The page loads jQuery from an old file. Which check tells you whether that version has known vulnerabilities?

Answer: Scan the page with Retire.js. Retire.js detects the library and its version and compares it with a list of versions that have known vulnerabilities. The Elements panel shows the tag but has no vulnerability data.

## Sources

- RetireJS/retire.js — https://github.com/RetireJS/retire.js (`retirejs-repo`)
- Content Security Policy (CSP) (MDN) — https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP (`mdn-csp-docs`)
- Content scripts (Chrome for Developers) — https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts (`chrome-extensions-content-scripts-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/06-security-privacy-extensions/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/06-security-privacy-extensions.mdx`)

Back to [[visuals-browser-extension-toolkit|all visuals]].

## My insights
