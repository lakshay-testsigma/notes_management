import type { ParsedCookie } from "./types.ts";

// TODO(1): Implement the Set-Cookie parser in this file.
// The tests in tests/parse.test.ts describe the required behavior.
// Keep the name `parseSetCookie` and its signature, because the tests import it.
// It must be lenient: return null for a header it cannot read, and never throw.
export function parseSetCookie(header: string): ParsedCookie | null {
  throw new Error("TODO(1): parseSetCookie is not implemented yet");
}
