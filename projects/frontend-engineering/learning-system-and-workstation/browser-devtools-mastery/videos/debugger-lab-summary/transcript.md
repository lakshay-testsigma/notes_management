# Pick the breakpoint for the bug

Use a line-of-code breakpoint when you know the line, a conditional breakpoint when only some calls are wrong, and a logpoint when you must not pause. When you do not know the line, break on the cause: an XHR or fetch request, a DOM change, an event listener or an exception. At the pause read Scope and the Call Stack; async frames show who started the wait and the ignore list hides library frames. The search race is fixed by returning early when q !== input.value.

**00:00 Pick the breakpoint for the bug.** Which breakpoint catches which bug?

**00:05 When you know the line.** Know the line? Use a line-of-code breakpoint. Only some calls are wrong? Use a conditional breakpoint. Must not pause? Use a logpoint.

**00:16 When you do not know the line.** When you do not know the line, break on the cause: a fetch request, a DOM change, an event listener, or an exception.

**00:27 Read the pause.** At the pause, read Scope for the values and the Call Stack for the callers. Async frames show who started the wait. The ignore list hides library frames.

**00:39 Fix the race.** The bug: render used a stale response. The fix on line 6: return when q !== input.value.

Sources:

- Chrome DevTools documentation: Elements/CSS, Console, JavaScript debugging, Overrides — https://developer.chrome.com/docs/devtools
