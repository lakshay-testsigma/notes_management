# Traces and Web Vitals in four rules

A recap: throttle the CPU before you record, find tasks over 50 ms in the Main track, read the interaction's input delay, processing time and presentation delay, fix it by splitting the work, and check LCP, INP and CLS against their good values.

**00:00 Four rules.** Four rules for every performance check.

**00:05 The routine.** Throttle the CPU. Record and click. Find tasks over 50 milliseconds. Split the work so the page paints first, then record again.

**00:21 The good values.** Then compare with the good values: LCP 2.5 seconds, INP 200 milliseconds, CLS 0.1.

Sources:

- Chrome DevTools: Performance, Application, Coverage, Rendering and Recorder docs — https://developer.chrome.com/docs/devtools/performance/reference
- web.dev: Core Web Vitals, long tasks and bfcache — https://web.dev/articles/vitals
