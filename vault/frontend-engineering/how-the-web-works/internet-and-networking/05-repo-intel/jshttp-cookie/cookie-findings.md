---
title: "jshttp/cookie — findings"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: repo-intel
tags: [frontend-engineering, how-the-web-works, cookies]
sources: [jshttp-cookie-repo]
created: 2026-11-18
---

# jshttp/cookie — findings

What this production library does beyond the textbook version of cookie handling, ranked by how much you gain from knowing it.

## 1. Strict writer, lenient reader

- Textbook version: one set of rules for both directions.
- What they do: the writers (`stringifyCookie`, `stringifySetCookie`) throw a `TypeError` on bad input. The readers (`parseCookie`, `parseSetCookie`) accept nearly anything and drop what they cannot use.
- Why: bad output can split a header or smuggle an attribute; bad input comes from outside and is common, so it must not crash a server.
- Evidence: `src/index.ts:172-180 @ a437ef0`, `src/index.ts:439-468 @ a437ef0`
- Borrow it when: you write a tool that both checks and reads cookies, such as the capstone cookie check.
- More: [[cookie-module-cookie-header|cookie-header]], [[cookie-module-set-cookie-parse|set-cookie-parse]], [[cookie-pattern-strict-write-lenient-read]]

## 2. Every Set-Cookie attribute has its own check

- Textbook version: join `name=value` and the options with `"; "`.
- What they do: Domain, Path, Max-Age, Expires, Priority and SameSite each get a rule and an error message. Domain follows DNS label rules. Max-Age must be a safe integer, and Expires needs a UTC year from 1601 to 9999.
- Why: an unchecked attribute lets a caller add a second one, as in `example.com; Path=/`. The tests try exactly that.
- Evidence: `src/index.ts:292-388 @ a437ef0`, `src/stringify-set-cookie.spec.ts:103-114 @ a437ef0`
- Borrow it when: your report checks cookie attributes: use these rules as your list of what is valid.
- More: [[cookie-module-set-cookie-serialize|set-cookie-serialize]], [[cookie-pattern-strict-write-lenient-read]]

## 3. The reader keeps only valid attributes, with a normal form

- Textbook version: store every attribute as text.
- What they do: `Max-Age` must match `^-?\d+$`, `Expires` must give a finite date, and `SameSite` and `Priority` must be known words, lower-cased. Flags such as `Secure=false` still set `true`.
- Why: one clean shape lets later code compare with `===`, and a bad attribute never reaches it.
- Evidence: `src/index.ts:439-468 @ a437ef0`, `src/parse-set-cookie.spec.ts:81-88 @ a437ef0`
- Borrow it when: you parse headers you do not control. Check yourself that `Domain` and `Path` are copied raw (`src/index.ts:433-438 @ a437ef0`).
- More: [[cookie-module-set-cookie-parse|set-cookie-parse]], [[cookie-pattern-strict-write-lenient-read]]

## 4. A decoder that never throws

- Textbook version: call `decodeURIComponent`, which throws on `%1`.
- What they do: `defaultDecode` skips the call when there is no `%` and returns the raw text if the call throws. A test shows `foo=%1;bar=bar` still gives both cookies.
- Why: the header comes from the client, so one bad value must not break the request.
- Evidence: `src/index.ts:518-526 @ a437ef0`, `src/parse-cookie.spec.ts:65-70 @ a437ef0`
- Borrow it when: you decode any untrusted text.
- More: [[cookie-module-cookie-header|cookie-header]], [[cookie-pattern-strict-write-lenient-read]]

## 5. One pass with `indexOf`, no `split`

- Textbook version: `split(";")`, then `split("=")`, then `trim()`.
- What they do: two indexes move along the string, and a hand-written trim cuts one substring.
- Why: this runs on every request, so fewer temporary strings help. The comments call the helpers "optimized"; the speed goal for the parsers is my inference.
- Evidence: `src/index.ts:121-141 @ a437ef0`, `src/index.ts:496-513 @ a437ef0`
- Borrow it when: a loop runs on every request. Measure first.
- More: [[cookie-module-cookie-header|cookie-header]], [[cookie-pattern-single-pass-scan]]

## 6. Encode only when needed, and keep the round trip exact

- Textbook version: always call `encodeURIComponent`.
- What they do: encode only if a regexp finds an unsafe character. The set includes `%`, so `100%` becomes `100%25` and decodes back.
- Why: safe values pass through unchanged, and no value changes meaning on a round trip.
- Evidence: `src/index.ts:31-34 @ a437ef0`, `src/index.ts:531-533 @ a437ef0`
- Borrow it when: you write values that another program will read back.
- More: [[cookie-module-set-cookie-serialize|set-cookie-serialize]], [[cookie-pattern-single-pass-scan]]

## 7. Null-prototype result and first value wins

- Textbook version: `const obj = {}`, and the last duplicate wins.
- What they do: the result has no prototype, so a cookie named `toString` is safe. The first value of a name is kept, and a custom decoder that returns `undefined` lets a later one fill the slot.
- Why: the first is the best match (my inference from the "only assign once" comment and the tests).
- Evidence: `src/index.ts:76-80 @ a437ef0`, `src/index.ts:135-138 @ a437ef0`, `src/parse-cookie.spec.ts:110-123 @ a437ef0`
- Borrow it when: you build a map from user-controlled keys.
- More: [[cookie-module-cookie-header|cookie-header]]

## 8. Rules wider than the RFC, on purpose

- Textbook version: follow RFC 6265 exactly.
- What they do: names allow every printable ASCII character except `=` and `;`, and values allow `"`, `,` and `\`. Comments link an issue for each choice.
- Why: real sites send such cookies, and a strict check would reject them.
- Evidence: `src/index.ts:12-15 @ a437ef0`, `src/index.ts:26-29 @ a437ef0`
- Borrow it when: a standard and real traffic disagree. Write the reason next to the rule.
- More: [[cookie-module-cookie-header|cookie-header]]

## 9. Size budget and benchmarks, including worst-case input

- Textbook version: tests check behaviour only.
- What they do: `npm test` runs a 1.4 KB size limit. Benchmarks hold eight versions of the trim function, and both parsers are timed on 100,000 semicolons. Real top-site headers are obfuscated before they are committed.
- Why: every app that uses the library pays for each byte and each slow path.
- Evidence: `package.json:33 @ a437ef0`, `benchmarks/value-slice.bench.ts:3-40 @ a437ef0`, `src/parse-cookie.bench.ts:37-40 @ a437ef0`, `scripts/update-benchmark.ts:72-89 @ a437ef0`
- Borrow it when: a function is on the hot path of many users.
- More: [[cookie-module-build-and-infra|build-and-infra]], [[cookie-pattern-measured-performance]]

## 10. Supply-chain hardening in CI and release

- Textbook version: `uses: actions/checkout@v4` and a stored npm token.
- What they do: actions are pinned to commit hashes, default permissions are read-only, and release uses an OIDC identity with `--ignore-scripts`. Scorecard and CodeQL run on a schedule.
- Why: a tag-triggered publish is the best target for an attacker.
- Evidence: `.github/workflows/ci.yml:22-28 @ a437ef0`, `.github/workflows/release.yml:8-9 @ a437ef0`, `.github/workflows/release.yml:26 @ a437ef0`
- Borrow it when: you publish a package that others install.
- More: [[cookie-module-build-and-infra|build-and-infra]]

## My insights
