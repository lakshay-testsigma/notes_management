# Finding a leak with two heap snapshots

In the Memory panel you take a heap snapshot, do a suspect action and undo it a few times, then take a second snapshot. The Comparison view lists objects that were added and are still alive. You select one, read its Retainers to see which reference keeps it alive, and clear that reference. A detached DOM node is the common case: it is removed from the page, but JavaScript still points to it.

**00:00 Two snapshots find a leak.** A leak is memory that stays after you undo an action. Two heap snapshots show it.

**00:06 The recipe in the Memory panel.** Take Snapshot 1. Do the suspect action, then undo it, a few times. Take Snapshot 2 and open the Comparison view.

**00:16 What the Comparison view shows.** Each snapshot starts with a garbage collection, so only reachable objects stay. Objects added after the undo should be gone. If they are still there, something holds them.

**00:27 Follow the retainer path.** Select the added object. The Retainers section lists who points to it. Here a JavaScript variable still holds a list that the page removed, so it is a Detached ul.

**00:39 Which object is worth fixing.** Shallow size is the memory the object holds itself. Retained size is what you free by deleting it. A small object can retain a lot.

**00:49 Clear the reference, then check again.** Clear the variable that holds the list. Repeat the action and undo, take a new snapshot, and the Detached ul is gone.

**00:58 When you do not know the action.** The Allocation Timeline records new memory over time. Each blue bar is a candidate leak. Zoom on a bar to see what was allocated then.

Sources:

- Chrome DevTools: Fix memory problems and heap snapshots — https://developer.chrome.com/docs/devtools/memory-problems
- ChromeDevTools/devtools-frontend — https://github.com/ChromeDevTools/devtools-frontend
