# Read one request in the network waterfall

The Network panel draws each request as a bar in the Waterfall column. The Timing tab splits the bar into Queueing, Stalled, DNS Lookup, Initial connection, Request sent, Waiting (TTFB) and Content Download. Waiting is one round trip plus server time. With Slow 4G throttling, Waiting and Content Download grow. When six connections to one HTTP/1.1 origin are open, a seventh request grows its Queueing bar. The Initiator and Priority columns say why and how urgently a request ran. A HAR export saves the session and leaves out Cookie, Set-Cookie and Authorization headers by default. The bar lengths in this walkthrough are example values, not measurements.

**00:00 One request, one bar.** Open the Network panel, then load the page. Each request becomes one bar in the Waterfall column.

**00:07 The Timing tab names each phase.** The Timing tab splits one bar into phases: Queueing, Stalled, DNS Lookup, Initial connection, Request sent, Waiting, and Content Download.

**00:18 What Waiting (TTFB) measures.** Waiting, the time to first byte, is one round trip of latency plus the time the server needs to prepare the response.

**00:29 Example request, no throttling.** Here is an example request with no throttling. Waiting is the longest bar, and Content Download is short.

**00:38 Same request on Slow 4G.** Now choose Slow 4G in the Throttling menu and reload. Waiting and Content Download grow, because both depend on network speed.

**00:48 Too many requests to one origin.** On HTTP 1.1, when six connections to one origin are already open, the seventh request waits, so its Queueing bar grows.

**00:59 Why the request ran, and how urgently.** The Initiator column says what started each request. Priority says how urgent it is. Hold Shift and hover: initiators turn green, dependencies red.

**01:10 Save the session as a HAR file.** Export the session as a HAR file, a JSON record. By default, it leaves out Cookie, Set-Cookie and Authorization headers, so it is safer to share.

Sources:

- Chrome DevTools: Network features reference — https://developer.chrome.com/docs/devtools/network/reference
- ChromeDevTools/devtools-frontend — https://github.com/ChromeDevTools/devtools-frontend
