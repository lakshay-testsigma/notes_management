---
title: "Connecting desktop Firefox DevTools to a phone over USB"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [firefox-devtools-user-docs]
---
# Connecting desktop Firefox DevTools to a phone over USB

**Workflow** · teaches Firefox and Safari DevTools

**Why this visual.** Learn the order of steps that attach desktop DevTools to a tab on an Android phone.

```mermaid
flowchart TD
  A[Phone: Developer options on] --> B[Phone: USB debugging on]
  B --> C[Firefox Android: Remote Debugging via USB]
  C --> D[Cable plugged in]
  D --> E[about:debugging: USB support on, refresh]
  E --> F[Phone: accept authorization]
  F --> G[Connect, then Inspect a tab]
```

## What it shows

You switch on USB debugging on the phone and in Firefox for Android, plug in the cable, and refresh the device list in about:debugging. After you accept the prompt on the phone and click Connect, the device and its tabs appear. Inspect attaches desktop DevTools to a tab.

Text alternative: Flowchart of seven steps: turn on Developer options and USB debugging on the phone, enable Remote Debugging via USB in Firefox for Android, plug in the cable, turn on USB support in about:debugging and refresh the device list, accept the authorization prompt on the phone, then Connect and Inspect a tab.

## Check yourself

What must you do on the phone after the cable is connected and the device list is refreshed?

Answer: Accept the authorization prompt, then click Connect in about:debugging.

## Sources

- Firefox DevTools User Docs — https://firefox-source-docs.mozilla.org/devtools-user/ (`firefox-devtools-user-docs`)

## Used in

- [[firefox-devtools-user-docs-browser-devtools-mastery]]

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
