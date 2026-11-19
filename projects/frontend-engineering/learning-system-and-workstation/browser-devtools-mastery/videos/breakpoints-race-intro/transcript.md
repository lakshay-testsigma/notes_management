# Why a search box shows stale results

A user types re and then react in a search box. Each input event starts a fetch. The react response arrives first and the slow re response arrives last, so the list shows results for the old query. A breakpoint pauses the code before a line runs, so you can read the Scope, Watch and Call Stack panes instead of guessing with console.log.

**00:00 Stale search results.** This search box shows results for an old query. Breakpoints show you why.

**00:05 Two requests race.** The user types re, then react. Each input event starts a fetch to the server. The react response comes back first. The slow re response comes back last and overwrites the list.

**00:18 console.log or a breakpoint.** A console.log prints only the values you guessed in advance. A breakpoint pauses the code, so you can read every variable in scope.

**00:28 The debugging loop.** In the Sources panel, you set a breakpoint. DevTools pauses before that line runs. You read the Scope, Watch and Call Stack panes, then step or resume.

**00:40 Now catch the race.** Next, you set the breakpoints yourself and catch the stale response.

Sources:

- Chrome DevTools — https://developer.chrome.com/docs/devtools
