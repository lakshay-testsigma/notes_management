# Storyboard: Catch the search race with breakpoints

**Purpose.** Use fetch, line and conditional breakpoints, stepping and async frames to find which response makes the list stale.

**Why a video.** Each pause depends on the one before it, and the call stack changes at every step, so a guided sequence shows the change.

**Length.** 68.0 s, 6 scenes.

## 1. The code under test (0.0–8.0 s)

**On screen.** Title card with "onInput: line 3 query, line 4 getJSON, line 5 render".

**Narration and caption.** The onInput function reads the box on line 3, awaits getJSON on line 4, and calls render on line 5.

## 2. A fetch breakpoint (8.0–19.0 s)

**On screen.** Nodes input event, Line 12, Paused. A packet moves event→line4, line4→pause (Pause 1: the re request starts.), event→line4, line4→pause (Pause 2: the react request starts.); each node lights up when the packet arrives.

**Narration and caption.** An XHR or fetch breakpoint with the text search?q= pauses on line 12 when a request URL contains it. It pauses twice: for re, then for react.

**Sources.** chrome-devtools-docs

## 3. A line-of-code breakpoint (19.0–31.0 s)

**On screen.** Numbered steps appear one at a time: Pause 1: query is react, box is react → Resume: label says Results for react → Pause 2: query is re, box is react → Resume: label says Results for re.

**Narration and caption.** A line-of-code breakpoint on line 5 pauses for every response. First react arrives, and query matches the box. Then re arrives, but the box still says react.

**Sources.** chrome-devtools-docs

## 4. A conditional breakpoint (31.0–43.0 s)

**On screen.** The expression query !== input.value with "query", "input.value", "!==" highlighted in turn and explained.

**Narration and caption.** A conditional breakpoint pauses only when its condition is true. With query !== input.value, it skips the fresh react response and stops on the stale re response.

**Sources.** chrome-devtools-docs

## 5. Step into, over and out (43.0–55.0 s)

**On screen.** Numbered steps appear one at a time: Step into: pause on line 8 in render → Step over: line 8 runs, pause on line 9 → Step over: label says Results for re → Step out: back in onInput.

**Narration and caption.** Step into enters render, so render goes on top of the Call Stack. Step over runs one line. Step out finishes render and returns to onInput.

**Sources.** chrome-devtools-docs

## 6. Async frames link the call history (55.0–68.0 s)

**On screen.** Two columns, "Synchronous frames only" and "With async frames", fill in pairs; verdict: The async frames show which input event started the stale request..

**Narration and caption.** After an await, the stack holds only the resumed code. Async frames link it back to the code that started the fetch, so the Call Stack shows the whole history.

**Sources.** chrome-devtools-docs
