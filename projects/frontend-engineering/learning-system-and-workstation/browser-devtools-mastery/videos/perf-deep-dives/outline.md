# Performance panel deep dives

A short deck on where page time goes. The main path covers the working loop, the long-task rule, the live metrics view and when to use each. One deep dive explains why the main thread blocks input and how scheduler.yield() splits work. The other shows how INP and CLS appear in a trace: the Interactions track, the Layout shifts track and the Insights tab.

**Purpose.** Go deeper into long tasks and yielding, and into the Core Web Vitals that the live metrics view and trace tracks show.

## Main path

### 1. Where did the time go?

**On screen.** Title card with "Long tasks and live metrics".

**Notes.** Ask the learner how they would find out why one click on a page feels slow.

### 2. The working loop

**On screen.** Numbered steps appear one at a time: Read live metrics: LCP, CLS, INP → Record a trace when it repeats → Find red marks in the Main track → Use Bottom-up to find the function.

**Notes.** Reveal one step at a time. Live metrics come first, a trace only when the problem repeats.

### 3. The 50 ms rule

**On screen.** Two columns, "Task of 40 ms" and "Task of 400 ms", fill in pairs; verdict: Only the time past 50 ms is red..

**Notes.** A task over 50 ms gets a red triangle, and only the time past 50 ms is shaded red.

**Branches.** deep dive "Long tasks and yielding".

### 4. Live metrics first

**On screen.** Numbered steps appear one at a time: LCP, CLS and INP update as you use the page → A SOFT NAV badge marks client-side navigations → Turn on field data to compare with real users.

**Notes.** The live metrics screen updates as you use the page, including soft navigations in single-page apps.

**Branches.** deep dive "Core Web Vitals in a trace".

### 5. Metrics spot, traces explain

**On screen.** Two columns, "Live metrics" and "Recorded trace", fill in pairs; verdict: Record when the problem repeats..

**Notes.** Live metrics are cheap and always on; a trace costs a recording but shows each task.

## Deep dive: Long tasks and yielding

### 1. One task at a time

**On screen.** Numbered steps appear one at a time: The main thread runs one task at a time → A click during a long task must wait → Blocking period: task time minus 50 ms.

**Notes.** The main thread can only process one task at a time, so input that arrives during a long task must wait.

### 2. Split the work

**On screen.** Two columns, "One task" and "Four pieces", fill in pairs; verdict: Same work, input runs between pieces..

**Notes.** Breaking a long task into smaller ones lets the browser respond to input between the pieces.

### 3. await scheduler.yield()

**On screen.** Numbered steps appear one at a time: await scheduler.yield() pauses the function → Input can run before the rest → The function continues where it stopped → Not in all browsers: use a fallback.

**Notes.** The await pauses the function; the browser can run input first, then the function continues where it left off.

## Deep dive: Core Web Vitals in a trace

### 1. INP: the Interactions track

**On screen.** Numbered steps appear one at a time: Red triangle: interaction over 200 ms → Hover: input delay → Processing time → Presentation delay.

**Notes.** Interactions over 200 ms get a red triangle; the tooltip splits the time into three parts.

### 2. CLS: the Layout shifts track

**On screen.** Numbered steps appear one at a time: Each shift is a purple diamond → Hover highlights the element → Click for score and culprits.

**Notes.** Each layout shift is a purple diamond; hover highlights the element, click shows the score and likely culprits.

### 3. The Insights tab

**On screen.** Numbered steps appear one at a time: Open Insights in the left sidebar → LCP and INP subparts → Third parties and legacy JavaScript.

**Notes.** The Insights tab in the left sidebar groups findings such as LCP and INP subparts and third parties.

