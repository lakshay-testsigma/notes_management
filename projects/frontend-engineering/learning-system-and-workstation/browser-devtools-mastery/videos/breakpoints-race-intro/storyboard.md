# Storyboard: Why a search box shows stale results

**Purpose.** See how two racing fetches cause stale results, and why a breakpoint finds the cause faster than console.log.

**Why a video.** The bug depends on the order in which two responses arrive, so motion shows the cause better than one static picture.

**Length.** 45.0 s, 5 scenes.

## 1. Stale search results (0.0–5.0 s)

**On screen.** Title card with "Two fetches, one list".

**Narration and caption.** This search box shows results for an old query. Breakpoints show you why.

## 2. Two requests race (5.0–18.0 s)

**On screen.** Nodes Search box, Server, Results list. A packet moves box→server (The first request is slow.), box→server (The second request starts before the first ends.), server→list (The fast response arrives first.), server→list (The slow response arrives last and wins.); each node lights up when the packet arrives.

**Narration and caption.** The user types re, then react. Each input event starts a fetch to the server. The react response comes back first. The slow re response comes back last and overwrites the list.

**Sources.** chrome-devtools-docs

## 3. console.log or a breakpoint (18.0–28.0 s)

**On screen.** Two columns, "console.log" and "Breakpoint", fill in pairs; verdict: A breakpoint shows values you did not think to log..

**Narration and caption.** A console.log prints only the values you guessed in advance. A breakpoint pauses the code, so you can read every variable in scope.

**Sources.** chrome-devtools-docs

## 4. The debugging loop (28.0–40.0 s)

**On screen.** Numbered steps appear one at a time: Set a breakpoint in Sources → DevTools pauses before the line → Read Scope, Watch and Call Stack → Step or resume.

**Narration and caption.** In the Sources panel, you set a breakpoint. DevTools pauses before that line runs. You read the Scope, Watch and Call Stack panes, then step or resume.

**Sources.** chrome-devtools-docs

## 5. Now catch the race (40.0–45.0 s)

**On screen.** Title card with "Line, conditional and fetch breakpoints".

**Narration and caption.** Next, you set the breakpoints yourself and catch the stale response.
