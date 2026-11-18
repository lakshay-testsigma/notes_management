---
title: "Framework devtools show components and store actions"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [react-devtools-docs, redux-configure-store-docs]
---
# Framework devtools show components and store actions

**Video** · teaches Framework devtools extensions, React DevTools Components and Profiler, Redux DevTools actions and time travel

**Why this visual.** See what the React DevTools panels let you change and how a dispatched Redux action reaches the store and the Redux DevTools extension.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/videos/framework-devtools-lab-guided/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/videos/framework-devtools-lab-guided` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/browser-extension-toolkit build framework-devtools-lab-guided`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/videos/framework-devtools-lab-guided/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/framework-devtools-lab-guided/composition/index.html`.

## Transcript

React DevTools adds the Components and Profiler panels on websites built with React; in Components you select a component and edit its props or state. In a Redux todo app, configureStore connects the store to the Redux DevTools extension by default. A dispatched todoAdded action passes the thunk middleware, then a logger added with concat, then the reducer returns the next state, and the store sends the action and state to the extension. With devTools set to false the store still updates, but the extension receives nothing. Safari uses the standalone react-devtools package.

**00:00 Behind the DOM: components and store.** Built-in DevTools shows the DOM. Two extensions show the components and the store that React and Redux keep behind it.

**00:08 Two new panels on React websites.** Install the React DevTools extension. On a website built with React, the Components panel and the Profiler panel appear.

**00:17 Edit a prop in the Components panel.** In the Components panel, select TodoList and edit its filter prop. The page then shows the list with the new filter.

**00:27 One action reaches the store and the extension.** Dispatch todoAdded. The action passes the thunk middleware, then the logger. The reducer returns the next state, and the store sends the action and state to the extension.

**00:39 The devTools option connects the store.** configureStore sets devTools to true by default. Set it to false, and the store still updates, but the extension receives nothing.

**00:50 Middleware run in array order.** Middleware run in array order. concat puts the logger after the defaults, so the thunk middleware resolves thunks before the logger sees the action.

**01:00 Safari: the standalone react-devtools.** Other browsers, such as Safari, use the react-devtools npm package. Run it, add its script tag to the head, and reload.

Sources:

- React docs set: React Developer Tools, and Render and Commit — https://react.dev/learn/react-developer-tools
- Redux docs set: Configuring Your Store and Essentials Part 1 (Redux DevTools Extension) — https://redux.js.org/usage/configuring-your-store

## What it shows

Framework devtools read what the framework keeps behind the DOM: React components with their props and state, and each Redux action with the state after it. Redux sends that data to the extension only while the devTools option is on.

Text alternative: React DevTools adds the Components and Profiler panels on websites built with React; in Components you select a component and edit its props or state. In a Redux todo app, configureStore connects the store to the Redux DevTools extension by default. A dispatched todoAdded action passes the thunk middleware, then a logger added with concat, then the reducer returns the next state, and the store sends the action and state to the extension. With devTools set to false the store still updates, but the extension receives nothing. Safari uses the standalone react-devtools package.

## Check yourself

You set devTools to false in configureStore and dispatch todoAdded. What changes in the app, and what does the Redux DevTools extension show?

Answer: The reducer still returns the next state with the new todo, but the extension receives no actions and no state, because the integration is off.

## Sources

- React docs set: React Developer Tools, and Render and Commit — https://react.dev/learn/react-developer-tools (`react-devtools-docs`)
- Redux docs set: Configuring Your Store and Essentials Part 1 (Redux DevTools Extension) — https://redux.js.org/usage/configuring-your-store (`redux-configure-store-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/02-framework-devtools/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/02-framework-devtools.mdx`)

Back to [[visuals-browser-extension-toolkit|all visuals]].

## My insights
