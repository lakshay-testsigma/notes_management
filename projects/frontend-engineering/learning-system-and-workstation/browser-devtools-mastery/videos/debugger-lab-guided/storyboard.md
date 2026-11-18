# Storyboard: Catching the search race with breakpoints

**Purpose.** Use a line breakpoint, a conditional breakpoint, a logpoint and the ignore list on line 6 of the search code, and read the async call stack at the pause.

**Why a video.** Each step depends on the one before: the line breakpoint shows two pauses, the condition keeps only the stale one, the Call Stack explains it, and the ignore list cleans the stack.

**Length.** 65.0 s, 6 scenes.

## 1. Line 6 calls render(items) (0.0–8.0 s)

**On screen.** Title card with "app.js: await search(q), then render(items)".

**Narration and caption.** Line 5 waits for search(q). Line 6 calls render(items). We set breakpoints on line 6.

**Sources.** chrome-devtools-docs

## 2. A line breakpoint pauses twice (8.0–19.0 s)

**On screen.** Numbered steps appear one at a time: Pause 1: q is react → Pause 2: q is re → The list shows re results.

**Narration and caption.** A line breakpoint on line 6 pauses twice. Pause 1: q is react. Pause 2: q is re, so the list shows re results.

**Sources.** chrome-devtools-docs

## 3. A conditional breakpoint pauses only on the stale response (19.0–31.0 s)

**On screen.** Two columns, "Condition false" and "Condition true", fill in pairs; verdict: Condition: q !== input.value.

**Narration and caption.** Now add a condition to line 6: q !== input.value. Condition false means no pause. Condition true pauses on the stale re response.

**Sources.** chrome-devtools-docs

## 4. Read the async call stack (31.0–43.0 s)

**On screen.** Numbered steps appear one at a time: onInput app.js:6 → await → onInput app.js:5 → handle vendor.js:41 → dispatch vendor.js:88.

**Narration and caption.** The Call Stack shows onInput app.js:6, then await, then onInput app.js:5. The frames below await show the call that started the wait.

**Sources.** chrome-devtools-docs

## 5. A logpoint watches without pausing (43.0–54.0 s)

**On screen.** Numbered steps appear one at a time: Console: render react react → Console: render re react → The page never pauses.

**Narration and caption.** A logpoint on line 6 prints q and input.value. The Console shows render react react, then render re react. The page never pauses.

**Sources.** chrome-devtools-docs

## 6. The ignore list hides library frames (54.0–65.0 s)

**On screen.** Two columns, "Ignore list off" and "Ignore list on", fill in pairs; verdict: Library frames are hidden; your frames stay..

**Narration and caption.** Add vendor/events.js to the ignore list. Ignore list off: five frames. Ignore list on: only your own frames stay in the Call Stack.

**Sources.** chrome-devtools-docs, ecma-426-source-map
