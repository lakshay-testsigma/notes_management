---
title: "React DOM"
topic: shared
stage: tech
tags: [tech]
created: 2026-11-18
---

# React DOM

React DOM is the package that renders React components into a browser. It turns the
element tree into HTML, and it mounts the tree with `createRoot` or hydrates server
markup with `hydrateRoot`. Zustand uses it in the server-side rendering test, where the
same markup is rendered on the server and then hydrated on the client.

## Where it shows up

- [[zustand-tech-and-services]]

## My insights
