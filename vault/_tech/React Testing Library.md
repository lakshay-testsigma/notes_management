---
title: "React Testing Library"
topic: shared
stage: tech
tags: [tech]
created: 2026-11-18
---

# React Testing Library

React Testing Library renders React components into a fake DOM so a test can act like a
user: it queries by visible text and role, and it wraps state changes in `act` so the
render happens before the assertion. Zustand uses it to drive a store from a real
component and to count re-renders.

## Where it shows up

- [[zustand-tech-and-services]]

## My insights
