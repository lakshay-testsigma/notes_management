# Storyboard: Find the long task in a trace

**Purpose.** Find the long task in the Main track, read the interaction's INP, and see how CPU throttling and a split task change it.

**Why a video.** Each step depends on the one before: the throttled recording shows the long task, the long task explains the slow interaction, and the fix changes the next recording.

**Length.** 83.0 s, 7 scenes.

## 1. Find the long task (0.0–5.0 s)

**On screen.** Title card with "An example trace, recorded at 20x CPU slowdown".

**Narration and caption.** Here is one example trace of a single click.

**Sources.** chrome-devtools-measure-docs

## 2. Read the flame chart (5.0–17.0 s)

**On screen.** Numbered steps appear one at a time: x-axis: time → y-axis: call stack → Events on top cause the events below.

**Narration and caption.** The Main track is a flame chart. The x-axis is time. The y-axis is the call stack. Events on top cause the events below.

**Sources.** chrome-devtools-measure-docs

## 3. One long task (17.0–29.0 s)

**On screen.** Bars grow for Timer 20ms, Click handler 300ms, Paint 40ms.

**Narration and caption.** At 20x slowdown the click handler takes 300 milliseconds. A red triangle marks it, and the part over 50 milliseconds is red.

**Sources.** chrome-devtools-measure-docs, web-dev-vitals-docs

## 4. The interaction's time (29.0–43.0 s)

**On screen.** The expression 360 ms = 20 ms input delay + 300 ms processing + 40 ms presentation delay with "20 ms input delay", "300 ms processing", "40 ms presentation delay" highlighted in turn and explained.

**Narration and caption.** The Interactions track splits the click into input delay, processing time and presentation delay. Here they add up to 360 milliseconds.

**Sources.** chrome-devtools-measure-docs

## 5. Why throttle the CPU (43.0–57.0 s)

**On screen.** Two columns, "No throttling" and "20x slowdown", fill in pairs; verdict: Same code, slower CPU, longer tasks..

**Narration and caption.** Without throttling, the same handler takes 15 milliseconds and INP is 18. The 20x slowdown shows what a slower device feels.

**Sources.** chrome-devtools-measure-docs

## 6. Split the work (57.0–71.0 s)

**On screen.** Two columns, "Before" and "After", fill in pairs; verdict: No task over 50 ms; INP under 200 ms..

**Narration and caption.** Before: one 300 millisecond task. After: update the page in 40 milliseconds, then yield. The browser paints, the rest runs in short tasks, and INP drops to 100.

**Sources.** chrome-devtools-measure-docs, web-dev-vitals-docs

## 7. Layout shifts track (71.0–83.0 s)

**On screen.** Numbered steps appear one at a time: Each shift: a purple diamond → Nearby shifts: one cluster → Good CLS: 0.1 or less.

**Narration and caption.** The Layout shifts track shows each shift as a purple diamond, grouped in clusters. Keep CLS at 0.1 or less.

**Sources.** chrome-devtools-measure-docs, web-dev-vitals-docs
