# Breakpoints and async stacks in one minute

The summary replays the session. The symptom was a stale list. A fetch breakpoint showed two requests in flight. A conditional breakpoint paused only on the stale response. Stepping showed render writing the old label, and async frames showed which input event started the stale request.

**00:00 What you found.** The stale list came from a slow response that arrived last.

**00:05 Pick the breakpoint by the question.** Use a line-of-code breakpoint when you know the line. Add a condition to skip pauses you do not need. Use a fetch breakpoint when you know only the URL.

**00:18 Read the pause.** At each pause, Scope shows the local values, Watch tracks your own expression, and the Call Stack shows how the code got there.

**00:30 From evidence to fix.** The evidence points to the fix. The code must ignore a response whose query no longer matches the box.

Sources:

- Chrome DevTools — https://developer.chrome.com/docs/devtools
