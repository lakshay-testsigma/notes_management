# Storyboard: Why a click can feel slow

**Purpose.** See how a busy main thread delays the next paint after a click, and how the Performance panel records it.

**Why a video.** A click, the work it starts and the next paint happen in a fixed order, so motion shows the delay better than one picture.

**Length.** 58.0 s, 5 scenes.

## 1. Why a click can feel slow (0.0–6.0 s)

**On screen.** Title card with "Live metrics, traces and long tasks".

**Narration and caption.** A click feels slow when the main thread is busy. The Performance panel shows why.

**Sources.** chrome-devtools-measure-docs

## 2. Live metrics first (6.0–18.0 s)

**On screen.** Numbered steps appear one at a time: Open the Performance panel → LCP and CLS show at once → Interact with the page → INP shows after the interaction.

**Narration and caption.** Open the Performance panel. Live metrics show your local LCP and CLS at once. Click on the page, and INP appears too.

**Sources.** chrome-devtools-measure-docs

## 3. From click to paint (18.0–32.0 s)

**On screen.** Nodes Click, Main thread task, Next paint. A packet moves click→task, task→paint (waits for the task); each node lights up when the packet arrives.

**Narration and caption.** A click starts a task on the main thread. The handler runs. Only after it ends can the browser paint the next frame.

**Sources.** chrome-devtools-measure-docs, web-dev-vitals-docs

## 4. Record a trace (32.0–46.0 s)

**On screen.** Numbered steps appear one at a time: Capture settings: CPU slowdown → Click Record → Click the button on the page → Click Stop and read the Main track.

**Narration and caption.** To see the cause, record a trace. Set a CPU slowdown in Capture settings, click Record, click the page, then click Stop.

**Sources.** chrome-devtools-measure-docs

## 5. What good looks like (46.0–58.0 s)

**On screen.** Numbered steps appear one at a time: LCP: 2.5 s or less → INP: 200 ms or less → CLS: 0.1 or less.

**Narration and caption.** Good values: LCP 2.5 seconds or less, INP 200 milliseconds or less, and CLS 0.1 or less.

**Sources.** web-dev-vitals-docs
