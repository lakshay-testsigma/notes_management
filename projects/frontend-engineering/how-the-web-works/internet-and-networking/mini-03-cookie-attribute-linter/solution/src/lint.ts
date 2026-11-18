import { parseSetCookie } from "./parse.ts";
import { lintCookie } from "./rules.ts";
import type { Finding, LintResult, ParsedCookie } from "./types.ts";

// The reader is lenient, the rules are strict: report what the parser dropped instead of hiding it.
export function lintHeaders(headers: string[]): LintResult {
  const cookies: ParsedCookie[] = [];
  const findings: Finding[] = [];

  for (const header of headers) {
    const cookie = parseSetCookie(header);
    if (cookie === null) {
      findings.push({
        rule: "unreadable-header",
        severity: "error",
        cookie: "(unreadable)",
        message: `The parser could not read this header: ${header.slice(0, 60)}`,
      });
      continue;
    }
    cookies.push(cookie);
    for (const piece of cookie.ignored) {
      findings.push({
        rule: "ignored-attribute",
        severity: "warning",
        cookie: cookie.name,
        message: `Browsers ignore "${piece}".`,
      });
    }
    findings.push(...lintCookie(cookie));
  }
  return { cookies, findings };
}
