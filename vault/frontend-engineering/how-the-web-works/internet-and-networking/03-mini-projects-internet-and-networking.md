---
title: "Internet & networking — mini projects"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: mini-projects
tags: [frontend-engineering, how-the-web-works]
created: 2026-11-18
---

# Internet & networking — mini projects

## How to use these projects

Do the projects in order. Each one removes some guidance: the first tells you what to
write, the last tells you only what must work. Start in the `starter/` folder, run the
tests, and make them pass. Open `solution/` only after your tests pass or after you have
used the hints. Read the [[02-lesson-internet-and-networking|lesson]] first. None of them
needs a network connection: tests use stubs and fixture files.

## Projects

| # | Project | Real use case | Time | Guidance | Open |
|---|---------|---------------|------|----------|------|
| 1 | DNS record inspector | A developer moving a site to a new host checks the A, AAAA, CNAME, CAA and HTTPS records and their TTLs before switching nameservers | 2 h | guided | `projects/frontend-engineering/how-the-web-works/internet-and-networking/mini-01-dns-record-inspector/README.md` |
| 2 | Cache header auditor | A frontend team checks that hashed assets are immutable and HTML revalidates, by grading Cache-Control, ETag, Vary and Content-Encoding from a HAR file | 2 h | less guided | `projects/frontend-engineering/how-the-web-works/internet-and-networking/mini-02-cache-header-auditor/README.md` |
| 3 | Cookie attribute linter | A security reviewer reads the Set-Cookie headers of a login flow and flags missing Secure, HttpOnly or SameSite and broken `__Host-` prefixes | 3 h | independent | `projects/frontend-engineering/how-the-web-works/internet-and-networking/mini-03-cookie-attribute-linter/README.md` |

## What each project proves

- **Project 1** proves that record types and TTLs are a migration decision: a low TTL before the switch makes a mistake short. The resolver is injected, so tests run without live DNS. How it runs: [[visual-mini-01-flow-internet-and-networking]].
- **Project 2** proves that caching is set per kind of file: hashed assets get a long lifetime and HTML revalidates. It parses Cache-Control strictly, as undici does, and keeps the most restrictive repeated value. How it runs: [[visual-mini-02-flow-internet-and-networking]].
- **Project 3** proves that cookie safety lives in attributes and prefixes. The parser is lenient and the rules are strict, the same split jshttp/cookie uses. How it runs: [[visual-mini-03-flow-internet-and-networking]].

## My insights
