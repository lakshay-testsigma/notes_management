---
title: "Reading caniuse support tables"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: concept
concept: caniuse-tables
parent: baseline-and-caniuse
tags: [frontend-engineering, learning-system-and-workstation, concept, browser-support]
created: 2026-11-17
sources: [caniuse-docs, mdn-browser-compat-data-repo]
---

# Reading caniuse support tables

A caniuse support table answers one question: which browser versions run this web feature? Each column is a browser, each cell is a range of versions, and the cell colour gives the answer. You read it before you use a new CSS property or JavaScript API in code that real users load.

This note expands the caniuse part of the lesson page "Can I ship it? Baseline and caniuse" (`03-can-i-ship-it.mdx`). That page holds the interactive version of this idea. Read this note when you want the details behind the colours.

## Explanation: what the table is and why it exists

Browsers ship features at different times. A feature that works in your Chrome can fail in a user's older Safari. Without a table, you would have to test every browser yourself or trust a blog post.

caniuse.com collects this information in one place. Its About page gives the legend (`caniuse-docs`):

- **Green**: supported.
- **Red**: not supported.
- **Greenish yellow**: partial support. The feature works only in part, and a numbered note says what is missing.
- **Gray**: support unknown.

The support data comes from the community GitHub repository `Fyrd/caniuse`, and the usage share of each browser comes from StatCounter GlobalStats (`caniuse-docs`). The `Fyrd/caniuse` README says the repository holds the raw data of the support tables, and that other projects can use its full data file.

A second dataset feeds the same kind of table. `mdn/browser-compat-data` (BCD) is the machine-readable compatibility data behind the MDN support tables, and its README lists caniuse among the projects that use the data (`mdn-browser-compat-data-repo`).

## Mechanism: how to read one table, step by step

1. **Find the browser column.** Chrome, Edge, Firefox, Safari and their mobile versions each have a column.
2. **Find the version row.** A cell covers a range of versions, for example "4–69" in red and "70+" in green. The first green version is the first version that supports the feature.
3. **Read the colour.** Green means yes, red means no, gray means nobody knows.
4. **Read every partial note.** A greenish-yellow cell has a number. That number points to a note under the table. The note tells you which part works.
5. **Read the usage share.** The share tells you how many users are on each version. A red cell matters only when real users sit in it.

The BCD data shows what a cell really holds. Four details from the repository explain cells that look strange:

- **A cell can hold more than one statement.** A browser's value is one statement, a list of statements, or `"mirror"` (`utils/walkingUtils.js:38-40 @ 8f942b4`, `utils/iter-support.js:15-20 @ 8f942b4`). A list holds history, for example an early prefixed or partial version and a later full version.
- **A partial row must carry a note.** A row with `partial_implementation` keeps a note that says what is missing (`api/AbortController.json:34-44 @ 8f942b4`). That note is the text behind a greenish-yellow cell.
- **`≤N` means "at most N, maybe earlier".** The version pattern allows `≤79`, `preview` (beta only) and `false` (not supported) (`schemas/compat-data.schema.json:13 @ 8f942b4`). The linter allows a range only for releases up to 2020-05-19, so new data must be exact (`lint/linter/test-versions.js:15-16 @ 8f942b4`, `lint/linter/test-versions.js:137-149 @ 8f942b4`). A missing browser becomes `version_added: false` when a program reads the data (`utils/iter-support.js:20 @ 8f942b4`).
- **`"mirror"` copies a parent browser.** A derived browser, such as Edge (which uses Chrome's engine), says `"mirror"` in the source files. The build copies the upstream data and maps the versions by engine version (`scripts/build/mirror.js:105-141 @ 8f942b4`). The published file holds real numbers; the source files do not. Mirroring keeps `≤` and does not invent an exact number (`scripts/build/mirror.js:139-140 @ 8f942b4`).

**Interpretation.** The sources do not say exactly how caniuse draws each BCD value on its pages. Expect the same ideas (ranges, partial notes, unknown) in caniuse cells, and check the MDN table for the raw BCD value when a cell surprises you.

## Use case: a check before you ship

You want to use a new CSS feature on a company checkout page. Your analytics say that many customers use Safari on older iPhones.

1. Open the caniuse page for the feature.
2. Read the Safari on iOS column. Find the first green version.
3. Compare that version with the oldest version your analytics show.
4. If a cell is greenish yellow, read its note and test the missing part.

The benefit over the alternative is speed and coverage. Testing on real devices finds the bug only for the devices you own. A blog post can be years old. The table puts every browser and version on one screen, with the data source and the usage share. You then test only the cases the table marks as risky.

## Trade-offs: when to use caniuse and when to use something else

- **caniuse** shows each browser and version, the partial notes and the usage share. It answers "which of my users break?". You pay with more reading: you must decide yourself which browsers count.
- **Baseline** gives one status for a set of core browsers (see [[Baseline status]] and [[Core browsers]]). It answers "is this safe in general?" fast. You pay with less detail: it does not tell you about a specific old version that your users run.
- **The MDN table (BCD)** shows the raw values such as `≤N`, `preview` and the notes. Use it when you need to know exactly what is known. BCD has no Baseline field; Baseline lives in the separate `web-features` package (`scripts/build/index.js:97-109 @ 8f942b4`).

**So.** Start with Baseline for a quick answer. Open caniuse when your users run older or less common browsers, or when Baseline says "not yet widely available".

## Failure modes: what the table prevents and where it misleads

The table prevents the classic bug: a feature works on your machine and fails for users on another browser.

It can still mislead you:

- **Ignoring a partial note.** A greenish-yellow cell is not green. The part you need can be the part that is missing.
- **Reading gray as red, or blank as yes.** Gray means unknown. In BCD, a missing browser reads as `false` (`utils/iter-support.js:20 @ 8f942b4`), which is a safe default, not a proof.
- **Treating `≤79` as exactly 79.** The feature may have shipped earlier. If you compare versions in code, strip the `≤` first and decide whether "maybe earlier" counts for your rule (findings note, section 4).
- **Reading BCD source JSON for Edge.** A source file can say `"mirror"` instead of a number. Read the published `data.json` or treat `"mirror"` as unresolved (`utils/iter-support.js:7-9 @ 8f942b4`).
- **Treating the table as a test.** The table records what contributors reported. It does not run your code. A feature can be "supported" and still have a bug in your exact use. Test the risky cases.

## Practice: read a table and check your answer

**Assumption.** The rows below describe a made-up feature in BCD style. They do not describe a real feature.

| Browser | Rows |
|---|---|
| Chrome | `version_added: "≤79"` |
| Edge | `"mirror"` |
| Firefox | `version_added: "70"`; `version_added: "60"`, `version_removed: "70"`, `partial_implementation: true`, note: "Does not support the `signal` option." |
| Safari | `version_added: false` |

Answer these questions before you read on:

1. A user runs Firefox 65. Does the feature work, and what must you check?
2. A user runs Chrome 75. Can you say it works?
3. A user runs Safari 17. Does the feature work?
4. What colour would a caniuse-style table show for Firefox 65?
5. Why does Edge have no number here?

**Expected answers.**

1. Partly. Firefox 60 to 69 has a partial implementation. Read the note: the `signal` option does not work. If your code uses `signal`, it fails in Firefox 65. Full support starts in Firefox 70.
2. No. `≤79` means "confirmed in 79, maybe earlier". Chrome 75 can work, but the data does not prove it. Test it, or treat it as unknown.
3. No. `false` means not supported.
4. Greenish yellow (partial support), with a note number that points to the `signal` note.
5. Edge mirrors Chrome. The build copies Chrome's data and maps the versions to Edge versions, so the published file has a number and the source file does not. The `≤` survives the mirror.

To check yourself on real data, open any feature on caniuse.com, pick one greenish-yellow cell, and read its note. Then open the same feature on MDN and compare the two tables. They should agree on the first full version, or the MDN table should show why not.

<!-- concept: caniuse-tables -->

## My insights
