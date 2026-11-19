# Storyboard: Walk through a throttled trace

**Purpose.** Read the flame chart and see how throttling and yielding change long tasks and input delay.

**Why a video.** Each scene changes one setting of the same recording, so the learner sees cause and effect step by step.

**Length.** 62.0 s, 6 scenes.

## 1. No throttling: one 40 ms task (0.0–10.0 s)

**On screen.** Bars grow for Handler task 40 ms, Long-task limit 50 ms.

**Narration and caption.** Without throttling, the handler runs as one task of 40 milliseconds. That is under the 50 millisecond limit, so nothing is red.

**Sources.** chrome-devtools-performance-reference, webdev-optimize-long-tasks

## 2. How to read the flame chart (10.0–22.0 s)

**On screen.** Numbered steps appear one at a time: x-axis: time → y-axis: call stack → Events on top cause events below → A wide box is a slow call.

**Narration and caption.** Read the flame chart like this. Left to right is time. Top to bottom is the call stack. An event on top causes the events below it.

**Sources.** chrome-devtools-performance-reference

## 3. 4x slowdown: one 160 ms task (22.0–32.0 s)

**On screen.** Bars grow for No throttling 40 ms, 4x slowdown 160 ms.

**Narration and caption.** Now set a 4x slowdown. The CPU runs four times as slowly, so the same handler becomes one task of 160 milliseconds.

**Sources.** chrome-devtools-performance-reference

## 4. The second click waits (32.0–42.0 s)

**On screen.** A timeline reveals 0 ms → 25 ms → 50 ms → 160 ms.

**Narration and caption.** A second click arrives at 25 milliseconds. It waits until the task ends at 160. The last 110 milliseconds are shaded red.

**Sources.** chrome-devtools-performance-reference, webdev-optimize-long-tasks

## 5. Yield between pieces (42.0–52.0 s)

**On screen.** Two columns, "One task" and "Four pieces", fill in pairs; verdict: Same work, shorter wait..

**Narration and caption.** Split the work into four pieces and yield between them. Each piece takes 40 milliseconds, so the click runs after the first piece.

**Sources.** webdev-optimize-long-tasks

## 6. 6x slowdown: smaller pieces (52.0–62.0 s)

**On screen.** Bars grow for 4 pieces at 6x 60 ms, Long-task limit 50 ms, 8 pieces at 6x 30 ms.

**Narration and caption.** At 6x, each of four pieces takes 60 milliseconds, so every piece is a long task again. Eight pieces of 30 milliseconds fix it.

**Sources.** chrome-devtools-performance-reference, webdev-optimize-long-tasks
