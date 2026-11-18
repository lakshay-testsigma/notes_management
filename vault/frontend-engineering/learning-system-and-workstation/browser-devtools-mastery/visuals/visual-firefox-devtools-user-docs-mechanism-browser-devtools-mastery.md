---
title: "Connecting desktop Firefox DevTools to a phone over USB"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [firefox-devtools-user-docs]
---
# Connecting desktop Firefox DevTools to a phone over USB

**Workflow** · teaches Remote device debugging, Firefox and Safari DevTools

**Why this visual.** Learn the order of steps that attach desktop DevTools to a tab on an Android phone.

```mermaid
flowchart LR
  A[Phone: Developer options and USB debugging on] --> B[Firefox Android: Remote Debugging via USB on]
  B --> C[Cable plugged in, adb installed]
  C --> D[about:debugging Setup tab: Refresh devices]
  D --> E[Authorize computer on the phone]
  E --> F[Device listed with its open tabs]
  F --> G[Click Inspect: DevTools attach to the tab]
```

## What it shows

You switch on USB debugging on the phone and in Firefox for Android, plug in the cable, and refresh devices in about:debugging. After you authorize the computer on the phone, the device and its open tabs appear. Inspect attaches DevTools to the tab.

Text alternative: Flowchart of seven steps: enable Developer options and USB debugging on the phone, enable Remote Debugging via USB in Firefox for Android, connect the cable with adb installed, Refresh devices in about:debugging, authorize the computer on the phone, see the device with its tabs, click Inspect.

## Check yourself

What must you do on the phone after you click Refresh devices?

Answer: Authorize the computer, so the device then appears with its open tabs.

## Sources

- Firefox DevTools User Docs — https://firefox-source-docs.mozilla.org/devtools-user/ (`firefox-devtools-user-docs`)

## Used in

- [[firefox-devtools-user-docs-browser-devtools-mastery]]

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
