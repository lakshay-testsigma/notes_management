---
title: "console.table and console.dir on the same request data"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-docs]
---
# console.table and console.dir on the same request data

**Comparison** · teaches Console API and utilities

**Why this visual.** Compare the table view of an array with the property view of one object, and choose columns for the table.

Interactive `CodePlayground`. Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/03-console-power-use/`. Run `npm run site:dev` first.

## What it shows

The same three API responses print in two shapes. console.table gives one row per item, so the slow 912 ms request stands out. console.dir lists each property of one item with its type. A second argument to console.table keeps only the columns you name.

Text alternative: A runnable code editor prints three requests as a table with url and ms columns, then lists the url, status and ms properties of the 500 response, so the table compares items and dir inspects one item.

## Check yourself

You need to compare the duration of 40 requests. Which call do you use, and why?

Answer: console.table, because it puts one request per row, so you can scan one column of durations.

## Sources

- Chrome DevTools — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/03-console-power-use/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/03-console-power-use.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
