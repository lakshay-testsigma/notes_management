# Catch the search race with breakpoints

A fetch breakpoint pauses on line 12 each time a request to search?q= starts. A line-of-code breakpoint on line 5 pauses for both responses. A conditional breakpoint with query !== input.value pauses only on the stale re response. Step into enters render, step over runs one line, step out returns. After an await the stack holds only the resumed code; async frames link it back to the code that started the fetch.

**00:00 The code under test.** The onInput function reads the box on line 3, awaits getJSON on line 4, and calls render on line 5.

**00:08 A fetch breakpoint.** An XHR or fetch breakpoint with the text search?q= pauses on line 12 when a request URL contains it. It pauses twice: for re, then for react.

**00:19 A line-of-code breakpoint.** A line-of-code breakpoint on line 5 pauses for every response. First react arrives, and query matches the box. Then re arrives, but the box still says react.

**00:31 A conditional breakpoint.** A conditional breakpoint pauses only when its condition is true. With query !== input.value, it skips the fresh react response and stops on the stale re response.

**00:43 Step into, over and out.** Step into enters render, so render goes on top of the Call Stack. Step over runs one line. Step out finishes render and returns to onInput.

**00:55 Async frames link the call history.** After an await, the stack holds only the resumed code. Async frames link it back to the code that started the fetch, so the Call Stack shows the whole history.

Sources:

- Chrome DevTools — https://developer.chrome.com/docs/devtools
