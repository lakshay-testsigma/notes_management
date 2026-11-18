---
title: "Browser sniffing"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-18
---

# Browser sniffing

Browser sniffing means reading the user agent string to work out which browser is loading
the page, and then branching on that name. MDN calls it a terrible practice, because the
string lies and the branch can run on a browser that lacks the feature.

## Where it shows up

- [[mdn-feature-detection-how-to-learn-frontend]]

## My insights
