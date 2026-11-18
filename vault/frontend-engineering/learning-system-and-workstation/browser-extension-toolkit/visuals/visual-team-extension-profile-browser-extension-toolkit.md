---
title: "A vetted team extension profile"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [mdn-webextensions-anatomy-docs, chrome-extensions-content-scripts-docs, chrome-declarativenetrequest-docs, react-devtools-docs, dequelabs-axe-core-repo, retirejs-repo, chrome-devtools-perf-overview-docs]
---
# A vetted team extension profile

**Architecture** · teaches A team extension profile, Design and CSS helper extensions, API and data extensions, Request header modification and mocking

**Why this visual.** Show how a team profile groups vetted extensions and which manifest permission each group asks for.

```mermaid
flowchart LR
  M["Manifest review"] -- "passes" --> P["Team profile"]
  P --> F["Framework panels"]
  P --> C["Audit checkers"]
  P --> D["Design helpers"]
  P --> R["Request rules"]
  P --> B["Built-in panels"]
  D -. "host access or activeTab" .-> M
  R -. "DNR permission" .-> M
```

## What it shows

Every candidate passes a manifest review before it joins the team profile. The profile has five groups: framework panels such as React DevTools, audit checkers such as axe-core and Retire.js, design helpers, request rules, and the built-in DevTools panels. Design helpers run content scripts, so they need host access or activeTab. Request rules use declarativeNetRequest, which needs its own permission. Built-in panels need no extension at all.

Text alternative: Flowchart: a manifest review leads to the team profile, which branches into five groups: framework panels, audit checkers, design helpers, request rules and built-in panels. Dotted lines send design helpers back to the review for host access or activeTab, and request rules back for the declarativeNetRequest permission, so the permission-heavy groups get the closest check.

## Check yourself

A CSS helper wants to change styles on every site you open. Which permission do you check before it joins the profile?

Answer: Its host access: a content script can read and change the DOM of every page its manifest matches. Narrow host access, or activeTab for injection on demand, fits the job better.

## Sources

- Anatomy of a WebExtension (MDN) — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension (`mdn-webextensions-anatomy-docs`)
- Content scripts (Chrome for Developers) — https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts (`chrome-extensions-content-scripts-docs`)
- chrome.declarativeNetRequest API reference — https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest (`chrome-declarativenetrequest-docs`)
- React docs set: React Developer Tools, and Render and Commit — https://react.dev/learn/react-developer-tools (`react-devtools-docs`)
- dequelabs/axe-core — https://github.com/dequelabs/axe-core (`dequelabs-axe-core-repo`)
- RetireJS/retire.js — https://github.com/RetireJS/retire.js (`retirejs-repo`)
- Performance features reference / overview (Chrome DevTools) — https://developer.chrome.com/docs/devtools/performance/overview (`chrome-devtools-perf-overview-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/07-team-toolkit-in-practice/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/07-team-toolkit-in-practice.mdx`)

Back to [[visuals-browser-extension-toolkit|all visuals]].

## My insights
