import { problem, unknown } from "../finding.ts";
import { headerValues } from "../headers.ts";
import type { Check, CheckContext } from "../ports.ts";
import { SetCookie } from "../setCookie.ts";
import type { Finding, Policy, Severity } from "../types.ts";

interface CookieRule {
  id: string;
  severity: Severity;
  // Returns a message when the cookie breaks the rule, or null when it is fine.
  test(cookie: SetCookie, policy: Policy): string | null;
}

const DOMAIN_PATTERN = /^\.?[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

// The rules are data, so a new rule is one more row (see ADR 0003).
export const COOKIE_RULES: CookieRule[] = [
  { id: "cookie.no-secure", severity: "error", test: (c) => (c.has("secure") ? null : "Missing Secure. The cookie may travel over plain HTTP.") },
  {
    id: "cookie.no-httponly",
    severity: "warning",
    test: (c, p) => (c.has("httponly") || p.cookies.allowNoHttpOnly.includes(c.name) ? null : "Missing HttpOnly. Scripts can read the cookie."),
  },
  { id: "cookie.no-samesite", severity: "warning", test: (c) => (c.has("samesite") ? null : "Missing SameSite. Browsers apply their default.") },
  {
    id: "cookie.samesite-none-insecure",
    severity: "error",
    test: (c) => (c.sameSite === "none" && !c.has("secure") ? "SameSite=None needs Secure." : null),
  },
  {
    id: "cookie.host-prefix",
    severity: "error",
    test: (c) => {
      if (!c.name.startsWith("__Host-")) return null;
      const broken = [!c.has("secure") && "Secure", c.attributes.get("path") !== "/" && "Path=/", c.has("domain") && "no Domain"].filter(Boolean);
      return broken.length ? `__Host- cookie must have ${broken.join(", ")}.` : null;
    },
  },
  { id: "cookie.secure-prefix", severity: "error", test: (c) => (c.name.startsWith("__Secure-") && !c.has("secure") ? "__Secure- cookie needs Secure." : null) },
  { id: "cookie.too-large", severity: "error", test: (c) => (c.sizeBytes > 4096 ? `Name and value use ${c.sizeBytes} bytes; clients drop cookies over 4096.` : null) },
  {
    id: "cookie.bad-domain",
    severity: "error",
    test: (c) => {
      const domain = c.attributes.get("domain");
      return domain !== undefined && (domain === null || !DOMAIN_PATTERN.test(domain)) ? `Domain "${domain ?? ""}" is not a valid host name.` : null;
    },
  },
];

export class CookieCheck implements Check {
  readonly name = "cookies";

  run({ site, policy }: CheckContext): Finding[] {
    const findings: Finding[] = [];
    for (const entry of site.entries) {
      for (const header of headerValues(entry, "set-cookie")) {
        const cookie = SetCookie.parse(header);
        const subject = cookie.name === "" ? entry.url : `${cookie.name} (${entry.url})`;
        // A parser issue is a finding: the browser would drop or ignore that part silently.
        for (const issue of cookie.issues) findings.push(unknown(this.name, "cookie.unreadable", subject, `${issue}.`));
        if (cookie.name === "") continue;
        for (const rule of COOKIE_RULES) {
          const message = rule.test(cookie, policy);
          if (message !== null) findings.push(problem(this.name, rule.id, rule.severity, subject, message));
        }
      }
    }
    return findings;
  }
}
