import type { Finding, ParsedCookie } from "./types.ts";

// TODO(2): Implement the attribute rules (Secure, HttpOnly, SameSite) in `checkAttributes`.
// The tests in tests/rules.test.ts describe the required behavior.
export function checkAttributes(cookie: ParsedCookie): Finding[] {
  throw new Error("TODO(2): checkAttributes is not implemented yet");
}

// TODO(3): Implement the __Secure- and __Host- prefix rules in `checkPrefixes`.
// The tests in tests/rules.test.ts describe the required behavior.
export function checkPrefixes(cookie: ParsedCookie): Finding[] {
  throw new Error("TODO(3): checkPrefixes is not implemented yet");
}

export function lintCookie(cookie: ParsedCookie): Finding[] {
  return [...checkAttributes(cookie), ...checkPrefixes(cookie)];
}
