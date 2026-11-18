---
title: "Step through Preact's createElement"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-17
sources: [preactjs-preact-repo]
---
# Step through Preact's createElement

**Algorithm** · teaches Reading other people's code

**Why this visual.** Practice reading one real library function and predicting what it returns.

Interactive `CodeWalkthrough`. Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/lesson/05-read-other-peoples-code/`. Run `npm run site:dev` first.

## What it shows

Preact's createElement (src/create-element.js:16-33 @ 34b99c6) copies props into a new object, but moves key out, and moves ref out when the type is not a function component. One child stays a single value; two or more become an array. Then createVNode builds the virtual node.

Text alternative: Code walkthrough of createElement in four steps: signature, a loop that splits key and ref from the props, children handling, and the hand-over to createVNode, so key never reaches the props.

## Check yourself

You call createElement('a', { href: '/docs', key: 'nav' }, 'Docs'). What are the vnode props?

Answer: { href: '/docs', children: 'Docs' }: key moves to the vnode, and one child stays a single value.

## Sources

- preactjs/preact — https://github.com/preactjs/preact (`preactjs-preact-repo`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/lesson/05-read-other-peoples-code/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/05-read-other-peoples-code.mdx`)

Back to [[visuals-how-to-learn-frontend|all visuals]].

## My insights
