---
title: "Visuals of Browser extension toolkit (install once, used across phases)"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
---
# Visuals of Browser extension toolkit (install once, used across phases)

Every diagram, simulation and video of this topic, with the concepts it teaches and the sources behind it. Open one, answer its check question, then read the explanation.

- [[concept-map-browser-extension-toolkit|Concept map]] — how the concepts of this topic depend on each other

## Architecture

- [[visual-how-it-works-browser-extension-toolkit|How a browser extension reaches the page]] — Show which part of an extension touches the page and why the manifest permissions decide what it can see.
- [[visual-mdn-webextensions-anatomy-docs-mechanism-browser-extension-toolkit|Parts of a WebExtension and who talks to whom]] — Show the parts that manifest.json can declare and which of them touch the page.
- [[visual-axe-core-module-map-browser-extension-toolkit|axe-core module map]] — Show the six analyzed parts of axe-core and which part calls which.
- [[visual-team-extension-profile-browser-extension-toolkit|A vetted team extension profile]] — Show how a team profile groups vetted extensions and which manifest permission each group asks for.

## Workflow

- [[visual-google-js-seo-basics-docs-mechanism-browser-extension-toolkit|How Google crawls, renders and indexes a JavaScript page]] — Show that Google indexes the rendered HTML, so a tool must show you the page after JavaScript ran.
- [[visual-framework-devtools-fallback-browser-extension-toolkit|What React DevTools and Redux DevTools read]] — Show in one static picture where each framework devtools extension gets its data, for readers without JavaScript.
- [[visual-seo-read-points-browser-extension-toolkit|Where the crawler and each SEO tool read the page]] — Show that the source HTML and the rendered DOM are different stages, and that each tool reads only one of them.

## Sequence

- [[visual-axe-core-request-flow-browser-extension-toolkit|One axe.run call from start to report]] — Show how one scan moves through the engine and where a check can answer 'cannot tell'.

## Video

- [[visual-framework-devtools-lab-guided-browser-extension-toolkit|Framework devtools show components and store actions]] — See what the React DevTools panels let you change and how a dispatched Redux action reaches the store and the Redux DevTools extension. · video storyboard
- [[visual-a11y-checks-walkthrough-browser-extension-toolkit|Pass, fail or incomplete: contrast and heading checks]] — See how an automated accessibility check decides pass, fail or incomplete for color contrast and heading order, and what it leaves for a person. · video storyboard

## Interactive experiences

- [[visual-framework-devtools-lab-browser-extension-toolkit|Edit props and dispatch actions with framework devtools]] — Predict what React DevTools lets you change and what the Redux store and DevTools extension hold after a dispatched action. · Interactive video lesson (Mode B)
- [[visual-a11y-checks-lab-browser-extension-toolkit|Change colors and headings, predict the accessibility check]] — Predict whether an automated contrast or heading-order check passes, fails or returns incomplete, and name what a person must still review. · Interactive video lesson (Mode B)
- [[visual-security-pass-deck-browser-extension-toolkit|Choose the check for each security symptom]] — Pick the tool that can see each security symptom of a page and order a quick security pass. · Branching presentation (Mode C)

## Flowchart

- [[visual-a11y-check-outcomes-browser-extension-toolkit|Pass, fail or incomplete for contrast and heading checks]] — Show how an automated contrast or heading check reaches pass, fail or incomplete, and what stays for a person.

## Branching presentations

- [[visual-security-pass-slides-browser-extension-toolkit|Pick the right tool for each security symptom]] — Choose the right check for three security symptoms of a page (an old library, a missing CSP header, an extension that asks for every site) and put the checks in one quick order. · deck built

## Data flow

- [[visual-mini-01-flow-browser-extension-toolkit|Extension permission audit flow]] — Show how manifest files and a JSON policy become a verdict per extension.
- [[visual-mini-02-flow-browser-extension-toolkit|Release a11y and SEO check flow]] — Show how saved pages become findings with three outcomes and a CI exit code.

## My insights
