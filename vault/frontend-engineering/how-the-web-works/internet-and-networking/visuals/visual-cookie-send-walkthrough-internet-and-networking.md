---
title: "How the browser picks the cookies for one request"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: visual
tags: [frontend-engineering, how-the-web-works, visual]
created: 2026-11-18
sources: [mdn-http-docs, whatwg-url-standard, nodejs-undici-repo]
---
# How the browser picks the cookies for one request

**Video** · teaches Cookies, Set-Cookie attributes and SameSite, Cookie prefixes and partitioned cookies (CHIPS), First-party and third-party cookies

**Why this visual.** Apply the Domain, Path, Secure and SameSite checks to decide which stored cookies one request carries.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker The storyboard is in `projects/frontend-engineering/how-the-web-works/internet-and-networking/videos/cookie-send-walkthrough/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/how-the-web-works/internet-and-networking/videos/cookie-send-walkthrough` (editable: change `video.json`, then `tutor video frontend-engineering/how-the-web-works/internet-and-networking build cookie-send-walkthrough`). Storyboard: `projects/frontend-engineering/how-the-web-works/internet-and-networking/videos/cookie-send-walkthrough/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/how-the-web-works/internet-and-networking/cookie-send-walkthrough/composition/index.html`.

## Transcript

A browser stores five cookies from shop.example.com. For each request it checks Domain (which hosts), Path (which URL paths), Secure (https only) and SameSite (Strict, Lax or None against same-site and cross-site requests). HttpOnly hides a cookie from page scripts but the cookie is still sent. The __Secure- and __Host- name prefixes force safe attributes.

**00:00 Which cookies go with this request?.** The browser stores cookies. Before each request, it checks every stored cookie and sends only the cookies that pass.

**00:07 Five cookies from shop.example.com.** Here are five cookies from shop.example.com. Each line shows the attributes that the Set-Cookie header gave the cookie.

**00:16 Domain and Path pick the URL.** Without Domain, a cookie goes only to the host that set it. With Domain, subdomains get it too. Path=/account matches /account and its subpaths.

**00:26 Secure and HttpOnly do different jobs.** Secure sends the cookie only over https. HttpOnly hides the cookie from page scripts, but their requests still carry it.

**00:36 SameSite looks at where the request starts.** A site is the scheme plus the registrable domain. Strict stays same-site. Lax also allows cross-site top-level GET navigations. None allows every request and needs Secure.

**00:48 A link from another site.** A link on news.other.org opens shop.example.com. The Strict cart cookie stays home. Lax and None cookies go with the GET navigation.

**00:59 A cross-site form POST.** Now a form on other.org sends a POST. POST is not a safe method, so Lax cookies stay home. Only the None cookie goes.

**01:09 Name prefixes force safe attributes.** The browser rejects a __Secure- cookie without Secure. A __Host- cookie also needs Path=/ and no Domain, so only its own host gets it.

Sources:

- HTTP (MDN Web Docs documentation set) — https://developer.mozilla.org/en-US/docs/Web/HTTP
- URL Standard (WHATWG Living Standard) — https://url.spec.whatwg.org/
- nodejs/undici: HTTP/1.1 client for Node.js (fetch, cache interceptor, cookies) — https://github.com/nodejs/undici

## What it shows

A request carries a stored cookie only when the host matches Domain, the path matches Path, the scheme satisfies Secure, and SameSite allows the request context. HttpOnly changes what JavaScript can read, not what the request carries.

Text alternative: A browser stores five cookies from shop.example.com. For each request it checks Domain (which hosts), Path (which URL paths), Secure (https only) and SameSite (Strict, Lax or None against same-site and cross-site requests). HttpOnly hides a cookie from page scripts but the cookie is still sent. The __Secure- and __Host- name prefixes force safe attributes.

## Check yourself

A form on another site sends a POST to shop.example.com. Which SameSite value lets the cookie go with it?

Answer: Only SameSite=None (with Secure). Strict never goes cross-site, and Lax goes cross-site only on a top-level navigation with a safe method such as GET, and POST is not safe.

## Sources

- HTTP (MDN Web Docs documentation set) — https://developer.mozilla.org/en-US/docs/Web/HTTP (`mdn-http-docs`)
- URL Standard (WHATWG Living Standard) — https://url.spec.whatwg.org/ (`whatwg-url-standard`)
- nodejs/undici: HTTP/1.1 client for Node.js (fetch, cache interceptor, cookies) — https://github.com/nodejs/undici (`nodejs-undici-repo`)

## Used in

- lesson page `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/10-cookies/` (file `site/src/content/lessons/frontend-engineering/how-the-web-works/internet-and-networking/10-cookies.mdx`)

Back to [[visuals-internet-and-networking|all visuals]].

## My insights
