# Storyboard: One lost packet in HTTP/1.1, HTTP/2 and HTTP/3

**Purpose.** See at which layer head-of-line blocking happens in each HTTP version, and how ALPN picks the version.

**Why a video.** Each HTTP version fixes the blocking of the version before it, so the order of the versions and the effect of one lost packet are the idea.

**Length.** 89.0 s, 10 scenes.

## 1. Three versions, one lost packet (0.0–7.0 s)

**On screen.** Title card with "HTTP/1.1, HTTP/2, HTTP/3".

**Narration and caption.** Three HTTP versions carry the same three files. Watch what one lost packet does in each version.

**Sources.** rfc-9114-http3

## 2. Same meaning, new framing (7.0–15.0 s)

**On screen.** Two columns, "Stays the same" and "Changes", fill in pairs; verdict: Same semantics, different framing and transport..

**Narration and caption.** Methods, status codes and headers mean the same in every version. Only the framing and the transport change.

**Sources.** rfc-9110-http-semantics, rfc-9114-http3

## 3. HTTP/1.1: one request at a time (15.0–24.0 s)

**On screen.** Nodes Browser, Server. A packet moves browser→server (The browser sends GET A), server→browser (Response A comes back), browser→server (Only now the browser sends GET B); each node lights up when the packet arrives.

**Narration and caption.** On one HTTP/1.1 connection, the browser sends GET A, waits for response A, and only then sends GET B.

**Sources.** mdn-http-docs, rfc-9114-http3

## 4. Head-of-line blocking in HTTP (24.0–33.0 s)

**On screen.** Numbered steps appear one at a time: Response A is slow → B and C wait behind A → Browsers open several TCP connections per host → The connections compete for bandwidth.

**Narration and caption.** If response A is slow, B and C wait behind it. So browsers open several TCP connections per host instead.

**Sources.** mdn-http-docs, rfc-9114-http3

## 5. HTTP/2: many streams, one TCP connection (33.0–42.0 s)

**On screen.** Nodes Browser, One TCP connection, Server. A packet moves browser→tcp (Requests A, B and C leave together as frames), tcp→server (Frames of the three streams interleave); each node lights up when the packet arrives.

**Narration and caption.** HTTP/2 splits messages into binary frames. Frames of streams A, B and C interleave on one TCP connection.

**Sources.** hpbn-book, rfc-9114-http3

## 6. One lost TCP packet stalls every stream (42.0–51.0 s)

**On screen.** Numbered steps appear one at a time: A TCP packet with a frame of A is lost → Frames of B and C arrive after the gap → TCP holds every byte after the gap → A, B and C stall until the retransmission.

**Narration and caption.** A TCP packet with a frame of A is lost. TCP delivers bytes only in order, so frames of B and C wait too.

**Sources.** rfc-9114-http3, hpbn-book

## 7. HTTP/3: one QUIC stream per request (51.0–60.0 s)

**On screen.** Nodes Browser, One QUIC connection, Server. A packet moves browser→quic (A on stream 0, B on stream 4, C on stream 8), quic→server (Each stream is ordered on its own); each node lights up when the packet arrives.

**Narration and caption.** HTTP/3 runs over QUIC on UDP. Each request gets its own QUIC stream: A on stream 0, B on 4, C on 8.

**Sources.** rfc-9114-http3

## 8. The same loss stalls only A (60.0–70.0 s)

**On screen.** Two columns, "HTTP/2 over TCP" and "HTTP/3 over QUIC", fill in pairs; verdict: QUIC recovers loss per stream..

**Narration and caption.** On HTTP/3 over QUIC, the same lost packet delays only stream 0, response A. On HTTP/2 over TCP, all three waited.

**Sources.** rfc-9114-http3

## 9. ALPN picks the version (70.0–79.0 s)

**On screen.** Nodes Client, Server. A packet moves client→server (The client offers protocol names in TLS), server→client (The server picks one name); each node lights up when the packet arrives.

**Narration and caption.** During the TLS handshake, the client offers protocol names with ALPN, such as h2 and http/1.1. The server picks one.

**Sources.** nodejs-undici-repo, rfc-9114-http3

## 10. Finding HTTP/3 with Alt-Svc (79.0–89.0 s)

**On screen.** Numbered steps appear one at a time: The server sends the Alt-Svc header with h3 → The client opens QUIC with ALPN h3 → UDP is blocked: the client falls back to TCP.

**Narration and caption.** A server advertises h3 with the Alt-Svc header. The client opens QUIC with ALPN h3, and falls back to TCP if UDP is blocked.

**Sources.** rfc-9114-http3
