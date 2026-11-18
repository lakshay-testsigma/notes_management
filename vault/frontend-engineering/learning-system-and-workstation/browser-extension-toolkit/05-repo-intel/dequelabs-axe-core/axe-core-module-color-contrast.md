---
title: "dequelabs/axe-core — module color-contrast"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [dequelabs-axe-core-repo]
---

# dequelabs/axe-core — module: color-contrast

## Responsibility

This slice decides whether text is easy enough to read against its background. It first picks which elements to test, then works out the real text color and background color, then computes the WCAG contrast ratio. When it cannot be sure, it returns "incomplete" (needs a person) instead of guessing. Test files for this slice were not in the file list, so this note covers source only.

## Key files

| File | Role |
|------|------|
| `lib/rules/color-contrast.json` | Rule: impact, tags, and which check to run |
| `lib/rules/color-contrast-matches.js` | Filter: which elements are worth testing |
| `lib/checks/color/color-contrast.json` | Check options (thresholds) and all result messages |
| `lib/checks/color/color-contrast-evaluate.js` | The main decision function |
| `lib/commons/color/get-background-color.js` | Blends everything behind the text into one color |
| `lib/commons/color/get-foreground-color.js` | Blends text, stroke, shadow and opacity into one color |
| `lib/commons/color/get-contrast.js` | The WCAG ratio formula |
| `lib/commons/color/incomplete-data.js` | Cache of "why we could not tell" reasons |
| `lib/commons/color/has-valid-contrast-ratio.js` | Older helper, marked deprecated |

## How it works

1. The rule is `serious` impact, WCAG 2 AA tagged, and runs one check in `any` (`lib/rules/color-contrast.json:3-24 @ e80f6b7`). It sets `excludeHidden: false`, so hidden elements still reach the check (`lib/rules/color-contrast.json:5 @ e80f6b7`).
2. The `matches` function drops elements that cannot be tested: `option`, empty `select`, non-text inputs such as `range` and `checkbox`, and disabled or inert elements (`lib/rules/color-contrast-matches.js:24-47 @ e80f6b7`).
3. It also drops a label whose control is disabled, whether linked by `for` or by nesting (`lib/rules/color-contrast-matches.js:76-108 @ e80f6b7`), and elements whose `aria-labelledby` controls are all disabled (`lib/rules/color-contrast-matches.js:111-134 @ e80f6b7`).
4. For plain text it needs real text children and a non-zero font size, then checks that a text rectangle overlaps the element and is not clipped by an `overflow: hidden` ancestor (`lib/rules/color-contrast-matches.js:136-171 @ e80f6b7`).
5. The check reads its thresholds from options: 4.5 for normal text, 3 for large text (`lib/checks/color/color-contrast.json:11-18 @ e80f6b7`).
6. `evaluate` returns `true` (pass) at once for invisible elements (`lib/checks/color/color-contrast-evaluate.js:33-36 @ e80f6b7`).
7. It converts font size to points and decides "large" using bold weight and the 14pt/18pt cut-offs (`lib/checks/color/color-contrast-evaluate.js:44-55 @ e80f6b7`).
8. Pseudo elements, complex shadows and emoji-only text go to incomplete before any math (`lib/checks/color/color-contrast-evaluate.js:38-83 @ e80f6b7`).
9. It gets the background, then the foreground, then the ratio (`lib/checks/color/color-contrast-evaluate.js:85-105 @ e80f6b7`).
10. The ratio is `(lighter + 0.05) / (darker + 0.05)` using relative luminance (`lib/commons/color/get-contrast.js:21-24 @ e80f6b7`).
11. The result is `contrast > expected` (`lib/checks/color/color-contrast-evaluate.js:107 @ e80f6b7`). The ratio is rounded down to two decimals before it is reported (`lib/checks/color/color-contrast-evaluate.js:120-122 @ e80f6b7`).
12. If a color is missing, the ratio is exactly 1, the text is one character, or an input is empty and failing, the function stores the reason and returns `undefined` (incomplete) (`lib/checks/color/color-contrast-evaluate.js:170-181 @ e80f6b7`).

## Beyond the textbook

### Round down, never up

- Textbook version: compute the ratio, compare to 4.5, show it rounded.
- What they do: truncate to two decimals with `Math.floor`, so 4.499 shows as 4.49.
- Why: the code comment says "truncate ratio to three digits while rounding down", so a near miss never displays as a pass.
- Evidence: `lib/checks/color/color-contrast-evaluate.js:120-122 @ e80f6b7`

### "Unknown" is a first-class result

- Textbook version: pass or fail.
- What they do: a third outcome, `undefined`, carries a reason key (`bgImage`, `bgGradient`, `bgOverlap`, `fgAlpha`, `pseudoContent`, `shortTextContent`, `emptyValue`, `colorParse` and more), each with its own message.
- Why: a background image or an overlapping element makes the true color unknowable from computed styles, so a person must look.
- Evidence: `lib/checks/color/color-contrast.json:35-52 @ e80f6b7`, `lib/commons/color/get-background-color.js:71-75 @ e80f6b7`, `lib/commons/color/get-background-color.js:91-100 @ e80f6b7`

### Reasons travel in a per-run cache

- Textbook version: return an error value up the call stack.
- What they do: low-level color helpers write the reason into `incompleteData`, stored in the shared run cache; the check reads it afterwards and clears it.
- Why: the helpers return `null` colors, which cannot carry a reason. A cache keeps the signatures simple.
- Evidence: `lib/commons/color/incomplete-data.js:19-27 @ e80f6b7`, `lib/checks/color/color-contrast-evaluate.js:128-134 @ e80f6b7`, `lib/checks/color/color-contrast-evaluate.js:177-180 @ e80f6b7`

### Per-node memoization of the background

- Textbook version: recompute the background for every call.
- What they do: store the result, the contributing elements and the incomplete reason on the virtual node; a cache hit replays all three.
- Why: the stack walk is costly and is repeated, as the foreground code can call it too (`lib/commons/color/get-foreground-color.js:60 @ e80f6b7`). Replaying the reason keeps the cached result correct.
- Evidence: `lib/commons/color/get-background-color.js:30-47 @ e80f6b7`

### Real browser rendering model

- Textbook version: read `background-color` of the element.
- What they do: walk the stack of elements painted under the text and stop at the first opaque one. They then blend stacking contexts, page backdrop (html or body, with mix-blend-mode), and thick text-shadows treated as background, bottom up, with white mixed last.
- Why: comments cite a bug about blend order and the W3C page backdrop rule.
- Evidence: `lib/commons/color/get-background-color.js:66-109 @ e80f6b7`, `lib/commons/color/get-background-color.js:124-141 @ e80f6b7`

### Foreground is more than `color`

- Textbook version: foreground is the CSS `color`.
- What they do: layer text stroke, `-webkit-text-fill-color` or `color`, and text shadows through semi-transparent text, then apply opacity of each stacking context.
- Why: transparent text shows what lies behind it.
- Evidence: `lib/commons/color/get-foreground-color.js:25-32 @ e80f6b7`, `lib/commons/color/get-foreground-color.js:107-150 @ e80f6b7`

### Shadows give three ratios, best wins

- Textbook version: one ratio.
- What they do: with thin text shadows, compute text/background, shadow/background and text/shadow, and pass if the maximum is enough. Thick shadows (above `shadowOutlineEmMax` 0.2 em) count as background instead.
- Why: the shadow can act as an outline that keeps text readable.
- Evidence: `lib/checks/color/color-contrast-evaluate.js:92-104 @ e80f6b7`, `lib/checks/color/color-contrast.json:20 @ e80f6b7`

### Guarding against false failures

- Textbook version: fail anything under the ratio.
- What they do: a failing single character, or an empty text field, becomes incomplete. A ratio of exactly 1:1 is also incomplete.
- Why: the messages say one character may not be real text, and an empty field may change color once text is typed.
- Evidence: `lib/checks/color/color-contrast-evaluate.js:144-154 @ e80f6b7`, `lib/checks/color/color-contrast.json:47-48 @ e80f6b7`

## Tests and what they protect

Not present in this slice; the file list holds no test files. The repo guide says each check needs unit tests and an HTML plus JSON integration pair (`AGENTS.md:58-59 @ e80f6b7`).

## Error handling, performance, and security

- A color string that cannot be parsed is caught and turned into `colorParse` incomplete data instead of a crash; other errors are rethrown (`lib/commons/color/get-foreground-color.js:48-53 @ e80f6b7`, `lib/commons/color/get-background-color.js:84-89 @ e80f6b7`).
- Pseudo element area uses `memoize` with primitive keys (`lib/checks/color/color-contrast-evaluate.js:208-239 @ e80f6b7`).
- `incompleteData.set` throws on a non-string key (`lib/commons/color/incomplete-data.js:20-22 @ e80f6b7`).
- A deprecated helper keeps hard-coded 4.5 and 3 values, while the real check uses options (`lib/commons/color/has-valid-contrast-ratio.js:14-21 @ e80f6b7`).
- Security: Not present in this slice.

## Technologies and services seen

- Browser computed styles and layout APIs (`getComputedStyle`, `getClientRects`, `Range`) — read colors and text positions (`lib/checks/color/color-contrast-evaluate.js:44 @ e80f6b7`, `lib/rules/color-contrast-matches.js:144-156 @ e80f6b7`)
- axe virtual node tree and run cache — per-node cache and incomplete data store (`lib/commons/color/get-background-color.js:30-31 @ e80f6b7`, `lib/commons/color/incomplete-data.js:1-3 @ e80f6b7`)
- ES modules, bundled later — all files use `import`/`export` (`lib/commons/color/get-contrast.js:1 @ e80f6b7`)
- WCAG 2 AA contrast criterion 1.4.3 — tags `wcag143` (`lib/rules/color-contrast.json:7-9 @ e80f6b7`)
- ACT rules and RGAA/EN 301 549 tags (`lib/rules/color-contrast.json:10-18 @ e80f6b7`)

## Worth exploring interactively

- Contrast verdict for one element — ordered steps: filter in `lib/rules/color-contrast-matches.js:24-47 @ e80f6b7`; large or small text in `lib/checks/color/color-contrast-evaluate.js:44-55 @ e80f6b7`; background in `lib/checks/color/color-contrast-evaluate.js:86 @ e80f6b7`; foreground in `lib/checks/color/color-contrast-evaluate.js:87 @ e80f6b7`; ratio in `lib/commons/color/get-contrast.js:21-24 @ e80f6b7`; pass, fail or incomplete in `lib/checks/color/color-contrast-evaluate.js:170-187 @ e80f6b7` — fits FlowAnimation because the learner sees an element move through each gate and end in one of three outcomes.
- Background stack blending — steps: walk stack and stop at opaque in `lib/commons/color/get-background-color.js:66-109 @ e80f6b7`; add stacking contexts and page colors in `lib/commons/color/get-background-color.js:111-118 @ e80f6b7`; blend bottom up in `lib/commons/color/get-background-color.js:128-141 @ e80f6b7` — fits AlgorithmStepper because a color list is reduced layer by layer.

## Open questions

- How `getBackgroundStack`, `flattenColors` and `getStackingContext` work; they are outside this slice.
- Which tests protect the edge cases above.

## My insights
