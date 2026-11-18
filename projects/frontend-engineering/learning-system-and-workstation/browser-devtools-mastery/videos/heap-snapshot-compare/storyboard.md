# Storyboard: Finding a leak with two heap snapshots

**Purpose.** Find a leaked object by comparing two heap snapshots and reading its retainer path.

**Why a video.** Finding a leak is an ordered procedure: snapshot, repeat the action and its undo, snapshot again, compare, then follow the retainers. Each step needs the result of the step before it.

**Length.** 68.0 s, 7 scenes.

## 1. Two snapshots find a leak (0.0–6.0 s)

**On screen.** Title card with "Memory panel: snapshot, repeat, compare, follow the retainers".

**Narration and caption.** A leak is memory that stays after you undo an action. Two heap snapshots show it.

**Sources.** chrome-devtools-memory-docs

## 2. The recipe in the Memory panel (6.0–16.0 s)

**On screen.** Numbered steps appear one at a time: Memory panel: Heap snapshot, Take snapshot → Do the suspect action, then undo it → Repeat the pair a few times → Take Snapshot 2 → Comparison view: Snapshot 2 against Snapshot 1.

**Narration and caption.** Take Snapshot 1. Do the suspect action, then undo it, a few times. Take Snapshot 2 and open the Comparison view.

**Sources.** chrome-devtools-memory-docs

## 3. What the Comparison view shows (16.0–27.0 s)

**On screen.** Two columns, "Snapshot 1" and "Snapshot 2", fill in pairs; verdict: Added and still alive after the undo: a leak candidate..

**Narration and caption.** Each snapshot starts with a garbage collection, so only reachable objects stay. Objects added after the undo should be gone. If they are still there, something holds them.

**Sources.** chrome-devtools-memory-docs

## 4. Follow the retainer path (27.0–39.0 s)

**On screen.** Nodes GC roots, Window, JS variable, Detached ul. A packet moves root→window, window→variable, variable→ul (Removed from the page, but JavaScript still points to it.); each node lights up when the packet arrives.

**Narration and caption.** Select the added object. The Retainers section lists who points to it. Here a JavaScript variable still holds a list that the page removed, so it is a Detached ul.

**Sources.** chrome-devtools-memory-docs, chromedevtools-devtools-frontend-repo

## 5. Which object is worth fixing (39.0–49.0 s)

**On screen.** Two columns, "Shallow size" and "Retained size", fill in pairs; verdict: Retained size tells you which object is worth fixing..

**Narration and caption.** Shallow size is the memory the object holds itself. Retained size is what you free by deleting it. A small object can retain a lot.

**Sources.** chrome-devtools-memory-docs

## 6. Clear the reference, then check again (49.0–58.0 s)

**On screen.** Numbered steps appear one at a time: Clear the variable that holds the list → Repeat the action and the undo → Take a new snapshot and compare → No Detached ul is added.

**Narration and caption.** Clear the variable that holds the list. Repeat the action and undo, take a new snapshot, and the Detached ul is gone.

**Sources.** chrome-devtools-memory-docs

## 7. When you do not know the action (58.0–68.0 s)

**On screen.** A timeline reveals Start recording → Blue bar → Zoom on the bar → Read Retainers.

**Narration and caption.** The Allocation Timeline records new memory over time. Each blue bar is a candidate leak. Zoom on a bar to see what was allocated then.

**Sources.** chrome-devtools-memory-docs
