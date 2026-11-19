# Storyboard: Performance traces in four rules

**Purpose.** Connect live metrics, traces, long tasks and yielding into one way of working.

**Why a video.** The rules build on each other: metrics show a problem, a trace locates it, and the long-task rule explains it.

**Length.** 33.0 s, 4 scenes.

## 1. Performance traces in four rules (0.0–5.0 s)

**On screen.** Title card with "Measure, record, find, split".

**Narration and caption.** Four rules connect everything you tried in this lab.

**Sources.** chrome-devtools-performance-reference

## 2. The rules (5.0–15.0 s)

**On screen.** Numbered steps appear one at a time: Live metrics spot the problem → A trace shows each task → Over 50 ms is a long task → Yielding splits long work.

**Narration and caption.** Live metrics spot the problem. A trace shows each task. A task over 50 milliseconds is a long task. Yielding splits long work.

**Sources.** chrome-devtools-performance-reference, webdev-optimize-long-tasks

## 3. Same work, shorter wait (15.0–25.0 s)

**On screen.** Bars grow for One task at 4x 135 ms, Four pieces at 4x 15 ms.

**Narration and caption.** At 4x in our example, one big task made a second click wait 135 milliseconds. Four yielding pieces cut it to 15.

**Sources.** webdev-optimize-long-tasks

## 4. Throttling is a guide (25.0–33.0 s)

**On screen.** Two columns, "CPU throttling" and "Not a real phone", fill in pairs; verdict: Use throttling to find problems, not to promise numbers..

**Narration and caption.** Throttling slows your own computer. It cannot copy a real phone, so check field data when you can.

**Sources.** chrome-devtools-performance-reference
