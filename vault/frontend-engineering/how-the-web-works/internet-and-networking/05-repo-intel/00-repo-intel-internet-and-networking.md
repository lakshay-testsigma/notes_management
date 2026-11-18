---
title: "Internet & networking — repository deep dive"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: repo-intel
tags: [frontend-engineering, how-the-web-works]
created: 2026-11-18
sources: [jshttp-cookie-repo, nodejs-undici-repo]
---

# Internet & networking — repository deep dive

How production codebases implement this topic. Read the small repository first, then the
large one. Read the notes of a repository in the order shown.

## jshttp/cookie

The cookie library under Express and many Node.js frameworks: it parses the `Cookie` request header and builds and parses `Set-Cookie` lines. It is small, so you can see every rule. Commit a437ef0.

1. [[cookie-overview|Overview]]
2. [[cookie-architecture|Architecture]]
3. [[cookie-findings|Findings]] — the writer is strict and the reader is lenient, and every `Set-Cookie` attribute is checked to block header injection
4. [[cookie-tech-and-services|Technologies and services]]
5. [[cookie-takeaways|Takeaways for the capstone]]

Modules: [[cookie-module-cookie-header|cookie-header]], [[cookie-module-set-cookie-serialize|set-cookie-serialize]], [[cookie-module-set-cookie-parse|set-cookie-parse]], [[cookie-module-build-and-infra|build-and-infra]]

Patterns: [[cookie-pattern-strict-write-lenient-read|strict write, lenient read]], [[cookie-pattern-single-pass-scan|single-pass scan]], [[cookie-pattern-measured-performance|measured performance]]

## nodejs/undici

The HTTP client inside Node.js: it powers the global `fetch()`. It negotiates HTTP/1.1 or HTTP/2 with ALPN, implements an RFC 9111 cache, follows redirects and parses cookies. Commit 011d947.

1. [[undici-overview|Overview]]
2. [[undici-architecture|Architecture]]
3. [[undici-findings|Findings]] — the cache follows a freshness ladder, ALPN order is a setting, and credentials are stripped on cross-origin redirects
4. [[undici-tech-and-services|Technologies and services]]
5. [[undici-takeaways|Takeaways for the capstone]]

Modules: [[undici-module-http-versions-dispatcher|http-versions-dispatcher]], [[undici-module-fetch-and-compression|fetch-and-compression]], [[undici-module-cache-semantics|cache-semantics]], [[undici-module-cache-tests|cache-tests]], [[undici-module-cookies|cookies]], [[undici-module-build-and-infra|build-and-infra]]

Patterns: [[undici-pattern-fail-closed-parsing|fail-closed parsing]], [[undici-pattern-bounded-resources|bounded resources]], [[undici-pattern-best-effort-cache|best-effort cache]]

Back to the map: [[00-start-here-internet-and-networking|Start here]].

## My insights
