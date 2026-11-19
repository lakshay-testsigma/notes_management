---
title: "Base64 VLQ"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-19
---

# Base64 VLQ

A variable-length number code written with base64 characters. Each character holds 5 bits of the number plus a continuation bit, so small numbers take one character. Source maps use it to store the mappings compactly.

## Where it shows up

- [[ecma-426-source-map-browser-devtools-mastery]]
- [[devtools-frontend-tech-and-services]]

## My insights
