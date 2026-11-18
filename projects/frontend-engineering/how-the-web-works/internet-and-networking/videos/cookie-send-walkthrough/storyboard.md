# Storyboard: How the browser picks the cookies for one request

**Purpose.** Apply the Domain, Path, Secure and SameSite checks to decide which stored cookies one request carries.

**Why a video.** A cookie travels only when every check passes, so the learner follows one cookie jar through the checks for different requests.

**Length.** 80.0 s, 8 scenes.

## 1. Which cookies go with this request? (0.0–7.0 s)

**On screen.** Title card with "Domain, Path, Secure, SameSite".

**Narration and caption.** The browser stores cookies. Before each request, it checks every stored cookie and sends only the cookies that pass.

**Sources.** mdn-http-docs

## 2. Five cookies from shop.example.com (7.0–16.0 s)

**On screen.** Numbered steps appear one at a time: __Host-sid: Secure, HttpOnly, Path=/, Lax → cart: Domain=example.com, Secure, Strict → prefs: Path=/account, Lax → widget: Domain=example.com, Secure, None → theme: no Secure, Lax.

**Narration and caption.** Here are five cookies from shop.example.com. Each line shows the attributes that the Set-Cookie header gave the cookie.

**Sources.** mdn-http-docs

## 3. Domain and Path pick the URL (16.0–26.0 s)

**On screen.** Two columns, "Domain" and "Path", fill in pairs; verdict: Path is not a security boundary.

**Narration and caption.** Without Domain, a cookie goes only to the host that set it. With Domain, subdomains get it too. Path=/account matches /account and its subpaths.

**Sources.** mdn-http-docs

## 4. Secure and HttpOnly do different jobs (26.0–36.0 s)

**On screen.** Two columns, "Secure" and "HttpOnly", fill in pairs; verdict: HttpOnly controls JavaScript, not the request.

**Narration and caption.** Secure sends the cookie only over https. HttpOnly hides the cookie from page scripts, but their requests still carry it.

**Sources.** mdn-http-docs

## 5. SameSite looks at where the request starts (36.0–48.0 s)

**On screen.** Numbered steps appear one at a time: Same site: shop.example.com and blog.example.com → Strict: same-site requests only → Lax: plus cross-site top-level navigation with GET → None: every request, Secure required.

**Narration and caption.** A site is the scheme plus the registrable domain. Strict stays same-site. Lax also allows cross-site top-level GET navigations. None allows every request and needs Secure.

**Sources.** mdn-http-docs, whatwg-url-standard

## 6. A link from another site (48.0–59.0 s)

**On screen.** Nodes news.other.org, Browser, shop.example.com. A packet moves news→browser (Cross-site top-level navigation), browser→shop (Sends __Host-sid, widget, theme; cart and prefs stay); each node lights up when the packet arrives.

**Narration and caption.** A link on news.other.org opens shop.example.com. The Strict cart cookie stays home. Lax and None cookies go with the GET navigation.

**Sources.** mdn-http-docs

## 7. A cross-site form POST (59.0–69.0 s)

**On screen.** Nodes news.other.org, Browser, shop.example.com. A packet moves news→browser (Cross-site navigation with POST), browser→shop (Sends only widget (SameSite=None)); each node lights up when the packet arrives.

**Narration and caption.** Now a form on other.org sends a POST. POST is not a safe method, so Lax cookies stay home. Only the None cookie goes.

**Sources.** mdn-http-docs

## 8. Name prefixes force safe attributes (69.0–80.0 s)

**On screen.** Two columns, "__Secure-" and "__Host-", fill in pairs; verdict: __Host- treats the origin as the boundary.

**Narration and caption.** The browser rejects a __Secure- cookie without Secure. A __Host- cookie also needs Path=/ and no Domain, so only its own host gets it.

**Sources.** mdn-http-docs, nodejs-undici-repo
