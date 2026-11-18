---
title: "dequelabs/axe-core — module frame-messaging"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [dequelabs-axe-core-repo]
---

# dequelabs/axe-core — module: frame-messaging

## Responsibility

A page can hold many iframes, and each one can run its own copy of axe. This module lets the top copy ask each frame copy to scan itself, wait for the answer, and merge the results. It also offers a second route, `runPartial` and `finishRun`, for tools that cannot or should not let frames talk to each other. A browser extension is one such tool.

## Key files

| File | Role |
|------|------|
| `lib/core/utils/respondable.js` | Topic-based send and subscribe layer; holds the swappable transport |
| `lib/core/public/frame-messenger.js` | Public `axe.frameMessenger()`; swaps the transport |
| `lib/core/utils/frame-messenger/post-message.js` | Default sender, built on `window.postMessage` |
| `lib/core/utils/frame-messenger/message-handler.js` | Default receiver: checks origin and message id, routes to topic or reply handler |
| `lib/core/utils/frame-messenger/message-parser.js` | JSON encoding, "is this ours?" check, error rebuilding |
| `lib/core/utils/frame-messenger/channel-store.js` | Remembers reply handlers per channel id |
| `lib/core/utils/send-command-to-frame.js` | Ping, then start, with two timeouts |
| `lib/core/utils/collect-results-from-frames.js` | Fans out to all frames and merges |
| `lib/core/public/run-partial.js`, `finish-run.js` | Two-stage run with no frame messaging |
| `lib/core/utils/get-frame-contexts.js` | Lists frames and the context for each |

I also read `assert-window.js` and `message-id.js` in the same folder, because the files above import them.

## How it works

1. The parent copy of axe calls `sendCommandToFrame` for each frame element (`lib/core/utils/collect-results-from-frames.js:29-39 @ e80f6b7`). The frame calls run through a queue, so they run side by side (`lib/core/utils/collect-results-from-frames.js:25-30 @ e80f6b7`).
2. `sendCommandToFrame` first sends an `axe.ping` topic and waits `pingWaitTime`, default 500 ms (`lib/core/utils/send-command-to-frame.js:13`, `:40 @ e80f6b7`).
3. If the ping is answered, it sends `axe.start` with the options and context, and waits `frameWaitTime`, default 60 s (`lib/core/utils/send-command-to-frame.js:46-55 @ e80f6b7`).
4. `respondable` builds a message with a topic, a unique channel id, and the payload, then hands it to the current transport (`lib/core/utils/respondable.js:25-32 @ e80f6b7`).
5. The default transport serialises the message to a JSON string and calls `win.postMessage` once per allowed origin (`lib/core/utils/frame-messenger/post-message.js:25-28`, `:40-42 @ e80f6b7`). It stores the reply handler under the channel id first (`lib/core/utils/frame-messenger/post-message.js:36-38 @ e80f6b7`).
6. In the child frame, `messageHandler` parses the string, drops it if the origin is not allowed or the message id was seen before, and calls the topic handler with a `responder` (`lib/core/utils/frame-messenger/message-handler.js:27-44 @ e80f6b7`). `respondable.messageListener` finds the handler for that topic (`lib/core/utils/respondable.js:40-54 @ e80f6b7`).
7. The reply travels back on the same channel id. The parent looks up the stored reply handler and deletes it unless `keepalive` is set (`lib/core/utils/frame-messenger/message-handler.js:57-69 @ e80f6b7`).
8. The parent merges all frame results (`lib/core/utils/collect-results-from-frames.js:44-46 @ e80f6b7`).

The two-stage route works differently. Each frame runs `runPartial` on its own and returns plain data: results, a list of child frame specs, and environment data for the top frame only (`lib/core/public/run-partial.js:42-52 @ e80f6b7`). The tool collects the results and calls `finishRun`, which links each result to its frame spec, merges, runs the `after` step of checks, and builds the report (`lib/core/public/finish-run.js:19-25 @ e80f6b7`).

## Beyond the textbook

### The transport can be replaced

- Textbook version: call `window.postMessage` and listen for `message` events.
- What they do: `respondable` only knows two functions, `open` and `post`. `axe.frameMessenger({open, post})` replaces them, and the previous channel is closed first.
- Why: the docs say other scripts on the page also use `postMessage`, so axe's messages can disturb the page. Extensions and test tools have better channels.
- Evidence: `lib/core/utils/respondable.js:65-85 @ e80f6b7`, `doc/frame-messenger.md:3-5 @ e80f6b7`, `lib/core/public/frame-messenger.js:3-5 @ e80f6b7`

### Messages are filtered four ways before use

- Textbook version: trust any message that arrives.
- What they do: a message must parse as JSON, carry a string channel id, and carry a `source` equal to `application.version`. Then the origin must be in `allowedOrigins`, and the message id must be new. Message ids are two UUIDs and are remembered to block replays.
- Why: the page and other scripts share the same `message` event, so axe must ignore what is not meant for it. The code comment says "Wasn't meant for us."
- Evidence: `lib/core/utils/frame-messenger/message-parser.js:44-50`, `:68-75`, `:97-109 @ e80f6b7`; `lib/core/utils/frame-messenger/message-handler.js:30-32 @ e80f6b7`; `lib/core/utils/frame-messenger/message-id.js:6-23 @ e80f6b7`

### Sender and receiver check which window talks

- Textbook version: send to any window.
- What they do: a request must come from the parent window. A reply must come from the parent or from a child frame, depending on the direction. Sending to your own window is refused.
- Why: the assertion messages say so, for example "Source of the response must be the parent window."
- Evidence: `lib/core/utils/frame-messenger/assert-window.js:3-21 @ e80f6b7`, `lib/core/utils/frame-messenger/message-handler.js:43`, `:64 @ e80f6b7`

### Origins: try them all, default to the page's own origin

- Textbook version: post with `"*"` as the target origin.
- What they do: the sender cannot know the child's origin, so it posts once to each allowed origin and the browser delivers only on a match. With no configuration, only the default origin is allowed. If none is known, nothing is sent. `"*"` must be requested on purpose.
- Why: from the comment "There is no way to know the origin of `win`, so we'll try them all."
- Evidence: `lib/core/utils/frame-messenger/post-message.js:31-34`, `:39-42 @ e80f6b7`; `lib/core/base/audit.js:168-181`, `:494-497 @ e80f6b7`

### Ping first, then work, with two clocks

- Textbook version: send one request and wait for it.
- What they do: a short ping (500 ms) finds frames with no axe in them, so the scan does not wait the full 60 s. `pingWaitTime: 0` skips the ping. A double `setTimeout` is marked "DO NOT REMOVE" because it lets slow iframes still answer.
- Why: the docs say the ping avoids waiting for a frame that never had axe.
- Evidence: `lib/core/utils/send-command-to-frame.js:20-37`, `:48-52 @ e80f6b7`; `doc/frame-messenger.md:111 @ e80f6b7`

### A failed frame is skipped, not fatal

- Textbook version: one failed request fails the whole call.
- What they do: no content window, or no ping reply, resolves `null`, and the frame is left out of the merge. With `debug` on, the same case rejects with an error naming the frame. A 60 s timeout on a started frame does reject. The docs say missing frames are reported in the `frame-tested` rule.
- Why: a page with one dead ad frame should still get a report.
- Evidence: `lib/core/utils/send-command-to-frame.js:14-18`, `:30-35`, `:50-52 @ e80f6b7`; `lib/core/utils/collect-results-from-frames.js:32-35 @ e80f6b7`; `doc/frame-messenger.md:103 @ e80f6b7`

### Errors cross the frame boundary as data

- Textbook version: an exception stops at the frame.
- What they do: an `Error` is turned into name, message and stack. On the other side it is rebuilt, but only for six built-in error types; others become plain `Error`. Errors are never sent downward to child frames.
- Why: `postMessage` carries strings here, so objects must be flattened. The code comment says IE 9 and 10 only post strings.
- Evidence: `lib/core/utils/frame-messenger/message-parser.js:1-8`, `:25-30`, `:82-91 @ e80f6b7`; `lib/core/utils/frame-messenger/post-message.js:8`, `:20-23 @ e80f6b7`

### Two-stage run for places where frames cannot talk

- Textbook version: one `run()` that reaches into every frame.
- What they do: each frame runs alone, and a trusted place merges the results. Order matters: parents before siblings, and `null` for a failed frame. Element references are switched off, because they cannot be serialised.
- Why: the docs say this helps when frame messaging is "not possible or not secure". They also warn that `finishRun` should run only where no third-party scripts exist.
- Evidence: `lib/core/public/run-partial.js:26-27 @ e80f6b7`; `lib/core/public/finish-run.js:28-40 @ e80f6b7`; `doc/run-partial.md:3`, `:49-72`, `:74 @ e80f6b7`

### Reply handlers live only for one audit

- Textbook version: keep callbacks in a module variable forever.
- What they do: reply handlers are stored in axe's per-audit cache, so they are released when the audit ends. A duplicate channel id is an assertion error. Message ids live outside the cache so they persist across runs.
- Why: the comments say so.
- Evidence: `lib/core/utils/frame-messenger/channel-store.js:4-5`, `:13-16 @ e80f6b7`; `lib/core/utils/frame-messenger/message-id.js:3 @ e80f6b7`

## Tests and what they protect

Not present in this slice. The slice holds no test files, so I make no claim about test coverage here.

## Error handling, performance, and security

- Handler errors are caught and logged, and an error in a reply handler is sent back to the sender (`lib/core/utils/frame-messenger/message-handler.js:48-50`, `:71-76 @ e80f6b7`).
- A suspected bug: in `processError`, the test `!win.parent !== window` compares a boolean with a window, so it is always true and the function always logs and never posts the error to the parent. I read only this file, so I did not check the callers or tests (`lib/core/utils/frame-messenger/process-error.js:10-12 @ e80f6b7`).
- `runPartial` refuses to start when axe is already running, and clears the running flag and tears down on both success and failure (`lib/core/public/run-partial.js:15-19`, `:50-51`, `:56-57 @ e80f6b7`). A comment explains it avoids `.finally()` for old Mocha and IE (`lib/core/public/run-partial.js:54 @ e80f6b7`).
- Performance: frames run in parallel (`doc/run-partial.md:45 @ e80f6b7`). The flat tree is slow to build, so call `runPartial` straight after `getFrameContexts` (`doc/run-partial.md:43 @ e80f6b7`).
- Security: `elementRef` is forced off for frame calls (`lib/core/utils/collect-results-from-frames.js:22-23 @ e80f6b7`). The docs state there is no retry, since axe assumes the channel is stable (`doc/frame-messenger.md:105 @ e80f6b7`).

## Technologies and services seen

- `window.postMessage` — default frame channel (`lib/core/utils/frame-messenger/post-message.js:42 @ e80f6b7`)
- JSON — wire format (`lib/core/utils/frame-messenger/message-parser.js:34`, `:45 @ e80f6b7`)
- UUID helper — channel and message ids (`lib/core/utils/respondable.js:28`, `lib/core/utils/frame-messenger/message-id.js:7 @ e80f6b7`)
- Browser timers (`setTimeout`) — ping and frame limits (`lib/core/utils/send-command-to-frame.js:27`, `:50 @ e80f6b7`)
- Promises and an internal `queue` helper — fan-out over frames (`lib/core/utils/collect-results-from-frames.js:1`, `:25 @ e80f6b7`)
- No external services in this slice.

## Worth exploring interactively

- One frame scan over `postMessage` — steps: parent defers one task per frame (`lib/core/utils/collect-results-from-frames.js:29-39 @ e80f6b7`); ping sent and 500 ms timer started (`lib/core/utils/send-command-to-frame.js:27-43 @ e80f6b7`); ping reply clears the timer, `axe.start` sent (`lib/core/utils/send-command-to-frame.js:41-55 @ e80f6b7`); child filters the message and runs the topic handler (`lib/core/utils/frame-messenger/message-handler.js:27-44 @ e80f6b7`); reply deleted from the channel store (`lib/core/utils/frame-messenger/message-handler.js:67-69 @ e80f6b7`); results merged (`lib/core/utils/collect-results-from-frames.js:44-46 @ e80f6b7`) — fits FlowAnimation because the learner sees a message and its reply cross frames, and a timer that can expire.
- Ping and start timeouts — states: waiting for ping, started, done, skipped (`resolve(null)`), failed (`reject`) (`lib/core/utils/send-command-to-frame.js:27-37`, `:50-52 @ e80f6b7`) — fits StateMachine because each frame ends in one of three outcomes.

## Open questions

- Where `setDefaultFrameMessenger` installs the default transport (`lib/core/utils/respondable.js:3`, `:117 @ e80f6b7`) was not in this slice.
- Whether `processError` is dead or buggy needs its callers and tests.

## My insights
