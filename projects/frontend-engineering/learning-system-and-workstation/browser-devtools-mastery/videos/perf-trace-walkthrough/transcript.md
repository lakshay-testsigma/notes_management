# Find the long task in a trace

A guided walkthrough of one example trace: at 20x CPU slowdown a 15 ms click handler becomes a 300 ms long task, the interaction takes 360 ms, and splitting the work so the page paints first brings it down to 100 ms. The numbers are an example.

**00:00 Find the long task.** Here is one example trace of a single click.

**00:05 Read the flame chart.** The Main track is a flame chart. The x-axis is time. The y-axis is the call stack. Events on top cause the events below.

**00:17 One long task.** At 20x slowdown the click handler takes 300 milliseconds. A red triangle marks it, and the part over 50 milliseconds is red.

**00:29 The interaction's time.** The Interactions track splits the click into input delay, processing time and presentation delay. Here they add up to 360 milliseconds.

**00:43 Why throttle the CPU.** Without throttling, the same handler takes 15 milliseconds and INP is 18. The 20x slowdown shows what a slower device feels.

**00:57 Split the work.** Before: one 300 millisecond task. After: update the page in 40 milliseconds, then yield. The browser paints, the rest runs in short tasks, and INP drops to 100.

**01:11 Layout shifts track.** The Layout shifts track shows each shift as a purple diamond, grouped in clusters. Keep CLS at 0.1 or less.

Sources:

- Chrome DevTools: Performance, Application, Coverage, Rendering and Recorder docs — https://developer.chrome.com/docs/devtools/performance/reference
- web.dev: Core Web Vitals, long tasks and bfcache — https://web.dev/articles/vitals
