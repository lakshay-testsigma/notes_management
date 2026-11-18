# Storyboard: Framework devtools show components and store actions

**Purpose.** See what the React DevTools panels let you change and how a dispatched Redux action reaches the store and the Redux DevTools extension.

**Why a video.** A dispatched action passes middleware, then the reducer, then reaches the extension in a fixed order, so motion shows the cause of each change.

**Length.** 70.0 s, 7 scenes.

## 1. Behind the DOM: components and store (0.0–8.0 s)

**On screen.** Title card with "React DevTools and Redux DevTools".

**Narration and caption.** Built-in DevTools shows the DOM. Two extensions show the components and the store that React and Redux keep behind it.

**Sources.** react-devtools-docs, redux-configure-store-docs

## 2. Two new panels on React websites (8.0–17.0 s)

**On screen.** Numbered steps appear one at a time: Install the extension: Chrome, Firefox or Edge → Open a website built with React → Components panel: inspect components → Profiler panel: find performance problems.

**Narration and caption.** Install the React DevTools extension. On a website built with React, the Components panel and the Profiler panel appear.

**Sources.** react-devtools-docs

## 3. Edit a prop in the Components panel (17.0–27.0 s)

**On screen.** Nodes Components panel, filter prop, Page. A packet moves panel→prop (change the prop value), prop→page (the page uses the new value); each node lights up when the packet arrives.

**Narration and caption.** In the Components panel, select TodoList and edit its filter prop. The page then shows the list with the new filter.

**Sources.** react-devtools-docs

## 4. One action reaches the store and the extension (27.0–39.0 s)

**On screen.** Nodes dispatch, thunk middleware, logger, reducer, Redux DevTools. A packet moves dispatch→thunk, thunk→logger, logger→reducer, reducer→ext (action and state sent); each node lights up when the packet arrives.

**Narration and caption.** Dispatch todoAdded. The action passes the thunk middleware, then the logger. The reducer returns the next state, and the store sends the action and state to the extension.

**Sources.** redux-configure-store-docs

## 5. The devTools option connects the store (39.0–50.0 s)

**On screen.** Two columns, "devTools: true (default)" and "devTools: false", fill in pairs; verdict: An options object names the store and sanitizes data..

**Narration and caption.** configureStore sets devTools to true by default. Set it to false, and the store still updates, but the extension receives nothing.

**Sources.** redux-configure-store-docs

## 6. Middleware run in array order (50.0–60.0 s)

**On screen.** A timeline reveals thunk middleware → logger (concat) → reducer.

**Narration and caption.** Middleware run in array order. concat puts the logger after the defaults, so the thunk middleware resolves thunks before the logger sees the action.

**Sources.** redux-configure-store-docs

## 7. Safari: the standalone react-devtools (60.0–70.0 s)

**On screen.** Numbered steps appear one at a time: npm install -g react-devtools → Run react-devtools in a terminal → Add script src localhost:8097 to the head → Reload the website.

**Narration and caption.** Other browsers, such as Safari, use the react-devtools npm package. Run it, add its script tag to the head, and reload.

**Sources.** react-devtools-docs
