# How the browser picks the cookies for one request

A browser stores five cookies from shop.example.com. For each request it checks Domain (which hosts), Path (which URL paths), Secure (https only) and SameSite (Strict, Lax or None against same-site and cross-site requests). HttpOnly hides a cookie from page scripts but the cookie is still sent. The __Secure- and __Host- name prefixes force safe attributes.

**00:00 Which cookies go with this request?.** The browser stores cookies. Before each request, it checks every stored cookie and sends only the cookies that pass.

**00:07 Five cookies from shop.example.com.** Here are five cookies from shop.example.com. Each line shows the attributes that the Set-Cookie header gave the cookie.

**00:16 Domain and Path pick the URL.** Without Domain, a cookie goes only to the host that set it. With Domain, subdomains get it too. Path=/account matches /account and its subpaths.

**00:26 Secure and HttpOnly do different jobs.** Secure sends the cookie only over https. HttpOnly hides the cookie from page scripts, but their requests still carry it.

**00:36 SameSite looks at where the request starts.** A site is the scheme plus the registrable domain. Strict stays same-site. Lax also allows cross-site top-level GET navigations. None allows every request and needs Secure.

**00:48 A link from another site.** A link on news.other.org opens shop.example.com. The Strict cart cookie stays home. Lax and None cookies go with the GET navigation.

**00:59 A cross-site form POST.** Now a form on other.org sends a POST. POST is not a safe method, so Lax cookies stay home. Only the None cookie goes.

**01:09 Name prefixes force safe attributes.** The browser rejects a __Secure- cookie without Secure. A __Host- cookie also needs Path=/ and no Domain, so only its own host gets it.

Sources:

- HTTP (MDN Web Docs documentation set) — https://developer.mozilla.org/en-US/docs/Web/HTTP
- URL Standard (WHATWG Living Standard) — https://url.spec.whatwg.org/
- nodejs/undici: HTTP/1.1 client for Node.js (fetch, cache interceptor, cookies) — https://github.com/nodejs/undici
