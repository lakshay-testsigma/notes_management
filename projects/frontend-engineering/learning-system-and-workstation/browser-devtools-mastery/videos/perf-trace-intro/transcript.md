# Why a click can feel slow

An intro to the Performance panel: Live metrics show LCP, CLS and INP for the open page, a recorded trace shows every task on the main thread, and a long task between a click and the next paint makes the interaction slow.

**00:00 Why a click can feel slow.** A click feels slow when the main thread is busy. The Performance panel shows why.

**00:06 Live metrics first.** Open the Performance panel. Live metrics show your local LCP and CLS at once. Click on the page, and INP appears too.

**00:18 From click to paint.** A click starts a task on the main thread. The handler runs. Only after it ends can the browser paint the next frame.

**00:32 Record a trace.** To see the cause, record a trace. Set a CPU slowdown in Capture settings, click Record, click the page, then click Stop.

**00:46 What good looks like.** Good values: LCP 2.5 seconds or less, INP 200 milliseconds or less, and CLS 0.1 or less.

Sources:

- Chrome DevTools: Performance, Application, Coverage, Rendering and Recorder docs — https://developer.chrome.com/docs/devtools/performance/reference
- web.dev: Core Web Vitals, long tasks and bfcache — https://web.dev/articles/vitals
