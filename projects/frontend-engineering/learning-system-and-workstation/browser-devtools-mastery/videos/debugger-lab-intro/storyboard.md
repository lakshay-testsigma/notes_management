# Storyboard: A search race in the Sources panel

**Purpose.** See why a slow response can overwrite a newer one, and which parts of the Sources panel help you catch it.

**Why a video.** Two requests start in one order and their responses come back in the other order, so the bug is a sequence in time.

**Length.** 47.0 s, 5 scenes.

## 1. The search box shows the wrong results (0.0–6.0 s)

**On screen.** Title card with "A race between two search requests".

**Narration and caption.** You type react, but the list shows results for re. Why?

## 2. Two requests race (6.0–17.0 s)

**On screen.** Nodes Search box, onInput, Server. A packet moves box→app, app→srv, box→app, app→srv, srv→app, srv→app (The late response renders last); each node lights up when the packet arrives.

**Narration and caption.** The Search box calls onInput twice, for re and then for react. The Server answers react first. The re response comes back late.

**Sources.** chrome-devtools-docs

## 3. The Sources panel has three parts (17.0–28.0 s)

**On screen.** Numbered steps appear one at a time: Navigator: the files of the page → Editor: the code and its breakpoints → Debugger: Breakpoints, Scope, Call Stack.

**Narration and caption.** The Sources panel has three parts. The Navigator lists the files. The Editor shows the code. The Debugger shows Breakpoints, Scope and Call Stack.

**Sources.** chrome-devtools-docs

## 4. Breakpoint or logpoint (28.0–38.0 s)

**On screen.** Two columns, "Breakpoint" and "Logpoint", fill in pairs; verdict: Pause to inspect; log to watch without stopping..

**Narration and caption.** A Breakpoint pauses the page, so you can read Scope and the Call Stack. A Logpoint never pauses. It prints a message in the Console.

**Sources.** chrome-devtools-docs

## 5. Your plan in this lab (38.0–47.0 s)

**On screen.** Numbered steps appear one at a time: Run the race → Pause on the stale response → Read the async call stack.

**Narration and caption.** In this lab you run the race, pause on the stale response, and read the async call stack.
