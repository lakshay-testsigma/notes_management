---
title: "Triage a production bug: which panel first?"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-docs, chrome-devtools-network-reference, chrome-devtools-performance-reference, chrome-devtools-memory-docs, webkit-web-inspector-docs]
---
# Triage a production bug: which panel first?

**Branching presentations** · teaches Debugging workflow, Browser DevTools

**Why this visual.** Choose the first DevTools panel from the symptom a user reports, and see what evidence each panel gives.

Branching presentation (HyperFrames slideshow), 5 main slides and 6 deep dives: "Slow first load", "Slow clicks", "Memory grows", "Broken layout", "Stale data", "Error only on iPhone". Status: **built**.

Editable project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/debugging-triage-paths` (change `deck.json`, then `tutor deck frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build debugging-triage-paths`). Present it live: `npx --yes hyperframes@0.9.59 present projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/debugging-triage-paths/composition`.

On the site it opens in the Deep dive tab of its experience; composition `/media/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/debugging-triage-paths/composition/index.html`.

## Outline

A user reports a problem on a live site. The deck groups six symptoms: a slow first load, slow clicks, growing memory, a broken layout, old data after a deploy and an error only on an iPhone. Each branch opens the panel that records the matching evidence, shows what to read there, and names the cost of opening the wrong panel first.

**Purpose.** Choose the first DevTools panel from the symptom a user reports, and see what evidence each panel gives.

### Main path

### 1. A user reports a bug. Where do you look?

**On screen.** Title card with "Start from the symptom, not from your favorite panel".

**Notes.** State the decision: DevTools has many panels, and the first one you open decides how fast you find evidence.

### 2. Each panel records one kind of evidence

**On screen.** Numbered steps appear one at a time: Network: every request and its timing phases → Performance: main-thread tasks on a timeline → Memory: what the JavaScript heap holds → Elements: the DOM and the CSS rules that apply → Application: service workers, caches and storage.

**Notes.** Name what each panel records. The symptom tells you which kind of evidence holds the cause.

### 3. Symptoms of speed and memory

**On screen.** Numbered steps appear one at a time: The first load is slow → Clicks and scrolling feel slow → The tab gets slower the longer it is open.

**Notes.** Three symptoms look alike to a user: the site feels slow. Open each branch to see which panel separates them.

**Branches.** deep dive "Slow first load", deep dive "Slow clicks", deep dive "Memory grows".

### 4. Symptoms of a wrong result

**On screen.** Numbered steps appear one at a time: The layout is broken → Users see old data after a deploy → An error happens only on an iPhone.

**Notes.** These three symptoms show wrong output, not slow output. Open each branch to see where the cause is recorded.

**Branches.** deep dive "Broken layout", deep dive "Stale data", deep dive "Error only on iPhone".

### 5. The triage rule

**On screen.** Numbered steps appear one at a time: Write the symptom in one sentence → Open the panel that records that evidence → Reproduce the problem while it records → Change code only after the evidence names a cause.

**Notes.** Turn the branches into one repeatable procedure that works for a symptom you have not seen before.

### Deep dive: Slow first load

### 1. Open Network and read the Timing tab

**On screen.** Numbered steps appear one at a time: Tick Disable cache: you load like a first-time visitor → Throttle to Slow 4G and reload → Open the slowest request, then its Timing tab → Long Waiting (TTFB): look at the server → Long Content Download: look at file size.

**Notes.** Tick Disable cache to load the page like a first-time visitor, pick a slow throttling preset, reload, then open the slowest request's Timing tab.

### 2. Wrong first choice: Memory

**On screen.** Two columns, "Network first" and "Memory first", fill in pairs; verdict: A slow load is a request problem until the Timing tab says otherwise..

**Notes.** A heap snapshot shows what JavaScript holds in memory. It has no request timing, so it cannot show a slow server or a large file.

### Deep dive: Slow clicks

### 1. Open Performance and record the click

**On screen.** Nodes Record, Main track, Red part, Bottom-up. A packet moves rec→main (trace of tasks), main→red (find the long task), red→bu (name the cost); each node lights up when the packet arrives.

**Notes.** Click Record, repeat the slow click, stop. In the Main track a task over 50 ms is a long task; the part beyond 50 ms is red. Bottom-up shows which function used the time.

### 2. Wrong first choice: Network

**On screen.** Two columns, "Performance first" and "Network first", fill in pairs; verdict: Slow input is a main-thread problem until the trace says otherwise..

**Notes.** Network lists requests. A click handler that only runs JavaScript sends no request, so Network shows nothing slow while the main thread is busy.

### Deep dive: Memory grows

### 1. Name the memory symptom first

**On screen.** Two columns, "Symptom" and "Likely problem", fill in pairs.

**Notes.** The memory docs list three symptoms. Progressive slowdown suggests a leak, constant bad performance suggests bloat, and frequent pauses suggest frequent garbage collection.

### 2. Compare two heap snapshots

**On screen.** A timeline reveals Snapshot 1 → Open and close the dialog → Snapshot 2 → Comparison view.

**Notes.** Take a heap snapshot, do the action and undo it, take a second snapshot, then use the Comparison view. Detached DOM nodes are removed from the page but still referenced by JavaScript.

### 3. Wrong first choice: one snapshot

**On screen.** Two columns, "Two snapshots" and "One snapshot", fill in pairs; verdict: A leak is a change over time, so measure twice..

**Notes.** One snapshot shows the heap at one moment. A leak is growth, so you need two snapshots around the same action to see it.

### Deep dive: Broken layout

### 1. Open Elements and inspect the box

**On screen.** Numbered steps appear one at a time: Right-click the broken element, choose Inspect → Read the Styles pane: which rules apply → Crossed-out rules were overridden → Edit a value live to test the fix.

**Notes.** Right-click the broken element and choose Inspect. The Styles pane lists the CSS rules that apply, shows overridden ones crossed out, and lets you edit a value to test a fix live.

### 2. Wrong first choice: Sources

**On screen.** Two columns, "Elements first" and "Sources first", fill in pairs; verdict: Inspect the box before you debug the script..

**Notes.** Sources pauses JavaScript. When a CSS rule causes the broken layout, stepping through scripts spends time on code that is not the cause.

### Deep dive: Stale data

### 1. Open Application, then Network

**On screen.** Numbered steps appear one at a time: Application, Service Workers: which worker is active → Tick Update on reload or Bypass for network → Application, Cache Storage: the cached responses → Network, Disable cache: reload and compare.

**Notes.** In Application, the Service Workers tab shows the active worker and offers Update on reload and Bypass for network. Cache Storage lists cached responses. In Network, tick Disable cache and reload to compare.

### 2. Wrong first choice: Elements

**On screen.** Two columns, "Application first" and "Elements first", fill in pairs; verdict: Find where the data came from, not only what it shows..

**Notes.** Elements shows the old value in the DOM. It does not show where the value came from, a cache, a service worker or the server.

### Deep dive: Error only on iPhone

### 1. Attach Web Inspector to the real iPhone

**On screen.** Numbered steps appear one at a time: iPhone: Settings, Safari, Advanced, Web Inspector on → Mac Safari: show features for web developers → Connect the cable → Develop menu: pick the iPhone and the page → Read the error in the device's Console.

**Notes.** On the iPhone, turn on Safari, Advanced, Web Inspector. On the Mac, turn on the Safari developer features, connect the cable, then pick the device in the Develop menu and read its Console and Sources.

### 2. Wrong first choice: device mode only

**On screen.** Two columns, "Real device" and "Device mode", fill in pairs; verdict: Use device mode for layout; use the real device for a device-only error..

**Notes.** Chrome device mode is a first-order approximation: the page still runs in desktop Chrome on your laptop. An error that comes from the phone's browser may not appear there.

## What it shows

Each panel records one kind of evidence, so the symptom tells you which panel can show the cause first.

Text alternative: A user reports a problem on a live site. The deck groups six symptoms: a slow first load, slow clicks, growing memory, a broken layout, old data after a deploy and an error only on an iPhone. Each branch opens the panel that records the matching evidence, shows what to read there, and names the cost of opening the wrong panel first.

## Check yourself

A page gets slower each time a user opens and closes a dialog. Which panel do you open first, and what do you do there?

Answer: Memory: take a heap snapshot, open and close the dialog, take a second snapshot, and compare them to see what grows.

## Sources

- Chrome DevTools — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)
- Network features reference — https://developer.chrome.com/docs/devtools/network/reference (`chrome-devtools-network-reference`)
- Performance features reference — https://developer.chrome.com/docs/devtools/performance/reference (`chrome-devtools-performance-reference`)
- Fix memory problems — https://developer.chrome.com/docs/devtools/memory-problems (`chrome-devtools-memory-docs`)
- Web Inspector Reference (WebKit) — https://webkit.org/web-inspector/ (`webkit-web-inspector-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/12-a-production-debugging-workflow/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/12-a-production-debugging-workflow.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
