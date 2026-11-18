---
title: "jshttp/cookie — takeaways"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: repo-intel
tags: [frontend-engineering, how-the-web-works, cookies]
sources: [jshttp-cookie-repo]
created: 2026-11-18
---

# jshttp/cookie — takeaways for the capstone

The capstone is "site network report CLI": a Node.js CLI that checks DNS, TLS, HTTP, caching, compression and cookies from saved data. These are the things worth borrowing for its cookie check.

1. **Write the cookie rules as one list, taken from the serializer.** Domain labels, Path without `;`, Max-Age as an integer, Expires in range, SameSite from a fixed set: each becomes one check in the report. From [[cookie-findings|finding 2]].
2. **Never throw on a bad header.** The report must read a messy HAR file and list the problem, so copy the lenient reader and report what it skipped. From [[cookie-findings|finding 1]] and [[cookie-pattern-strict-write-lenient-read]].
3. **Parse with `indexOf`, not `split`, if you want speed, and test the result on odd input first.** For a CLI, a clear loop is enough; borrow the idea only if a file is large. From [[cookie-pattern-single-pass-scan]].
4. **Report what a parser drops.** `parseSetCookie` silently ignores a bad `Max-Age` or `SameSite`, so the CLI should flag these as findings. From [[cookie-findings|finding 3]].
5. **Do not trust `Domain` and `Path` from a parsed header.** The reader copies them raw, so the CLI must check them against the rules. From [[cookie-findings|finding 3]].
6. **Test with real data and write the odd cases down.** Use saved HAR headers as fixtures and keep a test per odd case, as the project does with top-site headers. From [[cookie-findings|finding 9]].
7. **Add a fail-fast check to your own project.** A size limit or a policy test in the test command keeps the rule alive. From [[cookie-pattern-measured-performance]].

## What not to copy

- The hand-written trim and `indexOf` code: it is built for a hot path, and a CLI that reads one file gains little from it.
- Full supply-chain hardening (trusted publishing, Scorecard): it matters for a published package, and not for a learning project.

## My insights
