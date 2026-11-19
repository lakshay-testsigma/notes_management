# Storyboard: Read the timing phases of one request

**Purpose.** Name the seven timing phases of one request in order and say what makes each phase grow.

**Why a video.** The Timing tab lists phases in a fixed order, and a change in conditions grows some phases and not others, so motion shows the cause.

**Length.** 77.0 s, 8 scenes.

## 1. One request, seven phases (0.0–8.0 s)

**On screen.** Title card with "Network panel, Timing tab".

**Narration and caption.** Open the Network panel, click one request, and open the Timing tab. It splits the request into phases.

## 2. The phases, in order (8.0–18.0 s)

**On screen.** A timeline reveals Queueing → Stalled → DNS Lookup → Initial connection → Request sent → Waiting (TTFB) → Content Download.

**Narration and caption.** The phases run in this order: Queueing, Stalled, DNS Lookup, Initial connection, Request sent, Waiting, and Content Download.

## 3. Queueing and Stalled are waits (18.0–28.0 s)

**On screen.** Numbered steps appear one at a time: Higher-priority requests go first → HTTP/1.0 and 1.1 allow six connections per origin → The browser waits for disk cache space.

**Narration and caption.** Queueing and Stalled are waits. The request waits for higher-priority requests, a free connection, or disk cache space.

## 4. Find the server, then connect (28.0–37.0 s)

**On screen.** Numbered steps appear one at a time: DNS Lookup: find the server IP address → Initial connection: TCP handshakes and SSL negotiation → Request sent: the browser sends the request.

**Narration and caption.** DNS Lookup finds the server IP address. Initial connection covers the TCP handshakes and the SSL negotiation.

## 5. A slow server grows Waiting (37.0–47.0 s)

**On screen.** Bars grow for Queueing 2ms (example), Stalled 3ms (example), DNS Lookup 20ms (example), Initial connection 40ms (example), Request sent 1ms (example), Waiting (TTFB) 1400ms (example), Content Download 15ms (example).

**Narration and caption.** Waiting, or TTFB, is one round trip plus server time. In this example, a slow server makes Waiting the longest bar.

## 6. Throttling grows the network phases (47.0–57.0 s)

**On screen.** Two columns, "No throttling" and "Slow 4G", fill in pairs; verdict: Example numbers: the network phases grow.

**Narration and caption.** Now set Throttling to Slow 4G. Waiting and Content Download grow, because each round trip and each byte is slower.

## 7. Disable cache on or off (57.0–67.0 s)

**On screen.** Two columns, "Disable cache on" and "Disable cache off", fill in pairs.

**Narration and caption.** Disable cache makes a first visit. Turn it off and reload: a repeat visit loads files from the browser cache instead.

## 8. Read the longest phase first (67.0–77.0 s)

**On screen.** Numbered steps appear one at a time: Long Waiting (TTFB): look at the server → Long Content Download: file size or network → Long Queueing: too many requests compete.

**Narration and caption.** Read the longest phase first. Long Waiting points at the server, long Content Download at size or network, long Queueing at competition.
