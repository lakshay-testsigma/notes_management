# Performance traces in four rules

A recap. Live metrics show LCP, CLS and INP while you use the page. A recorded trace shows each task on the main thread. A task over 50 ms is a long task, and only the part past 50 ms is red. Yielding splits long work so input can run between pieces. Throttling is relative to your computer, so it is a guide, not a phone.

**00:00 Performance traces in four rules.** Four rules connect everything you tried in this lab.

**00:05 The rules.** Live metrics spot the problem. A trace shows each task. A task over 50 milliseconds is a long task. Yielding splits long work.

**00:15 Same work, shorter wait.** At 4x in our example, one big task made a second click wait 135 milliseconds. Four yielding pieces cut it to 15.

**00:25 Throttling is a guide.** Throttling slows your own computer. It cannot copy a real phone, so check field data when you can.

Sources:

- Performance features reference — https://developer.chrome.com/docs/devtools/performance/reference
- Optimize long tasks — https://web.dev/articles/optimize-long-tasks
