# Walk through a throttled trace

A guided walk through one click handler. At 1x it is one 40 ms task. The flame chart shows time from left to right and the call stack from top to bottom. A 4x slowdown makes one 160 ms long task, and a second click waits 135 ms. Four yielding pieces of 40 ms remove the long task and cut the wait to 15 ms. At 6x the pieces are 60 ms and long again, so the work needs smaller pieces.

**00:00 No throttling: one 40 ms task.** Without throttling, the handler runs as one task of 40 milliseconds. That is under the 50 millisecond limit, so nothing is red.

**00:10 How to read the flame chart.** Read the flame chart like this. Left to right is time. Top to bottom is the call stack. An event on top causes the events below it.

**00:22 4x slowdown: one 160 ms task.** Now set a 4x slowdown. The CPU runs four times as slowly, so the same handler becomes one task of 160 milliseconds.

**00:32 The second click waits.** A second click arrives at 25 milliseconds. It waits until the task ends at 160. The last 110 milliseconds are shaded red.

**00:42 Yield between pieces.** Split the work into four pieces and yield between them. Each piece takes 40 milliseconds, so the click runs after the first piece.

**00:52 6x slowdown: smaller pieces.** At 6x, each of four pieces takes 60 milliseconds, so every piece is a long task again. Eight pieces of 30 milliseconds fix it.

Sources:

- Performance features reference — https://developer.chrome.com/docs/devtools/performance/reference
- Optimize long tasks — https://web.dev/articles/optimize-long-tasks
