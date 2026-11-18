---
title: "A heap snapshot request across the protocol client"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [chromedevtools-devtools-frontend-repo]
---
# A heap snapshot request across the protocol client

**Sequence** · teaches Heap snapshots, Remote device debugging

**Why this visual.** Follow one numbered command and its unnumbered events from the model to the worker.

```mermaid
sequenceDiagram
  participant Model as HeapProfilerModel
  participant Conn as DevToolsCDPConnection
  participant Tr as ConnectionTransport
  participant Router as SessionRouter
  participant Proxy as HeapSnapshotWorkerProxy
  participant Worker as HeapSnapshot worker
  Model->>Conn: send HeapProfiler.takeHeapSnapshot with id
  Conn->>Tr: sendRawMessage(JSON with id)
  Tr-->>Conn: event addHeapSnapshotChunk
  Conn->>Router: onEvent(event)
  Router->>Model: dispatch by session id
  Model->>Proxy: chunk
  Proxy->>Worker: write chunk to loader
  Tr-->>Conn: reply with same id
  Conn-->>Model: resolve pending promise
```

## What it shows

The model sends a numbered command. Chunk events arrive without a number and are routed by session to the model, then the proxy passes them to a worker. The reply with the same number finishes the stored promise.

Text alternative: Sequence diagram: HeapProfilerModel sends takeHeapSnapshot with an id through the connection and transport; chunk events return, are routed by session to the model and forwarded through the proxy to the worker; the reply with the same id resolves the promise.

## Check yourself

How does the connection tell a reply from an event?

Answer: A reply carries an id that matches a stored promise; an event has only a method.

## Sources

- ChromeDevTools/devtools-frontend — https://github.com/ChromeDevTools/devtools-frontend (`chromedevtools-devtools-frontend-repo`)

## Used in

- [[devtools-frontend-architecture]]

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
