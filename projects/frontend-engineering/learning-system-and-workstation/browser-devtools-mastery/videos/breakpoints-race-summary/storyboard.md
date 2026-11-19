# Storyboard: Breakpoints and async stacks in one minute

**Purpose.** Recall which breakpoint answers which question, and how the async call stack explains a race.

**Why a video.** The summary follows the order of a real debugging session, from the symptom to the evidence.

**Length.** 39.0 s, 4 scenes.

## 1. What you found (0.0–5.0 s)

**On screen.** Title card with "Evidence, not guesses".

**Narration and caption.** The stale list came from a slow response that arrived last.

## 2. Pick the breakpoint by the question (5.0–18.0 s)

**On screen.** Numbered steps appear one at a time: Line-of-code: you know the line → Conditional: pause only when it matters → XHR/fetch: you know part of the URL → DOM change: you know the element.

**Narration and caption.** Use a line-of-code breakpoint when you know the line. Add a condition to skip pauses you do not need. Use a fetch breakpoint when you know only the URL.

**Sources.** chrome-devtools-docs

## 3. Read the pause (18.0–30.0 s)

**On screen.** Two columns, "Scope and Watch" and "Call Stack", fill in pairs; verdict: Values say what is wrong; the stack says where it came from..

**Narration and caption.** At each pause, Scope shows the local values, Watch tracks your own expression, and the Call Stack shows how the code got there.

**Sources.** chrome-devtools-docs

## 4. From evidence to fix (30.0–39.0 s)

**On screen.** Title card with "Ignore responses for old queries".

**Narration and caption.** The evidence points to the fix. The code must ignore a response whose query no longer matches the box.
