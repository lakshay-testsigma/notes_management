---
title: "Edit props and dispatch actions with framework devtools"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [react-devtools-docs, redux-configure-store-docs]
---
# Edit props and dispatch actions with framework devtools

**Interactive experiences** · teaches Framework devtools extensions, React DevTools Components and Profiler, Redux DevTools actions and time travel

**Why this visual.** Predict what React DevTools lets you change and what the Redux store and DevTools extension hold after a dispatched action.

**Interactive video lesson (Mode B)** · level intermediate · modes Explore, Guided, Practice.

Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/02-framework-devtools/`. Run `npm run site:dev` first.

## Parts

- Guided walkthrough (HyperFrames composition): [[visual-framework-devtools-lab-guided-browser-extension-toolkit|framework-devtools-lab-guided]]
- Simulation: `AlgorithmStepper` with named presets
- Static fallback: [[visual-framework-devtools-fallback-browser-extension-toolkit|framework-devtools-fallback]]

Lesson definition: `projects/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/experiences/framework-devtools-lab/experience.json` (rebuild with `tutor experience frontend-engineering/learning-system-and-workstation/browser-extension-toolkit build framework-devtools-lab`).

## Checkpoints

- **predict.** The React DevTools extension is installed. You open a plain HTML page that does not use React. Which panels do you get? Answer: Only the built-in DevTools panels. React DevTools adds the Components and Profiler panels when you visit a website built with React. A page without React has no components for it to read.
- **experiment.** Load the devTools true preset and step until the action reaches the extension. What does the store hold, and what does the extension show? The reducer returns the next state with one todo. Because devTools is true, its default, the store then sends the action todos/todoAdded and that state to the Redux DevTools extension.
- **predict.** You set devTools: false and dispatch todoAdded. What happens? Answer: The store gets the new todo, but the extension receives nothing. devTools: false turns off only the integration. The middleware and the reducer still run, so state changes, but the store sends no actions or state to the extension.
- **verify.** You add the logger with concat and dispatch a thunk function. What does the logger see? Answer: The plain action, after the thunk middleware has resolved the thunk. Middleware run in array order. concat places the logger after the default thunk middleware, which has already resolved thunk functions. Use prepend to run before the defaults.
- **verify.** You test a React site in Safari, which has no React DevTools extension. How do you inspect its components? Answer: Run the react-devtools npm package and add its localhost:8097 script to the head. For browsers without the extension, install react-devtools from npm, run it, add the script tag for http://localhost:8097 at the start of the head, and reload the website.

Needs first: Content scripts and DevTools pages.

## What it shows

Step through an animated walkthrough, change the simulation and answer the checkpoints. Predict what React DevTools lets you change and what the Redux store and DevTools extension hold after a dispatched action.

Text alternative: A guided walkthrough of React DevTools and Redux DevTools, paused for predictions, with a stepper. In React DevTools you select TodoList in the Components panel and edit its filter prop. In a Redux todo store you dispatch todoAdded with the devTools option set to true, false or an options object, and watch the action pass the thunk middleware, the logger and the reducer, and see what the store and the extension hold.

## Check yourself

The React DevTools extension is installed. You open a plain HTML page that does not use React. Which panels do you get?

Answer: Only the built-in DevTools panels. React DevTools adds the Components and Profiler panels when you visit a website built with React. A page without React has no components for it to read.

## Sources

- React Developer Tools — https://react.dev/learn/react-developer-tools (`react-devtools-docs`)
- Configuring Your Store (Redux, Redux DevTools Extension integration) — https://redux.js.org/usage/configuring-your-store (`redux-configure-store-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/02-framework-devtools/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/02-framework-devtools.mdx`)

Back to [[visuals-browser-extension-toolkit|all visuals]].

## My insights
