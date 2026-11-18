# Storyboard: Traces and Web Vitals in four rules

**Purpose.** Connect throttling, long tasks, INP and layout shifts into one routine for every performance check.

**Why a video.** The rules build on each other: throttling reveals long tasks, long tasks explain slow interactions, and the next recording proves the fix.

**Length.** 33.0 s, 3 scenes.

## 1. Four rules (0.0–5.0 s)

**On screen.** Title card with "Throttle, find, split, record again".

**Narration and caption.** Four rules for every performance check.

**Sources.** chrome-devtools-measure-docs

## 2. The routine (5.0–21.0 s)

**On screen.** Numbered steps appear one at a time: Throttle the CPU → Record and click → Find tasks over 50 ms → Split the work, record again.

**Narration and caption.** Throttle the CPU. Record and click. Find tasks over 50 milliseconds. Split the work so the page paints first, then record again.

**Sources.** chrome-devtools-measure-docs, web-dev-vitals-docs

## 3. The good values (21.0–33.0 s)

**On screen.** Numbered steps appear one at a time: LCP: 2.5 s or less → INP: 200 ms or less → CLS: 0.1 or less.

**Narration and caption.** Then compare with the good values: LCP 2.5 seconds, INP 200 milliseconds, CLS 0.1.

**Sources.** web-dev-vitals-docs
