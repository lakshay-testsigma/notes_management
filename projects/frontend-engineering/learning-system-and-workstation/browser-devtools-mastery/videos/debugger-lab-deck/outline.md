# Which breakpoint type fits this bug

A short deck about choosing a breakpoint type. The main path splits bugs into those where you know the line and those where you do not, then shows what to read at the pause. Two deep dives compare a logpoint with a conditional breakpoint and list the three DOM change breakpoint types.

**Purpose.** Choose a breakpoint type from the symptom of a bug: known line, only some calls, no pause allowed, or an unknown line.

## Main path

### 1. Which breakpoint finds this bug?

**On screen.** Title card with "Start from what you know".

**Notes.** Ask the learner what they know about the bug before they choose a breakpoint type.

### 2. You know the line

**On screen.** Numbered steps appear one at a time: Every call: line-of-code breakpoint → Only some calls: conditional breakpoint → No pause allowed: logpoint.

**Notes.** Reveal each case. The three types all sit on one line of code and differ in when they stop.

**Branches.** deep dive "Logpoint or conditional breakpoint".

### 3. You do not know the line

**On screen.** Numbered steps appear one at a time: A request: XHR/fetch breakpoint → A changed node: DOM change breakpoint → A click or key: event listener breakpoint → A thrown error: exception breakpoint.

**Notes.** When the line is unknown, pause on the cause: a request, a DOM change, an event or an exception.

**Branches.** deep dive "DOM change breakpoint types".

### 4. Then read the pause

**On screen.** Numbered steps appear one at a time: Scope: the values now → Call Stack: who called → Async frames: who started the wait.

**Notes.** At every pause, read Scope for the values and the Call Stack, including the async frames, for the callers.

### 5. Choose the closest pause

**On screen.** Two columns, "Line known" and "Line unknown", fill in pairs; verdict: Pause where the cause happens..

**Notes.** The best breakpoint stops closest to the cause, so you read the state before it changes again.

## Deep dive: Logpoint or conditional breakpoint

### 1. Log or pause on a condition

**On screen.** Two columns, "Conditional breakpoint" and "Logpoint", fill in pairs; verdict: Log when pausing changes the timing..

**Notes.** A conditional breakpoint pauses only when its expression is true; a logpoint never pauses and prints its message in the Console.

## Deep dive: DOM change breakpoint types

### 1. Three DOM change breakpoints

**On screen.** Numbered steps appear one at a time: Subtree modifications: a child changes → Attribute modifications: an attribute changes → Node removal: the node is removed.

**Notes.** In the Elements panel you choose which change pauses: a child changes, an attribute changes, or the node is removed.

