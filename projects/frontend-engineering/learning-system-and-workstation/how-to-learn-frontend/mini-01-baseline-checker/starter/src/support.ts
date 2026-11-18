import type { BrowserSupport, Compat, SupportStatement } from "./types.js";

// TODO(2): Turn one raw `version_added` value into a BrowserSupport.
//   1. false or "preview" -> { kind: "no" }.
//   2. A string -> { kind: "yes", version, atMost }. A leading "≤" means atMost is true
//      and the version is the text after it ("≤37" -> "37").
//   3. Anything else (true, null, undefined) -> { kind: "unknown" }.
export function parseVersion(value: string | boolean | null | undefined): BrowserSupport {
  throw new Error("TODO(2): parseVersion is not implemented yet");
}

// TODO(3): Read one browser's support for a feature.
//   1. No entry for the browser -> { kind: "no" }.
//   2. Wrap a single statement in an array so you always loop over an array.
//   3. Keep only "plain" statements: no `flags`, no `prefix`, no `alternative_name`.
//   4. Take the first plain statement (BCD lists the newest first). With none, or with a
//      `version_removed`, return { kind: "no" }.
//   5. Otherwise return parseVersion(statement.version_added).
export function supportFor(compat: Compat, browser: string): BrowserSupport {
  throw new Error("TODO(3): supportFor is not implemented yet");
}
