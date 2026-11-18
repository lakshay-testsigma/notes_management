# Storyboard: Read one request in the network waterfall

**Purpose.** Name each timing phase of a request and say which phase grows when the network, the server or the queue is slow.

**Why a video.** A request passes its phases in a fixed order, and a change in one condition makes one part of the bar longer, so motion shows the cause better than one static picture.

**Length.** 82.0 s, 8 scenes.

## 1. One request, one bar (0.0–7.0 s)

**On screen.** Title card with "Network panel, Waterfall column, Timing tab".

**Narration and caption.** Open the Network panel, then load the page. Each request becomes one bar in the Waterfall column.

**Sources.** chrome-devtools-network-docs

## 2. The Timing tab names each phase (7.0–18.0 s)

**On screen.** A timeline reveals Queueing → Stalled → DNS Lookup → Initial connection → Request sent → Waiting (TTFB) → Content Download.

**Narration and caption.** The Timing tab splits one bar into phases: Queueing, Stalled, DNS Lookup, Initial connection, Request sent, Waiting, and Content Download.

**Sources.** chrome-devtools-network-docs

## 3. What Waiting (TTFB) measures (18.0–29.0 s)

**On screen.** The expression Waiting (TTFB) = round trip + server time with "round trip", "server time" highlighted in turn and explained.

**Narration and caption.** Waiting, the time to first byte, is one round trip of latency plus the time the server needs to prepare the response.

**Sources.** chrome-devtools-network-docs

## 4. Example request, no throttling (29.0–38.0 s)

**On screen.** Bars grow for Queueing + Stalled 5 ms, DNS Lookup 20 ms, Initial connection 40 ms, Waiting (TTFB) 80 ms, Content Download 20 ms.

**Narration and caption.** Here is an example request with no throttling. Waiting is the longest bar, and Content Download is short.

**Sources.** chrome-devtools-network-docs

## 5. Same request on Slow 4G (38.0–48.0 s)

**On screen.** Bars grow for Queueing + Stalled 5 ms, DNS Lookup 20 ms, Initial connection 40 ms, Waiting (TTFB) 560 ms, Content Download 900 ms.

**Narration and caption.** Now choose Slow 4G in the Throttling menu and reload. Waiting and Content Download grow, because both depend on network speed.

**Sources.** chrome-devtools-network-docs

## 6. Too many requests to one origin (48.0–59.0 s)

**On screen.** Two columns, "Requests 1 to 6" and "Request 7", fill in pairs; verdict: HTTP/1.0 and 1.1 only: six connections per origin..

**Narration and caption.** On HTTP 1.1, when six connections to one origin are already open, the seventh request waits, so its Queueing bar grows.

**Sources.** chrome-devtools-network-docs

## 7. Why the request ran, and how urgently (59.0–70.0 s)

**On screen.** Numbered steps appear one at a time: Initiator: Parser, Redirect, Script, Early Hints or Other → Hover the initiator: the stack trace → Priority: how urgent the request is → Shift + hover: initiators green, dependencies red.

**Narration and caption.** The Initiator column says what started each request. Priority says how urgent it is. Hold Shift and hover: initiators turn green, dependencies red.

**Sources.** chrome-devtools-network-docs

## 8. Save the session as a HAR file (70.0–82.0 s)

**On screen.** Numbered steps appear one at a time: Export HAR: the session as JSON → Default: no Cookie, Set-Cookie or Authorization → Import: drag the HAR file into the table.

**Narration and caption.** Export the session as a HAR file, a JSON record. By default, it leaves out Cookie, Set-Cookie and Authorization headers, so it is safer to share.

**Sources.** chrome-devtools-network-docs, chromedevtools-devtools-frontend-repo
