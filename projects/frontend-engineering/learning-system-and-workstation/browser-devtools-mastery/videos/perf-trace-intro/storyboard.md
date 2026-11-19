# Storyboard: One slow click, recorded in a trace

**Purpose.** See how a Performance recording shows a slow click as a long task on the main thread.

**Why a video.** Recording, the task and the red mark happen in order, and each step depends on the step before.

**Length.** 45.0 s, 5 scenes.

## 1. One slow click, recorded (0.0–8.0 s)

**On screen.** Title card with "Record, find the long task, explain the delay".

**Narration and caption.** A button click feels slow. The Performance panel records a trace, so you can see the slow task.

**Sources.** chrome-devtools-performance-reference

## 2. Record a runtime trace (8.0–17.0 s)

**On screen.** Numbered steps appear one at a time: Open the Performance panel → Set CPU throttling → Click Record, then click the button → Click Stop and read the Main track.

**Narration and caption.** Open the Performance panel. Set CPU throttling. Click Record, click the button, then click Stop. The Main track shows the tasks.

**Sources.** chrome-devtools-performance-reference

## 3. The click becomes a task (17.0–27.0 s)

**On screen.** Nodes Click, Task, Next paint. A packet moves click→task, task→paint (waits for the task); each node lights up when the packet arrives.

**Narration and caption.** The click starts a task on the main thread. The main thread runs one task at a time, so the next paint waits.

**Sources.** webdev-optimize-long-tasks

## 4. Throttling slows the same work (27.0–35.0 s)

**On screen.** Bars grow for No throttling 40 ms, 4x slowdown 160 ms, 6x slowdown 240 ms.

**Narration and caption.** In this example the handler needs 40 milliseconds. A 4x slowdown makes it 160, and 6x makes it 240.

**Sources.** chrome-devtools-performance-reference

## 5. Over 50 ms is a long task (35.0–45.0 s)

**On screen.** Two columns, "Under 50 ms" and "Over 50 ms", fill in pairs; verdict: A 160 ms task: the last 110 ms are red..

**Narration and caption.** Any task over 50 milliseconds is a long task. DevTools adds a red triangle and shades only the time past 50 milliseconds red.

**Sources.** chrome-devtools-performance-reference, webdev-optimize-long-tasks
