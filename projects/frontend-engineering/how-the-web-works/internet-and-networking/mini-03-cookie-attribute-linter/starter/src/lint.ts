import type { LintResult } from "./types.ts";

// TODO(4): Implement `lintHeaders` in this file.
// Parse every header, report the ones the parser cannot read, report what it ignored,
// and run `lintCookie` (from ./rules.ts) on each cookie. The tests in tests/lint.test.ts
// describe the required behavior and the order of the findings.
export function lintHeaders(headers: string[]): LintResult {
  throw new Error("TODO(4): lintHeaders is not implemented yet");
}
