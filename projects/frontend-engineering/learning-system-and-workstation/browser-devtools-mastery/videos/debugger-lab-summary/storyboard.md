# Storyboard: Pick the breakpoint for the bug

**Purpose.** Connect each kind of bug to the breakpoint type that catches it, and recall what to read when the page pauses.

**Why a video.** The summary walks the debugging loop in order: choose a breakpoint, pause, read Scope and the Call Stack, then fix the code.

**Length.** 48.0 s, 5 scenes.

## 1. Pick the breakpoint for the bug (0.0–5.0 s)

**On screen.** Title card with "Choose, pause, read, fix".

**Narration and caption.** Which breakpoint catches which bug?

## 2. When you know the line (5.0–16.0 s)

**On screen.** Numbered steps appear one at a time: Know the line: line-of-code breakpoint → Some calls wrong: conditional breakpoint → Must not pause: logpoint.

**Narration and caption.** Know the line? Use a line-of-code breakpoint. Only some calls are wrong? Use a conditional breakpoint. Must not pause? Use a logpoint.

**Sources.** chrome-devtools-docs

## 3. When you do not know the line (16.0–27.0 s)

**On screen.** Numbered steps appear one at a time: A request: XHR/fetch breakpoint → A changed node: DOM change breakpoint → A click or key: event listener breakpoint → A thrown error: exception breakpoint.

**Narration and caption.** When you do not know the line, break on the cause: a fetch request, a DOM change, an event listener, or an exception.

**Sources.** chrome-devtools-docs

## 4. Read the pause (27.0–39.0 s)

**On screen.** Numbered steps appear one at a time: Scope: the values now → Call Stack: who called → Async frames: who started the wait → Ignore list: hide library frames.

**Narration and caption.** At the pause, read Scope for the values and the Call Stack for the callers. Async frames show who started the wait. The ignore list hides library frames.

**Sources.** chrome-devtools-docs

## 5. Fix the race (39.0–48.0 s)

**On screen.** Numbered steps appear one at a time: Bug: render used a stale response → Fix: return when q !== input.value.

**Narration and caption.** The bug: render used a stale response. The fix on line 6: return when q !== input.value.
