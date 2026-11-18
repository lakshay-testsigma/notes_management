---
title: "Polyfills only when needed, and their supply-chain risk"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: concept
concept: polyfills-when-needed
parent: feature-detection
tags: [frontend-engineering, learning-system-and-workstation, concept, polyfill, supply-chain]
created: 2026-11-17
sources: [mdn-feature-detection-guide, browserslist-browserslist-repo, sansec-polyfill-io-blog]
---

# Polyfills only when needed, and their supply-chain risk

A polyfill is a piece of JavaScript that adds a missing browser feature, so your code can call it in a browser that lacks it. Load a polyfill only for target browsers that need it. Load it from code you control, never from a third-party address you do not watch.

This note extends the parent concept [[Feature detection]]. Lesson page 4, "Feature detection and polyfills", has the interactive version. Open it from `/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/` with `npm run site:dev`.

## Explanation: what a polyfill is and why it exists

Browsers get new features at different times. Some visitors use older browsers, and those browsers "may not display your sites properly or might fail altogether" (mdn-feature-detection-guide, section "The concept of feature detection"). Feature detection is a small test that asks "can this browser do X?" and then runs enhanced code or fallback code.

A polyfill is one kind of fallback. Instead of a different, simpler path, it supplies the missing feature itself, so the same code runs everywhere. MDN names the polyfill as the other approach for features that are "known to be undetectable" (mdn-feature-detection-guide, section "JavaScript"). MDN gives no example of such a feature and does not explain polyfills further.

**Analogy.** A polyfill is like a travel plug adapter. You carry it only to countries with a different socket. It breaks down because an adapter in your bag costs nothing, but a polyfill costs download and parse time for every visitor who gets it.

## Mechanism: how "only when needed" works

Two separate questions decide whether a polyfill reaches a visitor.

1. **Which browsers do you support?** Browserslist answers this at build time. It is "the config to share target browsers and Node.js versions between different front-end tools" (browserslist-browserslist-repo, README intro). You write a query such as `defaults` in `package.json` or in `.browserslistrc`.
2. **What does the query mean?** The `defaults` query is `> 0.5%, last 2 versions, Firefox ESR, not dead` (README, section "Queries"). Browserslist turns the query into a browser list with Can I Use data. Run `npx browserslist` in the project to print that list.
3. **Which tools read the list?** The README names Autoprefixer, Babel (its preset-env), postcss-preset-env and eslint-plugin-compat, among others. So one config controls what your CSS and JavaScript tools produce, and what your linter warns about.
4. **Does this visitor's browser have the feature?** Feature detection answers this at run time. In JavaScript, a test such as `"geolocation" in navigator` returns true or false (mdn-feature-detection-guide, section "Members of an object"). For CSS, `@supports` does the same without JavaScript.
5. **Load the polyfill only on "no".** If the test fails, your code loads the polyfill file and then runs the normal code. If the test passes, the browser downloads nothing extra.

**Interpretation.** Steps 1–3 limit *which* polyfills your build can contain. Steps 4–5 limit *who* downloads them. The sources describe the two tools; the combination is this note's advice, not a quote from one source.

## Use case: a dashboard that also works on an older phone

You build an internal dashboard. Most staff use current Chrome and Safari. A warehouse team uses older Android phones.

- **Without the rule:** you add one big polyfill bundle to every page. Every visitor downloads it, also the ones whose browser already has every feature.
- **With the rule:** you set `"browserslist": ["defaults"]` and run `npx browserslist` to see the real list. Your tools then work for that list. At run time, a feature test loads the extra file only on the warehouse phones.

**Benefit over the alternative.** Current browsers skip the download, and the older phones still get a working page. The README also warns: do not remove browsers "just because you don't know them" (section "Best Practices"). Opera Mini is its example, with 100 million users in Africa.

## Trade-offs: when to choose a polyfill, and when not

You pay bytes and a dependency to get one code path for all target browsers.

| Choice | Choose it when | You pay |
|---|---|---|
| No polyfill, fallback path | The feature is a nice extra (MDN's geolocation example shows static maps instead) | Two code paths to test |
| Polyfill loaded after a failed test | The feature is detectable and your code depends on it | A second request on old browsers |
| Polyfill in the bundle for all | The feature is undetectable and a target browser lacks it | Bytes for every visitor |
| Drop the browser from the targets | Real usage data says nobody uses it | Lost visitors if the data is wrong |

**Interpretation.** No source here measures the byte cost of a polyfill. The cost is real but depends on the feature. Measure it in your own bundle before you decide.

The original polyfill.io author said that modern browsers no longer need that service (reported in sansec-polyfill-io-blog). So check the target list first. Often the right number of polyfills is zero.

## Failure modes: the polyfill.io supply-chain attack

A supply-chain attack hits you through code you did not write but load and trust. A polyfill loaded with `<script src="https://cdn.polyfill.io/...">` runs with full access to your page.

The facts, from Sansec's report of 25 June 2024 (sansec-polyfill-io-blog):

- More than 100,000 sites embedded `cdn.polyfill.io`. JSTOR, Intuit and the World Economic Forum were among them.
- In February 2024, a Chinese company bought the domain and the GitHub account.
- After that, the domain injected malware on mobile devices through every site that embedded it.
- The service built its code from the HTTP headers of each request. Sansec says that makes "multiple attack vectors" likely.
- One decoded payload sent mobile users to a sports betting site through a fake Google Analytics domain. It ran only on some devices at some hours. It did not run when it found an admin cookie, so site owners did not see it.
- Cloudflare then rewrote `cdn.polyfill.io` requests to its own copy, and Namecheap put the domain on hold. Sansec still advised all sites to remove every `polyfill.io` reference.

**So.** The site owners did not change one line of code. The danger came from the owner of a URL. The admin check also shows why "it works on my machine" is not proof.

What to do instead:

1. Remove every `polyfill.io` reference (sansec-polyfill-io-blog).
2. Ask first whether your target browsers need the polyfill at all. Run `npx browserslist` and check the list.
3. If you still need a hosted service, Sansec says Fastly and Cloudflare offer "trustworthy alternatives".
4. **Interpretation.** Prefer a polyfill installed as a package and bundled from your own build. Then its version is pinned and your code review sees changes. Sansec does not say this in these words.

Other limits: a feature test can pass while the feature still behaves badly. MDN does not cover that case, so test the real behavior too.

## Practice: a checkable exercise

**Task.** You have this code in a page:

```html
<script src="https://cdn.polyfill.io/v3/polyfill.min.js"></script>
<script>
  if ("geolocation" in navigator) { showLiveMap(); } else { showStaticMap(); }
</script>
```

The project `package.json` has `"browserslist": ["defaults"]`. Answer three questions:

1. Which line is the supply-chain risk, and what should you do with it?
2. What does the second script do in a browser without geolocation? Does it need a polyfill?
3. What command shows the browsers that `defaults` selects, and what query does `defaults` stand for?

**Expected answers.**

1. The first `<script>` line. It loads code from a domain the site does not control. In 2024 that domain served malware. Delete the line.
2. It runs `showStaticMap()`. It is a fallback path, so it needs no polyfill for geolocation.
3. `npx browserslist`. `defaults` stands for `> 0.5%, last 2 versions, Firefox ESR, not dead`.

**Check it yourself.** Run `npx browserslist` in any project with that config and read the list. In the browser console, run `"geolocation" in navigator` and see `true` or `false`.

<!-- concept: polyfills-when-needed -->

## My insights
