# A search race in the Sources panel

A search box sends a request for re and then for react. The react response arrives first and the late re response renders last, so the list shows the wrong results. The Sources panel has a Navigator, an Editor and a Debugger with the Breakpoints, Scope and Call Stack panes. A breakpoint pauses the page; a logpoint prints to the Console and does not pause.

**00:00 The search box shows the wrong results.** You type react, but the list shows results for re. Why?

**00:06 Two requests race.** The Search box calls onInput twice, for re and then for react. The Server answers react first. The re response comes back late.

**00:17 The Sources panel has three parts.** The Sources panel has three parts. The Navigator lists the files. The Editor shows the code. The Debugger shows Breakpoints, Scope and Call Stack.

**00:28 Breakpoint or logpoint.** A Breakpoint pauses the page, so you can read Scope and the Call Stack. A Logpoint never pauses. It prints a message in the Console.

**00:38 Your plan in this lab.** In this lab you run the race, pause on the stale response, and read the async call stack.

Sources:

- Chrome DevTools documentation: Elements/CSS, Console, JavaScript debugging, Overrides — https://developer.chrome.com/docs/devtools
