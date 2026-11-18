---
title: "Decide which cookies a request carries"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: visual
tags: [frontend-engineering, how-the-web-works, visual]
created: 2026-11-18
sources: [mdn-http-docs, whatwg-url-standard, nodejs-undici-repo]
---
# Decide which cookies a request carries

**Interactive experiences** · teaches Cookies, Set-Cookie attributes and SameSite, Cookie prefixes and partitioned cookies (CHIPS), First-party and third-party cookies

**Why this visual.** Predict which stored cookies a request carries from Domain, Path, Secure and SameSite, and say what HttpOnly and the __Host- prefix change.

**Interactive video lesson (Mode B)** · level intermediate · modes Explore, Guided, Practice.

Open it on the lesson site: `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/10-cookies/`. Run `npm run site:dev` first.

## Parts

- Guided walkthrough (HyperFrames composition): [[visual-cookie-send-walkthrough-internet-and-networking|cookie-send-walkthrough]]
- Simulation: `AlgorithmStepper` with named presets
- Static fallback: [[visual-cookie-send-checks-internet-and-networking|cookie-send-checks]]

Lesson definition: `projects/frontend-engineering/how-the-web-works/internet-and-networking/experiences/cookie-send-lab/experience.json` (rebuild with `tutor experience frontend-engineering/how-the-web-works/internet-and-networking build cookie-send-lab`).

## Checkpoints

- **predict.** A form on news.other.org sends POST to shop.example.com/account/pay. Which of the five cookies does the request carry? Answer: Only widget (SameSite=None). Lax allows a cross-site request only when it is a top-level navigation with a safe method. POST is not safe, so the Lax cookies stay home and Strict never goes cross-site. SameSite=None allows every request, so widget goes.
- **experiment.** Load the form POST case and step through the checks. Which check removes the Lax cookies? Domain, Path and Secure keep all five cookies, because the URL is https on shop.example.com under /account. Only the SameSite check removes cookies here: Strict and Lax both stay home on a cross-site POST.
- **predict.** A link on shop.example.com opens blog.example.com. Does the host-only __Host-sid cookie go with the request? Answer: No, a host-only cookie goes only to shop.example.com. Domain decides which hosts receive a cookie. Without Domain the cookie is host-only, so blog.example.com never gets __Host-sid. SameSite is a separate check that only removes cookies; it never adds a host.
- **verify.** Page JavaScript calls fetch('/account/orders') on the same site. What happens to the HttpOnly cookie __Host-sid? Answer: The request carries it, but document.cookie does not show it. HttpOnly forbids JavaScript access through document.cookie. It does not change what the request carries, so fetch and XMLHttpRequest still send the cookie. This limits what an XSS script can read.
- **verify.** A server sends Set-Cookie: __Host-sid=abc; Secure; Path=/; Domain=example.com. What does the browser do? Answer: It rejects the cookie, because __Host- forbids Domain. A __Host- cookie must have Secure, Path=/ and no Domain, so a browser that supports prefixes rejects this header. Server libraries such as undici's setCookie drop Domain when they write a __Host- cookie, but the browser itself only accepts or rejects.

Needs first: Origin versus site and the public suffix list.

## What it shows

Step through an animated walkthrough, change the simulation and answer the checkpoints. Predict which stored cookies a request carries from Domain, Path, Secure and SameSite, and say what HttpOnly and the __Host- prefix change.

Text alternative: A browser holds five cookies from shop.example.com with different Domain, Path, Secure, HttpOnly and SameSite attributes. A guided walkthrough explains each check, then a stepper runs the checks for seven cases: a same-site fetch, a cross-site link, a cross-site form POST, a cross-site image, a link to a same-site subdomain, a link to plain http, and a set of __Host- and __Secure- cookies that the browser stores or rejects.

## Check yourself

A form on news.other.org sends POST to shop.example.com/account/pay. Which of the five cookies does the request carry?

Answer: Only widget (SameSite=None). Lax allows a cross-site request only when it is a top-level navigation with a safe method. POST is not safe, so the Lax cookies stay home and Strict never goes cross-site. SameSite=None allows every request, so widget goes.

## Sources

- HTTP (MDN Web Docs documentation set) — https://developer.mozilla.org/en-US/docs/Web/HTTP (`mdn-http-docs`)
- URL Standard (WHATWG Living Standard) — https://url.spec.whatwg.org/ (`whatwg-url-standard`)
- nodejs/undici: HTTP/1.1 client for Node.js (fetch, cache interceptor, cookies) — https://github.com/nodejs/undici (`nodejs-undici-repo`)

## Used in

- lesson page `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/10-cookies/` (file `site/src/content/lessons/frontend-engineering/how-the-web-works/internet-and-networking/10-cookies.mdx`)

Back to [[visuals-internet-and-networking|all visuals]].

## My insights
