import type { Finding, ParsedCookie, Severity } from "./types.ts";

// Names that usually hold a login. A script that can read one of these can steal the session.
const SENSITIVE_NAME = /sess|sid|auth|token|jwt|login/i;

function finding(cookie: ParsedCookie, rule: string, severity: Severity, message: string): Finding {
  return { rule, severity, cookie: cookie.name, message };
}

export function checkAttributes(cookie: ParsedCookie): Finding[] {
  const { secure, httpOnly, sameSite } = cookie.attributes;
  const found: Finding[] = [];

  if (!secure) {
    found.push(finding(cookie, "missing-secure", "error", "No Secure attribute: the cookie also travels over plain HTTP."));
  }
  if (!httpOnly) {
    // A login cookie is an error; other cookies only get a warning, because scripts may need them.
    const severity: Severity = SENSITIVE_NAME.test(cookie.name) ? "error" : "warning";
    found.push(finding(cookie, "missing-httponly", severity, "No HttpOnly attribute: page scripts can read the cookie."));
  }
  if (!sameSite) {
    found.push(finding(cookie, "missing-samesite", "warning", "No SameSite attribute: set it on purpose instead of relying on the browser default."));
  } else if (sameSite === "None" && !secure) {
    found.push(finding(cookie, "samesite-none-needs-secure", "error", "SameSite=None without Secure: browsers reject the cookie."));
  }
  return found;
}

export function checkPrefixes(cookie: ParsedCookie): Finding[] {
  const name = cookie.name.toLowerCase();
  const { secure, path, domain } = cookie.attributes;
  const found: Finding[] = [];

  if (name.startsWith("__secure-") && !secure) {
    found.push(finding(cookie, "secure-prefix-needs-secure", "error", "A __Secure- cookie must have Secure; browsers drop it otherwise."));
  }
  if (name.startsWith("__host-")) {
    if (!secure) {
      found.push(finding(cookie, "host-prefix-needs-secure", "error", "A __Host- cookie must have Secure; browsers drop it otherwise."));
    }
    if (path !== "/") {
      found.push(finding(cookie, "host-prefix-needs-root-path", "error", "A __Host- cookie must have Path=/."));
    }
    if (domain !== undefined) {
      found.push(finding(cookie, "host-prefix-forbids-domain", "error", "A __Host- cookie must not have a Domain attribute."));
    }
  }
  return found;
}

export function lintCookie(cookie: ParsedCookie): Finding[] {
  return [...checkAttributes(cookie), ...checkPrefixes(cookie)];
}
