---
title: "Web Storage API"
topic: shared
stage: tech
tags: [tech]
created: 2026-11-18
---

# Web Storage API

The Web Storage API is the browser feature behind `localStorage` and `sessionStorage`. It
stores strings under string keys, and the data stays in the browser until the user
clears it. Zustand uses `window.localStorage` as the default place to save the store,
and it wraps it so the value is stored as JSON.

## Where it shows up

- [[zustand-tech-and-services]]

## My insights
