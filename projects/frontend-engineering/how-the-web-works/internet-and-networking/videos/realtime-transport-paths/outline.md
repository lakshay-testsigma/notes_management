# Pick a realtime transport for each feature

Two questions pick a realtime transport: who sends the data, and how much delay is acceptable. Polling asks on a timer, long polling holds the request open, Server-Sent Events stream text from the server, and WebSockets carry messages both ways. Four deep dives apply the questions to a notification feed, a stock ticker, a chat and a collaborative cursor.

**Purpose.** Decide between periodic polling, long polling, Server-Sent Events and WebSockets for four product features: a notification feed, a stock ticker, a chat and a collaborative cursor.

## Main path

### 1. Which transport fits each feature?

**On screen.** Title card with "Polling, long polling, SSE or WebSockets".

**Notes.** State the decision: four features, four transports, and two questions to choose between them.

### 2. Four ways to get live data

**On screen.** Numbered steps appear one at a time: Polling: the client asks again on a timer → Long polling: the server holds the request until an update → SSE: one long HTTP response streams text from the server → WebSockets: both sides send messages at any time.

**Notes.** Reveal one transport at a time. Ask who opens the connection and who can send on it.

### 3. What a persistent connection removes

**On screen.** Two columns, "Periodic polling" and "SSE or WebSockets", fill in pairs; verdict: Low latency here means no queuing delay..

**Notes.** With polling, a ready message waits for the next request. SSE and WebSockets send it at once. The packet travel time stays the same.

### 4. Short intervals cost bandwidth

**On screen.** Bars grow for Poll every 60 s (Mbps) 1.13, Poll every 1 s (Mbps) 60.

**Notes.** Ten thousand clients poll and get no new messages; each empty check is about 850 bytes. At 60 seconds the server receives 1.13 megabits per second; at 1 second, over 60.

### 5. Only the server sends

**On screen.** Numbered steps appear one at a time: Notification feed: short text events → Stock ticker: many updates per second.

**Notes.** Open a deep dive for a feature where updates flow from the server to the browser only. Previous returns here.

**Branches.** deep dive "Notification feed", deep dive "Stock ticker".

### 6. Both sides send

**On screen.** Numbered steps appear one at a time: Chat: users send and receive messages → Collaborative cursor: positions flow both ways.

**Notes.** Open a deep dive for a feature where the browser also sends data at any time. Previous returns here.

**Branches.** deep dive "Chat messages", deep dive "Collaborative cursor".

### 7. How to decide

**On screen.** Numbered steps appear one at a time: Both sides send at any time: WebSockets → Server sends text only: SSE → Delay is fine and updates are many: poll → No SSE support in the client: long polling.

**Notes.** Turn the deep dives into a repeatable procedure for any new feature.

## Deep dive: Notification feed

### 1. Feed: Server-Sent Events

**On screen.** Numbered steps appear one at a time: Server streams text/event-stream on one response → Browser fires a DOM event per message → On a drop, the browser reconnects and sends the last ID → For an image, send a link; fetch it over HTTP.

**Notes.** The feed is one-way text, which is what SSE was designed for. The browser parses events and reconnects for you.

## Deep dive: Stock ticker

### 1. Ticker: push or batch?

**On screen.** Two columns, "SSE" and "Periodic polling", fill in pairs; verdict: At high rates, long polling sends the most requests..

**Notes.** If every price must arrive at once, use SSE. If the screen may lag, periodic polling batches many updates into one response.

## Deep dive: Chat messages

### 1. Chat: WebSockets

**On screen.** Numbered steps appear one at a time: Messages go both ways on one connection → Each frame adds only 2 to 14 bytes → The app builds its own reconnects and state → Long polling is the older fallback.

**Notes.** Both people send at any time, so the client must send after the handshake, which SSE cannot do. WebSockets can, with small frames.

## Deep dive: Collaborative cursor

### 1. Cursor: small messages over WebSockets

**On screen.** Numbered steps appear one at a time: Send small position messages both ways → A large queued message blocks the ones behind it → Split large messages into chunks → Watch bufferedAmount before you send.

**Notes.** Many small position updates flow both ways. One large queued message delays every message behind it, so keep messages small.

