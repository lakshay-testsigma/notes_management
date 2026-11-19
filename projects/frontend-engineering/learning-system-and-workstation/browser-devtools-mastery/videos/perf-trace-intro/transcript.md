# One slow click, recorded in a trace

You open the Performance panel, set CPU throttling, record while you click a button, and stop. The Main track shows the click handler as a task. In this example the handler needs 40 ms, 160 ms at 4x and 240 ms at 6x. A task over 50 ms is a long task: DevTools adds a red triangle and shades the time past 50 ms.

**00:00 One slow click, recorded.** A button click feels slow. The Performance panel records a trace, so you can see the slow task.

**00:08 Record a runtime trace.** Open the Performance panel. Set CPU throttling. Click Record, click the button, then click Stop. The Main track shows the tasks.

**00:17 The click becomes a task.** The click starts a task on the main thread. The main thread runs one task at a time, so the next paint waits.

**00:27 Throttling slows the same work.** In this example the handler needs 40 milliseconds. A 4x slowdown makes it 160, and 6x makes it 240.

**00:35 Over 50 ms is a long task.** Any task over 50 milliseconds is a long task. DevTools adds a red triangle and shades only the time past 50 milliseconds red.

Sources:

- Performance features reference — https://developer.chrome.com/docs/devtools/performance/reference
- Optimize long tasks — https://web.dev/articles/optimize-long-tasks
