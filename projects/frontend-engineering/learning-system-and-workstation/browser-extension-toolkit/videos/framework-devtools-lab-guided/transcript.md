# Framework devtools show components and store actions

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
