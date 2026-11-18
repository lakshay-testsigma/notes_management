# How TLS 1.3 sets up HTTPS in one round trip

The browser sends ClientHello with a key share, the server name (SNI) and its application protocols (ALPN). The server replies with ServerHello and its key share, so both sides derive the same handshake keys. Everything after that is encrypted: EncryptedExtensions, Certificate, CertificateVerify and Finished. The browser checks the signature and the MAC, sends its own Finished, and sends its first HTTP request. That is one round trip. A returning browser with a pre-shared key can send early data in the first flight, but that data has no forward secrecy guarantee and can be replayed between connections.

**00:00 One round trip to a secure channel.** Before the first HTTPS request, the browser and the server must agree on secret keys. TLS 1.3 does this in one round trip.

**00:09 ClientHello: key share, SNI, ALPN.** The browser sends ClientHello. It carries a key share, the server name, called SNI, and the protocols it speaks, called ALPN.

**00:19 ServerHello: both sides now share keys.** The server answers with ServerHello and its own key share. Now both sides compute the same handshake keys. Neither side sends the keys.

**00:29 The encrypted server flight.** Everything after ServerHello is encrypted. The server sends EncryptedExtensions, which carries the chosen ALPN protocol, then Certificate, CertificateVerify and Finished.

**00:41 What each message proves.** Certificate names the server. Anyone can copy a certificate, so CertificateVerify signs the transcript with the private key. Finished proves that nobody changed the handshake.

**00:52 Client Finished, then the request.** The browser checks the signature and the MAC, then sends its own Finished. Its first HTTP request follows at once as encrypted application data.

**01:02 Count the trips: 1-RTT.** Count the trips. One flight goes out, one flight comes back, then the request leaves. That is one round trip. A key share mismatch adds a second trip.

**01:13 0-RTT early data and replay.** A returning browser can skip the wait. With a pre-shared key from an earlier visit, it sends early data in the first flight. An attacker can replay that data, so send only safe requests.

Sources:

- RFC 9846: The Transport Layer Security (TLS) Protocol Version 1.3 — https://www.rfc-editor.org/rfc/rfc9846
