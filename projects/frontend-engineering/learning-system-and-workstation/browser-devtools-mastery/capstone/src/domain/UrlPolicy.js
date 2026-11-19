import { InvalidUrlError } from "./errors.js";

// Decides which URLs the service may open. A service that loads any URL is a proxy for
// attackers, so the default allows only public http(s) hosts.
export class UrlPolicy {
  constructor({ allowPrivateHosts = false } = {}) {
    this.allowPrivateHosts = allowPrivateHosts;
  }

  // Returns the normalized URL or throws InvalidUrlError.
  check(text) {
    let url;
    try {
      url = new URL(String(text ?? "").trim());
    } catch {
      throw new InvalidUrlError("Enter a full URL such as https://example.com");
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new InvalidUrlError("Only http and https URLs are allowed");
    }
    if (!this.allowPrivateHosts && this.#isPrivate(url.hostname)) {
      throw new InvalidUrlError("Private and local hosts are blocked (set ALLOW_PRIVATE_HOSTS=true to allow them)");
    }
    return url.href;
  }

  // Checks the host name text only. It does not resolve DNS, so it is a first line of defence.
  #isPrivate(host) {
    const h = host.replace(/^\[|\]$/g, "").toLowerCase();
    if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) return true;
    if (h.includes(":")) return h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80");
    const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (!m) return false;
    const [a, b] = [Number(m[1]), Number(m[2])];
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
}
