# Storyboard: How TLS 1.3 sets up HTTPS in one round trip

**Purpose.** See which messages a TLS 1.3 handshake sends, in what order, and why the browser can send its first request after one round trip.

**Why a video.** The handshake is an ordered chain of messages where each step depends on the one before (keys, then encryption, then proof), so motion shows the order and the round trips better than one static diagram.

**Length.** 86.0 s, 8 scenes.

## 1. One round trip to a secure channel (0.0–9.0 s)

**On screen.** Title card with "ClientHello, ServerHello, proof, Finished".

**Narration and caption.** Before the first HTTPS request, the browser and the server must agree on secret keys. TLS 1.3 does this in one round trip.

**Sources.** rfc-9846-tls13

## 2. ClientHello: key share, SNI, ALPN (9.0–19.0 s)

**On screen.** Nodes Browser, Server. A packet moves browser→server (key_share + server_name (SNI) + ALPN: h2, http/1.1. Not encrypted.); each node lights up when the packet arrives.

**Narration and caption.** The browser sends ClientHello. It carries a key share, the server name, called SNI, and the protocols it speaks, called ALPN.

**Sources.** rfc-9846-tls13

## 3. ServerHello: both sides now share keys (19.0–29.0 s)

**On screen.** Nodes Browser, Server. A packet moves server→browser (Its key_share uses the same group as one client share.); each node lights up when the packet arrives.

**Narration and caption.** The server answers with ServerHello and its own key share. Now both sides compute the same handshake keys. Neither side sends the keys.

**Sources.** rfc-9846-tls13

## 4. The encrypted server flight (29.0–41.0 s)

**On screen.** Nodes Browser, Server. A packet moves server→browser (First encrypted message: chosen ALPN protocol.), server→browser (The chain, server certificate first.), server→browser (Signature over the transcript.), server→browser (MAC over the whole handshake.); each node lights up when the packet arrives.

**Narration and caption.** Everything after ServerHello is encrypted. The server sends EncryptedExtensions, which carries the chosen ALPN protocol, then Certificate, CertificateVerify and Finished.

**Sources.** rfc-9846-tls13

## 5. What each message proves (41.0–52.0 s)

**On screen.** Numbered steps appear one at a time: Certificate: who the server says it is → CertificateVerify: the server holds the private key → Finished: nobody changed the handshake → Any check fails: the browser aborts.

**Narration and caption.** Certificate names the server. Anyone can copy a certificate, so CertificateVerify signs the transcript with the private key. Finished proves that nobody changed the handshake.

**Sources.** rfc-9846-tls13

## 6. Client Finished, then the request (52.0–62.0 s)

**On screen.** Nodes Browser, Server. A packet moves browser→server (The client confirms the same transcript.), browser→server (Application data under new traffic keys.); each node lights up when the packet arrives.

**Narration and caption.** The browser checks the signature and the MAC, then sends its own Finished. Its first HTTP request follows at once as encrypted application data.

**Sources.** rfc-9846-tls13

## 7. Count the trips: 1-RTT (62.0–73.0 s)

**On screen.** A timeline reveals Flight 1 out → Flight 1 back → Request out → Mismatch only.

**Narration and caption.** Count the trips. One flight goes out, one flight comes back, then the request leaves. That is one round trip. A key share mismatch adds a second trip.

**Sources.** rfc-9846-tls13

## 8. 0-RTT early data and replay (73.0–86.0 s)

**On screen.** Two columns, "1-RTT data" and "0-RTT early data", fill in pairs; verdict: Send early data only when a replay does no harm..

**Narration and caption.** A returning browser can skip the wait. With a pre-shared key from an earlier visit, it sends early data in the first flight. An attacker can replay that data, so send only safe requests.

**Sources.** rfc-9846-tls13
