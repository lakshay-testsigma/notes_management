---
title: "Which desktop inspector attaches to which phone browser"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-remote-debugging-docs, webkit-web-inspector-docs, firefox-devtools-user-docs]
---
# Which desktop inspector attaches to which phone browser

**Architecture** · teaches Remote device debugging, Firefox and Safari DevTools

**Why this visual.** Show that each phone browser pairs with one desktop inspector, and that each pair needs switches on both ends.

Interactive `SystemDiagram`. Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/11-firefox-safari-and-remote-devices/`. Run `npm run site:dev` first.

## What it shows

Three pairs: chrome://inspect attaches to Android Chrome over USB, the Safari Develop menu on a Mac attaches to iPhone Safari by cable or Xcode wireless debugging, and Firefox about:debugging attaches to Firefox for Android over USB. Clicking a node lists its setup steps. A device that does not appear usually misses one switch or prompt.

Text alternative: Three desktop inspectors each connect to one phone browser: chrome://inspect to Android Chrome by USB, Safari Develop menu to iPhone Safari by cable or Wi-Fi, about:debugging to Firefox Android by USB, so you pick the inspector by the phone's browser.

## Check yourself

A bug appears only in Safari on an iPhone. Which desktop tool do you open, and what must be on at both ends?

Answer: Safari's Develop menu on a Mac with Show features for web developers on, and Web Inspector on in the iPhone's Safari Advanced settings.

## Sources

- Get started with remote debugging Android devices — https://developer.chrome.com/docs/devtools/remote-debugging (`chrome-devtools-remote-debugging-docs`)
- Web Inspector Reference (WebKit) — https://webkit.org/web-inspector/ (`webkit-web-inspector-docs`)
- Firefox DevTools User Docs — https://firefox-source-docs.mozilla.org/devtools-user/ (`firefox-devtools-user-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/11-firefox-safari-and-remote-devices/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/11-firefox-safari-and-remote-devices.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
